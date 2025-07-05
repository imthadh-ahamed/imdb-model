'use client'

import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { 
  CodeBracketIcon,
  PlayIcon,
  DocumentDuplicateIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ServerIcon,
  CloudIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface ApiEndpoint {
  method: 'GET' | 'POST'
  path: string
  description: string
  parameters?: Array<{
    name: string
    type: string
    required: boolean
    description: string
    example?: string
  }>
  requestBody?: {
    type: string
    properties: Record<string, any>
    example: any
  }
  responses: Array<{
    status: number
    description: string
    example: any
  }>
}

const flaskEndpoints: ApiEndpoint[] = [
  {
    method: 'GET',
    path: '/',
    description: 'Health check endpoint that returns API status and model information',
    responses: [
      {
        status: 200,
        description: 'Success response with API status',
        example: {
          status: 'healthy',
          message: 'Sentiment Analysis API is running',
          model_info: {
            model_name: 'Simple Rule-Based Model',
            accuracy: 'Demo Mode',
            f1_score: 'Demo Mode'
          },
          timestamp: '2025-07-06T10:30:00.000Z'
        }
      }
    ]
  },
  {
    method: 'POST',
    path: '/predict',
    description: 'Analyze sentiment for a single text input',
    requestBody: {
      type: 'application/json',
      properties: {
        text: {
          type: 'string',
          required: true,
          description: 'The text to analyze (1-10,000 characters)'
        }
      },
      example: {
        text: 'This movie was absolutely fantastic!'
      }
    },
    responses: [
      {
        status: 200,
        description: 'Successful sentiment analysis',
        example: {
          sentiment: 'positive',
          confidence: 0.85,
          text: 'This movie was absolutely fantastic!',
          details: {
            positive_words_found: 2,
            negative_words_found: 0
          },
          timestamp: '2025-07-06T10:30:00.000Z',
          status: 'success'
        }
      },
      {
        status: 400,
        description: 'Bad request - invalid or missing text',
        example: {
          error: 'Missing required field: text',
          status: 'error'
        }
      }
    ]
  },
  {
    method: 'POST',
    path: '/predict/batch',
    description: 'Analyze sentiment for multiple texts simultaneously',
    requestBody: {
      type: 'application/json',
      properties: {
        texts: {
          type: 'array',
          items: { type: 'string' },
          required: true,
          description: 'Array of texts to analyze (1-100 texts)'
        }
      },
      example: {
        texts: [
          'This movie was great!',
          'This movie was terrible!'
        ]
      }
    },
    responses: [
      {
        status: 200,
        description: 'Successful batch sentiment analysis',
        example: {
          results: [
            {
              text: 'This movie was great!',
              sentiment: 'positive',
              confidence: 0.75,
              details: {
                positive_words_found: 1,
                negative_words_found: 0
              }
            },
            {
              text: 'This movie was terrible!',
              sentiment: 'negative',
              confidence: 0.70,
              details: {
                positive_words_found: 0,
                negative_words_found: 1
              }
            }
          ],
          summary: {
            total_texts: 2,
            positive_count: 1,
            negative_count: 1,
            neutral_count: 0
          },
          timestamp: '2025-07-06T10:30:00.000Z',
          status: 'success'
        }
      }
    ]
  }
]

const fastApiEndpoints: ApiEndpoint[] = [
  {
    method: 'GET',
    path: '/',
    description: 'Health check endpoint with FastAPI response model validation',
    responses: [
      {
        status: 200,
        description: 'Success response with API status',
        example: {
          status: 'healthy',
          message: 'Sentiment Analysis FastAPI is running',
          model_info: {
            model_name: 'Simple Rule-Based Model',
            accuracy: 'Demo Mode',
            f1_score: 'Demo Mode',
            type: 'FastAPI'
          },
          timestamp: '2025-07-06T10:30:00.000Z'
        }
      }
    ]
  },
  {
    method: 'POST',
    path: '/predict',
    description: 'Analyze sentiment with automatic request validation using Pydantic models',
    requestBody: {
      type: 'application/json',
      properties: {
        text: {
          type: 'string',
          required: true,
          description: 'The text to analyze (1-10,000 characters)'
        }
      },
      example: {
        text: 'This movie was absolutely fantastic!'
      }
    },
    responses: [
      {
        status: 200,
        description: 'Successful sentiment analysis with validated response',
        example: {
          sentiment: 'positive',
          confidence: 0.85,
          text: 'This movie was absolutely fantastic!',
          details: {
            positive_words_found: 2,
            negative_words_found: 0,
            total_words: 5
          },
          timestamp: '2025-07-06T10:30:00.000Z',
          status: 'success'
        }
      },
      {
        status: 422,
        description: 'Validation error - invalid request format',
        example: {
          detail: [
            {
              loc: ['body', 'text'],
              msg: 'field required',
              type: 'value_error.missing'
            }
          ]
        }
      }
    ]
  },
  {
    method: 'POST',
    path: '/predict/batch',
    description: 'Batch sentiment analysis with enhanced validation and statistics',
    requestBody: {
      type: 'application/json',
      properties: {
        texts: {
          type: 'array',
          items: { type: 'string' },
          required: true,
          description: 'Array of texts to analyze (1-100 texts)'
        }
      },
      example: {
        texts: [
          'This movie was great!',
          'This movie was terrible!'
        ]
      }
    },
    responses: [
      {
        status: 200,
        description: 'Successful batch analysis with additional statistics',
        example: {
          results: [
            {
              text: 'This movie was great!',
              sentiment: 'positive',
              confidence: 0.75,
              details: {
                positive_words_found: 1,
                negative_words_found: 0,
                total_words: 4
              }
            }
          ],
          summary: {
            total_texts: 2,
            positive_count: 1,
            negative_count: 1,
            neutral_count: 0,
            average_confidence: 0.725
          },
          timestamp: '2025-07-06T10:30:00.000Z',
          status: 'success'
        }
      }
    ]
  }
]

export default function DocsPage() {
  const [selectedApi, setSelectedApi] = useState<'flask' | 'fastapi'>('flask')
  const [expandedEndpoints, setExpandedEndpoints] = useState<string[]>([])
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null)
  const [testResponse, setTestResponse] = useState<any>(null)

  const toggleEndpoint = (endpointId: string) => {
    setExpandedEndpoints(prev => 
      prev.includes(endpointId) 
        ? prev.filter(id => id !== endpointId)
        : [...prev, endpointId]
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const testEndpoint = async (endpoint: ApiEndpoint) => {
    const endpointId = `${selectedApi}-${endpoint.method}-${endpoint.path}`
    setTestingEndpoint(endpointId)
    setTestResponse(null)

    try {
      const baseUrl = selectedApi === 'flask' 
        ? 'http://localhost:5000'
        : 'http://localhost:8000'

      const url = `${baseUrl}${endpoint.path}`
      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      if (endpoint.requestBody) {
        options.body = JSON.stringify(endpoint.requestBody.example)
      }

      const response = await fetch(url, options)
      const data = await response.json()
      
      setTestResponse({
        status: response.status,
        data: data
      })
      
      toast.success('API test completed!')
    } catch (error) {
      setTestResponse({
        status: 'error',
        data: { error: 'Failed to connect to API server' }
      })
      toast.error('Failed to test API endpoint')
    } finally {
      setTestingEndpoint(null)
    }
  }

  const generateCurlCommand = (endpoint: ApiEndpoint) => {
    const baseUrl = selectedApi === 'flask' 
      ? 'http://localhost:5000'
      : 'http://localhost:8000'

    let command = `curl -X ${endpoint.method} ${baseUrl}${endpoint.path}`

    if (endpoint.requestBody) {
      command += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(endpoint.requestBody.example, null, 2)}'`
    }

    return command
  }

  const endpoints = selectedApi === 'flask' ? flaskEndpoints : fastApiEndpoints

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            API Documentation
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Complete reference for the Sentiment Analysis API endpoints
          </p>
        </div>

        {/* API Selector */}
        <div className="mb-8">
          <div className="flex justify-center space-x-1 bg-gray-100 p-1 rounded-lg max-w-md mx-auto">
            <button
              onClick={() => setSelectedApi('flask')}
              className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedApi === 'flask'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ServerIcon className="h-4 w-4 mr-2" />
              Flask API (Port 5000)
            </button>
            <button
              onClick={() => setSelectedApi('fastapi')}
              className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedApi === 'fastapi'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CloudIcon className="h-4 w-4 mr-2" />
              FastAPI (Port 8000)
            </button>
          </div>
        </div>

        {/* Base URL */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Base URL</h2>
          <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
            <code className="text-sm font-mono text-gray-700">
              {selectedApi === 'flask' ? 'http://localhost:5000' : 'http://localhost:8000'}
            </code>
            <button
              onClick={() => copyToClipboard(selectedApi === 'flask' ? 'http://localhost:5000' : 'http://localhost:8000')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Copy base URL"
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
            </button>
          </div>
          {selectedApi === 'fastapi' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>FastAPI Feature:</strong> Interactive API documentation available at{' '}
                <a 
                  href="http://localhost:8000/docs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-800"
                >
                  /docs
                </a>
                {' '}and{' '}
                <a 
                  href="http://localhost:8000/redoc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-800"
                >
                  /redoc
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Endpoints */}
        <div className="space-y-6">
          {endpoints.map((endpoint, index) => {
            const endpointId = `${selectedApi}-${endpoint.method}-${endpoint.path}`
            const isExpanded = expandedEndpoints.includes(endpointId)
            const isTesting = testingEndpoint === endpointId

            return (
              <div key={endpointId} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleEndpoint(endpointId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {isExpanded ? (
                          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          endpoint.method === 'GET' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {endpoint.method}
                        </span>
                      </div>
                      <code className="text-sm font-mono text-gray-700">
                        {endpoint.path}
                      </code>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        testEndpoint(endpoint)
                      }}
                      disabled={isTesting}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isTesting ? (
                        <>
                          <div className="animate-spin -ml-1 mr-2 h-3 w-3 border border-gray-400 border-t-transparent rounded-full"></div>
                          Testing...
                        </>
                      ) : (
                        <>
                          <PlayIcon className="h-3 w-3 mr-1" />
                          Test
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {endpoint.description}
                  </p>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200 p-6 space-y-6">
                    {/* Request Body */}
                    {endpoint.requestBody && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Request Body</h3>
                        <div className="bg-gray-50 rounded-md p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">Content-Type: {endpoint.requestBody.type}</span>
                            <button
                              onClick={() => copyToClipboard(JSON.stringify(endpoint.requestBody?.example, null, 2))}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                              title="Copy request body"
                            >
                              <DocumentDuplicateIcon className="h-4 w-4" />
                            </button>
                          </div>
                          <pre className="text-sm text-gray-800 overflow-x-auto">
                            <code>{JSON.stringify(endpoint.requestBody.example, null, 2)}</code>
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Responses */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Responses</h3>
                      <div className="space-y-4">
                        {endpoint.responses.map((response, responseIndex) => (
                          <div key={responseIndex} className="border border-gray-200 rounded-md">
                            <div className="flex items-center justify-between p-3 bg-gray-50">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  response.status === 200 
                                    ? 'bg-green-100 text-green-800'
                                    : response.status >= 400
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {response.status}
                                </span>
                                <span className="text-sm text-gray-700">
                                  {response.description}
                                </span>
                              </div>
                              <button
                                onClick={() => copyToClipboard(JSON.stringify(response.example, null, 2))}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                title="Copy response"
                              >
                                <DocumentDuplicateIcon className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="p-3 bg-gray-50">
                              <pre className="text-sm text-gray-800 overflow-x-auto">
                                <code>{JSON.stringify(response.example, null, 2)}</code>
                              </pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* cURL Command */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">cURL Command</h3>
                      <div className="bg-gray-900 rounded-md p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">Terminal command</span>
                          <button
                            onClick={() => copyToClipboard(generateCurlCommand(endpoint))}
                            className="text-gray-400 hover:text-gray-300 transition-colors"
                            title="Copy cURL command"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <pre className="text-sm text-gray-100 overflow-x-auto">
                          <code>{generateCurlCommand(endpoint)}</code>
                        </pre>
                      </div>
                    </div>

                    {/* Test Response */}
                    {testResponse && testingEndpoint === endpointId && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Test Response</h3>
                        <div className="bg-gray-50 rounded-md p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            {testResponse.status === 'error' ? (
                              <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                            ) : (
                              <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            )}
                            <span className="text-sm font-medium text-gray-700">
                              {testResponse.status === 'error' ? 'Connection Error' : `Status: ${testResponse.status}`}
                            </span>
                          </div>
                          <pre className="text-sm text-gray-800 overflow-x-auto">
                            <code>{JSON.stringify(testResponse.data, null, 2)}</code>
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h2>
          <div className="space-y-4 text-sm text-gray-700">
            <p>
              <strong>1. Start the API Server:</strong> Make sure either the Flask API (port 5000) or FastAPI (port 8000) is running.
            </p>
            <p>
              <strong>2. Test Endpoints:</strong> Use the "Test" buttons above to verify the API is working correctly.
            </p>
            <p>
              <strong>3. Authentication:</strong> Currently, no authentication is required for these endpoints.
            </p>
            <p>
              <strong>4. Rate Limiting:</strong> There are no rate limits in the current implementation.
            </p>
            <p>
              <strong>5. CORS:</strong> Cross-origin requests are enabled for all origins in development mode.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
