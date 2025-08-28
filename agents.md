# 🤖 Code Assistant Agent Context

**Repository**: AI-Enhanced Repository Onboarding System  
**Purpose**: Comprehensive context for code assistants (Claude, Copilot, etc.)  
**Last Updated**: 2025-01-28

## 🎯 Project Overview

This is a **lovable clone platform** built with Claude Code SDK that provides AI-powered code generation and repository analysis in isolated sandbox environments.

### Core Functionality
- **Text-to-Code Generation**: Transform natural language prompts into production-ready code
- **Repository Analysis**: AI-enhanced GitHub repository analysis and onboarding guides  
- **Sandbox Isolation**: Secure code generation using Daytona workspaces
- **Professional UI**: Clean, modern interface with PDF export capabilities

### Key Technologies
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **AI Integration**: Claude Code SDK (@anthropic-ai/claude-code)
- **Sandbox**: Daytona SDK (@daytonaio/sdk)
- **Authentication**: GitHub OAuth
- **Deployment**: Vercel-ready

## 🏗️ Architecture Overview

```
LOVABLE CLONE PLATFORM
├── Root Level (Claude Code SDK Integration)
├── sdlc-tools/ (Main Next.js Application)  
├── document/ (Comprehensive Documentation)
└── scripts/ (Daytona Integration Scripts)
```

### Critical Paths & Files

#### 🔧 Core Integration Files
- `sdlc-tools/lib/claude-code.ts` - **PRIMARY**: Claude SDK integration with tool permissions
- `sdlc-tools/lib/repository-onboarding.ts` - AI repository analysis engine
- `sdlc-tools/lib/github.ts` - GitHub API service layer
- `CLAUDE.md` - Project instructions and developer preferences

#### 🎨 UI Components & Pages  
- `sdlc-tools/app/generate/page.tsx` - Main code generation interface
- `sdlc-tools/app/github/page.tsx` - Repository analysis interface
- `sdlc-tools/components/OnboardingResults.tsx` - Analysis results display
- `sdlc-tools/components/Navbar.tsx` - Navigation with branding

#### 🔌 API Endpoints
- `/api/generate` - Claude Code SDK code generation
- `/api/generate-daytona` - Daytona sandbox generation  
- `/api/github/onboarding` - AI repository analysis
- `/api/github/repos` - Repository listing
- `/api/auth/[...nextauth]` - GitHub OAuth authentication

#### 🏃‍♂️ Daytona Scripts (Isolation Layer)
- `scripts/generate-in-daytona.ts` - Code generation in sandboxes
- `scripts/get-preview-url.ts` - Preview URL generation 
- `scripts/test-preview-url.ts` - **VERIFIED WORKING** - Preview testing
- `scripts/remove-sandbox.ts` - Cleanup operations

## 🧠 AI Integration Details

### Claude Code SDK Configuration
```typescript
// Located in: sdlc-tools/lib/claude-code.ts
allowedTools: [
  "Read", "Write", "Edit", "MultiEdit", 
  "Bash", "LS", "Glob", "Grep", 
  "WebSearch", "WebFetch"
]
maxTurns: 10 // Complex builds supported
```

### Current AI Capabilities
- **Code Generation**: Full-stack application creation
- **Repository Analysis**: Architecture detection, pattern recognition
- **Setup Instructions**: Automated onboarding guide generation  
- **Technical Recommendations**: Best practices and improvements
- **Real-time Streaming**: Progressive analysis updates

## 🔒 Security & Isolation Model

### Sandbox Architecture
- **Daytona Workspaces**: All code generation happens in isolated environments
- **No Direct File Access**: Main application never directly modifies its own code
- **Preview System**: Secure preview URLs for generated applications
- **GitHub OAuth**: Scoped repository access only

### Current Implementation Status
```
✅ Basic Claude SDK integration
✅ Daytona sandbox creation  
✅ Preview URL generation (TESTED & WORKING)
🚧 Isolated code generation (IN PROGRESS)
🔄 Enhanced error handling (PLANNED)
```

## 📝 Development Patterns & Conventions

### Project Preferences (from CLAUDE.md)
- **NO SCRIPT EXECUTION**: Don't run scripts directly - write them and ask for execution
- **Isolated Development**: Code generation must happen in Daytona sandboxes
- **Progressive Enhancement**: Current website functionality → Isolated generation

### Code Standards
- **TypeScript Strict**: Full type safety required
- **Component Patterns**: Modular, reusable React components  
- **API Design**: Consistent JSON responses with proper error handling
- **UI Patterns**: Tailwind CSS with consistent design system
- **Error Handling**: Graceful degradation and user feedback

### File Naming Conventions
- **Pages**: `page.tsx` (Next.js 14 App Router)
- **Components**: PascalCase (`OnboardingResults.tsx`)
- **Libraries**: kebab-case (`claude-code.ts`)  
- **Scripts**: kebab-case (`generate-in-daytona.ts`)
- **API Routes**: `route.ts` (Next.js API routes)

## 🚀 Common Development Tasks

### Adding New Features
1. **Plan**: Design for Daytona isolation first
2. **API**: Create endpoint in `app/api/`
3. **UI**: Build components in `components/`
4. **Integration**: Update navigation and routing
5. **Testing**: Verify in sandbox environment

