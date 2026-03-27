---
name: linear-priority-council
description: Use when deciding what to do now, sequencing implementation order, or making go/no-go timing decisions from current Linear state.
---

# Linear Priority Council

## Purpose

Recommend actionable prioritization based on current cycle, milestones, dependencies, and risk.

## Shared References

- `./references/linear-workflow-rules.md`
- `./references/linear-tool-playbook.md`

## Workflow

1. Read current cycle and milestone context.
2. Read candidate issues and key dependencies.
3. Produce `Now / Next / Later` with explicit trade-offs.

## MCP Sequence

1. `list_cycles`
2. `list_milestones`
3. `list_issues`
4. `get_issue` with relations (as needed)

## Decision Factors

- Impact
- Urgency
- Dependency unlock
- Regression risk
- Effort

Use factors qualitatively unless user asks for explicit scoring.

## Required Rules

- Default mode is read-only.
- If user asks to apply decisions, switch to explicit write mode and confirm the write actions.

## Non-Goals

- No new issue capture for raw ideas (handoff to `linear-capture`).
- No status/done synchronization (handoff to `linear-execution-sync`).

