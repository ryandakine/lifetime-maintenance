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
                    class="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition"
                    on:click=move |_| process_input()
                >
                    "Execute"
                </button>
            </div>
            
            // Result display
            <Show when=move || !result_text.get().is_empty() fallback=|| ()>
                <div class="mt-3 p-3 bg-slate-800/70 rounded-lg text-sm font-medium">
                    {move || result_text.get()}
                </div>
            </Show>
            
            // Example commands
            <div class="mt-3 text-xs text-gray-500 flex gap-4">
                <span>"Examples:"</span>
                <code class="bg-slate-800 px-1 rounded">"used 4 hammers"</code>
                <code class="bg-slate-800 px-1 rounded">"received 10 seals"</code>
                <code class="bg-slate-800 px-1 rounded">"added 2 pumps"</code>
            </div>
        </div>
    }
}
