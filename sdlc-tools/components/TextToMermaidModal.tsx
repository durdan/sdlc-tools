"use client";

import React, { useState, useEffect } from "react";

interface TextToMermaidModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MermaidResult {
  mermaidCode: string;
  description: string;
  timestamp: string;
}

export default function TextToMermaidModal({ isOpen, onClose }: TextToMermaidModalProps) {
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MermaidResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/text-to-mermaid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate Mermaid diagram");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (result?.mermaidCode) {
      navigator.clipboard.writeText(result.mermaidCode);
    }
  };

  const handleReset = () => {
    setDescription("");
    setResult(null);
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Load mermaid library when modal opens and result is available
  useEffect(() => {
    if (isOpen && result?.mermaidCode && typeof window !== 'undefined') {
      // Dynamically import mermaid
      import('mermaid').then((mermaid) => {
        mermaid.default.initialize({ 
          startOnLoad: true,
          theme: 'default',
          securityLevel: 'loose',
        });
        
        // Re-render the diagram
        setTimeout(() => {
          const element = document.getElementById('mermaid-diagram');
          if (element) {
            element.innerHTML = result.mermaidCode;
            mermaid.default.init(undefined, element);
          }
        }, 100);
      });
    }
  }, [isOpen, result]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Text to Mermaid</h2>
            <p className="text-gray-600 mt-1">Convert natural language descriptions into Mermaid diagrams</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Input */}
          <div className="w-1/2 p-6 flex flex-col border-r border-gray-200">
            <div className="flex-1 flex flex-col">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Describe your diagram
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Example: Create a flowchart showing the login process with email validation, password checking, and error handling..."
                className="flex-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-gray-900 placeholder-gray-500"
                disabled={isLoading}
              />
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={!description.trim() || isLoading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Generate Diagram
                  </>
                )}
              </button>
              
              {result && (
                <button
                  onClick={handleReset}
                  className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Right Panel - Output */}
          <div className="w-1/2 p-6 flex flex-col">
            {result ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Generated Diagram</h3>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Code
                  </button>
                </div>

                {/* Mermaid Diagram Preview */}
                <div className="flex-1 border border-gray-200 rounded-lg overflow-auto bg-white p-4">
                  <div
                    id="mermaid-diagram"
                    className="w-full h-full flex items-center justify-center"
                  >
                    {/* Diagram will be rendered here by mermaid.js */}
                  </div>
                </div>

                {/* Mermaid Code */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mermaid Code
                  </label>
                  <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm overflow-auto max-h-32">
                    <code className="text-gray-800">{result.mermaidCode}</code>
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-lg">Your diagram will appear here</p>
                  <p className="text-sm mt-2">Enter a description and click "Generate Diagram"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}