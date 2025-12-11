use leptos::*;
use plotters::prelude::*;
use plotters_canvas::CanvasBackend;

#[component]
pub fn HealthChart() -> impl IntoView {
    // Unique ID for the canvas
    let canvas_id = "health-chart";

    create_effect(move |_| {
        // Draw chart when component mounts
        let _ = draw_chart(canvas_id);
    });

    view! {
        <div class="bg-slate-800 p-4 rounded-lg shadow-lg">
            <h3 class="text-gray-400 uppercase text-xs font-bold mb-4">"24-Hour Health Trend"</h3>
            <canvas id=canvas_id width="400" height="200" class="w-full h-auto"></canvas>
        </div>
    }
}

fn draw_chart(id: &str) -> Result<(), Box<dyn std::error::Error>> {
    let backend = CanvasBackend::new(id).expect("canvas not found");
    let root = backend.into_drawing_area();
    
    root.fill(&RGBColor(15, 23, 42))?; // Slate 900 background

    let mut chart = ChartBuilder::on(&root)
        .margin(10)
        .x_label_area_size(30)
        .y_label_area_size(30)
        .build_cartesian_2d(0f32..24f32, 0f32..100f32)?;

    chart.configure_mesh()
        .light_line_style(&RGBColor(51, 65, 85)) // Slate 700 grid
        .axis_style(&RGBColor(148, 163, 184)) // Grid text color
        .label_style(("sans-serif", 10).into_font().color(&RGBColor(148, 163, 184)))
        .draw()?;

    // Simulate data (Health dropping slightly then recovering)
    let data: Vec<(f32, f32)> = (0..24).map(|x| {
        let val = x as f32;
        let health = 90.0 - (val - 12.0).powi(2) / 10.0 + (rand::random::<f32>() * 5.0);
        (val, health.clamp(0.0, 100.0))
    }).collect();

    chart.draw_series(LineSeries::new(
        data,
        &RGBColor(59, 130, 246), // Blue 500
    ))?;

    Ok(())
}
