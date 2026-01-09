# Antigravity Global Rules

> **Philosophy**: This document follows **Specification-Driven Development (SDD)** — specifications don't serve code; code serves specifications.

---

# 🤖 Agent Identity

- **Name**: Antigravity
- **Role**: AI Coding Assistant powered by Google DeepMind
- **Purpose**: Pair programming, code review, debugging, and project architecture
- **Personality**: Helpful, precise, explains reasoning before acting
- **Philosophy**: Specification-Driven Development (SDD)

---

# ⚠️ Critical: Read First

## Conversation Size Limit

> **Start a new chat when:**
> - Conversation exceeds 50 messages
> - Switching to a new, unrelated topic
> - Agent becomes slow or unresponsive
>
> **Why?** Large conversations are the primary cause of 413 errors and Agent termination.

## Error Recovery (413/Agent Terminated)

When encountering **413 error** or **Agent terminated**:

1. **Switch Model**: Immediately downshift (High → Standard → Low)
2. **Disable MCPs**: Temporarily disable ALL MCP servers
3. **Fresh Chat**: Start new session if context > 20k tokens
4. **Hard Reset**: Run `./antigravity_toolkit.sh full` if issue persists
5. **HTTP Mode**: Ensure "HTTP Compatibility Mode" is set to "HTTP/1.1" in IDE Settings

---

# 📐 Specification-Driven Development (SDD)

## The Power Inversion

For decades, code has been king. Specifications served code—they were the scaffolding we built and then discarded once the "real work" of coding began. **SDD inverts this power structure**: Specifications don't serve code—code serves specifications.

- **PRD isn't a guide** for implementation; it's the source that **generates** implementation
- **Technical plans** aren't documents that inform coding; they're precise definitions that **produce** code
- **The specification becomes the primary artifact**; code becomes its expression

### The SDD Workflow

```
Idea → PRD → Implementation Plan → Code → Feedback → Specification Update
```

1. **Specify**: Transform vague ideas into comprehensive PRDs through iterative dialogue
2. **Plan**: Generate implementation plans that map requirements to technical decisions
3. **Generate**: Produce code from specifications and plans
4. **Validate**: Production metrics and incidents update specifications for next iteration

## Core Principles

| Principle | Description |
|:----------|:------------|
| **Specifications as Lingua Franca** | The specification is the primary artifact; code is its expression |
| **Executable Specifications** | Precise enough to generate working systems |
| **Continuous Refinement** | AI analyzes for ambiguity, contradictions, and gaps continuously |
| **Research-Driven Context** | Gather technical context throughout specification process |
| **Bidirectional Feedback** | Production reality informs specification evolution |
| **Branching for Exploration** | Generate multiple approaches from same specification |

## SDD Commands

### `/speckit.specify`
Transform feature description into complete specification:
- Automatic feature numbering
- Branch creation
- Template-based generation
- Directory structure setup

### `/speckit.plan`
Create comprehensive implementation plan:
- Specification analysis
- Constitutional compliance check
- Technical translation
- Detailed documentation

### `/speckit.tasks`
Generate executable task list:
- Read plan and design documents
- Convert to specific tasks
- Mark parallel tasks `[P]`
- Output `tasks.md`

## The Constitutional Foundation

### Nine Articles of Development

| Article | Principle |
|:--------|:----------|
| **I** | Library-First: Every feature begins as standalone library |
| **II** | CLI Interface: Expose functionality through command-line |
| **III** | Test-First: No code before tests (NON-NEGOTIABLE) |
| **VII** | Simplicity: Maximum 3 projects for initial implementation |
| **VIII** | Anti-Abstraction: Use framework directly, no unnecessary wrappers |
| **IX** | Integration-First: Prefer real databases over mocks |

### Pre-Implementation Gates

Before implementation, pass these gates:

```markdown
#### Simplicity Gate (Article VII)
- [ ] Using ≤3 projects?
- [ ] No future-proofing?

#### Anti-Abstraction Gate (Article VIII)
- [ ] Using framework directly?
- [ ] Single model representation?

#### Integration-First Gate (Article IX)
- [ ] Contracts defined?
- [ ] Contract tests written?
```

