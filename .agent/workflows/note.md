---
description: Quick capture of discoveries and decisions
---

# Note Workflow

Quickly capture important discoveries, decisions, or context.

## Usage

When you discover something important or make a key decision, log it immediately.

## Commands

```bash
# Append note with timestamp
echo "$(date '+%Y-%m-%d %H:%M') - [YOUR NOTE HERE]" >> dev/workspace/context/notes.md
```

## Example

```markdown
2024-12-09 14:30 - Discovered that the API rate-limits at 100 req/min, not 1000
2024-12-09 15:45 - Decision: Using Redis for caching instead of in-memory
2024-12-09 16:20 - Bug found: edge case when user input contains unicode emojis
```

## Purpose

Creates a searchable log of important context that would otherwise be lost.
