
import re

def convert():
    input_path = "cimco/database/seed_full.sql"
    output_path = "cimco/database/cimco_seed.sql"
    
    with open(input_path, "r") as fin, open(output_path, "w") as fout:
        fout.write("-- Converted Seed Data for Postgres\n")
        fout.write("BEGIN;\n")
        
        for line in fin:
            if line.startswith("INSERT INTO parts VALUES"):
                # Extract values content inside parens
                # VALUES(80,'HHCS...',...);
                # Use regex to be safeish
                m = re.search(r"VALUES\((.*)\);", line)
                if not m: continue
                
                content = m.group(1)
                
                # Split by comma but respect quotes
                tokens = []
                current = ""
                in_quote = False
                for char in content:
                    if char == "'":
                        in_quote = not in_quote
                    if char == "," and not in_quote:
                        tokens.append(current)
                        current = ""
                    else:
                        current += char
                tokens.append(current)
                
                # Token mapping from SQLite dump:
                # 0: id
                # 1: name
                # 2: desc
                # 3: cat
                # 4: type
                # 5: mfr
                # 6: part_num
                # 7: qty
                # 8: min_qty
                # 9: location (TEXT) -> "Yard"
                # 10: qr_code (Skip)
                # 11: unit_cost
                # 12: supplier
                # 13: last_ordered (Skip)
                # 14: created_at (Skip)
                # 15: updated_at (Skip)
                
                if len(tokens) < 13: continue
                
                tid = tokens[0]
                name = tokens[1]
                desc = tokens[2]
                cat = tokens[3]
                ptype = tokens[4]
                mfr = tokens[5]
                pnum = tokens[6]
                qty = tokens[7]
                min_qty = tokens[8]
                loc = tokens[9]
                # Skip 10 (qr)
                cost = tokens[11]
                supp = tokens[12]
                
                # Ensure cost is valid (default 0.0 if NULL or '0')
                if cost == "NULL": cost = "0.0"
                if supp == "NULL": supp = "NULL" # Postgres allows NULL text
                
                # Construct Postgres INSERT with explicit columns
                # Columns: id, name, description, category, part_type, manufacturer, part_number, quantity, min_quantity, location, unit_cost, supplier
                # Missing from source: lead_time_days (default 0), wear_rating (default NULL)
                
                stmt = f"INSERT INTO parts (id, name, description, category, part_type, manufacturer, part_number, quantity, min_quantity, location, unit_cost, supplier) VALUES ({tid}, {name}, {desc}, {cat}, {ptype}, {mfr}, {pnum}, {qty}, {min_qty}, {loc}, {cost}, {supp});\n"
                fout.write(stmt)
        
        fout.write("COMMIT;\n")
        # Ensure sequence is updated
        fout.write("SELECT setval('parts_id_seq', (SELECT MAX(id) FROM parts));\n")

if __name__ == "__main__":
    convert()
