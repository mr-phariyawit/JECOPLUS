# Antigravity Global Rules

## ⚠️ IMPORTANT: Conversation Size Limit
> **สร้าง Chat ใหม่เมื่อ:**
> - Conversation ยาวเกิน 50 messages
> - พูดคุยหัวข้อใหม่ที่ไม่เกี่ยวข้องกับหัวข้อเดิม
> - Agent เริ่มตอบช้า หรือมีปัญหา
>
> **ทำไม?** Conversation ที่ใหญ่เกินไปเป็นสาเหตุหลักของ 413 error และ Agent terminated

## 🚀 Performance & Workflow
1.  **Vibe Coding**: Use "Goal -> Context -> Constraint" prompt structure.
2.  **Mode Selection**: Use "Deep Think" for planning, "Turbo" for execution.
3.  **Artifacts**: Debug via artifacts, not chat loops.
4.  **New Chat Often**: สร้าง Chat ใหม่บ่อยๆ — ไม่ต้องกลัวเสีย context, Agent มี memory

## 🚨 Emergency Protocols (Global Rules)

### 🔴 Global Rule #1: Agent Termination Protocol
**Trigger**: "Agent terminated", "Model provider overload", or 413 error.
**Resolution Steps:**

**Phase 0: Immediate Config Check (User Verification)**
1.  **HTTP Check**: Ensure **"HTTP Compatibility Mode"** is set to **"HTTP/1.1"** in IDE Settings > Network.
2.  **Resource Check**: Run `Developer: Open Process Explorer` and kill any high-RAM (>2GB) processes.

**Phase 1: Mitigation (Agent Actions)**
1.  **Downshift Model**: Switch models (High → Standard → Low).
2.  **DISABLE MCPs**: Temporarily disable **ALL** MCP servers. This is critical for 413 errors.
3.  **Context Cull**: Clear chat history or start a fresh session if context > 20k tokens.

**Phase 2: Hard Reset (If error persists)**
1.  **Close IDE**.
2.  **Run**: พิมพ์ *"สร้าง antigravity_toolkit.sh ให้หน่อย"* → Agent จะสร้าง script ให้
3.  **Execute**: `./antigravity_toolkit.sh full`
4.  **Restart IDE**.

### 🟠 Global Rule #2: Claude-MCP Conflict
If using Claude + MCP fails: **Disable ALL MCP servers** immediately. Retry one by one only if strictly necessary.

### 🟡 Global Rule #3: Token-Aware Context Hygiene
- **Strict Limit**: NEVER read files > 500 lines or > 50KB without checking first.
- **Pre-Check**: ALWAYS use `view_file_outline` or `du -h` before reading large files.
- **No Dumping**: Do not dump massive logs or `grep` output directly into chat. Pipe to a file and read snippets.

## 🛡️ Prevention Protocols
1.  **New Chat Habit**: สร้าง Chat ใหม่ทุก 30-50 messages หรือเมื่อเปลี่ยนหัวข้อ
2.  **Project Hygiene**: Ensure workspace has a valid `package.json` or `.git` root.
3.  **Network**: Use Cloudflare DNS (1.1.1.1) for connection stability.
4.  **Scratch Cleanup**: Periodically run `find ~/.gemini -name "*.scratch" -delete`.

---

# 🛸 Antigravity Factory Reset Guide

> **Purpose:** Complete reset to fix 413 errors, corruption, or critical issues.  
> **Safety:** Your project files (Documents) are untouched.

## 📋 Quick Reference

| Action | Command |
|:-------|:--------|
| **Full Reset + Restore** | `./antigravity_toolkit.sh full` ✅ RECOMMENDED |
| Factory Reset Only | `./antigravity_toolkit.sh factory` |
| Restore Rules | `./antigravity_toolkit.sh restore-rules` |
| Restore Brain | `./antigravity_toolkit.sh restore-brain` |

## 🚀 First Time Setup

> **หาก user ยังไม่มี `antigravity_toolkit.sh`** ให้ขอให้ Agent สร้างจาก embedded script ด้านล่าง

**ขั้นตอน:**
1. User พิมพ์: *"สร้าง antigravity_toolkit.sh ให้หน่อย"*
2. Agent จะสร้างไฟล์ `~/Documents/fix-model-selection/antigravity_toolkit.sh` จาก embedded script
3. ใช้งานได้ทันที

## 🔧 One Command Usage

