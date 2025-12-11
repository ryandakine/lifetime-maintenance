import httpx
import asyncio
from typing import Dict, Any, Optional
from app.core.config import settings
import time

class AIService:
    def __init__(self):
        self.api_key = settings.PERPLEXITY_API_KEY
        self.base_url = "https://api.perplexity.ai/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def analyze_image(self, image_description: str, context: str = "", analysis_type: str = "maintenance") -> Dict[str, Any]:
        """
        Analyze an image description using Perplexity AI for maintenance purposes
        """
        start_time = time.time()
        
        # Create a specialized prompt for maintenance analysis
        system_prompt = f"""You are a professional fitness facility maintenance expert. Analyze the provided image description and provide detailed maintenance insights.

Context: {context}
Analysis Type: {analysis_type}

Please provide:
1. Detailed analysis of the equipment/area shown
2. Specific maintenance recommendations
3. Priority level (low/medium/high/critical)
4. Safety concerns if any
5. Estimated time and cost for repairs
6. Parts or supplies needed

Format your response as a structured analysis with clear sections."""

        user_prompt = f"Please analyze this fitness facility image: {image_description}"

        payload = {
            "model": "llama-3.1-sonar-small-128k-online",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": 1000,
            "temperature": 0.3
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.base_url,
                    headers=self.headers,
                    json=payload,
                    timeout=30.0
                )
                response.raise_for_status()
                
                result = response.json()
                processing_time = time.time() - start_time
                
                # Extract the analysis from the response
                analysis_text = result.get("choices", [{}])[0].get("message", {}).get("content", "")
                
                # Parse the analysis to extract structured information
                recommendations = self._extract_recommendations(analysis_text)
                priority = self._extract_priority(analysis_text)
                confidence = self._calculate_confidence(analysis_text)
                
                return {
                    "analysis": analysis_text,
                    "recommendations": recommendations,
                    "priority": priority,
                    "confidence": confidence,
                    "processing_time": processing_time,
                    "raw_response": result
                }
                
        except Exception as e:
            processing_time = time.time() - start_time
            return {
                "analysis": f"Error analyzing image: {str(e)}",
                "recommendations": ["Contact maintenance team for manual inspection"],
                "priority": "medium",
                "confidence": 0.0,
                "processing_time": processing_time,
                "error": str(e)
            }

    async def generate_email_content(self, topic: str, recipient: str, urgency: str = "normal") -> Dict[str, Any]:
        """
        Generate professional email content using Perplexity AI
        """
        start_time = time.time()
        
        system_prompt = f"""You are a professional fitness facility maintenance coordinator. Generate a professional email based on the provided information.

Recipient: {recipient}
Urgency: {urgency}

Please create a well-structured email that:
1. Has a clear, professional subject line
2. Opens with appropriate greeting
3. Clearly states the maintenance issue or update
4. Includes relevant details and context
5. Provides next steps or action items
6. Closes professionally
7. Uses appropriate tone based on urgency level

Format the response as a complete email ready to send."""

        user_prompt = f"Generate an email about: {topic}"

        payload = {
            "model": "llama-3.1-sonar-small-128k-online",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": 800,
            "temperature": 0.4
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.base_url,
                    headers=self.headers,
                    json=payload,
                    timeout=30.0
                )
                response.raise_for_status()
                
                result = response.json()
                processing_time = time.time() - start_time
                
                email_content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
                
                return {
                    "email_content": email_content,
                    "processing_time": processing_time,
                    "recipient": recipient,
                    "urgency": urgency
                }
                
        except Exception as e:
            processing_time = time.time() - start_time
            return {
                "email_content": f"Error generating email: {str(e)}",
                "processing_time": processing_time,
                "error": str(e)
            }

    def _extract_recommendations(self, analysis_text: str) -> list:
        """Extract recommendations from AI analysis text"""
        recommendations = []
        lines = analysis_text.split('\n')
        
        for line in lines:
            line = line.strip()
            if any(keyword in line.lower() for keyword in ['recommend', 'suggest', 'should', 'need to', 'action']):
                if line and not line.startswith('#'):
                    recommendations.append(line)
        
        return recommendations[:5]  # Limit to 5 recommendations

    def _extract_priority(self, analysis_text: str) -> str:
        """Extract priority level from analysis text"""
        text_lower = analysis_text.lower()
        
        if any(word in text_lower for word in ['critical', 'urgent', 'emergency', 'immediate']):
            return "critical"
        elif any(word in text_lower for word in ['high', 'important', 'priority']):
            return "high"
        elif any(word in text_lower for word in ['low', 'minor', 'routine']):
            return "low"
        else:
            return "medium"

    def _calculate_confidence(self, analysis_text: str) -> float:
        """Calculate confidence score based on analysis quality"""
        # Simple heuristic based on text length and structure
        if len(analysis_text) < 50:
            return 0.3
        elif len(analysis_text) < 200:
            return 0.6
        else:
            return 0.8

# Global instance
ai_service = AIService() 