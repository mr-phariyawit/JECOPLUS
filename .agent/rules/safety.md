# Safety Rules & Guardrails (Article I)

## 📌 Article I: Library-First
Every feature begins as a standalone library.

## 🔐 Security Guardrails

### ❌ NEVER Do
- Hardcode secrets/passwords.
- Commit `.env`.
- Run destructive commands (`rm -rf`) without approval.
- Auto-Merge Pull Requests (Human-only).
- Commit directly to `main` (Use feature branches).

### ✅ ALWAYS Do
- Use environment variables.
- Validate inputs.
- Ask before dangerous actions.

## ⚠️ Critical Safety Directives
- **NO** Dangerous Commands (`rm -rf`, force delete, format).
- **NO** Auto-Merge Pull Requests (Human-only).
- **NO** Committing Secrets/Keys (`.env` only).
- **NO** Committing directly to `main` (Use feature branches).
