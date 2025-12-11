---
description: Quick workspace and project status overview
---

# Status Workflow

Get a quick overview of current state.

## Commands

```bash
echo "=== Workspace Status ===" && \
echo "Active files:" && find dev/workspace -type f | wc -l && \
echo "Git status:" && git status --short && \
echo "Recent commits:" && git log --oneline -5 && \
echo "Open tasks:" && grep -r "\- \[ \]" dev/workspace/context/*.md 2>/dev/null | wc -l
```

## Output

Shows:
- Number of active workspace files
- Git status (uncommitted changes)
- Recent commits
- Count of open tasks
