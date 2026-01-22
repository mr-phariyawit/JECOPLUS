# 🤖 AI Team History

## Project: JECOPLUS
**Started:** 2026-01-22
**Status:** Active

---

## 📅 Sessions

### Session 1: Login & eKYC Testing (Completed)
**Date:** 2026-01-22
**Focus:** Implement and run test suite for Login & eKYC (`specs/test-suite-login-ekyc.md`)
**Roles:** QA (Testing), BE (Backend), FE (Frontend)
**Status:** **DONE**
- **Backend Unit Tests:** ✅ Completed (25/25 passed) - Fixed `tokenService`, mocked `firebaseService`.
- **Frontend Unit Tests:** ✅ Completed (9/9 passed) - Stores (Auth, KYC) verified with Vitest.
- **Integration Tests:** ⏸️ Skipped (Requires DB/Docker setup).

---

## 👤 Human Decisions

- **2026-01-22**: Resume testing to fix issues.
- **2026-01-22**: Proceed with Frontend testing.

---

## 🎓 Learnings

- Backend `tokenService` throws custom `ApiError` code objects, not simple strings.
- Frontend testing requires `vitest.config.js` to explicitly exclude backend test folders to avoid checking Jest files.
- Alias `@` in Vitest Config helps in resolving source files correctly.
