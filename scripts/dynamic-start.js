#!/usr/bin/env node

/**
 * Dynamic Startup Script
 * Automatically finds available ports and starts all services
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const portFinder = require('./port-finder');

console.log('🚀 Dynamic Startup - Finding Available Ports...\n');

// Store port configuration
let portConfig = {};
let processes = [];

// Function to find available ports
async function findPorts() {
  try {
    console.log('🔍 Scanning for available ports...');
    portConfig = await portFinder.getPortConfig();
    
    console.log('✅ Port Configuration Found:');
    console.log(JSON.stringify(portConfig, null, 2));
    console.log();
    
    return portConfig;
  } catch (error) {
    console.error('❌ Failed to find available ports:', error.message);
    process.exit(1);
  }
}

// Function to start Vite dev server
function startVite(port) {
  console.log(`🌐 Starting Vite dev server on port ${port}...`);
  
  const vite = spawn('npm', ['run', 'dev'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_PORT: port.toString(),
      VITE_API_URL: `http://localhost:${portConfig.api}`,
      VITE_BACKEND_URL: `http://localhost:${portConfig.backend}`
    }
  });

  vite.on('error', (err) => {
    console.error('❌ Failed to start Vite:', err.message);
  });

  vite.on('close', (code) => {
    console.log(`🛑 Vite server stopped with code: ${code}`);
  });

  processes.push({ name: 'Vite', process: vite });
  return vite;
}

// Function to start Node.js API server
function startNodeAPI(port) {
  console.log(`🔧 Starting Node.js API server on port ${port}...`);
  
  const api = spawn('node', ['backend/server.js'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: port.toString(),
      FRONTEND_URL: `http://localhost:${portConfig.vite}`
    }
  });

  api.on('error', (err) => {
    console.error('❌ Failed to start Node.js API:', err.message);
  });

  api.on('close', (code) => {
    console.log(`🛑 Node.js API server stopped with code: ${code}`);
  });

  processes.push({ name: 'Node.js API', process: api });
  return api;
}

// Function to start FastAPI backend
function startFastAPI(port) {
  console.log(`🐍 Starting FastAPI backend on port ${port}...`);
  
  const fastapi = spawn('py', ['start-simple.py'], {
    cwd: path.join(process.cwd(), 'backend'),
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: port.toString()
    }
  });

  fastapi.on('error', (err) => {
    console.error('❌ Failed to start FastAPI:', err.message);
  });

  fastapi.on('close', (code) => {
    console.log(`🛑 FastAPI server stopped with code: ${code}`);
  });

  processes.push({ name: 'FastAPI', process: fastapi });
  return fastapi;
}

// Function to create environment file with port configuration
function createEnvFile() {
  const envContent = `# Dynamic Port Configuration
VITE_PORT=${portConfig.vite}
VITE_API_URL=http://localhost:${portConfig.api}
VITE_BACKEND_URL=http://localhost:${portConfig.backend}
API_PORT=${portConfig.api}
BACKEND_PORT=${portConfig.backend}
FRONTEND_URL=http://localhost:${portConfig.vite}

# Other environment variables
NODE_ENV=development
`;

  fs.writeFileSync('.env.dynamic', envContent);
  console.log('📝 Created .env.dynamic with port configuration');
}

// Function to display service URLs
function displayUrls() {
  console.log('\n🎯 Service URLs:');
  console.log(`📱 Frontend (Vite): http://localhost:${portConfig.vite}`);
  console.log(`🔧 Node.js API: http://localhost:${portConfig.api}`);
  console.log(`🐍 FastAPI Backend: http://localhost:${portConfig.backend}`);
  console.log(`📚 API Docs: http://localhost:${portConfig.backend}/docs`);
  console.log(`🔍 Health Check: http://localhost:${portConfig.api}/health`);
  console.log();
}

// Function to handle graceful shutdown
function setupGracefulShutdown() {
  const shutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
    
    processes.forEach(({ name, process: proc }) => {
      console.log(`🛑 Stopping ${name}...`);
      proc.kill('SIGTERM');
    });
    
    setTimeout(() => {
      processes.forEach(({ name, process: proc }) => {
        if (!proc.killed) {
          console.log(`🔨 Force killing ${name}...`);
          proc.kill('SIGKILL');
        }
      });
      process.exit(0);
    }, 5000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// Main startup function
async function startAllServices() {
  try {
    // Find available ports
    await findPorts();
    
    // Create environment file
    createEnvFile();
    
    // Setup graceful shutdown
    setupGracefulShutdown();
    
    // Start services with delays to avoid conflicts
    console.log('🚀 Starting all services...\n');
    
    // Start FastAPI first (takes longer to start)
    startFastAPI(portConfig.backend);
    
    // Wait a bit, then start Node.js API
    setTimeout(() => {
      startNodeAPI(portConfig.api);
    }, 2000);
    
    // Wait a bit more, then start Vite
    setTimeout(() => {
      startVite(portConfig.vite);
    }, 4000);
    
    // Display URLs after a delay
    setTimeout(() => {
      displayUrls();
      console.log('✅ All services started! Press Ctrl+C to stop.');
    }, 6000);
    
  } catch (error) {
    console.error('❌ Failed to start services:', error.message);
    process.exit(1);
  }
}

// CLI options
const args = process.argv.slice(2);
const options = {
  services: args.includes('--all') ? ['vite', 'api', 'backend'] : 
             args.includes('--frontend') ? ['vite'] :
             args.includes('--api') ? ['api'] :
             args.includes('--backend') ? ['backend'] : ['vite', 'api', 'backend']
};

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🚀 Dynamic Startup Script

Usage: node scripts/dynamic-start.js [options]

Options:
  --all        Start all services (default)
  --frontend   Start only Vite frontend
  --api        Start only Node.js API
  --backend    Start only FastAPI backend
  --help, -h   Show this help message

Examples:
  node scripts/dynamic-start.js --all
  node scripts/dynamic-start.js --frontend
  node scripts/dynamic-start.js --api --backend
`);
  process.exit(0);
}

// Start services based on options
startAllServices(); 