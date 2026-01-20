---
description: End AI Team session - save progress to memory
---

# /team-end

## Steps

1. Summarize completed tasks
2. Note any blockers or pending items
3. Update `.agent/memory/team-history.md` with session summary:
   ```markdown
   ### Session [DATE]
   **Duration:** [time]
   **Tasks Completed:**
   - [x] Task 1
   - [x] Task 2
   
   **Blockers:** [if any]
   **Next Steps:** [what's next]
   ```
4. Announce to user:
   ```
   ✅ Session ended!
   
   📊 Progress: [X]%
   ✅ Completed: [N] tasks
   📝 Saved to: .agent/memory/team-history.md
   ```