### Modifying Existing Features
1. **Understand**: Review current implementation patterns
2. **Preserve**: Maintain existing UI/UX consistency  
3. **Enhance**: Follow established architecture patterns
4. **Test**: Verify all integrations still work

### Debugging Common Issues
- **Claude SDK**: Check API key and tool permissions
- **Daytona**: Verify workspace creation and preview URLs
- **GitHub**: Confirm OAuth scopes and repository access
- **UI**: Test responsive design and component interactions

## 🎨 UI/UX Guidelines

### Design System
- **Primary Color**: Orange (#F97316) - Buttons, accents, highlights
- **Background**: Light Gray (#F9FAFB) - Main background  
- **Surface**: White (#FFFFFF) - Cards and components
- **Typography**: Inter font family with clear hierarchy
- **Spacing**: Consistent Tailwind spacing scale

### Component Patterns
- **Navigation**: Fixed navbar with branding and auth
- **Forms**: Clean inputs with proper validation
- **Results**: Tabbed interface for complex data
- **Loading**: Progressive loading states with streaming updates
- **Export**: PDF generation and clipboard functionality

### Responsive Design
- **Mobile-first**: Tailwind responsive breakpoints
- **Accessibility**: WCAG compliant components
- **Performance**: Optimized images and lazy loading

## 📊 Key Metrics & Performance

### Target Performance
- **Code Generation**: 2-5 minutes (complex applications)
- **Repository Analysis**: < 5 minutes per repository
- **UI Responsiveness**: < 2 seconds for all interactions
- **Sandbox Creation**: 30-60 seconds typical

### Monitoring Points
- API endpoint response times
- Claude SDK query performance  
- Daytona workspace creation speed
- UI component render performance
- Error rates and types

## 🔧 Environment & Configuration

### Required Environment Variables
```bash
# Claude AI Integration
ANTHROPIC_API_KEY=sk-ant-...

# GitHub OAuth
GITHUB_CLIENT_ID=github_oauth_client_id  
GITHUB_CLIENT_SECRET=github_oauth_client_secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=secure_random_string

# Daytona Integration  
DAYTONA_API_KEY=daytona_api_key
DAYTONA_SERVER_URL=https://your-daytona-instance.com
```

### Development Setup
```bash
# Root level (Claude Code SDK)
npm install

# Main application
cd sdlc-tools && npm install && npm run dev
```

## 🧪 Testing & Validation

### Automated Testing
- **Preview URLs**: `scripts/test-preview-url.ts` (VERIFIED WORKING)
- **Claude Integration**: Basic functionality tests
- **API Endpoints**: Integration testing for all routes

### Manual Testing Checklist
- [ ] Code generation produces valid applications
- [ ] Repository analysis generates comprehensive guides
- [ ] Daytona sandboxes create and preview successfully  
- [ ] GitHub OAuth flow works correctly
- [ ] PDF export functionality works
- [ ] Mobile responsive design functions properly

## 🚨 Common Pitfalls & Solutions

### Claude Code SDK Issues
- **Tool Permissions**: Ensure all required tools are in allowedTools array
- **API Limits**: Handle rate limiting and quota management
- **Error Handling**: Implement robust error recovery

### Daytona Integration Issues  
- **Workspace Creation**: Verify API keys and server connectivity
- **Preview URLs**: Test generation and accessibility
- **Cleanup**: Ensure proper sandbox lifecycle management

### Next.js Specific Issues
- **App Router**: Use new routing patterns (not Pages Router)
- **API Routes**: Proper error handling and CORS configuration
- **Environment Variables**: Secure handling of sensitive keys

## 📚 External Resources & Dependencies

### Primary Documentation
- [Claude Code SDK](https://docs.anthropic.com/claude/docs) - AI integration
- [Next.js 14](https://nextjs.org/docs) - Application framework
- [Daytona](https://docs.daytona.io/) - Sandbox environments  
- [NextAuth.js](https://next-auth.js.org/) - Authentication

### Key Dependencies
```json
{
  "@anthropic-ai/claude-code": "^1.0.39",
  "@daytonaio/sdk": "^0.21.5", 
  "next": "14.2.3",
  "next-auth": "^4.24.11",
  "react": "^18",
  "typescript": "^5"
}
```

## 🎯 Code Assistant Instructions

### When Helping with This Codebase:

1. **ALWAYS** check `CLAUDE.md` for current project preferences and status
2. **PRIORITIZE** isolation - code generation should happen in Daytona sandboxes
3. **MAINTAIN** existing UI/UX patterns and design consistency
4. **VERIFY** all API integrations (Claude, Daytona, GitHub) before suggesting changes
5. **CONSIDER** security implications of any file system operations
6. **TEST** changes thoroughly, especially preview URL generation
7. **DOCUMENT** any new patterns or significant changes

### Preferred Development Approach:
1. **Understand** current implementation status
2. **Plan** changes within existing architecture  
3. **Implement** with proper error handling
4. **Test** in isolation before integration
5. **Document** changes and reasoning

### Code Generation Best Practices:
- Use TypeScript strict mode
- Follow existing component patterns
- Implement proper error boundaries
- Maintain responsive design principles
- Ensure accessibility compliance

---

**This context provides comprehensive understanding for any code assistant working with this AI-Enhanced Repository Onboarding System. Always refer to the latest code and documentation for the most current implementation details.**