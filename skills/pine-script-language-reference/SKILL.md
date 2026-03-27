---
name: pine-script-language-reference
description: Use when retrieving Pine Script v6 reference information, including module discovery, symbol lookup, and extraction of syntax, arguments, returns, and remarks from live reference data.
---

# Pine Script Language Reference

## Overview

Use this skill as a general-purpose Pine v6 documentation retriever. It supports:

- broad exploration (module/category discovery)
- targeted lookup (exact symbol queries)
- structured extraction (syntax, arguments, returns, remarks)

## Data Sources

- Required source (live-only): `scripts/query_pine_reference_live.js` in this skill directory
- Official source URL: `https://www.tradingview.com/pine-script-reference/v6/`

Path setup for portable usage:

- Claude Code global install:
  - `SKILL_DIR="$HOME/.claude/skills/pine-script-language-reference"`
- Codex global install:
  - `SKILL_DIR="$HOME/.agents/skills/pine-script-language-reference"`
- Repository checkout usage:
  - `SKILL_DIR="$PWD/skills/pine-script-language-reference"`

## Retrieval Workflow

1. Start with module scope when the request is broad.
   - `--list-modules`
   - `--module <name> --module-list-entries`
2. Run exact symbol verification next.
   - Keep punctuation exactly: `ta.sma`, `strategy.equity`, `barstate.isnew`.
   - Query exact symbol without `--prefix`.
3. If exact fails, run namespace/prefix exploration.
   - Use `--prefix` with likely namespaces (`ta.`, `strategy.`, `array.`, `math.`, `request.`).
4. Return structured reference evidence.
   - Include `match`, `category`, `syntax`, `arguments`, `returns`, `remarks`, and command/source used.
5. Conclude with retrieval status.
   - `exact`: exact doc hit exists
   - `partial`: partial hit only
   - `none`: no hit or live query failed

## Live-Only Rules

- Always use live query script for validation tasks.
- Do not fallback to non-live sources for final answers.
- If live query fails, report failure explicitly with a retry command.

Failure template:

```markdown
Status: unknown (live retrieval failed)
Reason: <error>
Retry: node "$SKILL_DIR/scripts/query_pine_reference_live.js" <term>
Source: live TradingView Pine v6 reference
```

## Response Template (Reference Retrieval)

Use this compact template for support decisions:

```markdown
Match: <exact|partial|none>
Category: <Variables|Constants|Functions|Keywords|Types|Operators|Annotations|unknown>
Entry: <symbol/topic>
Syntax: <first syntax line or N/A>
Returns: <first return line or N/A>
Evidence: <1-2 lines from description/remarks>
Command: <exact CLI command used>
Source: live TradingView Pine v6 reference
```

## Command Patterns

- Module map:
  - `node "$SKILL_DIR/scripts/query_pine_reference_live.js" --list-modules`
- Module entries:
  - `node "$SKILL_DIR/scripts/query_pine_reference_live.js" --module ta --module-list-entries --limit 30`
- Exact symbol:
  - `node "$SKILL_DIR/scripts/query_pine_reference_live.js" ta.sma`
- Prefix expansion:
  - `node "$SKILL_DIR/scripts/query_pine_reference_live.js" ta. --prefix --limit 30`
- JSON/evidence mode (for automation):
  - `node "$SKILL_DIR/scripts/query_pine_reference_live.js" ta.sma --json --evidence`

## Guardrails

- Do not invent Pine APIs not returned by live queries.
- Distinguish clearly between exact and partial matches.
- Treat output as documentation retrieval results; users decide downstream usage.

## Additional Resource

- See `reference.md` for parser QA playbooks and module triage flows.
