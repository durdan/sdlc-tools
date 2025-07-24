# sdlc.dev - AI-Powered Development Platform

🚀 **Transform ideas into production-ready web applications with the power of AI**

sdlc.dev is an intelligent development platform that bridges the gap between concept and code. Simply describe what you want to build, and watch as our AI creates fully functional web applications, complete with modern UI, interactive features, and clean code.

## ✨ What sdlc.dev Does

### 🎯 **Current Features**
- **Text-to-Code Generation**: Describe your web app idea in plain English, and our AI builds it for you
- **Interactive Development**: Real-time preview and iteration of your applications
- **Modern Tech Stack**: Built with Next.js, React, TypeScript, and Tailwind CSS
- **Clean, Minimal UI**: Professional interface inspired by Claude's design philosophy
- **Instant Deployment**: Preview your applications immediately in isolated sandboxes

### 🔮 **Coming Soon: GitHub Digest Feature**
- **Repository Analysis**: Connect your GitHub repos for comprehensive code analysis
- **AI-Powered Insights**: Get intelligent recommendations and code quality assessments
- **Onboarding Guides**: Automatically generated documentation for new team members
- **Security & Quality Reports**: Detailed analysis of vulnerabilities and best practices

## 🎨 **How It Works**

1. **Describe Your Vision** - Tell us what kind of web application you want to build
2. **AI Does the Heavy Lifting** - Our advanced AI understands your requirements and generates clean, modern code
3. **Instant Preview** - See your application come to life in real-time
4. **Iterate & Refine** - Make changes and improvements with natural language
5. **Deploy & Share** - Your application is ready to use immediately

**Example prompts that work great:**
- "Build a task management app with drag-and-drop functionality"
- "Create a portfolio website with a contact form and project gallery"
- "Make a weather dashboard with location-based forecasts"
- "Build a simple e-commerce product catalog with filtering"

Thank you for checking out sdlc.dev! 🙏 We're excited to see what you'll build.

## 🏗️ **Technical Architecture**

sdlc.dev is built with modern, production-ready technologies:

- **Frontend**: Next.js 14 with React 18 and TypeScript
- **Styling**: Tailwind CSS for clean, responsive design
- **AI Engine**: Anthropic's Claude SDK for intelligent code generation
- **Sandboxes**: Daytona workspaces for secure, isolated development environments
- **Code Quality**: ESLint, TypeScript strict mode, and automated testing

### 🔒 **Security & Privacy**
- All code generation happens in isolated Daytona sandboxes
- No persistent storage of your generated code
- Secure API key management
- Rate limiting and abuse protection

## Getting Started

Before you begin, please make sure to **replace the API keys** in your `.env` file:

- Get your Anthropic API key from: [Anthropic Console](https://console.anthropic.com/dashboard)
- Get your Daytona API key from: [Daytona Dashboard](https://www.daytona.io/)

Add these keys to your `.env` file as follows:

``` .env
ANTHROPIC_API_KEY=your_anthropic_api_key
DAYTONA_API_KEY=your_daytona_api_key
```

## Install & Run

From the `sdlc-tools` directory, install all dependencies and start the development server:


```bash
cd sdlc-tools

npm install
npm run dev
```

This will launch the app locally (by default at http://localhost:3000).

