#!/usr/bin/env node

/**
 * Hybrid System Startup Script
 * Starts both React frontend and FastAPI backend
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Lifetime Fitness Maintenance Hybrid System...\n');

// Check if Python is available
function checkPython() {
    return new Promise((resolve) => {
        const python = spawn('python', ['--version']);
        python.on('close', (code) => {
            if (code === 0) {
                resolve('python');
            } else {
                const python3 = spawn('python3', ['--version']);
                python3.on('close', (code3) => {
                    resolve(code3 === 0 ? 'python3' : null);
                });
            }
        });
    });
}

// Check if backend directory exists
function checkBackend() {
    const backendPath = path.join(__dirname, 'backend');
    return fs.existsSync(backendPath);
}

// Install Python dependencies
function installPythonDeps() {
    return new Promise((resolve, reject) => {
        console.log('📦 Installing Python dependencies...');
        const pip = spawn('pip', ['install', '-r', 'requirements.txt'], {
            cwd: path.join(__dirname, 'backend')
        });

        pip.stdout.on('data', (data) => {
            process.stdout.write(data);
        });

        pip.stderr.on('data', (data) => {
            process.stderr.write(data);
        });

        pip.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Python dependencies installed successfully!\n');
                resolve();
            } else {
                reject(new Error(`Failed to install Python dependencies (code: ${code})`));
            }
        });
    });
}

// Start React app
function startReact() {
    console.log('⚛️  Starting React app on http://localhost:3001...');
    const react = spawn('npm', ['run', 'dev'], {
        stdio: 'inherit',
        shell: true
    });

    react.on('error', (err) => {
        console.error('❌ Failed to start React app:', err.message);
    });

    return react;
}

// Start FastAPI backend
function startFastAPI(pythonCmd) {
    console.log('🐍 Starting FastAPI backend on http://localhost:8000...');
    const fastapi = spawn(pythonCmd, ['start.py'], {
        cwd: path.join(__dirname, 'backend'),
        stdio: 'inherit',
        shell: true
    });

    fastapi.on('error', (err) => {
        console.error('❌ Failed to start FastAPI backend:', err.message);
    });

    return fastapi;
}

// Main startup function
async function startHybridSystem() {
    try {
        // Check Python availability
        const pythonCmd = await checkPython();
        if (!pythonCmd) {
            console.error('❌ Python is not installed or not in PATH');
            console.log('💡 Please install Python 3.8+ and try again');
            process.exit(1);
        }

        // Check backend directory
        if (!checkBackend()) {
            console.error('❌ Backend directory not found');
            console.log('💡 Please ensure the backend directory exists');
            process.exit(1);
        }

        // Install Python dependencies
        try {
            await installPythonDeps();
        } catch (error) {
            console.error('❌ Failed to install Python dependencies:', error.message);
            console.log('💡 You can install them manually: cd backend && pip install -r requirements.txt');
        }

        // Start both services
        const reactProcess = startReact();
        const fastapiProcess = startFastAPI(pythonCmd);

        // Handle process termination
        process.on('SIGINT', () => {
            console.log('\n🛑 Shutting down hybrid system...');
            reactProcess.kill();
            fastapiProcess.kill();
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            console.log('\n🛑 Shutting down hybrid system...');
            reactProcess.kill();
            fastapiProcess.kill();
            process.exit(0);
        });

        console.log('\n🎉 Hybrid system started successfully!');
        console.log('📍 React App: http://localhost:3001');
        console.log('📍 FastAPI Backend: http://localhost:8000');
        console.log('📚 API Documentation: http://localhost:8000/docs');
        console.log('🔍 Health Check: http://localhost:8000/health');
        console.log('\n💡 Press Ctrl+C to stop both services\n');

    } catch (error) {
        console.error('❌ Failed to start hybrid system:', error.message);
        process.exit(1);
    }
}

// Run the startup
startHybridSystem(); 