```bash
cd ~/Documents/fix-model-selection
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

# 📦 Embedded Toolkit Script

> **สำหรับ Agent:** เมื่อ user ต้องการสร้าง toolkit ให้ copy script ด้านล่างไปสร้างเป็นไฟล์ `.sh`

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

# Global Rules Content (embedded)
GLOBAL_RULES_CONTENT='# Antigravity Global Rules

## ⚠️ IMPORTANT: Conversation Size Limit
> **สร้าง Chat ใหม่เมื่อ:**
> - Conversation ยาวเกิน 50 messages
> - พูดคุยหัวข้อใหม่ที่ไม่เกี่ยวข้องกับหัวข้อเดิม
> - Agent เริ่มตอบช้า หรือมีปัญหา
>
> **ทำไม?** Conversation ที่ใหญ่เกินไปเป็นสาเหตุหลักของ 413 error และ Agent terminated

## 🚀 Performance & Workflow
1.  **Vibe Coding**: Use "Goal -> Context -> Constraint" prompt structure.
2.  **Mode Selection**: Use "Deep Think" for planning, "Turbo" for execution.
3.  **Artifacts**: Debug via artifacts, not chat loops.
4.  **New Chat Often**: สร้าง Chat ใหม่บ่อยๆ — ไม่ต้องกลัวเสีย context, Agent มี memory

## 🚨 Emergency Protocols (Global Rules)

### 🔴 Global Rule #1: Agent Termination Protocol
**Trigger**: "Agent terminated", "Model provider overload", or 413 error.
**Resolution Steps:**

**Phase 0: Immediate Config Check (User Verification)**
1.  **HTTP Check**: Ensure **"HTTP Compatibility Mode"** is set to **"HTTP/1.1"** in IDE Settings > Network.
2.  **Resource Check**: Run `Developer: Open Process Explorer` and kill any high-RAM (>2GB) processes.

**Phase 1: Mitigation (Agent Actions)**
1.  **Downshift Model**: Switch models (High → Standard → Low).
2.  **DISABLE MCPs**: Temporarily disable **ALL** MCP servers. This is critical for 413 errors.
3.  **Context Cull**: Clear chat history or start a fresh session if context > 20k tokens.

**Phase 2: Hard Reset (If error persists)**
1.  **Close IDE**.
2.  **Run**: พิมพ์ *"สร้าง antigravity_toolkit.sh ให้หน่อย"* → Agent จะสร้าง script ให้
3.  **Execute**: `./antigravity_toolkit.sh full`
4.  **Restart IDE**.

### 🟠 Global Rule #2: Claude-MCP Conflict
If using Claude + MCP fails: **Disable ALL MCP servers** immediately. Retry one by one only if strictly necessary.

### 🟡 Global Rule #3: Token-Aware Context Hygiene
- **Strict Limit**: NEVER read files > 500 lines or > 50KB without checking first.
- **Pre-Check**: ALWAYS use `view_file_outline` or `du -h` before reading large files.
- **No Dumping**: Do not dump massive logs or `grep` output directly into chat. Pipe to a file and read snippets.

## 🛡️ Prevention Protocols
1.  **New Chat Habit**: สร้าง Chat ใหม่ทุก 30-50 messages หรือเมื่อเปลี่ยนหัวข้อ
2.  **Project Hygiene**: Ensure workspace has a valid `package.json` or `.git` root.
3.  **Network**: Use Cloudflare DNS (1.1.1.1) for connection stability.
4.  **Scratch Cleanup**: Periodically run `find ~/.gemini -name "*.scratch" -delete`.
'

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
# RESTORE-RULES: Restore Global Rules (from embedded content)
# ───────────────────────────────────────────────────────────────────────────
cmd_restore_rules() {
    echo -e "${GREEN}📋 RESTORE GLOBAL RULES${NC}"
    echo ""
    
    if [ ! -d "$GEMINI_DIR" ]; then
        echo "Creating $GEMINI_DIR..."
        mkdir -p "$GEMINI_DIR"
    fi
    
    echo "📄 Writing embedded Global Rules..."
    echo "$GLOBAL_RULES_CONTENT" > "$GEMINI_DIR/GEMINI.md"
    
    if [ -s "$GEMINI_DIR/GEMINI.md" ]; then
        echo -e "${GREEN}✅ Global Rules restored to ~/.gemini/GEMINI.md${NC}"
        echo ""
        echo "Preview:"
        head -5 "$GEMINI_DIR/GEMINI.md"
    else
        echo -e "${RED}❌ Failed to write Global Rules${NC}"
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
    
    echo "📄 Writing embedded Global Rules..."
    echo "$GLOBAL_RULES_CONTENT" > "$GEMINI_DIR/GEMINI.md"
    
    if [ -s "$GEMINI_DIR/GEMINI.md" ]; then
        echo -e "${GREEN}✅ Global Rules restored${NC}"
    else
        echo -e "${RED}❌ Failed to write Global Rules${NC}"
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

## 🤖 Agent Instructions: Create Toolkit Script

> **เมื่อ user ขอสร้าง toolkit** ให้ทำตามขั้นตอนนี้:

1. **สร้าง directory** (ถ้ายังไม่มี):
   ```bash
   mkdir -p ~/Documents/fix-model-selection
   ```

2. **สร้างไฟล์** `~/Documents/fix-model-selection/antigravity_toolkit.sh` จาก embedded script ด้านบน

3. **ให้สิทธิ์ execute**:
   ```bash
   chmod +x ~/Documents/fix-model-selection/antigravity_toolkit.sh
   ```

4. **แจ้ง user** ว่าพร้อมใช้งาน

---

## 🔄 Agent Instructions: Sync Global Rules

> **เมื่อ user ต้องการ sync GEMINI.md ไปยัง ~/.gemini/** ให้ทำตามขั้นตอนนี้:

### ⚠️ ALWAYS Compare First!

1. **Compare ก่อนทุกครั้ง**:
   ```bash
   diff ~/Documents/startup/GEMINI.md ~/.gemini/GEMINI.md
   ```
   หรือใช้ `view_file` ทั้ง 2 ไฟล์แล้วเทียบ

2. **แจ้ง user ถึงความแตกต่าง**:
   - อะไรจะถูกเพิ่ม/ลบ/เปลี่ยน
   - ขอ approval ก่อน replace

3. **Replace เมื่อ user approve**:
   ```bash
   cp ~/Documents/startup/GEMINI.md ~/.gemini/GEMINI.md
   ```

4. **Verify**:
   ```bash
   head -5 ~/.gemini/GEMINI.md
   ```

### 📋 Quick Sync Command (User Request)

เมื่อ user พิมพ์: *"sync GEMINI"* หรือ *"update global rules"*
→ Agent ต้อง **compare ก่อนเสมอ** แล้วแสดง diff ให้ user เห็นก่อน replace

---

*🛸 Antigravity Unified Rules & Toolkit v3.0*
