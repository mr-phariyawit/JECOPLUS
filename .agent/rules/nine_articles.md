# The Nine Articles of Development

## 📐 Specification-Driven Development (SDD)

### The Constitutional Foundation

| Article | Principle |
|:--------|:----------|
| **I** | **Library-First**: Every feature begins as a standalone library. |
| **II** | **CLI Interface**: Expose functionality through command-line. |
| **III** | **Test-First**: No code before tests (NON-NEGOTIABLE). |
| **VII** | **Simplicity**: Max 3 projects initially. |
| **VIII** | **Anti-Abstraction**: Use framework directly. |
| **IX** | **Integration-First**: Prefer real databases over mocks. |

### Pre-Implementation Gates
Before implementation, pass these gates:

```markdown
#### Simplicity Gate (Article VII)
- [ ] Using ≤3 projects?
- [ ] No future-proofing?

#### Anti-Abstraction Gate (Article VIII)
- [ ] Using framework directly?
- [ ] Single model representation?

#### Integration-First Gate (Article IX)
- [ ] Contracts defined?
- [ ] Contract tests written?
```
