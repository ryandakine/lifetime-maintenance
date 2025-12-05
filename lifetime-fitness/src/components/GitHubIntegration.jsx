import React, { useState, useEffect } from 'react'
import { API_KEYS } from '../lib/supabase'
import { 
  Github, 
  GitBranch, 
  GitCommit, 
  GitPullRequest, 
  Star, 
  Eye, 
  Download,
  Calendar,
  TrendingUp,
  Users,
  Code,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Brain,
  Lightbulb
} from 'lucide-react'

const GitHubIntegration = () => {
  const [repos, setRepos] = useState([])
  const [selectedRepo, setSelectedRepo] = useState(null)
  const [repoStats, setRepoStats] = useState({})
  const [commits, setCommits] = useState([])
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (API_KEYS.GITHUB_TOKEN) {
      loadUserRepos()
    }
  }, [])

  const loadUserRepos = async () => {
    setLoading(true)
    try {
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=10', {
        headers: {
          'Authorization': `token ${API_KEYS.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const data = await response.json()
      setRepos(data)
      
      // Generate insights for the most active repos
      if (data.length > 0) {
        await generateRepoInsights(data.slice(0, 3))
      }
    } catch (error) {
      console.error('Error loading GitHub repos:', error)
      setError('Failed to load repositories. Check your GitHub token.')
    } finally {
      setLoading(false)
    }
  }

  const loadRepoStats = async (repoName) => {
    try {
      const [statsResponse, commitsResponse] = await Promise.all([
        fetch(`https://api.github.com/repos/${repoName}`, {
          headers: {
            'Authorization': `token ${API_KEYS.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }),
        fetch(`https://api.github.com/repos/${repoName}/commits?per_page=10`, {
          headers: {
            'Authorization': `token ${API_KEYS.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        })
      ])

      if (statsResponse.ok && commitsResponse.ok) {
        const stats = await statsResponse.json()
        const commitsData = await commitsResponse.json()
        
        setRepoStats(stats)
        setCommits(commitsData)
        setSelectedRepo(repoName)
      }
    } catch (error) {
      console.error('Error loading repo stats:', error)
    }
  }

  const generateRepoInsights = async (repos) => {
    try {
      const insights = []
      
      for (const repo of repos) {
        const insight = {
          repo: repo.name,
          type: 'activity',
          message: `Repository ${repo.name} was last updated ${getTimeAgo(repo.updated_at)}`,
          priority: repo.stargazers_count > 10 ? 'high' : 'medium',
          action: 'view_repo'
        }
        
        // Add language insights
        if (repo.language) {
          insights.push({
            repo: repo.name,
            type: 'language',
            message: `Primary language: ${repo.language}`,
            priority: 'low',
            action: 'analyze_code'
          })
        }
        
        // Add star insights
        if (repo.stargazers_count > 0) {
          insights.push({
            repo: repo.name,
            type: 'popularity',
            message: `${repo.stargazers_count} stars - This repo is gaining attention!`,
            priority: 'medium',
            action: 'celebrate'
          })
        }
        
        insights.push(insight)
      }
      
      setInsights(insights)
    } catch (error) {
      console.error('Error generating insights:', error)
    }
  }

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)} days ago`
    } else {
      return `${Math.floor(diffInHours / 168)} weeks ago`
    }
  }

  const getCommitMessage = (commit) => {
    return commit.commit.message.split('\n')[0]
  }

  const getCommitAuthor = (commit) => {
    return commit.commit.author.name || commit.author?.login || 'Unknown'
  }

  const renderRepoCard = (repo) => (
    <div key={repo.id} className="repo-card" onClick={() => loadRepoStats(repo.full_name)}>
      <div className="repo-header">
        <h4>{repo.name}</h4>
        <div className="repo-stats">
          <span className="stat">
            <Star size={14} />
            {repo.stargazers_count}
          </span>
          <span className="stat">
            <GitBranch size={14} />
            {repo.forks_count}
          </span>
          <span className="stat">
            <Eye size={14} />
            {repo.watchers_count}
          </span>
        </div>
      </div>
      
      <p className="repo-description">{repo.description || 'No description'}</p>
      
      <div className="repo-meta">
        {repo.language && (
          <span className="language">{repo.language}</span>
        )}
        <span className="updated">Updated {getTimeAgo(repo.updated_at)}</span>
      </div>
      
      <div className="repo-actions">
        <button
          onClick={(e) => {
            e.stopPropagation()
            window.open(repo.html_url, '_blank')
          }}
          className="view-btn"
        >
          View on GitHub
        </button>
      </div>
    </div>
  )

  const renderRepoStats = () => {
    if (!selectedRepo || !repoStats.id) return null

    return (
      <div className="repo-stats-detail">
        <h3>{selectedRepo}</h3>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h4>{repoStats.stargazers_count}</h4>
            <p>Stars</p>
          </div>
          <div className="stat-card">
            <h4>{repoStats.forks_count}</h4>
            <p>Forks</p>
          </div>
          <div className="stat-card">
            <h4>{repoStats.watchers_count}</h4>
            <p>Watchers</p>
          </div>
          <div className="stat-card">
            <h4>{repoStats.open_issues_count}</h4>
            <p>Open Issues</p>
          </div>
        </div>
        
        <div className="commits-section">
          <h4>Recent Commits</h4>
          {commits.map(commit => (
            <div key={commit.sha} className="commit-item">
              <div className="commit-info">
                <p className="commit-message">{getCommitMessage(commit)}</p>
                <p className="commit-author">{getCommitAuthor(commit)}</p>
              </div>
              <span className="commit-date">{getTimeAgo(commit.commit.author.date)}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderInsights = () => {
    if (insights.length === 0) return null

    return (
      <div className="insights-section">
        <h3><Brain size={20} /> Repository Insights</h3>
        <div className="insights-grid">
          {insights.map((insight, index) => (
            <div key={index} className={`insight-card ${insight.type}`}>
              <div className="insight-header">
                <h4>{insight.repo}</h4>
                <span className={`priority-badge ${insight.priority}`}>
                  {insight.priority}
                </span>
              </div>
              <p>{insight.message}</p>
              <button
                onClick={() => {
                  if (insight.action === 'view_repo') {
                    loadRepoStats(insight.repo)
                  }
                }}
                className="action-btn"
              >
                {insight.action === 'view_repo' ? 'View Details' : 'Take Action'}
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!API_KEYS.GITHUB_TOKEN) {
    return (
      <div className="github-integration">
        <div className="error-message">
          <AlertCircle size={24} />
          <h3>GitHub Integration Not Configured</h3>
          <p>Please add your GitHub personal access token to enable repository insights.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="github-integration">
      <div className="github-header">
        <h2><Github size={24} /> GitHub Integration</h2>
        <p>Smart insights and analytics for your repositories</p>
      </div>

      {error && (
        <div className="error-alert">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Repository List */}
      <div className="repos-section">
        <div className="section-header">
          <h3>Your Repositories</h3>
          <button
            onClick={loadUserRepos}
            className="refresh-btn"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div className="repos-grid">
          {repos.map(renderRepoCard)}
        </div>
      </div>

      {/* Repository Stats */}
      {renderRepoStats()}

      {/* Insights */}
      {renderInsights()}

      <style jsx>{`
        .repos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .repo-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .repo-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        
        .repo-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }
        
        .repo-header h4 {
          margin: 0;
          color: var(--primary-color);
        }
        
        .repo-stats {
          display: flex;
          gap: 0.5rem;
        }
        
        .stat {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8rem;
          color: var(--secondary-color);
        }
        
        .repo-description {
          margin: 0.5rem 0;
          font-size: 0.9rem;
          color: var(--text-color);
        }
        
        .repo-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .language {
          background: var(--primary-color);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
        }
        
        .updated {
          font-size: 0.8rem;
          color: var(--secondary-color);
        }
        
        .view-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 1rem;
          margin: 1rem 0;
        }
        
        .stat-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
        }
        
        .stat-card h4 {
          margin: 0;
          font-size: 1.5rem;
          color: var(--primary-color);
        }
        
        .stat-card p {
          margin: 0.25rem 0 0 0;
          font-size: 0.8rem;
          color: var(--secondary-color);
        }
        
        .commits-section {
          margin-top: 1rem;
        }
        
        .commit-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        
        .commit-message {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        .commit-author {
          margin: 0.25rem 0 0 0;
          font-size: 0.8rem;
          color: var(--secondary-color);
        }
        
        .commit-date {
          font-size: 0.8rem;
          color: var(--secondary-color);
        }
        
        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .insight-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1rem;
        }
        
        .insight-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .priority-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .priority-badge.high {
          background: var(--error-color);
          color: white;
        }
        
        .priority-badge.medium {
          background: var(--warning-color);
          color: white;
        }
        
        .priority-badge.low {
          background: var(--success-color);
          color: white;
        }
        
        .action-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          margin-top: 0.5rem;
        }
        
        .error-message {
          text-align: center;
          padding: 2rem;
          color: var(--error-color);
        }
        
        .error-alert {
          background: var(--error-color);
          color: white;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  )
}

export default GitHubIntegration 