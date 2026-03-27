# Linear MCP Tool Playbook

## Step 0: MCP Bootstrap (macOS)

Run this only when Linear MCP is unavailable.

1. If runtime is Codex:
- add MCP: `codex mcp add linear --url https://mcp.linear.app/mcp`
- login: `codex mcp login linear`
- ask user to restart Codex and retry request

2. If runtime is not Codex:
- do not output Codex-only commands
- ask user to install/login Linear MCP through the active client
- ask user to restart that client and retry request

Notes:
- Project scope supports macOS only.
- Do not provide WSL/Windows fallback instructions.

## Read-Then-Write Sequences

## Capture

1. `list_issue_labels`
2. `list_issues` (dedup search)
3. `save_issue` with concise description and repo document path/URL
4. `save_comment` (optional context)

## Priority

1. `list_cycles`
2. `list_milestones`
3. `list_issues`
4. `get_issue` (relations as needed)

## Execution Sync

1. `get_issue` (relations)
2. `list_comments`
3. `save_issue`
4. `save_comment`
5. optional `save_issue` for `type/debt`

## Release Draft

1. `list_cycles`
2. `list_issues` (cycle + done)
3. `get_issue` (as needed)

## Failure and Degrade Policy

1. Missing context objects (`team/project/cycle`):
- stop write actions
- report missing object and likely fix

2. Empty query result:
- return explicit empty state
- offer next action options

3. Validation failures on write:
- return failed field(s)
- return minimal retry payload

4. Auth/permission failure:
- stop workflow
- ask user to validate workspace/auth
- if Linear MCP missing, switch to Step 0 bootstrap flow

5. Transient timeout/network:
- retry once
- if still failing, return failure summary and stop

## Error Output Template

```text
Linear MCP failed at: <tool-name>
Reason: <short error>
Impact: <what could not be completed>
Next step: <1-2 actionable options>
```
