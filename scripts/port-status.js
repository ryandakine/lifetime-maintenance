#!/usr/bin/env node

/**
 * Port Status Checker
 * Shows current port usage and what's running on each port
 */

const { exec } = require('child_process');
const portFinder = require('./port-finder');

console.log('🔍 Checking Port Status...\n');

async function checkPortStatus() {
  try {
    // Get port configuration
    const portConfig = await portFinder.getPortConfig();
    
    console.log('📊 Current Port Configuration:');
    console.log(JSON.stringify(portConfig, null, 2));
    console.log();
    
    // Check what's running on each port
    console.log('🔍 Checking what\'s running on each port...\n');
    
    for (const [service, port] of Object.entries(portConfig)) {
      await checkPortUsage(service, port);
    }
    
    // Show port finder status
    console.log('\n📋 Port Finder Status:');
    const status = portFinder.getStatus();
    console.log(`Used Ports: ${status.usedPorts.join(', ') || 'None'}`);
    
  } catch (error) {
    console.error('❌ Error checking port status:', error.message);
  }
}

function checkPortUsage(service, port) {
  return new Promise((resolve) => {
    const platform = process.platform;
    let command;
    
    if (platform === 'win32') {
      command = `netstat -ano | findstr :${port}`;
    } else {
      command = `lsof -i :${port}`;
    }
    
    exec(command, (error, stdout, stderr) => {
      if (error || !stdout.trim()) {
        console.log(`✅ Port ${port} (${service}): Available`);
      } else {
        console.log(`⚠️  Port ${port} (${service}): In Use`);
        if (platform === 'win32') {
          // Parse Windows netstat output
          const lines = stdout.trim().split('\n');
          lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 5) {
              const pid = parts[4];
              console.log(`   Process ID: ${pid}`);
            }
          });
        } else {
          // Parse Unix lsof output
          const lines = stdout.trim().split('\n');
          lines.forEach(line => {
            if (line.includes('LISTEN')) {
              const parts = line.trim().split(/\s+/);
              if (parts.length >= 9) {
                const process = parts[8];
                console.log(`   Process: ${process}`);
              }
            }
          });
        }
      }
      resolve();
    });
  });
}

// CLI usage
if (require.main === module) {
  checkPortStatus();
}

module.exports = { checkPortStatus }; 