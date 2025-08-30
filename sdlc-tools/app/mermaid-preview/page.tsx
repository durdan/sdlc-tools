"use client";

import Navbar from "@/components/Navbar";
import MermaidEditor from "@/components/MermaidEditor";

export default function MermaidPreviewPage() {
  return (
    <main className="h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      {/* Page Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Mermaid Preview Panel</h1>
          <p className="text-gray-600 mt-1">
            Real-time Mermaid diagram editor with zoom, pan, and export functionality
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <MermaidEditor />
      </div>
    </main>
  );
}