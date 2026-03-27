---
name: linear-capture
description: Use when recording new ideas, bugs, spikes, or feature directions into Linear with required labels and dedup checks.
---

# Linear Capture

## Purpose

Normalize new work items into Linear without duplicates and with required metadata.

## Shared References

- `../linear-references/linear-workflow-rules.md`
- `../linear-references/linear-issue-templates.md`
- `../linear-references/linear-tool-playbook.md`

## Workflow

1. Validate labels and status assumptions.
2. Run dedup query on existing issues.
3. Create or update issue with mandatory fields.
4. Add structured context comment when needed.

## MCP Sequence

1. `list_issue_labels`
2. `list_issues` (keyword dedup)
3. `save_issue`
4. `save_comment` (optional)

## Required Rules

- Every issue must include one `type/*` and one `area/*`.
- Bug issues must include symptom, repro, and expected-vs-actual.
- Exploratory items must use `[Spike]` in title.
- New long-range direction items should default to parent issue shape.

## Non-Goals

- No global prioritization.
- No completion-state synchronization.

