# 🏗️ Architecture Review

## Triggers
| Change | Vote Type |
|--------|-----------|
| DB schema | Critical |
| External service | Critical |
| Auth changes | Critical |
| New >500 LOC | Standard |
| Refactoring | Standard |
| Bug fix | Optional |

## ADR Template
```markdown
# ADR-[N]: [Title]

**Status:** Proposed | Accepted | Deprecated
**Date:** [DATE]

## Context
[Why is this decision needed?]

## Decision
[What did we decide?]

## Consequences
- Good: [Benefit]
- Bad: [Tradeoff]

## Alternatives
1. [Alt 1] - Rejected because [reason]
```

## Review Checklist
- [ ] Follows spec
- [ ] Security reviewed
- [ ] Performance assessed
- [ ] Rollback plan exists

## Process
```
Create ADR → Present → Vote → Document → Implement
```
