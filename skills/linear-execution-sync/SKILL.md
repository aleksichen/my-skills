---
name: linear-execution-sync
description: Use when synchronizing Linear status, relations, and completion evidence during implementation and task closeout.
---

# Linear Execution Sync

## Purpose

Keep Linear execution state consistent with actual delivery progress and closeout evidence.

## Shared References

- `./references/linear-workflow-rules.md`
- `./references/linear-issue-templates.md`
- `./references/linear-tool-playbook.md`

## Workflow

1. Read issue state, relations, and prior comments.
2. Apply status/relation updates.
3. Add completion evidence comment.
4. If temporary mitigation is used, create linked `type/debt` issue.

## MCP Sequence

1. `get_issue` (include relations)
2. `list_comments`
3. `save_issue`
4. `save_comment`
5. `save_issue` (debt) when needed

## Done Gate

Allow `Done` only when all are present:

- merge or landing evidence
- verification evidence (test commands/results)
- doc update evidence

For bug issues, also require:

- root cause
- fix strategy
- regression test note

## Non-Goals

- No release-note drafting.
- No portfolio-level reprioritization.

