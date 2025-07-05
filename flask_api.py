#!/usr/bin/env python3
"""
Flask API for Sentiment Analysis
A RESTful API that serves the trained IMDB sentiment analysis model
"""

from flask import Flask, request, jsonify
import joblib
import os
import logging
from datetime import datetime
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

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

def predict_sentiment(text):
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
            'processed_text': processed_text
        }
        
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        raise

@app.route('/', methods=['GET'])
def home():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Sentiment Analysis API is running',
        'model_info': {
            'model_name': metadata['model_name'] if metadata else 'Unknown',
            'accuracy': metadata['accuracy'] if metadata else 'Unknown',
            'f1_score': metadata['f1_score'] if metadata else 'Unknown'
        },
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict sentiment for given text
    
    Expected JSON format:
    {
        "text": "This movie was great!"
    }
    
    Returns:
    {
        "sentiment": "positive|negative",
        "confidence": 0.95,
        "processed_text": "processed version of text",
        "timestamp": "2024-01-01T12:00:00"
    }
    """
    try:
        # Check if model is loaded
        if model is None:
            return jsonify({
                'error': 'Model not loaded',
                'message': 'Please restart the server'
            }), 500
        
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No JSON data provided',
                'message': 'Please provide JSON data with "text" field'
            }), 400
        
        if 'text' not in data:
            return jsonify({
                'error': 'Missing text field',
                'message': 'Please provide "text" field in JSON data'
            }), 400
        
        text = data['text']
        
        if not text or not isinstance(text, str):
            return jsonify({
                'error': 'Invalid text',
                'message': 'Text must be a non-empty string'
            }), 400
        
        # Make prediction
        result = predict_sentiment(text)
        
        # Add metadata
        result['timestamp'] = datetime.now().isoformat()
        result['original_text'] = text
        
        logger.info(f"Prediction made: {result['sentiment']} (confidence: {result['confidence']:.4f})")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in /predict endpoint: {str(e)}")
        logger.error(traceback.format_exc())
        
        return jsonify({
            'error': 'Internal server error',
            'message': 'An error occurred while processing your request'
        }), 500

@app.route('/batch_predict', methods=['POST'])
def batch_predict():
    """
    Predict sentiment for multiple texts
    
    Expected JSON format:
    {
        "texts": ["Great movie!", "Terrible film", "Average story"]
    }
    """
    try:
        # Check if model is loaded
        if model is None:
            return jsonify({
                'error': 'Model not loaded',
                'message': 'Please restart the server'
            }), 500
        
        # Get request data
        data = request.get_json()
        
        if not data or 'texts' not in data:
            return jsonify({
                'error': 'Missing texts field',
                'message': 'Please provide "texts" field with list of strings'
            }), 400
        
        texts = data['texts']
        
        if not isinstance(texts, list) or not texts:
            return jsonify({
                'error': 'Invalid texts format',
                'message': 'Texts must be a non-empty list of strings'
            }), 400
        
        # Make predictions for all texts
        results = []
        for i, text in enumerate(texts):
            if not text or not isinstance(text, str):
                results.append({
                    'index': i,
                    'error': 'Invalid text',
                    'original_text': text
                })
                continue
            
            try:
                result = predict_sentiment(text)
                result['index'] = i
                result['original_text'] = text
                results.append(result)
            except Exception as e:
                results.append({
                    'index': i,
                    'error': str(e),
                    'original_text': text
                })
        
        return jsonify({
            'results': results,
            'total_predictions': len(results),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in /batch_predict endpoint: {str(e)}")
        
        return jsonify({
            'error': 'Internal server error',
            'message': 'An error occurred while processing your request'
        }), 500

@app.route('/model_info', methods=['GET'])
def model_info():
    """Get information about the loaded model"""
    if metadata is None:
        return jsonify({
            'error': 'Model not loaded'
        }), 500
    
    return jsonify({
        'model_metadata': metadata,
        'timestamp': datetime.now().isoformat()
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Not found',
        'message': 'The requested endpoint does not exist'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred'
    }), 500

if __name__ == '__main__':
    # Load model components
    if not load_model_components():
        logger.error("Failed to load model components. Exiting.")
        exit(1)
    
    # Run the Flask app
    logger.info("Starting Flask server...")
    app.run(host='0.0.0.0', port=5000, debug=True)
