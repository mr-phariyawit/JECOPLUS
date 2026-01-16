# 🛸 Antigravity Startup

> **Repository for Antigravity Global Rules, Toolkit & SDD Framework**

## 📁 Files

| File | Purpose |
|:-----|:--------|
| `GEMINI.md` | Global Rules + SDD Philosophy + Factory Reset Guide + Agent Instructions + Memory Auto-Save |
| `.cursorrules` | IDE System Prompt Injection (Auto-loaded by Cursor/Windsurf) |
| `.agent/workflows/` | Workflow scripts (เช่น `/save-memory`, `/sync-project`) |
| `antigravity_toolkit/` | Factory Reset และ Restore scripts |
| `skills/` | Source code for Global Skills (to be installed to `~/.gemini/`) |
| `~/.gemini/antigravity/skills/` | Global Skills (SDD, Visuals, Auditor, Memory) |

## 🚀 Getting Started (The 3-Step Protocol)


### Step 1: Sync Global Rules (Brain Activation)

> **Do this ONCE per machine.**

1. **Clone repo**:

   ```bash
   git clone https://github.com/mr-phariyawit/startup.git ~/Documents/startup
   ```

2. **Sync**: Type **"sync GEMINI"** in Antigravity.
   - *Why?* This instills the "Structural Memory Pattern" into the Agent's global memory.

### Step 2: Install Global Skills (Brain Expansion)

> **Do this ONCE per machine.**

1. **Install**: Type **"install skills"** (or run `cp -r skills/* ~/.gemini/antigravity/skills/`).
2. **Verify**: Agent should confirm skills are installed in `~/.gemini/antigravity/skills/`.

### Step 3: Initialize Project (Bootstrapping)

> **Do this for EVERY new project.**

1. **Run**: Type **"init-project"**.
2. **Outcome**:
   - Creates `agent/` (Rules), `.memory/` (History), and `.env.example`.
   - Generates `antigravity_toolkit.sh` script.

### Step 4: Activate & Verify (Critical)

1. **Activate**: Tell Agent: **"Import rules and workflows."**
   > *This turns on the "Structural Memory" and enables slash commands.*
2. **Verify**: Agent must confirm it has read `agent/rules/`.

### 🔄 Updating Existing Projects

After pulling new updates from the startup repo:
1. **Run**: Type **"sync-project"**.
2. **Outcome**: Updates rules, workflows, and skills while preserving your `agent.md` and `lessons.md`.

---

## 🤖 Agent Instructions (For AI reading this)

**IF** you are reading this README for the first time in a new environment:
1.  Check if `~/.gemini/antigravity/skills` exists.
2.  **IF NOT FOUND**: proactively ask the user:
    > "I notice you have the Antigravity Skills in this repo but they are not installed globally. Would you like me to install them now?"
3.  **IF USER SAYS YES**: Copy `skills/*` to `~/.gemini/antigravity/skills/`.

---

## Workflow Diagram

```mermaid
graph TD
    A[Start] --> B[sync GEMINI]
    B --> C[install skills]
    C --> D[init-project]
    D --> E[Import rules & workflows]
    E --> F[Ready!]
```

## 🌟 ข้อดีของ Repository นี้ (สำหรับมือใหม่)

### 1. 🧠 **ทำให้ AI ฉลาดขึ้นทันที - แค่พิมพ์ "sync GEMINI"**

- ปกติ AI จะไม่รู้จักโปรเจกต์คุณ ไม่รู้ว่าคุณชอบเขียนโค้ดแบบไหน
- แต่พอใช้ repo นี้ **AI จะจำกฎของคุณได้ตลอดเวลา** ทุกครั้งที่เริ่มคุย
- ไม่ต้องบอกซ้ำว่า "เอ้ย ผมชอบใช้ TypeScript นะ" หรือ "อย่าลืมเขียน test ก่อนโค้ดนะ"

### 2. 🛸 **Factory Reset ได้ง่ายมาก - แก้ปัญหา Agent Terminated ได้ภายใน 30 วินาที**

- เคยเจอ AI หัวค้างไหม? หรือ "Agent terminated due to error"?

![Agent Terminated Error](docs/images/agent_terminated_error.png)
- ใช้คำสั่ง `./antigravity_toolkit.sh full` แค่ครั้งเดียว **ปัญหาหาย + กฎทั้งหมดกลับมา**
- ไม่ต้องตั้งค่าใหม่ทั้งหมด ไม่สูญเสียข้อมูลโปรเจกต์

