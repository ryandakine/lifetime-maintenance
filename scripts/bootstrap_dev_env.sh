#!/bin/bash
set -e

echo "🚀 Starting CIMCO Dev Environment Bootstrap..."

# 1. Update System & Install Dependencies (Ubuntu/Debian)
echo "📦 Installing System Dependencies..."
sudo apt-get update
sudo apt-get install -y build-essential curl wget libssl-dev libgtk-3-dev \
    libayatana-appindicator3-dev librsvg2-dev libwebkit2gtk-4.1-dev \
    llvm libclang-dev clang checkinstall

# 2. Install Rust
if ! command -v rustc &> /dev/null; then
    echo "🦀 Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    echo "✅ Rust is already installed."
fi

# 3. Add WASM Target
echo "🎯 Adding WASM target..."
rustup target add wasm32-unknown-unknown

# 4. Install Node.js (via NVM or direct)
if ! command -v npm &> /dev/null; then
    echo "🟢 Installing Node.js & NPM..."
    # Using specific setup for Ubuntu 24.04 compatibility
    sudo apt-get install -y nodejs npm
else
    echo "✅ Node.js is already installed."
fi

# 5. Install Tauri & Trunk Tools
echo "🛠️ Installing Cargo Tools (Trunk, Tauri-CLI)..."
cargo install trunk --locked
cargo install tauri-cli --locked

echo "✨ Environment Setup Complete! You are ready to run the app."
echo "To start: cd cimco && ./setup_styles.sh"
