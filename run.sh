#!/bin/bash
echo "🚀 Launching Cimco App..."
cd cimco || exit 1
# Execute the specific run script which handles tauri environment
./run.sh
