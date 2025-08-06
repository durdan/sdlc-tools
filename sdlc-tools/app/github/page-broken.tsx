'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Star, GitFork, Clock, ExternalLink, BarChart3, Shield, FileText, BookOpen, Zap } from 'lucide-react'

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
        // For now, just log the result. Later we'll navigate to a results page
        console.log('Analysis result:', analysisResult)
        alert(`Analysis complete for ${owner}/${repo}! Check the console for results.`)
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

  const startComprehensiveOnboarding = (owner: string, repo: string) => {
    // Navigate to the comprehensive onboarding page
    window.open(`/onboarding?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`, '_blank')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatSize = (sizeInKB: number) => {
    if (sizeInKB < 1024) return `${sizeInKB} KB`
    const sizeInMB = sizeInKB / 1024
    if (sizeInMB < 1024) return `${sizeInMB.toFixed(1)} MB`
    return `${(sizeInMB / 1024).toFixed(1)} GB`
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
            <div className="flex items-center space-x-8">
              <a href="/" className="flex items-center space-x-2 text-xl font-semibold text-gray-900">
                <div className="w-6 h-6 rounded bg-orange-500"></div>
                <span>sdlc.dev</span>
              </a>
              <div className="flex items-center space-x-6">
                <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Home
                </a>
                <a href="/generate" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Generate Code
                </a>
                <a href="/github" className="text-orange-600 font-medium">
                  GitHub Analysis
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your GitHub Repositories
            </h1>
            <p className="text-gray-600">
              Select a repository to analyze with AI-powered insights
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="text-gray-600 hover:text-gray-900 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your repositories...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {repositories.map((repo) => (
              <div
                key={repo.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {repo.name}
                      </h3>
                      {repo.private && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          Private
                        </span>
                      )}
                    </div>
                    
                    {repo.description && (
                      <p className="text-gray-600 mb-3">{repo.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      {repo.language && (
                        <span className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span>{repo.language}</span>
                        </span>
                      )}
                      <span className="flex items-center space-x-1">
                        <Star className="h-4 w-4" />
                        <span>{repo.stargazersCount}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <GitFork className="h-4 w-4" />
                        <span>{repo.forksCount}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Updated {formatDate(repo.updatedAt)}</span>
                      </span>
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
  )
}
