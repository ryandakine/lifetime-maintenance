import sqlite3

DB_PATH = "cimco/src-tauri/cimco_offline.db"

WEAR_SCORES = {
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
    "SEAL": 5,
    "CHAIN": 4,
    "MOTOR": 2,
    "REDUCER": 2,
    "SHAFT": 2,
    "BOLT": 1,
    "NUT": 1,
    "WASHER": 1
}

def upgrade_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if column exists
    try:
        cursor.execute("SELECT wear_rating FROM parts LIMIT 1")
    except sqlite3.OperationalError:
        print("Adding 'wear_rating' column...")
        cursor.execute("ALTER TABLE parts ADD COLUMN wear_rating INTEGER DEFAULT 0")
    
    # Update Data
    print("Updating Wear Ratings...")
    cursor.execute("SELECT id, name, description FROM parts")
    rows = cursor.fetchall()
    
    updates = 0
    for rid, name, desc in rows:
        text = (name + " " + (desc or "")).upper()
        score = 1
        for key, val in WEAR_SCORES.items():
            if key in text:
                score = max(score, val)
        
        cursor.execute("UPDATE parts SET wear_rating = ? WHERE id = ?", (score, rid))
        updates += 1
        
    conn.commit()
    conn.close()
    print(f"Updated {updates} parts with specific Wear Ratings.")

if __name__ == "__main__":
    upgrade_db()
