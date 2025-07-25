#!/usr/bin/env node

/**
 * Background Agents for Lifetime Maintenance PWA
 * Automated development assistants for faster development
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Agent Configuration
const AGENTS = {
  codeQuality: {
    name: 'Code Quality Agent',
    description: 'Automatically fixes linting issues and code formatting',
    tasks: ['lint', 'format', 'type-check'],
    interval: 30000, // 30 seconds
    enabled: true
  },
  testing: {
    name: 'Testing Agent',
    description: 'Runs tests and generates coverage reports',
    tasks: ['test', 'coverage', 'e2e'],
    interval: 60000, // 1 minute
    enabled: true
  },
  performance: {
    name: 'Performance Agent',
    description: 'Monitors bundle size and performance metrics',
    tasks: ['bundle-analyze', 'lighthouse', 'performance-check'],
    interval: 120000, // 2 minutes
    enabled: true
  },
  security: {
    name: 'Security Agent',
    description: 'Scans for vulnerabilities and security issues',
    tasks: ['audit', 'vulnerability-scan', 'dependency-check'],
    interval: 300000, // 5 minutes
    enabled: true
  },
  documentation: {
    name: 'Documentation Agent',
    description: 'Updates documentation and generates API docs',
    tasks: ['docs-update', 'api-docs', 'readme-update'],
    interval: 600000, // 10 minutes
    enabled: true
  },
  deployment: {
    name: 'Deployment Agent',
    description: 'Handles staging and production deployments',
    tasks: ['build', 'deploy-staging', 'deploy-production'],
    interval: 0, // Manual trigger
    enabled: false
  }
}

class BackgroundAgent {
  constructor(config) {
    this.config = config
    this.isRunning = false
    this.lastRun = null
    this.errors = []
    this.successCount = 0
  }

  async start() {
    if (this.isRunning) return
    this.isRunning = true
    console.log(`🚀 Starting ${this.config.name}...`)
    
    while (this.isRunning) {
      try {
        await this.runTasks()
        this.successCount++
        this.lastRun = new Date()
      } catch (error) {
        this.errors.push({
          timestamp: new Date(),
          error: error.message
        })
        console.error(`❌ ${this.config.name} error:`, error.message)
      }
      
      if (this.config.interval > 0) {
        await this.sleep(this.config.interval)
      } else {
        break
      }
    }
  }

  async runTasks() {
    for (const task of this.config.tasks) {
      await this.executeTask(task)
    }
  }

  async executeTask(taskName) {
    console.log(`🔧 ${this.config.name} executing: ${taskName}`)
    
    switch (taskName) {
      case 'lint':
        await this.runLint()
        break
      case 'format':
        await this.runFormat()
        break
      case 'test':
        await this.runTests()
        break
      case 'coverage':
        await this.runCoverage()
        break
      case 'bundle-analyze':
        await this.analyzeBundle()
        break
      case 'audit':
        await this.runAudit()
        break
      case 'docs-update':
        await this.updateDocs()
        break
      case 'build':
        await this.runBuild()
        break
      default:
        console.log(`⚠️ Unknown task: ${taskName}`)
    }
  }

  async runLint() {
    try {
      execSync('npm run lint', { stdio: 'pipe' })
      console.log('✅ Linting passed')
    } catch (error) {
      // Try to auto-fix
      try {
        execSync('npm run lint -- --fix', { stdio: 'pipe' })
        console.log('🔧 Auto-fixed linting issues')
      } catch (fixError) {
        throw new Error(`Linting failed: ${fixError.message}`)
      }
    }
  }

  async runFormat() {
    try {
      execSync('npx prettier --write "src/**/*.{js,jsx,ts,tsx,css,md}"', { stdio: 'pipe' })
      console.log('✅ Code formatted')
    } catch (error) {
      console.warn('⚠️ Formatting failed:', error.message)
    }
  }

  async runTests() {
    try {
      execSync('npm run test:run', { stdio: 'pipe' })
      console.log('✅ Tests passed')
    } catch (error) {
      throw new Error(`Tests failed: ${error.message}`)
    }
  }

  async runCoverage() {
    try {
      execSync('npm run test:coverage', { stdio: 'pipe' })
      console.log('✅ Coverage report generated')
    } catch (error) {
      console.warn('⚠️ Coverage failed:', error.message)
    }
  }

  async analyzeBundle() {
    try {
      execSync('npm run build', { stdio: 'pipe' })
      const stats = this.getBundleStats()
      console.log(`📊 Bundle size: ${stats.size}KB`)
      
      if (stats.size > 500) {
        console.warn('⚠️ Bundle size exceeds 500KB target')
      }
    } catch (error) {
      console.warn('⚠️ Bundle analysis failed:', error.message)
    }
  }

  async runAudit() {
    try {
      execSync('npm audit --audit-level moderate', { stdio: 'pipe' })
      console.log('✅ Security audit passed')
    } catch (error) {
      console.warn('⚠️ Security issues found:', error.message)
    }
  }

  async updateDocs() {
    try {
      // Update README with latest stats
      this.updateReadmeStats()
      console.log('✅ Documentation updated')
    } catch (error) {
      console.warn('⚠️ Documentation update failed:', error.message)
    }
  }

  async runBuild() {
    try {
      execSync('npm run build', { stdio: 'pipe' })
      console.log('✅ Build successful')
    } catch (error) {
      throw new Error(`Build failed: ${error.message}`)
    }
  }

  getBundleStats() {
    const distPath = path.join(process.cwd(), 'dist')
    if (!fs.existsSync(distPath)) {
      return { size: 0 }
    }
    
    let totalSize = 0
    const files = fs.readdirSync(distPath)
    
    files.forEach(file => {
      const filePath = path.join(distPath, file)
      const stats = fs.statSync(filePath)
      if (stats.isFile() && file.endsWith('.js')) {
        totalSize += stats.size
      }
    })
    
    return { size: Math.round(totalSize / 1024) }
  }

  updateReadmeStats() {
    const readmePath = path.join(process.cwd(), 'README.md')
    if (!fs.existsSync(readmePath)) return
    
    const stats = this.getBundleStats()
    const testStats = this.getTestStats()
    
    let readme = fs.readFileSync(readmePath, 'utf8')
    
    // Update performance metrics
    readme = readme.replace(
      /Bundle Size.*?KB/,
      `Bundle Size: ${stats.size}KB`
    )
    
    // Update test coverage
    if (testStats.coverage) {
      readme = readme.replace(
        /Test Coverage.*?%/,
        `Test Coverage: ${testStats.coverage}%`
      )
    }
    
    fs.writeFileSync(readmePath, readme)
  }

  getTestStats() {
    const coveragePath = path.join(process.cwd(), 'coverage', 'lcov.info')
    if (!fs.existsSync(coveragePath)) {
      return { coverage: 0 }
    }
    
    try {
      const coverage = fs.readFileSync(coveragePath, 'utf8')
      const lines = coverage.split('\n')
      const summaryLine = lines.find(line => line.startsWith('LF:'))
      
      if (summaryLine) {
        const match = summaryLine.match(/LF:(\d+),LH:(\d+)/)
        if (match) {
          const total = parseInt(match[1])
          const covered = parseInt(match[2])
          const percentage = Math.round((covered / total) * 100)
          return { coverage: percentage }
        }
      }
    } catch (error) {
      console.warn('Could not parse coverage data:', error.message)
    }
    
    return { coverage: 0 }
  }

  stop() {
    this.isRunning = false
    console.log(`🛑 Stopped ${this.config.name}`)
  }

  getStatus() {
    return {
      name: this.config.name,
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      successCount: this.successCount,
      errorCount: this.errors.length,
      recentErrors: this.errors.slice(-5)
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

class AgentManager {
  constructor() {
    this.agents = new Map()
    this.isRunning = false
  }

  initialize() {
    Object.entries(AGENTS).forEach(([key, config]) => {
      if (config.enabled) {
        this.agents.set(key, new BackgroundAgent(config))
      }
    })
  }

  async startAll() {
    if (this.isRunning) return
    
    this.isRunning = true
    console.log('🚀 Starting all background agents...')
    
    const promises = []
    this.agents.forEach(agent => {
      promises.push(agent.start())
    })
    
    await Promise.all(promises)
  }

  async startAgent(agentName) {
    const agent = this.agents.get(agentName)
    if (agent) {
      await agent.start()
    } else {
      console.error(`❌ Agent not found: ${agentName}`)
    }
  }

  stopAgent(agentName) {
    const agent = this.agents.get(agentName)
    if (agent) {
      agent.stop()
    }
  }

  stopAll() {
    this.isRunning = false
    this.agents.forEach(agent => agent.stop())
    console.log('🛑 All agents stopped')
  }

  getStatus() {
    const status = {}
    this.agents.forEach((agent, name) => {
      status[name] = agent.getStatus()
    })
    return status
  }

  listAgents() {
    return Array.from(this.agents.keys())
  }
}

// CLI Interface
if (require.main === module) {
  const manager = new AgentManager()
  manager.initialize()
  
  const command = process.argv[2]
  const agentName = process.argv[3]
  
  switch (command) {
    case 'start':
      if (agentName) {
        manager.startAgent(agentName)
      } else {
        manager.startAll()
      }
      break
    case 'stop':
      if (agentName) {
        manager.stopAgent(agentName)
      } else {
        manager.stopAll()
      }
      break
    case 'status':
      console.log(JSON.stringify(manager.getStatus(), null, 2))
      break
    case 'list':
      console.log('Available agents:', manager.listAgents().join(', '))
      break
    default:
      console.log(`
Background Agents for Lifetime Maintenance PWA

Usage:
  node scripts/background-agents.js <command> [agent]

Commands:
  start [agent]    Start all agents or specific agent
  stop [agent]     Stop all agents or specific agent
  status           Show status of all agents
  list             List available agents

Examples:
  node scripts/background-agents.js start
  node scripts/background-agents.js start codeQuality
  node scripts/background-agents.js status
      `)
  }
}

module.exports = { BackgroundAgent, AgentManager, AGENTS } 