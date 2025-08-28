# 🚀 Repository Onboarding Guide

**Welcome to the AI-Enhanced Repository Onboarding System** - A lovable clone using Claude Code SDK for intelligent code generation and repository analysis.

## 📋 Project Overview

This repository contains a comprehensive AI-powered platform that provides:

1. **Text-to-Code Generation** using Claude Code SDK
2. **GitHub Repository Analysis** with AI-enhanced insights
3. **Isolated Sandbox Environments** via Daytona integration
4. **Professional UI** with PDF export capabilities
5. **Real-time Development** with preview functionality

### 🎯 Core Goals
- Building a lovable clone leveraging Claude Code SDK
- Isolated code generation in sandbox environments (Daytona)
- Professional repository analysis and onboarding guides
- Secure, scalable development platform

## 🏗️ Repository Structure

```
repo/
├── CLAUDE.md                    # Project instructions and preferences
├── ONBOARDING.md               # This comprehensive guide (NEW)
├── agents.md                   # Code assistant context (NEW)
├── document/                   # Project documentation
│   ├── README.md              # Architecture overview
│   ├── daytona-integration-guide.md
│   └── github-digest-implementation-plan.md
├── sdlc-tools/                # Main Next.js application
│   ├── app/                   # Next.js 14 App Router
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # NextAuth.js authentication
│   │   │   ├── generate/     # Code generation endpoint
│   │   │   ├── generate-daytona/ # Daytona sandbox generation
│   │   │   └── github/       # GitHub integration APIs
│   │   ├── generate/         # Code generation UI page
│   │   ├── github/           # Repository analysis page
│   │   ├── onboarding/       # Onboarding results page
│   │   └── layout.tsx        # Root layout
│   ├── components/           # React components
│   │   ├── MessageDisplay.tsx    # Message rendering
│   │   ├── Navbar.tsx           # Navigation
│   │   ├── OnboardingResults.tsx # Analysis results
│   │   └── SessionProvider.tsx   # Auth provider
│   ├── lib/                  # Core libraries
│   │   ├── claude-code.ts    # Claude SDK integration
│   │   ├── github.ts         # GitHub API service
│   │   ├── auth.ts          # NextAuth config
│   │   └── repository-onboarding.ts # AI analysis
│   ├── scripts/             # Utility scripts
│   │   ├── generate-in-daytona.ts   # Daytona code generation
│   │   ├── get-preview-url.ts      # Preview URL retrieval
│   │   ├── test-preview-url.ts     # Preview testing
│   │   └── remove-sandbox.ts       # Sandbox cleanup
│   └── docs/                # API documentation
└── test-claude-code.ts      # Claude SDK testing
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **GitHub account** for repository access
- **Anthropic API key** for Claude AI
- **Daytona account** for sandbox environments

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd repo

# Install root dependencies (Claude Code SDK)
npm install

# Install main application dependencies
cd sdlc-tools
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Configuration

Create `.env.local` in the `sdlc-tools/` directory:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# GitHub OAuth (for repository access)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Claude AI API
ANTHROPIC_API_KEY=your_anthropic_api_key

# Daytona Integration
DAYTONA_API_KEY=your_daytona_api_key
DAYTONA_SERVER_URL=your_daytona_server_url
```

### Start Development

