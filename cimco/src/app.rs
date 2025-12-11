use leptos::*;
use leptos_router::*;
use crate::showcase::Showcase;
use crate::components::equipment_list::EquipmentList;
use crate::components::tasks::Tasks;

#[component]
pub fn App() -> impl IntoView {
    view! {
        <Router>
            <Routes>
                <Route path="/" view=MainApp />
                <Route path="/showcase" view=Showcase />
                <Route path="/equipment" view=EquipmentList />
                <Route path="/tasks" view=Tasks />
            </Routes>
        </Router>
    }
}

#[component]
fn MainApp() -> impl IntoView {
    view! {
        <div class="container relative">
            <header class="p-5 bg-slate-800 text-white flex justify-between items-center">
                <div>
                    <h1 class="text-2xl font-bold">"CIMCO Equipment Tracker"</h1>
                    <p class="text-gray-400">"Rust Edition 🦀"</p>
                </div>
                <div class="flex gap-4">
                    <A href="/tasks" class="text-base bg-emerald-700 px-6 py-2 rounded-lg hover:bg-emerald-600 border border-emerald-600 font-bold shadow-md transition-transform hover:scale-105 flex items-center gap-2">
                        "📋 Tasks"
                    </A>
                    <A href="/equipment" class="text-base bg-blue-700 px-6 py-2 rounded-lg hover:bg-blue-600 border border-blue-600 font-bold shadow-md transition-transform hover:scale-105">
                        "🏗️ Manage Equipment"
                    </A>
                    <A href="/showcase" class="text-base bg-slate-700 px-6 py-2 rounded-lg hover:bg-slate-600 border border-slate-600 font-bold shadow-md transition-transform hover:scale-105">
                        "🛠️ Showcase"
                    </A>
                </div>
            </header>
            <main class="p-5">
                <crate::components::dashboard::Dashboard />
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <crate::components::camera::Camera />
                    <crate::components::scale::Scale />
                </div>
                <crate::components::logs::Logs />
            </main>
        </div>
    }
}
