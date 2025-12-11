---
description: Generate project structure tree for context
---

# Tree Workflow

Generate an up-to-date tree view of the project.

## Commands

```bash
mkdir -p dev/workspace/context
tree -I 'node_modules|.git|__pycache__|.venv|dist|build|.next|target|dev/branches' -L 4 --dirsfirst > dev/workspace/context/tree.md 2>/dev/null || find . -type f -not -path '*/node_modules/*' -not -path '*/.git/*' | head -200 | sort > dev/workspace/context/tree.md
echo "Tree generated at dev/workspace/context/tree.md"
```

## Output

Tree saved to `dev/workspace/context/tree.md` - reference throughout session.
