# PRD: Shredder Parts Inventory Migration & Enhancement

## 1. Problem Statement
The current inventory system uses a simple flat schema (`name`, `category`, `quantity`). The real-world data (Shredder Parts) is more complex:
- **Multiple Manufacturers**: Metzo (current) vs. Linden (legacy). Same physical parts, different part numbers.
- **Part Hierarchies/Types**:
    - **Upper Parts**: Long lifespan (~1.5 years)
    - **Lower Parts**: Medium lifespan (~6 months)
    - **Wear Parts**: Short lifespan (Spider Caps, Hammers - 3-5 days)
- **Data Volume**: Currently on two CDs (Excel/PDF), but will scale to cloud-based imports of larger datasets.

## 2. Objectives
- **Schema Upgrade**: safely migrate the database to support `part_type`, `manufacturer`, `lifespan_days` (optional), and better `part_number` handling.
- **Dual-Source Tracking**: Allow linking or finding equivalent parts between different manufacturers (e.g., searching "Hammer" shows both Metso and Linden options).
- **Data Import**: Ingest data from "Metso shredder parts.xlsx" and PDF documentation.
- **Safety**: Ensure no data loss during migration.
- **Hardware Integration**: Prepare for future GPS/Accelerometer tracking on high-value parts.

## 3. Technical Requirements

### 3.1 Database Schema Changes
Update `parts` table with new columns (if not already present):
- `part_type` (TEXT): Enum-like values ('Upper', 'Lower', 'Wear Part', 'Spider Cap', 'Hammer', 'Hydraulics', 'Electrical')
- `manufacturer` (TEXT): 'Metzo', 'Linden', 'SSI', 'Generic'
- `lifespan_estimate` (TEXT or INTEGER): Expected replacement interval (e.g., "3-5 days", "6 months")
- `alternative_part_number` (TEXT): To link Linden part numbers to Metzo items.
- `compatibility_notes` (TEXT): For fitment details.

### 3.2 Backend Logic (Rust)
- **Migration System**: A robust `database::migrate()` function that runs on startup.
    - Check current schema version.
    - standard `ALTER TABLE` statements if columns missing.
    - Seeding of standard Enumerations for Part Types.
- **Struct Updates**: Update `Part` and `AddPartArgs` structs to reflect full schema.
- **Search Logic**: Update `find_matching_part` to partial-match against `manufacturer` and `part_number`.

### 3.3 Frontend UI (Leptos)
- **Inventory List**:
    - Add columns for `Type` and `Manufacturer`.
    - Color-coding for lifespan (e.g., Red for 3-day wear parts).
- **Add/Edit Form**: Update to include new fields.
- **Filters**: Filter by Manufacturer (Metzo/Linden) and Part Type (Upper/Lower).

## 4. Migration Strategy
1.  **Backup**: Command to backup `cimco_offline.db` before migration.
2.  **Schema Update**: Run SQL migration script.
3.  **Data Patch**: Update existing "Shredder Hammer" entries to `part_type='Hammer'`, `manufacturer='Metzo'`, `lifespan_estimate='3-5 days'`.
4.  **Verification**: Test CRUD operations and persistent data.

## 5. Future Scope (Cloud/Import)
- Implement Excel parser (using `calamine` crate or Python script) to bulk import the "metso shredder parts.xlsx".
- Cloud sync endpoint for grabbing larger datasets.

## 6. Success Metrics
- Application compiles and runs with new Schema.
- User can distinguish between a Metzo Hammer and a Linden Hammer.
- "Used 4 hammers" voice command correctly deducts the right stock.
