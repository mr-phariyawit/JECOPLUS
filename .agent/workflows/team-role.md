---
description: Switch to a specific AI team role
---

# /team-role [role]

## Available Roles

| Shortcut | Role | Skill File |
|----------|------|------------|
| tl | Team Leader | `.agent/skills/roles/team-leader.md` |
| pm | Product Manager | `.agent/skills/roles/product-manager.md` |
| po | Product Owner | `.agent/skills/roles/product-owner.md` |
| ux | UXUI Designer | `.agent/skills/roles/uxui.md` |
| fe | Frontend Dev | `.agent/skills/roles/frontend.md` |
| be | Backend Dev | `.agent/skills/roles/backend.md` |
| api | API Dev | `.agent/skills/roles/api.md` |
| qa | QA Engineer | `.agent/skills/roles/qa.md` |
| devops | DevOps | `.agent/skills/roles/devops.md` |
| ai | AI Engineer | `.agent/skills/roles/ai-engineer.md` |

## Steps

1. Parse the role argument (e.g., `/team-role fe`)
2. Read the corresponding skill file from `.agent/skills/roles/`
3. Adopt the role's perspective, expertise, and templates
4. Announce:
   ```
   🎭 Role: [Role Name]
   📋 Expertise: [role expertise]
   🎯 Ready to work on: [current task]
   ```
5. Apply role-specific checklists and templates
6. Work on assigned tasks from that role's perspective
