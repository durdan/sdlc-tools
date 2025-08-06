# API Documentation

This document provides comprehensive information about the SDLC Tools API endpoints.

## Authentication

All API endpoints require authentication via NextAuth.js session cookies. Users must be signed in with GitHub OAuth to access protected routes.

### Authentication Flow

1. User signs in via GitHub OAuth: `GET /api/auth/signin/github`
2. GitHub redirects to callback: `POST /api/auth/callback/github`
3. Session cookie is set for subsequent requests

## Base URL

```
http://localhost:3000/api  # Development
https://your-domain.com/api  # Production
```

## Endpoints

### Authentication Endpoints

#### `GET /api/auth/[...nextauth]`

NextAuth.js dynamic route handling all authentication flows.

**Supported paths:**
- `/api/auth/signin` - Sign in page
- `/api/auth/signin/github` - GitHub OAuth sign in
- `/api/auth/signout` - Sign out
- `/api/auth/callback/github` - GitHub OAuth callback
- `/api/auth/session` - Get current session

### GitHub Integration

#### `GET /api/github/repos`

Fetch repositories for the authenticated user.

**Authentication:** Required

**Response:**
```json
{
  "repos": [
    {
      "id": 123456789,
      "name": "my-project",
      "full_name": "username/my-project",
      "private": false,
      "description": "A sample project",
      "language": "TypeScript",
      "stargazers_count": 42,
      "forks_count": 7,
      "updated_at": "2024-01-15T10:30:00Z",
      "html_url": "https://github.com/username/my-project"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - GitHub API rate limit exceeded
- `500 Internal Server Error` - Server error

#### `POST /api/github/analyze`

Perform basic repository analysis without AI enhancement.

**Authentication:** Required

**Request Body:**
```json
{
  "owner": "username",
  "repo": "repository-name"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "repository": {
      "name": "repository-name",
      "description": "Repository description",
      "language": "TypeScript",
      "stars": 42,
      "forks": 7
    },
    "languages": {
      "TypeScript": 85.2,
      "JavaScript": 12.3,
      "CSS": 2.5
    },
    "structure": {
      "totalFiles": 156,
      "directories": 23,
      "keyFiles": ["README.md", "package.json", "tsconfig.json"]
    }
  }
}
```

#### `POST /api/github/onboarding`

Generate AI-enhanced onboarding analysis for a repository.

**Authentication:** Required

**Request Body:**
```json
{
  "owner": "username",
  "repo": "repository-name"
}
```

**Response:** Server-Sent Events (SSE) stream

**Stream Events:**
```
data: {"type": "progress", "step": "Fetching repository data", "progress": 20}

data: {"type": "progress", "step": "Analyzing with Claude AI", "progress": 60}

data: {"type": "complete", "data": {
  "onboardingGuide": "# AI-Enhanced Developer Onboarding Guide...",
  "technicalAnalysis": "## Architecture & Design Patterns...",
  "recommendations": [
    "Consider implementing automated testing",
    "Add API documentation with OpenAPI"
  ]
}}
```

**Error Events:**
```
data: {"type": "error", "error": "Failed to analyze repository"}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `400 Bad Request` - Invalid request body
- `404 Not Found` - Repository not found
- `500 Internal Server Error` - Analysis failed

## Request/Response Examples

### Fetch User Repositories

```bash
curl -X GET "http://localhost:3000/api/github/repos" \
  -H "Cookie: next-auth.session-token=your-session-token"
```

### Basic Repository Analysis

```bash
curl -X POST "http://localhost:3000/api/github/analyze" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{
    "owner": "facebook",
    "repo": "react"
  }'
```

### AI-Enhanced Onboarding (SSE)

```javascript
const eventSource = new EventSource('/api/github/onboarding', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    owner: 'facebook',
    repo: 'react'
  })
});

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'progress') {
    console.log(`Progress: ${data.step} (${data.progress}%)`);
  } else if (data.type === 'complete') {
    console.log('Analysis complete:', data.data);
    eventSource.close();
  } else if (data.type === 'error') {
    console.error('Analysis failed:', data.error);
    eventSource.close();
  }
};
```

## Rate Limits

### GitHub API Limits
- **Authenticated requests**: 5,000 per hour
- **Unauthenticated requests**: 60 per hour

### Claude API Limits
- **Rate limit**: Varies by plan
- **Token limits**: 200K tokens per request (Claude-3.5-Sonnet)

### Application Limits
- **Concurrent analyses**: 5 per user
- **Analysis timeout**: 5 minutes
- **File size limit**: 1MB per file analyzed

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "GITHUB_API_ERROR",
    "message": "Failed to fetch repository data",
    "details": "Repository not found or access denied"
  }
}
```

### Common Error Codes

- `AUTH_REQUIRED` - Authentication required
- `INVALID_REQUEST` - Invalid request parameters
- `GITHUB_API_ERROR` - GitHub API error
- `CLAUDE_API_ERROR` - Claude AI API error
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded
- `ANALYSIS_TIMEOUT` - Analysis timed out
- `INTERNAL_ERROR` - Internal server error

## SDK Usage

For programmatic access, you can use the GitHub API client directly:

```typescript
import { GitHubService } from '@/lib/github';

const github = new GitHubService(accessToken);

// Fetch repositories
const repos = await github.getUserRepositories();

// Get repository analytics
const analytics = await github.getComprehensiveRepoAnalytics(owner, repo);

// Analyze with AI
const onboarding = await github.generateOnboarding(owner, repo);
```

## Webhooks (Coming Soon)

Future webhook support for CI/CD integration:

- `POST /api/webhooks/github` - GitHub webhook handler
- `POST /api/webhooks/analysis` - Analysis completion webhook

## Security Considerations

- All API keys are stored securely in environment variables
- Session tokens are HTTP-only cookies
- GitHub tokens are never exposed to the client
- Claude API requests are server-side only
- Input validation and sanitization on all endpoints

## Monitoring and Logging

- Request/response logging for debugging
- Error tracking and alerting
- Performance monitoring
- Usage analytics and metrics
