# 🚀 SDLC Tools - AI-Enhanced Repository Onboarding System

**Transform GitHub repository analysis with the power of AI**

SDLC Tools is an intelligent repository analysis platform that provides comprehensive, AI-powered onboarding and technical analysis for GitHub repositories. Get deep insights, beautiful documentation, and actionable recommendations for any codebase.

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/durdan/sdlc-tools)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Claude AI](https://img.shields.io/badge/Claude-AI%20Powered-orange)](https://www.anthropic.com/)

## ✨ Features

### 🧠 **AI-Powered Analysis**
- **Claude Code SDK Integration**: Real AI analysis of repository code and structure
- **Deep Architecture Analysis**: Identifies design patterns, frameworks, and architectural decisions
- **Data Model Detection**: Comprehensive analysis of database schemas (Prisma, SQL, etc.)
- **Feature Discovery**: AI identifies application capabilities and main features
- **Technology Stack Recognition**: Automatic detection of frameworks, libraries, and tools

### 📊 **Comprehensive Repository Insights**
- **Language Distribution**: Detailed breakdown of codebase composition
- **Project Structure Analysis**: Understanding of directory organization and file relationships
- **Key File Analysis**: Deep dive into README, package.json, configuration files
- **Development Patterns**: Recognition of coding standards and best practices
- **Repository Health Metrics**: Activity levels, community engagement, and maintenance status

### 🎨 **Professional UI & Export**
- **Beautiful Interface**: Modern, responsive design with tabbed navigation
- **Markdown Rendering**: Rich formatting with syntax highlighting for code blocks
- **PDF Export**: Generate professional analysis reports for sharing and documentation
- **Copy-to-Clipboard**: Easy sharing of analysis results
- **Real-time Progress**: Streaming updates during analysis with terminal-style feedback

## 🎯 **How It Works**

1. **Connect GitHub** - Sign in with your GitHub account to access your repositories
2. **Select Repository** - Choose any public or private repository for analysis
3. **AI Analysis** - Claude AI performs deep code analysis, architecture review, and feature detection
4. **Rich Insights** - Get comprehensive onboarding guides, technical analysis, and recommendations
5. **Export & Share** - Download professional PDF reports or copy analysis to clipboard

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+ and npm
- GitHub account for repository analysis
- Claude API key for AI-powered analysis

### Installation

```bash
# Clone the repository
git clone https://github.com/durdan/sdlc-tools.git
cd sdlc-tools

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Configuration

Create a `.env.local` file with the following variables:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# GitHub OAuth (for repository access)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Claude AI API (for code analysis)
ANTHROPIC_API_KEY=your_claude_api_key
```

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App with:
   - **Application name**: SDLC Tools
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3. Copy the Client ID and Client Secret to your `.env.local`

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

## 📖 **Usage**

### Repository Analysis

1. **Sign In**: Click "Connect with GitHub" to authenticate
2. **Select Repository**: Choose from your available repositories
3. **Start Analysis**: Click "Generate Onboarding" to begin AI analysis
4. **View Results**: Explore the comprehensive analysis in three tabs:
   - **Onboarding Guide**: Setup instructions and project overview
   - **Technical Analysis**: Architecture, patterns, and metrics
   - **Recommendations**: AI-powered suggestions for developers
5. **Export**: Download as PDF or copy to clipboard

### Sample Analysis Output

```markdown
# 🚀 AI-Enhanced Developer Onboarding Guide
*Comprehensive Analysis for username/repository*

## 📋 Project Overview
**Primary Language:** TypeScript
**🎯 Key Features:**
- React-based web application
- Prisma database integration
- Authentication system
- API endpoints with validation

## 🏗️ Architecture & Design Patterns
- Component-based architecture with React
- Server-side rendering with Next.js
- Database ORM with Prisma
- RESTful API design

## 🗄️ Data Model & Database Schema
- User authentication and profiles
- Relational data structure
- Migration-based schema management

## 🚀 Developer Setup Guide
```bash
git clone https://github.com/username/repository.git
cd repository
npm install
npx prisma generate
npx prisma db push
npm run dev
```
```

## 🏗️ **Technical Architecture**

### Core Technologies
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with responsive design
- **Authentication**: NextAuth.js with GitHub OAuth
- **AI Analysis**: Anthropic Claude Code SDK
- **UI Components**: Custom components with Lucide icons
- **PDF Generation**: jsPDF for report export
- **Markdown**: React-markdown with syntax highlighting

### Project Structure
```
sdlc-tools/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth configuration
│   │   └── github/        # GitHub integration APIs
│   ├── github/            # GitHub analysis page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── OnboardingResults.tsx  # Enhanced results display
│   └── SessionProvider.tsx    # Auth session provider
├── lib/                   # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── github.ts         # GitHub API service
│   └── repository-onboarding.ts  # AI analysis service
└── types/                 # TypeScript type definitions
```

### API Endpoints

#### Authentication
- `GET /api/auth/[...nextauth]` - NextAuth.js authentication
- `POST /api/auth/callback/github` - GitHub OAuth callback

#### GitHub Integration
- `GET /api/github/repos` - Fetch user repositories
- `POST /api/github/analyze` - Analyze repository (basic)
- `POST /api/github/onboarding` - AI-enhanced onboarding analysis

## 🤝 **Contributing**

We welcome contributions! Here's how to get started:

### Development Workflow

1. **Fork & Clone**
   ```bash
   git clone https://github.com/your-username/sdlc-tools.git
   cd sdlc-tools
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Set Up Environment**
   ```bash
   cp .env.example .env.local
   # Configure your environment variables
   ```

5. **Make Changes & Test**
   ```bash
   npm run dev
   npm run lint
   npm run type-check
   ```

6. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   git push origin feature/amazing-feature
   ```

7. **Create Pull Request**

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Follow the configured rules
- **Prettier**: Code formatting
- **Conventional Commits**: Use semantic commit messages
- **Testing**: Add tests for new features

### Areas for Contribution
- 🐛 **Bug Fixes**: Report and fix issues
- ✨ **Features**: Add new analysis capabilities
- 📚 **Documentation**: Improve guides and examples
- 🎨 **UI/UX**: Enhance the user interface
- 🔧 **Performance**: Optimize analysis speed
- 🌐 **Integrations**: Add support for more platforms

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Anthropic Claude**: For providing the AI analysis capabilities
- **GitHub**: For the comprehensive repository API
- **Next.js Team**: For the excellent React framework
- **Vercel**: For deployment and hosting solutions
- **Open Source Community**: For the amazing libraries and tools

## 📞 **Support**

- 🐛 **Issues**: [GitHub Issues](https://github.com/durdan/sdlc-tools/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/durdan/sdlc-tools/discussions)
- 📧 **Email**: [support@sdlc.dev](mailto:support@sdlc.dev)

## 🗺️ **Roadmap**

### Current Features ✅
- AI-powered repository analysis
- Professional UI with PDF export
- GitHub OAuth integration
- Real-time analysis progress
- Comprehensive technical insights

### Coming Soon 🚧
- **Multi-language Support**: Analysis for Python, Java, Go, etc.
- **Team Collaboration**: Share analyses with team members
- **Integration APIs**: Webhook support for CI/CD
- **Advanced Metrics**: Code quality scores and trends
- **Custom Templates**: Personalized onboarding templates
- **Bulk Analysis**: Process multiple repositories

### Future Vision 🔮
- **AI Code Reviews**: Automated pull request analysis
- **Security Scanning**: Vulnerability detection and fixes
- **Performance Insights**: Code optimization suggestions
- **Documentation Generation**: Auto-generated API docs
- **Learning Paths**: Personalized developer education

---

**Made with ❤️ by the SDLC Tools team**

*Transforming repository analysis with the power of AI*
