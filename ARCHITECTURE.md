# System Architecture

## Overview

This is a Lovable.dev clone that uses the Claude Code SDK to generate code in isolated environments. The system creates websites dynamically based on user prompts and provides live previews through sandboxed Daytona environments.

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │───▶│   Next.js API   │───▶│   Claude Code   │
│    (React)      │    │    Routes       │    │      SDK        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │     Daytona     │
                       │   Sandbox API   │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Generated Code │
                       │   Environment   │
                       └─────────────────┘
```

## Core Components

### 1. Frontend Application (`sdlc-tools/`)

**Technology Stack:**
- Next.js 14 with App Router
- React 18 with TypeScript
- Tailwind CSS for styling
- NextAuth.js for authentication

**Key Pages:**
- `app/page.tsx` - Landing page with prompt input
- `app/generate/page.tsx` - Real-time generation interface with split view
- `app/github/page.tsx` - GitHub repository analysis
- `app/onboarding/page.tsx` - Repository onboarding system

### 2. API Layer (`sdlc-tools/app/api/`)

**Core Endpoints:**

- `api/generate-daytona/route.ts` - Main generation endpoint that orchestrates the entire process
- `api/generate/route.ts` - Direct Claude Code generation (legacy)
- `api/github/*` - GitHub integration endpoints for repository analysis
- `api/auth/[...nextauth]/route.ts` - Authentication handling

### 3. Core Libraries (`sdlc-tools/lib/`)

**Claude Code Integration:**
- `claude-code.ts` - Core wrapper for Claude Code SDK
- Configured with comprehensive tool permissions (Read, Write, Edit, Bash, etc.)
- Handles streaming responses and error management

**GitHub Services:**
- `github.ts` - GitHub API integration
- `repository-onboarding.ts` - AI-enhanced repository analysis
- `deep-repo-analyzer.ts` - Deep code analysis and insights

**Authentication:**
- `auth.ts` - NextAuth configuration for GitHub OAuth

### 4. Scripts (`sdlc-tools/scripts/`)

**Daytona Integration:**
- `generate-in-daytona.ts` - Core script that creates sandboxes and runs Claude Code
- `get-preview-url.ts` - Retrieves preview URLs for running applications
- `test-preview-url.ts` - Tests sandbox connectivity
- `remove-sandbox.ts` - Cleanup utility
- `start-dev-server.ts` - Development server management

### 5. Components (`sdlc-tools/components/`)

**UI Components:**
- `Navbar.tsx` - Main navigation
- `MessageDisplay.tsx` - Real-time message rendering
- `OnboardingResults.tsx` - Repository analysis results
- `SessionProvider.tsx` - Authentication context

## Data Flow

### 1. Code Generation Flow

```
User Input (Prompt)
       │
       ▼
Frontend (/generate)
       │
       ▼
API (/api/generate-daytona)
       │
       ▼
Scripts (generate-in-daytona.ts)
       │
       ├─── Create Daytona Sandbox
       ├─── Install Claude Code SDK
       ├─── Generate Code with Claude
       ├─── Install Dependencies
       ├─── Start Dev Server
       └─── Return Preview URL
       │
       ▼
Frontend (Real-time Updates via SSE)
       │
       ▼
User sees Live Preview
```

### 2. Real-time Communication

The system uses **Server-Sent Events (SSE)** for real-time updates:

- `api/generate-daytona/route.ts` streams progress updates
- Frontend receives structured messages:
  - `claude_message` - Assistant responses
  - `tool_use` - Tool executions
  - `progress` - Status updates
  - `complete` - Final preview URL
  - `error` - Error messages

### 3. Sandbox Management

**Daytona Integration:**
- Creates isolated Node.js 20 environments
- Installs Claude Code SDK in each sandbox
- Executes generation scripts with proper environment variables
- Manages preview URLs with authentication tokens
- Provides cleanup and reuse capabilities

## Key Features

### 1. Isolated Code Generation
- Each generation runs in a separate Daytona sandbox
- No interference between different user sessions
- Clean environment for each project

### 2. Real-time Streaming Interface
- Split-screen view with chat on left, preview on right
- Live updates as Claude Code generates files
- Progress tracking with tool usage visibility

### 3. GitHub Repository Analysis
- OAuth integration for private repository access
- AI-powered code structure analysis
- Onboarding guide generation
- Technical recommendations

### 4. Development Server Integration
- Automatic npm/yarn dependency installation
- Dev server startup in background
- Live preview URLs with proper authentication
- Port management and health checking

## Security Considerations

### 1. Authentication
- GitHub OAuth for secure repository access
- NextAuth.js session management
- Environment variable protection

### 2. Sandboxing
- Isolated Daytona environments prevent code interference
- Each user gets a separate sandbox
- Automatic cleanup capabilities

### 3. API Keys
- Secure storage of Anthropic API keys
- Environment variable configuration
- No client-side exposure of sensitive credentials

## Environment Variables

Required environment variables:
```
ANTHROPIC_API_KEY=your_anthropic_key
DAYTONA_API_KEY=your_daytona_key
GITHUB_CLIENT_ID=your_github_oauth_id
GITHUB_CLIENT_SECRET=your_github_oauth_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=your_app_url
```

## File Structure

```
├── sdlc-tools/                 # Main Next.js application
│   ├── app/                    # App router pages and API routes
│   ├── components/             # React components
│   ├── lib/                    # Core business logic
│   ├── scripts/                # Daytona integration scripts
│   └── types/                  # TypeScript definitions
├── document/                   # Documentation
├── CLAUDE.md                   # Project instructions
└── package.json               # Root dependencies
```

## Deployment Architecture

The system is designed to be deployed as:
1. **Web Application** - Next.js app on Vercel/similar platform
2. **Daytona Integration** - Scripts run server-side with API access
3. **External Services** - Relies on Anthropic API and Daytona Cloud

## Future Considerations

### Scalability
- Consider implementing queue system for high-concurrency generation
- Add rate limiting and user session management
- Implement sandbox pooling for faster startup times

### Monitoring
- Add logging and analytics for generation success rates
- Monitor sandbox resource usage and costs
- Track user engagement and feature usage

### Features
- Template system for common project types
- Collaborative editing capabilities
- Version control integration beyond GitHub