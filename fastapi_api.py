#!/usr/bin/env python3
"""
FastAPI for Sentiment Analysis
A RESTful API that serves the trained IMDB sentiment analysis model
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional
import joblib
import os
import logging
from datetime import datetime
import traceback
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic models for request/response validation
class TextRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="Text to analyze")

class BatchTextRequest(BaseModel):
    texts: List[str] = Field(..., min_items=1, max_items=100, description="List of texts to analyze")

class SentimentResponse(BaseModel):
    sentiment: str = Field(..., description="Predicted sentiment (positive/negative)")
    confidence: float = Field(..., description="Confidence score (0.0 to 1.0)")
    processed_text: str = Field(..., description="Preprocessed text")
    original_text: str = Field(..., description="Original input text")
    timestamp: str = Field(..., description="Prediction timestamp")

class BatchSentimentResponse(BaseModel):
    results: List[dict] = Field(..., description="List of prediction results")
    total_predictions: int = Field(..., description="Total number of predictions made")
    timestamp: str = Field(..., description="Batch prediction timestamp")

class ModelInfo(BaseModel):
    model_name: str
    accuracy: float
    f1_score: float
    precision: float
    recall: float
    auc: float
    training_time: float
    feature_count: int
    training_samples: int

class HealthResponse(BaseModel):
    status: str
    message: str
    model_info: dict
    timestamp: str

# FastAPI app
app = FastAPI(
    title="Sentiment Analysis API",
    description="A RESTful API for movie review sentiment analysis using machine learning",
    version="1.0.0",
    contact={
        "name": "Sentiment Analysis Team",
        "email": "contact@sentimentapi.com"
    }
)

# Global variables to store loaded model components
model = None
vectorizer = None
preprocessing_functions = None
metadata = None

def load_model_components():
    """Load all model components at startup"""
    global model, vectorizer, preprocessing_functions, metadata
    
    try:
        models_dir = "models"
        
        # Load model components
        model = joblib.load(os.path.join(models_dir, 'sentiment_model.pkl'))
        vectorizer = joblib.load(os.path.join(models_dir, 'tfidf_vectorizer.pkl'))
        preprocessing_functions = joblib.load(os.path.join(models_dir, 'preprocessing_functions.pkl'))
        metadata = joblib.load(os.path.join(models_dir, 'model_metadata.pkl'))
        
        logger.info("Model components loaded successfully")
        logger.info(f"Model: {metadata['model_name']}")
        logger.info(f"Accuracy: {metadata['accuracy']:.4f}")
        logger.info(f"F1-Score: {metadata['f1_score']:.4f}")
        
        return True
        
    except Exception as e:
        logger.error(f"Error loading model components: {str(e)}")
        return False

def predict_sentiment(text: str) -> dict:
    """
    Predict sentiment for a given text
    """
    try:
        # Preprocess the text
        processed_text = preprocessing_functions['preprocess_text'](text)
        
        # Vectorize the text
        text_tfidf = vectorizer.transform([processed_text])
        
        # Make prediction
        prediction = model.predict(text_tfidf)[0]
        confidence = model.predict_proba(text_tfidf)[0].max()
        
        return {
            'sentiment': 'positive' if prediction == 1 else 'negative',
            'confidence': float(confidence),
            'processed_text': processed_text,
            'original_text': text,
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        raise HTTPException(status_code=500, detail="Error making prediction")

@app.on_event("startup")
async def startup_event():
    """Load model components on startup"""
    if not load_model_components():
        logger.error("Failed to load model components")
        raise Exception("Model loading failed")

@app.get("/", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="Sentiment Analysis API is running",
        model_info={
            'model_name': metadata['model_name'] if metadata else 'Unknown',
            'accuracy': metadata['accuracy'] if metadata else 'Unknown',
            'f1_score': metadata['f1_score'] if metadata else 'Unknown'
        },
        timestamp=datetime.now().isoformat()
    )

@app.post("/predict", response_model=SentimentResponse)
async def predict(request: TextRequest):
    """
    Predict sentiment for given text
    
    - **text**: The text to analyze (required)
    
    Returns sentiment prediction with confidence score
    """
    try:
        # Check if model is loaded
        if model is None:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        # Make prediction
        result = predict_sentiment(request.text)
        
        logger.info(f"Prediction made: {result['sentiment']} (confidence: {result['confidence']:.4f})")
        
        return SentimentResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in /predict endpoint: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/batch_predict", response_model=BatchSentimentResponse)
async def batch_predict(request: BatchTextRequest):
    """
    Predict sentiment for multiple texts
    
    - **texts**: List of texts to analyze (max 100 items)
    
    Returns batch prediction results
    """
    try:
        # Check if model is loaded
        if model is None:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        # Make predictions for all texts
        results = []
        for i, text in enumerate(request.texts):
            try:
                result = predict_sentiment(text)
                result['index'] = i
                results.append(result)
            except Exception as e:
                results.append({
                    'index': i,
                    'error': str(e),
                    'original_text': text,
                    'timestamp': datetime.now().isoformat()
                })
        
        return BatchSentimentResponse(
            results=results,
            total_predictions=len(results),
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in /batch_predict endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/model_info", response_model=ModelInfo)
async def get_model_info():
    """Get information about the loaded model"""
    if metadata is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    return ModelInfo(**metadata)

@app.get("/docs")
async def get_docs():
    """Redirect to interactive API documentation"""
    return {"message": "Visit /docs for interactive API documentation"}

# Background task for logging predictions (optional)
def log_prediction(text: str, prediction: str, confidence: float):
    """Log prediction for monitoring/analytics"""
    logger.info(f"PREDICTION_LOG: {datetime.now().isoformat()} | {prediction} | {confidence:.4f} | {text[:100]}...")

if __name__ == "__main__":
    # Run the FastAPI app
    uvicorn.run(
        "fastapi_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
