use leptos::*;
use wasm_bindgen::prelude::*;
use crate::api::{update_part_quantity, Part};

// JavaScript bindings for Speech Recognition
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

/// Parse voice command like "used 4 hammers" or "received 10 seals"
pub fn parse_voice_command(text: &str) -> Option<(String, i32, String)> {
    let text = text.to_lowercase();
    let words: Vec<&str> = text.split_whitespace().collect();
    
    // Look for action words
    let action = if text.contains("used") || text.contains("use") || text.contains("took") {
        "used"
    } else if text.contains("added") || text.contains("add") || text.contains("received") || text.contains("got") {
        "added"
    } else {
        return None;
    };
    
    // Find number in the text
    let mut quantity: i32 = 1;
    for word in &words {
        if let Ok(num) = word.parse::<i32>() {
            quantity = num;
            break;
        }
    }
    
    // Extract part keywords (filter out action words and numbers)
    let part_keywords: Vec<&str> = words
        .iter()
        .filter(|w| {
            !["used", "use", "took", "added", "add", "received", "got", "today", "the", "a", "an", "some", "of", "for", "we"]
                .contains(*w) && w.parse::<i32>().is_err()
        })
        .copied()
        .collect();
    
    let quantity_change = if action == "used" { -quantity.abs() } else { quantity.abs() };
    
    Some((action.to_string(), quantity_change, part_keywords.join(" ")))
}

/// Find the best matching part from the parts list
pub fn find_matching_part(parts: &[Part], query: &str) -> Option<Part> {
    let query = query.to_lowercase();
    
    // First try exact name match
    if let Some(part) = parts.iter().find(|p| p.name.to_lowercase() == query) {
        return Some(part.clone());
    }
    
    // Then try contains match
    if let Some(part) = parts.iter().find(|p| p.name.to_lowercase().contains(&query)) {
        return Some(part.clone());
    }
    
    // Try matching any keyword
    let keywords: Vec<&str> = query.split_whitespace().collect();
    for keyword in &keywords {
        if keyword.len() > 2 { // Skip short words
            for part in parts {
                if part.name.to_lowercase().contains(keyword) {
                    return Some(part.clone());
                }
            }
        }
    }
    
    None
}

