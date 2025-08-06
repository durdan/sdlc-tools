import { Octokit } from "@octokit/rest"

export class GitHubService {
  private octokit: Octokit

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    })
  }

  async getUserRepos() {
    try {
      const response = await this.octokit.rest.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100,
        type: 'all'
      })

      return response.data.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        language: repo.language,
        stargazersCount: repo.stargazers_count,
        forksCount: repo.forks_count,
        updatedAt: repo.updated_at,
        htmlUrl: repo.html_url,
        cloneUrl: repo.clone_url,
        private: repo.private,
        size: repo.size
      }))
    } catch (error) {
      console.error('Error fetching user repos:', error)
      throw new Error('Failed to fetch repositories')
    }
  }

  async getRepoDetails(owner: string, repo: string) {
    try {
      const [repoInfo, languages, contributors, commits] = await Promise.all([
        this.octokit.rest.repos.get({ owner, repo }),
        this.octokit.rest.repos.listLanguages({ owner, repo }),
        this.octokit.rest.repos.listContributors({ owner, repo, per_page: 10 }),
        this.octokit.rest.repos.listCommits({ owner, repo, per_page: 10 })
      ])

      return {
        repo: repoInfo.data,
        languages: languages.data,
        contributors: contributors.data,
        recentCommits: commits.data
      }
    } catch (error) {
      console.error('Error fetching repo details:', error)
      throw new Error('Failed to fetch repository details')
    }
  }

  async getRepoContents(owner: string, repo: string, path: string = '') {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path
      })

      return response.data
    } catch (error) {
      console.error('Error fetching repo contents:', error)
      throw new Error('Failed to fetch repository contents')
    }
  }

  async getRepoPullRequests(owner: string, repo: string) {
    try {
      const response = await this.octokit.rest.pulls.list({
        owner,
        repo,
        state: 'all',
        sort: 'updated',
        per_page: 20
      })

      return response.data.map(pr => ({
        id: pr.id,
        number: pr.number,
        title: pr.title,
        state: pr.state,
        createdAt: pr.created_at,
        updatedAt: pr.updated_at,
        user: pr.user?.login,
        htmlUrl: pr.html_url
      }))
    } catch (error) {
      console.error('Error fetching pull requests:', error)
      throw new Error('Failed to fetch pull requests')
    }
  }

  async getRepoIssues(owner: string, repo: string) {
    try {
      const response = await this.octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: 'all',
        sort: 'updated',
        per_page: 20
      })

      return response.data.map(issue => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        state: issue.state,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        user: issue.user?.login,
        htmlUrl: issue.html_url,
        labels: issue.labels.map(label => typeof label === 'string' ? label : label.name)
      }))
    } catch (error) {
      console.error('Error fetching issues:', error)
      throw new Error('Failed to fetch issues')
    }
  }

  // Enhanced analytics methods for comprehensive repository analysis
  async getComprehensiveRepoAnalytics(owner: string, repo: string) {
    try {
      const [repoDetails, codeFrequency, participation, punchCard, releases, deployments, traffic] = await Promise.all([
        this.getRepoDetails(owner, repo),
        this.getCodeFrequency(owner, repo),
        this.getParticipation(owner, repo),
        this.getPunchCardStats(owner, repo),
        this.getReleases(owner, repo),
        this.getDeployments(owner, repo),
        this.getTrafficStats(owner, repo)
      ])

      return {
        ...repoDetails,
        analytics: {
          codeFrequency,
          participation,
          punchCard,
          releases,
          deployments,
          traffic
        }
      }
    } catch (error) {
      console.error('Error fetching comprehensive analytics:', error)
      throw new Error('Failed to fetch comprehensive analytics')
    }
  }

  async getCodeFrequency(owner: string, repo: string) {
    try {
      const response = await this.octokit.rest.repos.getCodeFrequencyStats({
        owner,
        repo
      })
      return response.data
    } catch (error) {
      console.warn('Code frequency stats not available:', error)
      return []
    }
  }

  async getParticipation(owner: string, repo: string) {
    try {
      const response = await this.octokit.rest.repos.getParticipationStats({
        owner,
        repo
      })
      return response.data
    } catch (error) {
      console.warn('Participation stats not available:', error)
      return { all: [], owner: [] }
    }
  }

  async getPunchCardStats(owner: string, repo: string) {
    try {
      const response = await this.octokit.rest.repos.getPunchCardStats({
        owner,
        repo
      })
      return response.data
    } catch (error) {
      console.warn('Punch card stats not available:', error)
      return []
    }
  }

  async getReleases(owner: string, repo: string) {
    try {
      const response = await this.octokit.rest.repos.listReleases({
        owner,
        repo,
        per_page: 10
      })
      return response.data.map(release => ({
        id: release.id,
        tagName: release.tag_name,
        name: release.name,
        publishedAt: release.published_at,
        prerelease: release.prerelease,
        draft: release.draft,
        htmlUrl: release.html_url
      }))
    } catch (error) {
      console.warn('Releases not available:', error)
      return []
    }
  }

  async getDeployments(owner: string, repo: string) {
    try {
      const response = await this.octokit.rest.repos.listDeployments({
        owner,
        repo,
        per_page: 10
      })
      return response.data.map(deployment => ({
        id: deployment.id,
        environment: deployment.environment,
        createdAt: deployment.created_at,
        updatedAt: deployment.updated_at,
        ref: deployment.ref
      }))
    } catch (error) {
      console.warn('Deployments not available:', error)
      return []
    }
  }

  async getTrafficStats(owner: string, repo: string) {
    try {
      const [views, clones, referrers, paths] = await Promise.all([
        this.octokit.rest.repos.getViews({ owner, repo }).catch(() => ({ data: { count: 0, uniques: 0, views: [] } })),
        this.octokit.rest.repos.getClones({ owner, repo }).catch(() => ({ data: { count: 0, uniques: 0, clones: [] } })),
        this.octokit.rest.repos.getTopReferrers({ owner, repo }).catch(() => ({ data: [] })),
        this.octokit.rest.repos.getTopPaths({ owner, repo }).catch(() => ({ data: [] }))
      ])

      return {
        views: views.data,
        clones: clones.data,
        referrers: referrers.data,
        paths: paths.data
      }
    } catch (error) {
      console.warn('Traffic stats not available:', error)
      return {
        views: { count: 0, uniques: 0, views: [] },
        clones: { count: 0, uniques: 0, clones: [] },
        referrers: [],
        paths: []
      }
    }
  }

  async getRepositoryTree(owner: string, repo: string, sha: string = 'HEAD') {
    try {
      const response = await this.octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: sha,
        recursive: 'true'
      })
      return response.data.tree
    } catch (error) {
      console.error('Error fetching repository tree:', error)
      throw new Error('Failed to fetch repository tree')
    }
  }

  async getFileContent(owner: string, repo: string, path: string) {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path
      })
      
      if ('content' in response.data) {
        return {
          content: Buffer.from(response.data.content, 'base64').toString('utf-8'),
          size: response.data.size,
          sha: response.data.sha
        }
      }
      return null
    } catch (error) {
      console.error('Error fetching file content:', error)
      return null
    }
  }
}
