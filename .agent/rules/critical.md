# Critical: Read First

## ⚠️ Critical Directives

### Conversation Size Limit

> **Start a new chat when:**
> - Conversation exceeds 50 messages
> - Switching to a new, unrelated topic
> - Agent becomes slow or unresponsive
>
> **Why?** Large conversations are the primary cause of "Agent terminated due to error".

### Error Recovery (Agent Terminated)

When encountering **"Agent terminated due to error"**:

1. **Switch Model**: Immediately downshift (High → Standard → Low)
2. **Disable MCPs**: Temporarily disable ALL MCP servers
3. **Fresh Chat**: Start new session if context > 20k tokens
4. **Hard Reset**: Run `./antigravity_toolkit.sh full` if issue persists
5. **HTTP Mode**: Ensure "HTTP Compatibility Mode" is set to "HTTP/1.1" in IDE Settings

### Root Cause: Memory Bloat (V8 OOM)

The "Agent terminated due to error" is often caused by **V8 JavaScript Engine Out of Memory (OOM)** due to data accumulation in `~/.gemini/antigravity/`. Key culprits:

| Folder                 | Risk Level   | Description                                |
| :--------------------- | :----------- | :----------------------------------------- |
| `browser_recordings/`  | **Critical** | Can grow to 50GB+ from browser automation  |
| `brain/`               | High         | Agent state/memory data                    |
| `conversations/`       | Medium       | Chat history (>300MB = problem)            |
| `implicit/`            | Medium       | Learned behaviors                          |

### Preventive Maintenance

**Check sizes periodically:**

```bash
du -sh ~/.gemini/antigravity/*/ 2>/dev/null | sort -hr
```

**Clean browser recordings (if not needed):**

```bash
# Check size first
du -sh ~/.gemini/antigravity/browser_recordings 2>/dev/null

# Delete if too large
rm -rf ~/.gemini/antigravity/browser_recordings
```

**Warning signs** - Reset recommended if:
- `browser_recordings/` > 10GB
- `brain/` > 500MB
- `conversations/` > 300MB
- Total `~/.gemini/` > 1GB
