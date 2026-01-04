import pandas as pd
import sqlite3
import os
import sys
import re
from pypdf import PdfReader

def extract_pdf_data(pdf_path):
    """
    Extracts parts data from a PDF file.
    Assumes a format where lines might contain "MM..." part numbers.
    """
    if not os.path.exists(pdf_path):
        print(f"❌ Error: {pdf_path} not found.")
        return []

    print(f"📖 Reading PDF {pdf_path}...")
    parts = []
    try:
        reader = PdfReader(pdf_path)
        for page in reader.pages:
            text = page.extract_text()
            if not text:
                continue
            
            # Simple heuristic: Look for lines with part numbers like MM12345 or MR...
            # and associated descriptions.
            lines = text.split('\n')
            for line in lines:
                # Regex for potential part numbers (e.g., MM followed by digits, or generally alphanumeric codes)
                # This is a broad matcher: 2 uppercase letters followed by 5-8 digits/chars
                match = re.search(r'\b([A-Z]{2}\d{5,8}[-A-Z0-9]*)\b', line)
                if match:
                    part_num = match.group(1)
                    # Improve Description extraction: take the rest of the line or surrounding text
                    # clean up the line by removing the part number
                    clean_line = line.replace(part_num, '').strip()
                    # Remove common noise words like "ASSY", "METSO", date, or trailing numbers
                    description = clean_line
                    
                    parts.append({
                        'part_number': part_num,
                        'name': description if len(description) > 3 else f"Part {part_num}",
                        'description': line, # Keep full line as description for context
                        'quantity': 1, # Default
                        'category': 'Shredder Parts',
                        'manufacturer': 'Lindemann' if 'Lindemann' in pdf_path else 'Unknown'
                    })
    except Exception as e:
        print(f"❌ PDF Error: {e}")
        
    return parts

def convert_excel_to_df(excel_file):
    if not os.path.exists(excel_file):
        print(f"❌ Error: {excel_file} not found.")
        return pd.DataFrame()

    try:
        print(f"📖 Reading Excel {excel_file}...")
        df = pd.read_excel(excel_file)
        
        # Renaissance Columns
        column_map = {
            'Part Number': 'part_number',
            'Description': 'description',
            'Qty': 'quantity', 
            'Weight': 'wear_rating' 
        }
        df.rename(columns=column_map, inplace=True)
        
        # Add required columns
        if 'name' not in df.columns:
            if 'description' in df.columns:
                df['name'] = df['description']
            else:
                df['name'] = "Imported Part"
        
        if 'category' not in df.columns:
            df['category'] = 'Imported'
            
        if 'manufacturer' not in df.columns:
            df['manufacturer'] = 'Metso' # Default for this file
            
        return df
    except Exception as e:
        print(f"❌ Excel Error: {e}")
        return pd.DataFrame()

def import_to_sqlite():
    db_path = 'src-tauri/cimco_offline.db'
    
    # 1. Process Excel
    df_excel = convert_excel_to_df('metso_parts.xlsx')
    
    # 2. Process PDF
    pdf_parts = extract_pdf_data('lindemann_parts.pdf')
    df_pdf = pd.DataFrame(pdf_parts)
    
    # Combine
    all_dfs = []
    if not df_excel.empty:
        all_dfs.append(df_excel)
    if not df_pdf.empty:
        all_dfs.append(df_pdf)
        
    if not all_dfs:
        print("⚠️ No data found to import.")
        return

    final_df = pd.concat(all_dfs, ignore_index=True)
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print(f"📥 Importing {len(final_df)} items into {db_path}...")
        
        count = 0
        for index, row in final_df.iterrows():
            try:
                # Upsert logic (checking part_number conflict would be better, but for now we just insert)
                # Check if exists first to avoid duplicates
                p_num = str(row.get('part_number', ''))
                if p_num and len(p_num) > 3:
                     cursor.execute("SELECT id FROM parts WHERE part_number = ?", (p_num,))
                     if cursor.fetchone():
                         print(f"  ⏭️ Skipping existing part: {p_num}")
                         continue

                cursor.execute("""
                    INSERT INTO parts (name, category, quantity, part_number, description, manufacturer, min_quantity, lead_time_days, location)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    str(row.get('name', 'Unknown Part')), 
                    str(row.get('category', 'Imported')), 
                    int(row.get('quantity', 0) if pd.notnull(row.get('quantity')) else 0),
                    p_num,
                    str(row.get('description', '')),
                    str(row.get('manufacturer', 'Unknown')),
                    5, # Default min_qty
                    14, # Default lead time
                    "Yard" # Default location
                ))
                count += 1
            except Exception as row_err:
                print(f"  ⚠️ Error row {index}: {row_err}")
                
        conn.commit()
        conn.close()
        print(f"✅ Import complete! Added {count} new parts.")
        
    except Exception as e:
        print(f"❌ Database Error: {e}")

if __name__ == "__main__":
    import_to_sqlite()
