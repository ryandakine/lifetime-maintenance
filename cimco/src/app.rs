use leptos::*;


use wasm_bindgen::prelude::*;
use web_sys::window;
use std::time::Duration;
use crate::showcase::Showcase;
use crate::components::equipment_list::EquipmentList;
use crate::components::tasks::Tasks;
use crate::components::scale::Scale;
use crate::components::inventory::Inventory;
use crate::components::login::{User, UserRole};
use crate::components::system_map::SystemMap;

#[component]
pub fn App() -> impl IntoView {
    // Splash Screen State
    let (show_splash, set_show_splash) = create_signal(true);
    
    // Hide splash after 4.0 seconds (extended to see animation)
    set_timeout(
        move || set_show_splash.set(false),
        Duration::from_millis(4000),
    );
    
    // Global User State
    let (user, set_user) = create_signal::<Option<User>>(None);

    // Initial parsing of saved users
    let saved_users_json = window()
        .and_then(|w| w.local_storage().ok().flatten())
        .and_then(|ls| ls.get_item("cimco_recent_users").ok().flatten())
        .unwrap_or_else(|| "[]".to_string());
        
    let initial_recent: Vec<String> = serde_json::from_str(&saved_users_json).unwrap_or_default();
    let (recent_users, set_recent_users) = create_signal(initial_recent);

    // Demo Users
    let (demo_users, _) = create_signal(vec![
        "Ryan".to_string(),
        "Chief Engineer".to_string(),
        "Maintenance Tech".to_string(),
        "Safety Auditor".to_string(),
        "Refrigeration Lead".to_string(),
    ]);

    // Callback for login
    let _on_login = create_action(move |u: &User| {
        let u = u.clone();
        async move {
            set_user.set(Some(u));
        }
    });

    view! {
        <div class="min-h-screen bg-slate-900 text-white font-sans">
            // Splash Screen
            <Show when=move || show_splash.get() fallback=|| ()>
                <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 font-mono overflow-hidden">
                    // Sci-Fi Grid Background (Low Opacity)
                    <div class="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none z-0"></div>
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950 pointer-events-none z-0"></div>
                    
                    // Center Content Container
                    <div class="relative z-20 flex flex-col items-center justify-center text-center w-full px-4">
                         // Glowing Text Logo (Replaces Image)
                        <div class="relative group mb-12 p-8 border-4 border-cyan-500/30 rounded-3xl bg-slate-900/50 backdrop-blur-sm shadow-[0_0_50px_rgba(6,182,212,0.3)]">
                            <div class="absolute inset-0 bg-cyan-500/5 rounded-3xl animate-pulse"></div>
                            
                            // Corner Accents (Top-Left, Bottom-Right)
                            <div class="absolute -top-2 -left-2 w-10 h-10 border-t-8 border-l-8 border-cyan-400 rounded-tl-xl"></div>
                            <div class="absolute -bottom-2 -right-2 w-10 h-10 border-b-8 border-r-8 border-cyan-400 rounded-br-xl"></div>

                            // Solid Neon Text - MASSIVE SIZE
                            <h1 class="text-7xl sm:text-9xl md:text-[10rem] font-black text-cyan-400 tracking-widest drop-shadow-[0_0_35px_rgba(34,211,238,0.9)] leading-none" style="text-shadow: 0 0 20px rgba(34,211,238,0.6), 0 0 40px rgba(34,211,238,0.4);">
                                "CIMCO"
                            </h1>
                        </div>

                         // High Tech Spinner
                         <div class="relative w-20 h-20 mb-8 mx-auto">
                            <div class="absolute top-0 left-0 w-full h-full border-8 border-cyan-500/30 rounded-full animate-ping"></div>
                            <div class="absolute top-0 left-0 w-full h-full border-8 border-t-cyan-400 border-r-transparent border-b-cyan-400 border-l-transparent rounded-full animate-spin"></div>
                         </div>
                         
                         // Terminal Status Text
                         <div class="w-full text-center space-y-4">
                            <p class="text-cyan-300 text-2xl md:text-3xl font-bold tracking-[0.3em] animate-pulse">"SYSTEM INITIALIZING..."</p>
                            <p class="text-cyan-500/80 text-base md:text-lg">"LOADING MODULES: [REFRIGERATION, HYDRAULICS, SAFETY]"</p>
                            <p class="text-cyan-700/60 text-sm mt-4">"v2.0.4 - FUTURE READY"</p>
                         </div>
                    </div>
                </div>
            </Show>
            
            // Main App (after splash)
            <Show when=move || !show_splash.get() fallback=|| ()>
                // Login Screen
                <Show when=move || !show_splash.get() && user.get().is_none() fallback=|| ()>
                    <div class="fixed inset-0 flex items-center justify-center bg-slate-900 z-40">
                        <div class="bg-slate-800 p-8 rounded-lg shadow-2xl max-w-md w-full border border-slate-700 animate-fade-in">
                            <div class="text-center mb-8">
                                <img src="public/cimco-logo-official.png" alt="CIMCO" class="h-16 mx-auto mb-4" />
                                <h2 class="text-2xl font-bold text-white">"Operator Login"</h2>
                                <p class="text-slate-400 text-sm">"Enter your credentials to access the terminal"</p>
                            </div>
                            
                            <form on:submit=move |ev| {
                                ev.prevent_default();
                                // Logic handled by keydown/click for simplicity in this robust implementation
                            }>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-slate-300 mb-1">"Operator Name"</label>
                                        <input 
                                            type="text" 
                                            id="login-name"
                                            list="user-suggestions"
                                            class="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="Enter name or select demo user..."
                                            on:keydown=move |ev| {
                                                if ev.key() == "Enter" {
                                                    ev.prevent_default(); // Prevent form submit refresh
                                                    let val = event_target_value(&ev);
                                                    if !val.is_empty() {
                                                        // Save to recent users
                                                        let mut current = recent_users.get();
                                                        if !current.contains(&val) {
                                                            current.push(val.clone());
                                                            set_recent_users.set(current.clone());
                                                            // Save to local storage
                                                            if let Some(w) = window() {
                                                                if let Ok(Some(ls)) = w.local_storage() {
                                                                    let _ = ls.set_item("cimco_recent_users", &serde_json::to_string(&current).unwrap());
                                                                }
                                                            }
                                                        }
                                                        
                                                        set_user.set(Some(User { name: val, role: UserRole::Worker }));
                                                    }
                                                }
                                            }
                                        />
                                        <datalist id="user-suggestions">
                                            // Demo Users (Static)
                                            {demo_users.get().iter().map(|u| view! { <option value=u.clone()>"Demo User"</option> }).collect_view()}
                                            // Recent Users (Dynamic)
                                            {move || recent_users.get().iter().map(|u| view! { <option value=u.clone()>"Recognized User"</option> }).collect_view()}
                                        </datalist>
                                    </div>
                                    <button 
                                        type="button"
                                        class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors"
                                        on:click=move |_| {
                                            let input_el = document().get_element_by_id("login-name").unwrap();
                                            let val = input_el.dyn_into::<web_sys::HtmlInputElement>().unwrap().value();
                                            if !val.is_empty() {
                                                 // Save to recent users
                                                let mut current = recent_users.get();
                                                if !current.contains(&val) {
                                                    current.push(val.clone());
                                                    set_recent_users.set(current.clone());
                                                    // Save to local storage
                                                    if let Some(w) = window() {
                                                        if let Ok(Some(ls)) = w.local_storage() {
                                                            let _ = ls.set_item("cimco_recent_users", &serde_json::to_string(&current).unwrap());
                                                        }
                                                    }
                                                }
                                                set_user.set(Some(User { name: val, role: UserRole::Worker }));
                                            }
                                        }
                                    >
                                        "Login ->"
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Show>
                <Show
                    when=move || user.get().is_some()
                    fallback=|| ()
                >
                    <MainApp user=user.get().unwrap() />
                </Show>
            </Show>
        </div>
    }
}

