use serde::{Deserialize, Serialize};
use std::env;
use reqwest::Client;

#[derive(Clone)]
pub struct AIService {
    client: Client,
    api_key: String,
    base_url: String,
}

#[derive(Serialize)]
struct CompletionRequest {
    model: String,
    messages: Vec<Message>,
    max_tokens: u32,
    temperature: f32,
}

#[derive(Serialize)]
struct Message {
    role: String,
    content: Content,
}

#[derive(Serialize)]
#[serde(untagged)]
enum Content {
    Text(String),
    Parts(Vec<ContentPart>),
}

#[derive(Serialize)]
struct ContentPart {
    #[serde(rename = "type")]
    part_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    text: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    image_url: Option<ImageUrl>,
}

#[derive(Serialize)]
struct ImageUrl {
    url: String,
}

#[derive(Deserialize, Debug)]
struct CompletionResponse {
    choices: Vec<Choice>,
}

#[derive(Deserialize, Debug)]
struct Choice {
    message: MessageResponse,
}

#[derive(Deserialize, Debug)]
struct MessageResponse {
    content: String,
}

#[derive(Serialize)]
pub struct AnalysisResult {
    pub analysis: String,
    pub priority: String, // simplified for now
}

impl AIService {
    pub fn new() -> Self {
        let api_key = env::var("PERPLEXITY_API_KEY").unwrap_or_else(|_| {
            tracing::warn!("PERPLEXITY_API_KEY not set. AI features will be disabled.");
            "DUMMY_KEY".to_string()
        });
        
        let client = Client::new();
        
        if api_key.starts_with("sk-") {
            tracing::info!("Detected OpenAI API Key. Switching provider to OpenAI.");
            AIService {
                client,
                api_key,
                base_url: "https://api.openai.com/v1/chat/completions".to_string(),
            }
        } else {
            AIService {
                client,
                api_key,
                base_url: "https://api.perplexity.ai/chat/completions".to_string(),
            }
        }
    }

    pub async fn analyze_image(&self, description: &str, context: &str) -> Result<AnalysisResult, Box<dyn std::error::Error>> {
        let system_prompt = format!(
            "You are a fitness facility maintenance expert. Analyze: {}. Context: {}. \
            Provide: 1. Analysis, 2. Recommendations, 3. Priority. Format: Text.", 
            description, context
        );

        let model = if self.base_url.contains("openai") { "gpt-4o" } else { "llama-3.1-sonar-small-128k-online" };

        let payload = CompletionRequest {
            model: model.to_string(),
            messages: vec![
                Message { 
                    role: "system".to_string(), 
                    content: Content::Text(system_prompt)
                },
                Message { 
                    role: "user".to_string(), 
                    content: Content::Text(format!("Analyze: {}", description))
                },
            ],
            max_tokens: 1000,
            temperature: 0.3,
        };

        self.send_request(&payload).await
    }

    pub async fn analyze_image_with_photo(&self, base64_image: &str, context: &str) -> Result<AnalysisResult, Box<dyn std::error::Error>> {
        let system_prompt = format!(
            "You are a fitness facility maintenance expert. Context: {}. \
            Identify equipment, damage, and provide maintenance recommendations. \
            Return JSON with keys: equipment_type, damage_assessment, safety_concerns, time_estimate, tools_needed.",
            context
        );

        let model = if self.base_url.contains("openai") { "gpt-4o" } else { "llama-3.1-sonar-small-128k-online" };

        let payload = CompletionRequest {
            model: model.to_string(),
            messages: vec![
                Message {
                    role: "system".to_string(),
                    content: Content::Text(system_prompt),
                },
                Message {
                    role: "user".to_string(),
                    content: Content::Parts(vec![
                        ContentPart {
                            part_type: "text".to_string(),
                            text: Some("Analyze this maintenance photo.".to_string()),
                            image_url: None,
                        },
                        ContentPart {
                            part_type: "image_url".to_string(),
                            text: None,
                            image_url: Some(ImageUrl {
                                url: format!("data:image/jpeg;base64,{}", base64_image),
                            }),
                        },
                    ]),
                },
            ],
            max_tokens: 1000,
            temperature: 0.3,
        };

        self.send_request(&payload).await
    }

    async fn send_request(&self, payload: &CompletionRequest) -> Result<AnalysisResult, Box<dyn std::error::Error>> {
        if self.api_key == "DUMMY_KEY" {
            return Err("AI Service not configured. Please set PERPLEXITY_API_KEY.".into());
        }

        let res = self.client.post(&self.base_url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(payload)
            .send()
            .await?;

        let status = res.status();
        let text = res.text().await?;
        println!("AI API Response: Status={}, Body={}", status, text);

        let body: CompletionResponse = serde_json::from_str(&text)?;
        let content = body.choices.first().map(|c| c.message.content.clone()).unwrap_or_default();

        let priority = if content.to_lowercase().contains("critical") { "critical" } 
                      else if content.to_lowercase().contains("high") { "high" }
                      else { "medium" };

        Ok(AnalysisResult {
            analysis: content.into(),
            priority: priority.into(),
        })
    }
}
