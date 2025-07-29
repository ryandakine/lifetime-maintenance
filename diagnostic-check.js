const http = require('http');
const fs = require('fs');
const path = require('path');

async function diagnosticCheck() {
  console.log('🔍 Lifetime Fitness Maintenance - Diagnostic Check');
  console.log('=' .repeat(50));
  
  // Check 1: File System
  console.log('\n1️⃣ File System Check:');
  const requiredFiles = [
    'package.json',
    'vite.config.js',
    'src/main.jsx',
    'backend/app/main_flask.py',
    'backend/database/maintenance.db'
  ];
  
  requiredFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  });
  
  // Check 2: Environment Variables
  console.log('\n2️⃣ Environment Check:');
  const envFile = '.env';
  const envExists = fs.existsSync(envFile);
  console.log(`   ${envExists ? '✅' : '❌'} .env file exists`);
  
  if (envExists) {
    const envContent = fs.readFileSync(envFile, 'utf8');
    const hasSupabase = envContent.includes('SUPABASE');
    const hasGrok = envContent.includes('GROK');
    console.log(`   ${hasSupabase ? '✅' : '❌'} Supabase config`);
    console.log(`   ${hasGrok ? '✅' : '❌'} Grok API config`);
  }
  
  // Check 3: Backend Health
  console.log('\n3️⃣ Backend Health Check:');
  try {
    const response = await fetch('http://localhost:8001/health');
    if (response.ok) {
      console.log('   ✅ Flask backend running');
    } else {
      console.log('   ❌ Flask backend error');
    }
  } catch (error) {
    console.log('   ❌ Flask backend not accessible');
  }
  
  // Check 4: Node.js API Health
  console.log('\n4️⃣ Node.js API Health Check:');
  try {
    const response = await fetch('http://localhost:3004/health');
    if (response.ok) {
      console.log('   ✅ Node.js API running');
    } else {
      console.log('   ❌ Node.js API error');
    }
  } catch (error) {
    console.log('   ❌ Node.js API not accessible');
  }
  
  // Check 5: Database
  console.log('\n5️⃣ Database Check:');
  const dbPath = 'backend/database/maintenance.db';
  if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`   ✅ Database exists (${sizeMB} MB)`);
  } else {
    console.log('   ❌ Database not found');
  }
  
  // Check 6: Port Availability
  console.log('\n6️⃣ Port Availability:');
  const ports = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 8001];
  for (const port of ports) {
    try {
      const response = await fetch(`http://localhost:${port}/health`, { timeout: 1000 });
      console.log(`   🔴 Port ${port} in use`);
    } catch (error) {
      console.log(`   🟢 Port ${port} available`);
    }
  }
  
  // Check 7: Dependencies
  console.log('\n7️⃣ Dependencies Check:');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasReact = packageJson.dependencies?.react;
  const hasVite = packageJson.devDependencies?.vite;
  console.log(`   ${hasReact ? '✅' : '❌'} React installed`);
  console.log(`   ${hasVite ? '✅' : '❌'} Vite installed`);
  
  // Check 8: Python Dependencies
  console.log('\n8️⃣ Python Dependencies:');
  const requirementsPath = 'backend/requirements.txt';
  if (fs.existsSync(requirementsPath)) {
    console.log('   ✅ requirements.txt exists');
  } else {
    console.log('   ❌ requirements.txt missing');
  }
  
  console.log('\n🎯 Quick Fix Commands:');
  console.log('   If frontend issues: npm run dev -- --port 3006');
  console.log('   If backend issues: cd backend && py start-flask.py');
  console.log('   If database issues: node backend/database/setup.js');
  console.log('   If all issues: node scripts/dynamic-start.js');
  
  console.log('\n📱 Mobile Testing Tips:');
  console.log('   - Use Chrome DevTools mobile emulation');
  console.log('   - Test camera permissions');
  console.log('   - Check offline functionality');
  console.log('   - Verify touch interactions');
  
  console.log('\n🚨 Emergency Contacts:');
  console.log('   - Check logs: tail -f backend/logs/app.log');
  console.log('   - Reset database: rm backend/database/maintenance.db');
  console.log('   - Clear cache: npm run clean && npm install');
}

diagnosticCheck().catch(console.error); 