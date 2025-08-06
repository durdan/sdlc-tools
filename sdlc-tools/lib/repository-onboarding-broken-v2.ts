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
      console.log(`[API] Starting deep onboarding analysis for ${owner}/${repo}`);
      
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
      'CONTRIBUTING.md', 'LICENSE', 'CHANGELOG.md'
    ];

    const keyFiles = [];
    
    for (const item of tree) {
      if (keyFileNames.some(name => item.path.toLowerCase().includes(name.toLowerCase()))) {
        try {
          const fileData = await this.githubService.getFileContent(owner, repo, item.path);
          const content = fileData?.content || '';
          keyFiles.push({
            path: item.path,
            content: content.substring(0, 1000), // First 1000 chars
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
    
    return insights;
  }

  private generateOnboardingGuide(data: RepositoryAnalysisData, owner: string, repo: string): string {
    const sections: string[] = [];
    
    sections.push('# Repository Onboarding Guide');
    sections.push(`*Generated for ${owner}/${repo}*\n`);
    
    // Project Overview
    sections.push('## 📋 Project Overview');
    if (data.repository?.repo?.description) {
      sections.push(`**Description:** ${data.repository.repo.description}`);
    }
    
    const mainLanguage = data.repository?.repo?.language || 'Unknown';
    sections.push(`**Primary Language:** ${mainLanguage}`);
    
    if (data.repository?.repo?.stargazers_count) {
      sections.push(`**Stars:** ${data.repository.repo.stargazers_count}`);
    }
    
    if (data.repository?.repo?.forks_count) {
      sections.push(`**Forks:** ${data.repository.repo.forks_count}`);
    }
    
    sections.push('');
    
    // Repository Structure
    sections.push('## 📁 Repository Structure');
    const directories = data.codeStructure
      .filter(item => item.type === 'tree')
      .slice(0, 10)
      .map(item => `- \`${item.path}/\` - ${item.language} files`)
      .join('\n');
    
    if (directories) {
      sections.push(directories);
    } else {
      sections.push('Repository structure analysis in progress...');
    }
    sections.push('');
    
    // Key Files
    if (data.keyFiles && data.keyFiles.length > 0) {
      sections.push('## 🔑 Key Files');
      data.keyFiles.forEach(file => {
        sections.push(`**${file.path}** (${file.type})`);
        if (file.insights && file.insights.length > 0) {
          file.insights.forEach((insight: string) => {
            sections.push(`  - ${insight}`);
          });
        }
        sections.push('');
      });
    }
    
    // Getting Started
    sections.push('## 🚀 Getting Started');
    sections.push('```bash');
    sections.push(`# Clone the repository`);
    sections.push(`git clone https://github.com/${owner}/${repo}.git`);
    sections.push(`cd ${repo}`);
    sections.push('');
    
    // Add language-specific setup instructions
    if (mainLanguage === 'JavaScript' || mainLanguage === 'TypeScript') {
      sections.push('# Install dependencies');
      sections.push('npm install');
      sections.push('');
      sections.push('# Start development server');
      sections.push('npm run dev');
    } else if (mainLanguage === 'Python') {
      sections.push('# Install dependencies');
      sections.push('pip install -r requirements.txt');
      sections.push('');
      sections.push('# Run the application');
      sections.push('python main.py');
    } else {
      sections.push('# Follow the setup instructions in README.md');
    }
    
    sections.push('```');
    
    return sections.join('\n');
  }

  private generateTechnicalAnalysis(data: RepositoryAnalysisData, owner: string, repo: string): string {
    const sections: string[] = [];
    
    sections.push('# Technical Analysis\n');
    
    // Language Distribution
    const languageStats = this.calculateLanguageStats(data.codeStructure);
    if (Object.keys(languageStats).length > 0) {
      sections.push('## 📊 Language Distribution');
      Object.entries(languageStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([lang, count]) => {
          sections.push(`- **${lang}**: ${count} files`);
        });
      sections.push('');
    }
    
    // Project Characteristics
    sections.push('## 🏗️ Project Characteristics');
    const totalFiles = data.codeStructure.length;
    sections.push(`- **Total Files**: ${totalFiles}`);
    
    const mainLanguage = data.repository?.repo?.language;
    if (mainLanguage) {
      sections.push(`- **Primary Language**: ${mainLanguage}`);
      
      // Add framework detection
      const framework = this.detectFramework(data.keyFiles, mainLanguage);
      if (framework) {
        sections.push(`- **Framework**: ${framework}`);
      }
    }
    
    // Repository Activity
    if (data.repository?.repo) {
      const repo = data.repository.repo;
      sections.push(`- **Created**: ${new Date(repo.created_at).toLocaleDateString()}`);
      sections.push(`- **Last Updated**: ${new Date(repo.updated_at).toLocaleDateString()}`);
      
      if (repo.open_issues_count !== undefined) {
        sections.push(`- **Open Issues**: ${repo.open_issues_count}`);
      }
    }
    
    sections.push('');
    
    // Configuration Files
    const configFiles = data.keyFiles?.filter(f => f.type === 'configuration' || f.type === 'dependencies');
    if (configFiles && configFiles.length > 0) {
      sections.push('## ⚙️ Configuration');
      configFiles.forEach(file => {
        sections.push(`**${file.path}**`);
        if (file.insights && file.insights.length > 0) {
          file.insights.forEach((insight: string) => {
            sections.push(`  - ${insight}`);
          });
        }
      });
      sections.push('');
    }
    
    return sections.join('\n');
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

  private generateRecommendations(data: RepositoryAnalysisData, owner: string, repo: string): string[] {
    const recommendations: string[] = [];
    
    // Basic setup recommendations
    recommendations.push('Clone the repository and review the README.md file');
    
    const mainLanguage = data.repository?.repo?.language;
    if (mainLanguage === 'JavaScript' || mainLanguage === 'TypeScript') {
      recommendations.push('Run `npm install` to install dependencies');
      recommendations.push('Check package.json for available scripts');
      
      const framework = this.detectFramework(data.keyFiles, mainLanguage);
      if (framework === 'React') {
        recommendations.push('Familiarize yourself with React components and hooks');
      } else if (framework === 'Next.js') {
        recommendations.push('Review the pages/ or app/ directory structure');
      }
    } else if (mainLanguage === 'Python') {
      recommendations.push('Install dependencies with `pip install -r requirements.txt`');
      recommendations.push('Set up a virtual environment for development');
    }
    
    // Documentation recommendations
    const hasReadme = data.keyFiles?.some(f => f.path.toLowerCase().includes('readme'));
    if (hasReadme) {
      recommendations.push('Read the README.md for project-specific instructions');
    }
    
    const hasContributing = data.keyFiles?.some(f => f.path.toLowerCase().includes('contributing'));
    if (hasContributing) {
      recommendations.push('Review CONTRIBUTING.md for development guidelines');
    }
    
    // Issue-based recommendations
    if (data.repository?.repo?.open_issues_count > 5) {
      recommendations.push('Check open issues to understand current challenges');
    }
    
    // Activity recommendations
    const lastUpdate = data.repository?.repo?.updated_at;
    if (lastUpdate) {
      const daysSinceUpdate = Math.floor((Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceUpdate > 90) {
        recommendations.push('Note: Repository has not been updated recently - verify if it is actively maintained');
      }
    }
    
    return recommendations;
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
        codeAnalysis: 'Claude analysis unavailable',
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
      .map(f => `\n## ${f.path}\n${f.content.substring(0, 2000)}`)
      .join('\n');
    
    return `Analyze this ${repoData.repository?.repo?.language || 'software'} repository: ${owner}/${repo}

Repository Overview:
- Language: ${repoData.repository?.repo?.language}
- Files: ${repoData.codeStructure.length}
- Description: ${repoData.repository?.repo?.description || 'No description'}

Key Files Content:${keyFileContents}

Please provide a comprehensive analysis including:

1. **Code Architecture & Patterns**: Identify the architectural patterns, frameworks, and design principles used
2. **Data Model Analysis**: If there's a database schema (Prisma, SQL, etc.), analyze the data model and relationships
3. **Feature Detection**: Identify the main features and capabilities of the application
4. **Technology Stack**: Detailed breakdown of technologies, frameworks, and tools used
5. **Setup Instructions**: Step-by-step developer setup based on the actual project structure
6. **Key Insights**: Important things developers should know about this codebase

Focus on providing actionable, developer-focused insights that help someone understand and contribute to this project.`;
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
    
    sections.push('# 🚀 Developer Onboarding Guide');
    sections.push(`*AI-Enhanced Analysis for ${owner}/${repo}*\n`);
    
    // Project Overview with Claude insights
    sections.push('## 📋 Project Overview');
    if (repoData.repository?.repo?.description) {
      sections.push(`**Description:** ${repoData.repository.repo.description}`);
    }
    
    const mainLanguage = repoData.repository?.repo?.language || 'Unknown';
    sections.push(`**Primary Language:** ${mainLanguage}`);
    
    if (claudeAnalysis.features && claudeAnalysis.features.length > 0) {
      sections.push('\n**Key Features:**');
      claudeAnalysis.features.slice(0, 5).forEach((feature: string) => {
        sections.push(`- ${feature}`);
      });
    }
    
    sections.push('');
    
    // Architecture Analysis
    if (claudeAnalysis.architecture && claudeAnalysis.architecture.length > 50) {
      sections.push('## 🏗️ Architecture & Design');
      sections.push(claudeAnalysis.architecture.substring(0, 1000));
      sections.push('');
    }
    
    // Data Model Analysis
    if (claudeAnalysis.dataModel && claudeAnalysis.dataModel.length > 50) {
      sections.push('## 🗄️ Data Model');
      sections.push(claudeAnalysis.dataModel.substring(0, 1000));
      sections.push('');
    }
    
    // Enhanced Setup Instructions
    sections.push('## 🚀 Getting Started');
    if (claudeAnalysis.setupInstructions && claudeAnalysis.setupInstructions.length > 50) {
      sections.push(claudeAnalysis.setupInstructions.substring(0, 1500));
    } else {
      // Fallback to basic setup
      sections.push('```bash');
      sections.push(`git clone https://github.com/${owner}/${repo}.git`);
      sections.push(`cd ${repo}`);
      if (mainLanguage === 'JavaScript' || mainLanguage === 'TypeScript') {
        sections.push('npm install');
        sections.push('npm run dev');
      }
      sections.push('```');
    }
    
    // Key Insights
    if (claudeAnalysis.keyInsights && claudeAnalysis.keyInsights.length > 0) {
      sections.push('\n## 💡 Key Developer Insights');
      claudeAnalysis.keyInsights.slice(0, 8).forEach((insight: string) => {
        sections.push(`- ${insight}`);
      });
    }
    
    return sections.join('\n');
  }

  private generateEnhancedTechnicalAnalysis(repoData: RepositoryAnalysisData, claudeAnalysis: any, owner: string, repo: string): string {
    const sections: string[] = [];
    
    sections.push('# 🔬 Technical Analysis\n');
    
    // Claude Code Analysis
    if (claudeAnalysis.codeAnalysis && claudeAnalysis.codeAnalysis.length > 100) {
      sections.push('## 🧠 AI Code Analysis');
      sections.push(claudeAnalysis.codeAnalysis.substring(0, 2000));
      sections.push('');
    }
    
    // Language Distribution
    const languageStats = this.calculateLanguageStats(repoData.codeStructure);
    if (Object.keys(languageStats).length > 0) {
      sections.push('## 📊 Language Distribution');
      Object.entries(languageStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
        .forEach(([lang, count]) => {
          sections.push(`- **${lang}**: ${count} files`);
        });
      sections.push('');
    }
    
    // Architecture Details
    if (claudeAnalysis.architecture && claudeAnalysis.architecture.length > 50) {
      sections.push('## 🏛️ Architecture Details');
      sections.push(claudeAnalysis.architecture.substring(0, 1500));
      sections.push('');
    }
    
    // Repository Metrics
    sections.push('## 📈 Repository Metrics');
    const totalFiles = repoData.codeStructure.length;
    sections.push(`- **Total Files**: ${totalFiles}`);
    
    if (repoData.repository?.repo) {
      const repo = repoData.repository.repo;
      sections.push(`- **Created**: ${new Date(repo.created_at).toLocaleDateString()}`);
      sections.push(`- **Last Updated**: ${new Date(repo.updated_at).toLocaleDateString()}`);
      if (repo.stargazers_count) sections.push(`- **Stars**: ${repo.stargazers_count}`);
      if (repo.forks_count) sections.push(`- **Forks**: ${repo.forks_count}`);
      if (repo.open_issues_count !== undefined) sections.push(`- **Open Issues**: ${repo.open_issues_count}`);
    }
    
    return sections.join('\n');
  }

  private generateEnhancedRecommendations(repoData: RepositoryAnalysisData, claudeAnalysis: any, owner: string, repo: string): string[] {
    const recommendations: string[] = [];
    
    // Claude-based recommendations
    if (claudeAnalysis.keyInsights && claudeAnalysis.keyInsights.length > 0) {
      recommendations.push('**AI-Powered Recommendations:**');
      claudeAnalysis.keyInsights.slice(0, 5).forEach((insight: string) => {
        recommendations.push(`• ${insight}`);
      });
    }
    
    // Setup recommendations
    recommendations.push('**Setup & Development:**');
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
    
    // Data model recommendations
    if (claudeAnalysis.dataModel && claudeAnalysis.dataModel.includes('prisma')) {
      recommendations.push('**Database & Data Model:**');
      recommendations.push('• Review the Prisma schema for data model understanding');
      recommendations.push('• Run database migrations if needed');
      recommendations.push('• Study the entity relationships and constraints');
    }
    
    // Feature-based recommendations
    if (claudeAnalysis.features && claudeAnalysis.features.length > 0) {
      recommendations.push('**Feature Exploration:**');
      claudeAnalysis.features.slice(0, 3).forEach((feature: string) => {
        recommendations.push(`• Explore the ${feature} implementation`);
      });
    }
    
    return recommendations;
  }

  private async generateBasicOnboarding(owner: string, repo: string, error: any): Promise<OnboardingResult> {
    console.log('[Fallback] Generating basic onboarding due to error:', error);
    
    try {
      const repoData = await this.gatherRepositoryData(owner, repo);
      return {
        success: true,
        onboardingGuide: this.generateOnboardingGuide(repoData, owner, repo),
        technicalAnalysis: this.generateTechnicalAnalysis(repoData, owner, repo),
        recommendations: this.generateRecommendations(repoData, owner, repo),
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

  // Keep original methods for fallback
  private generateOnboardingGuide(repoData: RepositoryAnalysisData, owner: string, repo: string): string {
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
    
    if (repoData.repository?.repo?.stargazers_count) {
      sections.push(`**Stars:** ${repoData.repository.repo.stargazers_count}`);
    }
    
    if (repoData.repository?.repo?.forks_count) {
      sections.push(`**Forks:** ${repoData.repository.repo.forks_count}`);
    }
    
    sections.push('');
    
    // Repository Structure
    sections.push('## 📁 Repository Structure');
    const directories = repoData.codeStructure
      .filter(item => item.type === 'tree')
      .slice(0, 10)
      .map(item => `- \`${item.path}/\` - ${item.language} files`)
      .join('\n');
    
    if (directories) {
      sections.push(directories);
    } else {
      sections.push('Repository structure analysis in progress...');
    }
    sections.push('');
    
    // Key Files
    if (repoData.keyFiles && repoData.keyFiles.length > 0) {
      sections.push('## 🔑 Key Files');
      repoData.keyFiles.forEach(file => {
        sections.push(`**${file.path}** (${file.type})`);
        if (file.insights && file.insights.length > 0) {
          file.insights.forEach((insight: string) => {
            sections.push(`  - ${insight}`);
          });
        }
        sections.push('');
      });
    }
    
    // Getting Started
    sections.push('## 🚀 Getting Started');
    sections.push('```bash');
    sections.push(`# Clone the repository`);
    sections.push(`git clone https://github.com/${owner}/${repo}.git`);
    sections.push(`cd ${repo}`);
    sections.push('');
    
    // Add language-specific setup instructions
    if (mainLanguage === 'JavaScript' || mainLanguage === 'TypeScript') {
      sections.push('# Install dependencies');
      sections.push('npm install');
      sections.push('');
      sections.push('# Start development server');
      sections.push('npm run dev');
    } else if (mainLanguage === 'Python') {
      sections.push('# Install dependencies');
      sections.push('pip install -r requirements.txt');
      sections.push('');
      sections.push('# Run the application');
      sections.push('python main.py');
    } else {
      sections.push('# Follow the setup instructions in README.md');
    }
    
    sections.push('```');
    
    return sections.join('\n');
  }

  private generateTechnicalAnalysis(repoData: RepositoryAnalysisData, owner: string, repo: string): string {
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
      sections.push('');
    }
    
    // Project Characteristics
    sections.push('## 🏗️ Project Characteristics');
    const totalFiles = repoData.codeStructure.length;
    sections.push(`- **Total Files**: ${totalFiles}`);
    
    const mainLanguage = repoData.repository?.repo?.language;
    if (mainLanguage) {
      sections.push(`- **Primary Language**: ${mainLanguage}`);
      
      // Add framework detection
      const framework = this.detectFramework(repoData.keyFiles, mainLanguage);
      if (framework) {
        sections.push(`- **Framework**: ${framework}`);
      }
    }
    
    // Repository Activity
    if (repoData.repository?.repo) {
      const repo = repoData.repository.repo;
      sections.push(`- **Created**: ${new Date(repo.created_at).toLocaleDateString()}`);
      sections.push(`- **Last Updated**: ${new Date(repo.updated_at).toLocaleDateString()}`);
      
      if (repo.open_issues_count !== undefined) {
        sections.push(`- **Open Issues**: ${repo.open_issues_count}`);
      }
    }
    
    sections.push('');
    
    // Configuration Files
    const configFiles = repoData.keyFiles?.filter(f => f.type === 'configuration' || f.type === 'dependencies');
    if (configFiles && configFiles.length > 0) {
      sections.push('## ⚙️ Configuration');
      configFiles.forEach(file => {
        sections.push(`**${file.path}**`);
        if (file.insights && file.insights.length > 0) {
          file.insights.forEach((insight: string) => {
            sections.push(`  - ${insight}`);
          });
        }
      });
      sections.push('');
    }
    
    return sections.join('\n');
  }

  private generateRecommendations(repoData: RepositoryAnalysisData, owner: string, repo: string): string[] {
    const recommendations: string[] = [];
    
    // Basic setup recommendations
    recommendations.push('Clone the repository and review the README.md file');
    
    const mainLanguage = repoData.repository?.repo?.language;
    if (mainLanguage === 'JavaScript' || mainLanguage === 'TypeScript') {
      recommendations.push('Run `npm install` to install dependencies');
      recommendations.push('Check package.json for available scripts');
      
      const framework = this.detectFramework(repoData.keyFiles, mainLanguage);
      if (framework === 'React') {
        recommendations.push('Familiarize yourself with React components and hooks');
      } else if (framework === 'Next.js') {
        recommendations.push('Review the pages/ or app/ directory structure');
      }
    } else if (mainLanguage === 'Python') {
      recommendations.push('Install dependencies with `pip install -r requirements.txt`');
      recommendations.push('Set up a virtual environment for development');
    }
    
    // Documentation recommendations
    const hasReadme = repoData.keyFiles?.some(f => f.path.toLowerCase().includes('readme'));
    if (hasReadme) {
      recommendations.push('Read the README.md for project-specific instructions');
    }
    
    const hasContributing = repoData.keyFiles?.some(f => f.path.toLowerCase().includes('contributing'));
    if (hasContributing) {
      recommendations.push('Review CONTRIBUTING.md for development guidelines');
    }
    
    // Issue-based recommendations
    if (repoData.repository?.repo?.open_issues_count > 5) {
      recommendations.push('Check open issues to understand current challenges');
    }
    
    // Activity recommendations
    const lastUpdate = repoData.repository?.repo?.updated_at;
    if (lastUpdate) {
      const daysSinceUpdate = Math.floor((Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceUpdate > 90) {
        recommendations.push('Note: Repository has not been updated recently - verify if it is actively maintained');
      }
    }
    
    return recommendations;
  }
}
