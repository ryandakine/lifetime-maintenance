
import sqlite3
import pandas as pd
import json

DB_PATH = "cimco/src-tauri/cimco_offline.db"

def analyze_system():
    conn = sqlite3.connect(DB_PATH)
    
    print("\n=== 🏭 CIMCO INVENTORY INTELLIGENCE REPORT ===\n")

    # 1. VERIFY DATA IMPORT
    print("--- 1. DATA VERIFICATION ---")
    try:
        parts_count = conn.execute("SELECT count(*) FROM parts").fetchone()[0]
        print(f"✅ Total Parts Tracked: {parts_count}")
        
        # Show breakdown by Manufacturer (New Schema Feature)
        print("\n[Manufacturer Breakdown]")
        mfrs = conn.execute("SELECT manufacturer, count(*) FROM parts GROUP BY manufacturer").fetchall()
        for m, c in mfrs:
            print(f"   - {m or 'Unknown'}: {c} parts")
            
        # Show breakdown by Part Type (New Schema Feature)
        print("\n[Part Type Distribution]")
        types = conn.execute("SELECT part_type, count(*) FROM parts GROUP BY part_type").fetchall()
        for t, c in types:
            print(f"   - {t or 'Unclassified'}: {c} parts")
            
    except Exception as e:
        print(f"❌ Error reading parts: {e}")

    # 2. AI READINESS CHECK
    print("\n--- 2. AI PREDICTION POTENTIAL ---")
    print("The system is designed to track 'Usage Rates'. Here is a sample of high-value assets AI will monitor:")
    
    query = """
    SELECT name, part_type, manufacturer, quantity, unit_cost 
    FROM parts 
    WHERE unit_cost > 100 OR quantity > 10
    ORDER BY unit_cost DESC 
    LIMIT 5
    """
    expensive_parts = conn.execute(query).fetchall()
    
    print(f"{'PART NAME':<35} | {'MFR':<10} | {'COST':<10} | {'AI NOTE'}")
    print("-" * 80)
    for p in expensive_parts:
        name, ptype, mfr, qty, cost = p
        cost_str = f"${cost:,.2f}" if cost else "N/A"
        # Simulated AI Insight
        note = "Needs Usage Data"
        if "Hammer" in name: note = "High Wear Rate Expected"
        if "Pump" in name: note = "Critical Failure Point"
        
        print(f"{name:<35} | {mfr or '-':<10} | {cost_str:<10} | {note}")

    # 3. MAINTENANCE PATTERN SIMULATION
    print("\n--- 3. EXAMPLE AI FORECAST (Simulation) ---")
    print("Once we load Linden data tomorrow, the AI will compare:")
    print("   METSO HAMMER Usage:  [Simulated] 0.8 per day")
    print("   LINDEN HAMMER Usage: [Simulated] 1.2 per day")
    print("   👉 AI CONCLUSION: Metso Hammers last 33% longer. Switch recommended.")

    conn.close()

if __name__ == "__main__":
    analyze_system()
