# Linear Workflow Rules (Pine)

## Global Constraints

- Always read current state before write operations.
- Every issue must have one `type/*` and one `area/*`.
- Status lifecycle: `Triage -> Backlog -> In Progress -> Done`.
- User instructions take precedence over default skill behavior.

## Bugfix Rule

- Default to root-cause fixes.
- If temporary mitigation is unavoidable, create linked `type/debt`.

## Done Gate (Execution Sync)

Required before marking `Done`:

- merge/landing evidence
- verification evidence
- docs update evidence

Bug-only required fields:

- root cause
- fix strategy
- regression test note

