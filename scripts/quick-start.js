#!/usr/bin/env node

/**
 * Quick Start Script for Lifetime Maintenance PWA
 * One-command setup for development with background agents
 */

const { execSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

class QuickStart {
  constructor() {
    this.isSetup = false
    this.devServer = null
    this.agents = null
  }

  async start() {
    console.log('🚀 Quick Start - Lifetime Maintenance PWA')
    console.log('==========================================')
    
    try {
      // Check prerequisites
      await this.checkPrerequisites()
      
      // Setup environment
      await this.setupEnvironment()
      
      // Start development environment
      await this.startDevelopment()
      
      // Show next steps
      this.showNextSteps()
      
    } catch (error) {
      console.error('❌ Quick start failed:', error.message)
      process.exit(1)
    }
  }

  async checkPrerequisites() {
    console.log('\n🔍 Checking prerequisites...')
    
    // Check Node.js version
    try {
      const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim()
      console.log(`✅ Node.js: ${nodeVersion}`)
      
      const version = nodeVersion.replace('v', '').split('.')
      if (parseInt(version[0]) < 18) {
        throw new Error('Node.js 18+ required')
      }
    } catch (error) {
      throw new Error('Node.js not found or version too old')
    }

    // Check npm
    try {
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim()
      console.log(`✅ npm: ${npmVersion}`)
    } catch (error) {
      throw new Error('npm not found')
    }

    // Check if dependencies are installed
    if (!fs.existsSync('node_modules')) {
      console.log('📦 Installing dependencies...')
      execSync('npm install', { stdio: 'inherit' })
    } else {
      console.log('✅ Dependencies already installed')
    }
  }

  async setupEnvironment() {
    console.log('\n⚙️ Setting up environment...')
    
    // Check for .env file
    if (!fs.existsSync('.env')) {
      if (fs.existsSync('.env.example')) {
        console.log('📝 Creating .env file from template...')
        fs.copyFileSync('.env.example', '.env')
        console.log('⚠️ Please update .env with your API keys')
      } else {
        console.log('⚠️ No .env.example found, creating basic .env...')
        const envContent = `# Lifetime Maintenance PWA Environment Variables
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_PERPLEXITY_API_KEY=your_perplexity_api_key_here
`
        fs.writeFileSync('.env', envContent)
        console.log('⚠️ Please update .env with your API keys')
      }
    } else {
      console.log('✅ Environment file exists')
    }

    // Check for required directories
    const requiredDirs = ['src/components', 'src/store', 'src/lib', 'src/test', 'docs']
    requiredDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
        console.log(`📁 Created directory: ${dir}`)
      }
    })
  }

  async startDevelopment() {
    console.log('\n🎯 Starting development environment...')
    
    // Start development server
    console.log('🌐 Starting development server...')
    this.devServer = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      shell: true
    })

    this.devServer.stdout.on('data', (data) => {
      const output = data.toString()
      if (output.includes('Local:')) {
        console.log('✅ Development server ready!')
        this.startBackgroundAgents()
      }
      process.stdout.write(output)
    })

    this.devServer.stderr.on('data', (data) => {
      process.stderr.write(data.toString())
    })

    // Wait for server to start
    await this.waitForServer()
  }

  async startBackgroundAgents() {
    console.log('\n🤖 Starting background agents...')
    
    // Start agents with delays
    setTimeout(() => {
      this.startAgent('codeQuality')
    }, 2000)

    setTimeout(() => {
      this.startAgent('testing')
    }, 4000)

    setTimeout(() => {
      this.startAgent('performance')
    }, 6000)

    setTimeout(() => {
      this.startAgent('security')
    }, 8000)

    setTimeout(() => {
      this.startAgent('documentation')
    }, 10000)
  }

  startAgent(agentName) {
    try {
      const agent = spawn('node', ['scripts/background-agents.js', 'start', agentName], {
        stdio: 'pipe',
        shell: true
      })

      agent.stdout.on('data', (data) => {
        const output = data.toString()
        if (output.includes('Starting')) {
          console.log(`✅ ${agentName} agent started`)
        }
      })

      agent.stderr.on('data', (data) => {
        // Suppress stderr for cleaner output
      })

    } catch (error) {
      console.warn(`⚠️ Failed to start ${agentName} agent:`, error.message)
    }
  }

  async waitForServer() {
    return new Promise((resolve) => {
      const checkServer = () => {
        if (this.devServer && this.devServer.stdout) {
          resolve()
        } else {
          setTimeout(checkServer, 1000)
        }
      }
      checkServer()
    })
  }

  showNextSteps() {
    console.log('\n🎉 Quick Start Complete!')
    console.log('========================')
    console.log('')
    console.log('📱 Your app is running at: http://localhost:5174')
    console.log('')
    console.log('🔧 Available Commands:')
    console.log('  npm run dev:auto     - Full automation mode')
    console.log('  npm run agents:start - Start background agents')
    console.log('  npm run agents:stop  - Stop background agents')
    console.log('  npm run agents:status - Check agent status')
    console.log('  npm run quick:build  - Quick build')
    console.log('  npm run quick:test   - Quick test')
    console.log('  npm run quick:deploy - Quick deploy')
    console.log('')
    console.log('📚 Documentation:')
    console.log('  docs/DEVELOPMENT.md  - Development guide')
    console.log('  README.md            - Project overview')
    console.log('')
    console.log('🚀 Next Steps:')
    console.log('  1. Open http://localhost:5174 in your browser')
    console.log('  2. Test the app on your Galaxy Fold 6')
    console.log('  3. Check agent status: npm run agents:status')
    console.log('  4. Start coding! Background agents will help you')
    console.log('')
    console.log('💡 Tips:')
    console.log('  - Background agents auto-fix code quality issues')
    console.log('  - Tests run automatically on file changes')
    console.log('  - Performance is monitored continuously')
    console.log('  - Security vulnerabilities are scanned regularly')
    console.log('')
    console.log('Press Ctrl+C to stop the development server')
  }

  stop() {
    console.log('\n🛑 Stopping development environment...')
    
    if (this.devServer) {
      this.devServer.kill('SIGTERM')
    }
    
    // Stop all agents
    try {
      execSync('node scripts/background-agents.js stop', { stdio: 'pipe' })
    } catch (error) {
      // Ignore errors when stopping
    }
    
    console.log('✅ Development environment stopped')
  }
}

// CLI Interface
if (require.main === module) {
  const quickStart = new QuickStart()
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    quickStart.stop()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    quickStart.stop()
    process.exit(0)
  })

  // Start quick start
  quickStart.start()
}

module.exports = QuickStart 