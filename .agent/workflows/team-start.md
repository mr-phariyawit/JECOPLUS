---
description: Start a new AI Team session - reads history, plans tasks
---

# /team-start

## Steps

1. Read `.agent/memory/team-history.md` to understand current context
2. Identify: current feature, last checkpoint, blockers
3. Read current spec from `specs/features/` (if any)
4. Plan session: list tasks, assign to roles
5. Announce to user:
   ```
   🤖 Session started!
   
   📋 Current Feature: [feature_name]
   📊 Progress: [X]%
   🎯 Today's Goals:
   - [ ] Task 1
   - [ ] Task 2
   ```
6. Begin work on first task
