# Antigravity Global Rules

## ⚠️ IMPORTANT: Conversation Size Limit

> **Start a new chat when:**
> - Conversation exceeds 50 messages
> - Switching to a new, unrelated topic
> - Agent becomes slow or unresponsive
>
> **Why?** Large conversations are the primary cause of 413 errors and Agent termination.

## 🚀 Performance & Workflow

1. **Structured Prompts**: Use "Goal → Context → Constraint" structure for clarity.
2. **Mode Selection**: Use "Deep Think" for planning/architecture, "Turbo" for execution.
3. **Artifacts Over Chat**: Debug via artifacts and files, not endless chat loops.
4. **Context Hygiene**: Start fresh chats often — Agent has persistent memory across sessions.
5. **Iterative Refinement**: Start simple, then iterate based on outputs.

## ️ Prevention Protocols

1. **Fresh Chat Habit**: Start new chat every 30-50 messages or when switching topics.
2. **Project Hygiene**: Ensure workspace has valid `package.json` or `.git` root.
3. **Network Stability**: Use Cloudflare DNS (1.1.1.1) for stable connections.
4. **Cleanup**: Periodically run `find ~/.gemini -name "*.scratch" -delete`.

---

# 🛸 Factory Reset Guide

> **Purpose:** Complete reset to fix 413 errors, corruption, or critical issues.  
> **Safety:** Your project files (Documents) are untouched.

## 📋 Quick Reference

| Action | Command |
|:-------|:--------|
| **Full Reset + Restore** | `./antigravity_toolkit.sh full` ✅ RECOMMENDED |
| Factory Reset Only | `./antigravity_toolkit.sh factory` |
| Restore Rules | `./antigravity_toolkit.sh restore-rules` |
| Restore Brain | `./antigravity_toolkit.sh restore-brain` |

## 🔧 Usage

```bash
cd ~/Documents/antigravity_toolkit
./antigravity_toolkit.sh full
```

This will:
1. Factory reset (backup `~/.gemini` → `~/.gemini_OLD_*`)
2. Automatically restore Global Rules
3. Ready to start Antigravity!

## 🚨 Troubleshooting

| Issue | Solution |
|:------|:---------|
| 413 error | `./antigravity_toolkit.sh factory` |
| 413 returns after brain restore | Factory reset again, don't restore brain |
| Agent doesn't recognize Global Rules | Restart IDE after restore |
| Backup folder not found | `ls -la ~/.gemini_OLD_*` |

## 🧹 Cleanup (After 24-48 Hours)

```bash
rm -rf ~/.gemini_OLD_*
```

---

# 🤖 Agent Instructions

## Create Toolkit Script

> **Trigger**: User types *"create antigravity_toolkit.sh"* or similar request.

1. **Create directory** (if needed):

   ```bash
   mkdir -p ~/Documents/antigravity_toolkit
   ```

2. **Create file** `~/Documents/antigravity_toolkit/antigravity_toolkit.sh` from embedded script below.

3. **Make executable**:

   ```bash
   chmod +x ~/Documents/antigravity_toolkit/antigravity_toolkit.sh
   ```

4. **Notify user** that toolkit is ready.

## Sync Global Rules

> **Trigger**: User types *"sync GEMINI"* or *"update global rules"*.

**⚠️ ALWAYS Compare First!**

1. **Compare before replacing**:

   ```bash
   diff ~/Documents/startup/GEMINI.md ~/.gemini/GEMINI.md
   ```

   Or use `view_file` on both files and compare.

2. **Report differences**:
   - What will be added/removed/changed
   - Request approval before replacing

3. **Replace when approved**:

   ```bash
   cp ~/Documents/startup/GEMINI.md ~/.gemini/GEMINI.md
   ```

4. **Verify**:

   ```bash
   head -5 ~/.gemini/GEMINI.md
   ```

---

# 📦 Embedded Toolkit Script

> **For Agent**: When user requests toolkit creation, copy script below to create `.sh` file.

