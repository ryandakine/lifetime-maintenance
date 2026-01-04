use leptos::*;

#[component]
pub fn ROICalculator() -> impl IntoView {
    // Signals for Inputs
    let (downtime_hours, set_downtime_hours) = create_signal(4.0);
    let (hourly_rate, set_hourly_rate) = create_signal(500.0); // Cost per hour of downtime
    let (missed_repairs, set_missed_repairs) = create_signal(2.0); // Per month
    let (avg_repair_cost, set_avg_repair_cost) = create_signal(2500.0); // Cost of a big repair

    // Calculated "Cost of Stupid" (Monthly)
    let cost_of_stupid = move || {
        let downtime_cost = downtime_hours.get() * hourly_rate.get();
        let repair_cost = missed_repairs.get() * avg_repair_cost.get();
        downtime_cost + repair_cost
    };

    // OSI Cost (Monthly)
    let osi_cost = 199.0;
    
    // Savings
    let monthly_savings = move || cost_of_stupid() - osi_cost;
    let yearly_savings = move || monthly_savings() * 12.0;

    view! {
        <div class="bg-slate-900 border border-slate-700 rounded-xl p-6 text-white shadow-2xl">
            <div class="flex items-center gap-3 mb-6">
                <div class="bg-red-500/20 p-3 rounded-full text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div>
                    <h2 class="text-2xl font-bold text-white">"The Cost of Stupid"</h2>
                    <p class="text-slate-400 text-sm">"What is NOT tracking maintenance costing you?"</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                // Inputs Column
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs uppercase text-slate-500 font-bold mb-1">"Hours Down per Failure"</label>
                        <input type="range" min="1" max="24" step="1" 
                            prop:value=move || downtime_hours.get()
                            on:input=move |ev| set_downtime_hours.set(event_target_value(&ev).parse().unwrap_or(0.0))
                            class="w-full accent-blue-500 mb-1"
                        />
                        <div class="text-right font-mono text-cyan-400">{move || downtime_hours.get()} " hrs"</div>
                    </div>

                    <div>
                        <label class="block text-xs uppercase text-slate-500 font-bold mb-1">"Cost per Hour (Downtime)"</label>
                        <div class="relative">
                            <span class="absolute left-3 top-2 text-slate-400">$</span>
                            <input type="number" 
                                prop:value=move || hourly_rate.get()
                                on:input=move |ev| set_hourly_rate.set(event_target_value(&ev).parse().unwrap_or(0.0))
                                class="w-full bg-slate-800 border border-slate-700 rounded p-2 pl-6 text-white focus:border-cyan-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs uppercase text-slate-500 font-bold mb-1">"Missed Repairs / Month"</label>
                        <input type="range" min="0" max="10" step="1" 
                            prop:value=move || missed_repairs.get()
                            on:input=move |ev| set_missed_repairs.set(event_target_value(&ev).parse().unwrap_or(0.0))
                            class="w-full accent-red-500 mb-1"
                        />
                        <div class="text-right font-mono text-red-400">{move || missed_repairs.get()} " incidents"</div>
                    </div>

                    <div>
                        <label class="block text-xs uppercase text-slate-500 font-bold mb-1">"Avg. Repair Cost"</label>
                        <div class="relative">
                            <span class="absolute left-3 top-2 text-slate-400">$</span>
                            <input type="number" 
                                prop:value=move || avg_repair_cost.get()
                                on:input=move |ev| set_avg_repair_cost.set(event_target_value(&ev).parse().unwrap_or(0.0))
                                class="w-full bg-slate-800 border border-slate-700 rounded p-2 pl-6 text-white focus:border-cyan-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                // Results Column
                <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700 flex flex-col justify-center space-y-6">
                    <div>
                        <div class="text-xs uppercase text-red-500 font-bold mb-1 tracking-widest">"Current Monthly Loss"</div>
                        <div class="text-4xl font-black text-white tracking-tighter">
                            "$" {move || format!("{:.0}", cost_of_stupid())}
                        </div>
                        <div class="text-xs text-slate-500 mt-1">"This is money burning every month."</div>
                    </div>

                    <div class="h-px bg-slate-700 w-full"></div>

                    <div>
                        <div class="text-xs uppercase text-emerald-500 font-bold mb-1 tracking-widest">"OSI System Cost"</div>
                        <div class="text-2xl font-bold text-white">
                            "$199" <span class="text-sm text-slate-500 font-normal">"/ mo"</span>
                        </div>
                    </div>

                    <div class="h-px bg-slate-700 w-full"></div>

                    <div>
                        <div class="text-xs uppercase text-cyan-400 font-bold mb-1 tracking-widest">"Potential Yearly Savings"</div>
                        <div class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tighter shadow-cyan-500/20 drop-shadow-lg">
                            "$" {move || format!("{:.0}", yearly_savings())}
                        </div>
                        <div class="text-xs text-slate-400 mt-2 italic">
                            "Pays for itself in " 
                            {move || {
                                let c = cost_of_stupid();
                                let days = if c > 0.0 { osi_cost / (c / 30.0) } else { 0.0 };
                                format!("{:.1}", days)
                            }} 
                            " days."
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}
