# Agent Workflow

Adopted October 3, 2026. This operating model complements
`MULTI_MACHINE_WORKFLOW.md` and existing conformance and release gates.

## Ownership

The designated primary chat is **Aurora Project Lead**
(`019eb8a3-78b6-7ce2-acc7-4f5e64c41275`). Continue implementation cycles here.
If ownership moves, update `ACTIVE_WORK.md` explicitly with the receiving chat
and a concrete handoff. Existing Manager, Planner, Researcher, and TechWriter
chats remain historical/advisory unless given a new bounded assignment.

| Role | Responsibility |
| --- | --- |
| Human product owner | Priorities, gameplay judgment, acceptance, and release decisions. |
| Codex lead | Own the work packet, delegate bounded tasks, implement, integrate, maintain local inspection, and report evidence. |
| Research specialist | Measure persisted references, identify uncertainty, and return an evidence packet. |
| Independent reviewer | Inspect the resulting change and acceptance evidence for regressions. |
| Technical writer | Reconcile documentation after accepted results. |
| Dot project steward | Track commitments, maintain a project brief, and surface actionable blockers using explicitly connected sources. |

Manager and Planner become one planning function. Existing role chats are
historical context; new assignments start from the current work packet.
Start with one lead and at most two specialists. Use subagents for bounded
independent tasks when available. Use separate worktrees for concurrent writers.
One shared checkout must not have multiple active editing owners.

## Cycle

1. Read `ACTIVE_WORK.md`, check source status, and verify relevant evidence.
2. Choose one player-visible objective and record acceptance criteria.
3. Assign independent research or review with baseline SHA, scope, deliverable,
   allowed changes, and required checks. Keep dependent repairs sequential.
4. Build and inspect locally. Record served checkout and build identity.
5. Run focused checks and independent review; preserve reference provenance.
6. Record accepted changes, remaining uncertainty, and the next assignment.
   Explain the intended player benefit of each recommendation and distinguish
   delivered gameplay improvement from evidence/testing that protects it.
   Continue the next justified bounded step under existing authorization; report
   outcomes at milestones without requiring routine repeated go-ahead messages.
7. Integrate accepted work into clean main. Bundle related accepted changes for
   an explicitly authorized `/dev` review through existing gates.

Localhost is the active inspection surface. Hosted `/dev` is the shared review
surface. Beta and production remain explicit release decisions under existing
machine authority. Evidence freshness blocks must be resolved, never bypassed.

## Work Packet

Use `ACTIVE_WORK.md` for the current cycle and existing stamped artifact folders
for measurements. Each packet records objective, owner, branch/worktree,
baseline SHA, references, acceptance criteria, checks, measured results,
limitations, and next steps. Preserve closed packets in existing project notes
or issue records before replacing them. GitHub issues track queued work.

## Managing The Project

Tell the lead the desired outcome and constraints, for example:

> Resume ACTIVE_WORK.md. Verify the baseline, keep localhost available, delegate
> independent research and review where tools support it, and return measured
> results with the next decision. Do not publish.

Give feedback on the running game and acceptance evidence. Ask for a status
report in this format: outcome, source/build identity, checks and measurements,
remaining concerns, and next decision. Manual copying between role chats is
optional; the repository packet is the shared technical record.

## Coordination In Practice

Official guidance reviewed October 3, 2026 supports ongoing dot coordination,
bounded Codex execution, durable project records, and verification at milestones.
Apply it as follows:

- Dot owns ongoing follow-through: track the active objective, inspect reported
  results, identify stalled work, and bring decisions to the human. It can
  continue an existing local Codex task when explicitly assigned and accessible.
- Aurora Project Lead owns implementation and integration. New assignments
  include objective, baseline, scope, artifact paths, acceptance criteria,
  stopping conditions, and authorized release lane. Dot should route an active
  objective to this chat rather than create a competing implementation owner.
- Use specialists for independent read-heavy research, triage, and review.
  Give each a bounded deliverable and require concise findings with provenance.
  Parallel editing requires isolated worktrees and one integration owner.
- Required rules live in AGENTS.md and checked-in records. Dot memory and chat
  context help recall but are not a complete project transcript. Supply relevant
  context explicitly to every delegated task.
- Completion means acceptance evidence, not merely a completed agent run.
  Reports include source/build identity, measured results, checks, limitations,
  persisted artifacts, and the next decision. Inspect localhost at milestones.
- October 4 direction review: keep lead ownership stable but execution packets
  bounded to coherent outcomes; do not recreate permanent role chats for every
  cycle. Dot should prepare ready work and surface product decisions/dependencies,
  not repeatedly report an unchanged checkout. Repository packets remain the
  shared record when a worker cannot read lead turns. Recommendations and pending
  decisions are recorded in PROJECT_DIRECTION_REVIEW.md; no new Dot schedule or
  responsibility has been configured by that document alone.
- Let dot follow up when useful; fixed schedules are optional and must be
  explicitly saved and confirmed. Notify only for meaningful changes or decisions.
- Continue authorized work through implementation and validation without
  requiring repeated "go ahead" messages for each routine step.

Stewardship verification chat `01a10209-c596-74c0-935c-31165cd380f7`
reports dot is assigned in-app and Mac/repo/chat access was verified through
its work. This lead can read that verification chat; no fixed schedule is
reported. This is evidence of the stewardship lane, not a claim that this lead
has a direct dot configuration API or unrestricted access to dot's conversations.

Sources:
- https://learn.chatgpt.com/docs/dots/tasks-and-memory
- https://developers.openai.com/blog/run-long-horizon-tasks-with-codex
- https://learn.chatgpt.com/docs/agent-configuration/subagents

## Permission Defaults

Keep workspace-scoped filesystem access and normal approval review enabled.
Persist approvals for specific trusted build, local service, and relevant
browser-backed harness commands. On macOS, browser harnesses need execution
outside the filesystem sandbox; approve their explicit npm script prefixes
rather than arbitrary node, Python, shell, or package-execution prefixes.
Use read-only dot access for stewardship where the connection supports it;
authorize follow-ups to the identified lead explicitly. Keep deployment lane
decisions separate from command permissions: a saved publish approval does not
authorize a new release. Avoid blanket full-access or unattended destructive
Git permissions. These are recommendations, not changes to app security settings.

## Dot Assignment Text

Provide this after connecting the repository or a maintained project brief:

```text
Act as Aurora's project steward. Use ACTIVE_WORK.md, AGENT_WORKFLOW.md,
current issue records, and accepted reports as your sources. Track priorities,
commitments, blockers, and decisions. Separate verified current facts from
historical findings. Keep a concise project brief with source dates and links.
Notify me only about meaningful progress, blockers, or decisions I need to make.
Ask the Codex lead for concrete evidence when a report is ambiguous, using only
communication channels I have authorized. Do not edit gameplay, merge branches,
or publish releases. Do not claim repository or agent access until verified.
```

This document does not itself configure dot, connect accounts, send messages,
or create schedules. The stewardship verification above supersedes earlier
"setup pending" statements. Further delegation or scheduling must be confirmed
through the product's corresponding tools.

Official guidance:
- https://learn.chatgpt.com/docs/agent-configuration/subagents
- https://learn.chatgpt.com/docs/environments/git-worktrees
- https://learn.chatgpt.com/docs/dots/getting-started
