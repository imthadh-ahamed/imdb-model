#!/usr/bin/env python3
"""
Simple Flask API for Sentiment Analysis
A basic RESTful API that serves sentiment analysis without pre-trained models
"""

from flask import Flask, request, jsonify
import re
import string
from datetime import datetime
import logging
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Simple sentiment analysis function (for demo purposes)
def simple_sentiment_analysis(text):
    """
    Simple rule-based sentiment analysis
    """
    # Clean the text
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    
    # Define positive and negative words
    positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 
                     'awesome', 'brilliant', 'outstanding', 'superb', 'perfect', 'love',
                     'like', 'enjoy', 'happy', 'pleased', 'satisfied', 'impressive',
                     'remarkable', 'spectacular', 'marvelous', 'terrific', 'incredible']
    
    negative_words = ['bad', 'terrible', 'awful', 'horrible', 'disgusting', 'hate',
                     'dislike', 'boring', 'dull', 'disappointing', 'poor', 'worst',
                     'pathetic', 'useless', 'annoying', 'frustrating', 'sad', 'angry',
                     'upset', 'depressing', 'mediocre', 'uninspiring', 'inadequate']
    
    # Count positive and negative words
    words = text.split()
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
        'negative_words_found': negative_count
    }

@app.route('/', methods=['GET'])
def home():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Sentiment Analysis API is running',
        'model_info': {
            'model_name': 'Simple Rule-Based Model',
            'accuracy': 'Demo Mode',
            'f1_score': 'Demo Mode'
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
        "sentiment": "positive",
        "confidence": 0.85,
        "text": "This movie was great!",
        "timestamp": "2025-07-06T10:30:00"
    }
    """
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'error': 'Missing required field: text',
                'status': 'error'
            }), 400
        
        text = data['text']
        
        if not text or not text.strip():
            return jsonify({
                'error': 'Text cannot be empty',
                'status': 'error'
            }), 400
        
        # Analyze sentiment
        result = simple_sentiment_analysis(text)
        
        return jsonify({
            'sentiment': result['sentiment'],
            'confidence': result['confidence'],
            'text': text,
            'details': {
                'positive_words_found': result['positive_words_found'],
                'negative_words_found': result['negative_words_found']
            },
            'timestamp': datetime.now().isoformat(),
            'status': 'success'
        })
        
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    """
    Predict sentiment for multiple texts
    
    Expected JSON format:
    {
        "texts": ["This movie was great!", "This movie was bad!"]
    }
    
    Returns:
    {
        "results": [
            {
                "text": "This movie was great!",
                "sentiment": "positive",
                "confidence": 0.85
            },
            {
                "text": "This movie was bad!",
                "sentiment": "negative",
                "confidence": 0.75
            }
        ],
        "summary": {
            "total_texts": 2,
            "positive_count": 1,
            "negative_count": 1
        }
    }
    """
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data or 'texts' not in data:
            return jsonify({
                'error': 'Missing required field: texts',
                'status': 'error'
            }), 400
        
        texts = data['texts']
        
        if not isinstance(texts, list):
            return jsonify({
                'error': 'texts must be an array',
                'status': 'error'
            }), 400
        
        if len(texts) == 0:
            return jsonify({
                'error': 'texts array cannot be empty',
                'status': 'error'
            }), 400
        
        # Process each text
        results = []
        positive_count = 0
        negative_count = 0
        neutral_count = 0
        
        for text in texts:
            if not text or not text.strip():
                continue
                
            result = simple_sentiment_analysis(text)
            
            results.append({
                'text': text,
                'sentiment': result['sentiment'],
                'confidence': result['confidence'],
                'details': {
                    'positive_words_found': result['positive_words_found'],
                    'negative_words_found': result['negative_words_found']
                }
            })
            
            if result['sentiment'] == 'positive':
                positive_count += 1
            elif result['sentiment'] == 'negative':
                negative_count += 1
            else:
                neutral_count += 1
        
        return jsonify({
            'results': results,
            'summary': {
                'total_texts': len(results),
                'positive_count': positive_count,
                'negative_count': negative_count,
                'neutral_count': neutral_count
            },
            'timestamp': datetime.now().isoformat(),
            'status': 'success'
        })
        
    except Exception as e:
        logger.error(f"Error in batch prediction: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Detailed health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Sentiment Analysis API',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat(),
        'endpoints': {
            'GET /': 'Home page',
            'POST /predict': 'Single text prediction',
            'POST /predict/batch': 'Batch text prediction',
            'GET /health': 'Health check'
        }
    })

if __name__ == '__main__':
    logger.info("Starting Sentiment Analysis API...")
    logger.info("Model: Simple Rule-Based (Demo Mode)")
    logger.info("Server starting on http://localhost:5000")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
