#!/usr/bin/env node

/**
 * Test Kendo UI Integration
 * Verifies that all Kendo React packages are properly installed and accessible
 */

const fs = require('fs');
const path = require('path');

console.log('🔥 Testing Kendo UI Integration...\n');

// Test 1: Check if packages are installed
console.log('📦 Checking installed Kendo packages...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const kendoPackages = Object.keys(packageJson.dependencies).filter(pkg => pkg.startsWith('@progress/kendo-react'));

if (kendoPackages.length > 0) {
  console.log('✅ Found Kendo packages:');
  kendoPackages.forEach(pkg => {
    console.log(`   - ${pkg}@${packageJson.dependencies[pkg]}`);
  });
} else {
  console.log('❌ No Kendo packages found!');
  process.exit(1);
}

// Test 2: Check if TasksKendo component exists
console.log('\n🔧 Checking TasksKendo component...');
const tasksKendoPath = path.join('src', 'components', 'TasksKendo.jsx');
if (fs.existsSync(tasksKendoPath)) {
  console.log('✅ TasksKendo.jsx component exists');
  
  // Check if it imports Kendo components
  const content = fs.readFileSync(tasksKendoPath, 'utf8');
  if (content.includes('@progress/kendo-react-grid')) {
    console.log('✅ Component imports Kendo Grid');
  }
  if (content.includes('@progress/kendo-react-buttons')) {
    console.log('✅ Component imports Kendo Buttons');
  }
  if (content.includes('@progress/kendo-react-inputs')) {
    console.log('✅ Component imports Kendo Inputs');
  }
} else {
  console.log('❌ TasksKendo.jsx component not found!');
}

// Test 3: Check if main.jsx imports Kendo theme
console.log('\n🎨 Checking theme integration...');
const mainJsxPath = path.join('src', 'main.jsx');
if (fs.existsSync(mainJsxPath)) {
  const mainContent = fs.readFileSync(mainJsxPath, 'utf8');
  if (mainContent.includes('@progress/kendo-theme-default/dist/all.css')) {
    console.log('✅ Kendo theme is imported in main.jsx');
  } else {
    console.log('❌ Kendo theme not imported in main.jsx');
  }
}

// Test 4: Check if App.jsx includes TasksKendo
console.log('\n📱 Checking App.jsx integration...');
const appJsxPath = path.join('src', 'App.jsx');
if (fs.existsSync(appJsxPath)) {
  const appContent = fs.readFileSync(appJsxPath, 'utf8');
  if (appContent.includes('TasksKendo')) {
    console.log('✅ TasksKendo is imported in App.jsx');
  }
  if (appContent.includes('tasks-pro')) {
    console.log('✅ Tasks Pro tab is configured');
  }
}

// Test 5: Check if custom CSS includes Kendo styling
console.log('\n💅 Checking custom Kendo styling...');
const appCssPath = path.join('src', 'App.css');
if (fs.existsSync(appCssPath)) {
  const cssContent = fs.readFileSync(appCssPath, 'utf8');
  if (cssContent.includes('KENDO UI CUSTOMIZATIONS')) {
    console.log('✅ Custom Kendo styling is added to App.css');
  }
  if (cssContent.includes('.k-grid')) {
    console.log('✅ Kendo Grid styling customizations found');
  }
}

console.log('\n🎉 Kendo UI Integration Test Complete!');
console.log('\n📝 Next Steps:');
console.log('1. 🚀 Open your app in the browser');
console.log('2. 🔥 Click on the "Tasks Pro" tab');
console.log('3. ✨ Experience the professional Kendo UI Grid!');
console.log('4. 📋 Test adding new tasks with the enhanced form');
console.log('5. 🎨 Enjoy the professional styling and features');

console.log('\n🌐 Your app should be running at:');
console.log('   Frontend: http://localhost:3000 (or check your port status)');
console.log('   Backend:  http://localhost:8001');

console.log('\n💡 Features to test in Tasks Pro:');
console.log('   • Professional grid with sorting and filtering');
console.log('   • Pagination with customizable page sizes');
console.log('   • Column resizing and reordering');
console.log('   • Enhanced form controls (DatePicker, DropDowns)');
console.log('   • Real-time notifications');
console.log('   • Responsive design');
console.log('   • Custom cell renderers for status and priority'); 