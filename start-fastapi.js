#!/usr/bin/env node

/**
 * FastAPI Backend Startup Script
 * Handles dependency installation and server startup
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting FastAPI Backend...\n');

// Check if backend directory exists
const backendPath = path.join(__dirname, 'backend');
if (!fs.existsSync(backendPath)) {
  console.error('❌ Backend directory not found');
  process.exit(1);
}

// Function to install Python dependencies
function installDependencies() {
  return new Promise((resolve, reject) => {
    console.log('📦 Installing Python dependencies...');
    
                  const pip = spawn('py', ['-m', 'pip', 'install', '-r', 'requirements-simple.txt'], {
                cwd: backendPath,
                stdio: 'inherit',
                shell: true
              });

    pip.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Dependencies installed successfully!\n');
        resolve();
      } else {
        console.warn('⚠️  Some dependencies may not have installed correctly, but continuing...\n');
        resolve(); // Continue anyway
      }
    });

    pip.on('error', (err) => {
      console.warn('⚠️  Could not install dependencies:', err.message);
      console.log('💡 Continuing without dependency installation...\n');
      resolve(); // Continue anyway
    });
  });
}

// Function to start FastAPI server
function startFastAPI() {
  console.log('🐍 Starting FastAPI server...');
  console.log('📍 API will be available at: http://localhost:8000');
  console.log('📚 API Documentation at: http://localhost:8000/docs');
  console.log('🔍 Health check at: http://localhost:8000/health\n');

                const fastapi = spawn('py', ['start-simple.py'], {
                cwd: backendPath,
                stdio: 'inherit',
                shell: true
              });

  fastapi.on('error', (err) => {
    console.error('❌ Failed to start FastAPI:', err.message);
                    console.log('💡 Make sure Python is installed and accessible via "py" command');
  });

  fastapi.on('close', (code) => {
    console.log(`\n🛑 FastAPI server stopped with code: ${code}`);
  });

  return fastapi;
}

// Main startup function
async function startBackend() {
  try {
    // Try to install dependencies first
    await installDependencies();
    
    // Start the FastAPI server
    const server = startFastAPI();

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down FastAPI server...');
      server.kill();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down FastAPI server...');
      server.kill();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start backend:', error.message);
    process.exit(1);
  }
}

// Run the startup
startBackend(); 