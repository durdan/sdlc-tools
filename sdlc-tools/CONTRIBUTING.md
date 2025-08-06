# Contributing to SDLC Tools

Thank you for your interest in contributing to SDLC Tools! This document provides guidelines and information for contributors.

## 🎯 Ways to Contribute

- 🐛 **Bug Reports**: Help us identify and fix issues
- ✨ **Feature Requests**: Suggest new capabilities
- 💻 **Code Contributions**: Implement features or fix bugs
- 📚 **Documentation**: Improve guides and examples
- 🎨 **UI/UX**: Enhance the user interface
- 🔧 **Performance**: Optimize analysis speed
- 🌐 **Integrations**: Add support for more platforms

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- GitHub account
- Claude API key (for testing AI features)

### Development Setup

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/your-username/sdlc-tools.git
   cd sdlc-tools
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Configure your environment variables
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🔧 Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Making Changes

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clean, readable code
   - Follow existing code style
   - Add tests for new features
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm run lint
   npm run type-check
   npm run test
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create Pull Request on GitHub
   ```

## 📝 Code Standards

### TypeScript Guidelines

- Use strict TypeScript configuration
- Define proper interfaces and types
- Avoid `any` type unless absolutely necessary
- Use meaningful variable and function names

### Code Style

- **ESLint**: Follow the configured rules
- **Prettier**: Automatic code formatting
- **File Naming**: Use kebab-case for files, PascalCase for components
- **Import Order**: External imports first, then internal imports

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

Examples:
feat: add PDF export functionality
fix: resolve GitHub OAuth redirect issue
docs: update installation guide
style: improve onboarding modal design
refactor: optimize repository analysis service
test: add unit tests for GitHub service
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write unit tests for utility functions
- Add integration tests for API endpoints
- Include component tests for React components
- Test error handling and edge cases

### Test Structure

```typescript
// Example test structure
describe('GitHubService', () => {
  describe('getRepositoryAnalytics', () => {
    it('should return repository analytics', async () => {
      // Test implementation
    })

    it('should handle API errors gracefully', async () => {
      // Error handling test
    })
  })
})
```

## 📚 Documentation

### Documentation Standards

- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Update README.md for significant changes

### API Documentation

- Document all API endpoints
- Include request/response examples
- Specify error codes and messages
- Add authentication requirements

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Clear Description**: What happened vs. what was expected
2. **Steps to Reproduce**: Detailed steps to recreate the issue
3. **Environment**: OS, Node.js version, browser
4. **Screenshots**: If applicable
5. **Error Messages**: Full error logs
6. **Minimal Example**: Code that reproduces the issue

### Bug Report Template

```markdown
**Bug Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g. macOS, Windows, Linux]
- Node.js: [e.g. 18.17.0]
- Browser: [e.g. Chrome, Firefox]
- Version: [e.g. 1.0.0]

**Additional Context**
Any other context about the problem.
```

## ✨ Feature Requests

For feature requests, please include:

1. **Problem Statement**: What problem does this solve?
2. **Proposed Solution**: How should it work?
3. **Use Cases**: Who would benefit from this?
4. **Implementation Ideas**: Technical approach (optional)

## 🔍 Code Review Process

### Pull Request Guidelines

- **Clear Title**: Descriptive title following conventional commits
- **Description**: Explain what changes were made and why
- **Screenshots**: For UI changes
- **Testing**: Describe how the changes were tested
- **Breaking Changes**: Highlight any breaking changes

### Review Criteria

- Code quality and readability
- Test coverage
- Documentation updates
- Performance considerations
- Security implications
- Backward compatibility

## 🏆 Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes for significant contributions
- GitHub contributor graphs
- Special mentions for outstanding contributions

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Discord**: [Join our community](https://discord.gg/sdlc-tools)
- **Email**: [contributors@sdlc.dev](mailto:contributors@sdlc.dev)

## 📄 License

By contributing to SDLC Tools, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to SDLC Tools! 🎉
