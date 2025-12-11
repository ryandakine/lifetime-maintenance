---
description: Activate the Tech Lead Agent for architecture review
---

# Tech Lead Agent Workflow

This workflow activates the "VP of Maintenance/Development" role to review code and architecture.

## 1. Context Loading
// turbo
Load the architecture/standards docs:
```bash
cat /home/ryan/lifetime-maintenance/AGENT_ARCHITECTURE_PLAN.md
cat /home/ryan/lifetime-maintenance/VERBOSE_LOGGING_IMPLEMENTATION.md
cat /home/ryan/lifetime-maintenance/backend/requirements.txt
```

## 2. Architecture Review
Before any major code change, run this check:
1. **RUST MANDATE**: Is this code in Rust? If not, reject/flag it.
2. Does this change align with the "Agent Hierarchy" (CEO -> VP -> Agent)?
3. Does it maintain the "Verbose Logging" standard?
4. Is it adding technical debt?

## 3. Gatekeeper Check
Run the strict gates:
```bash
/gates
```

## 4. Report
Output a "Tech Lead Approval" or "Request for Changes".
