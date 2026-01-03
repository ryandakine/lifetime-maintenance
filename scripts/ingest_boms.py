import sqlite3
import subprocess
import re
import sys
import os

DB_PATH = "cimco/src-tauri/cimco_offline.db"
BOM_FILES = [
    "/home/ryan/Downloads/C617 BOM.pdf",
    "/home/ryan/Downloads/A545 BOM.pdf"
]

def extract_text(pdf_path):
    print(f"Extracting text from {pdf_path}...")
    try:
        # -layout ensures columns align
        result = subprocess.run(['pdftotext', '-layout', pdf_path, '-'], capture_output=True, text=True)
        return result.stdout
    except Exception as e:
        print(f"Error extracting {pdf_path}: {e}")
        return ""

def ingest():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    total_added = 0
    current_machine = "General"  # Default category
    
    for pdf_path in BOM_FILES:
        if not os.path.exists(pdf_path):
            print(f"File not found: {pdf_path}")
            continue
            
        text = extract_text(pdf_path)
        lines = text.split('\n')
        
        # Default machine name from filename
        base_name = os.path.basename(pdf_path).replace(".pdf", "")
        current_machine = base_name 
        
        print(f"Parsing {len(lines)} lines from {base_name}...")
        
        for line in lines:
            stripped = line.strip()
            
            # --- HEADER DETECTION (Switch Category) ---
            
            # 1. C617 style: "C617-04A BILL OF MATERIALS"
            bom_header_match = re.search(r'(C\d+-[0-9A-Z]+)\s+BILL OF MATERIALS', line)
            if bom_header_match:
                sub_id = bom_header_match.group(1)
                current_machine = f"{base_name} - {sub_id}"
                print(f"  --- Found Sub-Machine: {current_machine} ---")
                
            # 2. A545 style: "CONVEYOR # 09A"
            conveyor_match = re.search(r'CONVEYOR #\s+(\S+)', line)
            if conveyor_match:
                sub_id = conveyor_match.group(1)
                current_machine = f"{base_name} - Conveyor {sub_id}"
                print(f"  --- Found Sub-Machine: {current_machine} ---")

            # 3. Description checks
            # "DESCRIPTION RADIAL STACKER"
            description_match = re.search(r'DESCRIPTION\s+(.+?)\s+(CONVEYOR|MACHINE|SIZE)', line)
            if description_match:
                 desc_text = description_match.group(1).strip()
                 if len(desc_text) > 3 and "CIMCO" not in desc_text:
                     # Avoid falses
                     # Append if not already set by BOM header
                     if base_name not in current_machine:
                        current_machine = f"{base_name} - {desc_text}"
                     # print(f"  --- Sub-Machine Desc: {desc_text} ---")

            # --- DATA PARSING ---
            
            # Regex: (Detail #) (Item Name) (Qty) (Description)
            # Flexible Match: Start with 1-3 digits -> Space -> Any text -> Space -> Digits -> Space -> Desc
            
            match = re.match(r'^\s*(\d+)\s+([A-Z0-9\-\.\s]+?)\s+(\d+)\s+(.+)$', line)
            
            if match:
                detail_num = match.group(1)
                item_name = match.group(2).strip()
                qty_str = match.group(3)
                desc = match.group(4).strip()
                
                # Filter out headers
                if "ITEM" in item_name or "QTY" in item_name:
                    continue
                
                try:
                    qty = int(qty_str)
                except:
                    continue
                    
                # Skip duplicate inserts within same run? No, we rely on DB duplicate checks if needed.
                # But to avoid re-inserting EVERYTHING if user runs twice, use INSERT OR IGNORE or Check.
                # Here we check (name, category).
                
                cursor.execute("SELECT id FROM parts WHERE name = ? AND category = ?", (item_name, current_machine))
                existing = cursor.fetchone()
                
                if not existing:
                    cursor.execute("""
                        INSERT INTO parts (name, description, category, quantity, min_quantity, location)
                        VALUES (?, ?, ?, ?, ?, ?)
                    """, (
                        item_name, 
                        desc, 
                        current_machine, 
                        qty, 
                        1, 
                        "Yard"
                    ))
                    total_added += 1

    conn.commit()
    conn.close()
    print(f"✅ Scanning Complete. Total new parts added: {total_added}")

if __name__ == "__main__":
    ingest()
