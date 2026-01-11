# Structural Memory Agent Specification (Antigravity Compliant)

## Overview

ระบบ **Structural Memory Agent** นี้ถูกออกแบบภายใต้ปรัชญา **Specification-Driven Development (SDD)** ของ Antigravity Framework โดยมีหลักการสำคัญคือ **"Code serves Specifications"** (โค้ดรับใช้สเปค)

ระบบจะย้าย Context, Rules, และ Memory ออกจาก "Prompt" ไปฝังไว้ใน **File Structure** ที่ Agent ถูกบังคับให้อ่าน (Enforced Read) เพื่อแก้ปัญหา Agent Amnesia และการทำงานที่ไม่ตรงตามมาตรฐาน

## 🎯 Core Philosophy: SDD

การพัฒนาจะเป็นไปตามวงจร SDD:
`Idea → Spec (PRD) → Plan → Code → Feedback → Spec Update`

- **Single Source of Truth**: ความจริงอยู่ที่ไฟล์ Spec และ Rules ไม่ใช่ที่โค้ด
- **Structural Correction**: เมื่อเกิดข้อผิดพลาด Agent ต้องกลับมาแก้ที่ "กฎ" (`agent/rules/*`) ก่อน แล้วจึงแก้โค้ด

---

## 🏗 Project Structure

โครงสร้างโฟลเดอร์ถูกออกแบบมาเพื่อรองรับทั้ง "Distilled Memory" (ความรู้ตกผลึก) และ "Raw History" (ประวัติการทำงาน)

## Technical Specification

### Project Structure (Standard Template)
*นี่คือโครงสร้างมาตรฐานที่ `/init` จะสร้างให้กับทุกโปรเจค*

```text
Project-Root/
├── .git/
├── .memory/                  # [AUTO-SAVE] เก็บ Artifacts ราย Task (History)
│   └── YYMMDD_HHMM_Title/    # e.g., 260111_1600_setup_agent
├── agent.md                  # [MASTER] ไฟล์ตั้งต้นสำหรับ Agent (Persona & Directives)
├── agent/
│   ├── rules/                # [BRAIN] กฎที่ห้ามละเมิด (Immutable Laws)
│   │   ├── safety.md         # Article I & Safety Rules
│   │   ├── development.md    # Article III (Test-First) & Coding Standards
│   │   ├── documentation.md  # Article IX & Documentation Standards
│   │   └── nine_articles.md  # The 9 Articles of Development
│   ├── workflow/             # [COMMANDS] คำสั่งลัด (Slash Commands)
│   │   ├── task.md           # /task logic
│   │   ├── learn.md          # /learn logic
│   │   ├── spec.md           # /spec logic (SDD)
│   │   └── init.md           # /init logic (Bootstrapping)
│   └── memory/               # [KNOWLEDGE] ความรู้ที่ตกผลึกแล้ว (Distilled)
│       ├── lessons.md        # สิ่งที่เรียนรู้จากความผิดพลาด (Do's & Don'ts)
│       └── patterns.md       # Solution Patterns ที่ใช้บ่อย
├── docs/                     # Project Documentation
├── src/                      # Source Code
└── README.md
```

### Key File Templates

#### `agent.md` (Root Master File)

```markdown
# Agent Configuration & Meta-Instructions

## Role & Persona
You are an expert Senior Software Engineer and Project Manager 
capable of self-improvement. You act autonomously but strictly 
adhere to safety and architectural guidelines defined in the 
**Antigravity Startup Framework**.

## 🚨 CRITICAL DIRECTIVES (MUST READ)
1. **Rule Enforcement:** Before executing ANY task, you MUST read 
   and internalize the rules defined in `agent/rules/` directory.
2. **Workflow Adherence:** You MUST use the defined workflows in 
   `agent/workflow/` for standard operations.
3. **Self-Correction:** If you receive negative feedback, you MUST 
   trigger the `/learn` workflow to update your own rules immediately.
4. **Test-First:** You are FORBIDDEN from writing code without first 
   writing tests (Article III).

## 📂 Knowledge Base Structure
- **`agent/rules/`**: Immutable laws (Safety, Dev, Docs)
- **`agent/workflow/`**: Operational logic for short-codes
- **`agent/memory/`**: Long-term lessons learned
```

#### `agent/rules/development.md` (Standard)

```markdown
# Development Guidelines

## 1. Pre-Coding Phase (The "Think" Step)
**Rule:** You are FORBIDDEN from writing code immediately. Follow this sequence:
1. **Requirement Analysis:** Confirm understanding of the goal.
2. **Task Breakdown:** List specific sub-tasks.
3. **Working Log:** Create `docs/working-logs/YYMMDD_TaskName.md`.
4. **Implementation Plan:** Propose file structure/logic.
5. **Wait for Approval:** Ask the user: "Does this plan look good?"

## 2. Coding Standards
- **File Limits:** No file should exceed 500 lines. Refactor if necessary.
- **Modularity:** Separate Frontend and Backend logic clearly.
- **Error Handling:** Must include try/catch blocks with meaningful logs.
- **Project Structure:** All source code under `src/` folder.
```

