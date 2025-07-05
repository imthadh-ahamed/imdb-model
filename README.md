# 🎬 NLP Sentiment Analysis with API Deployment

A complete machine learning pipeline for sentiment analysis of movie reviews with REST API deployment using Flask and FastAPI.

## 📊 Project Overview

This project implements a comprehensive NLP sentiment analysis solution that:

1. **Loads and preprocesses** the IMDB movie reviews dataset (50,000 reviews)
2. **Trains multiple ML models** for sentiment classification
3. **Evaluates and compares** model performance
4. **Deploys the best model** as REST APIs
5. **Provides containerized deployment** with Docker

## 🚀 Features

- **Complete NLP Pipeline**: Text preprocessing, tokenization, stop-word removal, stemming
- **Multiple ML Models**: Naive Bayes, Logistic Regression, SVM, Random Forest
- **Model Evaluation**: Cross-validation, ROC curves, confusion matrices
- **REST APIs**: Both Flask and FastAPI implementations
- **Batch Processing**: Handle multiple texts in a single request
- **Docker Support**: Containerized deployment with Docker Compose
- **Model Persistence**: Save/load trained models
- **API Testing**: Comprehensive test suite
- **Performance Monitoring**: Request logging and health checks

## 🏗️ Application Architecture

### System Overview

The application follows a modern full-stack architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                            │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Next.js Frontend                         │ │
│  │  • React 18 + TypeScript                                   │ │
│  │  • Tailwind CSS + Headless UI                              │ │
│  │  • Responsive Design                                       │ │
│  │  • Real-time Analysis                                      │ │
│  │  • Batch Processing UI                                     │ │
│  │  • API Documentation                                       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              │ HTTP/REST API                     │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────┐
│                              │        Backend Layer             │
│  ┌───────────────────────────▼──────────────────────────────────┐ │
│  │                    API Gateway                               │ │
│  │  ┌─────────────────┐     ┌─────────────────┐                │ │
│  │  │   Flask API     │     │   FastAPI       │                │ │
│  │  │   Port: 5000    │     │   Port: 8000    │                │ │
│  │  │   • Basic REST  │     │   • OpenAPI     │                │ │
│  │  │   • CORS        │     │   • Validation  │                │ │
│  │  │   • JSON        │     │   • Auto Docs   │                │ │
│  │  └─────────────────┘     └─────────────────┘                │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              │                                   │
│  ┌───────────────────────────▼──────────────────────────────────┐ │
│  │                   ML Processing Layer                        │ │
│  │  • Sentiment Analysis Engine                                │ │
│  │  • Text Preprocessing Pipeline                              │ │
│  │  • Rule-based Classification                                │ │
│  │  • Confidence Scoring                                       │ │
│  │  • Batch Processing                                         │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              │                                   │
│  ┌───────────────────────────▼──────────────────────────────────┐ │
│  │                     Model Layer                              │ │
│  │  ┌─────────────────┐     ┌─────────────────┐                │ │
│  │  │  Trained Models │     │  Demo Models    │                │ │
│  │  │  • Logistic Reg │     │  • Rule-based   │                │ │
│  │  │  • SVM          │     │  • Word Lists   │                │ │
│  │  │  • Naive Bayes  │     │  • Heuristics   │                │ │
│  │  │  • Random Forest│     │                 │                │ │
│  │  └─────────────────┘     └─────────────────┘                │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### Frontend (Next.js)
- **Landing Page** (`/`): Hero section with features and model performance
- **Analysis Page** (`/analyze`): Single text sentiment analysis
- **Batch Page** (`/batch`): Multiple text analysis with export functionality
- **Documentation** (`/docs`): Interactive API documentation and testing

#### Backend APIs
- **Flask API** (`localhost:5000`): Simple REST API with basic functionality
- **FastAPI** (`localhost:8000`): Advanced API with automatic documentation

### Data Flow

1. **User Input**: Text entered through frontend forms
2. **API Request**: HTTP POST to Flask/FastAPI backend
3. **Text Processing**: Cleaning, tokenization, preprocessing
4. **Sentiment Analysis**: Rule-based classification with confidence scoring
5. **Response**: JSON with sentiment, confidence, and metadata
6. **UI Update**: Real-time display of results with visualizations

### Technology Stack

#### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Headless UI, Heroicons
- **State Management**: React Hooks
- **HTTP Client**: Fetch API, Axios

#### Backend
- **Languages**: Python 3.8+
- **Web Frameworks**: Flask, FastAPI
- **ML Libraries**: scikit-learn, pandas, numpy
- **Text Processing**: NLTK, regex
- **API Features**: CORS, JSON validation, error handling

#### Development & Deployment
- **Package Management**: pip, npm
- **Containerization**: Docker, Docker Compose
- **Version Control**: Git
- **Development**: Jupyter Notebooks
- **Testing**: pytest, API test scripts

### Deployment Options

#### Development
```bash
# Backend
python simple_flask_api.py    # Port 5000
python simple_fastapi_api.py  # Port 8000

# Frontend
npm run dev                   # Port 3000
```

## 🔧 Usage

### Training the Model

1. Open `ml/imdb.ipynb` in Jupyter
2. Run all cells to:
   - Load the IMDB dataset
   - Preprocess the text data
   - Train multiple models
   - Evaluate performance
   - Save the best model

### Running the APIs

#### Flask API
```bash
python flask_api.py
```
API available at: `http://localhost:5000`

#### FastAPI
```bash
python fastapi_api.py
```
API available at: `http://localhost:8000`
Interactive docs at: `http://localhost:8000/docs`

### Testing the APIs

```bash
python test_api.py
```

## 🧪 Model Performance

The trained models achieved the following performance on the test set:

| Model | Accuracy | Precision | Recall | F1-Score | AUC |
|-------|----------|-----------|--------|----------|-----|
| Logistic Regression | 0.8845 | 0.8766 | 0.8950 | 0.8857 | 0.953 |
| Linear SVM | 0.8815 | 0.8765 | 0.8865 | 0.8815 | 0.949 |
| Naive Bayes | 0.8575 | 0.8245 | 0.8910 | 0.8563 | 0.926 |
| Random Forest | 0.8465 | 0.8125 | 0.8905 | 0.8498 | 0.925 |

**Best Model:** Logistic Regression with F1-Score of 0.8857