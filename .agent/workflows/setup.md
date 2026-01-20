---
description: Initialize Antigravity project structure from scratch
---

# /setup

> **Trigger**: User says "setup", "init antigravity", or "/setup"

## Prerequisites

- User has `GEMINI.md` in project root (downloaded from GitHub)
- User is using Google Antigravity IDE

## Steps

### 1️⃣ Create Core Directories

```bash
mkdir -p .agent/ai-team/decisions
mkdir -p .agent/ai-team/skills
mkdir -p .agent/memory
mkdir -p .agent/rules
mkdir -p .agent/templates
mkdir -p .agent/tools
mkdir -p .agent/workflows
mkdir -p .memory
mkdir -p specs/features
mkdir -p docs/UXUI
```

### 2️⃣ Create agent.md (Project Root Directives)

Create `agent.md` in project root with:

```markdown
# Agent Directives

> This project follows Antigravity SDD Framework.

## Project Info
- **Name**: [PROJECT_NAME]
- **Started**: [DATE]
- **Status**: Active

## Rules
- Follow `.agent/rules/` for behavior
- Use `/team-start` to begin sessions
- Use `/team-end` to save progress

## Quick Commands
- `/setup` - Initialize structure (done!)
- `/team-start` - Start AI team session
- `/team-role [role]` - Switch role
- `/team-end` - End session
```

### 3️⃣ Create AI Team Files

**`.agent/ai-team/team-history.md`:**
```markdown
# 🤖 AI Team History

## Project: [PROJECT_NAME]
**Started:** [DATE]
**Status:** Active

---

## 📅 Sessions

_No sessions yet. Start with /team-start_

---

## 👤 Human Decisions

_None yet_

---

## 🎓 Learnings

_To be discovered_
```

**`.agent/ai-team/config.yaml`:**
```yaml
# AI Team Config v1.1

team:
  roles: [tl, pm, po, ux, fe, be, api, qa, devops, ai]

voting:
  quick: { quorum: 3, threshold: "majority" }
  standard: { quorum: 4, threshold: "two_thirds" }
  critical: { quorum: "all", threshold: "unanimous" }

human_interaction:
  mode: batched
  min_batch: 3

test_fix:
  max_iterations: 10

quality_gates:
  pre_commit: [tests_pass, lint_clean, no_secrets]
  pre_deploy: [security_scan, deps_audit]
  pre_release: [qa_signoff, docs_updated]

paths:
  history: ".agent/ai-team/team-history.md"
  decisions: ".agent/ai-team/decisions/"
  skills: ".agent/ai-team/skills/"
  specs: "specs/features/"
  docs: "docs/"
  rules: ".agent/rules/"
```

### 4️⃣ Create Memory Files

**`.agent/memory/lessons.md`:**
```markdown
# 🎓 Learned Lessons

_Add lessons learned during development here._
```

**`.agent/memory/patterns.md`:**
```markdown
# 🔄 Discovered Patterns

_Document recurring patterns here._
```

### 5️⃣ Create Core Rules

**`.agent/rules/safety.md`:**
```markdown
# 🔐 Safety Rules

1. **No Dangerous Commands**: Never run `rm -rf` without explicit approval
2. **No Secrets in Code**: Never commit `.env`, API keys, or credentials
3. **No Direct Main Commits**: Always use feature branches
4. **Approval Required**: Ask before destructive operations
```

**`.agent/rules/development.md`:**
```markdown
# 💻 Development Rules

1. **Test-First**: Write tests before implementation
2. **Max 500 Lines**: Refactor files exceeding 500 lines
3. **80% Coverage**: Maintain minimum test coverage
4. **Document Why**: Comments explain reasoning, not code
```

### 6️⃣ Create Team Role Skills

Create these files in `.agent/ai-team/skills/`:

- `team-leader.md` - Coordination, decisions
- `frontend.md` - UI, React, CSS
- `backend.md` - Server, database
- `api.md` - Endpoints, contracts
- `qa.md` - Testing, quality
- `uxui.md` - Design, wireframes
- `devops.md` - CI/CD, deploy
- `product-manager.md` - Strategy
- `product-owner.md` - Backlog
- `ai-engineer.md` - AI/ML integration

### 7️⃣ Create Workflow Files

Copy these workflows to `.agent/workflows/`:

- `team-start.md`
- `team-end.md`
- `team-role.md`
- `task.md`
- `spec.md`

### 8️⃣ Announce Completion

```
✅ Antigravity Setup Complete!

📁 Created Structure:
├── .agent/
│   ├── ai-team/     (team history, config, skills)
│   ├── memory/      (lessons, patterns)
│   ├── rules/       (safety, development)
│   ├── templates/
│   ├── tools/
│   └── workflows/
├── .memory/
├── specs/features/
├── docs/UXUI/
└── agent.md

🚀 Next Steps:
1. Run /team-start to begin your first session
2. Use /team-role to switch between roles
3. Use /spec to create feature specifications

Happy coding! 🛸
```

## Quick Setup Script

For convenience, user can also run this bash script:

```bash
#!/bin/bash
# antigravity-setup.sh

echo "🛸 Setting up Antigravity project structure..."

# Create directories
mkdir -p .agent/{ai-team/{decisions,skills},memory,rules,templates,tools,workflows}
mkdir -p .memory specs/features docs/UXUI

# Create basic files
touch .agent/memory/{lessons.md,patterns.md}
touch .agent/ai-team/{team-history.md,config.yaml}

echo "✅ Setup complete! Run /team-start to begin."
```
