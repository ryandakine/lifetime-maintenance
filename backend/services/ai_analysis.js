const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class AIAnalysisService {
  constructor() {
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    this.perplexityBaseUrl = 'https://api.perplexity.ai';
    
    // Equipment recognition models and configurations
    this.equipmentTypes = [
      'Treadmill', 'Elliptical', 'Exercise Bike', 'Rowing Machine', 'Stair Climber',
      'Weight Machine', 'Free Weights', 'Cable Machine', 'Smith Machine', 'Leg Press',
      'Bench Press', 'Squat Rack', 'Pull-up Bar', 'Dip Station', 'Ab Machine',
      'Cardio Equipment', 'Strength Equipment', 'Accessory Equipment'
    ];
    
    // Damage types and severity levels
    this.damageTypes = {
      structural: ['cracks', 'bends', 'breaks', 'loose joints'],
      wear: ['scratches', 'dents', 'fading', 'peeling'],
      mechanical: ['loose parts', 'missing parts', 'broken components'],
      electrical: ['exposed wires', 'damaged controls', 'power issues'],
      safety: ['sharp edges', 'unstable parts', 'safety hazards']
    };
    
    this.severityLevels = ['Low', 'Medium', 'High', 'Critical'];
    
    if (!this.perplexityApiKey) {
      console.warn('⚠️ PERPLEXITY_API_KEY not found. AI analysis will be limited.');
    }
  }

  /**
   * Enhanced photo analysis with equipment recognition and damage detection
   * @param {string} photoPath - Path to the photo file
   * @param {Object} context - Additional context about the equipment/task
   * @returns {Promise<Object>} Enhanced analysis results
   */
  async analyzePhoto(photoPath, context = {}) {
    try {
      // Check if this is a mock path or if API key is missing
      if (!this.perplexityApiKey || photoPath === 'mock-path') {
        const mockAnalysis = this.generateEnhancedMockAnalysis(context);
        return {
          success: true,
          analysis: mockAnalysis,
          timestamp: new Date().toISOString(),
          model: 'enhanced-mock',
          confidence: mockAnalysis.metadata.confidence
        };
      }

      // Read the image file and convert to base64
      const imageBuffer = await fs.readFile(photoPath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = this.getMimeType(photoPath);

      // Perform enhanced analysis with multiple specialized prompts
      const [equipmentAnalysis, damageAnalysis, componentAnalysis] = await Promise.all([
        this.analyzeEquipmentRecognition(base64Image, mimeType, context),
        this.analyzeDamageDetection(base64Image, mimeType, context),
        this.analyzeComponentIdentification(base64Image, mimeType, context)
      ]);

      // Combine and enhance analysis results
      const enhancedAnalysis = this.combineAnalysisResults(
        equipmentAnalysis, 
        damageAnalysis, 
        componentAnalysis, 
        context
      );

      return {
        success: true,
        analysis: enhancedAnalysis,
        timestamp: new Date().toISOString(),
        model: 'perplexity-llava-34b-enhanced',
        confidence: this.calculateConfidence(enhancedAnalysis)
      };

    } catch (error) {
      console.error('Enhanced AI Analysis error:', error);
      
      // Fallback to enhanced mock analysis
      const mockAnalysis = this.generateEnhancedMockAnalysis(context);
      return {
        success: false,
        error: error.message,
        analysis: mockAnalysis,
        timestamp: new Date().toISOString(),
        model: 'fallback-enhanced',
        confidence: mockAnalysis.metadata.confidence
      };
    }
  }

  /**
   * Analyze equipment recognition with specialized prompt
   */
  async analyzeEquipmentRecognition(base64Image, mimeType, context) {
    const prompt = `You are an expert fitness equipment technician. Analyze this image to identify the specific fitness equipment.

EQUIPMENT IDENTIFICATION TASK:
1. Determine the exact type of fitness equipment (choose from: ${this.equipmentTypes.join(', ')})
2. Identify the brand and model if visible
3. Determine the specific component or area being photographed
4. Assess the overall condition of the equipment
5. Provide confidence level (0-100%) for your identification

Please respond with a structured analysis including:
- Equipment Type: [specific type]
- Brand/Model: [if visible]
- Component: [specific part being shown]
- Overall Condition: [excellent/good/fair/poor]
- Confidence: [percentage]
- Reasoning: [brief explanation]`;

    const response = await this.callPerplexityAPI(prompt, base64Image, mimeType);
    return this.parseEquipmentRecognition(response);
  }

  /**
   * Analyze damage detection with specialized prompt
   */
  async analyzeDamageDetection(base64Image, mimeType, context) {
    const prompt = `You are a maintenance expert analyzing fitness equipment for damage and safety issues.

DAMAGE DETECTION TASK:
Analyze this image for the following types of damage:

STRUCTURAL DAMAGE: cracks, bends, breaks, loose joints
WEAR DAMAGE: scratches, dents, fading, peeling paint
MECHANICAL DAMAGE: loose parts, missing parts, broken components
ELECTRICAL DAMAGE: exposed wires, damaged controls, power issues
SAFETY HAZARDS: sharp edges, unstable parts, immediate safety risks

For each detected issue, provide:
- Damage Type: [structural/wear/mechanical/electrical/safety]
- Severity: [Low/Medium/High/Critical]
- Location: [specific area on equipment]
- Description: [detailed description]
- Safety Risk: [yes/no]
- Immediate Action Required: [yes/no]

Please be thorough and prioritize safety issues.`;

    const response = await this.callPerplexityAPI(prompt, base64Image, mimeType);
    return this.parseDamageDetection(response);
  }

  /**
   * Analyze component identification with specialized prompt
   */
  async analyzeComponentIdentification(base64Image, mimeType, context) {
    const prompt = `You are a fitness equipment specialist identifying specific components and parts.

COMPONENT IDENTIFICATION TASK:
1. Identify all visible components and parts
2. Assess the condition of each component
3. Identify any missing or damaged components
4. Note any components that need maintenance or replacement
5. Provide specific component names and their functions

For each component identified, provide:
- Component Name: [specific part name]
- Function: [what this component does]
- Condition: [excellent/good/fair/poor]
- Maintenance Status: [needs attention/okay/replace]
- Notes: [any specific observations]`;

    const response = await this.callPerplexityAPI(prompt, base64Image, mimeType);
    return this.parseComponentIdentification(response);
  }

  /**
   * Call Perplexity API with standardized parameters
   */
  async callPerplexityAPI(prompt, base64Image, mimeType) {
    const response = await axios.post(
      `${this.perplexityBaseUrl}/chat/completions`,
      {
        model: 'llava-34b-online',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.1
      },
      {
        headers: {
          'Authorization': `Bearer ${this.perplexityApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  }

  /**
   * Parse equipment recognition results
   */
  parseEquipmentRecognition(response) {
    try {
      const content = response.choices[0]?.message?.content || '';
      
      const equipmentType = this.extractValue(content, 'Equipment Type');
      const brandModel = this.extractValue(content, 'Brand/Model');
      const component = this.extractValue(content, 'Component');
      const condition = this.extractValue(content, 'Overall Condition');
      const confidence = this.extractConfidence(content);
      const reasoning = this.extractValue(content, 'Reasoning');

      return {
        equipmentType: equipmentType || 'Unknown',
        brandModel: brandModel || 'Unknown',
        component: component || 'General',
        condition: condition || 'Unknown',
        confidence: confidence || 0,
        reasoning: reasoning || 'No reasoning provided',
        isEquipmentIdentified: equipmentType !== 'Unknown'
      };
    } catch (error) {
      console.error('Error parsing equipment recognition:', error);
      return { error: 'Failed to parse equipment recognition' };
    }
  }

  /**
   * Parse damage detection results
   */
  parseDamageDetection(response) {
    try {
      const content = response.choices[0]?.message?.content || '';
      
      const damages = [];
      const lines = content.split('\n');
      
      for (const line of lines) {
        if (line.includes('Damage Type:') || line.includes('Severity:')) {
          const damageType = this.extractValue(line, 'Damage Type') || this.extractValue(content, 'Damage Type');
          const severity = this.extractValue(line, 'Severity') || this.extractValue(content, 'Severity');
          const location = this.extractValue(line, 'Location') || this.extractValue(content, 'Location');
          const description = this.extractValue(line, 'Description') || this.extractValue(content, 'Description');
          const safetyRisk = this.extractValue(line, 'Safety Risk') || this.extractValue(content, 'Safety Risk');
          const immediateAction = this.extractValue(line, 'Immediate Action Required') || this.extractValue(content, 'Immediate Action Required');

          if (damageType && severity) {
            damages.push({
              type: damageType,
              severity: severity,
              location: location || 'Unknown',
              description: description || 'Damage detected',
              safetyRisk: safetyRisk === 'yes',
              immediateAction: immediateAction === 'yes'
            });
          }
        }
      }

      // If no structured damages found, try to extract from general text
      if (damages.length === 0) {
        const generalDamage = this.extractGeneralDamage(content);
        if (generalDamage) {
          damages.push(generalDamage);
        }
      }

      const highestSeverity = this.getHighestSeverity(damages);
      const safetyIssues = damages.filter(d => d.safetyRisk);
      const immediateIssues = damages.filter(d => d.immediateAction);

      return {
        damages: damages,
        totalDamages: damages.length,
        highestSeverity: highestSeverity,
        safetyIssues: safetyIssues.length,
        immediateIssues: immediateIssues.length,
        hasCriticalIssues: highestSeverity === 'Critical',
        hasSafetyRisks: safetyIssues.length > 0
      };
    } catch (error) {
      console.error('Error parsing damage detection:', error);
      return { error: 'Failed to parse damage detection' };
    }
  }

  /**
   * Parse component identification results
   */
  parseComponentIdentification(response) {
    try {
      const content = response.choices[0]?.message?.content || '';
      
      const components = [];
      const lines = content.split('\n');
      
      for (const line of lines) {
        if (line.includes('Component Name:') || line.includes('Function:')) {
          const name = this.extractValue(line, 'Component Name') || this.extractValue(content, 'Component Name');
          const function_ = this.extractValue(line, 'Function') || this.extractValue(content, 'Function');
          const condition = this.extractValue(line, 'Condition') || this.extractValue(content, 'Condition');
          const maintenanceStatus = this.extractValue(line, 'Maintenance Status') || this.extractValue(content, 'Maintenance Status');
          const notes = this.extractValue(line, 'Notes') || this.extractValue(content, 'Notes');

          if (name) {
            components.push({
              name: name,
              function: function_ || 'Unknown',
              condition: condition || 'Unknown',
              maintenanceStatus: maintenanceStatus || 'Unknown',
              notes: notes || ''
            });
          }
        }
      }

      const needsAttention = components.filter(c => c.maintenanceStatus === 'needs attention');
      const needsReplacement = components.filter(c => c.maintenanceStatus === 'replace');

      return {
        components: components,
        totalComponents: components.length,
        needsAttention: needsAttention.length,
        needsReplacement: needsReplacement.length,
        componentsInGoodCondition: components.filter(c => c.condition === 'good' || c.condition === 'excellent').length
      };
    } catch (error) {
      console.error('Error parsing component identification:', error);
      return { error: 'Failed to parse component identification' };
    }
  }

  /**
   * Combine all analysis results into enhanced analysis
   */
  combineAnalysisResults(equipmentAnalysis, damageAnalysis, componentAnalysis, context) {
    const combined = {
      // Equipment recognition results
      equipment: {
        type: equipmentAnalysis.equipmentType || 'Unknown',
        brandModel: equipmentAnalysis.brandModel || 'Unknown',
        component: equipmentAnalysis.component || 'General',
        condition: equipmentAnalysis.condition || 'Unknown',
        confidence: equipmentAnalysis.confidence || 0,
        reasoning: equipmentAnalysis.reasoning || 'No reasoning provided'
      },

      // Damage detection results
      damages: {
        issues: damageAnalysis.damages || [],
        totalIssues: damageAnalysis.totalDamages || 0,
        highestSeverity: damageAnalysis.highestSeverity || 'Low',
        safetyIssues: damageAnalysis.safetyIssues || 0,
        immediateIssues: damageAnalysis.immediateIssues || 0,
        hasCriticalIssues: damageAnalysis.hasCriticalIssues || false,
        hasSafetyRisks: damageAnalysis.hasSafetyRisks || false
      },

      // Component analysis results
      components: {
        identified: componentAnalysis.components || [],
        totalComponents: componentAnalysis.totalComponents || 0,
        needsAttention: componentAnalysis.needsAttention || 0,
        needsReplacement: componentAnalysis.needsReplacement || 0,
        inGoodCondition: componentAnalysis.componentsInGoodCondition || 0
      },

      // Overall assessment
      assessment: {
        overallCondition: this.calculateOverallCondition(equipmentAnalysis, damageAnalysis, componentAnalysis),
        priority: this.calculatePriority(damageAnalysis),
        estimatedRepairTime: this.estimateRepairTime(damageAnalysis, componentAnalysis),
        partsNeeded: this.identifyPartsNeeded(componentAnalysis),
        safetyRecommendations: this.generateSafetyRecommendations(damageAnalysis),
        maintenanceRecommendations: this.generateMaintenanceRecommendations(equipmentAnalysis, damageAnalysis, componentAnalysis)
      },

      // Context information
      context: {
        equipmentType: context.equipmentType,
        taskDescription: context.taskDescription,
        location: context.location,
        photoId: context.photoId
      },

      // Analysis metadata
      metadata: {
        analysisType: 'enhanced',
        confidence: this.calculateConfidence({ equipmentAnalysis, damageAnalysis, componentAnalysis }),
        timestamp: new Date().toISOString()
      }
    };

    return combined;
  }

  /**
   * Calculate overall equipment condition
   */
  calculateOverallCondition(equipmentAnalysis, damageAnalysis, componentAnalysis) {
    if (damageAnalysis.hasCriticalIssues) return 'Critical';
    if (damageAnalysis.hasSafetyRisks) return 'Poor';
    if (damageAnalysis.totalDamages > 3) return 'Fair';
    if (damageAnalysis.totalDamages > 0) return 'Good';
    return equipmentAnalysis.condition || 'Good';
  }

  /**
   * Calculate priority based on damage analysis
   */
  calculatePriority(damageAnalysis) {
    if (damageAnalysis.hasCriticalIssues) return 'Critical';
    if (damageAnalysis.hasSafetyRisks) return 'High';
    if (damageAnalysis.immediateIssues > 0) return 'High';
    if (damageAnalysis.totalDamages > 2) return 'Medium';
    return 'Low';
  }

  /**
   * Estimate repair time based on issues
   */
  estimateRepairTime(damageAnalysis, componentAnalysis) {
    let totalTime = 0;
    
    // Add time for each damage type
    damageAnalysis.damages?.forEach(damage => {
      switch (damage.severity) {
        case 'Critical': totalTime += 4; break; // 4 hours
        case 'High': totalTime += 2; break;     // 2 hours
        case 'Medium': totalTime += 1; break;   // 1 hour
        case 'Low': totalTime += 0.5; break;    // 30 minutes
      }
    });

    // Add time for component replacements
    totalTime += (componentAnalysis.needsReplacement || 0) * 1.5; // 1.5 hours per replacement

    if (totalTime === 0) return 'No repairs needed';
    if (totalTime <= 1) return `${Math.round(totalTime * 60)} minutes`;
    if (totalTime <= 8) return `${Math.round(totalTime)} hours`;
    return `${Math.ceil(totalTime / 8)} days`;
  }

  /**
   * Identify parts needed based on component analysis
   */
  identifyPartsNeeded(componentAnalysis) {
    const parts = [];
    
    componentAnalysis.components?.forEach(component => {
      if (component.maintenanceStatus === 'replace') {
        parts.push(`${component.name} - Replacement needed`);
      } else if (component.maintenanceStatus === 'needs attention') {
        parts.push(`${component.name} - Maintenance required`);
      }
    });

    return parts.length > 0 ? parts : ['No specific parts identified'];
  }

  /**
   * Generate safety recommendations
   */
  generateSafetyRecommendations(damageAnalysis) {
    const recommendations = [];
    
    if (damageAnalysis.hasCriticalIssues) {
      recommendations.push('IMMEDIATE: Take equipment out of service until repairs are completed');
    }
    
    if (damageAnalysis.hasSafetyRisks) {
      recommendations.push('URGENT: Address safety issues before equipment use');
    }
    
    damageAnalysis.damages?.forEach(damage => {
      if (damage.safetyRisk) {
        recommendations.push(`Safety: Address ${damage.type} damage at ${damage.location}`);
      }
    });

    return recommendations.length > 0 ? recommendations : ['No immediate safety concerns'];
  }

  /**
   * Generate maintenance recommendations
   */
  generateMaintenanceRecommendations(equipmentAnalysis, damageAnalysis, componentAnalysis) {
    const recommendations = [];
    
    // Equipment-specific recommendations
    if (equipmentAnalysis.condition === 'poor') {
      recommendations.push('Schedule comprehensive maintenance inspection');
    }
    
    // Damage-based recommendations
    damageAnalysis.damages?.forEach(damage => {
      if (damage.immediateAction) {
        recommendations.push(`URGENT: Repair ${damage.type} damage at ${damage.location}`);
      } else {
        recommendations.push(`Schedule repair for ${damage.type} damage at ${damage.location}`);
      }
    });

    // Component-based recommendations
    componentAnalysis.components?.forEach(component => {
      if (component.maintenanceStatus === 'replace') {
        recommendations.push(`Replace ${component.name} component`);
      } else if (component.maintenanceStatus === 'needs attention') {
        recommendations.push(`Maintain ${component.name} component`);
      }
    });

    return recommendations.length > 0 ? recommendations : ['Perform routine maintenance check'];
  }

  /**
   * Calculate overall confidence score
   */
  calculateConfidence(analysisResults) {
    const { equipmentAnalysis, damageAnalysis, componentAnalysis } = analysisResults;
    
    let confidence = 0;
    let factors = 0;
    
    if (equipmentAnalysis.confidence) {
      confidence += equipmentAnalysis.confidence;
      factors++;
    }
    
    if (damageAnalysis.damages && damageAnalysis.damages.length > 0) {
      confidence += 80; // High confidence if damages were detected
      factors++;
    }
    
    if (componentAnalysis.components && componentAnalysis.components.length > 0) {
      confidence += 75; // Good confidence if components were identified
      factors++;
    }
    
    return factors > 0 ? Math.round(confidence / factors) : 50;
  }

  /**
   * Extract value from text using key patterns
   */
  extractValue(content, key) {
    const patterns = [
      new RegExp(`${key}:\\s*([^\\n]+)`, 'i'),
      new RegExp(`${key}\\s*=\\s*([^\\n]+)`, 'i'),
      new RegExp(`${key}\\s*:\\s*([^\\n]+)`, 'i')
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return null;
  }

  /**
   * Extract confidence percentage from text
   */
  extractConfidence(content) {
    const confidenceMatch = content.match(/confidence[:\s]*(\d+)%/i);
    return confidenceMatch ? parseInt(confidenceMatch[1]) : null;
  }

  /**
   * Extract general damage information when structured parsing fails
   */
  extractGeneralDamage(content) {
    const damageKeywords = ['damage', 'broken', 'crack', 'loose', 'wear', 'tear', 'issue'];
    const severityKeywords = {
      'Critical': ['critical', 'severe', 'dangerous', 'unsafe'],
      'High': ['high', 'serious', 'major'],
      'Medium': ['medium', 'moderate'],
      'Low': ['low', 'minor', 'slight']
    };

    for (const keyword of damageKeywords) {
      if (content.toLowerCase().includes(keyword)) {
        let severity = 'Low';
        for (const [level, words] of Object.entries(severityKeywords)) {
          if (words.some(word => content.toLowerCase().includes(word))) {
            severity = level;
            break;
          }
        }
        
        return {
          type: 'General damage',
          severity: severity,
          location: 'Unknown',
          description: 'Damage detected in image',
          safetyRisk: severity === 'Critical' || severity === 'High',
          immediateAction: severity === 'Critical'
        };
      }
    }
    
    return null;
  }

  /**
   * Get highest severity from damage list
   */
  getHighestSeverity(damages) {
    const severityOrder = ['Low', 'Medium', 'High', 'Critical'];
    let highest = 'Low';
    
    damages.forEach(damage => {
      const index = severityOrder.indexOf(damage.severity);
      const highestIndex = severityOrder.indexOf(highest);
      if (index > highestIndex) {
        highest = damage.severity;
      }
    });
    
    return highest;
  }

  /**
   * Generate enhanced mock analysis for testing
   */
  generateEnhancedMockAnalysis(context) {
    const { equipmentType = 'Treadmill', taskDescription = 'General inspection' } = context;
    
    return {
      equipment: {
        type: equipmentType,
        brandModel: 'Mock Brand Model',
        component: 'General',
        condition: 'Good',
        confidence: 85,
        reasoning: 'Mock analysis for testing purposes'
      },
      damages: {
        issues: [
          {
            type: 'Wear',
            severity: 'Low',
            location: 'Surface',
            description: 'Minor surface wear detected',
            safetyRisk: false,
            immediateAction: false
          }
        ],
        totalIssues: 1,
        highestSeverity: 'Low',
        safetyIssues: 0,
        immediateIssues: 0,
        hasCriticalIssues: false,
        hasSafetyRisks: false
      },
      components: {
        identified: [
          {
            name: 'Belt',
            function: 'Traction surface',
            condition: 'Good',
            maintenanceStatus: 'okay',
            notes: 'Normal wear pattern'
          }
        ],
        totalComponents: 1,
        needsAttention: 0,
        needsReplacement: 0,
        inGoodCondition: 1
      },
      assessment: {
        overallCondition: 'Good',
        priority: 'Low',
        estimatedRepairTime: 'No repairs needed',
        partsNeeded: ['No specific parts identified'],
        safetyRecommendations: ['No immediate safety concerns'],
        maintenanceRecommendations: ['Perform routine maintenance check']
      },
      context: context,
      metadata: {
        analysisType: 'enhanced-mock',
        confidence: 85,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Get MIME type from file extension
   */
  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'image/jpeg';
  }

  /**
   * Analyze multiple photos for a task
   */
  async analyzeTaskPhotos(taskId, photoIds) {
    const analyses = [];
    
    for (const photoId of photoIds) {
      try {
        // Get photo path from database (this would need to be implemented)
        const photoPath = `/path/to/photo/${photoId}`;
        const analysis = await this.analyzePhoto(photoPath, { taskId });
        analyses.push({ photoId, analysis });
      } catch (error) {
        console.error(`Error analyzing photo ${photoId}:`, error);
        analyses.push({ photoId, error: error.message });
      }
    }
    
    return analyses;
  }
}

module.exports = new AIAnalysisService(); 