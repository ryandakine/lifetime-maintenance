use leptos::*;
use crate::api::{get_cameras, CameraInfo};

#[component]
pub fn Camera() -> impl IntoView {
    let cameras = create_resource(
        || (),
        |_| async move { get_cameras().await }
    );

    view! {
        <div class="p-4 bg-slate-800 rounded-lg mt-4 text-white">
            <h2 class="text-xl font-bold mb-4">"Connected Cameras"</h2>
            <Suspense fallback=move || view! { <p>"Scanning..."</p> }>
                {move || cameras.get().map(|result| match result {
                    Ok(cams) => view! {
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cams.into_iter().map(|cam| view! {
                                <div class="bg-slate-700 p-4 rounded border border-slate-600">
                                    <div class="text-lg font-bold">{cam.name}</div>
                                    <div class="text-sm text-gray-400">{cam.description}</div>
                                    <div class="mt-2 text-xs bg-slate-900 inline-block px-2 py-1 rounded">
                                        "Index: " {cam.index}
                                    </div>
                                    // Placeholder for video feed
                                    <div class="mt-2 h-32 bg-black flex items-center justify-center">
                                        <span class="text-gray-600">"Feed Placeholder"</span>
                                    </div>
                                </div>
                            }).collect_view()}
                        </div>
                    }.into_view(),
                    Err(_) => view! { <p class="text-red-400">"No cameras found"</p> }.into_view()
                })}
            </Suspense>
        </div>
    }
}
