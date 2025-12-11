use leptos::*;
use leptos_router::*;
use crate::components::dashboard::StatCard;
use crate::components::camera::Camera;
use crate::components::scale::Scale;

#[component]
pub fn Showcase() -> impl IntoView {
    view! {
        <div class="flex h-screen bg-slate-900 text-white">
            // Sidebar
            <aside class="w-64 bg-slate-800 p-4 border-r border-slate-700">
                <h2 class="text-xl font-bold mb-6 text-blue-400">"Component Showcase"</h2>
                <nav class="space-y-2">
                    <a href="#stat-card" class="block p-2 hover:bg-slate-700 rounded">"Stat Card"</a>
                    <a href="#camera" class="block p-2 hover:bg-slate-700 rounded">"Camera Feed"</a>
                    <a href="#scale" class="block p-2 hover:bg-slate-700 rounded">"Scale Simulator"</a>
                </nav>
                <div class="mt-10 pt-4 border-t border-slate-700">
                    <A href="/" class="text-gray-400 hover:text-white flex items-center gap-2">
                        <span>"⬅ Back to App"</span>
                    </A>
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

            </main>
        </div>
    }
}