```bash
# From the sdlc-tools directory
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

## 🧠 Core Features & Architecture

### 1. Claude Code SDK Integration
- **File**: `sdlc-tools/lib/claude-code.ts`
- **Purpose**: AI-powered code generation with comprehensive tool access
- **Capabilities**: Read, Write, Edit, MultiEdit, Bash, LS, Glob, Grep, WebSearch, WebFetch

### 2. Daytona Sandbox Integration
- **Files**: 
  - `scripts/generate-in-daytona.ts`
  - `scripts/get-preview-url.ts` 
  - `scripts/test-preview-url.ts`
- **Purpose**: Isolated code generation environments
- **Benefits**: Security, isolation, preview capabilities

### 3. GitHub Repository Analysis
- **File**: `sdlc-tools/lib/repository-onboarding.ts`
- **Purpose**: AI-enhanced repository analysis and onboarding guide generation
- **Features**: 
  - Comprehensive codebase analysis
  - Architecture pattern detection
  - Setup instruction generation
  - Technical recommendations

### 4. Next.js Web Application
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js with GitHub OAuth
- **UI Components**: Custom React components with Lucide icons

## 🔧 Development Workflow

### Current Implementation Status

✅ **Completed Features**:
- Claude Code SDK integration
- Basic web UI with text-to-code generation
- Daytona sandbox creation and preview
- GitHub OAuth authentication
- Repository analysis framework
- Professional UI with PDF export

🚧 **In Progress**:
- Isolated code generation in Daytona environments
- Enhanced repository analysis capabilities
- Improved error handling and user feedback

🔄 **Planned Features**:
- Real-time code generation progress
- Advanced repository insights
- Team collaboration features
- Performance optimizations

### Development Guidelines

1. **Code Generation**: Always happens in isolated Daytona sandboxes
2. **UI Updates**: Follow existing Tailwind CSS patterns
3. **API Design**: Consistent JSON responses with proper error handling
4. **Security**: No direct file system modifications on main application
5. **Testing**: Use provided scripts for validation

## 📚 Key Files to Understand

### Configuration Files
- `CLAUDE.md` - Project goals and preferences
- `sdlc-tools/package.json` - Main application dependencies
- `sdlc-tools/next.config.mjs` - Next.js configuration
- `sdlc-tools/tailwind.config.ts` - Styling configuration

### Core Libraries
- `sdlc-tools/lib/claude-code.ts` - Claude SDK integration
- `sdlc-tools/lib/github.ts` - GitHub API service
- `sdlc-tools/lib/repository-onboarding.ts` - AI analysis engine

### API Endpoints
- `/api/generate` - Code generation with Claude
- `/api/generate-daytona` - Daytona sandbox generation
- `/api/github/repos` - Repository listing
- `/api/github/onboarding` - AI-powered repository analysis

### UI Components
- `app/generate/page.tsx` - Main code generation interface
- `app/github/page.tsx` - Repository analysis interface
- `components/OnboardingResults.tsx` - Analysis results display

## 🛠️ Common Development Tasks

### Adding New Features
1. Plan feature in isolated Daytona environment
2. Implement API endpoints in `app/api/`
3. Create UI components in `components/`
4. Add pages in `app/` directory
5. Update navigation in `components/Navbar.tsx`

### Testing Changes
```bash
# Test Claude Code integration
npm run test:claude-code  # (if script exists)

# Test Daytona preview
cd scripts && npm run test-preview-url

# Run development server
npm run dev
```

### Debugging
- Check browser console for client-side errors
- Review server logs in terminal
- Verify environment variables are set
- Test API endpoints individually

## 🔒 Security Considerations

### Code Generation Security
- All code generation happens in isolated Daytona sandboxes
- No direct file system access on main application
- Repository code processed in secure environments
- API keys managed through environment variables

### Authentication & Access
- GitHub OAuth for repository access
- Scoped permissions for repository operations
- Session-based authentication with NextAuth.js
- Secure token management

## 📈 Performance & Monitoring

### Key Metrics
- **Code Generation Time**: Typical 2-5 minutes
- **Analysis Time**: < 5 minutes per repository
- **UI Responsiveness**: < 2 seconds for interactions
- **Sandbox Creation**: 30-60 seconds

### Monitoring Tools
- Browser DevTools for client-side performance
- Next.js built-in analytics
- Console logging for API operations
- Error boundaries for graceful failure handling

## 🤝 Contributing

### Getting Started
1. Read this onboarding guide thoroughly
2. Set up local development environment
3. Review existing code patterns and conventions
4. Check `CONTRIBUTING.md` for specific guidelines
5. Test changes in Daytona sandboxes before committing

### Code Standards
- **TypeScript**: Strict typing throughout
- **ESLint**: Follow configured rules
- **Prettier**: Consistent code formatting
- **Components**: Modular, reusable React components
- **API Design**: RESTful endpoints with proper error handling

### Pull Request Process
1. Create feature branch from main
2. Implement changes with comprehensive testing
3. Update documentation as needed
4. Submit PR with detailed description
5. Address code review feedback
6. Merge after approval

## 📞 Support & Resources

### Documentation
- `document/README.md` - Architecture overview
- `document/daytona-integration-guide.md` - Daytona integration details
- `sdlc-tools/docs/API.md` - API documentation
- `sdlc-tools/docs/DEPLOYMENT.md` - Deployment guide

### External Resources
- [Claude Code SDK Documentation](https://docs.anthropic.com/claude/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Daytona Documentation](https://docs.daytona.io/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Getting Help
- Check existing documentation first
- Review code comments and patterns
- Test in isolation before integrating
- Ask specific, detailed questions with context

---

**Welcome to the team! 🎉**

This platform represents the future of AI-powered development tools. Take your time to understand the architecture, experiment with the features, and don't hesitate to contribute your ideas for improvement.