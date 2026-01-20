# Short Code: /init
**Trigger:** When user inputs `/init` locally.

## Initialization Protocol
1. **Interactive Questionnaire:**
    Ask the user: "Project Name? Type? Stack?"

2. **Structure Generation:**
   - Create directories: `agent/rules`, `agent/workflow`, `docs`, `src`.
   - Copy Standard Templates: `agent.md`, `.cursorrules`, `rules/*`, `workflow/*`.
   - Create `.env.example` and `.gitignore`.

3. **Confirmation:**
   - Report: "Project [Name] initialized. Rules established."
