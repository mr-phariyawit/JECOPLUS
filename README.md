# 🛸 Antigravity Startup

> **Repository for Antigravity Global Rules, Toolkit, SDD Framework & Autoteam**

## ⚠️ Important: Google Antigravity IDE

This repository is designed for **Google Antigravity IDE** (powered by Google DeepMind). It is NOT intended for Cursor, VS Code, or other editors.

## 📁 Project Structure

```
startup/
├── .agent/                   # [CONSOLIDATED] All agent config
│   ├── rules/                # Safety, Dev, Docs, Autoteam rules
│   ├── workflows/            # /task, /spec, /team-* commands
│   ├── memory/               # Team history, lessons, patterns
│   ├── skills/roles/         # 10 specialized AI roles
│   ├── templates/            # Config templates
│   └── tools/                # Architecture, RAG, Security
├── .memory/                  # [AUTO-SAVE] Job history & backups
├── specs/features/           # Feature specifications
├── docs/                     # Documentation + UXUI/
├── skills/                   # Global Skills source code
├── agent.md                  # Master directives
├── GEMINI.md                 # Global Rules + SDD + Autoteam
└── antigravity_toolkit.sh    # Factory Reset & Restore
```

## 📦 Files Reference

| File | Purpose |
|:-----|:--------|
| `GEMINI.md` | Global Rules + SDD Philosophy + Autoteam Commands + Agent Instructions |
| `.agent/` | Consolidated agent config (rules, workflows, memory, roles) |
| `.agent/workflows/` | Workflow scripts (`/task`, `/team-start`, `/team-role`, etc.) |
| `antigravity_toolkit.sh` | Factory Reset และ Restore scripts |
| `skills/` | Source code for Global Skills (to be installed to `~/.gemini/`) |

## 🚀 Getting Started

### Step 1: Clone & Sync (Brain Activation)

> **Do this ONCE per machine.**

```bash
git clone https://github.com/mr-phariyawit/startup.git ~/Documents/startup
```

Then type **"sync GEMINI"** in Antigravity.

### Step 2: Install Global Skills (Brain Expansion)

> **Do this ONCE per machine.**

Type **"install skills"** (or run `cp -r skills/* ~/.gemini/antigravity/skills/`).

### Step 3: Initialize Project (Bootstrapping)

> **Do this for EVERY new project.**

Type **"init-project"** to create:
- `.agent/` (Rules, Workflows, Memory)
- `.memory/` (History)
- `specs/features/` (Specifications)

### Step 4: Activate & Verify

Tell Agent: **"Import rules and workflows"**

## 🎮 Available Commands

### Workflow Commands

| Command | Description |
|:--------|:------------|
| `/init` | Bootstrap new project structure |
| `/task [desc]` | Start Task: Analysis → Plan → Approval → Execute |
| `/spec [desc]` | SDD: Idea → `spec.md` |
| `/spec.plan` | Plan: `spec.md` → `implementation_plan.md` |
| `/learn` | Fix: Analyze error → Update Rule → Verify |
| `/retro` | Save: Archive artifacts to `.memory/` |

### 🤖 Autoteam Commands (v1.1.0) 🆕

| Command | Description |
|:--------|:------------|
| `/team-start` | Start AI team session → reads history → creates task plan |
| `/team-end` | End session → saves progress to memory |
| `/team-status` | View current feature, progress %, blockers |
| `/team-role [role]` | Switch role: `tl`, `pm`, `po`, `ux`, `fe`, `be`, `api`, `qa`, `devops`, `ai` |
| `/team-vote [topic]` | Start democratic vote (Quick/Standard/Critical) |
| `/team-ask` | Batch questions for human (min 3) |

### 👥 Autoteam Roles

| Shortcut | Role | Expertise |
|:---------|:-----|:----------|
| `tl` | 🎯 Team Leader | Coordination, decisions |
| `pm` | 📋 Product Manager | Strategy, roadmap |
| `po` | 🎫 Product Owner | Backlog, user stories |
| `ux` | 🎨 UX/UI Designer | Wireframes, design |
| `fe` | 💻 Frontend Dev | UI, React, Tailwind |
| `be` | ⚙️ Backend Dev | Server, database |
| `api` | 🔌 API Developer | Contracts, endpoints |
| `qa` | 🧪 QA Engineer | Testing, quality |
| `devops` | 🚀 DevOps | CI/CD, deploy |
| `ai` | 🤖 AI Engineer | AI/ML integration |

## 🗳️ Autoteam Voting System

| Type | Quorum | Threshold | Use Case |
|:-----|:-------|:----------|:---------|
| Quick | 3 | >50% | Minor decisions |
| Standard | 4 | ≥67% | Architecture, tech |
| Critical | All | 100% | Breaking changes |

## 🔄 Workflow Diagram

```mermaid
graph TD
    A[Start] --> B[sync GEMINI]
    B --> C[install skills]
    C --> D[init-project]
    D --> E[Import rules & workflows]
    E --> F[/team-start]
    F --> G[Work with AI Team]
    G --> H[/team-end]
    H --> I[Done!]
```

## 🛠️ Factory Reset & Recovery

If you encounter "Agent terminated due to error":

```bash
# Full Reset (Factory + Restore Rules)
./antigravity_toolkit.sh full
```

### Memory Bloat Prevention

Check memory usage:

```bash
du -sh ~/.gemini/antigravity/*/ 2>/dev/null | sort -hr
```

Clear browser recordings (if > 10GB):

```bash
rm -rf ~/.gemini/antigravity/browser_recordings
```

## 📐 Specification-Driven Development (SDD)

This repository follows **SDD philosophy** — specifications don't serve code; code serves specifications.

### The 9 Articles (Summary)

1. **Library-First**: Features start as standalone libraries
2. **CLI Interface**: Expose functionality via CLI
3. **Test-First**: **NON-NEGOTIABLE**. No code before tests
4. **Simplicity**: Max 3 projects initially
5. **Anti-Abstraction**: Use frameworks directly
6. **Integration-First**: Real DBs over mocks

## 🌟 Key Benefits

| Problem | Solution |
|:--------|:---------|
| AI doesn't remember context | Global Rules + Persistent Memory |
| Agent crashes frequently | Factory Reset in 30 seconds |
| No coding standards | SDD + Coding Standards built-in |
| Working alone on complex tasks | Autoteam with 10 specialized roles 🆕 |
| Decisions get lost | Democratic voting + decision records 🆕 |
| No test coverage | Test-First is NON-NEGOTIABLE |

## 🤖 Agent Instructions

**IF** you are reading this README for the first time:

1. Check if `~/.gemini/antigravity/skills` exists
2. **IF NOT FOUND**: Ask user to install skills
3. Read `GEMINI.md` to understand your identity and rules
4. You are running on **Google Antigravity IDE** — NOT Cursor or VS Code

---

*🛸 Antigravity Startup v2026.3 — Powered by SDD + Autoteam v1.1.0*
