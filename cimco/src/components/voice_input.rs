use leptos::*;
use wasm_bindgen::prelude::*;
use crate::api::Part;

// JavaScript bindings for Speech Recognition
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// Enum for Omni-box result
#[derive(Clone, Debug, PartialEq)]
pub enum OmniResult {
    Command(String, i32, String), // Action (used/added), quantity, part_name
    Search(String),               // Just a search query
    None
}

/// Parse input as either a command or a search query
pub fn parse_omni_input(text: &str) -> OmniResult {
    let text_lower = text.to_lowercase();
    let words: Vec<&str> = text_lower.split_whitespace().collect();
    
    // 1. Check for Command Pattern (Action + Number)
    let action = if text_lower.contains("used") || text_lower.contains("use") || text_lower.contains("took") {
        Some("used")
    } else if text_lower.contains("added") || text_lower.contains("add") || text_lower.contains("received") || text_lower.contains("got") {
        Some("added")
    } else {
        None
    };

    if let Some(act) = action {
        // Look for a number
        let mut quantity: Option<i32> = None;
        for word in &words {
            if let Ok(num) = word.parse::<i32>() {
                quantity = Some(num);
                break;
            }
        }

        if let Some(qty) = quantity {
             // Extract part keywords (filter out action words and numbers)
            let part_keywords: Vec<&str> = words
                .iter()
                .filter(|w| {
                    !["used", "use", "took", "added", "add", "received", "got", "today", "the", "a", "an", "some", "of", "for", "we"]
                        .contains(*w) && w.parse::<i32>().is_err()
                })
                .copied()
                .collect();
            
            let final_qty = if act == "used" { -qty.abs() } else { qty.abs() };
            return OmniResult::Command(act.to_string(), final_qty, part_keywords.join(" "));
        }
    }

    // 2. Default to Search
    if text.trim().is_empty() {
        OmniResult::None
    } else {
        OmniResult::Search(text.to_string())
    }
}

/// Find the best matching part from the parts list
pub fn find_matching_part(parts: &[crate::api::Part], query: &str) -> Option<crate::api::Part> {
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
    on_voice_update: Callback<(i32, i32)>, // (part_id, quantity_change) for commands
    on_search_update: Callback<String>,    // For search queries
    parts: Signal<Vec<Part>>,
) -> impl IntoView {
    let (is_listening, set_is_listening) = create_signal(false);
    let (manual_input, set_manual_input) = create_signal(String::new());
    let (feedback, set_feedback) = create_signal(Option::<String>::None);

    // Process input (text or voice)
    let process_input = move |text: String| {
        let parts_list = parts.get();
        let result = parse_omni_input(&text);

        match result {
            OmniResult::Command(action, qty, part_query) => {
                 if let Some(part) = find_matching_part(&parts_list, &part_query) {
                    on_voice_update.call((part.id, qty));
                     let msg = format!("✅ {} {} {} ({})", if qty > 0 { "Added" } else { "Used" }, qty.abs(), part.name, if qty > 0 { "+" } else { "-" });
                    set_feedback.set(Some(msg));
                    // Clear input on successful command
                    set_manual_input.set(String::new());
                    on_search_update.call(String::new()); // Clear search
                } else {
                    set_feedback.set(Some(format!("❌ Part not found: '{}'", part_query)));
                }
            },
            OmniResult::Search(query) => {
                // Just update the search filter
                on_search_update.call(query);
                set_feedback.set(None);
            },
            OmniResult::None => {
                on_search_update.call(String::new());
                 set_feedback.set(None);
            }
        }
    };

    // Trigger processing when input changes (live search) or Enter pressed (command)
    let on_input_change = move |ev| {
        let val = event_target_value(&ev);
        set_manual_input.set(val.clone());
        
        // If it looks like a command or question, don't execute automatically
        match parse_omni_input(&val) {
             OmniResult::Command(_, _, _) => { /* Wait for enter */ },
             OmniResult::Search(q) => on_search_update.call(q),
             OmniResult::None => on_search_update.call(String::new())
        }
    };

    let start_listening = move |_| {
        set_is_listening.set(true);
        set_feedback.set(Some("🎤 Listening...".to_string()));
        
        let set_manual = set_manual_input.clone();
        let set_listening = set_is_listening.clone();
        
        // Re-use logic for executing the command immediately after voice works
        let processor = process_input.clone();

        spawn_local(async move {
            use wasm_bindgen::JsCast;
            use js_sys::Reflect;
            let window = web_sys::window().unwrap();
            
             // Check if SpeechRecognition is available
            let speech_recognition = Reflect::get(&window, &"webkitSpeechRecognition".into())
                .or_else(|_| Reflect::get(&window, &"SpeechRecognition".into()));
            
            match speech_recognition {
                Ok(sr_constructor) if !sr_constructor.is_undefined() => {
                    let js_code = r#"
                        (function() {
                            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                            const recognition = new SpeechRecognition();
                            recognition.lang = 'en-US';
                            recognition.continuous = false;
                            recognition.interimResults = false;
                            return new Promise((resolve, reject) => {
                                recognition.onresult = (event) => resolve(event.results[0][0].transcript);
                                recognition.onerror = (event) => reject(event.error);
                                recognition.start();
                            });
                        })()
                    "#;
                    
                    if let Ok(promise) = js_sys::eval(js_code) {
                        let promise: js_sys::Promise = promise.unchecked_into();
                        if let Ok(result) = wasm_bindgen_futures::JsFuture::from(promise).await {
                             if let Some(text) = result.as_string() {
                                set_manual.set(text.clone());
                                set_listening.set(false);
                                // Auto-execute voice result
                                processor(text);
                            }
                        }
                    }
                }
                _ => set_feedback.set(Some("❌ Mic not supported".to_string()))
            }
            set_listening.set(false);
        });
    };

    view! {
        <div class="relative w-full mb-6 group">
            // Feedback Overlay / Tooltip
            {move || feedback.get().map(|msg| view! {
                <div class="absolute -top-8 left-0 text-xs font-bold px-2 py-1 rounded bg-slate-800 border border-slate-600 shadow-xl text-cyan-400 animate-fade-in z-20">
                    {msg}
                </div>
            })}

            <div class="relative flex items-center">
                <div class="absolute left-4 text-slate-400 group-focus-within:text-cyan-400 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                </div>
                
                <input 
                    type="text"
                    class="w-full bg-slate-800/80 backdrop-blur border border-slate-600 rounded-xl py-4 pl-12 pr-14 text-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition shadow-lg"
                    placeholder="Search parts OR say 'Used 4 hammers'..."
                    prop:value=manual_input
                    on:input=on_input_change
                    on:keydown=move |ev| if ev.key() == "Enter" { process_input(manual_input.get()) }
                />

                <button 
                    class={move || if is_listening.get() { 
                        "p-2 text-red-500 animate-pulse hover:bg-slate-700/50 rounded-full transition" 
                    } else { 
                        "p-2 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-full transition" 
                    }}
                    style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%);"
                    on:click=start_listening
                    title="Voice Command / Search"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                </button>
            </div>
            
            // Helpful hints under the bar
            <div class="flex justify-between px-2 mt-2">
                 <div class="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                    "AI Smart Bar"
                 </div>
                 <div class="text-[10px] text-slate-600 flex gap-4">
                    <span>"Try: 'Metso Hammer'"</span>
                    <span>"Try: 'Used 2 seals'"</span>
                    <span>"Try: 'Added 5 bolts'"</span>
                 </div>
            </div>
        </div>
    }
}
