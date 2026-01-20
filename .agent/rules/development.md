# Development Guidelines (Article III)

## 📌 Article III: Test-First
No code before tests (NON-NEGOTIABLE).

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

### Naming Conventions
- **Variables/Functions**: `camelCase`
- **Classes/Components**: `PascalCase`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Files**: `kebab-case.ts` or `PascalCase.tsx`

### Best Practices
- **File Limits**: No file > 500 lines. Refactor if necessary.
- **Modularity**: Frontend/Backend separation.
- **Error Handling**: `try/catch` with meaningful logs.
- **DRY**: detailed, reusable functions.

## 🧪 Testing Standards
> **NON-NEGOTIABLE**: All implementation MUST follow strict Test-Driven Development.

1.  **Write Tests FIRST**: Code must fail (Red) before it passes (Green).
2.  **Minimum Coverage**: 80% for critical paths.
3.  **Real Environments**: Real DBs over mocks (Article IX).
4.  **Browser Verification Loop**: After every code implementation or bug fix:
    1. Create or update relevant tests.
    2. Run `chrome-check` (browser/Playwright tests).
    3. If bugs are found → Fix → Re-run tests → Loop until all tests pass.
