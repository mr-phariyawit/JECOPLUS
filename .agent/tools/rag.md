# 🧠 RAG System

## When to Enable
- Codebase > 10K LOC
- Multiple modules
- Need historical context

## Architecture
```
Docs → Chunk → Embed → Vector DB
                         ↓
Query → Embed → Search → Top-K → Context → LLM
```

## Config
```yaml
rag:
  enabled: true
  chunk_size: 500
  overlap: 50
  top_k: 20
  max_context: 50000
  vector_db: qdrant
```

## Context Injection
```markdown
## 📦 Context

**Direct (in memory):**
- Current spec
- team-history.md (last 5)
- Active files

**RAG Retrieved:**
- src/auth/login.ts (0.92)
- src/api/users.ts (0.87)
```

## Scaling Results
| Metric | Before | After |
|--------|--------|-------|
| Max LOC | 50K | 500K |
| Context | Fixed | Dynamic |
