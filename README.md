# my-skills

My personal collection of agent skills for Claude Code and compatible AI coding agents.

## Skills

| Skill | Description |
|-------|-------------|
| `using-linear` | Entrypoint for Linear collaboration — routes requests to the correct specialized skill |
| `linear-capture` | Capture tasks, bugs, and ideas into Linear issues |
| `linear-priority-council` | Triage and prioritize Linear issues |
| `linear-execution-sync` | Sync execution state with Linear during active development |
| `linear-release-drafter` | Draft release notes from Linear issues |
| `pine-script-language-reference` | Retrieve Pine Script v6 reference details from live TradingView data |

## Install

Uses [vercel-labs/skills](https://github.com/vercel-labs/skills) CLI.

```bash
# List available skills
npx skills add aleksichen/my-skills --list

# Install all skills globally for Claude Code
npx skills add aleksichen/my-skills --skill '*' -g -a claude-code

# Install a specific skill
npx skills add aleksichen/my-skills --skill using-linear -g -a claude-code

# Install to current project only (no -g flag)
npx skills add aleksichen/my-skills --skill using-linear -a claude-code
```
