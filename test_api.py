#!/usr/bin/env python3
"""
Test script for Sentiment Analysis API
Demonstrates how to use both Flask and FastAPI endpoints
"""

import requests
import json
import time
from typing import List, Dict

class SentimentAPITester:
    def __init__(self, base_url: str = "http://localhost:5000"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def test_health_check(self) -> Dict:
        """Test the health check endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def test_single_prediction(self, text: str) -> Dict:
        """Test single text prediction"""
        try:
            payload = {"text": text}
            response = self.session.post(
                f"{self.base_url}/predict",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def test_batch_prediction(self, texts: List[str]) -> Dict:
        """Test batch text prediction"""
        try:
            payload = {"texts": texts}
            response = self.session.post(
                f"{self.base_url}/batch_predict",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def test_model_info(self) -> Dict:
        """Test model information endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/model_info")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e)}

def main():
    """Main testing function"""
    
    # Sample texts for testing
    test_texts = [
        "This movie was absolutely fantastic! The acting was superb and the story was captivating.",
        "I wasted my time watching this film. The story was boring and predictable.",
        "The movie was okay, nothing special but not terrible either.",
        "Outstanding performance by all actors. This is definitely one of the best movies I've ever seen.",
        "Terrible film with no redeeming qualities. The characters were poorly developed.",
        "Amazing cinematography and excellent character development. Truly a work of art.",
        "This movie is a complete failure. The plot holes were enormous.",
        "Perfect blend of drama and emotion. This movie will stay with you long after watching."
    ]
    
    print("🎬 Sentiment Analysis API Tester")
    print("=" * 50)
    
    # Test Flask API
    print("\n🔥 Testing Flask API (localhost:5000)")
    print("-" * 30)
    
    flask_tester = SentimentAPITester("http://localhost:5000")
    
    # Health check
    print("1. Health Check:")
    health = flask_tester.test_health_check()
    print(json.dumps(health, indent=2))
    
    # Model info
    print("\n2. Model Information:")
    model_info = flask_tester.test_model_info()
    print(json.dumps(model_info, indent=2))
    
    # Single prediction
    print("\n3. Single Prediction Test:")
    single_text = test_texts[0]
    result = flask_tester.test_single_prediction(single_text)
    print(f"Text: {single_text}")
    print(f"Result: {json.dumps(result, indent=2)}")
    
    # Batch prediction
    print("\n4. Batch Prediction Test:")
    batch_results = flask_tester.test_batch_prediction(test_texts[:4])
    print(f"Testing {len(test_texts[:4])} texts...")
    if 'results' in batch_results:
        for i, result in enumerate(batch_results['results']):
            print(f"  {i+1}. {result.get('sentiment', 'error').upper()} "
                  f"({result.get('confidence', 0):.3f}) - "
                  f"{result.get('original_text', '')[:50]}...")
    
    print("\n" + "=" * 50)
    
    # Test FastAPI
    print("\n⚡ Testing FastAPI (localhost:8000)")
    print("-" * 30)
    
    fastapi_tester = SentimentAPITester("http://localhost:8000")
    
    # Health check
    print("1. Health Check:")
    health = fastapi_tester.test_health_check()
    print(json.dumps(health, indent=2))
    
    # Single prediction
    print("\n2. Single Prediction Test:")
    single_text = test_texts[1]
    result = fastapi_tester.test_single_prediction(single_text)
    print(f"Text: {single_text}")
    print(f"Result: {json.dumps(result, indent=2)}")
    
    # Performance test
    print("\n5. Performance Test:")
    start_time = time.time()
    for i in range(5):
        result = flask_tester.test_single_prediction(test_texts[i % len(test_texts)])
    flask_time = time.time() - start_time
    
    start_time = time.time()
    for i in range(5):
        result = fastapi_tester.test_single_prediction(test_texts[i % len(test_texts)])
    fastapi_time = time.time() - start_time
    
    print(f"Flask API: {flask_time:.3f}s for 5 requests")
    print(f"FastAPI: {fastapi_time:.3f}s for 5 requests")
    
    print("\n✅ Testing completed!")
    print("\nAPI Usage Examples:")
    print("------------------")
    print("1. Flask API: curl -X POST http://localhost:5000/predict -H 'Content-Type: application/json' -d '{\"text\": \"Great movie!\"}'")
    print("2. FastAPI: curl -X POST http://localhost:8000/predict -H 'Content-Type: application/json' -d '{\"text\": \"Great movie!\"}'")
    print("3. FastAPI Docs: http://localhost:8000/docs")

if __name__ == "__main__":
    main()
