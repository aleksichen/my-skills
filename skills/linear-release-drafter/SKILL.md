---
name: linear-release-drafter
description: Use when drafting release notes from the latest completed cycle and done issues, with optional changelog update after confirmation.
---

# Linear Release Drafter

## Purpose

Generate release-note drafts from cycle-scoped `Done` issues and optionally update `CHANGELOG.md`.

## Shared References

- `../linear-references/linear-workflow-rules.md`
- `../linear-references/linear-issue-templates.md`
- `../linear-references/linear-tool-playbook.md`

## Workflow

1. Identify release scope (default latest closed cycle).
2. Read done issues within scope.
3. Draft grouped release notes.
4. Ask confirmation before file write.
5. Optionally append section to `CHANGELOG.md`.

## MCP Sequence

1. `list_cycles`
2. `list_issues` (cycle + state=Done)
3. `get_issue` (as needed)

## Grouping Rules

- `type/feature` -> `Added`
- `type/bug` -> `Fixed`
- `type/debt` -> `Debt/Refactor`

## CHANGELOG Policy

- Default: output draft only.
- Write mode: only after explicit user confirmation.
- Append mode: add a new section `## <version-or-cycle>` at file end.
- If `CHANGELOG.md` does not exist, create file header first.

## Non-Goals

- No status synchronization.
- No backfill of missing metadata outside release scope.

