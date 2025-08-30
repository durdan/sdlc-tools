"use client";

import { useState } from "react";
import ResizableSplitView from "./ResizableSplitView";
import MermaidPreviewPanel from "./MermaidPreviewPanel";

const DEFAULT_MERMAID_CONTENT = `graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]
    
    style A fill:#e1f5fe
    style E fill:#c8e6c9
    style B fill:#fff3e0
    style D fill:#ffebee`;

export default function MermaidEditor() {
  const [content, setContent] = useState(DEFAULT_MERMAID_CONTENT);

  const editorPanel = (
    <div className="flex flex-col h-full">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-700">Mermaid Editor</h2>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Lines: {content.split('\n').length}</span>
          <span>•</span>
          <span>Chars: {content.length}</span>
        </div>
      </div>
      
      {/* Editor */}
      <div className="flex-1 relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full p-4 font-mono text-sm border-0 resize-none focus:outline-none"
          placeholder="Enter Mermaid diagram syntax here..."
          spellCheck={false}
        />
        
        {/* Line numbers background */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-50 border-r border-gray-200 pointer-events-none">
          <div className="p-4 pt-4">
            {Array.from({ length: content.split('\n').length }, (_, i) => (
              <div key={i} className="text-xs text-gray-400 leading-5 font-mono">
                {i + 1}
              </div>
            ))}
          </div>
        </div>
        
        <style jsx>{`
          textarea {
            padding-left: 3.5rem;
          }
        `}</style>
      </div>
      
      {/* Editor Footer */}
      <div className="p-2 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Mermaid Syntax</span>
          <div className="flex gap-4">
            <button
              onClick={() => setContent(DEFAULT_MERMAID_CONTENT)}
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              Reset to example
            </button>
            <button
              onClick={() => setContent("")}
              className="text-red-600 hover:text-red-700 hover:underline"
            >
              Clear all
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const previewPanel = (
    <MermaidPreviewPanel content={content} />
  );

  return (
    <div className="h-full w-full">
      <ResizableSplitView
        leftPanel={editorPanel}
        rightPanel={previewPanel}
        defaultSizes={[40, 60]}
        minSizes={[25, 25]}
        direction="horizontal"
      />
    </div>
  );
}