#[component]
pub fn VoiceInput(
    on_voice_update: Callback<(i32, i32)>, // (part_id, quantity_change)
    parts: Signal<Vec<Part>>,
) -> impl IntoView {
    let (is_listening, set_is_listening) = create_signal(false);
    let (status_text, set_status_text) = create_signal("🎤 Tap to speak".to_string());
    let (result_text, set_result_text) = create_signal(String::new());
    
    // Manual input fallback
    let (manual_input, set_manual_input) = create_signal(String::new());

    // Process the transcribed text
    let process_command = move |text: String| {
        let parts_list = parts.get();
        
        if let Some((action, qty_change, part_query)) = parse_voice_command(&text) {
            if let Some(part) = find_matching_part(&parts_list, &part_query) {
                on_voice_update.call((part.id, qty_change));
                set_result_text.set(format!("✅ {} {} ({})", action, part.name, if qty_change > 0 { format!("+{}", qty_change) } else { qty_change.to_string() }));
                set_status_text.set("Command executed!".to_string());
            } else {
                set_result_text.set(format!("❌ Part not found: '{}'", part_query));
                set_status_text.set("Part not in inventory".to_string());
            }
        } else {
            set_result_text.set(format!("❓ Didn't understand: '{}'", text));
            set_status_text.set("Try: 'used 4 hammers'".to_string());
        }
    };

    // Manual submit handler - process the command
    let process_input = move || {
        let text = manual_input.get();
        if !text.is_empty() {
            process_command(text.clone());
            set_manual_input.set(String::new());
        }
    };

    // Start voice recognition
    let start_listening = move |_| {
        set_is_listening.set(true);
        set_status_text.set("🔴 Listening...".to_string());
        set_result_text.set(String::new());
        
        // Use JavaScript for Speech Recognition (more reliable in WebView)
        let set_manual = set_manual_input.clone();
        let set_listening = set_is_listening.clone();
        let set_status = set_status_text.clone();
        
        spawn_local(async move {
            use wasm_bindgen::JsCast;
            use js_sys::Reflect;
            
            let window = web_sys::window().unwrap();
            
            // Check if SpeechRecognition is available
            let speech_recognition = Reflect::get(&window, &"webkitSpeechRecognition".into())
                .or_else(|_| Reflect::get(&window, &"SpeechRecognition".into()));
            
            match speech_recognition {
                Ok(sr_constructor) if !sr_constructor.is_undefined() => {
                    // Create recognition instance via JavaScript
                    let js_code = r#"
                        (function() {
                            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                            const recognition = new SpeechRecognition();
                            recognition.lang = 'en-US';
                            recognition.continuous = false;
                            recognition.interimResults = false;
                            
                            return new Promise((resolve, reject) => {
                                recognition.onresult = (event) => {
                                    const transcript = event.results[0][0].transcript;
                                    resolve(transcript);
                                };
                                recognition.onerror = (event) => {
                                    reject(event.error);
                                };
                                recognition.onend = () => {
                                    // If no result, resolve with empty
                                };
                                recognition.start();
                            });
                        })()
                    "#;
                    
                    let promise = js_sys::eval(js_code);
                    match promise {
                        Ok(p) => {
                            let promise: js_sys::Promise = p.unchecked_into();
                            match wasm_bindgen_futures::JsFuture::from(promise).await {
                                Ok(result) => {
                                    if let Some(text) = result.as_string() {
                                        set_manual.set(text);
                                        set_status.set("✅ Heard you! Click Execute.".to_string());
                                    }
                                }
                                Err(e) => {
                                    log(&format!("Speech error: {:?}", e));
                                    set_status.set("❌ Speech error. Type instead.".to_string());
                                }
                            }
                        }
                        Err(_) => {
                            set_status.set("❌ Speech not available".to_string());
                        }
                    }
                }
                _ => {
                    set_status.set("❌ Speech recognition not supported".to_string());
                }
            }
            
            set_listening.set(false);
        });
    };


    view! {
        <div class="bg-gradient-to-r from-purple-900/40 to-blue-900/40 p-5 rounded-xl border border-purple-500/30 mb-6">
            <div class="flex items-center gap-4 mb-4">
                <div class="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-2xl">
                    "🎤"
                </div>
                <div class="flex-1">
                    <h3 class="font-bold text-lg">"Voice Commands"</h3>
                    <p class="text-sm text-gray-400">"Say or type: \"used 4 hammers today\""</p>
                </div>
            </div>
            
            // Manual text input (always works, voice is bonus)
            <div class="flex gap-2">
                <input 
                    type="text"
                    class="flex-1 bg-slate-800 border border-slate-600 p-3 rounded-lg"
                    placeholder="Type command: 'used 4 hammers' or 'received 10 seals'"
                    prop:value=manual_input
                    on:input=move |ev| set_manual_input.set(event_target_value(&ev))
                    on:keydown=move |ev| if ev.key() == "Enter" { process_input() }
                />
                <button 
                    class={move || if is_listening.get() { 
                        "px-4 py-3 bg-red-500 animate-pulse rounded-lg font-bold transition text-xl" 
                    } else { 
                        "px-4 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-bold transition text-xl" 
                    }}
                    on:click=start_listening
                    title="Click to speak"
                >
                    "🎤"
                </button>
                <button 
                    class="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition"
                    on:click=move |_| process_input()
                >
                    "Execute"
                </button>
            </div>
            
            // Status display
            <div class="mt-4 mb-2 text-sm text-cyan-400 font-medium min-h-[20px]">
                {move || status_text.get()}
            </div>
            
            // Result display
            <Show when=move || !result_text.get().is_empty() fallback=|| ()>
                <div class="mt-3 p-3 bg-slate-800/70 rounded-lg text-sm font-medium">
                    {move || result_text.get()}
                </div>
            </Show>
            
            // Example commands
            <div class="mt-4 text-xs text-gray-500 flex flex-wrap items-center gap-3">
                <span class="uppercase tracking-wider font-bold text-purple-400">"Examples:"</span>
                <code class="bg-slate-800 text-purple-300 px-2 py-1 rounded border border-purple-500/20">"used 4 hammers"</code>
                <code class="bg-slate-800 text-blue-300 px-2 py-1 rounded border border-blue-500/20">"received 10 seals"</code>
                <code class="bg-slate-800 text-emerald-300 px-2 py-1 rounded border border-emerald-500/20">"added 2 pumps"</code>
            </div>
        </div>
    }
}
