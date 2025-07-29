const axios = require('axios');

// Perplexity API configuration
const PERPLEXITY_CONFIG = {
  apiKey: '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',
  model: 'llama-3.1-sonar-large-128k-online',
  visionModel: 'llama-3.1-sonar-large-128k-online',
  maxTokens: 2000,
  temperature: 0.2,
  baseURL: 'https://api.perplexity.ai'
};

// Perplexity API wrapper class
class PerplexityAPI {
  constructor() {
    this.config = PERPLEXITY_CONFIG;
    this.client = axios.create({
      baseURL: this.config.baseURL,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Search for real-time information
  async search(query, context = '') {
    try {
      const response = await this.client.post('/chat/completions', {
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: `You are a maintenance assistant. Provide helpful, accurate information about gym equipment, maintenance procedures, and parts. Focus on practical, actionable advice.`
          },
          {
            role: 'user',
            content: `Context: ${context}\n\nQuery: ${query}`
          }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      });

      return response.data.choices[0].message.content;

    } catch (error) {
      console.error('Perplexity search failed:', error);
      return 'Unable to retrieve information at this time.';
    }
  }

  // Analyze image using Perplexity Vision
  async analyzeImage(imageData, prompt = '') {
    try {
      const defaultPrompt = `Analyze this gym equipment photo. Identify:
1. Equipment type and model (if visible)
2. Visible damage or wear patterns
3. Safety concerns or risks
4. Required maintenance actions
5. Parts that may need replacement
6. Estimated repair time and cost
7. Tools needed for repair

Provide a detailed analysis with specific recommendations.`;

      const response = await this.client.post('/chat/completions', {
        model: this.config.visionModel,
        messages: [
          {
            role: 'system',
            content: 'You are an expert gym equipment maintenance technician. Analyze photos to identify issues and provide repair recommendations.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt || defaultPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      });

      return response.data.choices[0].message.content;

    } catch (error) {
      console.error('Perplexity image analysis failed:', error);
      return 'Unable to analyze image at this time. Manual inspection required.';
    }
  }

  // Get equipment specifications
  async getEquipmentSpecs(equipmentType, model = '') {
    try {
      const query = model ? 
        `${equipmentType} ${model} specifications maintenance requirements` :
        `${equipmentType} maintenance requirements common issues`;

      return await this.search(query, 'equipment specifications');

    } catch (error) {
      console.error('Perplexity equipment specs failed:', error);
      return 'Unable to retrieve equipment specifications.';
    }
  }

  // Get parts information and pricing
  async getPartsInfo(partName, equipmentModel = '') {
    try {
      const query = equipmentModel ?
        `${partName} for ${equipmentModel} replacement parts pricing` :
        `${partName} gym equipment replacement parts`;

      return await this.search(query, 'parts and pricing');

    } catch (error) {
      console.error('Perplexity parts info failed:', error);
      return 'Unable to retrieve parts information.';
    }
  }

  // Get repair procedures
  async getRepairProcedures(issue, equipmentType) {
    try {
      const query = `${issue} repair procedure for ${equipmentType} step by step instructions`;

      return await this.search(query, 'repair procedures');

    } catch (error) {
      console.error('Perplexity repair procedures failed:', error);
      return 'Unable to retrieve repair procedures.';
    }
  }

  // Get safety information
  async getSafetyInfo(equipmentType, issue = '') {
    try {
      const query = issue ?
        `${equipmentType} ${issue} safety concerns precautions` :
        `${equipmentType} maintenance safety guidelines`;

      return await this.search(query, 'safety information');

    } catch (error) {
      console.error('Perplexity safety info failed:', error);
      return 'Unable to retrieve safety information.';
    }
  }

  // Get cost estimates
  async getCostEstimate(repairType, equipmentType) {
    try {
      const query = `${repairType} cost estimate for ${equipmentType} repair parts labor`;

      return await this.search(query, 'cost estimation');

    } catch (error) {
      console.error('Perplexity cost estimate failed:', error);
      return 'Unable to provide cost estimate.';
    }
  }
}

module.exports = {
  PERPLEXITY_CONFIG,
  PerplexityAPI
}; 