'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Star, GitFork, Clock, ExternalLink, BarChart3, Shield, FileText, BookOpen, Zap } from 'lucide-react'
import OnboardingResults from '../../components/OnboardingResults'

interface Repository {
  id: number
  name: string
  fullName: string
  description: string
  language: string
  stargazersCount: number
  forksCount: number
  updatedAt: string
  htmlUrl: string
  private: boolean
  size: number
}

export default function GitHubPage() {
  const { data: session, status } = useSession()
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [analysisResults, setAnalysisResults] = useState<{[key: string]: any}>({})
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null)
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
  const [currentOnboarding, setCurrentOnboarding] = useState<any>(null)
  const [onboardingTerminalLines, setOnboardingTerminalLines] = useState<any[]>([])
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(false)

  useEffect(() => {
    if (session?.accessToken) {
      fetchRepositories()
    }
  }, [session])

  const fetchRepositories = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/github/repos')
      if (response.ok) {
        const data = await response.json()
        setRepositories(data.repos)
      } else {
        console.error('Failed to fetch repositories')
      }
    } catch (error) {
      console.error('Error fetching repositories:', error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeRepository = async (owner: string, repo: string) => {
    setAnalyzing(`${owner}/${repo}`)
    try {
      const response = await fetch('/api/github/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ owner, repo }),
      })

      if (response.ok) {
        const analysisResult = await response.json()
        console.log('Analysis result:', analysisResult)
        
        // Store results and show in UI
        const repoKey = `${owner}/${repo}`
        setAnalysisResults(prev => ({ ...prev, [repoKey]: analysisResult }))
        setCurrentAnalysis(analysisResult)
        setShowAnalysisModal(true)
      } else {
        console.error('Failed to analyze repository')
        alert('Failed to analyze repository. Please try again.')
      }
    } catch (error) {
      console.error('Error analyzing repository:', error)
      alert('Error analyzing repository. Please try again.')
    } finally {
      setAnalyzing(null)
    }
  }

  const handleOnboarding = async (owner: string, repo: string) => {
    const key = `${owner}/${repo}`
    
    // Reset state and show modal
    setOnboardingTerminalLines([])
    setCurrentOnboarding(null)
    setIsOnboardingLoading(true)
    setShowOnboardingModal(true)
    
    // Add initial terminal line
    const addTerminalLine = (text: string, type: string = 'info') => {
      const newLine = {
        id: Date.now().toString(),
        text,
        type,
        timestamp: new Date().toLocaleTimeString()
      }
      setOnboardingTerminalLines(prev => [...prev, newLine])
    }
    
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
                // Add repository name to the results for the enhanced component
                const resultsWithRepoName = {
                  ...data.data,
                  repositoryName: `${owner}/${repo}`
                }
                setCurrentOnboarding(resultsWithRepoName)
                setIsOnboardingLoading(false)
                addTerminalLine('🎉 Analysis completed successfully!', 'success')
              } else if (data.type === 'error') {
                addTerminalLine(`❌ Error: ${data.message}`, 'error')
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
    } finally {
      setIsOnboardingLoading(false)
    }
  }

  const startComprehensiveOnboarding = (owner: string, repo: string) => {
    handleOnboarding(owner, repo)
  }



  // Helper functions
  const formatSize = (sizeInKB: number): string => {
    if (sizeInKB < 1024) return `${sizeInKB} KB`
    const sizeInMB = sizeInKB / 1024
    if (sizeInMB < 1024) return `${sizeInMB.toFixed(1)} MB`
    const sizeInGB = sizeInMB / 1024
    return `${sizeInGB.toFixed(1)} GB`
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Unknown'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    } catch {
      return 'Invalid date'
    }
  }



  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="mb-8">
              <BarChart3 className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                GitHub Repository Analysis
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Connect your GitHub account to analyze your repositories with AI-powered insights, 
                code quality assessments, and automated onboarding guides.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                What you'll get:
              </h2>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="flex items-start space-x-3">
                  <Shield className="h-6 w-6 text-orange-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Security Analysis</h3>
                    <p className="text-gray-600 text-sm">
                      Comprehensive security vulnerability scanning and dependency analysis
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <BarChart3 className="h-6 w-6 text-orange-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Code Quality</h3>
                    <p className="text-gray-600 text-sm">
                      AI-powered code quality assessment with actionable recommendations
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FileText className="h-6 w-6 text-orange-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Onboarding Guide</h3>
                    <p className="text-gray-600 text-sm">
                      Automatically generated documentation for new team members
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => signIn('github')}
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
              </svg>
              <span>Connect with GitHub</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <BarChart3 className="h-8 w-8 text-orange-500" />
              <h1 className="text-xl font-semibold text-gray-900">GitHub Analysis</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Repositories</h2>
          <p className="text-gray-600">
            Select a repository to analyze with AI-powered insights and generate comprehensive onboarding guides.
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading repositories...</p>
          </div>
        )}

        {!loading && repositories.length > 0 && (
          <div className="grid gap-6">
            {repositories.map((repo) => (
              <div key={repo.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{repo.name}</h3>
                      {repo.private && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          Private
                        </span>
                      )}
                    </div>
                    
                    {repo.description && (
                      <p className="text-gray-600 mb-4">{repo.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      {repo.language && (
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span>{repo.language}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4" />
                        <span>{repo.stargazersCount}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <GitFork className="h-4 w-4" />
                        <span>{repo.forksCount}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Updated {formatDate(repo.updatedAt)}</span>
                      </div>
                      <span>{formatSize(repo.size)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          const [owner, repoName] = repo.fullName.split('/')
                          analyzeRepository(owner, repoName)
                        }}
                        disabled={analyzing === repo.fullName}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                      >
                        {analyzing === repo.fullName ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <BarChart3 className="h-4 w-4" />
                            <span>Analyze</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          const [owner, repoName] = repo.fullName.split('/')
                          startComprehensiveOnboarding(owner, repoName)
                        }}
                        className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <Zap className="h-4 w-4" />
                        <span>Full Onboarding</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && repositories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No repositories found.</p>
            <button
              onClick={fetchRepositories}
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              Refresh
            </button>
          </div>
        )}
      </div>

      {/* Analysis Results Modal */}
      {showAnalysisModal && currentAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Analysis Results</h2>
                <button
                  onClick={() => setShowAnalysisModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Repository Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Repository Details</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {currentAnalysis.repository?.name}</div>
                    <div><span className="font-medium">Language:</span> {currentAnalysis.repository?.language}</div>
                    <div><span className="font-medium">Size:</span> {formatSize(currentAnalysis.repository?.size || 0)}</div>
                    <div><span className="font-medium">Stars:</span> {currentAnalysis.repository?.stargazersCount}</div>
                    <div><span className="font-medium">Forks:</span> {currentAnalysis.repository?.forksCount}</div>
                  </div>
                </div>

                {/* Languages */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Languages</h3>
                  <div className="space-y-2">
                    {Object.entries(currentAnalysis.languages || {}).map(([lang, bytes]) => (
                      <div key={lang} className="flex justify-between text-sm">
                        <span>{lang}</span>
                        <span className="text-gray-600">{typeof bytes === 'number' ? `${Math.round(bytes / 1024)} KB` : String(bytes)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contributors */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Contributors ({currentAnalysis.contributors?.length || 0})</h3>
                  <div className="space-y-2">
                    {(currentAnalysis.contributors || []).slice(0, 5).map((contributor: any, index: number) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <img src={contributor.avatar_url} alt={contributor.login} className="w-6 h-6 rounded-full" />
                        <span>{contributor.login}</span>
                        <span className="text-gray-600">({contributor.contributions} commits)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Commits */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Recent Commits</h3>
                  <div className="space-y-2">
                    {(currentAnalysis.recentCommits || []).slice(0, 5).map((commit: any, index: number) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium truncate">{commit.commit?.message}</div>
                        <div className="text-gray-600 text-xs">
                          {commit.commit?.author?.name} • {formatDate(commit.commit?.author?.date)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Analysis Summary */}
              {currentAnalysis.analysis && (
                <div className="mt-6 bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Analysis Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">{currentAnalysis.analysis.summary?.totalPullRequests || 0}</div>
                      <div className="text-gray-600">Pull Requests</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600">{currentAnalysis.analysis.summary?.totalIssues || 0}</div>
                      <div className="text-gray-600">Issues</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-purple-600">{currentAnalysis.analysis.summary?.languageCount || 0}</div>
                      <div className="text-gray-600">Languages</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-orange-600">{currentAnalysis.contributors?.length || 0}</div>
                      <div className="text-gray-600">Contributors</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Onboarding Results Modal */}
      {showOnboardingModal && !isOnboardingLoading && currentOnboarding && (
        <OnboardingResults
          results={currentOnboarding}
          repositoryName={currentOnboarding.repositoryName || 'Repository'}
          onClose={() => {
            setShowOnboardingModal(false)
            setCurrentOnboarding(null)
            setOnboardingTerminalLines([])
            setIsOnboardingLoading(false)
          }}
        />
      )}

      {/* Loading Modal for Onboarding */}
      {showOnboardingModal && isOnboardingLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-6 w-6 text-green-400" />
                <h2 className="text-xl font-semibold text-white">AI-Enhanced Repository Analysis</h2>
              </div>
              <button
                onClick={() => {
                  setShowOnboardingModal(false)
                  setCurrentOnboarding(null)
                  setOnboardingTerminalLines([])
                  setIsOnboardingLoading(false)
                }}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="h-96 overflow-y-auto p-4 bg-gray-900">
              {onboardingTerminalLines.map((line) => (
                <div key={line.id} className="mb-1 flex items-start space-x-2">
                  <span className="text-gray-500 text-xs shrink-0">[{line.timestamp}]</span>
                  <span className={`text-sm ${
                    line.type === 'success' ? 'text-green-400' :
                    line.type === 'error' ? 'text-red-400' :
                    line.type === 'progress' ? 'text-yellow-400' :
                    line.type === 'result' ? 'text-blue-400' :
                    'text-gray-300'
                  }`}>
                    {line.text}
                  </span>
                </div>
              ))}
              
              <div className="flex items-center space-x-2 text-yellow-400">
                <div className="animate-spin w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
                <span>🤖 Claude AI analyzing repository code and structure...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
