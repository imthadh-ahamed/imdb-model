#!/usr/bin/env python3
"""
Simple FastAPI for Sentiment Analysis
A RESTful API that serves sentiment analysis without pre-trained models
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import re
import string
from datetime import datetime
import logging
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Sentiment Analysis API",
    description="A simple sentiment analysis API using rule-based approach",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response validation
class TextRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="Text to analyze")

class BatchTextRequest(BaseModel):
    texts: List[str] = Field(..., min_items=1, max_items=100, description="List of texts to analyze")

class SentimentResponse(BaseModel):
    sentiment: str = Field(..., description="Predicted sentiment (positive/negative/neutral)")
    confidence: float = Field(..., description="Confidence score (0.0 to 1.0)")
    text: str = Field(..., description="Original input text")
    details: dict = Field(..., description="Additional analysis details")
    timestamp: str = Field(..., description="Prediction timestamp")
    status: str = Field(..., description="Response status")

class BatchSentimentResponse(BaseModel):
    results: List[dict] = Field(..., description="List of prediction results")
    summary: dict = Field(..., description="Summary of batch analysis")
    timestamp: str = Field(..., description="Batch prediction timestamp")
    status: str = Field(..., description="Response status")

class HealthResponse(BaseModel):
    status: str
    message: str
    model_info: dict
    timestamp: str

# Simple sentiment analysis function (for demo purposes)
def simple_sentiment_analysis(text: str) -> dict:
    """
    Simple rule-based sentiment analysis
    """
    # Clean the text
    text_lower = text.lower()
    text_clean = re.sub(r'[^\w\s]', '', text_lower)
    
    # Define positive and negative words
    positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 
                     'awesome', 'brilliant', 'outstanding', 'superb', 'perfect', 'love',
                     'like', 'enjoy', 'happy', 'pleased', 'satisfied', 'impressive',
                     'remarkable', 'spectacular', 'marvelous', 'terrific', 'incredible',
                     'best', 'favorite', 'recommend', 'enjoyable', 'entertaining']
    
    negative_words = ['bad', 'terrible', 'awful', 'horrible', 'disgusting', 'hate',
                     'dislike', 'boring', 'dull', 'disappointing', 'poor', 'worst',
                     'pathetic', 'useless', 'annoying', 'frustrating', 'sad', 'angry',
                     'upset', 'depressing', 'mediocre', 'uninspiring', 'inadequate',
                     'waste', 'stupid', 'ridiculous', 'pointless', 'confusing']
    
    # Count positive and negative words
    words = text_clean.split()
    positive_count = sum(1 for word in words if word in positive_words)
    negative_count = sum(1 for word in words if word in negative_words)
    
    # Determine sentiment
    if positive_count > negative_count:
        sentiment = 'positive'
        confidence = min(0.6 + (positive_count - negative_count) * 0.1, 0.95)
    elif negative_count > positive_count:
        sentiment = 'negative'
        confidence = min(0.6 + (negative_count - positive_count) * 0.1, 0.95)
    else:
        sentiment = 'neutral'
        confidence = 0.5
    
    return {
        'sentiment': sentiment,
        'confidence': confidence,
        'positive_words_found': positive_count,
        'negative_words_found': negative_count,
        'total_words': len(words)
    }

@app.get("/", response_model=HealthResponse)
async def home():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="Sentiment Analysis FastAPI is running",
        model_info={
            "model_name": "Simple Rule-Based Model",
            "accuracy": "Demo Mode",
            "f1_score": "Demo Mode",
            "type": "FastAPI"
        },
        timestamp=datetime.now().isoformat()
    )

@app.post("/predict", response_model=SentimentResponse)
async def predict(request: TextRequest):
    """
    Predict sentiment for given text
    
    Args:
        request: TextRequest with text field
    
    Returns:
        SentimentResponse with prediction results
    """
    try:
        text = request.text.strip()
        
        if not text:
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Analyze sentiment
        result = simple_sentiment_analysis(text)
        
        return SentimentResponse(
            sentiment=result['sentiment'],
            confidence=result['confidence'],
            text=text,
            details={
                'positive_words_found': result['positive_words_found'],
                'negative_words_found': result['negative_words_found'],
                'total_words': result['total_words']
            },
            timestamp=datetime.now().isoformat(),
            status="success"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/predict/batch", response_model=BatchSentimentResponse)
async def predict_batch(request: BatchTextRequest):
    """
    Predict sentiment for multiple texts
    
    Args:
        request: BatchTextRequest with texts field
    
    Returns:
        BatchSentimentResponse with batch prediction results
    """
    try:
        texts = [text.strip() for text in request.texts if text.strip()]
        
        if not texts:
            raise HTTPException(status_code=400, detail="No valid texts provided")
        
        # Process each text
        results = []
        positive_count = 0
        negative_count = 0
        neutral_count = 0
        
        for text in texts:
            result = simple_sentiment_analysis(text)
            
            results.append({
                'text': text,
                'sentiment': result['sentiment'],
                'confidence': result['confidence'],
                'details': {
                    'positive_words_found': result['positive_words_found'],
                    'negative_words_found': result['negative_words_found'],
                    'total_words': result['total_words']
                }
            })
            
            if result['sentiment'] == 'positive':
                positive_count += 1
            elif result['sentiment'] == 'negative':
                negative_count += 1
            else:
                neutral_count += 1
        
        return BatchSentimentResponse(
            results=results,
            summary={
                'total_texts': len(results),
                'positive_count': positive_count,
                'negative_count': negative_count,
                'neutral_count': neutral_count,
                'average_confidence': sum(r['confidence'] for r in results) / len(results)
            },
            timestamp=datetime.now().isoformat(),
            status="success"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in batch prediction: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/health")
async def health_check():
    """Detailed health check endpoint"""
    return {
        "status": "healthy",
        "service": "Sentiment Analysis FastAPI",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "GET /": "Home page",
            "POST /predict": "Single text prediction",
            "POST /predict/batch": "Batch text prediction",
            "GET /health": "Health check",
            "GET /docs": "Interactive API documentation",
            "GET /redoc": "Alternative API documentation"
        }
    }

@app.get("/docs-info")
async def docs_info():
    """Information about API documentation"""
    return {
        "message": "FastAPI provides automatic interactive API documentation",
        "swagger_ui": "/docs",
        "redoc": "/redoc",
        "openapi_json": "/openapi.json"
    }

if __name__ == "__main__":
    logger.info("Starting Sentiment Analysis FastAPI...")
    logger.info("Model: Simple Rule-Based (Demo Mode)")
    logger.info("Server starting on http://localhost:8000")
    logger.info("Interactive docs available at http://localhost:8000/docs")
    
    uvicorn.run(
        "simple_fastapi_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
