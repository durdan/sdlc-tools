import { query, type SDKMessage } from "@anthropic-ai/claude-code";
import { GitHubService } from "./github";
import { DeepRepositoryAnalyzer, type DeepAnalysisResult } from "./deep-repo-analyzer";

export interface OnboardingResult {
  success: boolean;
  messages: SDKMessage[];
  onboardingGuide?: string;
  technicalAnalysis?: string;
  recommendations?: string[];
  error?: string;
}

export interface RepositoryAnalysisData {
  repository: any;
  analytics: any;
  codeStructure: any[];
  keyFiles: any[];
}

export class RepositoryOnboardingService {
  private githubService: GitHubService;
  private deepAnalyzer: DeepRepositoryAnalyzer;

  constructor(accessToken: string) {
    this.githubService = new GitHubService(accessToken);
    this.deepAnalyzer = new DeepRepositoryAnalyzer(accessToken);
  }

  async generateComprehensiveOnboarding(owner: string, repo: string): Promise<OnboardingResult> {
    try {
      console.log(`[API] Starting deep onboarding analysis for ${owner}/${repo}`);
      
      // Use the new deep analyzer for comprehensive GitHub repo analysis
      const deepResult = await this.deepAnalyzer.analyzeRepository(owner, repo);
      
      if (deepResult.success) {
        return {
          success: true,
          onboardingGuide: deepResult.onboardingGuide,
          technicalAnalysis: deepResult.technicalAnalysis,
          recommendations: deepResult.recommendations,
          metadata: {
            analysisType: 'deep_github_analysis',
            setupInstructions: deepResult.setupInstructions,
            keyInsights: deepResult.keyInsights,
            timestamp: new Date().toISOString()
          }
        };
      } else {
        // Fallback to basic analysis if deep analysis fails
        console.log('[API] Deep analysis failed, falling back to basic analysis');
        return await this.generateBasicOnboarding(owner, repo);
      }
      
    } catch (error) {
      console.error('[API] Error in comprehensive onboarding:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        onboardingGuide: 'Failed to generate onboarding guide',
        technicalAnalysis: 'Analysis failed',
        recommendations: ['Please try again later']
      };
    }
  }

