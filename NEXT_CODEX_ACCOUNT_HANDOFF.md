# Next Codex Account Handoff

Use this file when continuing Aurora Galactica / Platinum work from this same
local folder in a different Codex account.

## Local Folder

Open this exact folder as the project workspace:

```text
/Users/sgwoods/Library/Mobile Documents/com~apple~CloudDocs/MacBookProDocs/Codex/Codex-Test1
```

## First Commands

From the repo root, run:

```bash
git switch main
git pull --rebase origin main
npm run machine:bootstrap
npm run machine:status
npm run machine:doctor
```

If GitHub CLI authentication is missing in the new account context, run:

```bash
gh auth status
gh auth login
gh auth setup-git
```

## Current Authority Model

- `Codex-Test1` is the authoritative engineering source repo.
- `Aurora-Galactica` is the public release-host mirror only.
- This MacBook may develop, run harnesses, create branches, commit, push, and
  merge normal development work.
- This MacBook must not approve beta, publish beta, promote production, or
  publish production unless release authority is explicitly transferred here.
- Release authority currently remains:
  - `machine_id`: `imacm1`
  - `machine_label`: `iMacM1`

Before any release work, run:

```bash
npm run release:show-authority
```

If authority does not match this machine, stop before beta or production publish
steps.

## Current Project State

As of the April 26, 2026 handoff:

- `main` is the authoritative integration branch.
- Hosted `/beta` and hosted `/production` are aligned to the `1.2.3` production
  family.
- Hosted `/dev` is the older forward integration lane and can move again when a
  coherent bundle is ready.
- The next product direction is no longer just minor polish. The roadmap now
  treats level-by-level Aurora depth, challenge-stage richness, shared gameplay
  videos, and an earlier second-game Platinum preview as major product pillars.

Key live lane state:

- `/dev`: `1.2.3+build.470.sha.e4732eb`
- `/beta`: `1.2.3-beta.1+build.489.sha.f6ba6c2.beta`
- `/production`: `1.2.3+build.489.sha.f6ba6c2`

## Important Docs To Read

Start with:

- [MACBOOK_CODEX_PROMPT.md](MACBOOK_CODEX_PROMPT.md)
- [LEVEL_BY_LEVEL_EXPANSION_PLAN.md](LEVEL_BY_LEVEL_EXPANSION_PLAN.md)
- [LONG_TERM_RELEASE_ROADMAP.md](LONG_TERM_RELEASE_ROADMAP.md)
- [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md)
- [PLAN.md](PLAN.md)
- [GO_FORWARD_EXECUTION_PLAN.md](GO_FORWARD_EXECUTION_PLAN.md)
- [RESTART_FROM_HERE.md](RESTART_FROM_HERE.md)

Then read as needed:

- [MULTI_MACHINE_WORKFLOW.md](MULTI_MACHINE_WORKFLOW.md)
- [DEVELOPER_MACHINE_BASELINE.md](DEVELOPER_MACHINE_BASELINE.md)
- [RELEASE_POLICY.md](RELEASE_POLICY.md)
- [QUALITY_RELEASE_SCORECARD.md](QUALITY_RELEASE_SCORECARD.md)
- [VIDEO_ALIGNMENT_PROGRAM.md](VIDEO_ALIGNMENT_PROGRAM.md)
- [REFERENCE_MEDIA_INVENTORY.md](REFERENCE_MEDIA_INVENTORY.md)
- [PLATINUM_INTERFACE_REVIEW.md](PLATINUM_INTERFACE_REVIEW.md)
- [REPOSITORY_ROLE_MAP.md](REPOSITORY_ROLE_MAP.md)

## Immediate Next Work

The recommended next branch is:

```bash
git switch main
npm run machine:bootstrap
git switch -c codex/macbook-pro-audio-phase-gate
```

Goal:

- fix or recalibrate the failing `harness:check:audio-theme-phases`
- rerun `harness:score:quality-conformance`
- update scorecard/docs if the quality model changes