### 3. 📐 **เขียนโค้ดแบบมืออาชีพทันที ด้วย SDD (Specification-Driven Development)**

- **มือใหม่มักเขียนโค้ดไปเรื่อย** แล้วค่อยคิดทีหลังว่าทำอะไรอยู่
- SDD สอนให้ **วางแผนก่อน → เขียน Spec → โค้ดออกมาเอง**
- เหมือนมี **Senior Developer คอยแนะนำทุกขั้นตอน**

### 4. 🔐 **มี Security Guardrails - ป้องกันไม่ให้ AI ทำลายโปรเจกต์**

- AI จะ **ไม่รัน `rm -rf` โดยไม่ถาม**
- **ไม่ hardcode API keys** ลงในโค้ด
- **ถามก่อนทำอะไรที่อันตราย** (ลบไฟล์, push to git, ติดตั้ง dependencies)

### 5. 🧪 **บังคับให้เขียน Test ก่อน (Article III: Test-First) - NON-NEGOTIABLE**

- มือใหม่มักข้าม test → บัคเยอะมาก
- กฎในนี้ **บังคับให้เขียน test ก่อนเขียนโค้ด**
- โค้ดของคุณจะ **มั่นใจได้ว่าใช้งานได้จริง** ไม่ใช่แค่ "run ผ่าน"

### 6. 📚 **มี Coding Standards + Best Practices ครบ - ไม่ต้องคิดเอง**

- ตั้งชื่อ variable แบบไหนดี? → `camelCase`
- ตั้งชื่อ class แบบไหน? → `PascalCase`
- ควร comment แบบไหน? → อธิบาย "ทำไม" ไม่ใช่ "ทำอะไร"
- **ทุกอย่างกำหนดไว้แล้ว มือใหม่ไม่ต้องเดาเอง**

### 7. 🚨 **Error Recovery Protocol - แก้ปัญหาได้เร็ว**

- เจอ Agent Terminated → ลด Model (High → Standard → Low)
- AI ช้า → Disable MCPs
- ทุกอย่างพัง → `./antigravity_toolkit.sh full`
- **มีคู่มือชัดเจน ไม่ต้องไปหาใน Stack Overflow**

### 7.1 🧹 **Memory Bloat Prevention - ป้องกัน OOM Crash**

สาเหตุหลักของ "Agent terminated due to error" คือ **V8 Out of Memory** จากข้อมูลสะสมใน `~/.gemini/antigravity/`:

| Folder | Risk Level | คำอธิบาย |
|:-------|:-----------|:---------|
| `browser_recordings/` | **Critical** | สะสมได้ถึง 50GB+ จาก browser automation |
| `brain/` | High | ข้อมูล state ของ Agent |
| `conversations/` | Medium | ประวัติแชท (>300MB = มีปัญหา) |

**วิธีตรวจสอบ:**

```bash
du -sh ~/.gemini/antigravity/*/ 2>/dev/null | sort -hr
```

**วิธีล้าง browser recordings:**

```bash
rm -rf ~/.gemini/antigravity/browser_recordings
```

**ควร Reset เมื่อ:** `browser_recordings/` > 10GB หรือ Total > 1GB

### 8. 🎯 **Prompt Engineering Best Practices - คุยกับ AI ให้ได้สิ่งที่ต้องการ**

- มือใหม่มักบอก AI แบบคลุมเครือ → ได้ผลลัพธ์ไม่ตรงใจ
- repo นี้สอนวิธี **พูดกับ AI ให้เข้าใจตรงกัน**
- ใช้ "Goal → Context → Constraint" → **ได้ผลลัพธ์แม่นยำขึ้น 10 เท่า**

### 9. 🔄 **Persistent Memory - AI จำบริบทได้ตลอด**

- AI จะ **จำการสนทนาทั้งหมด** และเรียกคืนได้เมื่อต้องการ
- ไม่ต้องอธิบายซ้ำว่า "เมื่อเช้าเราคุยกันเรื่องอะไร"
- **Knowledge Items (KIs)** จะถูกสร้างและอัพเดทอัตโนมัติ

### 10. 📦 **One-Command Setup - ตั้งค่าเสร็จภายใน 1 นาที**

