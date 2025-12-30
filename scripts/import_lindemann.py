
import sqlite3
import sys
import os
import re
from pypdf import PdfReader

DB_PATH = "cimco/src-tauri/cimco_offline.db"
PDF_PATH = "cimco/lindemann_parts.pdf"

def infer_part_type(desc):
    if not desc: return "General"
    d = desc.lower()
    if "hammer" in d: return "Hammer"
    if "rotor" in d or "spider" in d: return "Shredder"
    if "cylinder" in d: return "Hydraulics"
    if "pin" in d or "bolt" in d or "washer" in d or "screw" in d or "hhcs" in d or "stud" in d: return "Wear Part" # or Hardware
    if "plate" in d or "liner" in d: return "Wear Part" # Liners are wear parts
    if "motor" in d: return "Electrical"
    return "Shredder"

def run_import():
    print(f"Reading {PDF_PATH}...")
    try:
        reader = PdfReader(PDF_PATH)
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    count = 0
    skipped = 0
    
    # Get existing part numbers
    try:
        existing_pns = set(row[0] for row in cursor.execute("SELECT part_number FROM parts WHERE part_number IS NOT NULL").fetchall())
    except Exception:
        existing_pns = set()

    for page in reader.pages:
        text = page.extract_text()
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            # Regex to match: ITEM_NO QTY PART_NO DESCRIPTION WEIGHT
            # Example: 1 1 MR0004969-000 BASE ASSY, METSO 80 LT 128956
            # We assume Item No is at start
            if not line: continue
            
            # Simple token split might fail if spaces in description
            # But structure is strict: INT INT S S...S FLOAT
            
            parts = line.split()
            if len(parts) < 5:
                continue
                
            # Check if first two are integers
            if not (parts[0].isdigit() and parts[1].isdigit()):
                continue
                
            qty = int(parts[1])
            part_num = parts[2]
            
            # Last part is weight (usually). 
            # Check if last part looks like a number
            weight_str = parts[-1]
            try:
                float(weight_str)
                # Description is everything from index 3 to -1
                desc_parts = parts[3:-1]
            except ValueError:
                # Maybe description doesn't have weight at end or OCR issue?
                # Assume description goes to end
                desc_parts = parts[3:]
                
            description = " ".join(desc_parts)
            
            # If part number is duplicate, skip
            if part_num in existing_pns:
                skipped += 1
                continue
                
            part_type = infer_part_type(description)
            
            # Insert
            cursor.execute("""
                INSERT INTO parts (
                    name, category, part_type, manufacturer, part_number, 
                    quantity, min_quantity, location, unit_cost, supplier
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                description, "Shredder", part_type, "Lindemann", part_num,
                qty, 1, "Yard", 0.0, "Lindemann" # Cost unknown in this PDF
            ))
            
            existing_pns.add(part_num)
            count += 1
            print(f"Added: {part_num} - {description}")

    conn.commit()
    conn.close()
    print(f"Lindemann Import complete: {count} parts added, {skipped} skipped.")

if __name__ == "__main__":
    run_import()
