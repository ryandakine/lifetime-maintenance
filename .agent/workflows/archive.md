---
description: Archive completed work to dev/branches/
---

# Archive Workflow

Move completed work from workspace to permanent archive.

## Commands

```bash
# Create archive with timestamp
BRANCH_NAME="feature-$(date +%Y%m%d-%H%M%S)"
mkdir -p dev/branches/$BRANCH_NAME
cp -r dev/workspace/* dev/branches/$BRANCH_NAME/
echo "Archived to dev/branches/$BRANCH_NAME"
ls -la dev/branches/$BRANCH_NAME
```

## When to Archive

- Feature is complete and merged
- Sprint/iteration is done
- Before starting major refactor
- Want to preserve context before pivot

## Archive Structure

```
dev/branches/
├── feature-20241209-143022/
│   ├── context/
│   ├── code/
│   ├── tests/
│   └── docs/
└── feature-20241208-091544/
    └── ...
```

## Purpose

Preserves complete working context for future reference without cluttering active workspace.