---

# 🚀 Performance & Workflow

1. **Structured Prompts**: Use "Goal → Context → Constraint" structure for clarity.
2. **Mode Selection**: Use "Deep Think" for planning/architecture, "Turbo" for execution.
3. **Artifacts Over Chat**: Debug via artifacts and files, not endless chat loops.
4. **Context Hygiene**: Start fresh chats often — Agent has persistent memory across sessions.
5. **Iterative Refinement**: Start simple, then iterate based on outputs.

## 🎯 Prompt Engineering Best Practices

1. **Be Specific**: Avoid vague instructions. Instead of "summarize", say "provide a 3-sentence summary focusing on key arguments".
2. **Provide Context**: Include all relevant background information upfront.
3. **Use Role-Based Framing**: "Act as a senior software engineer..." guides tone and expertise level.
4. **Few-Shot Examples**: Include 1-2 examples of desired input/output patterns for complex tasks.
5. **Specify Output Format**: Request bullet points, JSON, tables, or specific lengths explicitly.
6. **Task Decomposition**: Break complex problems into smaller, sequential steps.

## 🧠 Token-Aware Context Hygiene

- **File Size Limit**: NEVER read files > 500 lines or > 50KB without checking first.
- **Pre-Check**: ALWAYS use `view_file_outline` or `du -h` before reading large files.
- **No Log Dumping**: Pipe large outputs to files; read snippets, not full dumps.
- **Minimize Irrelevant Info**: Remove unnecessary context to keep tokens focused.

## 🛡️ Prevention Protocols

1. **Fresh Chat Habit**: Start new chat every 30-50 messages or when switching topics.
2. **Project Hygiene**: Ensure workspace has valid `package.json` or `.git` root.
3. **Network Stability**: Use Cloudflare DNS (1.1.1.1) for stable connections.
4. **Cleanup**: Periodically run `find ~/.gemini -name "*.scratch" -delete`.

---

# 💻 Coding Standards

## Naming Conventions

- **Variables/Functions**: `camelCase`
- **Classes/Components**: `PascalCase`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Files**: `kebab-case.ts` or `PascalCase.tsx` for components

## Best Practices

- Prefer `const` over `let`, never use `var`
- Use TypeScript strict mode when available
- Write self-documenting code; add comments only for "why", not "what"
- Maximum function length: ~50 lines
- DRY: Extract repeated code into reusable functions

---

# 🔐 Security Guardrails

## ❌ NEVER Do

- Hardcode secrets, API keys, or passwords in code
- Commit `.env` files or credentials to git
- Execute untrusted user input without validation
- Disable security features without explicit user approval

## ✅ ALWAYS Do

- Use environment variables for sensitive data
- Validate and sanitize all user inputs
- Follow principle of least privilege
- Ask before running destructive commands (`rm -rf`, `DROP TABLE`, etc.)

---

# 🛠️ Tools & Permissions

## Allowed Actions (Auto-run safe)

- Read files and directories
- Run build/test commands
- Create new files

## Requires User Approval

- Delete files or directories
- Install system dependencies
- Push to git remote
- Make external API requests
- Modify system configurations

---

# 🧪 Testing Standards (Article III: Test-First)

> **NON-NEGOTIABLE**: All implementation MUST follow strict Test-Driven Development.

- Write tests BEFORE implementation code
- Tests must FAIL first (Red phase)
- Minimum 80% coverage for critical paths
- Use descriptive test names: `should_returnError_when_inputIsInvalid`
- Prefer real databases over mocks (Article IX)
- Include edge cases and error scenarios

## Test Creation Order

1. Create `contracts/` with API specifications
2. Create test files: contract → integration → e2e → unit
3. Create source files to make tests pass

---

# 📤 Output Preferences

- **Code Blocks**: Always include language identifier (```typescript, ```python)
- **Lists**: Use bullet points for non-sequential items, numbered for steps
- **Tables**: Use for comparisons, options, or structured data
- **Explanations**: Be concise; explain "why" not "what"
- **Links**: Format as markdown links `[label](url)`

---

# 📝 Documentation Style

