use leptos::*;
use crate::api::{get_parts, Part};
use std::collections::{HashMap, HashSet};

#[derive(Clone, Debug)]
struct SystemNode {
    name: String,
    total_parts: i32,
    critical_parts: i32,
    sub_nodes: Vec<SystemNode>,
}

#[component]
pub fn SystemMap() -> impl IntoView {
    let parts_resource = create_resource(|| (), |_| async move { get_parts().await });

    // Processing Logic
    let system_data = move || {
        parts_resource.get().map(|res| {
            match res {
                Ok(parts) => {
                    // 1. Group by Main Category (e.g. "A545 BOM", "C617 BOM", "Shredder")
                    let mut systems: HashMap<String, Vec<Part>> = HashMap::new();
                    
                    for part in parts {
                        // Split "A545 BOM - Conveyor 1" -> Main: "A545 BOM", Sub: "Conveyor 1"
                        let cat = part.category.clone();
                        let main_sys = if cat.contains(" - ") {
                            cat.split(" - ").next().unwrap_or("Other").to_string()
                        } else {
                            if cat.contains("Shredder") { "Lindemann Shredder".to_string() } else { "Other".to_string() }
                        };
                        
                        systems.entry(main_sys).or_default().push(part);
                    }
                    
                    // 2. Build Tree
                    let mut nodes = Vec::new();
                    for (sys_name, sys_parts) in systems {
                        let mut sub_systems: HashMap<String, (i32, i32)> = HashMap::new();
                        let mut sys_total = 0;
                        let mut sys_crit = 0;

                        for p in &sys_parts {
                            let is_crit = p.quantity <= p.min_quantity;
                            sys_total += 1;
                            if is_crit { sys_crit += 1; }

                            // Sub system grouping
                            let sub_name = if p.category.contains(" - ") {
                                p.category.split(" - ").nth(1).unwrap_or("General").to_string()
                            } else {
                                "General".to_string()
                            };
                            
                            let entry = sub_systems.entry(sub_name).or_insert((0, 0));
                            entry.0 += 1;
                            if is_crit { entry.1 += 1; }
                        }
                        
                        let mut sub_nodes = Vec::new();
                        for (sub_name, (total, crit)) in sub_systems {
                            sub_nodes.push(SystemNode {
                                name: sub_name,
                                total_parts: total,
                                critical_parts: crit,
                                sub_nodes: vec![]
                            });
                        }
                        // Sort sub-nodes naturally (try to)
                        sub_nodes.sort_by(|a, b| a.name.cmp(&b.name));

                        nodes.push(SystemNode {
                            name: sys_name,
                            total_parts: sys_total,
                            critical_parts: sys_crit,
                            sub_nodes
                        });
                    }
                    nodes.sort_by(|a, b| a.name.cmp(&b.name));
                    nodes
                },
                Err(_) => vec![]
            }
        })
    };

    view! {
        <div class="p-6 text-white min-h-screen">
            <h2 class="text-3xl font-bold mb-6 flex items-center gap-2">
                <span class="text-blue-400">"🌐"</span> "Plant Health Map"
            </h2>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Suspense fallback=|| view! { "Loading System Map..." }>
                    {move || system_data().map(|nodes| {
                        nodes.into_iter().map(|node| {
                            let health_color = if node.critical_parts > 0 { "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]" } else { "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]" };
                            let title_color = if node.critical_parts > 0 { "text-red-400" } else { "text-emerald-400" };
                            
                            view! {
                                <div class={format!("bg-slate-800 rounded-xl p-6 border-l-4 {}", health_color)}>
                                    <div class="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 class={format!("text-2xl font-bold {}", title_color)}>{node.name}</h3>
                                            <p class="text-gray-400 text-sm">{node.total_parts} " tracked components"</p>
                                        </div>
                                        <div class="text-right">
                                            <div class="text-4xl font-bold">{
                                                if node.critical_parts > 0 { 
                                                    view! { <span class="text-red-500">"⚠️ "{node.critical_parts}</span> } 
                                                } else { 
                                                    view! { <span class="text-emerald-500">"✅ 100%"</span> } 
                                                }
                                            }</div>
                                            <div class="text-xs text-gray-500 uppercase">"Critical Items"</div>
                                        </div>
                                    </div>
                                    
                                    // Visualization of Sub-Systems (Blocks)
                                    <div class="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-4">
                                        {node.sub_nodes.into_iter().map(|sub| {
                                            let bg = if sub.critical_parts > 0 { "bg-red-500 hover:bg-red-400" } else { "bg-emerald-600 hover:bg-emerald-500" };
                                            view! {
                                                <div class={format!("aspect-square rounded-lg {} p-2 flex flex-col items-center justify-center cursor-pointer transition transform hover:scale-105", bg)}
                                                     title={format!("{} ({} Critical)", sub.name, sub.critical_parts)}>
                                                    <span class="text-xs font-bold text-center break-words leading-tight">{
                                                        // Shorten name for box overlap
                                                        sub.name.replace("Conveyor ", "C-").replace("STOCKPILE", "STK").replace("Bill of Materials", "BOM")
                                                    }</span>
                                                    {if sub.critical_parts > 0 {
                                                        view! { <span class="mt-1 text-[10px] bg-black/40 px-1 rounded text-white fa-blink">"!"</span> }.into_view()
                                                    } else {
                                                        view! { }.into_view()
                                                    }}
                                                </div>
                                            }
                                        }).collect_view()}
                                    </div>
                                    
                                    <div class="mt-4 pt-4 border-t border-slate-700">
                                         <p class="text-xs text-gray-500">"Click any block to inspect details."</p>
                                    </div>
                                </div>
                            }
                        }).collect_view()
                    })}
                </Suspense>
            </div>
        </div>
    }
}