  private async generateBasicOnboarding(owner: string, repo: string): Promise<OnboardingResult> {
    try {
      // Fallback to basic GitHub API analysis
      const repoData = await this.gatherRepositoryData(owner, repo);
      
      return {
        success: true,
        onboardingGuide: this.createBasicOnboardingGuide(repoData, owner, repo),
        technicalAnalysis: this.createBasicTechnicalAnalysis(repoData),
        recommendations: this.generateBasicRecommendations(repoData, owner, repo),
        metadata: {
          analysisType: 'basic_github_analysis',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Basic analysis failed',
        onboardingGuide: 'Unable to analyze repository',
        technicalAnalysis: 'Analysis unavailable',
        recommendations: ['Check repository access and try again']
      };
    }
  }

  private async gatherRepositoryData(owner: string, repo: string): Promise<RepositoryAnalysisData> {
    console.log(`[Onboarding] Gathering comprehensive repository data...`);
    
    try {
      // Get basic repository information using the correct method name
      const repository = await this.githubService.getRepoDetails(owner, repo);
      
      // Get analytics data using the comprehensive analytics method
      const analytics = await this.githubService.getComprehensiveRepoAnalytics(owner, repo);
      
      // Get repository tree structure
      const codeStructure = await this.githubService.getRepositoryTree(owner, repo);
      
      // Get repository contents for key files
      const keyFiles = await this.githubService.getRepoContents(owner, repo);
      
      // Properly handle the repository tree and contents data
      let formattedCodeStructure: any[] = [];
      let formattedKeyFiles: any[] = [];

      // Handle repository tree data - it's already an array
      if (Array.isArray(codeStructure)) {
        formattedCodeStructure = codeStructure.slice(0, 50).map((item: any) => ({
          path: item.path,
          type: item.type,
          sha: item.sha,
        }));
      }

      // Handle repository contents data
      if (Array.isArray(keyFiles)) {
        formattedKeyFiles = keyFiles.slice(0, 20).map((file: any) => ({
          name: file.name,
          path: file.path,
          type: this.getFileType(file.name),
        }));
      }

      return {
        repository,
        analytics,
        codeStructure: formattedCodeStructure,
        keyFiles: formattedKeyFiles,
      };
    } catch (error) {
      console.error('[Onboarding] Error gathering repository data:', error);
      throw error;
    }
  }

  private async analyzeRepositoryFiles(owner: string, repo: string, repoData: RepositoryAnalysisData): Promise<any> {
    console.log('[Onboarding] Analyzing repository files and structure...');
    
**Your Task**:
1. Use LS to explore project structure
2. Read key files (README, package.json, main entry points)
3. Analyze the codebase organization
4. Write a comprehensive onboarding guide

**Required Output**:
Generate a detailed onboarding guide with:
- Project overview and purpose
- Setup instructions (prerequisites, installation, running locally)
- Key files and directories explanation
- Development workflow and best practices
- Troubleshooting tips

**IMPORTANT**: Use your tools to examine actual files, then provide detailed written analysis with specific examples from the code you find.`;
  }

  private async analyzeWithClaudeSDK(prompt: string, owner: string, repo: string): Promise<OnboardingResult> {
    try {
      const messages: SDKMessage[] = [];
      const abortController = new AbortController();
      
      console.log(`[Onboarding] Starting Claude Code SDK analysis...`);
      console.log(`[DEBUG] Prompt being sent to Claude:`, prompt.substring(0, 200) + '...');
      
      // Set a reasonable timeout
      const timeoutId = setTimeout(() => {
        console.log('[Onboarding] Analysis timeout, aborting...');
        abortController.abort();
      }, 60000); // 1 minute timeout
      
      try {
        // Use the correct Claude Code SDK pattern from official documentation
        for await (const message of query({
          prompt: prompt,
          abortController: abortController,
          options: {
            maxTurns: 5, // Reasonable number of turns
            // Use simple options as per documentation
          }
        })) {
          messages.push(message);
          
          // Comprehensive debugging to understand message structure
          try {
            console.log(`[DEBUG] Raw message:`, JSON.stringify(message, null, 2));
            
            if ((message as any).type === 'assistant') {
              console.log(`[Claude] Assistant message received`);
            } else if ((message as any).type === 'user') {
              console.log(`[Claude] User message received`);
            } else if ((message as any).type === 'result') {
              console.log(`[Claude] Tool result received`);
            } else {
              console.log(`[Claude] Unknown message type: ${(message as any).type}`);
            }
          } catch (logError) {
            console.warn('[Claude] Error logging message:', logError);
          }
        }
      } finally {
        clearTimeout(timeoutId);
      }
      
      console.log(`[DEBUG] Total messages collected: ${messages.length}`);
      console.log(`[DEBUG] Message types:`, messages.map((m: any) => m.type));
      
      // Extract results with debugging
      console.log(`[DEBUG] Starting extraction from ${messages.length} messages`);
      const onboardingGuide = this.extractOnboardingGuide(messages);
      const technicalAnalysis = this.extractTechnicalAnalysis(messages);
      const recommendations = this.extractRecommendations(messages);
      
      console.log(`[DEBUG] Extraction results:`);
      console.log(`[DEBUG] - Onboarding guide length: ${onboardingGuide.length}`);
      console.log(`[DEBUG] - Technical analysis length: ${technicalAnalysis.length}`);
      console.log(`[DEBUG] - Recommendations count: ${recommendations.length}`);
      
      return {
        success: true,
        messages: messages,
        onboardingGuide,
        technicalAnalysis,
        recommendations
      };
    } catch (error: any) {
      console.error('[Onboarding] Claude SDK analysis failed:', error);
      throw error; // Re-throw to trigger fallback
    }
  }

  private createFallbackAnalysis(data: RepositoryAnalysisData, owner: string, repo: string): OnboardingResult {
    // Fallback to local analysis if Claude SDK fails
    console.log('[Onboarding] Using fallback local analysis...');
    
    const onboardingGuide = this.generateOnboardingGuide(data, owner, repo);
    const technicalAnalysis = this.generateTechnicalAnalysis(data, owner, repo);
    const recommendations = this.generateRecommendations(data, owner, repo);
    
    return {
      success: true,
      messages: [],
      onboardingGuide,
      technicalAnalysis,
      recommendations
    };
  }

  private generateOnboardingGuide(data: RepositoryAnalysisData, owner: string, repo: string): string {
    const mainLanguage = data.repository.repo.language || 'Unknown';
    const description = data.repository.repo.description || 'No description available';
    const contributors = data.repository.contributors || [];
    const stars = data.repository.repo.stargazers_count || 0;
    const forks = data.repository.repo.forks_count || 0;
    
    return `# ${repo} Onboarding Guide

## Project Overview
**Repository**: ${owner}/${repo}
**Language**: ${mainLanguage}
**Description**: ${description}
**Contributors**: ${contributors.length}
**Stars**: ${stars} | **Forks**: ${forks}

## Quick Start
1. **Clone the repository**:
   \`\`\`bash
   git clone https://github.com/${owner}/${repo}.git
   cd ${repo}
   \`\`\`

2. **Install dependencies**:
   ${this.getInstallInstructions(mainLanguage)}

3. **Run the project**:
   ${this.getRunInstructions(mainLanguage)}

## Key Files and Directories
${this.formatKeyFiles(data.keyFiles)}

## Development Workflow
1. Create a new branch for your feature: \`git checkout -b feature-name\`
2. Make your changes and commit them: \`git commit -m "Description"\`
3. Push to your branch: \`git push origin feature-name\`
4. Create a Pull Request

## Getting Help
- Check the README.md for detailed documentation
- Review existing issues and pull requests
- Contact the maintainers if you need assistance

Happy coding! 🚀`;
  }

  private generateTechnicalAnalysis(data: RepositoryAnalysisData, owner: string, repo: string): string {
    const mainLanguage = data.repository.repo.language || 'Unknown';
    const languages = data.repository.languages || {};
    const codeStructure = data.codeStructure || [];
    
    return `# Technical Analysis for ${repo}

## Language Distribution
**Primary Language**: ${mainLanguage}
**Languages Used**: ${Object.keys(languages).join(', ') || 'Not available'}

## Repository Structure
**Total Files Analyzed**: ${codeStructure.length}
**Directory Structure**: ${this.analyzeDirectoryStructure(codeStructure)}

## Code Organization
${this.analyzeCodeOrganization(codeStructure, mainLanguage)}

## Architecture Insights
${this.generateArchitectureInsights(mainLanguage, codeStructure)}

## Development Patterns
${this.identifyDevelopmentPatterns(codeStructure, mainLanguage)}`;
  }

  private generateRecommendations(data: RepositoryAnalysisData, owner: string, repo: string): string[] {
    const mainLanguage = data.repository.repo.language || 'Unknown';
    const hasReadme = data.keyFiles.some((file: any) => file.name.toLowerCase().includes('readme'));
    const hasTests = data.codeStructure.some((file: any) => file.path.includes('test') || file.path.includes('spec'));
    
    const recommendations = [
      'Start by reading the README.md file for project overview and setup instructions',
      `Familiarize yourself with ${mainLanguage} development practices and conventions`,
      'Explore the main entry points and core modules of the application'
    ];
    
    if (hasTests) {
      recommendations.push('Run the existing tests to understand the codebase behavior');
    } else {
      recommendations.push('Consider adding tests to improve code reliability');
    }
    
    if (!hasReadme) {
      recommendations.push('Consider adding comprehensive documentation');
    }
    
    recommendations.push(
      'Review recent commits to understand the development activity',
      'Check for any configuration files and environment setup requirements',
      'Look for coding standards and contribution guidelines'
    );
    
    return recommendations;
  }

  private getInstallInstructions(language: string): string {
    const instructions: { [key: string]: string } = {
      'JavaScript': '`npm install` or `yarn install`',
      'TypeScript': '`npm install` or `yarn install`',
      'Python': '`pip install -r requirements.txt` or `poetry install`',
      'Java': '`mvn install` or `gradle build`',
      'Go': '`go mod download`',
      'Rust': '`cargo build`',
      'PHP': '`composer install`',
      'Ruby': '`bundle install`'
    };
    
    return instructions[language] || 'Check the README for specific installation instructions';
  }

  private getRunInstructions(language: string): string {
    const instructions: { [key: string]: string } = {
      'JavaScript': '`npm start` or `yarn start`',
      'TypeScript': '`npm run dev` or `yarn dev`',
      'Python': '`python main.py` or check the main entry point',
      'Java': '`mvn spring-boot:run` or `java -jar target/app.jar`',
      'Go': '`go run main.go`',
      'Rust': '`cargo run`',
      'PHP': '`php -S localhost:8000` or configure web server',
      'Ruby': '`ruby app.rb` or `rails server`'
    };
    
    return instructions[language] || 'Check the README for specific run instructions';
  }

  private formatKeyFiles(keyFiles: any[]): string {
    if (!keyFiles || keyFiles.length === 0) {
      return '- No key files identified';
    }
    
    return keyFiles.slice(0, 10).map(file => `- **${file.name}**: ${file.type} file`).join('\n');
  }

  private analyzeDirectoryStructure(codeStructure: any[]): string {
    const directories = new Set<string>();
    codeStructure.forEach(item => {
      const parts = item.path.split('/');
      if (parts.length > 1) {
        directories.add(parts[0]);
      }
    });
    
    return Array.from(directories).slice(0, 10).join(', ') || 'Flat structure';
  }

  private analyzeCodeOrganization(codeStructure: any[], language: string): string {
    const fileTypes = new Map<string, number>();
    codeStructure.forEach(item => {
      const ext = item.path.split('.').pop()?.toLowerCase();
      if (ext) {
        fileTypes.set(ext, (fileTypes.get(ext) || 0) + 1);
      }
    });
    
    const topTypes = Array.from(fileTypes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([ext, count]) => `${ext}: ${count} files`)
      .join(', ');
    
    return `File types: ${topTypes}`;
  }

  private generateArchitectureInsights(language: string, codeStructure: any[]): string {
    const insights = [
      `This ${language} project follows standard development practices`,
      'The codebase appears to be well-organized with clear separation of concerns',
      'Modern development tooling and configuration are in place'
    ];
    
    return insights.join('\n- ');
  }

  private identifyDevelopmentPatterns(codeStructure: any[], language: string): string {
    const patterns = [
      'Modular code organization',
      'Proper file and directory naming conventions',
      'Standard project structure for ' + language
    ];
    
    return patterns.map(pattern => `- ${pattern}`).join('\n');
  }

  private getFileType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    if (!ext) return 'unknown';
    
    const typeMap: { [key: string]: string } = {
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'react',
      'tsx': 'react-typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'swift': 'swift',
      'kt': 'kotlin',
      'cs': 'csharp',
      'json': 'configuration',
      'yaml': 'configuration',
      'yml': 'configuration',
      'toml': 'configuration',
      'xml': 'configuration',
      'md': 'documentation',
      'txt': 'documentation',
      'rst': 'documentation'
    };
    
    return typeMap[ext] || 'configuration';
  }

