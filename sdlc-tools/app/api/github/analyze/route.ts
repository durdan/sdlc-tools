import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GitHubService } from '@/lib/github'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in with GitHub' },
        { status: 401 }
      )
    }

    const { owner, repo } = await request.json()
    
    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Missing required parameters: owner and repo' },
        { status: 400 }
      )
    }

    const githubService = new GitHubService(session.accessToken)
    
    // Get comprehensive repository data
    const [repoDetails, pullRequests, issues] = await Promise.all([
      githubService.getRepoDetails(owner, repo),
      githubService.getRepoPullRequests(owner, repo),
      githubService.getRepoIssues(owner, repo)
    ])

    // Basic analysis data structure
    const analysisResult = {
      repository: {
        name: repoDetails.repo.name,
        fullName: repoDetails.repo.full_name,
        description: repoDetails.repo.description,
        language: repoDetails.repo.language,
        size: repoDetails.repo.size,
        stargazersCount: repoDetails.repo.stargazers_count,
        forksCount: repoDetails.repo.forks_count,
        openIssuesCount: repoDetails.repo.open_issues_count,
        createdAt: repoDetails.repo.created_at,
        updatedAt: repoDetails.repo.updated_at,
        htmlUrl: repoDetails.repo.html_url
      },
      languages: repoDetails.languages,
      contributors: repoDetails.contributors.map(contributor => ({
        login: contributor.login,
        contributions: contributor.contributions,
        htmlUrl: contributor.html_url
      })),
      recentCommits: repoDetails.recentCommits.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author?.name,
        date: commit.commit.author?.date,
        htmlUrl: commit.html_url
      })),
      pullRequests: pullRequests,
      issues: issues,
      analysis: {
        timestamp: new Date().toISOString(),
        status: 'basic_complete',
        summary: {
          totalContributors: repoDetails.contributors.length,
          totalCommits: repoDetails.recentCommits.length,
          openPullRequests: pullRequests.filter(pr => pr.state === 'open').length,
          closedPullRequests: pullRequests.filter(pr => pr.state === 'closed').length,
          openIssues: issues.filter(issue => issue.state === 'open').length,
          closedIssues: issues.filter(issue => issue.state === 'closed').length,
          primaryLanguage: repoDetails.repo.language,
          languageCount: Object.keys(repoDetails.languages).length
        }
      }
    }

    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error('Error analyzing repository:', error)
    return NextResponse.json(
      { error: 'Failed to analyze repository' },
      { status: 500 }
    )
  }
}
