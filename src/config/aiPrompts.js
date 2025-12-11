/**
 * AI Prompts Configuration
 * Centralized prompts for AI analysis - moved from Photos.jsx for maintainability
 */

export const AI_PROMPTS = {
    clarification: (taskContext = '') => `🔍 ENHANCED AI ANALYSIS - Equipment Recognition & Damage Detection

Analyze this maintenance/repair photo with advanced computer vision capabilities.

${taskContext}

## EQUIPMENT RECOGNITION
1. Identify the type of fitness equipment (treadmill, elliptical, weight machine, etc.)
2. Determine the brand and model if visible
3. Assess confidence level in equipment identification (0-100%)
4. Identify specific components visible in the photo

## DAMAGE DETECTION & ASSESSMENT
1. Detect any visible damage (cracks, rust, wear, loose parts, frayed cables)
2. Assess damage severity: LOW, MEDIUM, HIGH, CRITICAL
3. Identify affected components (belts, motors, bearings, cables, structural parts)
4. Detect safety hazards or potential failure points

## DETAILED ANALYSIS
1. Describe what you see in the photo
2. Identify the main issue or maintenance need
3. Explain what might be causing the problem
4. Provide context about the situation
5. Highlight any safety concerns

Format your response as:
## 🏋️ Equipment Identification
- **Type**: [Equipment type with confidence %]
- **Brand/Model**: [If identifiable]
- **Components Visible**: [List visible components]

## ⚠️ Damage Assessment
- **Severity Level**: [LOW/MEDIUM/HIGH/CRITICAL]
- **Damage Types**: [List detected damage]
- **Affected Components**: [Specific components with issues]
- **Safety Hazards**: [Any safety concerns]

## 🔍 Issue Analysis
[Describe what you see and identify the main issue]

## 📋 Problem Description
[Explain what might be causing the problem]

## 🛡️ Safety Notes
[Highlight any safety concerns or considerations]

## ❓ Questions for Clarification
[Ask specific questions to better understand the situation]`,

    next_steps: (taskContext = '') => `🔍 ENHANCED AI ANALYSIS - Equipment Recognition & Damage Detection

Analyze this maintenance/repair photo and provide specific next steps based on equipment type and damage assessment.

${taskContext}

## EQUIPMENT RECOGNITION
1. Identify the type of fitness equipment
2. Determine brand and model if visible
3. Assess confidence level in equipment identification
4. Identify specific components that need attention

## DAMAGE ASSESSMENT
1. Evaluate damage severity and type
2. Identify critical vs. non-critical issues
3. Assess safety implications
4. Determine repair priority

## NEXT STEPS ANALYSIS
1. Identify what needs to be done next
2. Provide step-by-step instructions specific to the equipment type
3. List required tools and supplies
4. Include safety precautions
5. Estimate time and difficulty

Format your response as:
## 🏋️ Equipment Context
- **Type**: [Equipment type with confidence %]
- **Brand/Model**: [If identifiable]
- **Components Involved**: [Components needing attention]

## ⚠️ Damage Assessment
- **Severity**: [LOW/MEDIUM/HIGH/CRITICAL]
- **Issues**: [List of detected problems]
- **Safety Level**: [Safe/Moderate/Unsafe]

## 📋 Next Steps Required
[Identify what needs to be done next]

## 🔧 Step-by-Step Instructions
1. [First step - equipment specific]
2. [Second step - equipment specific]
3. [Continue as needed]

## 🛠️ Required Tools & Supplies
[List all tools and supplies needed for this equipment type]

## 🛡️ Safety Precautions
[Include safety measures specific to this equipment]

## ⏱️ Time & Difficulty Estimate
[Estimate time required and difficulty level]

## 📝 Additional Notes
[Any other important information]`,

    verify_done: (taskContext = '') => `🔍 ENHANCED AI ANALYSIS - Equipment Recognition & Damage Detection

Analyze this maintenance/repair photo and verify if the work has been completed correctly for the specific equipment type.

${taskContext}

## EQUIPMENT VERIFICATION
1. Confirm equipment type and components
2. Verify that the correct components were addressed
3. Check for any missed areas or components

## QUALITY ASSESSMENT
1. Assess if the work appears complete and correct
2. Evaluate workmanship quality
3. Check for proper installation/repair
4. Verify safety standards compliance

## DAMAGE RESOLUTION
1. Confirm that identified damage has been addressed
2. Check for any remaining issues
3. Assess if repairs are adequate
4. Verify no new damage was introduced

Format your response as:
## 🏋️ Equipment Verification
- **Type**: [Equipment type]
- **Components Addressed**: [List components that were worked on]
- **Work Scope**: [What was supposed to be done]

## ✅ Work Verification
[Assess if the work appears complete and correct]

## 🎯 Quality Assessment
[Evaluate the quality of workmanship]

## ⚠️ Issues Found (if any)
[List any issues or incomplete work]

## 🔧 Suggested Fixes (if needed)
[Provide specific fixes for any issues]

## 🛡️ Safety Compliance
[Verify safety standards and compliance]

## 📊 Final Status
✅ Work Complete and Correct
⚠️ Work Needs Attention
❌ Work Incomplete

## 📋 Recommendations
[Final recommendations and next actions]`,

    enhanced_analysis: () => `🔍 ADVANCED COMPUTER VISION ANALYSIS - Equipment Recognition & Damage Detection

Analyze this fitness equipment photo with specialized computer vision capabilities for maintenance and safety assessment.

## EQUIPMENT RECOGNITION REQUIREMENTS
1. Identify the specific type of fitness equipment (treadmill, elliptical, weight machine, exercise bike, etc.)
2. Determine the brand and model if visible or identifiable
3. Assess confidence level in equipment identification (0-100%)
4. Identify all visible components and parts
5. Classify equipment category (cardio, strength, flexibility, etc.)

## DAMAGE DETECTION REQUIREMENTS
1. Detect any visible damage types:
   - Structural damage (cracks, bends, breaks)
   - Wear and tear (frayed cables, worn belts, rust)
   - Loose or missing parts
   - Electrical issues (exposed wires, damaged connectors)
   - Safety hazards (sharp edges, unstable parts)

2. Assess damage severity levels:
   - LOW: Minor cosmetic issues, no safety concerns
   - MEDIUM: Functional issues, some safety concerns
   - HIGH: Significant damage, safety concerns
   - CRITICAL: Severe damage, immediate safety hazard

3. Identify affected components:
   - Belts, motors, bearings, cables
   - Structural components, safety features
   - Electrical components, control systems

## SAFETY ASSESSMENT
1. Identify any immediate safety hazards
2. Assess equipment stability and structural integrity
3. Check for electrical safety issues
4. Evaluate user safety risks

## MAINTENANCE PRIORITY
1. Determine maintenance urgency
2. Assess repair complexity
3. Estimate repair costs and time
4. Recommend immediate actions

Please provide your analysis in the following JSON format:
{
  "equipment": {
    "type": "string",
    "confidence": number,
    "brand": "string",
    "model": "string",
    "category": "string",
    "components": ["array of visible components"]
  },
  "damage": {
    "severity": "LOW|MEDIUM|HIGH|CRITICAL",
    "types": ["array of damage types"],
    "components": ["array of affected components"],
    "safetyHazards": ["array of safety hazards"]
  },
  "analysis": {
    "description": "detailed description of what you see",
    "mainIssue": "main problem identified",
    "causes": ["potential causes"],
    "safetyLevel": "SAFE|MODERATE|UNSAFE",
    "maintenancePriority": "LOW|MEDIUM|HIGH|CRITICAL",
    "immediateActions": ["list of immediate actions needed"],
    "repairEstimate": {
      "time": "estimated repair time",
      "complexity": "LOW|MEDIUM|HIGH",
      "cost": "estimated cost range"
    }
  }
}`,

    default: (taskContext = '') => `🔍 ENHANCED AI ANALYSIS - Equipment Recognition & Damage Detection

Analyze this maintenance/repair photo with advanced computer vision capabilities.

${taskContext}

## EQUIPMENT RECOGNITION
1. Identify the type of fitness equipment
2. Determine brand and model if visible
3. Assess confidence level in equipment identification
4. Identify specific components visible

## DAMAGE DETECTION
1. Detect any visible damage or wear
2. Assess damage severity
3. Identify affected components
4. Detect safety hazards

## GENERAL ANALYSIS
Provide comprehensive analysis of the photo including equipment context, damage assessment, and maintenance recommendations.`
}

export const getPromptForPurpose = (purpose, taskContext = '') => {
    const promptFn = AI_PROMPTS[purpose] || AI_PROMPTS.default
    return promptFn(taskContext)
}

export default AI_PROMPTS
