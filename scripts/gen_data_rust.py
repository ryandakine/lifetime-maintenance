import re

def parse_sql_value(val):
    val = val.strip()
    if val == "NULL":
        return "None"
    if val.startswith("'") and val.endswith("'"):
        # Check for escaped quotes? '2 1/2'' WASHER' -> SQL uses '' for '.
        inner = val[1:-1].replace("''", "'").replace('"', '\\"')
        return f'Some("{inner}".to_string())'
    # Numbers
    return val

def generate_rust():
    parts_live = []
    parts_demo = []
    
    with open("cimco/database/seed_full.sql", "r") as f:
        for line in f:
            if line.startswith("INSERT INTO parts VALUES"):
                # Rough split by comma. Be careful of commas inside text.
                # Assuming simple seed data without commas in names for now, or using a smarter split.
                # The seed data: 'UPPER SIDE LINER / LEFT HAND' -> safe.
                # '2" OVAL HEAD BOLT' -> safe.
                # Regex match for VALUES\((.*)\);
                m = re.search(r"VALUES\((.*)\);", line)
                if not m: continue
                content = m.group(1)
                
                # Split respecting single quotes
                tokens = []
                current = ""
                in_quote = False
                for char in content:
                    if char == "'" and (not current or current[-1] != "\\"): # rudimentary quote check
                        # SQL escapes ' with ' usually. 
                        # We'll just split simply by comma if not in quote.
                        # Actually, looking at seed_full.sql, quoting is standard.
                        pass
                    
                    if char == "'":
                        in_quote = not in_quote
                    
                    if char == "," and not in_quote:
                        tokens.append(current)
                        current = ""
                    else:
                        current += char
                tokens.append(current)
                
                # Tokens:
                # 0: id
                # 1: name
                # 2: desc
                # 3: cat
                # 4: type
                # 5: mfr
                # 6: part_num
                # 7: qty
                # 8: min
                # 9: loc
                
                if len(tokens) < 10: continue

                tid = tokens[0].strip()
                name = parse_sql_value(tokens[1])
                # Name is mandatory, parse_sql_value wraps in Some() for strings, but name in struct is String (not Option).
                # Unwrap the "Some(...)" wrapper if present.
                if name.startswith("Some("):
                     # Extract inner content: Some("CONTENT".to_string()) -> "CONTENT".to_string()
                     name = name[5:-1]
                
                desc = parse_sql_value(tokens[2])
                cat = parse_sql_value(tokens[3])
                if cat.startswith("Some("):
                     cat = cat[5:-1] # Category is String

                ptype = parse_sql_value(tokens[4])
                mfr = parse_sql_value(tokens[5])
                pnum = parse_sql_value(tokens[6])
                
                qty_demo = tokens[7].strip() # SQL Quantity
                min_qty = tokens[8].strip()
                loc_demo = parse_sql_value(tokens[9])
                
                # Live Data: Qty=0, Loc=None
                parts_live.append(f'Part {{ id: {tid}, name: {name}, category: {cat}, quantity: 0, min_quantity: {min_qty}, location: None, description: {desc}, part_type: {ptype}, manufacturer: {mfr}, part_number: {pnum}, lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) }}')
                
                parts_demo.append(f'Part {{ id: {tid}, name: {name}, category: {cat}, quantity: {qty_demo}, min_quantity: {min_qty}, location: {loc_demo}, description: {desc}, part_type: {ptype}, manufacturer: {mfr}, part_number: {pnum}, lead_time_days: 7, unit_cost: None, supplier: None, wear_rating: Some(5) }}')

    # Write output
    with open("cimco/src/generated_datasets.rs", "w") as out:
        out.write("use crate::api::Part;\n\n")
        out.write("pub fn get_live_data() -> Vec<Part> {\n    vec![\n")
        for p in parts_live:
            out.write(f"        {p},\n")
        out.write("    ]\n}\n\n")
        
        out.write("pub fn get_demo_data() -> Vec<Part> {\n    vec![\n")
        for p in parts_demo:
            out.write(f"        {p},\n")
        out.write("    ]\n}\n")

if __name__ == "__main__":
    generate_rust()
