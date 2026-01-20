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
STARTUP_AGENT_MD="$HOME/Documents/startup/agent.md"
STARTUP_AGENT_DIR="$HOME/Documents/startup/agent"

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
    
    STARTUP_GEMINI="$HOME/Documents/startup/GEMINI.md"
    if [ -f "$STARTUP_GEMINI" ]; then
        echo "📄 Copying GEMINI.md -> GEMINI.md..."
        cp "$STARTUP_GEMINI" "$GEMINI_DIR/GEMINI.md"
    else
        echo -e "${RED}❌ GEMINI.md not found in startup${NC}"
    fi

    # 2. Sync agent/ directory
    if [ -d "$STARTUP_AGENT_DIR" ]; then
        echo "📂 Syncing agent/ directory..."
        rm -rf "$GEMINI_DIR/agent" # Clean old
        cp -r "$STARTUP_AGENT_DIR" "$GEMINI_DIR/agent"
        
        if [ -d "$GEMINI_DIR/agent" ]; then
            echo -e "${GREEN}✅ Global Rules synced to ~/.gemini/${NC}"
            echo ""
            echo "Structure:"
            ls -F "$GEMINI_DIR" | grep "agent"
            head -5 "$GEMINI_DIR/GEMINI.md"
        else
            echo -e "${RED}❌ Failed to sync agent directory${NC}"
        fi
    else
        echo -e "${RED}❌ agent/ directory not found in startup${NC}"
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
    
    STARTUP_GEMINI="$HOME/Documents/startup/GEMINI.md"
    if [ -f "$STARTUP_GEMINI" ]; then
        echo "📄 Copying GEMINI.md -> GEMINI.md..."
        cp "$STARTUP_GEMINI" "$GEMINI_DIR/GEMINI.md"
    else
        echo -e "${RED}❌ GEMINI.md not found in startup${NC}"
    fi

    # 2. Sync agent/ directory
    if [ -d "$STARTUP_AGENT_DIR" ]; then
        echo "📂 Syncing agent/ directory..."
        rm -rf "$GEMINI_DIR/agent" # Clean old
        cp -r "$STARTUP_AGENT_DIR" "$GEMINI_DIR/agent"
        
        if [ -d "$GEMINI_DIR/agent" ]; then
            echo -e "${GREEN}✅ Global Rules restored${NC}"
        else
            echo -e "${RED}❌ Failed to sync agent directory${NC}"
        fi
    else
        echo -e "${RED}❌ agent/ directory not found in startup${NC}"
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