#### `agent/workflow/init.md` (The Bootstrapper)

```markdown
# Short Code: /init
**Trigger:** When user inputs `/init` locally.

## Initialization Protocol
1. **Interactive Questionnaire:**
    Ask the user: "Project Name? Type? Stack?"

2. **Structure Generation:**
   - Create directories: `agent/rules`, `agent/workflow`, `docs`, `src`.
   - Copy Standard Templates: `agent.md`, `rules/*`, `workflow/*`.
   - Create `.env.example` and `.gitignore`.

3. **Confirmation:**
   - Report: "Project [Name] initialized. Rules established."
```

---

## Development Workflow

### The Bootstrapping Cycle (/init)

```
1. User: /init
   └─→ Agent: "Project Name?"
   └─→ User: "MyNewApp"
   └─→ Agent: Creates Structure → Copies Templates → Reports Success
   └─→ User: (Now has a fully complying Structural Memory Agent ready)
```

### The Development Cycle (Happy Path)
```
1. /task [requirement]
   └─→ Agent: อ่านกฎ → วิเคราะห์ → สร้าง Working Log → เสนอแผน → รอ Approval

2. User: "อนุมัติ ลุยเลย"
   └─→ Agent: เขียนโค้ด → Build → Test → เก็บ Evidence

3. Agent: สร้าง Pull Request
   └─→ User: Review & Merge
```

---

### US-009: Project Bootstrapping
**As a** Technical Lead
**I want** ใช้ Agent เพื่อสร้างโครงสร้างโปรเจคใหม่ที่ได้มาตรฐาน (Scaffolding)
**So that** ทุกโปรเจคในทีมมีโครงสร้างและกฎพื้นฐาน (Rules) เหมือนกันทั้งหมด

---

## Acceptance Criteria

### AC-001: Agent Rule Enforcement
- [ ] Agent อ่านไฟล์ใน `agent/rules/` ทุกครั้งก่อนเริ่มงาน
- [ ] กฎใน `agent.md` (Root) ถูก Enforce เป็น Always-On
- [ ] Activation Mode สามารถเลือกได้: Always On, Agent Decision, Mention Only

### AC-002: Development Workflow
- [ ] Agent ปฏิบัติตาม Pre-Coding Phase:
  - Requirement Analysis → Task Breakdown → Implementation Plan → User Approval
- [ ] ห้ามเริ่มเขียนโค้ดจนกว่าผู้ใช้จะ Approve Plan
- [ ] หลังเขียนโค้ดเสร็จต้อง Build & Run Test ก่อนส่งมอบ

### AC-003: Safety Rules
- [ ] ห้ามใช้ Dangerous Commands: `rm -rf`, force delete, system format
- [ ] ห้าม Auto-Merge Pull Request (Human-only privilege)
- [ ] ห้าม Commit API Keys/Passwords (ใช้ `.env` เท่านั้น)
- [ ] สร้าง Branch ใหม่ (`feat/xxx`, `fix/xxx`) สำหรับทุก Task
- [ ] ห้าม Commit ตรงไปที่ `main`

### AC-004: Coding Standards
- [ ] ไฟล์ห้ามเกิน 500 Lines of Code (LOC) (Antigravity Standard)
- [ ] แยก Frontend/Backend ชัดเจน (ถ้ามี)
- [ ] มี Error Handling ด้วย try/catch พร้อม Meaningful Logs
- [ ] Source Code อยู่ภายใต้ `src/` folder

### AC-005: Documentation Management
- [ ] เอกสารทั้งหมดอยู่ใน Directory Structure ที่กำหนด
- [ ] อัปเดต README หลังเสร็จงาน
- [ ] มี Task Checklist พร้อมสถานะที่อัปเดตแล้ว
- [ ] Lesson Learned ถูกบันทึกใน `agent/memory/`

### AC-006: Short Commands (Slash Commands)
- [ ] `/task [description]`: สร้าง Task พร้อม Plan
- [ ] `/code` หรือ `/develop`: เริ่มเขียนโค้ด
- [ ] `/learn`: เรียนรู้จากข้อผิดพลาดและอัปเดต Rules
- [ ] `/retro` หรือ `/retrospective`: ทำ Self-Review
- [ ] `/feedback [message]`: รับ Feedback และบันทึก
- [ ] `/init`: สร้างโปรเจคใหม่ด้วย Template มาตรฐาน

### AC-007: Evidence Collection
- [ ] Screenshot ของ Application ที่รันได้
- [ ] Test Logs และ Test Results
- [ ] Evidence เก็บใน `workspace/evidence/` ไม่ใช่ Global Workspace

### AC-008: Pull Request Workflow
- [ ] สร้าง PR หลังเขียนโค้ดเสร็จ
- [ ] แนบ Link PR ในการตอบกลับ
- [ ] ห้าม Auto-Accept (รอ Human Approve)

### AC-009: Template Consistency (Bootstrapping)
- [ ] คำสั่ง `/init` ต้องสร้างไฟล์มาตรฐานชุดเดียวกันกับที่ระบุใน Spec นี้
- [ ] ไฟล์ที่ถูกสร้างต้องมี: `agent.md`, `rules/*`, `workflow/*` ครบถ้วน
- [ ] Agent ต้องสามารถปรับเปลี่ยน Template ได้ตาม Tech Stack (Node/Python/Go)

---

## 📜 Rule Files Specification

### 1. `agent.md` (Master Directive)
ต้องระบุให้ Agent อ่านไฟล์ใน `agent/rules/` และ `agent/memory/` เสมอ

### 2. `agent/rules/nine_articles.md`
นำกฎ 9 ข้อของ Antigravity มาบังคับใช้ โดยเฉพาะ:
*   **Article I (Library-First)**: ฟีเจอร์ต้องเริ่มจาก Library เสมอ
*   **Article III (Test-First)**: เขียน Test ก่อน Code (Non-negotiable)
*   **Article VIII (Anti-Abstraction)**: ใช้ Framework โดยตรง ห้ามสร้าง Wrapper ที่ไม่จำเป็น

### 3. `agent/rules/development.md`
*   **SDD Workflow**: ห้ามเขียนโค้ดจนกว่า Plan จะได้รับอนุมัติ
*   **Coding Standards**:
    *   File Limit: < 500 lines (เพื่อ Performance และ Token-efficiency)
    *   Naming: `camelCase`, `PascalCase`, `SCREAMING_SNAKE_CASE`
    *   No hardcoded secrets (`.env` only)

---

## ⚡ Workflow Automation (Slash Commands)

| Command | Description | Protocol |
| :--- | :--- | :--- |
| `/init` | **[NEW]** เริ่มต้นโปรเจค | สร้างโครงสร้างโฟลเดอร์ + ถามชื่อโปรเจค/Stack |
| `/task [desc]` | เริ่มงานใหม่ | อ่าน Rules → วิเคราะห์ → **สร้าง Working Log** → เสนอแผน → รออนุมัติ |
| `/spec` | เริ่มกระบวนการ SDD | แปลง Idea เป็น Spec ตามมาตรฐาน SDD |
| `/learn` | Structural Correction | วิเคราะห์ข้อผิดพลาด → อัปเดต `agent/rules` → ยืนยันผล |
| `/import [url]` | **[NEW]** Cross-Workspace | ดึง Rules/Memory จาก Repo อื่นมาใช้ |
| `/feedback` | **[NEW]** รับ Feedback | บันทึก Feedback ลง Log และเรียนรู้ถ้าจำเป็น |
| `/retro` | สรุปงาน | สร้าง Retrospective และบันทึก Artifacts เข้า `.memory/` |

---

## 💾 Memory Management Strategy

### 1. Short-Term Strategy (Context Window)
*   ใช้ `agent.md` เป็น Pointer ชี้เป้า
*   อ่านเฉพาะ Rules ที่เกี่ยวข้องกับ Task ปัจจุบัน (Dynamic Loading)
*   **Working Logs**: บันทึก "ความคิด" ระหว่างทำงานลง `docs/working-logs/YYMMDD_TaskName.md`

### 2. Long-Term Strategy (Knowledge Base)
*   **Distilled Knowledge**: เก็บใน `agent/memory/*.md` (เช่น ปัญหาที่พบบ่อย, ท่าแก้มาตรฐาน)
*   **Development History**: เก็บใน `.memory/` (Auto-save Implementation Plans และ Tasks เก่า เพื่อดูย้อนหลัง)

---

## ✅ Acceptance Criteria for Setup

1.  **Skeleton Created**: มีโฟลเดอร์ครบตาม Structure ด้านบน
2.  **Rules Enforced**: Agent ปฏิเสธที่จะทำงานถ้ายังไม่อ่าน Rules
3.  **Test-First Enforced**: ถ้า User สั่งให้เขียนโค้ดเลย Agent ต้องเตือนเรื่อง Article III (Test-First)
4.  **Auto-Save Ready**: มี Script หรือ Workflow สำหรับ Save Artifacts ลง `.memory/`
5.  **Interactive Init**: `/init` สามารถสร้างโปรเจคใหม่ได้
6.  **Cross-Learning**: `/import` สามารถดึง Rules จาก External Source ได้

---

*Specification Version: 2.1 (Gap Analysis Filled)*
*Based on: Structural Memory Guidebook & Antigravity Startup Framework*
