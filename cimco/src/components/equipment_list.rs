use leptos::*;
use leptos_router::A;
use crate::api::{get_equipment_list, add_equipment, delete_equipment, update_status, Equipment};

#[component]
pub fn EquipmentList() -> impl IntoView {
    let (refresh, set_refresh) = create_signal(0);
    
    // Fetch List
    let equipment = create_resource(
        move || refresh.get(),
        |_| async move { get_equipment_list().await }
    );

    // Form Signals
    let (new_name, set_new_name) = create_signal(String::new());
    let (new_status, set_new_status) = create_signal("active".to_string());
    let (new_health, set_new_health) = create_signal("100".to_string());

    // Handlers
    let on_add = move |_| {
        spawn_local(async move {
            let health_val = new_health.get().parse::<f32>().unwrap_or(100.0);
            if !new_name.get().is_empty() {
                let _ = add_equipment(new_name.get(), new_status.get(), health_val).await;
                set_refresh.update(|n| *n += 1);
                set_new_name.set(String::new());
            }
        });
    };

    let on_delete = move |id| {
        spawn_local(async move {
            let _ = delete_equipment(id).await;
            set_refresh.update(|n| *n += 1);
        });
    };

    let on_status_change = move |id, status| {
        spawn_local(async move {
            let _ = update_status(id, status).await;
            set_refresh.update(|n| *n += 1);
        });
    };

    view! {
        <div class="p-6 text-white min-h-screen">
             <div class="flex justify-between items-center mb-6">
                <h2 class="text-3xl font-bold">"Equipment Management"</h2>
                <A href="/" class="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600 transition">"⬅ Dashboard"</A>
            </div>

            // Add New Form
            <div class="bg-slate-800 p-4 rounded-lg mb-8 shadow-lg">
                <h3 class="text-xl font-bold mb-4 text-blue-400">"Add New Machine"</h3>
                <div class="flex gap-4 items-end flex-wrap">
                    <div class="flex flex-col gap-1">
                        <label class="text-xs uppercase text-gray-400">"Name"</label>
                        <input type="text" 
                            class="bg-slate-900 border border-slate-700 p-2 rounded w-64"
                            prop:value=new_name
                            on:input=move |ev| set_new_name.set(event_target_value(&ev)) 
                            placeholder="e.g. Robot Arm 4"
                        />
                    </div>
                     <div class="flex flex-col gap-1">
                        <label class="text-xs uppercase text-gray-400">"Status"</label>
                        <select 
                            class="bg-slate-900 border border-slate-700 p-2 rounded w-40"
                            on:change=move |ev| set_new_status.set(event_target_value(&ev))
                            prop:value=new_status
                        >
                            <option value="active">"Active"</option>
                            <option value="maintenance">"Maintenance"</option>
                            <option value="down">"Down"</option>
                        </select>
                    </div>
                    <div class="flex flex-col gap-1">
                         <label class="text-xs uppercase text-gray-400">"Health %"</label>
                         <input type="number" 
                            class="bg-slate-900 border border-slate-700 p-2 rounded w-24"
                            prop:value=new_health
                            on:input=move |ev| set_new_health.set(event_target_value(&ev)) 
                        />
                    </div>
                    <button 
                        class="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded font-bold transition"
                        on:click=on_add
                    >
                        "Add Machine"
                    </button>
                </div>
            </div>

            // Table
            <div class="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                <table class="w-full text-left">
                    <thead class="bg-slate-900 text-gray-400 uppercase text-xs">
                        <tr>
                            <th class="p-4">"ID"</th>
                            <th class="p-4">"Name"</th>
                            <th class="p-4">"Status"</th>
                            <th class="p-4">"Health"</th>
                            <th class="p-4 text-right">"Actions"</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-700">
                        <Suspense fallback=move || view! { <tr><td colspan="5" class="p-4">"Loading..."</td></tr> }>
                            {move || equipment.get().map(|result| match result {
                                Ok(data) => data.into_iter().map(|item| {
                                    let status_color = match item.status.as_str() {
                                        "active" => "text-green-400",
                                        "maintenance" => "text-yellow-400",
                                        "down" => "text-red-400",
                                        _ => "text-gray-400"
                                    };
                                    let id = item.id; // Copy for closures
                                    
                                    view! {
                                        <tr class="hover:bg-slate-750 transition">
                                            <td class="p-4 text-gray-500">{"#"}{item.id}</td>
                                            <td class="p-4 font-bold">{item.name}</td>
                                            <td class={format!("p-4 uppercase text-xs font-bold {}", status_color)}>
                                                {item.status.clone()}
                                            </td>
                                            <td class="p-4">
                                                <div class="w-24 bg-slate-900 rounded-full h-2 overflow-hidden">
                                                    <div class={format!("h-full bg-blue-500 w-[{}%]", item.health_score)}></div>
                                                </div>
                                                <span class="text-xs text-gray-400 ml-1">{item.health_score}{"%"}</span>
                                            </td>
                                            <td class="p-4 flex justify-end gap-2">
                                                // Quick Status Actions
                                                <button on:click=move |_| on_status_change(id, "active".to_string()) title="Mark Active" class="p-1 hover:text-green-400">"✅"</button>
                                                <button on:click=move |_| on_status_change(id, "maintenance".to_string()) title="Mark Maintenance" class="p-1 hover:text-yellow-400">"🔧"</button>
                                                <button on:click=move |_| on_status_change(id, "down".to_string()) title="Mark Down" class="p-1 hover:text-red-400">"🛑"</button>
                                                
                                                <span class="border-l border-slate-600 mx-2"></span>
                                                
                                                <button 
                                                    class="text-red-500 hover:text-red-300 font-bold text-xs uppercase"
                                                    on:click=move |_| on_delete(id)
                                                >
                                                    "Delete"
                                                </button>
                                            </td>
                                        </tr>
                                    }
                                }).collect_view(),
                                Err(_) => view! { <tr><td colspan="5" class="p-4 text-red-500">"Error loading data"</td></tr> }.into_view()
                            })}
                        </Suspense>
                    </tbody>
                </table>
            </div>
        </div>
    }
}
