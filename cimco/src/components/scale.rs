use leptos::*;
use leptos_dom::helpers::IntervalHandle;
use std::time::Duration;
use crate::api::{read_scale, ScaleData};

#[component]
pub fn Scale() -> impl IntoView {
    let (weight, set_weight) = create_signal(ScaleData { 
        weight: 0, 
        unit: "lbs".to_string(), 
        status: "CONNECTING".to_string() 
    });

    // Poll scale every 200ms
    create_effect(move |_| {
        let handle = set_interval_with_handle(
            move || {
                spawn_local(async move {
                    if let Ok(data) = read_scale().await {
                        set_weight.set(data);
                    }
                });
            },
            Duration::from_millis(200),
        ).ok();
        
        // Cleanup interval on drop
        on_cleanup(move || {
            if let Some(h) = handle {
                h.clear();
            }
        });
    });

    view! {
        <div class="min-h-screen bg-slate-900 text-white p-8">
            // Header
            <div class="flex justify-between items-center mb-12">
                <div>
                    <h1 class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        "⚖️ Truck Scale Station"
                    </h1>
                    <p class="text-slate-400 mt-2">"Live weight reading from RS-232 Interface"</p>
                </div>
                <leptos_router::A href="/" class="px-6 py-3 bg-slate-800 rounded-lg hover:bg-slate-700 border border-slate-700 transition flex items-center gap-2">
                    "⬅ Back to Dashboard"
                </leptos_router::A>
            </div>

            // Main Weight Display
            <div class="max-w-4xl mx-auto">
                <div class="bg-black rounded-3xl p-12 border-8 border-slate-700 shadow-2xl relative overflow-hidden group">
                    // Glossy reflection effect
                    <div class="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                    
                    <div class="flex flex-col items-center justify-center space-y-4 relative z-10 scale-100 group-hover:scale-105 transition-transform duration-500">
                         <div class="text-slate-500 font-mono text-xl uppercase tracking-[0.5em] mb-4">"Gross Weight"</div>
                         
                         <div class="flex items-baseline gap-4">
                            <span class="text-[120px] leading-none font-mono font-bold tracking-tighter text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                                {move || weight.get().weight}
                            </span>
                            <span class="text-4xl font-bold text-slate-400">{move || weight.get().unit}</span>
                         </div>

                         // Status Indicator
                         <div class={move || {
                            let status = weight.get().status;
                            let base_cls = "px-6 py-2 rounded-full font-bold text-lg tracking-widest mt-8 border-2";
                            if status == "STABLE" { 
                                format!("{} bg-emerald-900/30 text-emerald-400 border-emerald-500/50", base_cls)
                            } else { 
                                format!("{} bg-yellow-900/30 text-yellow-400 border-yellow-500/50 animate-pulse", base_cls) 
                            }
                         }}>
                            {move || weight.get().status}
                         </div>
                    </div>
                </div>

                // Instructions
                <div class="grid grid-cols-2 gap-6 mt-8">
                    <div class="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <h3 class="text-blue-400 font-bold mb-2">"📋 Operating Procedure"</h3>
                        <ul class="text-sm text-slate-300 space-y-2 list-disc pl-4">
                            <li>"Ensure vehicle is fully on the platform."</li>
                            <li>"Turn off engine for accurate reading."</li>
                            <li>"Wait for 'STABLE' indicator."</li>
                        </ul>
                    </div>
                     <div class="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <h3 class="text-purple-400 font-bold mb-2">"📊 Recent Calibrations"</h3>
                        <div class="flex justify-between text-sm text-slate-400 border-b border-slate-700 pb-2 mb-2">
                            <span>"Last Zero:"</span>
                            <span class="text-white">"Today, 06:00 AM"</span>
                        </div>
                        <div class="flex justify-between text-sm text-slate-400">
                            <span>"Certified:"</span>
                            <span class="text-green-400">"Pass"</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}
