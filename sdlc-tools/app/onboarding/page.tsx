'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader2, Terminal, CheckCircle, XCircle } from 'lucide-react'

interface TerminalLine {
  id: string
  text: string
  type: 'info' | 'success' | 'error' | 'progress' | 'result'
  timestamp: string
}

interface OnboardingResult {
  onboardingGuide?: string
  technicalAnalysis?: string
  recommendations?: string[]
}

export default function OnboardingPage() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const owner = searchParams.get('owner')
  const repo = searchParams.get('repo')
  
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([])
  const [result, setResult] = useState<OnboardingResult | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)

  const addTerminalLine = (text: string, type: TerminalLine['type'] = 'info') => {
    const newLine: TerminalLine = {
      id: Date.now().toString(),
      text,
      type,
      timestamp: new Date().toLocaleTimeString()
    }
    setTerminalLines(prev => [...prev, newLine])
  }

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [terminalLines])

  useEffect(() => {
    if (owner && repo && session?.accessToken && !isAnalyzing) {
      startOnboarding()
    }
  }, [owner, repo, session])

  const startOnboarding = async () => {
    if (!owner || !repo) return
    
    setIsAnalyzing(true)
    setTerminalLines([])
    setError(null)
    setIsComplete(false)
    
    addTerminalLine(`🚀 Starting comprehensive analysis for ${owner}/${repo}`, 'info')
    addTerminalLine('📊 Initializing repository onboarding system...', 'progress')
    
    try {
      const response = await fetch('/api/github/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ owner, repo }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('Failed to get response reader')
      }

      addTerminalLine('🔄 Connected to analysis stream...', 'success')

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          addTerminalLine('✅ Analysis stream completed', 'success')
          break
        }
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'progress') {
                addTerminalLine(`⏳ ${data.message}`, 'progress')
              } else if (data.type === 'message') {
                const content = data.data?.content || 'Processing...'
                const progress = data.data?.progress ? ` (${data.data.progress}%)` : ''
                addTerminalLine(`🔍 ${content.substring(0, 80)}...${progress}`, 'info')
              } else if (data.type === 'complete') {
                addTerminalLine('🎉 Analysis completed successfully!', 'success')
                setResult({
                  onboardingGuide: data.data?.onboardingGuide || 'Analysis completed',
                  technicalAnalysis: data.data?.technicalAnalysis || 'Technical analysis completed',
                  recommendations: data.data?.recommendations || []
                })
                setIsComplete(true)
              } else if (data.type === 'error') {
                addTerminalLine(`❌ Error: ${data.message}`, 'error')
                setError(data.message)
              }
            } catch (parseError) {
              addTerminalLine(`⚠️ Failed to parse response data`, 'error')
              console.warn('Failed to parse SSE data:', parseError)
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Onboarding error:', error)
      addTerminalLine(`❌ Connection error: ${error.message}`, 'error')
      setError(error.message || 'Failed to start onboarding analysis')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'success': return 'text-green-400'
      case 'error': return 'text-red-400'
      case 'progress': return 'text-yellow-400'
      case 'result': return 'text-blue-400'
      default: return 'text-gray-300'
    }
  }

  if (!owner || !repo) {
    return (
      <div className="min-h-screen bg-gray-900 text-green-400 flex items-center justify-center font-mono">
        <div className="text-center">
          <div className="text-red-400 text-4xl mb-4">ERROR</div>
          <div className="text-xl mb-2">Missing Parameters</div>
          <div className="text-gray-400">Repository owner and name are required for onboarding analysis.</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 text-green-400 flex items-center justify-center font-mono">
        <div className="text-center">
          <div className="text-yellow-400 text-4xl mb-4">AUTH_REQUIRED</div>
          <div className="text-xl mb-2">Authentication Required</div>
          <div className="text-gray-400">Please sign in with GitHub to access repository onboarding.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-green-400 p-4 font-mono">
      {/* Terminal Header */}
      <div className="bg-gray-800 rounded-t-lg border border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="h-5 w-5" />
            <span className="text-lg font-bold">Repository Onboarding Terminal</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">{owner}/{repo}</div>
            {isAnalyzing && (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Analyzing...</span>
              </div>
            )}
            {isComplete && (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400">Complete</span>
              </div>
            )}
            {error && (
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-400">Error</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="bg-black rounded-b-lg border-l border-r border-b border-gray-700 p-4 h-96 overflow-y-auto" ref={terminalRef}>
        {terminalLines.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <div>Terminal ready. Analysis will start automatically...</div>
          </div>
        ) : (
          <div className="space-y-1">
            {terminalLines.map((line) => (
              <div key={line.id} className="flex items-start space-x-2">
                <span className="text-gray-500 text-xs w-20 flex-shrink-0">[{line.timestamp}]</span>
                <span className={`${getLineColor(line.type)} flex-1 break-words`}>{line.text}</span>
              </div>
            ))}
            {isAnalyzing && (
              <div className="flex items-center space-x-2 text-yellow-400">
                <span className="text-gray-500 text-xs w-20 flex-shrink-0">[{new Date().toLocaleTimeString()}]</span>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="mt-6 space-y-4">
          {result.onboardingGuide && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <h3 className="text-lg font-bold text-green-400 mb-2">📚 Onboarding Guide</h3>
              <div className="text-gray-300 whitespace-pre-wrap text-sm">{result.onboardingGuide}</div>
            </div>
          )}
          
          {result.technicalAnalysis && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <h3 className="text-lg font-bold text-blue-400 mb-2">🔧 Technical Analysis</h3>
              <div className="text-gray-300 whitespace-pre-wrap text-sm">{result.technicalAnalysis}</div>
            </div>
          )}
          
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <h3 className="text-lg font-bold text-yellow-400 mb-2">💡 Recommendations</h3>
              <ul className="text-gray-300 space-y-1 text-sm">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-yellow-400">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
