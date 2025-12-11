use leptos::*;
use crate::api::{get_logs, save_log, OfflineLog};

#[component]
pub fn Logs() -> impl IntoView {
    let (refresh, set_refresh) = create_signal(0);
    
    let logs = create_resource(
        move || refresh.get(),
        |_| async move { get_logs().await }
    );

    let (equip_id, set_equip_id) = create_signal(String::new());
    let (action, set_action) = create_signal(String::new());

    let on_submit = move |_| {
        spawn_local(async move {
            if !equip_id.get().is_empty() && !action.get().is_empty() {
                let _ = save_log(equip_id.get(), action.get()).await;
                set_refresh.update(|n| *n += 1);
                set_equip_id.set(String::new());
                set_action.set(String::new());
            }
        });
    };

    view! {
        <div class="p-4 bg-slate-800 rounded-lg mt-4 text-white">
            <h2 class="text-xl font-bold mb-4">"Offline Logs (SQLite)"</h2>
            
            // Input Form
            <div class="flex gap-2 mb-4">
                <input 
                    type="text" 
                    placeholder="Equipment ID" 
                    class="bg-slate-700 p-2 rounded text-white"
                    on:input=move |ev| set_equip_id.set(event_target_value(&ev))
                    prop:value=equip_id
                />
                <input 
                    type="text" 
                    placeholder="Action" 
                    class="bg-slate-700 p-2 rounded text-white"
                    on:input=move |ev| set_action.set(event_target_value(&ev))
                    prop:value=action
                />
                <button 
                    class="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 transition"
                    on:click=on_submit
                >
                    "Add Log"
                </button>
            </div>

            // List
            <div class="overflow-x-auto">
                <Suspense fallback=move || view! { <p>"Loading logs..."</p> }>
                    {move || logs.get().map(|result| match result {
                        Ok(data) => view! {
                            <table class="w-full text-left bg-slate-900 rounded">
                                <thead>
                                    <tr class="text-gray-400 border-b border-slate-700">
                                        <th class="p-2">"ID"</th>
                                        <th class="p-2">"Equipment"</th>
                                        <th class="p-2">"Action"</th>
                                        <th class="p-2">"Time"</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.into_iter().map(|log| view! {
                                        <tr class="border-b border-slate-800 hover:bg-slate-800">
                                            <td class="p-2">{log.id.unwrap_or(0)}</td>
                                            <td class="p-2 text-blue-400">{log.equipment_id}</td>
                                            <td class="p-2">{log.action}</td>
                                            <td class="p-2 text-gray-500">{log.timestamp}</td>
                                        </tr>
                                    }).collect_view()}
                                </tbody>
                            </table>
                        }.into_view(),
                        Err(_) => view! { <p>"Failed to load logs"</p> }.into_view()
                    })}
                </Suspense>
            </div>
        </div>
    }
}
