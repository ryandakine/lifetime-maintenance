import sqlite3
import re
from collections import defaultdict

DB_PATH = "cimco/src-tauri/cimco_offline.db"

# Rules for Wear Factor (Base 1-10)
WEAR_KEYWORDS = {
    "HAMMER": 10,
    "ANVIL": 9,
    "LINER": 8,
    "GRATE": 8,
    "CAP": 7,
    "ROTOR": 6,
    "BEARING": 6,
    "IDLER": 5,
    "BELT": 5,
    "SCRAPER": 5,
    "SEAL": 4,
    "MOTOR": 2,
    "REDUCER": 2,
    "SHAFT": 2,
    "BOLT": 1,
    "NUT": 1,
    "WASHER": 1
}

def get_wear_score(name, desc):
    text = (name + " " + desc).upper()
    score = 1 # Default
    for key, val in WEAR_KEYWORDS.items():
        if key in text:
            score = max(score, val)
    return score

def run_analysis():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor() # Row factory not needed for simple tuples, but good for dicts
    
    # 1. Fetch all parts
    cursor.execute("SELECT id, name, description, category, quantity FROM parts")
    all_parts = cursor.fetchall()
    
    print(f"Analyzing connections across {len(all_parts)} parts...")
    
    # Data Structures for Analysis
    name_to_machines = defaultdict(set) # PartName -> {Machine1, Machine2}
    spec_to_machines = defaultdict(set) # "5 HP Motor" -> {Machine1, Machine2...}
    
    updates = []
    
    for pid, name, desc, cat, qty in all_parts:
        # cleanup name for matching
        clean_name = name.strip().upper()
        clean_desc = desc.strip().upper() if desc else ""
        
        # Track usage
        name_to_machines[clean_name].add(cat)
        
        # Extract Specs for Motors/Reducers/Bearings to find cross-compatibility
        # e.g. "DODGE TXT325"
        if "DODGE" in clean_desc or "TOSHIBA" in clean_desc:
            # Simple heuristic: Use the first 3-4 words of detailed description as "Spec ID"
            # Real AI would use embeddings, but this is fast.
            spec = " ".join(clean_desc.split()[:4])
            if len(spec) > 5:
                spec_to_machines[spec].add(cat)
        
        # Calculate Base Criticality
        wear_score = get_wear_score(clean_name, clean_desc)
        
        # Calculate Flow Priority (Heuristic)
        # Conveyor 1 is higher priority than Conveyor 20
        flow_priority = 1.0
        conveyor_match = re.search(r'Conveyor (\d+)', cat)
        if conveyor_match:
            try:
                num = int(conveyor_match.group(1))
                # Decay priority: C1 = 1.0, C20 = 0.5 roughly
                flow_priority = max(0.5, 1.0 - (num * 0.02)) 
            except:
                pass
                
        if "SHREDDER" in cat.upper():
            flow_priority = 1.2 # Shredder is king
            
        # Store for update loop (we calculate Commonality Score next)
        updates.append({
            "id": pid,
            "name": clean_name,
            "desc": clean_desc,
            "wear_score": wear_score,
            "flow_mult": flow_priority
        })

    # 2. Calculate Commonality Multipliers
    print("\n--- INSIGHTS DISCOVERED ---")
    
    high_value_spares = []
    
    for item in updates:
        # How many machines use this EXACT part name?
        usage_count = len(name_to_machines[item["name"]])
        
        # How many match the "Spec"? (Better for complex parts like Motors)
        spec_match = ""
        spec_count = 0
        if item["desc"]:
             spec = " ".join(item["desc"].split()[:4])
             if spec in spec_to_machines:
                 spec_count = len(spec_to_machines[spec])
                 spec_match = spec
        
        final_count = max(usage_count, spec_count)
        
        commonality_mult = 1.0
        if final_count > 1:
            commonality_mult = 1.0 + (final_count * 0.1) # Boost score for shared parts
        
        # Final Score
        # (Wear * 10) * Flow * Commonality = 0 to ~200
        final_score = (item["wear_score"] * 10) * item["flow_mult"] * commonality_mult
        
        if final_count > 2 and item["wear_score"] > 1:
            # Highlight interesting finds
            key = f"{item['name']} ({spec_match})" if spec_match else item['name']
            if key not in high_value_spares:
                high_value_spares.append(key)
                if len(high_value_spares) < 6: # Show top 5
                    print(f"💡 SHARED ASSET: '{key}' is used in {final_count} different systems.")
        
        # Update DB (We need to add a column first usually, but for now we'll update the description or just print)
        # Ideally we create a `criticality_score` column. 
        # I'll repurpose `min_quantity` to store this score for visualization if user agrees, 
        # OR just append tags to Description "[Crit: 85]"
        
        new_desc = item["desc"]
        if "Crit:" not in new_desc: # Avoid double tagging
             new_desc = f"{new_desc} [Risk:{int(final_score)}]"
             
        cursor.execute("UPDATE parts SET description = ? WHERE id = ?", (new_desc, item["id"]))

    print(f"Updated {len(updates)} parts with Risk Scores.")
    conn.commit()
    conn.close()

if __name__ == "__main__":
    run_analysis()