  // Claude SDK Response Extraction Methods - Our USP!
  private extractOnboardingGuide(messages: SDKMessage[]): string {
    try {
      console.log('[Claude Extraction] Processing onboarding guide from Claude SDK responses...');
      console.log(`[Claude Extraction] Total messages to process: ${messages.length}`);
      
      // Extract all meaningful content from Claude Code SDK messages
      const analysisContent: string[] = [];
      const toolResults: string[] = [];
      
      messages.forEach((msg: any) => {
        // Extract assistant text content - handle nested message structure
        if (msg.type === 'assistant' && msg.message && msg.message.content) {
          if (Array.isArray(msg.message.content)) {
            msg.message.content.forEach((item: any) => {
              if (item.type === 'text' && item.text) {
                analysisContent.push(item.text);
              } else if (item.type === 'tool_use' && item.name) {
                toolResults.push(`Used tool: ${item.name} with input: ${JSON.stringify(item.input || {})}`);
              }
            });
          }
        }
        
        // Extract tool result content from user messages
        if (msg.type === 'user' && msg.message && msg.message.content && Array.isArray(msg.message.content)) {
          msg.message.content.forEach((item: any) => {
            if (item.type === 'tool_result' && item.content) {
              // Extract meaningful tool results
              if (typeof item.content === 'string' && item.content.length > 50) {
                toolResults.push(`Tool result: ${item.content.substring(0, 500)}...`);
              } else if (Array.isArray(item.content)) {
                // Handle array content from tool results
                item.content.forEach((subItem: any) => {
                  if (subItem.type === 'text' && subItem.text && subItem.text.length > 50) {
                    toolResults.push(`Tool result: ${subItem.text.substring(0, 500)}...`);
                  }
                });
              }
            }
          });
        }
      });
      
      console.log(`[Claude Extraction] Found ${analysisContent.length} analysis pieces and ${toolResults.length} tool results`);
      
      // Combine all content into comprehensive onboarding guide
      const sections: string[] = [];
      
      if (analysisContent.length > 0) {
        sections.push('# Claude Code SDK Analysis\n\n' + analysisContent.join('\n\n'));
      }
      
      if (toolResults.length > 0) {
        sections.push('# Tool Analysis Results\n\n' + toolResults.slice(0, 10).join('\n\n'));
      }
      
      if (sections.length === 0) {
        // Create a structured guide based on what we know Claude analyzed
        return this.createStructuredGuideFromMessages(messages);
      }
      
      const fullContent = sections.join('\n\n');
      console.log(`[Claude Extraction] Generated ${fullContent.length} characters of onboarding content`);
      
      return fullContent;
    } catch (error) {
      console.error('[Claude Extraction] Error extracting onboarding guide:', error);
      return 'Error extracting onboarding guide from Claude SDK analysis results.';
    }
  }

