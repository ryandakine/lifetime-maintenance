---
description: Execute a complex sub-task using a recursive agentic loop
---

# Sub-Agent Workflow

Use this workflow when a task is too complex for a single step but too small for a full project pivot. It treats the current task as a self-contained "sub-agent" mission.

## 1. Isoation Phase
Define the boundaries of this sub-mission.
- **Context**: specifically lists which files are relevant. ignore all others.
- **Goal**: Write a clear, 1-sentence goal for this sub-agent.

## 2. Recursive Planning
Create a temporary mini-plan in your scratchpad (not a file):
1. [ ] Analysis (Read specific files)
2. [ ] Implementation (The specific change)
3. [ ] Verification (The specific test)

## 3. Execution Loop
Execute the mini-plan.
- **Strict Focus**: Do NOT touch files outside the Context.
- **Atomic Verifiction**: verify ONLY this sub-feature.

## 4. Reintegration
Once verified:
1. Report success to the main thread.
2. Mark the parent task item as complete.
3. Clear mental context and resume main flow.
