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
        <div class="p-4 bg-slate-800 rounded-lg mt-4 text-white">
            <h2 class="text-xl font-bold mb-4">"Truck Scale (RS-232)"</h2>
            <div class="flex items-center justify-between bg-black p-6 rounded-lg text-green-500 font-mono border-4 border-slate-600">
                <div class="text-6xl font-bold">
                    {move || weight.get().weight}
                </div>
                <div class="text-right">
                    <div class="text-2xl">{move || weight.get().unit}</div>
                    <div class={move || {
                        let status = weight.get().status;
                        if status == "STABLE" { "text-green-500 font-bold" } else { "text-yellow-500 animate-pulse" }
                    }}>
                        {move || weight.get().status}
                    </div>
                </div>
            </div>
        </div>
    }
}