<details>
<summary>🔽 Click to expand: antigravity_toolkit.sh</summary>

```bash
#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# 🛸 ANTIGRAVITY TOOLKIT
# ═══════════════════════════════════════════════════════════════════════════
# Factory Reset, Backup & Restore operations.
# Usage: ./antigravity_toolkit.sh [command]
#
# Commands:
#   full          - Full reset: factory + auto restore rules (RECOMMENDED)
#   factory       - Factory reset only
#   restore-rules - Restore Global Rules from backup
#   restore-brain - Restore brain/conversations from backup
#   help          - Show this help
# ═══════════════════════════════════════════════════════════════════════════

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
GEMINI_DIR="$HOME/.gemini"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
STARTUP_GEMINI="$HOME/Documents/startup/GEMINI.md"

# ───────────────────────────────────────────────────────────────────────────
# Functions
# ───────────────────────────────────────────────────────────────────────────

show_help() {
    echo -e "${BLUE}🛸 Antigravity Toolkit${NC}"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo -e "  ${YELLOW}full${NC}          Full reset + restore rules (RECOMMENDED)"
    echo -e "  ${RED}factory${NC}       Factory reset only"
    echo -e "  ${GREEN}restore-rules${NC} Restore Global Rules"
    echo -e "  ${GREEN}restore-brain${NC} Restore brain/conversations"
    echo -e "  help          Show this help"
    echo ""
    echo "Quick Usage:"
    echo -e "  ${YELLOW}$0 full${NC}   # One command to reset and restore"
}

confirm() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    echo "Press CTRL+C within 5 seconds to cancel..."
    sleep 5
}

find_latest_backup() {
    LATEST=$(ls -td "$HOME"/.gemini_OLD_* 2>/dev/null | head -1)
    echo "$LATEST"
}

# ───────────────────────────────────────────────────────────────────────────
# FACTORY: Complete factory reset
# ───────────────────────────────────────────────────────────────────────────
cmd_factory() {
    echo -e "${RED}☢️  FACTORY RESET${NC}"
    confirm "This will COMPLETELY reset the Agent. All history will be moved to backup."
    echo ""
    
    echo "🔪 Closing Antigravity..."
    pkill -f "Antigravity" 2>/dev/null || true
    sleep 2
    
    BACKUP_NAME="$HOME/.gemini_OLD_$(date +%Y%m%d_%H%M%S)"
    
    echo "📦 Moving .gemini to $BACKUP_NAME..."
    mv "$GEMINI_DIR" "$BACKUP_NAME"
    
    echo ""
    echo -e "${GREEN}✅ Factory reset complete!${NC}"
    echo ""
    echo "👉 Next steps:"
    echo "   1. Restart Antigravity"
    echo "   2. Run: $0 restore-rules"
    echo "   3. (Optional) Run: $0 restore-brain"
}

# ───────────────────────────────────────────────────────────────────────────
# RESTORE-RULES: Restore Global Rules from startup/GEMINI.md
# ───────────────────────────────────────────────────────────────────────────
cmd_restore_rules() {
    echo -e "${GREEN}📋 RESTORE GLOBAL RULES${NC}"
    echo ""
    
    if [ ! -d "$GEMINI_DIR" ]; then
        echo "Creating $GEMINI_DIR..."
        mkdir -p "$GEMINI_DIR"
    fi
    
    if [ -f "$STARTUP_GEMINI" ]; then
        echo "📄 Copying from $STARTUP_GEMINI..."
        cp "$STARTUP_GEMINI" "$GEMINI_DIR/GEMINI.md"
        
        if [ -s "$GEMINI_DIR/GEMINI.md" ]; then
            echo -e "${GREEN}✅ Global Rules restored to ~/.gemini/GEMINI.md${NC}"
            echo ""
            echo "Preview:"
            head -5 "$GEMINI_DIR/GEMINI.md"
        else
            echo -e "${RED}❌ Failed to copy Global Rules${NC}"
        fi
    else
        echo -e "${RED}❌ Source file not found: $STARTUP_GEMINI${NC}"
    fi
}

# ───────────────────────────────────────────────────────────────────────────
# RESTORE-BRAIN: Restore brain from backup
# ───────────────────────────────────────────────────────────────────────────
cmd_restore_brain() {
    echo -e "${GREEN}🧠 RESTORE BRAIN${NC}"
    echo ""
    
    BACKUP=$(find_latest_backup)
    
    if [ -z "$BACKUP" ]; then
        echo -e "${RED}❌ No backup found!${NC}"
        echo "Looking for: ~/.gemini_OLD_*"
        exit 1
    fi
    
    echo "Found backup: $BACKUP"
    
    if [ -d "$BACKUP/antigravity" ]; then
        confirm "This will restore brain from: $BACKUP"
        echo ""
        
        echo "📦 Copying antigravity folder..."
        cp -r "$BACKUP/antigravity" "$GEMINI_DIR/antigravity"
        
        echo ""
        echo -e "${GREEN}✅ Brain restored!${NC}"
        du -sh "$GEMINI_DIR/antigravity" 2>/dev/null || true
    else
        echo -e "${RED}❌ No antigravity folder in backup${NC}"
    fi
}

# ───────────────────────────────────────────────────────────────────────────
# FULL: Complete reset + restore in one command
# ───────────────────────────────────────────────────────────────────────────
cmd_full() {
    echo -e "${YELLOW}🛸 FULL RESET + RESTORE${NC}"
    confirm "This will factory reset and restore Global Rules."
    echo ""
    
    echo "═══════════════════════════════════════════════════════════════════"
    echo -e "${RED}STEP 1: FACTORY RESET${NC}"
    echo "═══════════════════════════════════════════════════════════════════"
    
    pkill -f "Antigravity" 2>/dev/null || true
    sleep 2
    
    BACKUP_NAME="$HOME/.gemini_OLD_$(date +%Y%m%d_%H%M%S)"
    
    if [ -d "$GEMINI_DIR" ]; then
        echo "📦 Moving .gemini to $BACKUP_NAME..."
        mv "$GEMINI_DIR" "$BACKUP_NAME"
        echo -e "${GREEN}✅ Backup created${NC}"
    else
        echo "⚠️  No existing .gemini folder found"
    fi
    
    echo ""
    
    echo "═══════════════════════════════════════════════════════════════════"
    echo -e "${GREEN}STEP 2: RESTORE GLOBAL RULES${NC}"
    echo "═══════════════════════════════════════════════════════════════════"
    
    mkdir -p "$GEMINI_DIR"
    
    if [ -f "$STARTUP_GEMINI" ]; then
        echo "📄 Copying from $STARTUP_GEMINI..."
        cp "$STARTUP_GEMINI" "$GEMINI_DIR/GEMINI.md"
        
        if [ -s "$GEMINI_DIR/GEMINI.md" ]; then
            echo -e "${GREEN}✅ Global Rules restored${NC}"
        else
            echo -e "${RED}❌ Failed to copy Global Rules${NC}"
        fi
    else
        echo -e "${RED}❌ Source file not found: $STARTUP_GEMINI${NC}"
    fi
    
    echo ""
    echo "═══════════════════════════════════════════════════════════════════"
    echo -e "${GREEN}✅ COMPLETE!${NC}"
    echo "═══════════════════════════════════════════════════════════════════"
    echo ""
    echo "👉 Now:"
    echo "   1. Start Antigravity"
    echo "   2. (Optional) Run: $0 restore-brain"
}

# ───────────────────────────────────────────────────────────────────────────
# Main
# ───────────────────────────────────────────────────────────────────────────

case "${1:-help}" in
    full)          cmd_full ;;
    factory)       cmd_factory ;;
    restore-rules) cmd_restore_rules ;;
    restore-brain) cmd_restore_brain ;;
    *)             show_help ;;
esac
```

</details>

---

*🛸 Antigravity Toolkit v3.3*