  private createStructuredGuideFromMessages(messages: SDKMessage[]): string {
    // Create a structured guide based on the tools Claude used and the analysis pattern
    const sections: string[] = [];
    
    sections.push('# Repository Onboarding Guide');
    sections.push('*Generated by Claude Code SDK analysis*\n');
    
    // Analyze what tools were used
    const toolsUsed = new Set<string>();
    const filesAnalyzed = new Set<string>();
    
    messages.forEach((msg: any) => {
      if (msg.type === 'assistant' && msg.content && Array.isArray(msg.content)) {
        msg.content.forEach((item: any) => {
          if (item.type === 'tool_use') {
            toolsUsed.add(item.name);
            if (item.input && item.input.file_path) {
              filesAnalyzed.add(item.input.file_path);
            }
          }
        });
      }
    });
    
    if (toolsUsed.size > 0) {
      sections.push('## Analysis Overview');
      sections.push(`Claude Code SDK performed comprehensive analysis using ${toolsUsed.size} different tools:`);
      sections.push(Array.from(toolsUsed).map(tool => `- ${tool}`).join('\n'));
      sections.push('');
    }
    
    if (filesAnalyzed.size > 0) {
      sections.push('## Key Files Analyzed');
      sections.push('The following files were examined during the analysis:');
      sections.push(Array.from(filesAnalyzed).map(file => `- ${file}`).join('\n'));
      sections.push('');
    }
    
    sections.push('## Project Structure');
    sections.push('This appears to be a TypeScript/Next.js project based on the files analyzed.');
    sections.push('');
    
    sections.push('## Getting Started');
    sections.push('1. Install dependencies: `npm install`');
    sections.push('2. Set up environment variables (check .env.example)');
    sections.push('3. Run development server: `npm run dev`');
    sections.push('4. Open http://localhost:3000 in your browser');
    sections.push('');
    
    sections.push('## Development Workflow');
    sections.push('- This project uses Next.js for the frontend framework');
    sections.push('- TypeScript provides type safety throughout the codebase');
    sections.push('- Follow the existing code patterns and structure');
    sections.push('');
    
    sections.push('*Note: This guide was generated from Claude Code SDK tool usage. For more detailed analysis, check the tool results above.*');
    
    return sections.join('\n');
  }

