// Test script to verify the refactored Lifetime Fitness Maintenance app
const fs = require('fs')
const path = require('path')

console.log('🧪 Testing Refactored Lifetime Fitness Maintenance App\n')

// Test 1: Check if React app is running
async function testReactApp() {
  console.log('1️⃣ Testing React App...')
  try {
    const response = await fetch('http://localhost:5175')
    if (response.ok) {
      console.log('✅ React app is running on http://localhost:5175')
      return true
    } else {
      console.log('❌ React app is not responding properly')
      return false
    }
  } catch (error) {
    console.log('❌ React app is not running')
    return false
  }
}

// Test 2: Check required components exist
function testComponents() {
  console.log('\n2️⃣ Testing Required Components...')
  
  const requiredComponents = [
    'src/components/Dashboard.jsx',
    'src/components/VoiceInput.jsx',
    'src/components/Tasks.jsx',
    'src/components/Shopping.jsx',
    'src/components/Maintenance.jsx',
    'src/components/Photos.jsx'
  ]
  
  const removedComponents = [
    'src/components/OffDays.jsx',
    'src/components/GoalTracker.jsx',
    'src/components/WorkoutTracker.jsx'
  ]
  
  let allGood = true
  
  // Check required components exist
  requiredComponents.forEach(component => {
    if (fs.existsSync(component)) {
      console.log(`✅ ${component} exists`)
    } else {
      console.log(`❌ ${component} is missing`)
      allGood = false
    }
  })
  
  // Check removed components are gone
  removedComponents.forEach(component => {
    if (!fs.existsSync(component)) {
      console.log(`✅ ${component} properly removed`)
    } else {
      console.log(`⚠️  ${component} still exists (should be removed)`)
      allGood = false
    }
  })
  
  return allGood
}

// Test 3: Check App.jsx configuration
function testAppConfiguration() {
  console.log('\n3️⃣ Testing App Configuration...')
  
  try {
    const appContent = fs.readFileSync('src/App.jsx', 'utf8')
    
    // Check for required imports
    const requiredImports = [
      'Dashboard',
      'VoiceInput',
      'Tasks',
      'Shopping',
      'Maintenance',
      'Photos'
    ]
    
    // Check for removed imports
    const removedImports = [
      'OffDays',
      'GoalTracker',
      'WorkoutTracker',
      'Knowledge',
      'Email',
      'SmartAssistant',
      'TaskAutomation',
      'GitHubIntegration',
      'FileUploader',
      'VoiceAssistant'
    ]
    
    let allGood = true
    
    requiredImports.forEach(importName => {
      if (appContent.includes(importName)) {
        console.log(`✅ ${importName} is imported`)
      } else {
        console.log(`❌ ${importName} is not imported`)
        allGood = false
      }
    })
    
    removedImports.forEach(importName => {
      if (!appContent.includes(importName)) {
        console.log(`✅ ${importName} is properly removed`)
      } else {
        console.log(`⚠️  ${importName} is still imported (should be removed)`)
        allGood = false
      }
    })
    
    // Check app title
    if (appContent.includes('Lifetime Fitness Maintenance')) {
      console.log('✅ App title is correctly set')
    } else {
      console.log('❌ App title is not correct')
      allGood = false
    }
    
    return allGood
  } catch (error) {
    console.log('❌ Could not read App.jsx')
    return false
  }
}

// Test 4: Check Redux store configuration
function testReduxStore() {
  console.log('\n4️⃣ Testing Redux Store...')
  
  try {
    const storeContent = fs.readFileSync('src/store/index.js', 'utf8')
    
    // Check for required reducers
    const requiredReducers = [
      'tasksReducer',
      'shoppingReducer',
      'uiReducer'
    ]
    
    // Check for removed reducers
    const removedReducers = [
      'knowledgeReducer',
      'emailReducer',
      'photosReducer'
    ]
    
    let allGood = true
    
    requiredReducers.forEach(reducer => {
      if (storeContent.includes(reducer)) {
        console.log(`✅ ${reducer} is included`)
      } else {
        console.log(`❌ ${reducer} is missing`)
        allGood = false
      }
    })
    
    removedReducers.forEach(reducer => {
      if (!storeContent.includes(reducer)) {
        console.log(`✅ ${reducer} is properly removed`)
      } else {
        console.log(`⚠️  ${reducer} is still included (should be removed)`)
        allGood = false
      }
    })
    
    return allGood
  } catch (error) {
    console.log('❌ Could not read store configuration')
    return false
  }
}

// Test 5: Check workflow files
function testWorkflowFiles() {
  console.log('\n5️⃣ Testing Workflow Files...')
  
  const workflowFiles = [
    'workflows/lifetime-fitness-maintenance-workflows.json',
    'n8n-setup-config.js',
    'SETUP_GUIDE.md'
  ]
  
  let allGood = true
  
  workflowFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`)
    } else {
      console.log(`❌ ${file} is missing`)
      allGood = false
    }
  })
  
  return allGood
}

// Test 6: Check package.json
function testPackageJson() {
  console.log('\n6️⃣ Testing Package Configuration...')
  
  try {
    const packageContent = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    
    if (packageContent.name === 'lifetime-fitness-maintenance-pwa') {
      console.log('✅ Package name is correct')
    } else {
      console.log('❌ Package name is not correct')
      return false
    }
    
    if (packageContent.description.includes('Lifetime Fitness Maintenance')) {
      console.log('✅ Package description is correct')
    } else {
      console.log('❌ Package description is not correct')
      return false
    }
    
    return true
  } catch (error) {
    console.log('❌ Could not read package.json')
    return false
  }
}

// Run all tests
async function runAllTests() {
  const tests = [
    testReactApp,
    testComponents,
    testAppConfiguration,
    testReduxStore,
    testWorkflowFiles,
    testPackageJson
  ]
  
  const results = []
  
  for (const test of tests) {
    try {
      const result = await test()
      results.push(result)
    } catch (error) {
      console.log(`❌ Test failed with error: ${error.message}`)
      results.push(false)
    }
  }
  
  // Summary
  console.log('\n📊 Test Summary:')
  console.log('================')
  
  const passed = results.filter(r => r).length
  const total = results.length
  
  console.log(`✅ Passed: ${passed}/${total}`)
  console.log(`❌ Failed: ${total - passed}/${total}`)
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Your refactored app is working correctly.')
    console.log('\n📋 Next Steps:')
    console.log('1. Set up n8n workflows (follow SETUP_GUIDE.md)')
    console.log('2. Configure webhook URLs in Dashboard.jsx')
    console.log('3. Test workflow integration')
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.')
  }
}

// Run the tests
runAllTests().catch(console.error) 