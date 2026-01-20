# 🔒 Security Pipeline

## Scan Stages
```
Code → SAST → Deps → Secrets → Pass? → Deploy
                                 ↓ No
                              Fix → Rescan
```

## Tools & Commands
```bash
# Secrets (pre-commit)
gitleaks detect --source .

# SAST
semgrep --config auto ./src

# Dependencies
npm audit --production
pip audit

# Container
trivy image app:latest
```

## Severity Rules
```yaml
block_on: [critical, high]
warn_on: [medium]
log_only: [low]
```

## Quick Checklist
- [ ] No hardcoded secrets
- [ ] No SQL injection
- [ ] No XSS vulnerabilities
- [ ] Dependencies patched
- [ ] HTTPS enforced
- [ ] Auth implemented
- [ ] Input validated

## OWASP Top 10
| # | Vulnerability | Check |
|---|---------------|-------|
| A01 | Broken Access | AuthZ on all endpoints |
| A02 | Crypto Failures | Strong hashing |
| A03 | Injection | Parameterized queries |
| A04 | Insecure Design | Threat modeling |
| A05 | Misconfiguration | No debug in prod |