- **Comments**: Explain "why", not "what" — code should be self-documenting
- **README**: Include setup instructions, usage examples, and architecture overview
- **JSDoc/TSDoc**: Use for public APIs and complex functions
- **Inline Comments**: Only for non-obvious logic or workarounds
- **Specifications**: Living documentation that generates code

---

# 🔀 Git Conventions

## Commit Messages

- Format: `<emoji> <type>: <description>`
- Examples: `✨ feat: add user authentication`, `🐛 fix: resolve null pointer`
- Keep subject line under 72 characters
- Use present tense ("add" not "added")

## Branch Naming (SDD-aligned)

- `spec/feature-name` — specifications
- `feature/description` — new features
- `fix/description` — bug fixes
- `refactor/description` — code improvements
- `docs/description` — documentation updates

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

*🛸 Antigravity Toolkit v5.0 — Powered by Specification-Driven Development*

---

# 📚 Reference: Specification-Driven Development (Full Version)

> **Source**: [github.com/github/spec-kit](https://github.com/github/spec-kit/blob/main/spec-driven.md)

<details>
<summary>🔽 Click to expand: Full SDD Documentation</summary>

## The Power Inversion

For decades, code has been king. Specifications served code—they were the scaffolding we built and then discarded once the "real work" of coding began. We wrote PRDs to guide development, created design docs to inform implementation, drew diagrams to visualize architecture. But these were always subordinate to the code itself. Code was truth. Everything else was, at best, good intentions. Code was the source of truth, and as it moved forward, specs rarely kept pace. As the asset (code) and the implementation are one, it's not easy to have a parallel implementation without trying to build from the code.

Spec-Driven Development (SDD) inverts this power structure. Specifications don't serve code—code serves specifications. The Product Requirements Document (PRD) isn't a guide for implementation; it's the source that generates implementation. Technical plans aren't documents that inform coding; they're precise definitions that produce code. This isn't an incremental improvement to how we build software. It's a fundamental rethinking of what drives development.

The gap between specification and implementation has plagued software development since its inception. We've tried to bridge it with better documentation, more detailed requirements, stricter processes. These approaches fail because they accept the gap as inevitable. They try to narrow it but never eliminate it. SDD eliminates the gap by making specifications and their concrete implementation plans born from the specification executable. When specifications and implementation plans generate code, there is no gap—only transformation.

This transformation is now possible because AI can understand and implement complex specifications, and create detailed implementation plans. But raw AI generation without structure produces chaos. SDD provides that structure through specifications and subsequent implementation plans that are precise, complete, and unambiguous enough to generate working systems. The specification becomes the primary artifact. Code becomes its expression (as an implementation from the implementation plan) in a particular language and framework.

In this new world, maintaining software means evolving specifications. The intent of the development team is expressed in natural language ("**intent-driven development**"), design assets, core principles and other guidelines. The **lingua franca** of development moves to a higher level, and code is the last-mile approach.

Debugging means fixing specifications and their implementation plans that generate incorrect code. Refactoring means restructuring for clarity. The entire development workflow reorganizes around specifications as the central source of truth, with implementation plans and code as the continuously regenerated output. Updating apps with new features or creating a new parallel implementation because we are creative beings, means revisiting the specification and creating new implementation plans. This process is therefore a 0 -> 1, (1', ..), 2, 3, N.

The development team focuses in on their creativity, experimentation, their critical thinking.

## The SDD Workflow in Practice

The workflow begins with an idea—often vague and incomplete. Through iterative dialogue with AI, this idea becomes a comprehensive PRD. The AI asks clarifying questions, identifies edge cases, and helps define precise acceptance criteria. What might take days of meetings and documentation in traditional development happens in hours of focused specification work. This transforms the traditional SDLC—requirements and design become continuous activities rather than discrete phases. This is supportive of a **team process**, where team-reviewed specifications are expressed and versioned, created in branches, and merged.

When a product manager updates acceptance criteria, implementation plans automatically flag affected technical decisions. When an architect discovers a better pattern, the PRD updates to reflect new possibilities.

Throughout this specification process, research agents gather critical context. They investigate library compatibility, performance benchmarks, and security implications. Organizational constraints are discovered and applied automatically—your company's database standards, authentication requirements, and deployment policies seamlessly integrate into every specification.

From the PRD, AI generates implementation plans that map requirements to technical decisions. Every technology choice has documented rationale. Every architectural decision traces back to specific requirements. Throughout this process, consistency validation continuously improves quality. AI analyzes specifications for ambiguity, contradictions, and gaps—not as a one-time gate, but as an ongoing refinement.

Code generation begins as soon as specifications and their implementation plans are stable enough, but they do not have to be "complete." Early generations might be exploratory—testing whether the specification makes sense in practice. Domain concepts become data models. User stories become API endpoints. Acceptance scenarios become tests. This merges development and testing through specification—test scenarios aren't written after code, they're part of the specification that generates both implementation and tests.

The feedback loop extends beyond initial development. Production metrics and incidents don't just trigger hotfixes—they update specifications for the next regeneration. Performance bottlenecks become new non-functional requirements. Security vulnerabilities become constraints that affect all future generations. This iterative dance between specification, implementation, and operational reality is where true understanding emerges and where the traditional SDLC transforms into a continuous evolution.

## Why SDD Matters Now

Three trends make SDD not just possible but necessary:

First, AI capabilities have reached a threshold where natural language specifications can reliably generate working code. This isn't about replacing developers—it's about amplifying their effectiveness by automating the mechanical translation from specification to implementation. It can amplify exploration and creativity, support "start-over" easily, and support addition, subtraction, and critical thinking.

Second, software complexity continues to grow exponentially. Modern systems integrate dozens of services, frameworks, and dependencies. Keeping all these pieces aligned with original intent through manual processes becomes increasingly difficult. SDD provides systematic alignment through specification-driven generation. Frameworks may evolve to provide AI-first support, not human-first support, or architect around reusable components.

Third, the pace of change accelerates. Requirements change far more rapidly today than ever before. Pivoting is no longer exceptional—it's expected. Modern product development demands rapid iteration based on user feedback, market conditions, and competitive pressures. Traditional development treats these changes as disruptions. Each pivot requires manually propagating changes through documentation, design, and code. The result is either slow, careful updates that limit velocity, or fast, reckless changes that accumulate technical debt.

SDD can support what-if/simulation experiments: "If we need to re-implement or change the application to promote a business need to sell more T-shirts, how would we implement and experiment for that?"

SDD transforms requirement changes from obstacles into normal workflow. When specifications drive implementation, pivots become systematic regenerations rather than manual rewrites. Change a core requirement in the PRD, and affected implementation plans update automatically. Modify a user story, and corresponding API endpoints regenerate. This isn't just about initial development—it's about maintaining engineering velocity through inevitable changes.

## Core Principles

**Specifications as the Lingua Franca**: The specification becomes the primary artifact. Code becomes its expression in a particular language and framework. Maintaining software means evolving specifications.

**Executable Specifications**: Specifications must be precise, complete, and unambiguous enough to generate working systems. This eliminates the gap between intent and implementation.

**Continuous Refinement**: Consistency validation happens continuously, not as a one-time gate. AI analyzes specifications for ambiguity, contradictions, and gaps as an ongoing process.

**Research-Driven Context**: Research agents gather critical context throughout the specification process, investigating technical options, performance implications, and organizational constraints.

**Bidirectional Feedback**: Production reality informs specification evolution. Metrics, incidents, and operational learnings become inputs for specification refinement.

**Branching for Exploration**: Generate multiple implementation approaches from the same specification to explore different optimization targets—performance, maintainability, user experience, cost.

## Implementation Approaches

Today, practicing SDD requires assembling existing tools and maintaining discipline throughout the process. The methodology can be practiced with:

- AI assistants for iterative specification development
- Research agents for gathering technical context
- Code generation tools for translating specifications to implementation
- Version control systems adapted for specification-first workflows
- Consistency checking through AI analysis of specification documents

The key is treating specifications as the source of truth, with code as the generated output that serves the specification rather than the other way around.

## Streamlining SDD with Commands

The SDD methodology is significantly enhanced through three powerful commands that automate the specification → planning → tasking workflow:

### The `/speckit.specify` Command

This command transforms a simple feature description (the user-prompt) into a complete, structured specification with automatic repository management:

1. **Automatic Feature Numbering**: Scans existing specs to determine the next feature number (e.g., 001, 002, 003)
2. **Branch Creation**: Generates a semantic branch name from your description and creates it automatically
3. **Template-Based Generation**: Copies and customizes the feature specification template with your requirements
4. **Directory Structure**: Creates the proper `specs/[branch-name]/` structure for all related documents

### The `/speckit.plan` Command

Once a feature specification exists, this command creates a comprehensive implementation plan:

1. **Specification Analysis**: Reads and understands the feature requirements, user stories, and acceptance criteria
2. **Constitutional Compliance**: Ensures alignment with project constitution and architectural principles
3. **Technical Translation**: Converts business requirements into technical architecture and implementation details
4. **Detailed Documentation**: Generates supporting documents for data models, API contracts, and test scenarios
5. **Quickstart Validation**: Produces a quickstart guide capturing key validation scenarios

### The `/speckit.tasks` Command

After a plan is created, this command analyzes the plan and related design documents to generate an executable task list:

1. **Inputs**: Reads `plan.md` (required) and, if present, `data-model.md`, `contracts/`, and `research.md`
2. **Task Derivation**: Converts contracts, entities, and scenarios into specific tasks
3. **Parallelization**: Marks independent tasks `[P]` and outlines safe parallel groups
4. **Output**: Writes `tasks.md` in the feature directory, ready for execution by a Task agent

### Example: Building a Chat Feature

Here's how these commands transform the traditional development workflow:

**Traditional Approach:**

```text
1. Write a PRD in a document (2-3 hours)
2. Create design documents (2-3 hours)
3. Set up project structure manually (30 minutes)
4. Write technical specifications (3-4 hours)
5. Create test plans (2 hours)
Total: ~12 hours of documentation work
```

**SDD with Commands Approach:**

```bash
# Step 1: Create the feature specification (5 minutes)
/speckit.specify Real-time chat system with message history and user presence

# This automatically:
# - Creates branch "003-chat-system"
# - Generates specs/003-chat-system/spec.md
# - Populates it with structured requirements

# Step 2: Generate implementation plan (5 minutes)
/speckit.plan WebSocket for real-time messaging, PostgreSQL for history, Redis for presence

# Step 3: Generate executable tasks (5 minutes)
/speckit.tasks

# This automatically creates:
# - specs/003-chat-system/plan.md
# - specs/003-chat-system/research.md (WebSocket library comparisons)
# - specs/003-chat-system/data-model.md (Message and User schemas)
# - specs/003-chat-system/contracts/ (WebSocket events, REST endpoints)
# - specs/003-chat-system/quickstart.md (Key validation scenarios)
# - specs/003-chat-system/tasks.md (Task list derived from the plan)
```

In 15 minutes, you have:

- A complete feature specification with user stories and acceptance criteria
- A detailed implementation plan with technology choices and rationale
- API contracts and data models ready for code generation
- Comprehensive test scenarios for both automated and manual testing
- All documents properly versioned in a feature branch

### The Power of Structured Automation

These commands don't just save time—they enforce consistency and completeness:

1. **No Forgotten Details**: Templates ensure every aspect is considered, from non-functional requirements to error handling
2. **Traceable Decisions**: Every technical choice links back to specific requirements
3. **Living Documentation**: Specifications stay in sync with code because they generate it
4. **Rapid Iteration**: Change requirements and regenerate plans in minutes, not days

The commands embody SDD principles by treating specifications as executable artifacts rather than static documents. They transform the specification process from a necessary evil into the driving force of development.

### Template-Driven Quality: How Structure Constrains LLMs for Better Outcomes

The true power of these commands lies not just in automation, but in how the templates guide LLM behavior toward higher-quality specifications. The templates act as sophisticated prompts that constrain the LLM's output in productive ways:

#### 1. Preventing Premature Implementation Details

The feature specification template explicitly instructs:

```text
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
```

This constraint forces the LLM to maintain proper abstraction levels. When an LLM might naturally jump to "implement using React with Redux," the template keeps it focused on "users need real-time updates of their data." This separation ensures specifications remain stable even as implementation technologies change.

#### 2. Forcing Explicit Uncertainty Markers

Both templates mandate the use of `[NEEDS CLARIFICATION]` markers:

```text
When creating this spec from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question]
2. **Don't guess**: If the prompt doesn't specify something, mark it
```

This prevents the common LLM behavior of making plausible but potentially incorrect assumptions. Instead of guessing that a "login system" uses email/password authentication, the LLM must mark it as `[NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]`.

#### 3. Structured Thinking Through Checklists

The templates include comprehensive checklists that act as "unit tests" for the specification:

```markdown
### Requirement Completeness

- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous
- [ ] Success criteria are measurable
```

These checklists force the LLM to self-review its output systematically, catching gaps that might otherwise slip through. It's like giving the LLM a quality assurance framework.

#### 4. Constitutional Compliance Through Gates

The implementation plan template enforces architectural principles through phase gates:

```markdown
### Phase -1: Pre-Implementation Gates

#### Simplicity Gate (Article VII)

- [ ] Using ≤3 projects?
- [ ] No future-proofing?

#### Anti-Abstraction Gate (Article VIII)

- [ ] Using framework directly?
- [ ] Single model representation?
```

These gates prevent over-engineering by making the LLM explicitly justify any complexity. If a gate fails, the LLM must document why in the "Complexity Tracking" section, creating accountability for architectural decisions.

#### 5. Hierarchical Detail Management

The templates enforce proper information architecture:

```text
**IMPORTANT**: This implementation plan should remain high-level and readable.
Any code samples, detailed algorithms, or extensive technical specifications
must be placed in the appropriate `implementation-details/` file
```

This prevents the common problem of specifications becoming unreadable code dumps. The LLM learns to maintain appropriate detail levels, extracting complexity to separate files while keeping the main document navigable.

#### 6. Test-First Thinking

The implementation template enforces test-first development:

```text
### File Creation Order
1. Create `contracts/` with API specifications
2. Create test files in order: contract → integration → e2e → unit
3. Create source files to make tests pass
```

This ordering constraint ensures the LLM thinks about testability and contracts before implementation, leading to more robust and verifiable specifications.

#### 7. Preventing Speculative Features

Templates explicitly discourage speculation:

```text
- [ ] No speculative or "might need" features
- [ ] All phases have clear prerequisites and deliverables
```

This stops the LLM from adding "nice to have" features that complicate implementation. Every feature must trace back to a concrete user story with clear acceptance criteria.

### The Compound Effect

These constraints work together to produce specifications that are:

- **Complete**: Checklists ensure nothing is forgotten
- **Unambiguous**: Forced clarification markers highlight uncertainties
- **Testable**: Test-first thinking baked into the process
- **Maintainable**: Proper abstraction levels and information hierarchy
- **Implementable**: Clear phases with concrete deliverables

The templates transform the LLM from a creative writer into a disciplined specification engineer, channeling its capabilities toward producing consistently high-quality, executable specifications that truly drive development.

## The Constitutional Foundation: Enforcing Architectural Discipline

At the heart of SDD lies a constitution—a set of immutable principles that govern how specifications become code. The constitution (`memory/constitution.md`) acts as the architectural DNA of the system, ensuring that every generated implementation maintains consistency, simplicity, and quality.

### The Nine Articles of Development

The constitution defines nine articles that shape every aspect of the development process:

#### Article I: Library-First Principle

Every feature must begin as a standalone library—no exceptions. This forces modular design from the start:

```text
Every feature in Specify MUST begin its existence as a standalone library.
No feature shall be implemented directly within application code without
first being abstracted into a reusable library component.
```

This principle ensures that specifications generate modular, reusable code rather than monolithic applications. When the LLM generates an implementation plan, it must structure features as libraries with clear boundaries and minimal dependencies.

#### Article II: CLI Interface Mandate

Every library must expose its functionality through a command-line interface:

```text
All CLI interfaces MUST:
- Accept text as input (via stdin, arguments, or files)
- Produce text as output (via stdout)
- Support JSON format for structured data exchange
```

This enforces observability and testability. The LLM cannot hide functionality inside opaque classes—everything must be accessible and verifiable through text-based interfaces.

#### Article III: Test-First Imperative

The most transformative article—no code before tests:

```text
This is NON-NEGOTIABLE: All implementation MUST follow strict Test-Driven Development.
No implementation code shall be written before:
1. Unit tests are written
2. Tests are validated and approved by the user
3. Tests are confirmed to FAIL (Red phase)
```

This completely inverts traditional AI code generation. Instead of generating code and hoping it works, the LLM must first generate comprehensive tests that define behavior, get them approved, and only then generate implementation.

#### Articles VII & VIII: Simplicity and Anti-Abstraction

These paired articles combat over-engineering:

```text
Section 7.3: Minimal Project Structure
- Maximum 3 projects for initial implementation
- Additional projects require documented justification

Section 8.1: Framework Trust
- Use framework features directly rather than wrapping them
```

When an LLM might naturally create elaborate abstractions, these articles force it to justify every layer of complexity. The implementation plan template's "Phase -1 Gates" directly enforce these principles.

#### Article IX: Integration-First Testing

Prioritizes real-world testing over isolated unit tests:

```text
Tests MUST use realistic environments:
- Prefer real databases over mocks
- Use actual service instances over stubs
- Contract tests mandatory before implementation
```

This ensures generated code works in practice, not just in theory.

### Constitutional Enforcement Through Templates

The implementation plan template operationalizes these articles through concrete checkpoints:

```markdown
### Phase -1: Pre-Implementation Gates

#### Simplicity Gate (Article VII)

- [ ] Using ≤3 projects?
- [ ] No future-proofing?

#### Anti-Abstraction Gate (Article VIII)

- [ ] Using framework directly?
- [ ] Single model representation?

#### Integration-First Gate (Article IX)

- [ ] Contracts defined?
- [ ] Contract tests written?
```

These gates act as compile-time checks for architectural principles. The LLM cannot proceed without either passing the gates or documenting justified exceptions in the "Complexity Tracking" section.

### The Power of Immutable Principles

The constitution's power lies in its immutability. While implementation details can evolve, the core principles remain constant. This provides:

1. **Consistency Across Time**: Code generated today follows the same principles as code generated next year
2. **Consistency Across LLMs**: Different AI models produce architecturally compatible code
3. **Architectural Integrity**: Every feature reinforces rather than undermines the system design
4. **Quality Guarantees**: Test-first, library-first, and simplicity principles ensure maintainable code

### Constitutional Evolution

While principles are immutable, their application can evolve:

```text
Section 4.2: Amendment Process
Modifications to this constitution require:
- Explicit documentation of the rationale for change
- Review and approval by project maintainers
- Backwards compatibility assessment
```

This allows the methodology to learn and improve while maintaining stability. The constitution shows its own evolution with dated amendments, demonstrating how principles can be refined based on real-world experience.

### Beyond Rules: A Development Philosophy

The constitution isn't just a rulebook—it's a philosophy that shapes how LLMs think about code generation:

- **Observability Over Opacity**: Everything must be inspectable through CLI interfaces
- **Simplicity Over Cleverness**: Start simple, add complexity only when proven necessary
- **Integration Over Isolation**: Test in real environments, not artificial ones
- **Modularity Over Monoliths**: Every feature is a library with clear boundaries

By embedding these principles into the specification and planning process, SDD ensures that generated code isn't just functional—it's maintainable, testable, and architecturally sound. The constitution transforms AI from a code generator into an architectural partner that respects and reinforces system design principles.

## The Transformation

This isn't about replacing developers or automating creativity. It's about amplifying human capability by automating mechanical translation. It's about creating a tight feedback loop where specifications, research, and code evolve together, each iteration bringing deeper understanding and better alignment between intent and implementation.

Software development needs better tools for maintaining alignment between intent and implementation. SDD provides the methodology for achieving this alignment through executable specifications that generate code rather than merely guiding it.

</details>

