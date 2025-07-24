// Simple test script to verify application structure
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Lifetime Maintenance PWA Structure...\n');

// Check if all required files exist
const requiredFiles = [
  'package.json',
  'vite.config.js',
  'index.html',
  'src/main.jsx',
  'src/App.jsx',
  'src/App.css',
  'src/index.css',
  'src/components/Maintenance.jsx',
  'src/lib/supabase.js',
  'database/schema.sql',
  'README.md',
  'env.example'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

console.log('\n📦 Package.json Analysis:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`✅ Name: ${packageJson.name}`);
  console.log(`✅ Version: ${packageJson.version}`);
  console.log(`✅ Dependencies: ${Object.keys(packageJson.dependencies).length} packages`);
  console.log(`✅ Dev Dependencies: ${Object.keys(packageJson.devDependencies).length} packages`);
} catch (error) {
  console.log('❌ Error reading package.json');
}

console.log('\n🔧 Vite Configuration:');
try {
  const viteConfig = fs.readFileSync('vite.config.js', 'utf8');
  if (viteConfig.includes('VitePWA')) {
    console.log('✅ PWA plugin configured');
  } else {
    console.log('❌ PWA plugin missing');
  }
  if (viteConfig.includes('react')) {
    console.log('✅ React plugin configured');
  } else {
    console.log('❌ React plugin missing');
  }
} catch (error) {
  console.log('❌ Error reading vite.config.js');
}

console.log('\n📱 PWA Features Check:');
try {
  const indexHtml = fs.readFileSync('index.html', 'utf8');
  if (indexHtml.includes('theme-color')) {
    console.log('✅ PWA theme color configured');
  } else {
    console.log('❌ PWA theme color missing');
  }
  if (indexHtml.includes('viewport')) {
    console.log('✅ Mobile viewport configured');
  } else {
    console.log('❌ Mobile viewport missing');
  }
} catch (error) {
  console.log('❌ Error reading index.html');
}

console.log('\n🎨 Styling Check:');
try {
  const css = fs.readFileSync('src/index.css', 'utf8');
  if (css.includes('--primary-color: #007BFF')) {
    console.log('✅ Blue theme configured');
  } else {
    console.log('❌ Blue theme missing');
  }
  if (css.includes('@media (max-width: 768px)')) {
    console.log('✅ Mobile-first responsive design');
  } else {
    console.log('❌ Mobile responsive design missing');
  }
} catch (error) {
  console.log('❌ Error reading CSS files');
}

console.log('\n🗄️ Database Schema Check:');
try {
  const schema = fs.readFileSync('database/schema.sql', 'utf8');
  const tables = ['tasks', 'shopping_lists', 'emails', 'knowledge'];
  tables.forEach(table => {
    if (schema.includes(`CREATE TABLE.*${table}`)) {
      console.log(`✅ ${table} table defined`);
    } else {
      console.log(`❌ ${table} table missing`);
    }
  });
} catch (error) {
  console.log('❌ Error reading database schema');
}

console.log('\n📋 Component Features Check:');
try {
  const maintenance = fs.readFileSync('src/components/Maintenance.jsx', 'utf8');
  const features = [
    'Task Management',
    'Shopping Lists', 
    'Email Management',
    'Knowledge Base',
    'File Upload'
  ];
  
  features.forEach(feature => {
    if (maintenance.includes(feature.replace(' ', '')) || maintenance.includes(feature.toLowerCase())) {
      console.log(`✅ ${feature} implemented`);
    } else {
      console.log(`❌ ${feature} missing`);
    }
  });
} catch (error) {
  console.log('❌ Error reading Maintenance component');
}

console.log('\n🎯 Summary:');
if (allFilesExist) {
  console.log('✅ All required files present');
  console.log('✅ Application structure is complete');
  console.log('✅ Ready for development and testing');
} else {
  console.log('❌ Some files are missing');
  console.log('❌ Please check the missing files above');
}

console.log('\n🚀 Next Steps:');
console.log('1. Copy env.example to .env.local and add your API keys');
console.log('2. Set up Supabase project and run database/schema.sql');
console.log('3. Run: npm run dev');
console.log('4. Test all features using the testing guide in README.md'); 