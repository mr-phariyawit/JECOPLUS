# Documentation Standards (Article IX)

## 📌 Article IX: Integration-First
Prefer real databases over mocks.

## 📝 Documentation Style
- **Comments**: Explain "Why", not "What".
- **README**: Setup, Usage, Architecture.
- **Specs**: Living documentation.
- Update README after completion.
- Maintain Task Checklist status.
- Save Lessons Learned to `agent/memory/`.

## 📊 Visual Communication Standards
> **Rule**: You MUST use **Mermaid** diagrams to visualize ideas, workflows, and architectures whenever possible.

1.  **Always Visualize**: Don't just explain with text; show it with a diagram.
2.  **Context-Aware Diagrams**: Choose the right diagram type for the job:
    -   **Flowchart (`graph TD`)**: Logic flows, decision trees, processes.
    -   **Sequence (`sequenceDiagram`)**: API calls, object interactions, protocols.
    -   **Class (`classDiagram`)**: Data models, database schemas, OOP structures.
    -   **State (`stateDiagram-v2`)**: Lifecycle states, transitions.
    -   **Gantt/Timeline**: Project schedules, roadmaps.

## 🔀 Git Conventions

### Commit Messages
- Format: `<emoji> <type>: <description>`
- Example: `✨ feat: add user authentication`

### Branch Naming
- `spec/feature`
- `feature/description`
- `fix/description`
