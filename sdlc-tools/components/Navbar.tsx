import React from "react";

export default function Navbar() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
      {/* Logo & main navigation */}
      <div className="flex items-center gap-10">
        <a
          href="/"
          className="flex items-center gap-2 text-2xl font-semibold text-white hover:opacity-90 transition-opacity"
        >
          {/* Simple tech-focused logo */}
          <span className="inline-block w-6 h-6 rounded bg-blue-600" />
          sdlc.dev
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
          <a href="/generate" className="hover:text-white transition-colors">
            Generate
          </a>
          <a href="/github" className="hover:text-white transition-colors">
            GitHub Analysis
          </a>
          <a href="/text-to-mermaid" className="hover:text-white transition-colors">
            Text to Mermaid
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Docs
          </a>
        </div>
      </div>

      {/* Auth buttons */}
      <div className="flex items-center gap-4 text-sm">
        <a
          href="#"
          className="text-gray-300 hover:text-white transition-colors"
        >
          Sign in
        </a>
        <a
          href="#"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Start building
        </a>
      </div>
    </nav>
  );
}