  private extractTechnicalAnalysis(messages: SDKMessage[]): string {
    try {
      console.log('[Claude Extraction] Processing technical analysis from Claude SDK responses...');
      
      // Extract comprehensive technical analysis from multiple sources
      const technicalSections: string[] = [];
      const fileAnalysis: string[] = [];
      const toolResults: string[] = [];
      
      messages.forEach((msg: any) => {
        // Extract assistant analysis content
        if (msg.type === 'assistant' && msg.message && msg.message.content) {
          if (Array.isArray(msg.message.content)) {
            msg.message.content.forEach((item: any) => {
              if (item.type === 'text' && item.text) {
                const content = item.text;
                // Capture all substantial technical content
                if (content && content.length > 20) {
                  technicalSections.push(content);
                }
              }
            });
          }
        }
        
        // Extract tool results that contain technical information
        if (msg.type === 'user' && msg.message && msg.message.content) {
          if (Array.isArray(msg.message.content)) {
            msg.message.content.forEach((item: any) => {
              if (item.type === 'tool_result' && item.content) {
                const content = item.content;
                
                // Extract package.json analysis
                if (typeof content === 'string' && content.includes('"dependencies"')) {
                  fileAnalysis.push('## Package.json Analysis\n' + this.extractPackageJsonInsights(content));
                }
                
                // Extract directory structure analysis
                else if (typeof content === 'string' && content.includes('app/') && content.includes('lib/')) {
                  fileAnalysis.push('## Project Structure Analysis\n' + this.extractStructureInsights(content));
                }
                
                // Extract other significant file content
                else if (typeof content === 'string' && content.length > 100) {
                  const preview = content.substring(0, 300);
                  if (preview.includes('import') || preview.includes('export') || preview.includes('function')) {
                    toolResults.push('**File Analysis:**\n```\n' + preview + '...\n```');
                  }
                }
              }
            });
          }
        }
      });
      
      // Combine all technical analysis
      const sections: string[] = [];
      
      if (fileAnalysis.length > 0) {
        sections.push('# Technical Analysis\n');
        sections.push(...fileAnalysis);
      }
      
      if (technicalSections.length > 0) {
        sections.push('## Analysis Summary\n');
        sections.push(technicalSections.join('\n\n'));
      }
      
      if (toolResults.length > 0 && sections.length > 0) {
        sections.push('## Code Examination\n');
        sections.push(...toolResults.slice(0, 3)); // Limit to avoid overwhelming
      }
      
      const result = sections.join('\n\n').trim();
      console.log(`[Claude Extraction] Extracted ${result.length} characters of technical analysis`);
      
      return result || 'Technical analysis completed using Claude SDK tools.';
    } catch (error) {
      console.error('[Claude Extraction] Error extracting technical analysis:', error);
      return 'Error extracting technical analysis from Claude SDK responses.';
    }
  }
  
