'use client'

import React from 'react'
import Link from 'next/link'
import { 
  BeakerIcon, 
  ChartBarIcon, 
  DocumentTextIcon, 
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Advanced ML Models',
    description: 'Powered by state-of-the-art machine learning algorithms including Logistic Regression, SVM, and Naive Bayes.',
    icon: BeakerIcon,
  },
  {
    name: 'Real-time Analysis',
    description: 'Get instant sentiment predictions with confidence scores for any text input.',
    icon: SparklesIcon,
  },
  {
    name: 'Batch Processing',
    description: 'Analyze multiple texts simultaneously for efficient bulk sentiment analysis.',
    icon: ChartBarIcon,
  },
  {
    name: 'REST API',
    description: 'Easy-to-use REST API endpoints for seamless integration into your applications.',
    icon: DocumentTextIcon,
  },
]

const stats = [
  { label: 'Accuracy', value: '88.45%' },
  { label: 'F1-Score', value: '0.8857' },
  { label: 'AUC Score', value: '0.953' },
  { label: 'Training Samples', value: '40,000' },
]

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              <span className="block">AI-Powered</span>
              <span className="block text-blue-200">Sentiment Analysis</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-xl text-blue-100">
              Analyze text sentiment with cutting-edge machine learning models. Get instant predictions 
              on whether movie reviews, customer feedback, or any text is positive or negative.
            </p>
            <div className="mt-10 flex justify-center space-x-4">
              <Link
                href="/analyze"
                className="inline-flex items-center rounded-md bg-white px-6 py-3 text-base font-medium text-blue-600 shadow hover:bg-blue-50 transition-colors"
              >
                Try Now
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center rounded-md border-2 border-white px-6 py-3 text-base font-medium text-white hover:bg-white hover:text-blue-600 transition-colors"
              >
                View API Docs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div className="bg-blue-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Model Performance</h2>
            <p className="mt-4 text-lg text-gray-600">
              Our sentiment analysis model achieves industry-leading performance metrics
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
                <div className="mt-2 text-sm font-medium text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Powerful Features
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need for comprehensive sentiment analysis
            </p>
          </div>
          
          <div className="mt-20 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="text-center">
                <div className="mx-auto h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">{feature.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works section */}
      <div className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600">
              Simple steps to analyze sentiment in your text
            </p>
          </div>
          
          <div className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                1
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Input Text</h3>
              <p className="mt-2 text-sm text-gray-600">
                Enter your movie review, customer feedback, or any text you want to analyze
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                2
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">AI Processing</h3>
              <p className="mt-2 text-sm text-gray-600">
                Our ML model preprocesses and analyzes the text using advanced NLP techniques
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                3
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Get Results</h3>
              <p className="mt-2 text-sm text-gray-600">
                Receive instant sentiment prediction with confidence score and detailed analysis
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-blue-600 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">
              Ready to analyze sentiment?
            </h2>
            <p className="mt-4 text-xl text-blue-100">
              Start analyzing text sentiment with our powerful AI models today.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <Link
                href="/analyze"
                className="inline-flex items-center rounded-md bg-white px-6 py-3 text-base font-medium text-blue-600 shadow hover:bg-blue-50 transition-colors"
              >
                <SparklesIcon className="mr-2 h-5 w-5" />
                Start Analyzing
              </Link>
              <Link
                href="/batch"
                className="inline-flex items-center rounded-md border-2 border-white px-6 py-3 text-base font-medium text-white hover:bg-white hover:text-blue-600 transition-colors"
              >
                <ChartBarIcon className="mr-2 h-5 w-5" />
                Batch Analysis
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
