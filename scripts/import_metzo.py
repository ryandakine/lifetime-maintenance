
import sqlite3
import pandas as pd
import sys
import os

DB_PATH = "cimco/src-tauri/cimco_offline.db"
EXCEL_PATH = "cimco/metso_parts.xlsx"

def infer_part_type(desc):
    if not isinstance(desc, str):
        return "General"
    d = desc.lower()
    if "hammer" in d: return "Hammer"
    if "cap" in d or "spider" in d: return "Spider Cap"
    if "anvil" in d: return "Wear Part"
    if "liner" in d: return "Lower" if "lower" in d else "Upper" if "upper" in d else "Wear Part"
    if "pin" in d: return "Wear Part"
    if "seal" in d or "kit" in d: return "Hydraulics"
    if "motor" in d: return "Electrical"
    if "pump" in d: return "Hydraulics"
    return "Shredder" # Default for this file

def run_import():
    print(f"Reading {EXCEL_PATH}...")
    try:
        df = pd.read_excel(EXCEL_PATH)
    except Exception as e:
        print(f"Error reading excel: {e}")
        # Try finding file?
        if not os.path.exists(EXCEL_PATH):
             print(f"File not found at {EXCEL_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    count = 0
    skipped = 0
    
    # Get existing part numbers
    try:
        existing_pns = set(row[0] for row in cursor.execute("SELECT part_number FROM parts WHERE part_number IS NOT NULL").fetchall())
    except Exception as e:
        print(f"Error fetching existing parts: {e}")
        existing_pns = set()

    # Iterate rows
    # Note: df columns are ['Metso Part #', 'ITEM #', 'Source', 'Description', 'Shredder takes', 'Spare Qty.', 'Price', 'Weight']
    
    for index, row in df.iterrows():
        try:
            # Clean data
            desc = row.get('Description')
            part_num = row.get('Metso Part #')
            
            if pd.isna(desc):
                continue

            # Convert to appropriate types
            part_num_str = str(part_num).strip() if not pd.isna(part_num) else None
            
            # Skip duplicates
            if part_num_str and part_num_str in existing_pns:
                skipped += 1
                continue

            name = str(desc).strip()
            manufacturer = "Metzo"
            category = "Shredder" # Default
            part_type = infer_part_type(name)
            
            # Adjustment for Header rows that mimic data
            if "Shredder Castings" in name: 
                 continue

            qty = 0
            try:
                q = row.get('Spare Qty.')
                if pd.notna(q):
                    qty = int(float(str(q).replace(',','')))
            except:
                qty = 0

            price = None
            try:
                p = row.get('Price')
                if pd.notna(p):
                     # Handle "$ 1,200.00"
                     p_str = str(p).replace('$','').replace(',','')
                     price = float(p_str)
            except:
                price = None

            # Insert
            cursor.execute("""
                INSERT INTO parts (
                    name, category, part_type, manufacturer, part_number, 
                    quantity, min_quantity, location, unit_cost, supplier
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                name, category, part_type, manufacturer, part_num_str,
                qty, 1, "Yard", price, "Metso"
            ))
            
            if part_num_str:
                existing_pns.add(part_num_str)
            count += 1

        except Exception as e:
            print(f"Error on row {index}: {e}")
            continue

    conn.commit()
    conn.close()
    print(f"Import complete: {count} parts added, {skipped} skipped (duplicates).")

if __name__ == "__main__":
    run_import()