After that:

```bash
git switch main
git pull --rebase origin main
git switch -c codex/macbook-pro-level-expansion-plan
```

Goal:

- create the first detailed Aurora stage-family map
- define the first challenge-stage expansion slice
- define the first later-level entry/movement variation slice
- map alien families, movement behaviors, reference evidence, and harness needs

## Exact Prompt For The New Codex Account

Paste this into the new Codex account after adding this folder to the project:

```text
You are working on Aurora Galactica / Platinum in the authoritative source repo:

- Repo: sgwoods/Codex-Test1
- Local clone: use the current local workspace open in Codex
- Integration branch: main
- Current local folder:
  /Users/sgwoods/Library/Mobile Documents/com~apple~CloudDocs/MacBookProDocs/Codex/Codex-Test1

Important repo roles:
- Codex-Test1 = source of truth for code, docs, issues, planning, harnesses, release control
- Aurora-Galactica = public release-host repo only
- Do not treat Aurora-Galactica as the engineering source repo
- Active issues and planning belong in Codex-Test1

Multi-machine workflow:
- This machine is fully set up for development and testing
- Release authority is intentionally NOT on this machine right now
- Release authority remains on:
  - machine_id: imacm1
  - machine_label: iMacM1
- This machine may develop, run harnesses, create branches, commit, push, and merge normal development work
- This machine must not approve beta, publish beta, promote production, or publish production unless release authority is explicitly transferred here

Startup routine:
1. Start from the Aurora repo root
2. Run:
   npm run machine:bootstrap
   npm run machine:status
   npm run machine:doctor
3. If release work is requested, first run:
   npm run release:show-authority
   and stop if authority does not match this machine

Branching rules:
- Start from main
- Use short-lived topic branches
- On this machine, prefer:
  codex/macbook-pro-<topic>

Current product direction:
- Keep 1.3 as the measurement-backed quality reset
- Use 1.3 to produce the first committed level-expansion blueprint
- Make 1.4 the first major level-by-level arcade-depth release
- Make 1.5 the shared gameplay-video and flight-recorder release
- Bring a second-game Platinum sneak peek forward after those foundations, before full 2.0

Immediate next recommended work:
1. Branch: codex/macbook-pro-audio-phase-gate
   - fix or recalibrate harness:check:audio-theme-phases
   - rerun harness:score:quality-conformance
   - update scorecard/docs if the quality model changes
2. Branch: codex/macbook-pro-level-expansion-plan
   - create the Aurora stage-family map
   - define the first challenge-stage expansion slice
   - define the first later-level entry/movement slice
   - map alien families, movement behaviors, reference evidence, and harness needs

Important docs to read first:
- NEXT_CODEX_ACCOUNT_HANDOFF.md
- MACBOOK_CODEX_PROMPT.md
- LEVEL_BY_LEVEL_EXPANSION_PLAN.md
- LONG_TERM_RELEASE_ROADMAP.md
- PRODUCT_ROADMAP.md
- PLAN.md
- GO_FORWARD_EXECUTION_PLAN.md
- RESTART_FROM_HERE.md

Operational rules:
- Prefer repo-grounded verification before conclusions
- Persist important plans and decisions in repo docs, not just chat
- Keep docs current when workflows or release state changes
- All meaningful work should end up committed to GitHub
- Do not use sudo or su for normal Aurora development
- Use GitHub, not iCloud syncing of the same working tree across machines, as the sync mechanism
- Non-destructive commands do not need extra user confirmation
```

## Notes For Continuity

- Local services:
  - Game: `http://127.0.0.1:8000/`
  - Viewer: `http://127.0.0.1:4311/`
- If the viewer root reports not OK, check `http://127.0.0.1:4311/api/runs`
  because `local:resume` starts that endpoint.
- If harnesses fail with localhost bind errors, rerun with normal local network
  permissions.
- If Git push fails after the account switch, run `gh auth setup-git`.
