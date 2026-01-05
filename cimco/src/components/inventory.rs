use leptos::*;
use crate::api::{get_parts_paginated, add_part, update_part_quantity, update_part_location, delete_part, get_incoming_orders, receive_order, export_inventory_csv};
use crate::components::voice_input::VoiceInput;

#[component]
pub fn Inventory() -> impl IntoView {
    let (refresh, set_refresh) = create_signal(0);
    let (show_add_form, set_show_add_form) = create_signal(false);
    let (filter_category, set_filter_category) = create_signal("All".to_string());
    let (search_query, set_search_query) = create_signal(String::new());
    let (sort_by, set_sort_by) = create_signal("stock".to_string());
    let (sort_desc, set_sort_desc) = create_signal(false); // false = ascending (low stock first)

    // Pagination state
    let (current_page, set_current_page) = create_signal(1_i32);
    let (page_size, _set_page_size) = create_signal(50_i32); // 50 items per page

    // Reset to page 1 when search or filter changes
    create_effect(move |_| {
        search_query.track();
        filter_category.track();
        set_current_page.set(1);
    });

    // Fetch Parts with Pagination
    let parts = create_resource(
        move || (refresh.get(), current_page.get(), page_size.get(), filter_category.get(), search_query.get()),
        |(_, page, size, cat_filter, search)| async move {
            let category = if cat_filter == "All" { None } else { Some(cat_filter) };
            let query = if search.is_empty() { None } else { Some(search) };
            get_parts_paginated(page, size, category, query).await
        }
    );
    
    // Fetch Incoming Orders
    let orders = create_resource(
        move || refresh.get(),
        |_| async move { get_incoming_orders().await }
    );

    // Form Signals
    let (new_name, set_new_name) = create_signal(String::new());
    let (new_category, set_new_category) = create_signal("Shredder".to_string());
    let (new_part_type, set_new_part_type) = create_signal("Wear Part".to_string());
    let (new_manufacturer, set_new_manufacturer) = create_signal("Metzo".to_string());
    let (new_part_number, set_new_part_number) = create_signal(String::new());
    let (new_quantity, set_new_quantity) = create_signal(1_i32);
    let (new_min_quantity, set_new_min_quantity) = create_signal(1);
    let (new_lead_time, set_new_lead_time) = create_signal(7);
    let (new_location, set_new_location) = create_signal(String::new());

    let categories = ["Shredder", "Hydraulics", "Electrical", "General"];
    let part_types = ["Upper", "Lower", "Wear Part", "Hammer", "Spider Cap", "Pump", "Valve", "Bearing", "Other"];
    let manufacturers = ["Lindemann", "SSI", "Generic", "SKF", "Timken", "Metso", "Other"];

    // Handlers
    let on_add_part = move |_: web_sys::MouseEvent| {
        spawn_local(async move {
            if !new_name.get().is_empty() {
                let pn = new_part_number.get_untracked();
                let pn_opt = if pn.is_empty() { None } else { Some(pn) };
                
                let _ = add_part(
                    new_name.get(), 
                    new_category.get(), 
                    Some(new_part_type.get()),
                    Some(new_manufacturer.get()),
                    pn_opt,
                    new_quantity.get_untracked(), 
                    new_min_quantity.get_untracked(), 
                    new_lead_time.get_untracked(),
                    new_location.get_untracked(),
                ).await;
                set_refresh.update(|n| *n += 1);
                // Reset basic fields
                set_new_name.set(String::new());
                set_new_part_number.set(String::new());
                set_new_location.set(String::new());
                set_show_add_form.set(false);
            }
        });
    };

    // Use create_action for quantity updates - more reliable in Leptos
    let quantity_action = create_action(move |input: &(i32, i32)| {
        let (id, change) = *input;
        async move {
            leptos::logging::log!("Action dispatched: id={}, change={}", id, change);
            update_part_quantity(id, change).await
        }
    });

    let location_action = create_action(move |input: &(i32, String)| {
        let (id, location) = input.clone();
        async move {
            leptos::logging::log!("Updating location: id={}, loc={}", id, location);
            update_part_location(id, location).await
        }
    });

    let export_action = create_action(move |_| async move {
        if let Ok(csv) = export_inventory_csv().await {
            // SECURITY FIX: Use data URI approach instead of eval()
            // This prevents XSS attacks via CSV injection
            
            use wasm_bindgen::JsCast;
            use web_sys::HtmlAnchorElement;

            if let Some(window) = web_sys::window() {
                if let Some(document) = window.document() {
                    // Encode CSV data as base64 for data URI
                    let encoded = js_sys::encode_uri_component(&csv);
                    let data_uri = format!("data:text/csv;charset=utf-8,{}", encoded.as_string().unwrap_or_default());
                    
                    // Create download link
                    if let Ok(el) = document.create_element("a") {
                        if let Ok(link) = el.dyn_into::<HtmlAnchorElement>() {
                            link.set_href(&data_uri);
                            link.set_download("cimco_inventory.csv");

                            if let Some(body) = document.body() {
                                let _ = body.append_child(&link);
                                link.click();
                                let _ = body.remove_child(&link);
                            }
                        }
                    }
                }
            }
        }
    });
    
    // Store it so it's Copy-able in closures
    let stored_action = store_value(quantity_action);
    let stored_loc_action = store_value(location_action);
    
    // When action completes, refresh the list
    create_effect(move |_| {
        if stored_action.get_value().value().get().is_some() || stored_loc_action.get_value().value().get().is_some() {
            set_refresh.update(|n| *n += 1);
        }
    });

    let _on_quantity_change = move |id: i32, change: i32| {
        leptos::logging::log!("Button clicked! Dispatching action...");
        stored_action.get_value().dispatch((id, change));
    };

    let _on_delete = move |id: i32| {
        spawn_local(async move {
            match delete_part(id).await {
                Ok(_) => {
                    leptos::logging::log!("Part {} deleted", id);
                    set_refresh.update(|n| *n += 1);
                }
                Err(e) => {
                    leptos::logging::log!("Error deleting part: {}", e);
                }
            }
        });
    };

    let on_receive = move |id| {
        spawn_local(async move {
            let _ = receive_order(id).await;
            set_refresh.update(|n| *n += 1);
        });
    };

    // Voice command handler
    let on_voice_command = Callback::new(move |(part_id, qty_change): (i32, i32)| {
        spawn_local(async move {
            let _ = update_part_quantity(part_id, qty_change).await;
            set_refresh.update(|n| *n += 1);
        });
    });

    // Signal for parts list to pass to VoiceInput (extract items from paginated result)
    let parts_signal = create_memo(move |_| {
        parts.get()
            .and_then(|r| r.ok())
            .map(|paginated| paginated.items)
            .unwrap_or_default()
    });

    view! {
        <div class="p-6 text-white min-h-screen">
            // Header
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-3xl font-bold flex items-center gap-3">
                        <span class="text-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        </span>
                        "Cimco Inventory"
                    </h2>
                    <p class="text-gray-400 mt-1">"Track Metso/Lindemann parts • Powered by On-Site Intelligence LLC"</p>
                </div>
                <button 
                    on:click=move |_| set_show_add_form.update(|v| *v = !*v)
                    class="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition flex items-center gap-2"
                >
                    {move || if show_add_form.get() { "✕ Cancel" } else { "➕ Add Part" }}
                </button>
            </div>

            // Omni-Search & Command Bar (Replaces old text boxes)
            <div class="mb-8">
                <VoiceInput 
                    on_voice_update=on_voice_command
                    on_search_update=Callback::new(move |query: String| set_search_query.set(query))
                    parts=parts_signal.into()
                />
            </div>

            // Category Filter (moved from old filter bar)
            <div class="flex justify-end mb-4">
                <select 
                    class="bg-slate-800 border border-slate-700 p-2 rounded-lg text-sm text-gray-400 focus:text-white focus:border-cyan-500 outline-none transition"
                    on:change=move |ev| set_filter_category.set(event_target_value(&ev))
                >
                    <option value="All">"Filter: All Categories"</option>
                    <option value="High Wear Parts" class="text-yellow-400 font-bold">"⚠️ Filter: High Wear Parts"</option>
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
                                                {
                                                    let status = order.status.clone();
                                                    let id = order.id;
                                                    if status == "delivered" {
                                                        view! { <span class="px-3 py-1 rounded-full text-xs font-bold uppercase border bg-emerald-500/20 text-emerald-300 border-emerald-500/50">"DELIVERED"</span> }.into_view()
                                                    } else {
                                                        view! { 
                                                            <button 
                                                                on:click=move |_| on_receive(id)
                                                                class={format!("px-3 py-1 rounded-full text-xs font-bold uppercase border cursor-pointer hover:scale-110 active:scale-95 transition shadow-lg hover:shadow-cyan-500/50 {}", status_color)}
                                                                title="Click to Receive Part"
                                                            >
                                                                {status}
                                                            </button> 
                                                        }.into_view()
                                                    }
                                                }
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

            // Parts List Section Header
            <div class="flex items-center justify-between mb-4 mt-8">
                <h3 class="text-xl font-bold flex items-center gap-2">
                    <span class="text-2xl">"📋"</span>
                    "Parts Inventory"
                </h3>
                <div class="flex items-center gap-4">
                    <button
                        on:click=move |_| export_action.dispatch(())
                        class="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-cyan-400 font-bold transition shadow-sm hover:shadow-cyan-900/20"
                        title="Download CSV Report"
                    >
                        "⬇️ Export Data"
                    </button>
                    <div class="flex items-center gap-2 text-xs text-gray-500 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
                        <span class="text-cyan-400">"🔮"</span>
                        <span>"Predictive Maintenance: Coming Soon"</span>
                    </div>
                </div>
            </div>

            // Parts List
            <div class="bg-slate-900/50 backdrop-blur rounded-xl overflow-hidden border border-slate-700 shadow-2xl relative">
                <div class="absolute inset-0 bg-grid-slate-800/[0.05] pointer-events-none"></div>
                <div class="max-h-[600px] overflow-y-auto custom-scrollbar">
                    <table class="w-full text-left text-sm relative z-0">
                        <thead class="bg-slate-950/90 text-xs uppercase font-bold text-slate-400 tracking-wider sticky top-0 z-10 backdrop-blur-md shadow-sm">
                            <tr>
                                <th class="py-4 px-6 text-left border-b border-r border-slate-800 cursor-pointer hover:text-white hover:bg-slate-800/50 transition group select-none"
                                    on:click=move |_| {
                                        if sort_by.get() == "name" { set_sort_desc.update(|d| *d = !*d); }
                                        else { set_sort_by.set("name".to_string()); set_sort_desc.set(false); }
                                    }
                                >
                                    <div class="flex items-center gap-2">
                                        "Part Name"
                                        <span class="opacity-30 group-hover:opacity-100 transition text-cyan-400 text-[10px]">{move || if sort_by.get() == "name" { if sort_desc.get() { "▼" } else { "▲" } } else { "↕" }}</span>
                                    </div>
                                </th>
                                <th class="py-4 px-6 text-left border-b border-r border-slate-800 cursor-pointer hover:text-white hover:bg-slate-800/50 transition group select-none"
                                    on:click=move |_| {
                                        if sort_by.get() == "category" { set_sort_desc.update(|d| *d = !*d); }
                                        else { set_sort_by.set("category".to_string()); set_sort_desc.set(false); }
                                    }
                                >
                                    <div class="flex items-center gap-2">
                                        "Category"
                                        <span class="opacity-30 group-hover:opacity-100 transition text-cyan-400 text-[10px]">{move || if sort_by.get() == "category" { if sort_desc.get() { "▼" } else { "▲" } } else { "↕" }}</span>
                                    </div>
                                </th>
                                <th class="py-4 px-6 text-left border-b border-r border-slate-800 cursor-pointer hover:text-white hover:bg-slate-800/50 transition group select-none"
                                    on:click=move |_| {
                                        if sort_by.get() == "location" { set_sort_desc.update(|d| *d = !*d); }
                                        else { set_sort_by.set("location".to_string()); set_sort_desc.set(false); }
                                    }
                                >
                                    <div class="flex items-center gap-2">
                                        "Location"
                                        <span class="opacity-30 group-hover:opacity-100 transition text-cyan-400 text-[10px]">{move || if sort_by.get() == "location" { if sort_desc.get() { "▼" } else { "▲" } } else { "↕" }}</span>
                                    </div>
                                </th>
                                <th class="py-4 px-6 text-center border-b border-r border-slate-800 cursor-pointer hover:text-white hover:bg-slate-800/50 transition group select-none"
                                    on:click=move |_| {
                                        if sort_by.get() == "stock" { set_sort_desc.update(|d| *d = !*d); }
                                        else { set_sort_by.set("stock".to_string()); set_sort_desc.set(false); }
                                    }
                                >
                                    <div class="flex items-center gap-2 justify-center">
                                        "Stock"
                                        <span class="opacity-30 group-hover:opacity-100 transition text-cyan-400 text-[10px]">{move || if sort_by.get() == "stock" { if sort_desc.get() { "▼" } else { "▲" } } else { "↕" }}</span>
                                    </div>
                                </th>
                                <th class="py-4 px-6 text-center border-b border-slate-800">"Status"</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800/50">
                            <Suspense fallback=|| view! { <tr><td colspan="5" class="p-8 text-center text-slate-500 animate-pulse">"Loading inventory..."</td></tr> }>
                                {move || parts.get().map(|result| match result {
                                    Ok(paginated) => {
                                        // Server handles filtering and pagination
                                        // Just render the items directly
                                        paginated.items.into_iter().map(|item| {
                                            let qty = item.quantity;
                                            let min = item.min_quantity;
                                            let is_order = qty <= min;
                                            let is_low = !is_order && qty <= (min as f32 * 1.5).ceil() as i32;
                                            let row_bg = if is_order { "bg-red-500/5 hover:bg-red-500/10" } else { "hover:bg-slate-800/50" };
                                            let border_color = if is_order { "border-red-500/20" } else { "border-slate-800" };
                                            let id = item.id;
                                            
                                            view! {
                                                <tr class={format!("group transition border-b {} {}", border_color, row_bg)}>
                                                    <td class="py-4 px-6 border-r border-slate-800 relative">
                                                        <div class="text-sm text-white font-bold tracking-wide">{item.name.clone()}</div>
                                                        <div class="flex items-center gap-2 mt-1.5 opacity-60 group-hover:opacity-100 transition">
                                                            <code class="text-[10px] text-cyan-300 bg-cyan-950/30 border border-cyan-800/50 px-1.5 py-0.5 rounded font-mono">{item.part_number.clone().unwrap_or_default()}</code>
                                                            {if let Some(mfr) = &item.manufacturer {
                                                                if !mfr.is_empty() {
                                                                    view! { <span class="text-[10px] text-slate-400 uppercase tracking-widest">{mfr}</span> }.into_view()
                                                                } else {
                                                                    view! { <span></span> }.into_view() 
                                                                }
                                                            } else {
                                                                view! { <span></span> }.into_view()
                                                            }}
                                                        </div>
                                                        {if is_order {
                                                            view! { <div class="absolute left-0 top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div> }
                                                        } else if is_low {
                                                            view! { <div class="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500"></div> }
                                                        } else {
                                                            view! { <div class="hidden"></div> }
                                                        }}
                                                    </td>
                                                    <td class="py-4 px-6 border-r border-slate-800 text-xs text-slate-400 font-medium">
                                                        {item.category.clone()}
                                                    </td>
                                                    <td class="py-4 px-6 border-r border-slate-800">
                                                        <input 
                                                            type="text"
                                                            value={item.location.clone().unwrap_or_default()}
                                                            placeholder="📍 Loc..."
                                                            on:change=move |ev| {

                                                                let new_loc = event_target_value(&ev);
                                                                stored_loc_action.get_value().dispatch((id, new_loc));
                                                            }
                                                            class="w-full bg-transparent border-b border-dashed border-slate-600 focus:border-cyan-500 focus:bg-slate-900 rounded-t px-2 py-1 text-xs text-yellow-500 font-mono text-center outline-none transition placeholder-slate-600"
                                                        />
                                                    </td>
                                                    <td class="py-4 px-6 border-r border-slate-800 text-center">
                                                        <input 
                                                            type="number"
                                                            min="0"
                                                            value={qty}
                                                            on:change=move |ev| {

                                                                let new_val: i32 = event_target_value(&ev).parse().unwrap_or(qty);
                                                                let change = new_val - qty;
                                                                if change != 0 {
                                                                    stored_action.get_value().dispatch((id, change));
                                                                }
                                                            }
                                                            class={format!("w-24 text-center border-2 rounded-lg px-2 py-2 text-xl font-black text-black shadow-lg transition transform focus:scale-110 outline-none {}", 
                                                                if is_order { "bg-red-400 border-red-500 shadow-red-500/20" } 
                                                                else if is_low { "bg-yellow-400 border-yellow-500 shadow-yellow-500/20" } 
                                                                else { "bg-emerald-400 border-emerald-500 shadow-emerald-500/20" }
                                                            )}
                                                        />
                                                    </td>
                                                    <td class="py-4 px-6 text-center">
                                                        {if qty == 0 {
                                                            view! { <span class="px-3 py-1 bg-red-500 text-white rounded-full text-[10px] uppercase tracking-wider font-bold shadow-lg shadow-red-500/30 animate-pulse">"Empty"</span> }
                                                        } else if is_order {
                                                            view! { <span class="px-3 py-1 bg-red-950 text-red-400 rounded-full text-[10px] uppercase tracking-wider font-bold border border-red-900">"Order"</span> }
                                                        } else if is_low {
                                                             view! { <span class="px-3 py-1 bg-yellow-950 text-yellow-400 rounded-full text-[10px] uppercase tracking-wider font-bold border border-yellow-900">"Low"</span> }
                                                        } else {
                                                             view! { <span class="px-3 py-1 bg-emerald-950 text-emerald-400 rounded-full text-[10px] uppercase tracking-wider font-bold border border-emerald-900">"Good"</span> }
                                                        }}
                                                    </td>
                                                </tr>
                                            }
                                        }).collect_view()
                                    },
                                    Err(e) => view! { <tr><td colspan="5" class="p-8 text-center text-red-500 bg-red-950/20">{format!("⚠️ Error loading parts: {:?}", e)}</td></tr> }.into_view()
                                })
                                }
                            </Suspense>
                        </tbody>
                    </table>
                </div>

                // Pagination Controls
                <div class="mt-4 flex items-center justify-between px-6 py-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div class="text-sm text-gray-400">
                        {move || {
                            parts.get().and_then(|r| r.ok()).map(|paginated| {
                                let start = if paginated.total == 0 { 0 } else { (paginated.page - 1) * paginated.page_size + 1 };
                                let end = std::cmp::min(paginated.page * paginated.page_size, paginated.total as i32);
                                view! {
                                    <span>
                                        "Showing " <span class="font-bold text-cyan-400">{start}</span>
                                        " to " <span class="font-bold text-cyan-400">{end}</span>
                                        " of " <span class="font-bold text-cyan-400">{paginated.total}</span>
                                        " parts"
                                    </span>
                                }
                            })
                        }}
                    </div>

                    <div class="flex items-center gap-2">
                        {move || {
                            parts.get().and_then(|r| r.ok()).map(|paginated| {
                                let current = paginated.page;
                                let total_pages = paginated.total_pages;

                                view! {
                                    <div class="flex items-center gap-2">
                                        // Previous button
                                        <button
                                            on:click=move |_| {
                                                if current > 1 {
                                                    set_current_page.set(current - 1);
                                                }
                                            }
                                            disabled={current <= 1}
                                            class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-gray-600 disabled:cursor-not-allowed rounded-lg text-sm font-bold transition"
                                        >
                                            "← Prev"
                                        </button>

                                        // Page indicator
                                        <span class="px-4 py-1.5 bg-slate-900 rounded-lg text-sm font-mono">
                                            <span class="text-cyan-400">{current}</span>
                                            <span class="text-gray-500">" / "</span>
                                            <span class="text-gray-400">{total_pages}</span>
                                        </span>

                                        // Next button
                                        <button
                                            on:click=move |_| {
                                                if current < total_pages {
                                                    set_current_page.set(current + 1);
                                                }
                                            }
                                            disabled={current >= total_pages}
                                            class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-gray-600 disabled:cursor-not-allowed rounded-lg text-sm font-bold transition"
                                        >
                                            "Next →"
                                        </button>
                                    </div>
                                }
                            })
                        }}
                    </div>
                </div>
            </div>
        </div>
    }
}
