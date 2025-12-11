use leptos::*;
use leptos_router::*;
use std::time::Duration;
use crate::showcase::Showcase;
use crate::components::equipment_list::EquipmentList;
use crate::components::tasks::Tasks;
use crate::components::scale::Scale;
use crate::components::login::{Login, User, UserRole};

#[component]
pub fn App() -> impl IntoView {
    // Splash Screen State
    let (show_splash, set_show_splash) = create_signal(true);
    
    // Hide splash after 2.5 seconds
    set_timeout(
        move || set_show_splash.set(false),
        Duration::from_millis(2500),
    );
    
    // Global User State
    let (user, set_user) = create_signal(None::<User>);

    // Callback for login
    let on_login = create_action(move |u: &User| {
        let u = u.clone();
        async move {
            set_user.set(Some(u));
        }
    });

    view! {
        <div class="min-h-screen bg-slate-900 text-white font-sans">
            // Splash Screen
            <Show when=move || show_splash.get() fallback=|| ()>
                <div class="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-50">
                    <img src="public/cimco-logo-official.png" alt="CIMCO" class="w-64 h-auto mb-10 drop-shadow-2xl animate-fade-in" />
                    
                    <div class="flex justify-center items-end h-24 mb-6 perspective-500 relative">
                        // C - Tilted left, base
                        <span class="text-7xl font-black text-slate-300 animate-drop delay-100 inline-block drop-shadow-xl absolute left-[calc(50%-80px)] bottom-0 rotate-[-15deg]">"C"</span>
                        
                        // I - Tilted right, overlapping
                        <span class="text-7xl font-black text-slate-400 animate-drop delay-200 inline-block drop-shadow-xl absolute left-[calc(50%-40px)] bottom-2 z-10 rotate-[10deg]">"I"</span>
                        
                        // M - Heavy center piece, flat but slightly crooked
                        <span class="text-8xl font-black text-slate-200 animate-drop delay-300 inline-block drop-shadow-xl absolute left-[calc(50%-10px)] bottom-0 z-20 rotate-[-5deg]">"M"</span>
                        
                        // C - Tilted way right, piled on side
                        <span class="text-7xl font-black text-slate-300 animate-drop delay-400 inline-block drop-shadow-xl absolute left-[calc(50%+50px)] bottom-1 z-10 rotate-[25deg]">"C"</span>
                        
                        // O - Rolled away slightly
                        <span class="text-7xl font-black text-slate-400 animate-drop delay-500 inline-block drop-shadow-xl absolute left-[calc(50%+90px)] bottom-0 rotate-[12deg]">"O"</span>
                    </div>
                    
                    <div class="mt-12">
                         <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
            </Show>
            
            // Main App (after splash)
            <Show when=move || !show_splash.get() fallback=|| ()>
                <Show
                    when=move || user.get().is_some()
                    fallback=move || view! { <Login on_login=on_login /> }
                >
                    <Router>
                        <Routes>
                            <Route path="/" view=move || view! { <MainApp user=user.get().unwrap() /> } />
                            <Route path="/showcase" view=Showcase />
                            <Route path="/equipment" view=EquipmentList />
                            <Route path="/tasks" view=Tasks />
                            <Route path="/scale" view=Scale />
                        </Routes>
                    </Router>
                </Show>
            </Show>
        </div>
    }
}

#[component]
fn MainApp(user: User) -> impl IntoView {
    let is_admin = user.role == UserRole::Admin;
    
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
                        <span class="px-2 py-0.5 rounded text-xs font-bold bg-slate-700 text-slate-300 border border-slate-600">
                            {format!("Logged in as: {}", user.name)}
                        </span>
                    </div>
                </div>
                <div class="flex gap-4">
                    <A href="/tasks" class="text-base text-white bg-emerald-700 px-6 py-2 rounded-lg hover:bg-emerald-600 border border-emerald-600 font-bold shadow-md transition-transform hover:scale-105 flex items-center gap-2">
                        "📋 Tasks"
                    </A>
                    <A href="/scale" class="text-base text-white bg-purple-700 px-6 py-2 rounded-lg hover:bg-purple-600 border border-purple-600 font-bold shadow-md transition-transform hover:scale-105 flex items-center gap-2">
                         "⚖️ Scale"
                    </A>
                    
                    // RBAC: Only Admin sees Equipment Management
                    <Show when=move || is_admin fallback=|| ()>
                        <A href="/equipment" class="text-base text-white bg-blue-700 px-6 py-2 rounded-lg hover:bg-blue-600 border border-blue-600 font-bold shadow-md transition-transform hover:scale-105">
                            "🏗️ Manage Equipment"
                        </A>
                    </Show>

                    <A href="/showcase" class="text-base text-white bg-slate-700 px-6 py-2 rounded-lg hover:bg-slate-600 border border-slate-600 font-bold shadow-md transition-transform hover:scale-105">
                        "🛠️ Showcase"
                    </A>
                </div>
            </header>
            <main class="p-5">
                <crate::components::dashboard::Dashboard is_admin=is_admin />
                
                <div class="grid grid-cols-1 gap-4 mb-4">
                     <crate::components::camera::Camera />
                </div>
                
                // RBAC: Only Admin sees Logs
                <Show when=move || is_admin fallback=|| ()>
                    <crate::components::logs::Logs />
                </Show>
            </main>
        </div>
    }
}
