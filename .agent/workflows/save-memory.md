---
description: Manually save current artifacts to .memory folder
---

# Save Memory Workflow

Save current task artifacts to project's `.memory` folder for persistent local history.

## Steps

// turbo
1. Get timestamp:
```bash
TIMESTAMP=$(date +%y%m%d_%H%M)
echo "Timestamp: $TIMESTAMP"
```

2. Define task title (sanitized from TaskName):
```bash
TITLE="your_task_title_here"
```

// turbo
3. Create memory folder:
```bash
PROJECT_ROOT="/path/to/your/project"
mkdir -p "$PROJECT_ROOT/.memory/${TIMESTAMP}_${TITLE}"
```

// turbo
4. Copy artifacts from brain:
```bash
BRAIN_PATH="$HOME/.gemini/antigravity/brain/{session_id}"
cp "$BRAIN_PATH"/*.md "$PROJECT_ROOT/.memory/${TIMESTAMP}_${TITLE}/"
```

// turbo
5. Verify save:
```bash
ls -la "$PROJECT_ROOT/.memory/${TIMESTAMP}_${TITLE}/"
```

## Notes

- Replace `{session_id}` with actual brain session ID
- Replace `PROJECT_ROOT` with actual project path
- Title should be lowercase with underscores, max 50 chars
