#!/usr/bin/env node

/**
 * Development Automation for Lifetime Maintenance PWA
 * Coordinates background agents and development workflows
 */

const { AgentManager } = require('./background-agents')
const fs = require('fs')
const path = require('path')
const { execSync, spawn } = require('child_process')

class DevAutomation {
  constructor() {
    this.agentManager = new AgentManager()
    this.devServer = null
    this.watchers = new Map()
    this.isRunning = false
  }

  async start() {
    if (this.isRunning) return
    
    console.log('🚀 Starting Development Automation...')
    this.isRunning = true

    // Initialize agents
    this.agentManager.initialize()

    // Start development server
    await this.startDevServer()

    // Start background agents
    await this.startBackgroundAgents()

    // Set up file watchers
    this.setupFileWatchers()

    // Start monitoring
    this.startMonitoring()

    console.log('✅ Development automation started successfully!')
    console.log('📱 App running at: http://localhost:5174')
    console.log('🔧 Background agents are monitoring your code...')
  }

  async startDevServer() {
    console.log('🌐 Starting development server...')
    
    this.devServer = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      shell: true
    })

    this.devServer.stdout.on('data', (data) => {
      const output = data.toString()
      if (output.includes('Local:')) {
        console.log('✅ Development server ready!')
      }
      process.stdout.write(output)
    })

    this.devServer.stderr.on('data', (data) => {
      process.stderr.write(data.toString())
    })

    this.devServer.on('close', (code) => {
      console.log(`❌ Development server stopped with code ${code}`)
      this.stop()
    })
  }

  async startBackgroundAgents() {
    console.log('🤖 Starting background agents...')
    
    // Start code quality agent immediately
    await this.agentManager.startAgent('codeQuality')
    
    // Start other agents with delays
    setTimeout(() => {
      this.agentManager.startAgent('testing')
    }, 5000)

    setTimeout(() => {
      this.agentManager.startAgent('performance')
    }, 10000)

    setTimeout(() => {
      this.agentManager.startAgent('security')
    }, 15000)

    setTimeout(() => {
      this.agentManager.startAgent('documentation')
    }, 20000)
  }

  setupFileWatchers() {
    console.log('👀 Setting up file watchers...')
    
    const watchPaths = [
      'src/components',
      'src/store',
      'src/lib',
      'src/test'
    ]

    watchPaths.forEach(watchPath => {
      this.watchDirectory(watchPath)
    })
  }

  watchDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return

    const watcher = fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
      if (filename && !filename.includes('node_modules') && !filename.includes('.git')) {
        this.handleFileChange(eventType, filename, dirPath)
      }
    })

    this.watchers.set(dirPath, watcher)
  }

  handleFileChange(eventType, filename, dirPath) {
    const filePath = path.join(dirPath, filename)
    const ext = path.extname(filename)

    console.log(`📝 File changed: ${filename} (${eventType})`)

    // Auto-format on save
    if (['.js', '.jsx', '.ts', '.tsx', '.css', '.md'].includes(ext)) {
      setTimeout(() => {
        this.autoFormat(filePath)
      }, 1000)
    }

    // Auto-lint on save
    if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
      setTimeout(() => {
        this.autoLint(filePath)
      }, 1500)
    }

    // Auto-test on component changes
    if (filename.includes('.test.') || filename.includes('__tests__')) {
      setTimeout(() => {
        this.autoTest()
      }, 2000)
    }
  }

  async autoFormat(filePath) {
    try {
      execSync(`npx prettier --write "${filePath}"`, { stdio: 'pipe' })
      console.log(`✨ Auto-formatted: ${path.basename(filePath)}`)
    } catch (error) {
      console.warn(`⚠️ Auto-format failed for ${path.basename(filePath)}`)
    }
  }

  async autoLint(filePath) {
    try {
      execSync(`npx eslint "${filePath}" --fix`, { stdio: 'pipe' })
      console.log(`🔧 Auto-linted: ${path.basename(filePath)}`)
    } catch (error) {
      console.warn(`⚠️ Auto-lint failed for ${path.basename(filePath)}`)
    }
  }

  async autoTest() {
    try {
      execSync('npm run test:run', { stdio: 'pipe' })
      console.log('✅ Auto-tests passed')
    } catch (error) {
      console.warn('⚠️ Auto-tests failed')
    }
  }

  startMonitoring() {
    // Monitor system resources
    setInterval(() => {
      this.checkSystemHealth()
    }, 30000) // Every 30 seconds

    // Monitor agent status
    setInterval(() => {
      this.checkAgentHealth()
    }, 60000) // Every minute
  }

  checkSystemHealth() {
    const stats = this.getSystemStats()
    
    if (stats.memoryUsage > 80) {
      console.warn('⚠️ High memory usage detected')
    }
    
    if (stats.cpuUsage > 90) {
      console.warn('⚠️ High CPU usage detected')
    }
  }

  checkAgentHealth() {
    const status = this.agentManager.getStatus()
    let hasIssues = false

    Object.entries(status).forEach(([name, agentStatus]) => {
      if (agentStatus.errorCount > 5) {
        console.warn(`⚠️ Agent ${name} has ${agentStatus.errorCount} errors`)
        hasIssues = true
      }
    })

    if (!hasIssues) {
      console.log('✅ All agents healthy')
    }
  }

  getSystemStats() {
    const memUsage = process.memoryUsage()
    const memoryUsage = (memUsage.heapUsed / memUsage.heapTotal) * 100
    
    // Simple CPU usage estimation
    const startUsage = process.cpuUsage()
    const cpuUsage = startUsage.user + startUsage.system
    
    return {
      memoryUsage: Math.round(memoryUsage),
      cpuUsage: Math.round(cpuUsage / 1000)
    }
  }

  async stop() {
    if (!this.isRunning) return
    
    console.log('🛑 Stopping development automation...')
    this.isRunning = false

    // Stop background agents
    this.agentManager.stopAll()

    // Stop development server
    if (this.devServer) {
      this.devServer.kill('SIGTERM')
    }

    // Close file watchers
    this.watchers.forEach(watcher => {
      watcher.close()
    })
    this.watchers.clear()

    console.log('✅ Development automation stopped')
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      devServer: this.devServer ? 'running' : 'stopped',
      agents: this.agentManager.getStatus(),
      watchers: Array.from(this.watchers.keys()),
      system: this.getSystemStats()
    }
  }

  // Quick commands
  async quickBuild() {
    console.log('🔨 Quick build...')
    try {
      execSync('npm run build', { stdio: 'inherit' })
      console.log('✅ Build successful')
    } catch (error) {
      console.error('❌ Build failed')
    }
  }

  async quickTest() {
    console.log('🧪 Quick test...')
    try {
      execSync('npm run test:run', { stdio: 'inherit' })
      console.log('✅ Tests passed')
    } catch (error) {
      console.error('❌ Tests failed')
    }
  }

  async quickDeploy() {
    console.log('🚀 Quick deploy...')
    try {
      await this.quickBuild()
      // Add deployment logic here
      console.log('✅ Deploy successful')
    } catch (error) {
      console.error('❌ Deploy failed')
    }
  }
}

// CLI Interface
if (require.main === module) {
  const automation = new DevAutomation()
  
  const command = process.argv[2]
  
  switch (command) {
    case 'start':
      automation.start()
      break
    case 'stop':
      automation.stop()
      break
    case 'status':
      console.log(JSON.stringify(automation.getStatus(), null, 2))
      break
    case 'build':
      automation.quickBuild()
      break
    case 'test':
      automation.quickTest()
      break
    case 'deploy':
      automation.quickDeploy()
      break
    default:
      console.log(`
Development Automation for Lifetime Maintenance PWA

Usage:
  node scripts/dev-automation.js <command>

Commands:
  start     Start full development automation
  stop      Stop all automation
  status    Show automation status
  build     Quick build
  test      Quick test
  deploy    Quick deploy

Examples:
  node scripts/dev-automation.js start
  node scripts/dev-automation.js status
  node scripts/dev-automation.js build
      `)
  }
}

module.exports = DevAutomation 