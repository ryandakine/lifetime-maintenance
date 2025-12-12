use leptos::*;
use crate::api::{get_parts, add_part, update_part_quantity, delete_part, get_incoming_orders, Part, IncomingOrder};

#[component]
pub fn Inventory() -> impl IntoView {
    let (refresh, set_refresh) = create_signal(0);
    let (show_add_form, set_show_add_form) = create_signal(false);
    let (filter_category, set_filter_category) = create_signal("All".to_string());
    let (search_query, set_search_query) = create_signal(String::new());
    
    // Fetch Parts
    let parts = create_resource(
        move || refresh.get(),
        |_| async move { get_parts().await }
    );
    
    // Fetch Incoming Orders
    let orders = create_resource(
        move || refresh.get(),
        |_| async move { get_incoming_orders().await }
    );

    // Form Signals
    let (new_name, set_new_name) = create_signal(String::new());
    let (new_category, set_new_category) = create_signal("Shredder".to_string());
    let (new_quantity, set_new_quantity) = create_signal(1_i32);
    let (new_min_qty, set_new_min_qty) = create_signal(1_i32);
    let (new_location, set_new_location) = create_signal(String::new());

    let categories: &'static [&'static str] = &["Shredder", "Hydraulics", "Electrical", "General"];

    // Handlers
    let on_add_part = move |_| {
        spawn_local(async move {
            if !new_name.get().is_empty() {
                let _ = add_part(
                    new_name.get(), 
                    new_category.get(), 
                    new_quantity.get(), 
                    new_min_qty.get(), 
                    new_location.get()
                ).await;
                set_refresh.update(|n| *n += 1);
                set_new_name.set(String::new());
                set_new_location.set(String::new());
                set_show_add_form.set(false);
            }
        });
    };

    let on_quantity_change = move |id: i32, change: i32| {
        spawn_local(async move {
            let _ = update_part_quantity(id, change).await;
            set_refresh.update(|n| *n += 1);
        });
    };

    let on_delete = move |id: i32| {
        spawn_local(async move {
            let _ = delete_part(id).await;
            set_refresh.update(|n| *n += 1);
        });
    };

    view! {
        <div class="p-6 text-white min-h-screen">
            // Header
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-3xl font-bold flex items-center gap-3">
                        <span class="text-4xl">"📦"</span>
                        "Parts Inventory"
                    </h2>
                    <p class="text-gray-400 mt-1">"Track shredder parts, hydraulics, and supplies"</p>
                </div>
                <button 
                    on:click=move |_| set_show_add_form.update(|v| *v = !*v)
                    class="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition flex items-center gap-2"
                >
                    {move || if show_add_form.get() { "✕ Cancel" } else { "➕ Add Part" }}
                </button>
            </div>

            // Stats Row
            <div class="grid grid-cols-4 gap-4 mb-6">
                <Suspense fallback=|| ()>
                    {move || parts.get().map(|result| match result {
                        Ok(data) => {
                            let total = data.len();
                            let low_stock = data.iter().filter(|p| p.quantity <= p.min_quantity).count();
                            let categories_count = data.iter().map(|p| p.category.clone()).collect::<std::collections::HashSet<_>>().len();
                            let total_value: f32 = data.iter().filter_map(|p| p.unit_cost.map(|c| c * p.quantity as f32)).sum();
                            
                            view! {
                                <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                    <div class="text-3xl font-bold text-blue-400">{total}</div>
                                    <div class="text-gray-400 text-sm">"Total Parts"</div>
                                </div>
                                <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                    <div class="text-3xl font-bold text-red-400">{low_stock}</div>
                                    <div class="text-gray-400 text-sm">"Low Stock"</div>
                                </div>
                                <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                    <div class="text-3xl font-bold text-purple-400">{categories_count}</div>
                                    <div class="text-gray-400 text-sm">"Categories"</div>
                                </div>
                                <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                    <div class="text-3xl font-bold text-emerald-400">"$"{format!("{:.0}", total_value)}</div>
                                    <div class="text-gray-400 text-sm">"Total Value"</div>
                                </div>
                            }.into_view()
                        },
                        Err(_) => view! { <div class="text-red-500">"Error"</div> }.into_view()
                    })}
                </Suspense>
            </div>

            // Add Part Form
            <Show when=move || show_add_form.get() fallback=|| ()>
                <div class="bg-slate-800 p-6 rounded-xl mb-6 border border-blue-500/50 shadow-lg">
                    <h3 class="text-xl font-bold mb-4 text-blue-400">"Add New Part"</h3>
                    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div class="col-span-2">
                            <label class="block text-xs text-gray-400 uppercase mb-1">"Part Name"</label>
                            <input type="text" 
                                class="w-full bg-slate-900 border border-slate-600 p-3 rounded-lg"
                                prop:value=new_name
                                on:input=move |ev| set_new_name.set(event_target_value(&ev))
                                placeholder="e.g., Shredder Hammer"
                            />
                        </div>
                        <div>
                            <label class="block text-xs text-gray-400 uppercase mb-1">"Category"</label>
                            <select 
                                class="w-full bg-slate-900 border border-slate-600 p-3 rounded-lg"
                                on:change=move |ev| set_new_category.set(event_target_value(&ev))
                            >
                                {categories.iter().map(|cat| view! { <option value=*cat>{*cat}</option> }).collect_view()}
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs text-gray-400 uppercase mb-1">"Quantity"</label>
                            <input type="number" 
                                class="w-full bg-slate-900 border border-slate-600 p-3 rounded-lg"
                                prop:value=new_quantity
                                on:input=move |ev| set_new_quantity.set(event_target_value(&ev).parse().unwrap_or(1))
                            />
                        </div>
                        <div>
                            <label class="block text-xs text-gray-400 uppercase mb-1">"Min Stock"</label>
                            <input type="number" 
                                class="w-full bg-slate-900 border border-slate-600 p-3 rounded-lg"
                                prop:value=new_min_qty
                                on:input=move |ev| set_new_min_qty.set(event_target_value(&ev).parse().unwrap_or(1))
                            />
                        </div>
                        <div class="col-span-2">
                            <label class="block text-xs text-gray-400 uppercase mb-1">"Location"</label>
                            <input type="text" 
                                class="w-full bg-slate-900 border border-slate-600 p-3 rounded-lg"
                                prop:value=new_location
                                on:input=move |ev| set_new_location.set(event_target_value(&ev))
                                placeholder="e.g., Bin A-1"
                            />
                        </div>
                        <div class="col-span-3 flex justify-end">
                            <button 
                                class="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold transition"
                                on:click=on_add_part
                            >
                                "Save Part"
                            </button>
                        </div>
                    </div>
                </div>
            </Show>

            // Filter Bar
            <div class="flex gap-4 mb-6">
                <input type="text" 
                    class="flex-1 bg-slate-800 border border-slate-700 p-3 rounded-lg"
                    prop:value=search_query
                    on:input=move |ev| set_search_query.set(event_target_value(&ev))
                    placeholder="🔍 Search parts..."
                />
                <select 
                    class="bg-slate-800 border border-slate-700 p-3 rounded-lg min-w-40"
                    on:change=move |ev| set_filter_category.set(event_target_value(&ev))
                >
                    <option value="All">"All Categories"</option>
                    {categories.iter().map(|cat| view! { <option value=*cat>{*cat}</option> }).collect_view()}
                </select>
            </div>

            // Incoming Orders Section
            <div class="mb-8">
                <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
                    <span class="text-2xl">"📬"</span>
                    "Incoming Orders"
                </h3>
                <Suspense fallback=|| view! { <div class="text-gray-500">"Loading orders..."</div> }>
                    {move || orders.get().map(|result| match result {
                        Ok(data) => {
                            if data.is_empty() {
                                view! { <div class="text-gray-500 bg-slate-800/50 p-4 rounded-lg">"No pending orders"</div> }.into_view()
                            } else {
                                data.into_iter().map(|order| {
                                    let status_color = match order.status.as_str() {
                                        "ordered" => "bg-blue-500/20 text-blue-300 border-blue-500/50",
                                        "shipped" => "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
                                        "delivered" => "bg-emerald-500/20 text-emerald-300 border-emerald-500/50",
                                        _ => "bg-gray-500/20 text-gray-300 border-gray-500/50"
                                    };
                                    let status_icon = match order.status.as_str() {
                                        "ordered" => "🛒",
                                        "shipped" => "📦",
                                        "delivered" => "✅",
                                        _ => "❓"
                                    };
                                    
                                    view! {
                                        <div class="bg-slate-800 p-4 rounded-lg flex items-center justify-between mb-2 border border-slate-700">
                                            <div class="flex items-center gap-4">
                                                <span class="text-2xl">{status_icon}</span>
                                                <div>
                                                    <div class="font-bold">{order.part_name.unwrap_or_default()}</div>
                                                    <div class="text-sm text-gray-400">
                                                        {order.supplier.unwrap_or_default()} " • Qty: " {order.quantity}
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-4">
                                                <code class="text-xs bg-slate-900 px-2 py-1 rounded">
                                                    {order.tracking_number.clone().unwrap_or_else(|| "N/A".to_string())}
                                                </code>
                                                <span class={format!("px-3 py-1 rounded-full text-xs font-bold uppercase border {}", status_color)}>
                                                    {order.status.clone()}
                                                </span>
                                            </div>
                                        </div>
                                    }
                                }).collect_view()
                            }
                        },
                        Err(_) => view! { <div class="text-red-500">"Error loading orders"</div> }.into_view()
                    })}
                </Suspense>
            </div>

            // Parts List
            <div class="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                <table class="w-full text-left">
                    <thead class="bg-slate-900 text-gray-400 uppercase text-xs">
                        <tr>
                            <th class="p-4">"Part Name"</th>
                            <th class="p-4">"Category"</th>
                            <th class="p-4">"Location"</th>
                            <th class="p-4 text-center">"Stock"</th>
                            <th class="p-4 text-center">"Status"</th>
                            <th class="p-4 text-right">"Actions"</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-700">
                        <Suspense fallback=|| view! { <tr><td colspan="6" class="p-4 text-center">"Loading..."</td></tr> }>
                            {move || parts.get().map(|result| match result {
                                Ok(data) => {
                                    let search = search_query.get().to_lowercase();
                                    let cat_filter = filter_category.get();
                                    
                                    data.into_iter()
                                        .filter(|p| {
                                            let matches_search = search.is_empty() || p.name.to_lowercase().contains(&search);
                                            let matches_cat = cat_filter == "All" || p.category == cat_filter;
                                            matches_search && matches_cat
                                        })
                                        .map(|item| {
                                            let is_low = item.quantity <= item.min_quantity;
                                            let row_class = if is_low { "bg-red-900/20" } else { "" };
                                            let id = item.id;
                                            
                                            view! {
                                                <tr class={format!("hover:bg-slate-750 transition {}", row_class)}>
                                                    <td class="p-4">
                                                        <div class="font-bold">{item.name.clone()}</div>
                                                        <code class="text-xs text-gray-500">{item.part_number.clone().unwrap_or_default()}</code>
                                                    </td>
                                                    <td class="p-4">
                                                        <span class="px-2 py-1 bg-slate-700 rounded text-xs uppercase">{item.category.clone()}</span>
                                                    </td>
                                                    <td class="p-4 text-gray-400">{item.location.clone().unwrap_or("-".to_string())}</td>
                                                    <td class="p-4 text-center">
                                                        <div class="flex items-center justify-center gap-2">
                                                            <button 
                                                                on:click=move |_| on_quantity_change(id, -1)
                                                                class="w-8 h-8 bg-slate-700 hover:bg-red-600 rounded transition font-bold"
                                                            >"-"</button>
                                                            <span class="text-xl font-bold min-w-12">{item.quantity}</span>
                                                            <button 
                                                                on:click=move |_| on_quantity_change(id, 1)
                                                                class="w-8 h-8 bg-slate-700 hover:bg-emerald-600 rounded transition font-bold"
                                                            >"+"</button>
                                                        </div>
                                                    </td>
                                                    <td class="p-4 text-center">
                                                        {if is_low {
                                                            view! { <span class="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs font-bold">"LOW STOCK"</span> }
                                                        } else {
                                                            view! { <span class="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded text-xs font-bold">"OK"</span> }
                                                        }}
                                                    </td>
                                                    <td class="p-4 text-right">
                                                        <button 
                                                            on:click=move |_| on_delete(id)
                                                            class="text-gray-500 hover:text-red-400 transition"
                                                            title="Delete"
                                                        >"🗑️"</button>
                                                    </td>
                                                </tr>
                                            }
                                        }).collect_view()
                                },
                                Err(_) => view! { <tr><td colspan="6" class="p-4 text-red-500">"Error loading parts"</td></tr> }.into_view()
                            })}
                        </Suspense>
                    </tbody>
                </table>
            </div>
        </div>
    }
}
