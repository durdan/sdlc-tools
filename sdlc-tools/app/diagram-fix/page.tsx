"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

interface HealingMessage {
  type: "progress" | "complete" | "error";
  content?: string;
  healedDiagram?: string;
  changes?: string;
  originalDiagram?: string;
  error?: string;
}

export default function DiagramFixPage() {
  const [diagramCode, setDiagramCode] = useState(`graph TD
    A[Start] -> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`);
  
  const [isHealing, setIsHealing] = useState(false);
  const [healedDiagram, setHealedDiagram] = useState<string>("");
  const [changes, setChanges] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const healDiagram = async () => {
    setIsHealing(true);
    setError(null);
    setHealedDiagram("");
    setChanges("");
    setShowComparison(false);

    try {
      const response = await fetch("/api/heal-diagram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          diagramCode,
          errorContext: "User requested AI healing of diagram code"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to heal diagram");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              setIsHealing(false);
              break;
            }

            try {
              const message = JSON.parse(data) as HealingMessage;
              
              if (message.type === "error") {
                throw new Error(message.error);
              } else if (message.type === "complete") {
                setHealedDiagram(message.healedDiagram || diagramCode);
                setChanges(message.changes || "No changes detected");
                setShowComparison(true);
                setIsHealing(false);
              }
            } catch (e) {
              // Ignore parse errors for progress messages
            }
          }
        }
      }
    } catch (err: any) {
      console.error("Error healing diagram:", err);
      setError(err.message || "An error occurred");
      setIsHealing(false);
    }
  };

  const applyHealedDiagram = () => {
    setDiagramCode(healedDiagram);
    setShowComparison(false);
    setHealedDiagram("");
    setChanges("");
  };

  const highlightChanges = (original: string, corrected: string) => {
    const originalLines = original.split('\n');
    const correctedLines = corrected.split('\n');
    
    return correctedLines.map((line, index) => {
      const originalLine = originalLines[index] || '';
      const isChanged = line !== originalLine;
      
      return (
        <div 
          key={index} 
          className={`${isChanged ? 'bg-green-900/30 border-l-2 border-l-green-500 pl-2' : ''}`}
        >
          {line || '\u00A0'} {/* non-breaking space for empty lines */}
        </div>
      );
    });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI Diagram Healing
            </h1>
            <p className="text-gray-600">
              Fix malformed Mermaid diagrams using AI. Paste your diagram code below and click "Fix with AI" to automatically correct syntax errors.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Diagram Code
                </h2>
                <button
                  onClick={healDiagram}
                  disabled={isHealing || !diagramCode.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  {isHealing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Healing...
                    </>
                  ) : (
                    <>
                      🔧 Fix with AI
                    </>
                  )}
                </button>
              </div>

              <textarea
                value={diagramCode}
                onChange={(e) => setDiagramCode(e.target.value)}
                placeholder="Enter your Mermaid diagram code here..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isHealing}
              />

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 font-medium">Error</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              )}
            </div>

            {/* Preview Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Diagram Preview
              </h2>
              
              <div className="border border-gray-300 rounded-lg bg-white min-h-64 flex items-center justify-center">
                {diagramCode.trim() ? (
                  <div className="text-center p-8">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        📊
                      </div>
                      <p className="text-gray-600">
                        Mermaid diagram would render here
                      </p>
                      <p className="text-gray-500 text-sm mt-2">
                        (Preview functionality would require mermaid.js integration)
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs text-left max-w-md">
                      {diagramCode.split('\n').map((line, index) => (
                        <div key={index}>{line || '\u00A0'}</div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Enter diagram code to see preview</p>
                )}
              </div>
            </div>
          </div>

          {/* Comparison Section */}
          {showComparison && healedDiagram && (
            <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  AI Healing Results
                </h3>
                <button
                  onClick={applyHealedDiagram}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Apply Fixed Version
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Original Code</h4>
                  <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm font-mono overflow-x-auto">
                    <code>{diagramCode}</code>
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    Fixed Code
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Corrected
                    </span>
                  </h4>
                  <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm font-mono overflow-x-auto">
                    <code className="text-gray-900">
                      {highlightChanges(diagramCode, healedDiagram)}
                    </code>
                  </pre>
                </div>
              </div>

              {changes && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Changes Made</h4>
                  <div className="text-blue-800 text-sm whitespace-pre-wrap">
                    {changes}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Example Diagrams */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Example Malformed Diagrams
            </h3>
            <p className="text-gray-600 mb-6">
              Try these examples to see how AI can fix common Mermaid syntax errors:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => setDiagramCode(`graph
A -> B
B -> C`)}
                className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h4 className="font-medium text-gray-900 mb-2">Missing Direction</h4>
                <p className="text-sm text-gray-600 mb-2">Graph without TD/LR direction</p>
                <code className="text-xs bg-gray-100 p-1 rounded">graph\nA -&gt; B...</code>
              </button>

              <button
                onClick={() => setDiagramCode(`flowchart TD
A --> B{Is it working?
B -> C[Yes]
B -> D[No]`)}
                className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h4 className="font-medium text-gray-900 mb-2">Missing Bracket</h4>
                <p className="text-sm text-gray-600 mb-2">Unclosed decision node</p>
                <code className="text-xs bg-gray-100 p-1 rounded">B{Is it working?...</code>
              </button>

              <button
                onClick={() => setDiagramCode(`sequenceDiagram
User -> Server: Request
Server -> Database: Query
Database -> Server: Response
Server -> User: Response`)}
                className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h4 className="font-medium text-gray-900 mb-2">Wrong Arrow Type</h4>
                <p className="text-sm text-gray-600 mb-2">Using -> instead of ->> in sequence</p>
                <code className="text-xs bg-gray-100 p-1 rounded">User -&gt; Server...</code>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}