'use client'

import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { 
  SparklesIcon, 
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface SentimentResult {
  sentiment: 'positive' | 'negative'
  confidence: number
  processed_text: string
  original_text: string
  timestamp: string
}

const sampleTexts = [
  "This movie was absolutely fantastic! The acting was superb and the story was captivating.",
  "I wasted my time watching this film. The story was boring and predictable.",
  "The movie was okay, nothing special but not terrible either.",
  "Outstanding performance by all actors. This is definitely one of the best movies I've ever seen.",
  "Terrible film with no redeeming qualities. The characters were poorly developed."
]

export default function AnalyzePage() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<SentimentResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [apiEndpoint, setApiEndpoint] = useState('flask') // 'flask' or 'fastapi'

  const analyzeSentiment = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to analyze')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const baseUrl = apiEndpoint === 'flask' 
        ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        : process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000'

      const response = await fetch(`${baseUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text.trim() }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
      toast.success('Analysis completed successfully!')
    } catch (error) {
      console.error('Error analyzing sentiment:', error)
      toast.error('Failed to analyze sentiment. Please check if the API server is running.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy)
    toast.success('Copied to clipboard!')
  }

  const useSampleText = (sampleText: string) => {
    setText(sampleText)
    toast.success('Sample text loaded!')
  }

  const clearAll = () => {
    setText('')
    setResult(null)
    toast.success('Cleared all content!')
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />
      case 'negative':
        return <XCircleIcon className="h-6 w-6 text-red-600" />
      default:
        return <ExclamationTriangleIcon className="h-6 w-6 text-gray-600" />
    }
  }

  const getConfidenceBarColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500'
    if (confidence >= 0.6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Sentiment Analysis
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Analyze the sentiment of any text using our advanced AI models
          </p>
        </div>

        {/* API Endpoint Selector */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Choose API Endpoint:
          </label>
          <div className="flex space-x-4">
            <button
              onClick={() => setApiEndpoint('flask')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                apiEndpoint === 'flask'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Flask API (Port 5000)
            </button>
            <button
              onClick={() => setApiEndpoint('fastapi')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                apiEndpoint === 'fastapi'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              FastAPI (Port 8000)
            </button>
          </div>
        </div>

        {/* Main Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Input Text</h2>
              <button
                onClick={clearAll}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear All
              </button>
            </div>
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your movie review, customer feedback, or any text you want to analyze..."
              className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={10000}
            />
            
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-500">
                {text.length}/10,000 characters
              </span>
              <button
                onClick={analyzeSentiment}
                disabled={loading || !text.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Analyze Sentiment
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h2>
            
            {result ? (
              <div className="space-y-4">
                {/* Sentiment Result */}
                <div className={`p-4 rounded-lg border ${getSentimentColor(result.sentiment)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getSentimentIcon(result.sentiment)}
                      <span className="font-semibold text-lg capitalize">
                        {result.sentiment}
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {(result.confidence * 100).toFixed(1)}% confident
                    </span>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Confidence Score</span>
                    <span className="text-sm text-gray-600">{result.confidence.toFixed(4)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${getConfidenceBarColor(result.confidence)}`}
                      style={{ width: `${result.confidence * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Processed Text */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Processed Text</span>
                    <button
                      onClick={() => copyToClipboard(result.processed_text)}
                      className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      title="Copy processed text to clipboard"
                      aria-label="Copy processed text to clipboard"
                    >
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                    {result.processed_text}
                  </p>
                </div>

                {/* Timestamp */}
                <div className="text-xs text-gray-500">
                  Analyzed at: {new Date(result.timestamp).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-sm font-medium text-gray-900">No analysis yet</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Enter some text and click "Analyze Sentiment" to see results
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sample Texts */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Try Sample Texts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleTexts.map((sampleText, index) => (
              <button
                key={index}
                onClick={() => useSampleText(sampleText)}
                className="text-left p-3 border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <p className="text-sm text-gray-600 line-clamp-3">
                  {sampleText}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
