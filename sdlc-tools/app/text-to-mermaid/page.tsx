"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import TextToMermaidModal from "@/components/TextToMermaidModal";

export default function TextToMermaidPage() {
  const [isMermaidModalOpen, setIsMermaidModalOpen] = useState(true);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center w-full">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Text to Mermaid Diagrams
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your natural language descriptions into beautiful Mermaid diagrams using AI
          </p>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Detection</h3>
              <p className="text-gray-600">AI automatically detects the best diagram type based on your description</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multiple Types</h3>
              <p className="text-gray-600">Support for flowcharts, sequence diagrams, class diagrams, and more</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Copy & Use</h3>
              <p className="text-gray-600">Easily copy the generated Mermaid code for use in your projects</p>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => setIsMermaidModalOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg"
          >
            Start Creating Diagrams
          </button>

          {/* Example descriptions */}
          <div className="mt-12 text-left max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Example descriptions to try:</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                "Create a flowchart showing the user login process with email validation and error handling"
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                "Show a sequence diagram for ordering food at a restaurant between customer, waiter, and kitchen"
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                "Design a class diagram for a simple e-commerce system with users, products, and orders"
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Text to Mermaid Modal */}
      <TextToMermaidModal
        isOpen={isMermaidModalOpen}
        onClose={() => setIsMermaidModalOpen(false)}
      />
    </main>
  );
}