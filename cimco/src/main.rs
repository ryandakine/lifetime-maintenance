use leptos::*;

mod api;
mod app;
mod components;
mod showcase;
use app::App;

fn main() {
    console_error_panic_hook::set_once();
    mount_to_body(|| view! { <App/> })
}
