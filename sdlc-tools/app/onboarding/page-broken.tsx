'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader2, Terminal, Play, CheckCircle, XCircle } from 'lucide-react'

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



  const startOnboarding = async () => {
    if (!owner || !repo) return
    
    setIsAnalyzing(true)
    setTerminalLines([])
    setError(null)
    setIsComplete(false)
    
    addTerminalLine(`🚀 Starting comprehensive analysis for ${owner}/${repo}`, 'info')
    addTerminalLine('📊 Initializing repository onboarding system...', 'progress')
    
    try {
      // Close any existing EventSource
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      
      // Start the onboarding analysis
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
    <div className="min-h-screen bg-gray-900 text-green-400 flex items-center justify-center font-mono">
      <div className="w-full max-w-md p-4 bg-gray-800 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-bold">Repository Onboarding</div>
          {isAnalyzing && (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-green-400" />
              <span className="text-sm text-gray-400">Analyzing repository...</span>
            </div>
          )}
                Comprehensive analysis for <span className="font-semibold">{owner}/{repo}</span>
              </p>
            </div>
            {isAnalyzing && (
              <div className="flex items-center space-x-2 ml-auto">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-sm text-gray-600">Analyzing repository...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Analysis Progress */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-600" />
                  Analysis Progress
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {messages.map((message, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      {message.type === 'progress' && (
                        <>
                          <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">{message.message}</p>
                          </div>
                        </>
                      )}
                      {message.type === 'claude_message' && (
                        <>
                          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          </div>
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                {message.content?.substring(0, 200)}
                                {message.content && message.content.length > 200 ? '...' : ''}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                      {message.type === 'tool_use' && (
                        <>
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">
                              Using tool: <span className="font-medium">{message.name}</span>
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {error && (
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>
          </div>

          {/* Status Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Status</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Repository Analysis</span>
                    {isAnalyzing ? (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    ) : onboardingGuide ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-gray-300" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Code Analysis</span>
                    {technicalAnalysis ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-gray-300" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Recommendations</span>
                    {recommendations.length > 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-gray-300" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {recommendations.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Recommendations</h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-2">
                    {recommendations.slice(0, 5).map((rec, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {onboardingGuide && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-green-600" />
                  Comprehensive Onboarding Guide
                </h2>
              </div>
              <div className="p-6">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-sm text-gray-800">
                    {onboardingGuide}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
