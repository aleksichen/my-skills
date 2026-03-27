---
name: using-linear
description: Use when handling any Pine Linear collaboration request and routing it to the correct specialized Linear skill.
---

# Using Linear

## Purpose

Provide one entrypoint for Linear collaboration requests, then route each request to exactly one specialized skill.

## Do / Don't

- Do: classify intent, choose primary skill, explain routing, and hand off.
- Do: split multi-intent requests into sequential phases.
- Do: run MCP connectivity preflight and assist setup when missing.
- Don't: perform business write operations directly.
- Don't: imply automatic skill chaining.

## Shared Rules

Before routing, load shared references:
- `../linear-references/linear-workflow-rules.md`
- `../linear-references/linear-tool-playbook.md`

## MCP Preflight

Before any routing, verify Linear MCP is available. If unavailable, switch to setup-assist mode:

1. Explain missing dependency clearly.
2. Run platform-specific setup guidance:
   - If runtime is Codex:
     - `codex mcp add linear --url https://mcp.linear.app/mcp`
     - `codex mcp login linear`
     - ask user to restart Codex session
   - If runtime is not Codex:
     - do not output Codex-specific commands
     - instruct user to install/login Linear MCP through the current client
     - ask user to restart that client session
3. Confirm setup outcome and remind user that restart is required.
4. Stop further workflow execution until session is restarted.

Platform scope: only macOS is supported in this project. Do not provide WSL/Windows setup paths.

## Intent Routing

- Record or create work items: use `linear-capture`
- Decide priority, sequencing, or go/no-go: use `linear-priority-council`
- Sync execution status, relations, completion evidence: use `linear-execution-sync`
- Draft release notes from cycle/done work: use `linear-release-drafter`

## Multi-Intent Execution (Manual, Not Automatic)

When one request contains multiple intents, output phased steps and execute one phase at a time:

1. `linear-capture`
2. `linear-priority-council`
3. `linear-execution-sync`
4. `linear-release-drafter`

Skill tools do not auto-chain. The agent must invoke each phase explicitly.

Sequence exception:
- If user explicitly specifies order (for example "judge first, then create issue"), follow user order instead of the default phase order.
- If user asks for current phase only, stop after that phase.

## Routing Guardrails

- User instructions override default routing preferences.
- If already executing inside a sub-skill context, do not recurse into `using-linear` again.
- If routing confidence is low, ask one minimal clarification question before any write action.
- If MCP preflight fails, do setup-assist first and defer routing.

## Output Contract

Always return:

```markdown
Routing decision
- Primary skill: <skill-name>
- Reason: <one sentence>
- Plan:
1. <phase 1>
2. <phase 2 if needed>
```