- แค่ `git clone` + พิมพ์ "sync GEMINI" → **เสร็จ!**
- ไม่ต้องติดตั้งอะไรเพิ่ม ไม่ต้อง config ซับซ้อน
- **ใช้งานได้ทันที บน macOS**

### 11. 💾 **Memory Auto-Save - ไม่เสียงานอีกต่อไป** 🆕

- Agent จะ **auto-save artifacts** ทุกครั้งที่สร้างหรือแก้ไข
- เก็บใน `.memory/` folder ของแต่ละโปรเจกต์
- มี **timestamp + title** ทำให้หาง่าย (เช่น `260110_1200_my_feature/`)
- ไม่ต้องกลัวว่าจะลืม save หรือ **เสีย implementation plan** อีกต่อไป!

### 12. 🧬 **Structural Memory Pattern - ความฉลาดที่ฝังอยู่ในโครงสร้าง** 🆕

- Agent **จำกฎจาก File Structure** (`agent/rules/*`) ไม่ใช่แค่ Prompt
- ถ้า Agent ทำผิด มันจะ **อ่านกฎใหม่และแก้ไขตัวเอง** (`/learn`)
- **Single Source of Truth** อยู่ที่ไฟล์ ไม่ใช่ที่แชท ทำให้บริบทไม่หายแม้เริ่ม chat ใหม่

### 13. 🛠️ **Custom Skills Automation - ระบบทำงานอัตโนมัติ** 🆕

- **`sdd-architect`**: คอยห้ามไม่ให้เขียนโค้ดถ้ายังไม่มี Plan
- **`visual-communicator`**: วาด Diagram เองอัตโนมัติเมื่ออธิบายเรื่องยาก
- **`the-auditor`**: ตรวจ Code Quality และ 9 Articles ให้ก่อนส่งงาน
- **`memory-keeper`**: ช่วย Backup artifacts ให้อัตโนมัติ

---

## 💡 สรุปเปรียบเทียบ

| ปัญหาที่มือใหม่มักเจอ | Antigravity Startup แก้ยังไง |
|:-----------------------|:------------------------------|
| ไม่รู้จะเริ่มต้นยังไง | มี SDD Workflow บอกทุกขั้นตอน |
| โค้ดยุ่งเหยิง ไม่มี standard | มี Coding Standards ครบทุกภาษา |
| ไม่เขียน test → บัคเยอะ | บังคับเขียน test ก่อน (Article III) |
| AI ไม่เข้าใจสิ่งที่ต้องการ | มี Prompt Engineering Guide |
| AI พังบ่อย (Agent Terminated) | มี Factory Reset ใช้งานง่าย |
| โค้ดไม่ปลอดภัย (hardcode secrets) | มี Security Guardrails |
| ต้องบอก AI ซ้ำทุกครั้ง | มี Global Rules + Persistent Memory |
| ลืม save งาน / เสีย artifacts | มี Memory Auto-Save อัตโนมัติ 🆕 |
| Agent ลืมกฎเมื่อเริ่ม chat ใหม่ | มี Structural Memory Pattern (File-based Rules) |
| ไม่ใช้รูปภาพอธิบาย / ไม่มี diagram | มี Visual Communication Standards (Mermaid) 🆕 |
| แก้โค้ดแล้วบัค / ไม่ทดสอบ | มี Browser Verification Loop (chrome-check) 🆕 |
| Agent ทำงานซ้ำซากจำไม่ได้ | มี Custom Skills Automation (Auditor, Architect) 🆕 |

> 🎉 **ข้อดีที่สุดคือ: "เปลี่ยนมือใหม่ให้เขียนโค้ดแบบมืออาชีพได้ทันที"**
>
> ไม่ต้องเรียนรู้ทุกอย่างเอง ไม่ต้องทำผิดซ้ำซาก **แค่ใช้ repo นี้ AI จะแนะนำให้คุณทำถูกตั้งแต่ครั้งแรก** 🚀

---

## 📐 Specification-Driven Development (SDD)

This repository follows **SDD philosophy** — specifications don't serve code; code serves specifications.

Key concepts in `GEMINI.md`:

- The Power Inversion
- SDD Workflow
- Nine Articles of Development
- Pre-Implementation Gates

---

*🛸 Antigravity Startup v2026.2 — Powered by SDD*
