'use client'

import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { 
  DocumentPlusIcon,
  TrashIcon,
  ChartBarIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

interface BatchResult {
  text: string
  sentiment: 'positive' | 'negative' | 'neutral'
  confidence: number
  details?: {
    positive_words_found: number
    negative_words_found: number
    total_words: number
  }
}

interface BatchSentimentResult {
  results: BatchResult[]
  summary: {
    total_texts: number
    positive_count: number
    negative_count: number
    neutral_count: number
    average_confidence?: number
  }
  timestamp: string
  status: string
}

const sampleBatchTexts = [
  "This movie was absolutely fantastic! The acting was superb and the story was captivating.",
  "I wasted my time watching this film. The story was boring and predictable.",
  "The movie was okay, nothing special but not terrible either.",
  "Outstanding performance by all actors. This is definitely one of the best movies I've ever seen.",
  "Terrible film with no redeeming qualities. The characters were poorly developed.",
  "The cinematography was breathtaking and the soundtrack was beautiful.",
  "I fell asleep halfway through. Very disappointing experience.",
  "Great movie with amazing special effects and compelling characters."
]

export default function BatchPage() {
  const [texts, setTexts] = useState<string[]>([''])
  const [results, setResults] = useState<BatchSentimentResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [apiEndpoint, setApiEndpoint] = useState('flask') // 'flask' or 'fastapi'

  const addTextInput = () => {
    if (texts.length < 20) {
      setTexts([...texts, ''])
    } else {
      toast.error('Maximum 20 texts allowed')
    }
  }

  const removeTextInput = (index: number) => {
    if (texts.length > 1) {
      const newTexts = texts.filter((_, i) => i !== index)
      setTexts(newTexts)
    } else {
      toast.error('At least one text input is required')
    }
  }

  const updateText = (index: number, value: string) => {
    const newTexts = [...texts]
    newTexts[index] = value
    setTexts(newTexts)
  }

  const clearAll = () => {
    setTexts([''])
    setResults(null)
    toast.success('All content cleared!')
  }

  const loadSampleTexts = () => {
    setTexts(sampleBatchTexts)
    toast.success('Sample texts loaded!')
  }

  const analyzeBatch = async () => {
    const validTexts = texts.filter(text => text.trim())
    
    if (validTexts.length === 0) {
      toast.error('Please enter at least one text to analyze')
      return
    }

    setLoading(true)
    setResults(null)

    try {
      const baseUrl = apiEndpoint === 'flask' 
        ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        : process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000'

      const response = await fetch(`${baseUrl}/predict/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ texts: validTexts }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResults(data)
      toast.success(`Successfully analyzed ${validTexts.length} texts!`)
    } catch (error) {
      console.error('Error analyzing batch sentiment:', error)
      toast.error('Failed to analyze batch sentiment. Please check if the API server is running.')
    } finally {
      setLoading(false)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'neutral':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'negative':
        return <XCircleIcon className="h-5 w-5 text-red-600" />
      case 'neutral':
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-600" />
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-600" />
    }
  }

  const exportResults = () => {
    if (!results) return
    
    const csvContent = [
      ['Text', 'Sentiment', 'Confidence', 'Positive Words', 'Negative Words', 'Total Words'].join(','),
      ...results.results.map(result => [
        `"${result.text.replace(/"/g, '""')}"`,
        result.sentiment,
        result.confidence.toFixed(4),
        result.details?.positive_words_found || 0,
        result.details?.negative_words_found || 0,
        result.details?.total_words || 0
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sentiment-analysis-batch-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Results exported as CSV!')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Batch Sentiment Analysis
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Analyze multiple texts simultaneously and get comprehensive insights
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Input Texts</h2>
              <div className="flex space-x-2">
                <button
                  onClick={loadSampleTexts}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Load Samples
                </button>
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {texts.map((text, index) => (
                <div key={index} className="relative">
                  <div className="flex items-start space-x-2">
                    <span className="text-sm font-medium text-gray-500 mt-3 w-8">
                      {index + 1}.
                    </span>
                    <textarea
                      value={text}
                      onChange={(e) => updateText(index, e.target.value)}
                      placeholder={`Enter text ${index + 1} to analyze...`}
                      className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={2}
                      maxLength={1000}
                    />
                    <button
                      onClick={() => removeTextInput(index)}
                      className="mt-3 text-red-500 hover:text-red-700 transition-colors"
                      disabled={texts.length === 1}
                      title="Remove this text input"
                      aria-label="Remove this text input"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 ml-10">
                    {text.length}/1,000 characters
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={addTextInput}
                disabled={texts.length >= 20}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <DocumentPlusIcon className="h-4 w-4 mr-2" />
                Add Text ({texts.length}/20)
              </button>

              <button
                onClick={analyzeBatch}
                disabled={loading || texts.filter(t => t.trim()).length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <ChartBarIcon className="h-4 w-4 mr-2" />
                    Analyze Batch
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Analysis Results</h2>
              {results && (
                <button
                  onClick={exportResults}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Export CSV
                </button>
              )}
            </div>

            {results ? (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {results.summary.total_texts}
                    </div>
                    <div className="text-sm text-gray-600">Total Texts</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {results.summary.positive_count}
                    </div>
                    <div className="text-sm text-gray-600">Positive</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {results.summary.negative_count}
                    </div>
                    <div className="text-sm text-gray-600">Negative</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      {results.summary.neutral_count || 0}
                    </div>
                    <div className="text-sm text-gray-600">Neutral</div>
                  </div>
                </div>

                {/* Individual Results */}
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {results.results.map((result, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getSentimentIcon(result.sentiment)}
                          <span className="font-medium capitalize text-sm">
                            {result.sentiment}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({(result.confidence * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(result.text)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy text to clipboard"
                          aria-label="Copy text to clipboard"
                        >
                          <ClipboardDocumentIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {result.text}
                      </p>
                      {result.details && (
                        <div className="text-xs text-gray-500">
                          Positive words: {result.details.positive_words_found} | 
                          Negative words: {result.details.negative_words_found} | 
                          Total words: {result.details.total_words}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Timestamp */}
                <div className="text-xs text-gray-500 text-center">
                  Analyzed at: {new Date(results.timestamp).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-sm font-medium text-gray-900">No batch analysis yet</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Enter multiple texts and click "Analyze Batch" to see results
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
