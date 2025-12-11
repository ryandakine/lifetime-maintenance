use leptos::*;
use leptos_router::A;
use crate::api::{get_tasks, add_task, toggle_task, delete_task, save_resolution, find_similar_resolutions, TaskResolution};

#[component]
pub fn Tasks() -> impl IntoView {
    let (refresh, set_refresh) = create_signal(0);
    
    // Fetch Tasks
    let tasks = create_resource(
        move || refresh.get(),
        |_| async move { get_tasks().await }
    );

    // Form Signals
    let (input_val, set_input_val) = create_signal(String::new());
    let (priority_val, set_priority_val) = create_signal(2); // Default Medium
    let (category_val, set_category_val) = create_signal("General".to_string());

    // Knowledge Loop State
    let (suggestions, set_suggestions) = create_signal(Vec::<TaskResolution>::new());
    let (show_modal, set_show_modal) = create_signal(false);
    let (modal_task_desc, set_modal_task_desc) = create_signal(String::new());
    let (modal_task_cat, set_modal_task_cat) = create_signal(String::new());
    let (solution_input, set_solution_input) = create_signal(String::new());

    let categories = vec!["General", "HVAC", "Plumbing", "Electrical", "Safety", "Hydraulics"];

    // Handlers
    let on_add = move || {
        spawn_local(async move {
            if !input_val.get().is_empty() {
                let _ = add_task(input_val.get(), priority_val.get(), category_val.get()).await;
                set_refresh.update(|n| *n += 1);
                set_input_val.set(String::new());
                set_suggestions.set(vec![]);
            }
        });
    };

    // Modified toggle to show modal for pending tasks
    let on_toggle = move |id: i32, desc: String, cat: String, is_done: bool| {
        if !is_done {
            // Task is being marked complete - prompt for solution
            set_modal_task_desc.set(desc);
            set_modal_task_cat.set(cat);
            set_show_modal.set(true);
            
            // Also toggle the task
            spawn_local(async move {
                let _ = toggle_task(id).await;
                set_refresh.update(|n| *n += 1);
            });
        } else {
            // Task is being marked incomplete - just toggle
            spawn_local(async move {
                let _ = toggle_task(id).await;
                set_refresh.update(|n| *n += 1);
            });
        }
    };

    let on_delete = move |id| {
        spawn_local(async move {
            let _ = delete_task(id).await;
            set_refresh.update(|n| *n += 1);
        });
    };

    // Quick Action Handler
    let on_quick_action = move |desc: &str, prio: i32, cat: &str| {
        let desc = desc.to_string();
        let cat = cat.to_string();
        spawn_local(async move {
            let _ = add_task(desc, prio, cat).await;
            set_refresh.update(|n| *n += 1);
        });
    };

    // Knowledge Loop: Search for suggestions when input changes
    let on_input_change = move |val: String| {
        set_input_val.set(val.clone());
        if val.len() > 3 {
            spawn_local(async move {
                if let Ok(results) = find_similar_resolutions(val).await {
                    set_suggestions.set(results);
                }
            });
        } else {
            set_suggestions.set(vec![]);
        }
    };

    // Save Resolution Handler
    let on_save_resolution = move || {
        let desc = modal_task_desc.get();
        let cat = modal_task_cat.get();
        let sol = solution_input.get();
        
        if !sol.is_empty() {
            spawn_local(async move {
                let _ = save_resolution(desc, cat, sol).await;
            });
        }
        
        set_show_modal.set(false);
        set_solution_input.set(String::new());
    };

    view! {
        <div class="p-6 text-white min-h-screen max-w-5xl mx-auto">
            // Resolution Modal
            <Show when=move || show_modal.get() fallback=|| ()>
                <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div class="bg-slate-800 p-6 rounded-xl max-w-md w-full border border-slate-600 shadow-2xl">
                        <h3 class="text-xl font-bold mb-2">"🧠 Knowledge Capture"</h3>
                        <p class="text-gray-400 text-sm mb-4">"How did you fix this? Future techs will thank you!"</p>
                        
                        <div class="bg-slate-900 p-3 rounded mb-4">
                            <span class="text-xs text-blue-400 uppercase">{move || modal_task_cat.get()}</span>
                            <p class="font-medium">{move || modal_task_desc.get()}</p>
                        </div>
                        
                        <textarea
                            class="w-full bg-slate-900 border border-slate-600 p-3 rounded-lg text-white mb-4 h-24"
                            placeholder="What steps did you take? What fixed it?"
                            prop:value=solution_input
                            on:input=move |ev| set_solution_input.set(event_target_value(&ev))
                        ></textarea>
                        
                        <div class="flex gap-3">
                            <button
                                on:click=move |_| set_show_modal.set(false)
                                class="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition"
                            >"Skip"</button>
                            <button
                                on:click=move |_| on_save_resolution()
                                class="flex-1 bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg font-bold transition"
                            >"Save to Knowledge Base"</button>
                        </div>
                    </div>
                </div>
            </Show>

             <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-3xl font-bold">"Maintenance Tasks"</h2>
                    <p class="text-gray-400">"Prioritized work orders and safety checks"</p>
                </div>
                <A href="/" class="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600 transition">"⬅ Dashboard"</A>
            </div>

            // Quick Actions / Templates
            <div class="mb-8">
                <h3 class="text-xs uppercase text-blue-400 font-bold mb-3">"⚡ Quick Actions"</h3>
                <div class="flex gap-2 flex-wrap">
                    <button on:click=move |_| on_quick_action("Inspect Safety Guards", 4, "Safety") 
                        class="bg-slate-800 border border-red-900 hover:bg-red-900/30 px-3 py-2 rounded text-sm transition flex items-center gap-2">
                        <span class="text-red-500">"🛡️"</span> "Safety Check"
                    </button>
                    <button on:click=move |_| on_quick_action("Check Hydraulic Pressure", 3, "Hydraulics") 
                        class="bg-slate-800 border border-slate-700 hover:bg-slate-700 px-3 py-2 rounded text-sm transition">
                        "💧 Hydraulics"
                    </button>
                    <button on:click=move |_| on_quick_action("Replace Filters", 2, "HVAC") 
                        class="bg-slate-800 border border-slate-700 hover:bg-slate-700 px-3 py-2 rounded text-sm transition">
                        "💨 HVAC Filter"
                    </button>
                    <button on:click=move |_| on_quick_action("Conveyor Belt Tension", 3, "General") 
                        class="bg-slate-800 border border-slate-700 hover:bg-slate-700 px-3 py-2 rounded text-sm transition">
                        "🔄 Conveyor"
                    </button>
                </div>
            </div>

            // Input Area
            <div class="bg-slate-800 p-6 rounded-xl mb-8 shadow-lg border border-slate-700">
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1 relative">
                        <input type="text" 
                            class="w-full bg-slate-900 border border-slate-600 p-3 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                            prop:value=input_val
                            on:input=move |ev| on_input_change(event_target_value(&ev))
                            on:keydown=move |ev| if ev.key() == "Enter" { on_add() }
                            placeholder="Describe new task..."
                        />
                        
                        // Knowledge Loop: Suggestions Dropdown
                        <Show when=move || !suggestions.get().is_empty() fallback=|| ()>
                            <div class="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-blue-500 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                                <div class="px-3 py-2 border-b border-slate-700 flex items-center gap-2">
                                    <span class="text-yellow-400">"💡"</span>
                                    <span class="text-xs text-gray-400 uppercase">"Previous Fixes Found"</span>
                                </div>
                                {move || suggestions.get().into_iter().map(|s| {
                                    view! {
                                        <div class="px-3 py-2 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50">
                                            <div class="text-sm text-gray-300">{s.original_description}</div>
                                            <div class="text-xs text-emerald-400 mt-1">"✅ " {s.solution_steps}</div>
                                        </div>
                                    }
                                }).collect_view()}
                            </div>
                        </Show>
                    </div>
                    
                    // Priority Select
                    <select 
                        class="bg-slate-900 border border-slate-600 p-3 rounded-lg"
                        on:change=move |ev| set_priority_val.set(event_target_value(&ev).parse().unwrap_or(2))
                        prop:value=priority_val
                    >
                        <option value="1">"Low Priority"</option>
                        <option value="2">"Medium"</option>
                        <option value="3">"High"</option>
                        <option value="4">"CRITICAL"</option>
                    </select>

                    // Category Select
                    <select 
                        class="bg-slate-900 border border-slate-600 p-3 rounded-lg"
                        on:change=move |ev| set_category_val.set(event_target_value(&ev))
                        prop:value=category_val
                    >
                        {categories.into_iter().map(|cat| view! { <option value=cat>{cat}</option> }).collect_view()}
                    </select>

                    <button 
                        class="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-bold transition flex items-center justify-center"
                        on:click=move |_| on_add()
                    >
                        "Add Task"
                    </button>
                </div>
            </div>

            // Task List
            <div class="space-y-3">
                <Suspense fallback=move || view! { <div class="text-center text-gray-500">"Loading tasks..."</div> }>
                    {move || tasks.get().map(|result| match result {
                        Ok(data) => {
                            if data.is_empty() {
                                view! { 
                                    <div class="text-center p-10 text-gray-500 bg-slate-800/50 rounded-lg border border-dashed border-slate-700">
                                        "No tasks pending. Grab a coffee! ☕"
                                    </div> 
                                }.into_view()
                            } else {
                                data.into_iter().map(|item| {
                                    let prio_color = match item.priority {
                                        4 => "border-l-4 border-red-500 bg-red-900/10",
                                        3 => "border-l-4 border-orange-500 bg-orange-900/10",
                                        2 => "border-l-4 border-blue-500",
                                        _ => "border-l-4 border-gray-500"
                                    };
                                    let prio_text = match item.priority {
                                        4 => view! { <span class="bg-red-500/20 text-red-300 text-[10px] px-2 py-0.5 rounded uppercase font-bold">"Critical"</span> },
                                        3 => view! { <span class="bg-orange-500/20 text-orange-300 text-[10px] px-2 py-0.5 rounded uppercase font-bold">"High"</span> },
                                        _ => view! { <span></span> }
                                    };
                                    let is_done = item.status == "complete";
                                    let opacity = if is_done { "opacity-50" } else { "" };
                                    let strike = if is_done { "line-through text-gray-500" } else { "" };
                                    
                                    let item_id = item.id;
                                    let item_id_del = item.id;
                                    let item_desc = item.description.clone();
                                    let item_cat = item.category.clone();

                                    view! {
                                        <div class={format!("bg-slate-800 p-4 rounded-lg shadow flex items-center justify-between group transition hover:bg-slate-750 {} {}", prio_color, opacity)}>
                                            <div class="flex items-center gap-4 flex-1">
                                                <button 
                                                    on:click=move |_| on_toggle(item_id, item_desc.clone(), item_cat.clone(), is_done)
                                                    class={format!("w-6 h-6 rounded border flex items-center justify-center transition {}", if is_done { "bg-green-600 border-green-600" } else { "border-gray-500 hover:border-blue-400" })}
                                                >
                                                    {if is_done { "✓" } else { "" }}
                                                </button>
                                                
                                                <div class="flex-1">
                                                    <div class="flex items-center gap-2 mb-1">
                                                        <span class="bg-slate-700 text-gray-300 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                                                            {item.category.clone()}
                                                        </span>
                                                        {prio_text}
                                                    </div>
                                                    <div class={format!("font-medium {}", strike)}>
                                                        {item.description}
                                                    </div>
                                                </div>
                                            </div>

                                            <button 
                                                on:click=move |_| on_delete(item_id_del)
                                                class="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition px-2"
                                                title="Delete Task"
                                            >
                                                "🗑️"
                                            </button>
                                        </div>
                                    }
                                }).collect_view()
                            }
                        },
                        Err(_) => view! { <div class="text-red-500">"Error loading tasks"</div> }.into_view()
                    })}
                </Suspense>
            </div>
        </div>
    }
}
