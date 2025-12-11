#!/bin/bash
echo "Installing Tailwind..."
npm init -y
npm install -D tailwindcss
npx tailwindcss init

echo "Configuring Tailwind..."
cat > tailwind.config.js <<EOF
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: {
    files: ["*.html", "./src/**/*.rs"],
  },
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

echo "Creating Input CSS..."
mkdir -p input
cat > input/tailwind.css <<EOF
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
    background-color: #1a1a1a;
    color: #e0e0e0;
}
EOF

echo "Building CSS..."
npx tailwindcss -i ./input/tailwind.css -o ./style.css

echo "Done! Running app..."
./run.sh