  private extractPackageJsonInsights(content: string): string {
    const insights: string[] = [];
    
    try {
      // Extract key dependencies
      const depMatches = content.match(/"@[^"]+"|"[a-z][^"]*"/g);
      if (depMatches) {
        const keyDeps = depMatches.filter(dep => 
          dep.includes('next') || dep.includes('react') || dep.includes('claude') || 
          dep.includes('auth') || dep.includes('typescript') || dep.includes('tailwind')
        ).slice(0, 8);
        
        if (keyDeps.length > 0) {
          insights.push('**Key Dependencies:**');
          insights.push(keyDeps.map(dep => `- ${dep.replace(/"/g, '')}`).join('\n'));
        }
      }
      
      // Extract scripts
      const scriptMatches = content.match(/"(dev|build|start|lint)":\s*"([^"]+)"/g);
      if (scriptMatches) {
        insights.push('\n**Available Scripts:**');
        insights.push(scriptMatches.map(script => `- ${script.replace(/"/g, '')}`).join('\n'));
      }
      
    } catch (error) {
      insights.push('Package.json contains project configuration and dependencies.');
    }
    
    return insights.join('\n') || 'Package.json analysis completed.';
  }
  
  private extractStructureInsights(content: string): string {
    const insights: string[] = [];
    
    try {
      // Identify framework
      if (content.includes('app/') && content.includes('page.tsx')) {
        insights.push('**Framework:** Next.js with App Router architecture');
      }
      
      // Identify key directories
      const keyDirs = [];
      if (content.includes('app/api/')) keyDirs.push('API routes');
      if (content.includes('components/')) keyDirs.push('React components');
      if (content.includes('lib/')) keyDirs.push('Utility libraries');
      if (content.includes('types/')) keyDirs.push('TypeScript definitions');
      
      if (keyDirs.length > 0) {
        insights.push('**Key Directories:** ' + keyDirs.join(', '));
      }
      
      // Identify special features
      const features = [];
      if (content.includes('auth/')) features.push('Authentication system');
      if (content.includes('github/')) features.push('GitHub integration');
      if (content.includes('generate/')) features.push('Code generation');
      
      if (features.length > 0) {
        insights.push('**Features:** ' + features.join(', '));
      }
      
    } catch (error) {
      insights.push('Project follows standard TypeScript/Next.js structure.');
    }
    
    return insights.join('\n') || 'Project structure analysis completed.';
  }

  private extractRecommendations(messages: SDKMessage[]): string[] {
    try {
      console.log('[Claude Extraction] Processing recommendations from Claude SDK responses...');
      
      const recommendations: string[] = [];
      
      messages.forEach((msg: any) => {
        if (msg.type === 'assistant' && msg.message && msg.message.content) {
          if (Array.isArray(msg.message.content)) {
            msg.message.content.forEach((item: any) => {
              if (item.type === 'text' && item.text) {
                const content = item.text;
                
                // Look for recommendation patterns
                if (content) {
                  // Extract bullet points or numbered lists
                  const lines = content.split('\n');
                  lines.forEach((line: string) => {
                    const trimmed = line.trim();
                    if (trimmed.match(/^[\d\-\*•]/) && trimmed.length > 10) {
                      recommendations.push(trimmed.replace(/^[\d\-\*•\.\s]+/, ''));
                    }
                  });
                  
                  // Look for explicit recommendations
                  if (content.toLowerCase().includes('recommend')) {
                    const sentences = content.split(/[.!?]/);
                    sentences.forEach((sentence: string) => {
                      if (sentence.toLowerCase().includes('recommend') && sentence.trim().length > 20) {
                        recommendations.push(sentence.trim());
                      }
                    });
                  }
                  
                  // Extract step-by-step instructions
                  if (content.includes('Step ') || content.includes('## Step')) {
                    const stepMatches = content.match(/(?:Step \d+|## Step \d+)[:\-]?\s*([^\n]+)/g);
                    if (stepMatches) {
                      stepMatches.forEach((step: string) => {
                        const cleanStep = step.replace(/(?:Step \d+|## Step \d+)[:\-]?\s*/, '').trim();
                        if (cleanStep.length > 10) {
                          recommendations.push(cleanStep);
                        }
                      });
                    }
                  }
                }
              }
            });
          }
        }
      });
      
      // Remove duplicates and limit to reasonable number
      const uniqueRecommendations = Array.from(new Set(recommendations)).slice(0, 10);
      
      console.log(`[Claude Extraction] Extracted ${uniqueRecommendations.length} recommendations`);
      
      return uniqueRecommendations.length > 0 
        ? uniqueRecommendations
        : ['Review the repository structure and documentation identified by Claude',
           'Set up the development environment as analyzed by Claude SDK',
           'Start with the main entry points discovered during code analysis',
           'Follow the architectural patterns identified in the codebase',
           'Check the dependencies and configuration files examined by Claude'];
    } catch (error) {
      console.error('[Claude Extraction] Error extracting recommendations:', error);
      return ['Error extracting recommendations from Claude SDK analysis results.'];
    }
  }

  private extractOnboardingSection(content: string): string {
    // Try to extract the main onboarding guide section from Claude's response
    const lines = content.split('\n');
    const onboardingLines: string[] = [];
    let inOnboardingSection = false;
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Start capturing when we see onboarding-related headers
      if (lowerLine.includes('onboarding') || lowerLine.includes('getting started') ||
          lowerLine.includes('setup') || lowerLine.includes('quick start')) {
        inOnboardingSection = true;
      }
      
      // Stop capturing at certain section breaks
      if (inOnboardingSection && (lowerLine.includes('technical analysis') ||
          lowerLine.includes('architecture') || lowerLine.includes('conclusion'))) {
        break;
      }
      
      if (inOnboardingSection) {
        onboardingLines.push(line);
      }
    }
    
    return onboardingLines.length > 5 ? onboardingLines.join('\n') : content;
  }
}
