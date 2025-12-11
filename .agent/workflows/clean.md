---
description: Reset workspace for next task
---

# Clean Workflow

Clear workspace for fresh start on next task.

## Commands

```bash
# Regenerate tree first
mkdir -p dev/workspace/context
tree -I 'node_modules|.git|__pycache__|.venv|dist|build|.next|target' -L 3 --dirsfirst > dev/workspace/context/tree.md 2>/dev/null || find . -type f -not -path '*/node_modules/*' -not -path '*/.git/*' | head -100 > dev/workspace/context/tree.md
echo "Fresh tree generated"

# Confirm clean
echo "=== Workspace Reset ===" && find dev/workspace -type f | wc -l && echo "files remaining"
```

## What Gets Removed

- Old context files (PRDs, tasks, notes)
- Temporary code files
- Test outputs

## What Stays

- `dev/branches/` archives
- Git repository
- `node_modules/`, virtual envs
- Source code in main project

## When to Use

- Starting new feature
- After archiving completed work
- When workspace becomes cluttered
- Fresh sprint/iteration

## Safety

Always archive first if you might need the context later!
