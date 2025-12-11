#!/bin/bash
source "$HOME/.cargo/env"

# Check if cargo-tauri is installed
if ! command -v cargo-tauri &> /dev/null; then
    echo "Tauri CLI not found. Installing..."
    echo "Running: cargo install tauri-cli"
    cargo install tauri-cli
fi

echo "Starting Cimco Equipment Tracker (Rust Edition)..."
cargo tauri dev
