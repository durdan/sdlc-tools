import { GitHubService } from "./github";

export interface DeepAnalysisResult {
  success: boolean;
  onboardingGuide: string;
  technicalAnalysis: string;
  recommendations: string[];
  setupInstructions: string;
  keyInsights: string[];
  error?: string;
}

export interface FileAnalysis {
  filename: string;
  content: string;
  type: 'config' | 'documentation' | 'code' | 'test' | 'build';
  language?: string;
  insights: string[];
}

export interface ProjectStructure {
  framework: string;
  language: string;
  buildSystem: string;
  testFramework?: string;
  dependencies: { [key: string]: string };
  scripts: { [key: string]: string };
  architecture: string;
}

export class DeepRepositoryAnalyzer {
  private githubService: GitHubService;

  constructor(accessToken: string) {
    this.githubService = new GitHubService(accessToken);
  }

  async analyzeRepository(owner: string, repo: string): Promise<DeepAnalysisResult> {
    try {
      console.log(`[DeepAnalyzer] Starting comprehensive analysis of ${owner}/${repo}`);

      // Step 1: Get repository metadata
      const repoInfo = await this.githubService.getRepository(owner, repo);
      
      // Step 2: Analyze key files
      const keyFiles = await this.analyzeKeyFiles(owner, repo);
      
      // Step 3: Understand project structure
      const projectStructure = this.analyzeProjectStructure(keyFiles);
      
      // Step 4: Analyze development patterns
      const devPatterns = await this.analyzeDevelopmentPatterns(owner, repo);
      
      // Step 5: Generate comprehensive insights
      return {
        success: true,
        onboardingGuide: this.generateOnboardingGuide(repoInfo, projectStructure, keyFiles),
        technicalAnalysis: this.generateTechnicalAnalysis(projectStructure, keyFiles, devPatterns),
        recommendations: this.generateRecommendations(projectStructure, devPatterns, repoInfo),
        setupInstructions: this.generateSetupInstructions(projectStructure, keyFiles),
        keyInsights: this.generateKeyInsights(repoInfo, projectStructure, devPatterns)
      };

    } catch (error) {
      console.error('[DeepAnalyzer] Analysis failed:', error);
      return {
        success: false,
        onboardingGuide: 'Analysis failed',
        technicalAnalysis: 'Unable to analyze repository',
        recommendations: ['Please check repository access and try again'],
        setupInstructions: 'Setup instructions unavailable',
        keyInsights: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async analyzeKeyFiles(owner: string, repo: string): Promise<FileAnalysis[]> {
    const keyFileNames = [
      'README.md', 'README.rst', 'README.txt',
      'package.json', 'requirements.txt', 'Gemfile', 'go.mod', 'Cargo.toml',
      'dockerfile', 'Dockerfile', 'docker-compose.yml',
      '.github/workflows/ci.yml', '.github/workflows/main.yml',
      'tsconfig.json', 'webpack.config.js', 'vite.config.js',
      'jest.config.js', 'cypress.json', 'playwright.config.js',
      '.env.example', '.env.template',
      'CONTRIBUTING.md', 'LICENSE', 'CHANGELOG.md'
    ];

    const analyses: FileAnalysis[] = [];

    for (const filename of keyFileNames) {
      try {
        const content = await this.githubService.getFileContent(owner, repo, filename);
        if (content) {
          const analysis = this.analyzeFile(filename, content);
          analyses.push(analysis);
          console.log(`[DeepAnalyzer] Analyzed ${filename}: ${analysis.insights.length} insights`);
        }
      } catch (error) {
        // File doesn't exist, continue
      }
    }

    return analyses;
  }

  private analyzeFile(filename: string, content: string): FileAnalysis {
    const insights: string[] = [];
    let type: FileAnalysis['type'] = 'code';
    let language: string | undefined;

    // Determine file type and extract insights
    if (filename.toLowerCase().includes('readme')) {
      type = 'documentation';
      insights.push(...this.analyzeReadme(content));
    } else if (filename === 'package.json') {
      type = 'config';
      language = 'json';
      insights.push(...this.analyzePackageJson(content));
    } else if (filename === 'requirements.txt') {
      type = 'config';
      insights.push(...this.analyzePythonRequirements(content));
    } else if (filename.includes('docker')) {
      type = 'build';
      insights.push(...this.analyzeDockerfile(content));
    } else if (filename.includes('test') || filename.includes('spec')) {
      type = 'test';
      insights.push(...this.analyzeTestConfig(content));
    } else if (filename.includes('config') || filename.includes('.json')) {
      type = 'config';
      insights.push(...this.analyzeConfigFile(filename, content));
    }

    return {
      filename,
      content: content.substring(0, 1000), // Store first 1000 chars for reference
      type,
      language,
      insights
    };
  }

  private analyzeReadme(content: string): string[] {
    const insights: string[] = [];
    const lines = content.toLowerCase();

    if (lines.includes('installation') || lines.includes('install')) {
      insights.push('Contains installation instructions');
    }
    if (lines.includes('getting started') || lines.includes('quick start')) {
      insights.push('Includes getting started guide');
    }
    if (lines.includes('api') || lines.includes('documentation')) {
      insights.push('Has API or documentation references');
    }
    if (lines.includes('contributing') || lines.includes('contribute')) {
      insights.push('Includes contribution guidelines');
    }
    if (lines.includes('license')) {
      insights.push('Contains license information');
    }
    if (lines.includes('demo') || lines.includes('example')) {
      insights.push('Provides examples or demos');
    }

    // Extract setup commands
    const setupCommands = content.match(/```[\s\S]*?(npm install|pip install|yarn|go get|cargo build)[\s\S]*?```/gi);
    if (setupCommands) {
      insights.push(`Found ${setupCommands.length} setup command blocks`);
    }

    return insights;
  }

  private analyzePackageJson(content: string): string[] {
    const insights: string[] = [];
    
    try {
      const pkg = JSON.parse(content);
      
      if (pkg.scripts) {
        const scriptNames = Object.keys(pkg.scripts);
        insights.push(`Available scripts: ${scriptNames.join(', ')}`);
        
        if (pkg.scripts.dev || pkg.scripts.start) {
          insights.push('Has development server scripts');
        }
        if (pkg.scripts.build) {
          insights.push('Has build script');
        }
        if (pkg.scripts.test) {
          insights.push('Has test script');
        }
      }

      if (pkg.dependencies) {
        const depCount = Object.keys(pkg.dependencies).length;
        insights.push(`${depCount} production dependencies`);
        
        // Identify framework
        if (pkg.dependencies.react) insights.push('React application');
        if (pkg.dependencies.vue) insights.push('Vue.js application');
        if (pkg.dependencies.angular) insights.push('Angular application');
        if (pkg.dependencies.next) insights.push('Next.js application');
        if (pkg.dependencies.express) insights.push('Express.js server');
        if (pkg.dependencies.fastify) insights.push('Fastify server');
      }

      if (pkg.devDependencies) {
        const devDepCount = Object.keys(pkg.devDependencies).length;
        insights.push(`${devDepCount} development dependencies`);
        
        // Identify tools
        if (pkg.devDependencies.typescript) insights.push('TypeScript project');
        if (pkg.devDependencies.jest) insights.push('Uses Jest for testing');
        if (pkg.devDependencies.cypress) insights.push('Uses Cypress for E2E testing');
        if (pkg.devDependencies.webpack) insights.push('Uses Webpack for bundling');
        if (pkg.devDependencies.vite) insights.push('Uses Vite for bundling');
      }

      if (pkg.engines) {
        insights.push(`Node.js version requirement: ${pkg.engines.node || 'not specified'}`);
      }

    } catch (error) {
      insights.push('Invalid package.json format');
    }

    return insights;
  }

  private analyzePythonRequirements(content: string): string[] {
    const insights: string[] = [];
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    insights.push(`${lines.length} Python dependencies`);
    
    // Identify frameworks
    const frameworks = lines.filter(line => 
      line.includes('django') || line.includes('flask') || line.includes('fastapi') ||
      line.includes('tornado') || line.includes('pyramid')
    );
    
    if (frameworks.length > 0) {
      insights.push(`Python web frameworks: ${frameworks.join(', ')}`);
    }

    return insights;
  }

  private analyzeDockerfile(content: string): string[] {
    const insights: string[] = [];
    const lines = content.toLowerCase();

    if (lines.includes('from node')) insights.push('Node.js Docker container');
    if (lines.includes('from python')) insights.push('Python Docker container');
    if (lines.includes('from nginx')) insights.push('Nginx web server');
    if (lines.includes('expose')) insights.push('Exposes network ports');
    if (lines.includes('volume')) insights.push('Uses Docker volumes');
    if (lines.includes('multi-stage')) insights.push('Multi-stage Docker build');

    return insights;
  }

  private analyzeTestConfig(content: string): string[] {
    const insights: string[] = [];
    const lines = content.toLowerCase();

    if (lines.includes('jest')) insights.push('Jest testing framework');
    if (lines.includes('mocha')) insights.push('Mocha testing framework');
    if (lines.includes('cypress')) insights.push('Cypress E2E testing');
    if (lines.includes('playwright')) insights.push('Playwright testing');
    if (lines.includes('coverage')) insights.push('Code coverage configured');

    return insights;
  }

  private analyzeConfigFile(filename: string, content: string): string[] {
    const insights: string[] = [];
    
    if (filename.includes('typescript') || filename.includes('tsconfig')) {
      insights.push('TypeScript configuration');
    }
    if (filename.includes('webpack')) {
      insights.push('Webpack bundler configuration');
    }
    if (filename.includes('vite')) {
      insights.push('Vite build tool configuration');
    }

    return insights;
  }

  private analyzeProjectStructure(keyFiles: FileAnalysis[]): ProjectStructure {
    let framework = 'Unknown';
    let language = 'Unknown';
    let buildSystem = 'Unknown';
    let testFramework: string | undefined;
    const dependencies: { [key: string]: string } = {};
    const scripts: { [key: string]: string } = {};
    let architecture = 'Unknown';

    // Analyze package.json for Node.js projects
    const packageJson = keyFiles.find(f => f.filename === 'package.json');
    if (packageJson) {
      try {
        const pkg = JSON.parse(packageJson.content);
        language = 'JavaScript/TypeScript';
        
        if (pkg.dependencies) {
          Object.assign(dependencies, pkg.dependencies);
          
          if (pkg.dependencies.react) framework = 'React';
          else if (pkg.dependencies.vue) framework = 'Vue.js';
          else if (pkg.dependencies.angular) framework = 'Angular';
          else if (pkg.dependencies.next) framework = 'Next.js';
          else if (pkg.dependencies.express) framework = 'Express.js';
          else if (pkg.dependencies.fastify) framework = 'Fastify';
        }

        if (pkg.scripts) {
          Object.assign(scripts, pkg.scripts);
          
          if (pkg.scripts.build && pkg.scripts.build.includes('webpack')) buildSystem = 'Webpack';
          else if (pkg.scripts.build && pkg.scripts.build.includes('vite')) buildSystem = 'Vite';
          else if (pkg.scripts.build) buildSystem = 'Custom';
        }

        if (pkg.devDependencies) {
          if (pkg.devDependencies.jest) testFramework = 'Jest';
          else if (pkg.devDependencies.mocha) testFramework = 'Mocha';
          else if (pkg.devDependencies.cypress) testFramework = 'Cypress';
        }
      } catch (error) {
        // Invalid JSON
      }
    }

    // Analyze Python projects
    const requirements = keyFiles.find(f => f.filename === 'requirements.txt');
    if (requirements) {
      language = 'Python';
      const lines = requirements.content.split('\n');
      
      if (lines.some(line => line.includes('django'))) framework = 'Django';
      else if (lines.some(line => line.includes('flask'))) framework = 'Flask';
      else if (lines.some(line => line.includes('fastapi'))) framework = 'FastAPI';
    }

    // Determine architecture
    if (keyFiles.some(f => f.filename.includes('docker'))) {
      architecture = 'Containerized';
    } else if (framework.includes('Next.js') || framework.includes('React')) {
      architecture = 'Single Page Application';
    } else if (framework.includes('Express') || framework.includes('FastAPI')) {
      architecture = 'API Server';
    }

    return {
      framework,
      language,
      buildSystem,
      testFramework,
      dependencies,
      scripts,
      architecture
    };
  }

  private async analyzeDevelopmentPatterns(owner: string, repo: string): Promise<any> {
    try {
      // Get recent commits to understand development activity
      const commits = await this.githubService.getCommits(owner, repo, 10);
      
      // Get issues to understand common problems
      const issues = await this.githubService.getIssues(owner, repo, 'open', 5);
      
      // Get pull requests to understand contribution patterns
      const pullRequests = await this.githubService.getPullRequests(owner, repo, 'closed', 5);

      return {
        recentActivity: commits?.length || 0,
        openIssues: issues?.length || 0,
        recentPRs: pullRequests?.length || 0,
        commitFrequency: this.analyzeCommitFrequency(commits),
        commonIssues: this.analyzeCommonIssues(issues)
      };
    } catch (error) {
      return {
        recentActivity: 0,
        openIssues: 0,
        recentPRs: 0,
        commitFrequency: 'Unknown',
        commonIssues: []
      };
    }
  }

  private analyzeCommitFrequency(commits: any[]): string {
    if (!commits || commits.length === 0) return 'No recent activity';
    
    const now = new Date();
    const recentCommits = commits.filter(commit => {
      const commitDate = new Date(commit.commit.author.date);
      const daysDiff = (now.getTime() - commitDate.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 30;
    });

    if (recentCommits.length >= 20) return 'Very active (20+ commits/month)';
    if (recentCommits.length >= 10) return 'Active (10+ commits/month)';
    if (recentCommits.length >= 5) return 'Moderate (5+ commits/month)';
    return 'Low activity (<5 commits/month)';
  }

  private analyzeCommonIssues(issues: any[]): string[] {
    if (!issues || issues.length === 0) return [];
    
    const commonKeywords = ['bug', 'error', 'install', 'setup', 'documentation', 'feature'];
    const issueTypes: { [key: string]: number } = {};

    issues.forEach(issue => {
      const title = issue.title.toLowerCase();
      const body = (issue.body || '').toLowerCase();
      const text = title + ' ' + body;

      commonKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          issueTypes[keyword] = (issueTypes[keyword] || 0) + 1;
        }
      });
    });

    return Object.entries(issueTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([keyword, count]) => `${keyword} (${count} issues)`);
  }

  private generateOnboardingGuide(repoInfo: any, structure: ProjectStructure, keyFiles: FileAnalysis[]): string {
    const sections: string[] = [];

    sections.push('# Repository Onboarding Guide');
    sections.push(`*Generated for ${repoInfo.full_name}*\n`);

    // Project Overview
    sections.push('## 📋 Project Overview');
    sections.push(`**Framework:** ${structure.framework}`);
    sections.push(`**Language:** ${structure.language}`);
    sections.push(`**Architecture:** ${structure.architecture}`);
    if (structure.testFramework) {
      sections.push(`**Testing:** ${structure.testFramework}`);
    }
    sections.push('');

    if (repoInfo.description) {
      sections.push(`**Description:** ${repoInfo.description}\n`);
    }

    // Prerequisites
    sections.push('## 🔧 Prerequisites');
    if (structure.language.includes('JavaScript') || structure.language.includes('TypeScript')) {
      sections.push('- Node.js (check package.json for version requirements)');
      sections.push('- npm or yarn package manager');
    } else if (structure.language === 'Python') {
      sections.push('- Python 3.x');
      sections.push('- pip package manager');
    }

    if (keyFiles.some(f => f.filename.includes('docker'))) {
      sections.push('- Docker (for containerized setup)');
    }
    sections.push('');

    // Setup Instructions
    sections.push('## 🚀 Quick Setup');
    sections.push('```bash');
    sections.push(`# Clone the repository`);
    sections.push(`git clone https://github.com/${repoInfo.full_name}.git`);
    sections.push(`cd ${repoInfo.name}`);
    sections.push('');

    if (structure.language.includes('JavaScript') || structure.language.includes('TypeScript')) {
      sections.push('# Install dependencies');
      sections.push('npm install');
      sections.push('');
      
      if (structure.scripts.dev) {
        sections.push('# Start development server');
        sections.push('npm run dev');
      } else if (structure.scripts.start) {
        sections.push('# Start the application');
        sections.push('npm start');
      }
    } else if (structure.language === 'Python') {
      sections.push('# Install dependencies');
      sections.push('pip install -r requirements.txt');
      sections.push('');
      sections.push('# Run the application');
      sections.push('python main.py  # or appropriate entry point');
    }

    sections.push('```\n');

    // Key Files
    sections.push('## 📁 Key Files & Directories');
    const importantFiles = keyFiles.filter(f => 
      f.type === 'config' || f.type === 'documentation' || f.insights.length > 0
    );

    importantFiles.forEach(file => {
      sections.push(`**${file.filename}** - ${file.insights.join(', ')}`);
    });
    sections.push('');

    // Development Workflow
    if (Object.keys(structure.scripts).length > 0) {
      sections.push('## 🔄 Development Workflow');
      sections.push('**Available Scripts:**');
      Object.entries(structure.scripts).forEach(([name, command]) => {
        sections.push(`- \`npm run ${name}\` - ${command}`);
      });
      sections.push('');
    }

    return sections.join('\n');
  }

  private generateTechnicalAnalysis(structure: ProjectStructure, keyFiles: FileAnalysis[], devPatterns: any): string {
    const sections: string[] = [];

    sections.push('# Technical Analysis\n');

    // Architecture Overview
    sections.push('## 🏗️ Architecture');
    sections.push(`**Type:** ${structure.architecture}`);
    sections.push(`**Framework:** ${structure.framework}`);
    sections.push(`**Language:** ${structure.language}`);
    if (structure.buildSystem !== 'Unknown') {
      sections.push(`**Build System:** ${structure.buildSystem}`);
    }
    sections.push('');

    // Dependencies Analysis
    if (Object.keys(structure.dependencies).length > 0) {
      sections.push('## 📦 Key Dependencies');
      const keyDeps = Object.entries(structure.dependencies).slice(0, 8);
      keyDeps.forEach(([name, version]) => {
        sections.push(`- **${name}** (${version})`);
      });
      sections.push('');
    }

    // File Analysis
    sections.push('## 📄 Configuration Files');
    const configFiles = keyFiles.filter(f => f.type === 'config');
    configFiles.forEach(file => {
      sections.push(`**${file.filename}:**`);
      file.insights.forEach(insight => {
        sections.push(`- ${insight}`);
      });
      sections.push('');
    });

    // Development Activity
    sections.push('## 📊 Development Activity');
    sections.push(`**Commit Frequency:** ${devPatterns.commitFrequency}`);
    sections.push(`**Open Issues:** ${devPatterns.openIssues}`);
    sections.push(`**Recent PRs:** ${devPatterns.recentPRs}`);
    
    if (devPatterns.commonIssues.length > 0) {
      sections.push(`**Common Issue Types:** ${devPatterns.commonIssues.join(', ')}`);
    }
    sections.push('');

    return sections.join('\n');
  }

  private generateRecommendations(structure: ProjectStructure, devPatterns: any, repoInfo: any): string[] {
    const recommendations: string[] = [];

    // Setup recommendations
    if (structure.language.includes('JavaScript') || structure.language.includes('TypeScript')) {
      recommendations.push('Start with `npm install` to install all dependencies');
      
      if (structure.scripts.dev) {
        recommendations.push('Use `npm run dev` for development with hot reload');
      }
      
      if (structure.testFramework) {
        recommendations.push(`Run tests with the configured ${structure.testFramework} framework`);
      }
    }

    // Architecture-specific recommendations
    if (structure.framework === 'React') {
      recommendations.push('Familiarize yourself with React component structure and hooks');
    } else if (structure.framework === 'Next.js') {
      recommendations.push('Review the pages/ or app/ directory for routing structure');
    } else if (structure.framework.includes('Express')) {
      recommendations.push('Check the API routes and middleware configuration');
    }

    // Development workflow recommendations
    if (devPatterns.openIssues > 5) {
      recommendations.push('Review open issues to understand current challenges');
    }

    if (devPatterns.commitFrequency.includes('Low')) {
      recommendations.push('Check if the project is actively maintained');
    }

    // Documentation recommendations
    recommendations.push('Read the README.md for project-specific setup instructions');
    
    if (repoInfo.has_wiki) {
      recommendations.push('Check the project wiki for additional documentation');
    }

    return recommendations;
  }

  private generateSetupInstructions(structure: ProjectStructure, keyFiles: FileAnalysis[]): string {
    const instructions: string[] = [];

    instructions.push('# Setup Instructions\n');

    // Prerequisites
    instructions.push('## Prerequisites');
    if (structure.language.includes('JavaScript') || structure.language.includes('TypeScript')) {
      instructions.push('- Node.js (latest LTS recommended)');
      instructions.push('- npm or yarn');
    } else if (structure.language === 'Python') {
      instructions.push('- Python 3.8+');
      instructions.push('- pip');
    }

    const dockerFile = keyFiles.find(f => f.filename.toLowerCase().includes('dockerfile'));
    if (dockerFile) {
      instructions.push('- Docker (for containerized setup)');
    }

    instructions.push('');

    // Installation steps
    instructions.push('## Installation');
    instructions.push('1. Clone the repository');
    instructions.push('2. Navigate to project directory');

    if (structure.language.includes('JavaScript') || structure.language.includes('TypeScript')) {
      instructions.push('3. Run `npm install` or `yarn install`');
      
      const envExample = keyFiles.find(f => f.filename.includes('.env.example'));
      if (envExample) {
        instructions.push('4. Copy `.env.example` to `.env` and configure');
      }
      
      if (structure.scripts.dev) {
        instructions.push('5. Start development server with `npm run dev`');
      } else if (structure.scripts.start) {
        instructions.push('5. Start application with `npm start`');
      }
    }

    return instructions.join('\n');
  }

  private generateKeyInsights(repoInfo: any, structure: ProjectStructure, devPatterns: any): string[] {
    const insights: string[] = [];

    // Project maturity insights
    if (repoInfo.stargazers_count > 100) {
      insights.push(`Popular project with ${repoInfo.stargazers_count} stars`);
    }

    if (repoInfo.forks_count > 50) {
      insights.push(`Actively forked project (${repoInfo.forks_count} forks)`);
    }

    // Technology insights
    if (structure.framework !== 'Unknown') {
      insights.push(`Built with ${structure.framework} framework`);
    }

    if (structure.testFramework) {
      insights.push(`Uses ${structure.testFramework} for testing`);
    }

    // Development insights
    if (devPatterns.commitFrequency.includes('Very active')) {
      insights.push('Very active development with frequent updates');
    } else if (devPatterns.commitFrequency.includes('Low')) {
      insights.push('Low development activity - check if project is maintained');
    }

    // Architecture insights
    if (structure.architecture === 'Containerized') {
      insights.push('Containerized application with Docker support');
    }

    return insights;
  }
}
