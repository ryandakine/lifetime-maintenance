# CIMCO Inventory Intelligence & Revenue Generation

## Objective
TRANSFORM the existing Rust/Tauri application into a "Reliability Intelligence Platform" to secure a $2,500 setup fee + $199/mo contract from CIMCO Recycling (User's Father) by Monday.

## Core Features (Completed/In-Progress)
1.  **Mass Data Ingestion:**
    *   Ingest 199 Lindemann Shredder parts (Done).
    *   Ingest A545 Infeed Project (27 Conveyors) (Done).
    *   Ingest C617 Conveyor Project (34 Sub-assemblies) (Done).
    *   Total Target: >1,000 Intelligence-Ready Parts.

2.  **Reliability Intelligence Engine:**
    *   **Wear Analysis:** Auto-tag parts (Hammers, Liners) with "High Wear" scores (Done).
    *   **Stock Optimization:** Calculate "Recommended Spares" based on installed population (e.g., 58 motors need 7 spares) (Done).
    *   **Criticality tagging:** Identify single points of failure.

3.  **Visual Command Center (The "Review" Feature):**
    *   **System Map:** A visual block diagram showing the health of every machine (A545, C617) based on spare parts availability. Red blocks = Risk.
    *   **Interactive Drill-down:** Click a block to see missing parts.

4.  **Deployment & Hardware:**
    *   **Web Hosting:** Deploy WASM/Server version to `inventory.osi-cyber.com` for instant mobile access.
    *   **QR Code System:** Generate printable bin labels linked to the app.

## Revenue Goals
*   Immediate: $2,500 Setup Fee (Covers Rent + OSI Startup).
*   Recurring: $199/mo Maintenance.

## Technical Constraints
*   Stack: Rust (Leptos) + Tauri + SQLite.
*   Timeline: Demo ready by Monday Morning.
