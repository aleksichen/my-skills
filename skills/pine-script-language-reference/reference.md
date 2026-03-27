# Pine v6 Retrieval Guide

Primary mode is live-only query:

- Dynamic locate (recommended):
  - `SKILL_DIR="$(find "$HOME" -type f -path "*/pine-script-language-reference/scripts/query_pine_reference_live.js" 2>/dev/null | head -n 1 | xargs dirname | xargs dirname)"`
- Repository checkout usage:
  - `SKILL_DIR="$PWD/skills/pine-script-language-reference"`
- Run:
  - `node "$SKILL_DIR/scripts/query_pine_reference_live.js" <term>`
- Check:
  - `test -f "$SKILL_DIR/scripts/query_pine_reference_live.js" || echo "skill not found"`

## Module-First Triage

Use this when AI is unfamiliar with the API surface:

1. List modules:
   - `node "$SKILL_DIR/scripts/query_pine_reference_live.js" --list-modules --limit 30`
2. Drill one module:
   - `node "$SKILL_DIR/scripts/query_pine_reference_live.js" --module ta --module-list-entries --limit 40`
3. Verify exact symbol:
   - `node "$SKILL_DIR/scripts/query_pine_reference_live.js" ta.sma`

## Generic Check: "Does Pine v6 include X?"

Checklist:

- Identify target symbol/syntax (`ta.rsi`, `strategy.entry`, `if`, operator, type).
- Run exact query first (no prefix mode).
- If no exact hit, run prefix/module query for near candidates.
- Decide status:
  - `exact`: exact hit found
  - `partial`: partial hit only
  - `none`: no hit or live query error
- Record evidence line from description/syntax/returns.

## Unknown Token/Operator/Type Triage

### Unknown function or namespace

- `node "$SKILL_DIR/scripts/query_pine_reference_live.js" ta. --prefix --limit 50`
- `node "$SKILL_DIR/scripts/query_pine_reference_live.js" --module ta --module-list-entries --limit 80`

### Unknown operator / keyword

- Search exact operator/keyword symbol first.
- If ambiguous, inspect `_global` module entries:
  - `node "$SKILL_DIR/scripts/query_pine_reference_live.js" --module _global --module-list-entries --limit 120`

### Unknown type/system value

- Query exact type name (for example `series`, `input`, `array`, `matrix`).
- Then inspect nearest module (`array`, `matrix`, `map`, etc.).

## Common Module Recipes

- `ta` module:
  - `node "$SKILL_DIR/scripts/query_pine_reference_live.js" --module ta --module-list-entries --limit 100`
- `strategy` module:
  - `node "$SKILL_DIR/scripts/query_pine_reference_live.js" --module strategy --module-list-entries --limit 120`
- `request` module:
  - `node "$SKILL_DIR/scripts/query_pine_reference_live.js" --module request --module-list-entries --limit 60`

## Automation-Friendly Modes

- Evidence-focused result (single symbol):
  - `node "$SKILL_DIR/scripts/query_pine_reference_live.js" ta.sma --evidence`
- JSON output for other agents/scripts:
  - `node "$SKILL_DIR/scripts/query_pine_reference_live.js" ta.sma --json`
- Combine:
  - `node "$SKILL_DIR/scripts/query_pine_reference_live.js" ta.sma --evidence --json`

## Failure Semantics (Live-Only)

If live retrieval fails, report:

- failure reason (`HTTP`, parse chain failure, missing module)
- exact retry command
- status as `none` for retrieval result
