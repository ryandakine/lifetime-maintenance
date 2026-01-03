import sqlite3
import math

DB_PATH = "cimco/src-tauri/cimco_offline.db"

def calculate_smart_stock():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get all parts and their total counts (by Name + Spec)
    # Actually, we need to iterate categories to find total installed count per part type
    
    # 1. Map PartName -> Total Count across all machines
    cursor.execute("SELECT id, name, description, quantity FROM parts")
    rows = cursor.fetchall()
    
    part_counts = {} # Name -> Total Qty
    part_ids = {}    # Name -> List of IDs
    
    for rid, name, desc, qty in rows:
        key = name.strip().upper()
        if "MOTOR" in key or "REDUCER" in key:
            # Group by Description (Spec) for major components
            # "TOSHIBA 5 HP"
            spec = " ".join((desc or "").upper().split()[:4])
            if len(spec) > 5:
                key = f"{key} | {spec}"
        
        part_counts[key] = part_counts.get(key, 0) + qty
        if key not in part_ids:
            part_ids[key] = []
        part_ids[key].append(rid)

    print(f"Calculated usage for {len(part_counts)} unique part types.")
    
    updates = 0
    
    for key, total_installed in part_counts.items():
        min_stock = 1
        
        # LOGIC RULES
        if "MOTOR" in key:
            # 10% Ratio for critical drives
            min_stock = math.ceil(total_installed * 0.10)
            if min_stock < 1: min_stock = 1
            if min_stock > 10: min_stock = 10 # Cap reasonable
            
        elif "REDUCER" in key:
            # 5% Ratio (Durable but expensive)
            min_stock = math.ceil(total_installed * 0.05)
            if min_stock < 1: min_stock = 1
            
        elif "SEAL" in key or "BUSHING" in key or "BEARING" in key:
            # 20% Ratio (Cheap consumables)
            min_stock = math.ceil(total_installed * 0.20)
            if min_stock < 4: min_stock = 4
            
        elif "HAMMER" in key or "BIT" in key:
             # Consumables - need full sets
             min_stock = 24 
             
        elif "BOLT" in key or "NUT" in key:
            min_stock = 50
            
        # Update ALL instances of this part to reflect the "System Wide" min stock requirement?
        # OR just set it on the "Warehouse/Yard" entry if we had one?
        # Currently, every part is specific to a machine.
        # So, if we have 58 Motors, we don't want every single row to say "Min: 7".
        # We want the "Inventory Dashboard" to aggregate this.
        
        # BUT, the App's "Low Stock" view likely checks `quantity <= min_quantity` per row.
        # Since we are tracking "Installed Parts" vs "Spare Parts", this is tricky.
        # The BOMs we ingested are "Installed Parts" (Qty = 1 usually).
        # So "Installed Qty" is 1. "Min Qty" for that specific slot is 1 (it must be there).
        
        # TO SHOW "SPARES", we need a "Spare Parts" Location that has Qty = 0 (currently).
        # Strategy: Create a NEW entry for each unique part type in "Warehouse" with Qty 0.
        # Set ITS min_quantity to the calculated smart value.
        
        pass 
        
    # We will Insert "Warehouse Spares" rows for critical items
    # These will show up as "Low Stock" (Qty 0 vs Min 7)
    
    print("Creating Warehouse Rows for Critical Spares...")
    
    for key, total_installed in part_counts.items():
        if "MOTOR" not in key and "REDUCER" not in key and "BEARING" not in key:
            continue
            
        # Recalculate logic
        target_stock = 0
        if "MOTOR" in key: target_stock = math.ceil(total_installed * 0.10)
        elif "REDUCER" in key: target_stock = math.ceil(total_installed * 0.05)
        elif "BEARING" in key: target_stock = math.ceil(total_installed * 0.15)
        
        if target_stock < 1: target_stock = 1
        
        # Get metadata from first instance
        first_id = part_ids[key][0]
        cursor.execute("SELECT name, description, manufacturer, part_number FROM parts WHERE id=?", (first_id,))
        meta = cursor.fetchone()
        
        # Check if "Warehouse" entry exists
        cursor.execute("SELECT id FROM parts WHERE name=? AND category='Warehouse Spares'", (meta[0],))
        exists = cursor.fetchone()
        
        if not exists:
            cursor.execute("""
                INSERT INTO parts (name, description, category, quantity, min_quantity, location, manufacturer, part_number)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                meta[0], 
                f"{meta[1]} (Support for {total_installed} installed units)", 
                "Warehouse Spares", 
                0, # Current Stock (Assume 0 for demo urgency)
                target_stock, 
                "Shelf A",
                meta[2],
                meta[3]
            ))
            updates += 1
            
    conn.commit()
    conn.close()
    print(f"Created {updates} Warehouse Spare slots with calculated stock levels.")

if __name__ == "__main__":
    calculate_smart_stock()
