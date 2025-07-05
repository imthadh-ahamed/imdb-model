import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Sentiment Analysis - AI-Powered Movie Review Analyzer',
  description: 'Analyze the sentiment of movie reviews using advanced machine learning models. Get instant predictions on whether reviews are positive or negative.',
  keywords: 'sentiment analysis, movie reviews, machine learning, AI, NLP, text classification',
  authors: [{ name: 'Sentiment Analysis Team' }],
  creator: 'Sentiment Analysis AI',
  publisher: 'Sentiment Analysis Platform',
  openGraph: {
    title: 'Sentiment Analysis - AI-Powered Movie Review Analyzer',
    description: 'Analyze movie review sentiment with advanced AI',
    url: 'https://sentiment-analysis.com',
    siteName: 'Sentiment Analysis',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sentiment Analysis - AI-Powered Movie Review Analyzer',
    description: 'Analyze movie review sentiment with advanced AI',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-gray-50 min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#10b981',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
