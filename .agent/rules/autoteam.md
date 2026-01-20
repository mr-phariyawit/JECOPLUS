# 🤖 Autonomous AI Dev Team v1.1.0

> **"One AI, Many Minds - Zero Human Bottlenecks"**

---

## 📦 Installation

**Trigger:** User says "install autoteam" or "install autoteam-v1.1.0.zip"

**Agent should run:**
```bash
# 1. Find and extract zip in project root
cd [PROJECT_ROOT]
unzip autoteam*.zip

# 2. Run installer
chmod +x autoteam/install.sh
./autoteam/install.sh

# 3. Cleanup (optional)
rm -rf autoteam autoteam*.zip

# 4. Confirm to user
```

**Result:**
```
.ai-team/
├── team-history.md   ← Persistent memory
├── config.yaml       ← Team settings
└── decisions/        ← Vote records
specs/features/       ← Specifications go here
docs/UXUI/           ← Wireframes go here
```

---

## 🎮 Commands Reference

### Session Commands

| Command | Description | Agent Action |
|---------|-------------|--------------|
| `/team-start` | เริ่ม session | อ่าน `team-history.md` → อ่าน spec → วางแผน tasks |
| `/team-end` | จบ session | สรุปงาน → update `team-history.md` → แจ้ง user |
| `/team-status` | ดูสถานะ | แสดง feature ปัจจุบัน, progress %, blockers |

### Workflow Commands

| Command | Description | Agent Action |
|---------|-------------|--------------|
| `/team-vote [topic]` | เริ่ม vote | ระบุ options → เก็บ votes → ประกาศผล |
| `/team-ask` | ถาม human | รวม questions (min 3) → present → รอคำตอบ |
| `/team-retro` | Retrospective | สรุป: went well, challenges, learnings |
| `/team-evolve` | เสนอ feature ใหม่ | แต่ละ role เสนอ → vote → สร้าง spec ใหม่ |

### Role Commands

| Command | Description | Agent Action |
|---------|-------------|--------------|
| `/team-role [role]` | โหลด role skill | อ่าน `roles/[role].md` แล้วทำงานตาม role |

**Role shortcuts:**
- `/team-role tl` → Team Leader
- `/team-role pm` → Product Manager
- `/team-role po` → Product Owner
- `/team-role ux` → UXUI Designer
- `/team-role fe` → Frontend Dev
- `/team-role be` → Backend Dev
- `/team-role api` → API Dev
- `/team-role qa` → QA Engineer
- `/team-role devops` → DevOps
- `/team-role ai` → AI Engineer

### Utility Commands

| Command | Description | Agent Action |
|---------|-------------|--------------|
| `/team-history` | ดู history | แสดง summary: sessions, decisions, learnings |
| `/team-help` | ดู commands | แสดงตาราง commands ทั้งหมด |

---

## 🔄 Command Flows

### `/team-start` Flow
```
1. Read .ai-team/team-history.md
2. Identify: current feature, last checkpoint, blockers
3. Read current spec (if any)
4. Plan session: list tasks, assign to roles
5. Announce: "Session started. Today's goals: [...]"
6. Begin work
```

### `/team-end` Flow
```
1. Summarize: tasks completed, decisions made
2. Note: any blockers or pending items
3. Update .ai-team/team-history.md
4. Announce: "Session ended. Progress: X%"
```

### `/team-vote [topic]` Flow
```
1. TL announces vote topic
2. Determine vote type: Quick/Standard/Critical
3. Present options (A, B, C...)
4. Each role votes with rationale
5. Count votes, check threshold
6. Announce result
7. Record in .ai-team/decisions/
```

### `/team-ask` Flow
```
1. Check question queue (minimum 3)
2. Format questions with context
3. Present to human in single message
4. Wait for answers
5. Record answers in team-history.md
6. Never re-ask same question
```

### `/team-role [role]` Flow
```
1. Read roles/[role].md
2. Adopt role's perspective and expertise
3. Apply role's templates and checklists
4. Work on assigned tasks
5. Hand off to next role when done
```

---

## 📋 Core Rules

1. **Read history first** - Always start with `.ai-team/team-history.md`
2. **Spec is law** - Follow spec, vote to change
3. **Batch questions** - Collect 3+ before asking human
4. **Test-fix loop** - Max 10 iterations, then vote
5. **Document everything** - Update history after each task

---

## 👥 Team Roles

| Role | File | Expertise |
|------|------|-----------|
| 🎯 TL | `roles/team-leader.md` | Coordination, decisions |
| 📋 PM | `roles/product-manager.md` | Strategy, roadmap |
| 🎫 PO | `roles/product-owner.md` | Backlog, user stories |
| 🎨 UX | `roles/uxui.md` | Wireframes, design |
| 💻 FE | `roles/frontend.md` | UI, React, Tailwind |
| ⚙️ BE | `roles/backend.md` | Server, database |
| 🔌 API | `roles/api.md` | Contracts, endpoints |
| 🧪 QA | `roles/qa.md` | Testing, quality |
| 🚀 DevOps | `roles/devops.md` | CI/CD, deploy |
| 🤖 AI | `roles/ai-engineer.md` | AI/ML integration |

---

## 🗳️ Voting System

| Type | Quorum | Threshold | Use For |
|------|--------|-----------|---------|
| Quick | 3 | >50% | Minor decisions |
| Standard | 4 | ≥67% | Architecture, tech |
| Critical | All | 100% | Breaking changes |

See `workflows/voting.md` for details.

---

## 🛠️ Advanced Tools

| Tool | File | When to Use |
|------|------|-------------|
| RAG System | `tools/rag.md` | Codebase > 10K LOC |
| Security | `tools/security.md` | Pre-deploy scans |
| Architecture | `tools/architecture.md` | Major changes, ADRs |

---

## 📁 Project Structure

```
project/
├── .ai-team/
│   ├── team-history.md   ← Memory (ALWAYS read first)
│   ├── config.yaml       ← Settings
│   └── decisions/        ← Vote records
├── specs/features/       ← Specifications
└── docs/UXUI/           ← Wireframes
```
