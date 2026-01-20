---
description: Update an existing project with the latest Antigravity rules, workflows, and templates without overwriting project-specific files.
---

# Short Code: /sync-project (or "sync-project")

**Trigger:** When user inputs `/sync-project` or says "sync-project" or "update project rules".

## Purpose
To update an **existing** Antigravity project with the latest rules, workflows, and templates from the startup repository, while **preserving** project-specific configurations.

## Pre-Conditions
1. Project has already been initialized with `init-project`.
2. `agent/` directory exists.
3. User has pulled the latest `startup` repository (`~/Documents/startup`).

## Sync Protocol

### Phase 1: Check Current State
1. Verify `agent/` directory exists. If not, suggest running `init-project` instead.
2. List current files in `agent/rules/`, `agent/workflow/`, `agent/memory/`.
3. Report to user: "Found existing project structure. Ready to sync."

### Phase 2: Update Rules (OVERWRITE)
// turbo
Copy updated rules from startup repository:
```bash
cp ~/Documents/startup/GEMINI.md ~/.gemini/GEMINI.md
```
> Note: `agent/rules/` are standard and SHOULD be overwritten to ensure latest standards.

### Phase 3: Update Workflows (OVERWRITE)
// turbo
Copy updated workflows:
```bash
# If .agent/workflows exists in startup, copy to project
cp -r ~/Documents/startup/.agent/workflows/* .agent/workflows/ 2>/dev/null || true
```

### Phase 4: Update Templates (CAREFUL MERGE)
These files should be **MERGED or ASKED**, not overwritten:
- `.cursorrules` → Ask user before overwriting.
- `agent.md` → **NEVER** overwrite. This is project-specific.
- `agent/memory/lessons.md` → **NEVER** overwrite. This contains project-specific learnings.

### Phase 5: Update Skills (OVERWRITE)
// turbo
Copy latest skills from startup repository:
```bash
cp -r ~/Documents/startup/skills/* ~/.gemini/antigravity/skills/
```

### Phase 6: Confirmation
Report to user:
- "✅ Global Rules synced (`~/.gemini/GEMINI.md`)"
- "✅ Workflows updated (`.agent/workflows/`)"
- "✅ Skills updated (`~/.gemini/antigravity/skills/`)"
- "⚠️ Preserved: `agent.md`, `agent/memory/lessons.md` (project-specific)"

## Anti-Patterns
- Do NOT overwrite `agent.md`.
- Do NOT overwrite `agent/memory/lessons.md`.
- Do NOT delete any existing files.
