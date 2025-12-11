use leptos::*;
use crate::api::get_stats;

#[component]
pub fn Dashboard() -> impl IntoView {
    let stats = create_resource(
        || (),
        |_| async move { get_stats().await }
    );

    view! {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
            <Suspense fallback=move || view! { <p>"Loading stats..."</p> }>
                {move || stats.get().map(|result| match result {
                    Ok(data) => view! {
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatCard title="Total Equipment" value=data.total_equipment.to_string() color="bg-blue-600" />
                            <StatCard title="Active" value=data.active_count.to_string() color="bg-green-600" />
                            <StatCard title="Maintenance" value=data.maintenance_count.to_string() color="bg-yellow-600" />
                            <StatCard title="Down" value=data.down_count.to_string() color="bg-red-600" />
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div class="md:col-span-2">
                                 <crate::components::chart::HealthChart />
                            </div>
                             <div class="bg-slate-800 p-4 rounded-lg shadow-lg flex flex-col justify-center items-center">
                                <h3 class="text-gray-400 uppercase text-xs font-bold mb-2">"System Health Score"</h3>
                                <div class="text-5xl font-bold text-blue-400">{format!("{:.1}%", data.average_health)}</div>
                             </div>
                        </div>
                    }.into_view(),
                    Err(_) => view! { <p class="text-red-500">"Error loading stats"</p> }.into_view()
                })}
            </Suspense>
        </div>
    }
}

#[component]
pub fn StatCard(title: &'static str, value: String, color: &'static str) -> impl IntoView {
    view! {
        <div class={format!("p-6 rounded-lg shadow-lg text-white {}", color)}>
            <h3 class="text-sm uppercase tracking-wider opacity-80">{title}</h3>
            <p class="text-3xl font-bold mt-2">{value}</p>
        </div>
    }
}
