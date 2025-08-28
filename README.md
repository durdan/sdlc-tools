# Lovable Clone with Claude Code SDK

A clone implementation that uses the Claude Code SDK to generate and manage code in isolated environments.

## Features

- **AI-Powered Code Generation**: Uses Claude Code SDK for intelligent code generation
- **Isolated Sandboxes**: Creates code in isolated environments using Daytona workspaces
- **Preview Integration**: Live preview functionality for generated applications
- **Web Interface**: Clean web interface for code generation and management

## Project Structure

- `sdlc-tools/` - Main web application built with Next.js
- `generateWithClaudeCode.ts` - Core Claude Code SDK integration
- `scripts/` - Utility scripts for sandbox management and preview functionality

## Getting Started

### Prerequisites

- Node.js 18+
- Claude Code SDK API access
- Daytona account for workspace management

### Installation

```bash
npm install
```

### Usage

The project provides a web interface where users can submit prompts for code generation. The system uses the Claude Code SDK to generate code in isolated Daytona workspaces, allowing for safe execution and preview of generated applications.

## Documentation

Additional documentation can be found in the `document/` directory, including detailed implementation guides and API documentation.