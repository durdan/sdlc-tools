import { GitHubService } from "./github";
import { query } from '@anthropic-ai/claude-code';

interface SDKMessage {
  type: string;
  content?: any;
  message?: {
    content: Array<{
      type: string;
      text?: string;
      tool_use?: any;
    }>;
  };
}

export interface OnboardingResult {
  success: boolean;
  onboardingGuide: string;
  technicalAnalysis: string;
  recommendations: string[];
  error?: string;
  metadata?: {
    analysisType: string;
    setupInstructions?: string;
    keyInsights?: string[];
    timestamp: string;
  };
}

export interface RepositoryAnalysisData {
  repository: any;
  analytics: any;
  codeStructure: any[];
  keyFiles: any[];
}

export class RepositoryOnboardingService {
  private githubService: GitHubService;

  constructor(accessToken: string) {
    this.githubService = new GitHubService(accessToken);
  }

  async generateComprehensiveOnboarding(owner: string, repo: string): Promise<OnboardingResult> {
    try {
      console.log(`[API] Starting AI-enhanced onboarding analysis for ${owner}/${repo}`);
      
      // Get comprehensive repository data
      const repoData = await this.gatherRepositoryData(owner, repo);
      
      // Perform Claude SDK deep code analysis
      const claudeAnalysis = await this.performClaudeCodeAnalysis(repoData, owner, repo);
      
      // Generate comprehensive onboarding guide with Claude insights
      const onboardingGuide = this.generateEnhancedOnboardingGuide(repoData, claudeAnalysis, owner, repo);
      const technicalAnalysis = this.generateEnhancedTechnicalAnalysis(repoData, claudeAnalysis, owner, repo);
      const recommendations = this.generateEnhancedRecommendations(repoData, claudeAnalysis, owner, repo);
      
      return {
        success: true,
        onboardingGuide,
        technicalAnalysis,
        recommendations,
        metadata: {
          analysisType: 'claude_enhanced_analysis',
          setupInstructions: claudeAnalysis.setupInstructions,
          keyInsights: claudeAnalysis.keyInsights,
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('[API] Error in comprehensive onboarding:', error);
      // Fallback to basic analysis if Claude fails
      return this.generateBasicOnboarding(owner, repo, error);
    }
  }

  private async gatherRepositoryData(owner: string, repo: string): Promise<RepositoryAnalysisData> {
    try {
      console.log('[Onboarding] Gathering comprehensive repository data...');
      
      // Get repository information and analytics
      const repository = await this.githubService.getComprehensiveRepoAnalytics(owner, repo);
      
      // Get repository structure
      const tree = await this.githubService.getRepositoryTree(owner, repo);
      const codeStructure = this.analyzeCodeStructure(tree);
      
      // Get key files
      const keyFiles = await this.getKeyFiles(owner, repo, tree);
      
      return {
        repository,
        analytics: repository.analytics, // Analytics are included in comprehensive repo analytics
        codeStructure,
        keyFiles
      };
    } catch (error) {
      console.error('[Onboarding] Error gathering repository data:', error);
      throw error;
    }
  }

  private analyzeCodeStructure(tree: any[]): any[] {
    if (!tree || !Array.isArray(tree)) return [];
    
    return tree.map(item => ({
      path: item.path,
      type: item.type,
      size: item.size || 0,
      language: this.detectLanguage(item.path)
    }));
  }

  private detectLanguage(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'JavaScript',
      'jsx': 'React',
      'ts': 'TypeScript',
      'tsx': 'React TypeScript',
      'py': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'cs': 'C#',
      'php': 'PHP',
      'rb': 'Ruby',
      'go': 'Go',
      'rs': 'Rust',
      'swift': 'Swift',
      'kt': 'Kotlin',
      'dart': 'Dart',
      'vue': 'Vue.js',
      'html': 'HTML',
      'css': 'CSS',
      'scss': 'SCSS',
      'less': 'LESS',
      'json': 'JSON',
      'xml': 'XML',
      'yaml': 'YAML',
      'yml': 'YAML',
      'md': 'Markdown',
      'sql': 'SQL'
    };
    
    return languageMap[ext || ''] || 'Unknown';
  }

  private async getKeyFiles(owner: string, repo: string, tree: any[]): Promise<any[]> {
    const keyFileNames = [
      'README.md', 'README.rst', 'README.txt',
      'package.json', 'requirements.txt', 'Gemfile', 'go.mod', 'Cargo.toml',
      'dockerfile', 'Dockerfile', 'docker-compose.yml',
      'tsconfig.json', 'webpack.config.js', 'vite.config.js',
      '.env.example', '.env.template',
      'CONTRIBUTING.md', 'LICENSE', 'CHANGELOG.md',
      'prisma/schema.prisma', 'schema.prisma'
    ];

    const keyFiles = [];
    
    for (const item of tree) {
      if (keyFileNames.some(name => item.path.toLowerCase().includes(name.toLowerCase()))) {
        try {
          const fileData = await this.githubService.getFileContent(owner, repo, item.path);
          const content = fileData?.content || '';
          keyFiles.push({
            path: item.path,
            content: content.substring(0, 2000), // First 2000 chars for Claude analysis
            type: this.getFileType(item.path),
            insights: this.analyzeFileContent(item.path, content)
          });
        } catch (error) {
          // File might not be accessible, skip
          console.warn(`Could not read file ${item.path}:`, error);
        }
      }
    }

    return keyFiles;
  }

  private getFileType(filename: string): string {
    const name = filename.toLowerCase();
    
    if (name.includes('readme')) return 'documentation';
    if (name.includes('package.json') || name.includes('requirements') || name.includes('gemfile')) return 'dependencies';
    if (name.includes('docker')) return 'containerization';
    if (name.includes('config') || name.includes('tsconfig') || name.includes('webpack')) return 'configuration';
    if (name.includes('test') || name.includes('spec')) return 'testing';
    if (name.includes('contributing') || name.includes('license') || name.includes('changelog')) return 'project_info';
    if (name.includes('schema.prisma')) return 'database_schema';
    
    return 'code';
  }

  private analyzeFileContent(filename: string, content: string): string[] {
    const insights: string[] = [];
    const lowerContent = content.toLowerCase();
    
    if (filename.toLowerCase().includes('readme')) {
      if (lowerContent.includes('installation')) insights.push('Contains installation instructions');
      if (lowerContent.includes('getting started')) insights.push('Has getting started guide');
      if (lowerContent.includes('api')) insights.push('Includes API documentation');
      if (lowerContent.includes('example')) insights.push('Provides examples');
      if (lowerContent.includes('demo')) insights.push('Has demo information');
    }
    
    if (filename === 'package.json') {
      try {
        const pkg = JSON.parse(content);
        if (pkg.scripts) {
          const scripts = Object.keys(pkg.scripts);
          insights.push(`Available scripts: ${scripts.join(', ')}`);
        }
        if (pkg.dependencies) {
          const depCount = Object.keys(pkg.dependencies).length;
          insights.push(`${depCount} dependencies`);
        }
      } catch (error) {
        insights.push('Contains package configuration');
      }
    }
    
    if (filename.includes('schema.prisma')) {
      insights.push('Prisma database schema');
      const modelMatches = content.match(/model\s+(\w+)/g);
      if (modelMatches) {
        insights.push(`Database models: ${modelMatches.length}`);
      }
    }
    
    return insights;
  }

  // Enhanced Claude SDK Analysis Methods
  private async performClaudeCodeAnalysis(repoData: RepositoryAnalysisData, owner: string, repo: string): Promise<any> {
    try {
      console.log('[Claude SDK] Starting deep code analysis...');
      
      // Create comprehensive analysis prompt
      const prompt = this.createDeepAnalysisPrompt(repoData, owner, repo);
      
      const messages: SDKMessage[] = [];
      const abortController = new AbortController();
      
      // Use Claude Code SDK for deep analysis
      for await (const message of query({
        prompt,
        abortController,
        options: { maxTurns: 3 }
      })) {
        messages.push(message);
        console.log('[Claude SDK] Received message:', message.type);
      }
      
      // Extract comprehensive insights
      return this.extractClaudeInsights(messages);
      
    } catch (error) {
      console.error('[Claude SDK] Analysis failed:', error);
      return {
        codeAnalysis: 'Claude analysis unavailable - using GitHub API data only',
        dataModel: 'Data model analysis unavailable',
        architecture: 'Architecture analysis unavailable',
        features: [],
        setupInstructions: 'Standard setup required',
        keyInsights: ['Analysis limited - Claude SDK unavailable']
      };
    }
  }

  private createDeepAnalysisPrompt(repoData: RepositoryAnalysisData, owner: string, repo: string): string {
    const keyFileContents = repoData.keyFiles
      .filter(f => f.content && f.content.length > 0)
      .map(f => `\n## ${f.path}\n${f.content}`)
      .join('\n');
    
    return `Analyze this ${repoData.repository?.repo?.language || 'software'} repository: ${owner}/${repo}

Repository Overview:
- Language: ${repoData.repository?.repo?.language}
- Files: ${repoData.codeStructure.length}
- Description: ${repoData.repository?.repo?.description || 'No description'}

Key Files Content:${keyFileContents}

Please provide a comprehensive developer-focused analysis including:

1. **Code Architecture & Patterns**: Identify architectural patterns, frameworks, and design principles
2. **Data Model Analysis**: Analyze database schema, entity relationships, and data flow
3. **Feature Detection**: Identify main features and application capabilities
4. **Technology Stack**: Detailed breakdown of technologies, frameworks, and tools
5. **Setup Instructions**: Step-by-step developer setup based on actual project structure
6. **Key Developer Insights**: Important things developers should know about this codebase

Focus on actionable insights that help developers understand and contribute to this project effectively.`;
  }

  private extractClaudeInsights(messages: SDKMessage[]): any {
    let codeAnalysis = '';
    let dataModel = '';
    let architecture = '';
    let features: string[] = [];
    let setupInstructions = '';
    let keyInsights: string[] = [];
    
    for (const msg of messages) {
      if (msg.type === 'assistant' && msg.message?.content) {
        for (const content of msg.message.content) {
          if (content.type === 'text' && content.text) {
            const text = content.text;
            
            // Extract different sections based on content
            if (text.toLowerCase().includes('architecture') || text.toLowerCase().includes('pattern')) {
              architecture += text + '\n';
            }
            if (text.toLowerCase().includes('data model') || text.toLowerCase().includes('database') || text.toLowerCase().includes('schema')) {
              dataModel += text + '\n';
            }
            if (text.toLowerCase().includes('feature') || text.toLowerCase().includes('capability')) {
              // Extract features from bullet points or numbered lists
              const featureMatches = text.match(/[-*•]\s*([^\n]+)/g);
              if (featureMatches) {
                features.push(...featureMatches.map(f => f.replace(/[-*•]\s*/, '').trim()));
              }
            }
            if (text.toLowerCase().includes('setup') || text.toLowerCase().includes('install')) {
              setupInstructions += text + '\n';
            }
            if (text.toLowerCase().includes('insight') || text.toLowerCase().includes('important')) {
              const insightMatches = text.match(/[-*•]\s*([^\n]+)/g);
              if (insightMatches) {
                keyInsights.push(...insightMatches.map(i => i.replace(/[-*•]\s*/, '').trim()));
              }
            }
            
            // General code analysis
            codeAnalysis += text + '\n';
          }
        }
      }
    }
    
    return {
      codeAnalysis: codeAnalysis || 'Code analysis completed',
      dataModel: dataModel || 'No specific data model detected',
      architecture: architecture || 'Architecture analysis completed',
      features: features.length > 0 ? features : ['Application features detected'],
      setupInstructions: setupInstructions || 'Standard development setup required',
      keyInsights: keyInsights.length > 0 ? keyInsights : ['Comprehensive analysis completed']
    };
  }

  private generateEnhancedOnboardingGuide(repoData: RepositoryAnalysisData, claudeAnalysis: any, owner: string, repo: string): string {
    const sections: string[] = [];
    
    sections.push('# 🚀 AI-Enhanced Developer Onboarding Guide');
    sections.push(`*Comprehensive Analysis for ${owner}/${repo}*\n`);
    
    // Project Overview with Claude insights
    sections.push('## 📋 Project Overview');
    if (repoData.repository?.repo?.description) {
      sections.push(`**Description:** ${repoData.repository.repo.description}`);
    }
    
    const mainLanguage = repoData.repository?.repo?.language || 'Unknown';
    sections.push(`**Primary Language:** ${mainLanguage}`);
    
    if (claudeAnalysis.features && claudeAnalysis.features.length > 0) {
      sections.push('\n**🎯 Key Features:**');
      claudeAnalysis.features.slice(0, 6).forEach((feature: string) => {
        sections.push(`- ${feature}`);
      });
    }
    
    sections.push('');
    
    // Architecture Analysis
    if (claudeAnalysis.architecture && claudeAnalysis.architecture.length > 50) {
      sections.push('## 🏗️ Architecture & Design Patterns');
      sections.push(claudeAnalysis.architecture.substring(0, 1200));
      sections.push('');
    }
    
    // Data Model Analysis
    if (claudeAnalysis.dataModel && claudeAnalysis.dataModel.length > 50) {
      sections.push('## 🗄️ Data Model & Database Schema');
      sections.push(claudeAnalysis.dataModel.substring(0, 1200));
      sections.push('');
    }
    
    // Enhanced Setup Instructions
    sections.push('## 🚀 Developer Setup Guide');
    if (claudeAnalysis.setupInstructions && claudeAnalysis.setupInstructions.length > 50) {
      sections.push(claudeAnalysis.setupInstructions.substring(0, 1800));
    } else {
      // Fallback to intelligent setup based on detected files
      sections.push('```bash');
      sections.push(`# Clone the repository`);
      sections.push(`git clone https://github.com/${owner}/${repo}.git`);
      sections.push(`cd ${repo}`);
      sections.push('');
      
      if (mainLanguage === 'JavaScript' || mainLanguage === 'TypeScript') {
        sections.push('# Install dependencies');
        sections.push('npm install');
        sections.push('');
        
        // Check for Prisma
        const hasPrisma = repoData.keyFiles?.some(f => f.path.includes('schema.prisma'));
        if (hasPrisma) {
          sections.push('# Setup database (Prisma detected)');
          sections.push('npx prisma generate');
          sections.push('npx prisma db push');
          sections.push('');
        }
        
        sections.push('# Start development server');
        sections.push('npm run dev');
      } else if (mainLanguage === 'Python') {
        sections.push('# Create virtual environment');
        sections.push('python -m venv venv');
        sections.push('source venv/bin/activate  # On Windows: venv\\Scripts\\activate');
        sections.push('');
        sections.push('# Install dependencies');
        sections.push('pip install -r requirements.txt');
      }
      
      sections.push('```');
    }
    
    // Key Insights
    if (claudeAnalysis.keyInsights && claudeAnalysis.keyInsights.length > 0) {
      sections.push('\n## 💡 Key Developer Insights');
      claudeAnalysis.keyInsights.slice(0, 10).forEach((insight: string) => {
        sections.push(`- ${insight}`);
      });
    }
    
    return sections.join('\n');
  }

  private generateEnhancedTechnicalAnalysis(repoData: RepositoryAnalysisData, claudeAnalysis: any, owner: string, repo: string): string {
    const sections: string[] = [];
    
    sections.push('# 🔬 AI-Enhanced Technical Analysis\n');
    
    // Claude Code Analysis
    if (claudeAnalysis.codeAnalysis && claudeAnalysis.codeAnalysis.length > 100) {
      sections.push('## 🧠 AI Code Analysis');
      sections.push(claudeAnalysis.codeAnalysis.substring(0, 2500));
      sections.push('');
    }
    
    // Language Distribution
    const languageStats = this.calculateLanguageStats(repoData.codeStructure);
    if (Object.keys(languageStats).length > 0) {
      sections.push('## 📊 Language & File Distribution');
      Object.entries(languageStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([lang, count]) => {
          const percentage = ((count / repoData.codeStructure.length) * 100).toFixed(1);
          sections.push(`- **${lang}**: ${count} files (${percentage}%)`);
        });
      sections.push('');
    }
    
    // Architecture Details
    if (claudeAnalysis.architecture && claudeAnalysis.architecture.length > 50) {
      sections.push('## 🏛️ Architecture Deep Dive');
      sections.push(claudeAnalysis.architecture.substring(0, 2000));
      sections.push('');
    }
    
    // Data Model Details
    if (claudeAnalysis.dataModel && claudeAnalysis.dataModel.length > 50) {
      sections.push('## 🗃️ Data Model Analysis');
      sections.push(claudeAnalysis.dataModel.substring(0, 1500));
      sections.push('');
    }
    
    // Repository Metrics
    sections.push('## 📈 Repository Health Metrics');
    const totalFiles = repoData.codeStructure.length;
    sections.push(`- **Total Files**: ${totalFiles}`);
    
    if (repoData.repository?.repo) {
      const repo = repoData.repository.repo;
      sections.push(`- **Created**: ${new Date(repo.created_at).toLocaleDateString()}`);
      sections.push(`- **Last Updated**: ${new Date(repo.updated_at).toLocaleDateString()}`);
      if (repo.stargazers_count) sections.push(`- **Community Stars**: ${repo.stargazers_count}`);
      if (repo.forks_count) sections.push(`- **Forks**: ${repo.forks_count}`);
      if (repo.open_issues_count !== undefined) sections.push(`- **Open Issues**: ${repo.open_issues_count}`);
      
      // Calculate activity level
      const daysSinceUpdate = Math.floor((Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24));
      const activityLevel = daysSinceUpdate < 7 ? 'Very Active' : daysSinceUpdate < 30 ? 'Active' : daysSinceUpdate < 90 ? 'Moderate' : 'Low Activity';
      sections.push(`- **Activity Level**: ${activityLevel} (${daysSinceUpdate} days since last update)`);
    }
    
    return sections.join('\n');
  }

  private generateEnhancedRecommendations(repoData: RepositoryAnalysisData, claudeAnalysis: any, owner: string, repo: string): string[] {
    const recommendations: string[] = [];
    
    // Claude-based recommendations
    if (claudeAnalysis.keyInsights && claudeAnalysis.keyInsights.length > 0) {
      recommendations.push('**🤖 AI-Powered Recommendations:**');
      claudeAnalysis.keyInsights.slice(0, 6).forEach((insight: string) => {
        recommendations.push(`• ${insight}`);
      });
      recommendations.push('');
    }
    
    // Setup recommendations
    recommendations.push('**🚀 Setup & Development:**');
    recommendations.push('• Clone the repository and review all README files');
    
    const mainLanguage = repoData.repository?.repo?.language;
    if (mainLanguage === 'JavaScript' || mainLanguage === 'TypeScript') {
      recommendations.push('• Run `npm install` to install all dependencies');
      recommendations.push('• Check package.json for available development scripts');
      
      const framework = this.detectFramework(repoData.keyFiles, mainLanguage);
      if (framework) {
        recommendations.push(`• Familiarize yourself with ${framework} framework patterns`);
      }
    }
    
    // Database recommendations
    const hasPrisma = repoData.keyFiles?.some(f => f.path.includes('schema.prisma'));
    if (hasPrisma || claudeAnalysis.dataModel.includes('prisma')) {
      recommendations.push('');
      recommendations.push('**🗄️ Database & Data Model:**');
      recommendations.push('• Review the Prisma schema for data model understanding');
      recommendations.push('• Run `npx prisma generate` to generate the client');
      recommendations.push('• Study entity relationships and database constraints');
      recommendations.push('• Use `npx prisma studio` to explore the database visually');
    }
    
    // Feature-based recommendations
    if (claudeAnalysis.features && claudeAnalysis.features.length > 0) {
      recommendations.push('');
      recommendations.push('**🎯 Feature Exploration:**');
      claudeAnalysis.features.slice(0, 4).forEach((feature: string) => {
        recommendations.push(`• Explore the ${feature} implementation`);
      });
    }
    
    // Code quality recommendations
    recommendations.push('');
    recommendations.push('**📋 Code Quality & Best Practices:**');
    recommendations.push('• Review the codebase structure and naming conventions');
    recommendations.push('• Check for existing tests and testing patterns');
    recommendations.push('• Look for linting and formatting configurations');
    
    return recommendations;
  }

  private calculateLanguageStats(codeStructure: any[]): { [key: string]: number } {
    const stats: { [key: string]: number } = {};
    
    codeStructure.forEach(item => {
      if (item.type === 'blob' && item.language && item.language !== 'Unknown') {
        stats[item.language] = (stats[item.language] || 0) + 1;
      }
    });
    
    return stats;
  }

  private detectFramework(keyFiles: any[], language: string): string | null {
    if (!keyFiles) return null;
    
    const packageJson = keyFiles.find(f => f.path === 'package.json');
    if (packageJson && packageJson.content) {
      try {
        const pkg = JSON.parse(packageJson.content);
        if (pkg.dependencies) {
          if (pkg.dependencies.react) return 'React';
          if (pkg.dependencies.vue) return 'Vue.js';
          if (pkg.dependencies.angular) return 'Angular';
          if (pkg.dependencies.next) return 'Next.js';
          if (pkg.dependencies.express) return 'Express.js';
          if (pkg.dependencies.fastify) return 'Fastify';
        }
      } catch (error) {
        // Invalid JSON
      }
    }
    
    // Python framework detection
    const requirements = keyFiles.find(f => f.path.includes('requirements'));
    if (requirements && requirements.content) {
      const content = requirements.content.toLowerCase();
      if (content.includes('django')) return 'Django';
      if (content.includes('flask')) return 'Flask';
      if (content.includes('fastapi')) return 'FastAPI';
    }
    
    return null;
  }

  private async generateBasicOnboarding(owner: string, repo: string, error: any): Promise<OnboardingResult> {
    console.log('[Fallback] Generating basic onboarding due to error:', error);
    
    try {
      const repoData = await this.gatherRepositoryData(owner, repo);
      return {
        success: true,
        onboardingGuide: this.generateBasicOnboardingGuide(repoData, owner, repo),
        technicalAnalysis: this.generateBasicTechnicalAnalysis(repoData, owner, repo),
        recommendations: this.generateBasicRecommendations(repoData, owner, repo),
        metadata: {
          analysisType: 'basic_fallback',
          timestamp: new Date().toISOString()
        }
      };
    } catch (fallbackError) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
        onboardingGuide: 'Failed to generate onboarding guide',
        technicalAnalysis: 'Analysis failed',
        recommendations: ['Please try again later']
      };
    }
  }

  // Basic fallback methods
  private generateBasicOnboardingGuide(repoData: RepositoryAnalysisData, owner: string, repo: string): string {
    const sections: string[] = [];
    
    sections.push('# Repository Onboarding Guide');
    sections.push(`*Generated for ${owner}/${repo}*\n`);
    
    // Project Overview
    sections.push('## 📋 Project Overview');
    if (repoData.repository?.repo?.description) {
      sections.push(`**Description:** ${repoData.repository.repo.description}`);
    }
    
    const mainLanguage = repoData.repository?.repo?.language || 'Unknown';
    sections.push(`**Primary Language:** ${mainLanguage}`);
    
    // Key Files
    if (repoData.keyFiles && repoData.keyFiles.length > 0) {
      sections.push('\n## 🔑 Key Files');
      repoData.keyFiles.forEach(file => {
        sections.push(`**${file.path}** (${file.type})`);
        if (file.insights && file.insights.length > 0) {
          file.insights.forEach((insight: string) => {
            sections.push(`  - ${insight}`);
          });
        }
      });
    }
    
    // Getting Started
    sections.push('\n## 🚀 Getting Started');
    sections.push('```bash');
    sections.push(`git clone https://github.com/${owner}/${repo}.git`);
    sections.push(`cd ${repo}`);
    
    if (mainLanguage === 'JavaScript' || mainLanguage === 'TypeScript') {
      sections.push('npm install');
      sections.push('npm run dev');
    }
    sections.push('```');
    
    return sections.join('\n');
  }

  private generateBasicTechnicalAnalysis(repoData: RepositoryAnalysisData, owner: string, repo: string): string {
    const sections: string[] = [];
    
    sections.push('# Technical Analysis\n');
    
    // Language Distribution
    const languageStats = this.calculateLanguageStats(repoData.codeStructure);
    if (Object.keys(languageStats).length > 0) {
      sections.push('## 📊 Language Distribution');
      Object.entries(languageStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([lang, count]) => {
          sections.push(`- **${lang}**: ${count} files`);
        });
    }
    
    return sections.join('\n');
  }

  private generateBasicRecommendations(repoData: RepositoryAnalysisData, owner: string, repo: string): string[] {
    const recommendations: string[] = [];
    
    recommendations.push('Clone the repository and review the README.md file');
    
    const mainLanguage = repoData.repository?.repo?.language;
    if (mainLanguage === 'JavaScript' || mainLanguage === 'TypeScript') {
      recommendations.push('Run `npm install` to install dependencies');
      recommendations.push('Check package.json for available scripts');
    }
    
    return recommendations;
  }
}
