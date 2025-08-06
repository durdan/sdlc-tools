# Deployment Guide

This guide covers deploying SDLC Tools to various platforms and environments.

## 🚀 Quick Deploy Options

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/durdan/sdlc-tools)

1. **Connect Repository**
   - Fork the repository to your GitHub account
   - Connect your Vercel account to GitHub
   - Import the project in Vercel dashboard

2. **Environment Variables**
   ```bash
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-generated-secret
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   ANTHROPIC_API_KEY=your-claude-api-key
   ```

3. **GitHub OAuth Configuration**
   - Update your GitHub OAuth app settings
   - Set Homepage URL: `https://your-app.vercel.app`
   - Set Callback URL: `https://your-app.vercel.app/api/auth/callback/github`

4. **Deploy**
   - Vercel will automatically deploy on every push to main
   - Custom domains can be configured in Vercel dashboard

### Netlify

1. **Build Settings**
   ```bash
   Build command: npm run build
   Publish directory: .next
   ```

2. **Environment Variables**
   - Add all required environment variables in Netlify dashboard
   - Ensure NEXTAUTH_URL matches your Netlify domain

3. **Redirects Configuration**
   Create `public/_redirects`:
   ```
   /api/* /.netlify/functions/:splat 200
   /* /index.html 200
   ```

### Railway

1. **Deploy from GitHub**
   ```bash
   # Connect Railway to your GitHub repository
   # Railway will auto-detect Next.js and configure build settings
   ```

2. **Environment Variables**
   - Configure in Railway dashboard
   - Use Railway's generated domain for NEXTAUTH_URL

3. **Custom Domain**
   - Configure custom domain in Railway settings
   - Update GitHub OAuth app with new domain

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  sdlc-tools:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
      - GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    env_file:
      - .env.local
```

### Build and Run

```bash
# Build the image
docker build -t sdlc-tools .

# Run the container
docker run -p 3000:3000 --env-file .env.local sdlc-tools

# Or use docker-compose
docker-compose up
```

## ☁️ Cloud Platform Deployment

### AWS (Elastic Beanstalk)

1. **Prepare Application**
   ```bash
   # Create deployment package
   npm run build
   zip -r sdlc-tools.zip . -x "node_modules/*" ".git/*"
   ```

2. **Elastic Beanstalk Configuration**
   ```json
   {
     "AWSEBDockerrunVersion": 2,
     "containerDefinitions": [
       {
         "name": "sdlc-tools",
         "image": "your-ecr-repo/sdlc-tools:latest",
         "essential": true,
         "memory": 512,
         "portMappings": [
           {
             "hostPort": 80,
             "containerPort": 3000
           }
         ]
       }
     ]
   }
   ```

3. **Environment Variables**
   - Configure in EB environment settings
   - Use AWS Systems Manager for sensitive values

### Google Cloud Platform (Cloud Run)

1. **Build and Push**
   ```bash
   # Build for Cloud Run
   gcloud builds submit --tag gcr.io/PROJECT-ID/sdlc-tools

   # Deploy to Cloud Run
   gcloud run deploy --image gcr.io/PROJECT-ID/sdlc-tools --platform managed
   ```

2. **Environment Variables**
   ```bash
   gcloud run services update sdlc-tools \
     --set-env-vars="NEXTAUTH_URL=https://your-service-url" \
     --set-env-vars="NEXTAUTH_SECRET=your-secret"
   ```

### Azure (Container Instances)

1. **Deploy Container**
   ```bash
   az container create \
     --resource-group myResourceGroup \
     --name sdlc-tools \
     --image your-registry/sdlc-tools:latest \
     --dns-name-label sdlc-tools \
     --ports 3000 \
     --environment-variables \
       NEXTAUTH_URL=https://sdlc-tools.azurecontainer.io \
       NEXTAUTH_SECRET=your-secret
   ```

## 🔧 Production Configuration

### Environment Variables

```bash
# Production settings
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-strong-secret-key

# GitHub OAuth
GITHUB_CLIENT_ID=your-production-client-id
GITHUB_CLIENT_SECRET=your-production-client-secret

# Claude AI
ANTHROPIC_API_KEY=your-production-api-key

# Optional: Analytics and monitoring
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
SENTRY_DSN=your-sentry-dsn
```

### Security Checklist

- [ ] Use strong, unique NEXTAUTH_SECRET
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS policies
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Configure CSP (Content Security Policy)
- [ ] Use environment-specific API keys
- [ ] Enable logging and monitoring

### Performance Optimization

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
    optimizeImages: true,
  },
  images: {
    domains: ['avatars.githubusercontent.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
}
```

### Database Considerations

If you plan to add persistent storage:

```bash
# PostgreSQL (recommended)
DATABASE_URL=postgresql://user:password@host:port/database

# Redis for caching
REDIS_URL=redis://user:password@host:port
```

## 📊 Monitoring and Logging

### Application Monitoring

```javascript
// lib/monitoring.js
import { init } from '@sentry/nextjs'

init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

### Health Check Endpoint

```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
  })
}
```

### Logging Configuration

```javascript
// lib/logger.js
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🚨 Troubleshooting

### Common Issues

1. **OAuth Redirect Mismatch**
   - Ensure GitHub OAuth app callback URL matches deployment URL
   - Check NEXTAUTH_URL environment variable

2. **Build Failures**
   - Verify all environment variables are set
   - Check for TypeScript errors: `npm run type-check`

3. **API Rate Limits**
   - Monitor GitHub API usage
   - Implement caching for repository data

4. **Memory Issues**
   - Increase container memory limits
   - Optimize Claude API usage

### Debug Commands

```bash
# Check build output
npm run build

# Analyze bundle size
npm run analyze

# Check for security vulnerabilities
npm audit

# Test production build locally
npm run start
```

## 📞 Support

For deployment issues:
- 📧 Email: [deploy@sdlc.dev](mailto:deploy@sdlc.dev)
- 💬 Discord: [Join our community](https://discord.gg/sdlc-tools)
- 🐛 Issues: [GitHub Issues](https://github.com/durdan/sdlc-tools/issues)