#[component]
fn MainApp(user: User) -> impl IntoView {
    let is_admin = user.role == UserRole::Admin;
    
    // Simple navigation state - just show/hide sections
    let (current_page, set_current_page) = create_signal("dashboard".to_string());
    
    // Get time-based greeting
    let greeting = {
        let hour = js_sys::Date::new_0().get_hours();
        if hour < 12 {
            "Good morning"
        } else if hour < 17 {
            "Good afternoon"
        } else {
            "Good evening"
        }
    };
    
    // Display name: "Boss" for admin, actual name for workers
    let display_name = if is_admin { "Boss".to_string() } else { user.name.clone() };

    view! {
        <div class="container relative mx-auto">
            // Personalized Greeting Banner
            <div class="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-4 px-6 rounded-t-xl mt-4">
                <p class="text-2xl font-bold">
                    {greeting} ", " <span class="text-blue-300">{display_name}</span> "! 👋"
                </p>
                <p class="text-blue-200 text-sm">"Ready to keep the equipment running smooth."</p>
            </div>
            
            <header class="p-5 bg-slate-800 text-white flex justify-between items-center shadow-lg mb-6">
                <div>
                    <h1 class="text-2xl font-bold">"CIMCO Equipment Tracker"</h1>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="text-gray-400">"Rust Edition 🦀"</span>
                        <span class="ml-2 px-2 py-0.5 rounded text-xs font-bold bg-slate-700 text-slate-300 border border-slate-600">
                            {format!("Logged in as: {}", user.name)}
                        </span>
                    </div>
                </div>
                <div class="flex gap-4">
                    <button 
                        on:click=move |_| set_current_page.set("dashboard".to_string())
                        class=move || format!(
                            "text-base text-white px-6 py-2 rounded-lg border font-bold shadow-md transition-transform hover:scale-105 {}",
                            if current_page.get() == "dashboard" { "bg-blue-700 border-blue-600" } else { "bg-slate-700 border-slate-600" }
                        )
                    >
                        "🏠 Dashboard"
                    </button>
                    <button 
                        on:click=move |_| set_current_page.set("tasks".to_string())
                        class=move || format!(
                            "text-base text-white px-6 py-2 rounded-lg border font-bold shadow-md transition-transform hover:scale-105 {}",
                            if current_page.get() == "tasks" { "bg-emerald-700 border-emerald-600" } else { "bg-slate-700 border-slate-600" }
                        )
                    >
                        "📋 Tasks"
                    </button>
                    <button 
                        on:click=move |_| set_current_page.set("scale".to_string())
                        class=move || format!(
                            "text-base text-white px-6 py-2 rounded-lg border font-bold shadow-md transition-transform hover:scale-105 {}",
                            if current_page.get() == "scale" { "bg-purple-700 border-purple-600" } else { "bg-slate-700 border-slate-600" }
                        )
                    >
                        "⚖️ Scale"
                    </button>
                    
                    // RBAC: Only Admin sees Equipment Management
                    <Show when=move || is_admin fallback=|| ()>
                        <button 
                            on:click=move |_| set_current_page.set("equipment".to_string())
                            class=move || format!(
                                "text-base text-white px-6 py-2 rounded-lg border font-bold shadow-md transition-transform hover:scale-105 {}",
                                if current_page.get() == "equipment" { "bg-blue-700 border-blue-600" } else { "bg-slate-700 border-slate-600" }
                            )
                        >
                            "🏗️ Equipment"
                        </button>
                    </Show>

                    <button 
                        on:click=move |_| set_current_page.set("map".to_string())
                        class=move || format!(
                            "text-base text-white px-6 py-2 rounded-lg border font-bold shadow-md transition-transform hover:scale-105 {}",
                            if current_page.get() == "map" { "bg-cyan-700 border-cyan-600" } else { "bg-slate-700 border-slate-600" }
                        )
                    >
                        "🌐 Map"
                    </button>

                    <button 
                        on:click=move |_| set_current_page.set("inventory".to_string())
                        class=move || format!(
                            "text-base text-white px-6 py-2 rounded-lg border font-bold shadow-md transition-transform hover:scale-105 {}",
                            if current_page.get() == "inventory" { "bg-orange-700 border-orange-600" } else { "bg-slate-700 border-slate-600" }
                        )
                    >
                        "📦 Inventory"
                    </button>

                    <button 
                        on:click=move |_| set_current_page.set("showcase".to_string())
                        class=move || format!(
                            "text-base text-white px-6 py-2 rounded-lg border font-bold shadow-md transition-transform hover:scale-105 {}",
                            if current_page.get() == "showcase" { "bg-slate-700 border-slate-600" } else { "bg-slate-600 border-slate-500" }
                        )
                    >
                        "🛠️ Showcase"
                    </button>
                </div>
            </header>
            
            <main class="p-5">
                // Show different content based on current_page
                <Show when=move || current_page.get() == "dashboard" fallback=|| ()>
                    <crate::components::dashboard::Dashboard is_admin=is_admin />
                    <div class="grid grid-cols-1 gap-4 mb-4 mt-4">
                        <crate::components::camera::Camera />
                    </div>
                    <Show when=move || is_admin fallback=|| ()>
                        <crate::components::logs::Logs />
                    </Show>
                </Show>
                
                <Show when=move || current_page.get() == "tasks" fallback=|| ()>
                    <Tasks />
                </Show>
                
                <Show when=move || current_page.get() == "scale" fallback=|| ()>
                    <Scale />
                </Show>
                
                <Show when=move || current_page.get() == "equipment" fallback=|| ()>
                    <EquipmentList />
                </Show>
                
                <Show when=move || current_page.get() == "showcase" fallback=|| ()>
                    <Showcase />
                </Show>

                <Show when=move || current_page.get() == "map" fallback=|| ()>
                    <SystemMap />
                </Show>
                
                <Show when=move || current_page.get() == "inventory" fallback=|| ()>
                    <Inventory />
                </Show>
            </main>
        </div>
    }
}
