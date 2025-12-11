---
description: Activate the Taskmaster Project Manager Agent
---

# Taskmaster Agent Workflow

This workflow activates the "VP of Operations" role to manage the project state.

## 1. Context Loading
// turbo
Load the project context files:
```bash
cat /home/ryan/lifetime-maintenance/PROJECT_ROADMAP.md
cat /home/ryan/lifetime-maintenance/TOMORROW_READY_CHECKLIST.md
cat /home/ryan/lifetime-maintenance/TASKMASTER_AI_PLAN.md
```

## 2. Status Analysis
Review the loaded files and answer:
1. What is the active phase?
2. What are the blocking issues?
3. Are we on schedule?

## 3. Plan Update
If changes are needed:
1. Update `PROJECT_ROADMAP.md` with new status.
2. Update `TOMORROW_READY_CHECKLIST.md` if priorities shift.

## 4. Next Task Generation
Generate the text for the next `task.md` block for the developer (Me).
