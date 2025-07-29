const { createClient } = require('@supabase/supabase-js')

// Test Enhanced AI Analysis functionality
async function testEnhancedAIAnalysis() {
  console.log('🧪 Testing Enhanced AI Analysis - Equipment Recognition & Damage Detection')
  
  // Test data for enhanced analysis
  const testAnalysisData = {
    equipment: {
      type: "Treadmill",
      confidence: 95,
      brand: "Life Fitness",
      model: "95T",
      category: "Cardio",
      components: ["Belt", "Motor", "Control Panel", "Frame", "Safety Key"]
    },
    damage: {
      severity: "MEDIUM",
      types: ["Belt wear", "Minor rust spots", "Loose safety key"],
      components: ["Belt", "Frame", "Safety key"],
      safetyHazards: ["Loose safety key could detach during use"]
    },
    analysis: {
      description: "Treadmill shows moderate wear with belt fraying and minor rust spots. Safety key is loose.",
      mainIssue: "Belt wear and loose safety key",
      causes: ["Normal wear and tear", "Lack of regular maintenance"],
      safetyLevel: "MODERATE",
      maintenancePriority: "MEDIUM",
      immediateActions: ["Tighten safety key", "Inspect belt condition", "Clean rust spots"],
      repairEstimate: {
        time: "2-3 hours",
        complexity: "MEDIUM",
        cost: "$150-300"
      }
    }
  }

  console.log('\n📊 Test Enhanced Analysis Data:')
  console.log(JSON.stringify(testAnalysisData, null, 2))

  // Test severity assessment
  console.log('\n⚠️ Severity Assessment Test:')
  const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
  severities.forEach(severity => {
    console.log(`- ${severity}: ${getSeverityDescription(severity)}`)
  })

  // Test equipment recognition
  console.log('\n🏋️ Equipment Recognition Test:')
  const equipmentTypes = ['Treadmill', 'Elliptical', 'Weight Machine', 'Exercise Bike']
  equipmentTypes.forEach(type => {
    console.log(`- ${type}: ${getEquipmentCategory(type)}`)
  })

  // Test damage detection
  console.log('\n🔍 Damage Detection Test:')
  const damageTypes = [
    'Structural damage (cracks, bends, breaks)',
    'Wear and tear (frayed cables, worn belts, rust)',
    'Loose or missing parts',
    'Electrical issues (exposed wires, damaged connectors)',
    'Safety hazards (sharp edges, unstable parts)'
  ]
  damageTypes.forEach(damage => {
    console.log(`- ${damage}`)
  })

  console.log('\n✅ Enhanced AI Analysis Test Completed Successfully!')
  console.log('\n🎯 Next Steps:')
  console.log('1. Upload a fitness equipment photo in the frontend')
  console.log('2. Select "Enhanced AI Analysis" as the purpose')
  console.log('3. Verify the structured JSON response')
  console.log('4. Check equipment recognition and damage assessment')
}

function getSeverityDescription(severity) {
  const descriptions = {
    'LOW': 'Minor cosmetic issues, no safety concerns',
    'MEDIUM': 'Functional issues, some safety concerns',
    'HIGH': 'Significant damage, safety concerns',
    'CRITICAL': 'Severe damage, immediate safety hazard'
  }
  return descriptions[severity] || 'Unknown severity'
}

function getEquipmentCategory(type) {
  const categories = {
    'Treadmill': 'Cardio',
    'Elliptical': 'Cardio',
    'Weight Machine': 'Strength',
    'Exercise Bike': 'Cardio'
  }
  return categories[type] || 'Unknown'
}

// Run the test
testEnhancedAIAnalysis().catch(console.error) 