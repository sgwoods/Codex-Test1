# Recovery-Safe Collaboration

This guide is the exception workflow when two machines are active and one
machine holds meaningful uncommitted work that may be ahead of GitHub and ahead
of the hosted `/dev` lane.

The normal day-to-day workflow is now:

- [MULTI_MACHINE_WORKFLOW.md](MULTI_MACHINE_WORKFLOW.md)

Use this document only when the normal one-authority, topic-branch workflow is
not safe enough because unpublished work already exists on another machine.

On this machine, use the following names to avoid confusion:

- `local-support`
  - work and previews created on this machine
- `hosted-dev`
  - the published `/dev` lane only
- `laptop-local`
  - unpublished local work on the laptop

Current example:

- machine A
  - this machine
  - `local-support`
  - may prepare isolated changes
- machine B
  - the laptop
  - `laptop-local`
  - remains the authority for deciding how new work is integrated

## Core Rule

Do not use `local-support` to advance the canonical release line when
`laptop-local` may contain newer uncommitted work.

In this mode:

- do not promote `hosted-dev` to `/beta` from `local-support`
- do not promote `/beta` to `/production` from `local-support`
- do not push directly to `main` from `local-support`
- do not rewrite or clean up release branches while laptop recovery is pending

## Safe Branch Model

All work from `local-support` must live on isolated branches cut from the
current remote `main`.

Branch naming:

- `codex/recovery-<topic>`
- `codex/safe-<topic>`

Examples:

- `codex/recovery-build-stamp-copy`
- `codex/safe-harness-cleanup`

The purpose of these branches is to make later review on the laptop optional and
explicit.

## What Is Safe To Do From `local-support`

Good candidates:

- docs
- tooling
- harness improvements
- analysis artifacts
- narrowly scoped bug fixes
- low-conflict cleanup

Avoid unless explicitly required:

- release metadata changes
- lane promotion changes
- production-facing manifest edits
- broad refactors across active gameplay systems

## Commit Style For Recovery-Safe Work

Keep commits small and topic-pure.

Recommended commit style:

- one concern per commit
- explain intent, not just files touched
- prefer messages that laptop review can scan quickly

Examples:

- `Clarify build-stamp copy in development lane`
- `Document recovery-safe two-machine workflow`
- `Tighten harness input-state logging`

## Push Policy

It is safe to push isolated branches from `local-support` to GitHub.

It is not safe to merge them into `main`, `beta`, or production-release paths
until the laptop has reviewed them.

`local-support` rule:

1. branch from current `main`
2. make isolated changes
3. commit clearly
4. push the branch
5. stop

## Laptop Review Workflow

When the laptop becomes available, treat it as the decision point.

First preserve laptop-only state before integrating anything:

1. capture `git status --short`
2. capture `git branch -vv`
3. capture `git log --decorate --graph --all --max-count=100`
4. save a full backup of the working tree
5. save a patch or stash export for uncommitted work

Only after that should the laptop inspect `local-support` branches.

## Instructions For Future Codex On The Laptop

When operating on the laptop during recovery:

1. assume laptop-local uncommitted work may be the highest-fidelity source
2. do not discard or overwrite laptop-local changes
3. fetch `local-support` branches from GitHub
4. compare them against the laptop working tree before proposing integration
5. prefer cherry-picking or manual porting when the laptop has overlapping work
6. merge only when overlap is understood and low-risk

Suggested review commands:

```bash
git fetch origin
git branch -r | rg 'codex/(recovery|safe)-'
git log --oneline --decorate origin/main..origin/codex/recovery-branch-name
git diff --stat origin/main...origin/codex/recovery-branch-name
git diff origin/codex/recovery-branch-name -- <path>
```

If the laptop has overlapping local work, prefer:

```bash
git cherry-pick <commit>
```

or manual integration after side-by-side diff review.

Avoid blind merge during recovery.

## Integration Decision Rules

Use this order:

1. if the laptop already contains the same idea, ignore the `local-support`
   branch
2. if the `local-support` change is clearly better and low-conflict, cherry-pick
   it
3. if both sides evolved the same area differently, manually reconcile on the
   laptop
4. only merge the full `local-support` branch when overlap is minimal and well
   understood

## Release Rule During Recovery

Until laptop reconciliation is complete:

- `production` stays frozen unless there is a true emergency
- `beta` stays frozen unless the laptop explicitly approves the candidate
- `hosted-dev` is informational, not authoritative
- `local-support` branches are inputs to review, not release candidates

For the current release-state picture, see
[RELEASE_STATE_MAP.md](RELEASE_STATE_MAP.md).

## Session Handoff Note

When Codex works from `local-support`, include this note in the final summary
whenever relevant:

- work was prepared on an isolated recovery-safe branch
- nothing was merged into `main`
- laptop review is still required before integration or promotion
