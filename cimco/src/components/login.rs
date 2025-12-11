use leptos::*;

#[derive(Clone, Debug, PartialEq)]
pub enum UserRole {
    Admin,  // "The Boss"
    Worker, // "The Crew"
}

#[derive(Clone, Debug)]
pub struct User {
    pub name: String,
    pub role: UserRole,
}

#[component]
pub fn Login(on_login: Action<User, ()>) -> impl IntoView {
    view! {
        <div class="min-h-screen flex items-center justify-center bg-slate-900">
            <div class="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md flex flex-col items-center">
                <img src="public/cimco-logo-official.png" alt="CIMCO" class="w-48 h-auto mb-6 drop-shadow-lg" />
                <h1 class="text-3xl font-bold text-center mb-2 text-white">"Welcome Back"</h1>
                <p class="text-slate-400 text-center mb-8">"CIMCO Equipment Tracker"</p>

                <div class="space-y-4">
                    <button
                        on:click=move |_| on_login.dispatch(User { name: "Boss".to_string(), role: UserRole::Admin })
                        class="w-full p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg transform transition hover:scale-[1.02] flex items-center justify-center gap-3"
                    >
                        <span class="text-2xl">"👨‍💼"</span>
                        "Login as Boss (Admin)"
                    </button>

                    <div class="relative flex py-2 items-center">
                        <div class="flex-grow border-t border-slate-600"></div>
                        <span class="flex-shrink mx-4 text-slate-500">"OR"</span>
                        <div class="flex-grow border-t border-slate-600"></div>
                    </div>

                    <button
                        on:click=move |_| on_login.dispatch(User { name: "Tech".to_string(), role: UserRole::Worker })
                        class="w-full p-4 bg-slate-700 rounded-lg hover:bg-slate-600 text-slate-200 font-bold text-lg transform transition hover:scale-[1.02] flex items-center justify-center gap-3 border border-slate-600"
                    >
                        <span class="text-2xl">"👷"</span>
                        "Login as Worker"
                    </button>
                </div>

                <p class="text-slate-500 text-xs text-center mt-8">
                    "Secure Role-Based Access Control v1.0"
                </p>
            </div>
        </div>
    }
}
