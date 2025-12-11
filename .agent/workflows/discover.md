---
description: Deep codebase exploration and analysis
---

# Discover Workflow

Explore and understand the codebase structure.

## Steps

1. Generate tree view
2. Identify key files (main entry points, configs)
3. Read core modules
4. Document architecture in `dev/workspace/context/discovery.md`

## Commands

```bash
# Find main entry points
find . -name "main.py" -o -name "index.js" -o -name "main.rs" -o -name "app.py" 2>/dev/null

# Find config files
find . -name "*.toml" -o -name "*.json" -o -name "*.yaml" -o -name "*.yml" -maxdepth 2 2>/dev/null

# Count lines by file type
find . -type f -name "*.py" -o -name "*.js" -o -name "*.rs" | xargs wc -l | sort -n
```

## Output

Discovery notes saved to `dev/workspace/context/discovery.md`
