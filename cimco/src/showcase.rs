use leptos::*;
use leptos_router::*;
use web_sys::window;
use crate::api::{seed_database, reset_database, seed_production_database};
use crate::components::dashboard::StatCard;
use crate::components::camera::Camera;
use crate::components::scale::Scale;
use crate::components::roi_calculator::ROICalculator;

#[component]
pub fn Showcase() -> impl IntoView {
    view! {
        <div class="flex h-screen bg-slate-900 text-white">
            // Sidebar
            <aside class="w-64 bg-slate-800 p-4 border-r border-slate-700">
                <h2 class="text-xl font-bold mb-6 text-blue-400">"Component Showcase"</h2>
                <nav class="space-y-2">
                    <a href="#stat-card" class="block p-2 hover:bg-slate-700 rounded">"Stat Card"</a>
                    <a href="#roi" class="block p-2 hover:bg-slate-700/50 text-emerald-400 font-bold rounded">"💰 ROI Calculator"</a>
                    <a href="#camera" class="block p-2 hover:bg-slate-700 rounded">"Camera Feed"</a>
                    <a href="#scale" class="block p-2 hover:bg-slate-700 rounded">"Scale Simulator"</a>
                </nav>
                <div class="mt-10 pt-4 border-t border-slate-700">
                    <button 
                        on:click=move |_| window().unwrap().location().reload().unwrap()
                        class="text-gray-400 hover:text-white flex items-center gap-2"
                    >
                        <span>"⬅ Back to App"</span>
                    </button>
                </div>
            </aside>

            // Main Preview Area
            <main class="flex-1 p-8 overflow-y-auto">
                
                <section id="stat-card" class="mb-12">
                    <h3 class="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">"Stat Card"</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard title="Total Equipment" value="12".to_string() color="bg-blue-600" />
                        <StatCard title="Critical Alert" value="3".to_string() color="bg-red-600" />
                        <StatCard title="Online" value="98%".to_string() color="bg-green-600" />
                    </div>
                </section>

                <section id="roi" class="mb-12">
                    <h3 class="text-2xl font-bold mb-4 border-b border-gray-700 pb-2 text-emerald-400">"The Cost of Stupid"</h3>
                    <ROICalculator />
                </section>

                <section id="camera" class="mb-12">
                    <h3 class="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">"Camera Component"</h3>
                    <div class="bg-black p-4 rounded-xl border border-gray-800">
                        <Camera />
                    </div>
                </section>

                <section id="scale" class="mb-12">
                    <h3 class="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">"Scale Component"</h3>
                    <div class="bg-gray-800 p-4 rounded-xl">
                        <Scale />
                    </div>
                </section>

                <section id="demo" class="mb-12">
                    <h3 class="text-2xl font-bold mb-4 border-b border-gray-700 pb-2 text-yellow-400">"🧪 Demo Controls"</h3>
                    <div class="bg-gray-800 p-6 rounded-xl border border-yellow-500/30">
                        <p class="text-gray-400 mb-4">"Use these controls to switch between a fully populated demo state and a clean slate."</p>
                        
                        <div class="flex gap-4">
                            <button
                                class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition active:scale-95 flex items-center gap-2"
                                on:click=move |_| {
                                    spawn_local(async {
                                        if let Ok(msg) = seed_database().await {
                                            let _ = window().unwrap().alert_with_message(&msg);
                                            window().unwrap().location().reload().unwrap();
                                        }
                                    });
                                }
                            >
                                <span>"🚀 Demo Mode"</span>
                            </button>

                            <button
                                class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition active:scale-95 flex items-center gap-2"
                                on:click=move |_| {
                                    if window().unwrap().confirm_with_message("Ready for Dad's Mode? This clears fake data but keeps the real Metso parts.").unwrap_or(false) {
                                        spawn_local(async {
                                            if let Ok(msg) = seed_production_database().await {
                                                let _ = window().unwrap().alert_with_message(&msg);
                                                window().unwrap().location().reload().unwrap();
                                            }
                                        });
                                    }
                                }
                            >
                                <span>"🏭 Dad's Start Mode"</span>
                            </button>

                            <button
                                class="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition active:scale-95 flex items-center gap-2"
                                on:click=move |_| {
                                    if window().unwrap().confirm_with_message("Are you sure? This will WIPE ALL DATA.").unwrap_or(false) {
                                        spawn_local(async {
                                            if let Ok(msg) = reset_database().await {
                                                let _ = window().unwrap().alert_with_message(&msg);
                                                window().unwrap().location().reload().unwrap();
                                            }
                                        });
                                    }
                                }
                            >
                                <span>"🧹 Wipe / Reset Data"</span>
                            </button>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    }
}
