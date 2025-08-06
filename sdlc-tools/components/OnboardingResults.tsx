'use client'

import React, { useState } from 'react'
import { Download, FileText, Code, Database, Lightbulb, Rocket, BarChart3, Copy, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface OnboardingResultsProps {
  results: {
    onboardingGuide: string
    technicalAnalysis: string
    recommendations: string[]
    metadata?: {
      analysisType: string
      setupInstructions?: string
      keyInsights?: string[]
      timestamp: string
    }
  }
  repositoryName: string
  onClose: () => void
}

export default function OnboardingResults({ results, repositoryName, onClose }: OnboardingResultsProps) {
  const [activeTab, setActiveTab] = useState('guide')
  const [copied, setCopied] = useState(false)

  const handleCopyToClipboard = async () => {
    const fullContent = `# ${repositoryName} - Onboarding Analysis

${results.onboardingGuide}

${results.technicalAnalysis}

## Recommendations
${results.recommendations.map(rec => `• ${rec}`).join('\n')}

---
Generated on ${new Date(results.metadata?.timestamp || Date.now()).toLocaleString()}
Analysis Type: ${results.metadata?.analysisType || 'Standard'}
`
    
    try {
      await navigator.clipboard.writeText(fullContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      // Import jsPDF dynamically to avoid SSR issues
      const { jsPDF } = await import('jspdf')
      
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      const maxWidth = pageWidth - 2 * margin
      let yPosition = margin

      // Helper function to add text with word wrapping
      const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
        doc.setFontSize(fontSize)
        doc.setFont('helvetica', isBold ? 'bold' : 'normal')
        
        const lines = doc.splitTextToSize(text, maxWidth)
        
        // Check if we need a new page
        if (yPosition + (lines.length * fontSize * 0.5) > pageHeight - margin) {
          doc.addPage()
          yPosition = margin
        }
        
        doc.text(lines, margin, yPosition)
        yPosition += lines.length * fontSize * 0.5 + 5
      }

      // Add title
      addText(`${repositoryName} - AI-Enhanced Onboarding Analysis`, 18, true)
      yPosition += 10

      // Add metadata
      addText(`Generated: ${new Date(results.metadata?.timestamp || Date.now()).toLocaleString()}`, 10)
      addText(`Analysis Type: ${results.metadata?.analysisType || 'Standard'}`, 10)
      yPosition += 10

      // Add onboarding guide
      addText('ONBOARDING GUIDE', 14, true)
      addText(results.onboardingGuide.replace(/[#*`]/g, ''), 11)
      yPosition += 10

      // Add technical analysis
      addText('TECHNICAL ANALYSIS', 14, true)
      addText(results.technicalAnalysis.replace(/[#*`]/g, ''), 11)
      yPosition += 10

      // Add recommendations
      addText('RECOMMENDATIONS', 14, true)
      results.recommendations.forEach(rec => {
        addText(`• ${rec.replace(/[#*`•]/g, '')}`, 11)
      })

      // Save the PDF
      doc.save(`${repositoryName.replace('/', '_')}_onboarding_analysis.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  const tabs = [
    { id: 'guide', label: 'Onboarding Guide', icon: Rocket },
    { id: 'technical', label: 'Technical Analysis', icon: BarChart3 },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {repositoryName} Analysis
              </h2>
              <p className="text-sm text-gray-600">
                {results.metadata?.analysisType === 'claude_enhanced_analysis' ? 
                  '🤖 AI-Enhanced Analysis' : 
                  'Standard Analysis'
                } • Generated {new Date(results.metadata?.timestamp || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyToClipboard}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              title="Copy to clipboard"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm">Download PDF</span>
            </button>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {activeTab === 'guide' && (
              <div className="p-6">
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={tomorrow}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-lg"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                            {children}
                          </code>
                        )
                      },
                      h1: ({ children }) => (
                        <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8 flex items-center">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-6">
                          {children}
                        </h3>
                      ),
                      ul: ({ children }) => (
                        <ul className="space-y-2 mb-4">
                          {children}
                        </ul>
                      ),
                      li: ({ children }) => (
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{children}</span>
                        </li>
                      ),
                      p: ({ children }) => (
                        <p className="mb-4 text-gray-700 leading-relaxed">
                          {children}
                        </p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900">
                          {children}
                        </strong>
                      )
                    }}
                  >
                    {results.onboardingGuide}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {activeTab === 'technical' && (
              <div className="p-6">
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={tomorrow}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-lg"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                            {children}
                          </code>
                        )
                      },
                      h1: ({ children }) => (
                        <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">
                          {children}
                        </h2>
                      ),
                      ul: ({ children }) => (
                        <ul className="space-y-2 mb-4">
                          {children}
                        </ul>
                      ),
                      li: ({ children }) => (
                        <li className="flex items-start space-x-2">
                          <span className="text-purple-500 mt-1">•</span>
                          <span>{children}</span>
                        </li>
                      )
                    }}
                  >
                    {results.technicalAnalysis}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {activeTab === 'recommendations' && (
              <div className="p-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Developer Recommendations
                      </h3>
                    </div>
                    
                    <div className="grid gap-4">
                      {results.recommendations.map((recommendation, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-800 leading-relaxed">
                                {recommendation.replace(/^[•\-\*]\s*/, '')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Insights */}
                  {results.metadata?.keyInsights && results.metadata.keyInsights.length > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
                          <Code className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          Key Developer Insights
                        </h3>
                      </div>
                      
                      <div className="grid gap-3">
                        {results.metadata.keyInsights.map((insight, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">💡</span>
                              </div>
                              <p className="text-gray-800 text-sm leading-relaxed">
                                {insight}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Analysis completed successfully</span>
              {results.metadata?.analysisType === 'claude_enhanced_analysis' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  🤖 AI-Enhanced
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              Generated at {new Date(results.metadata?.timestamp || Date.now()).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
