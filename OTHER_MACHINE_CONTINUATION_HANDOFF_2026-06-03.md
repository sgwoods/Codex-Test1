# Other Machine Continuation Handoff

Updated: June 3, 2026

This note captures the state of the release-authority checkout after the hosted
Arcade Music bugfix pass and after the MacBook guardrail tranche was integrated
on `main`.

## Authority Snapshot

- repo: `/Users/steven/Projects-All/Codex-Test1`
- branch: `main`
- head: `ed8d7f18`
- working tree: clean
- release authority:
  - `machine_id`: `imacm1`
  - `machine_label`: `iMacM1`
  - `current_machine_matches`: `true`

## Live Lane Snapshot

- hosted `/dev`
  - label `1.4.0.1+build.1006.sha.ed8d7f18`
  - commit `ed8d7f18`
- hosted `/beta`
  - label `1.4.0-beta.1+build.1006.sha.ed8d7f18.beta`
  - commit `ed8d7f18`
- hosted `/production`
  - label `1.4.0+build.894.sha.1dc23d8a`
  - commit `1dc23d8a`

Interpretation:

- `/dev` and `/beta` are intentionally aligned.
- `/production` is the last stable public release and is `112` commits behind
  `main`.
- this session did not promote production.

## What Was Integrated Here

MacBook guardrail tranche already merged on authority `main`:

- merge commit:
  - `595f59c9` `Merge remote-tracking branch 'origin/codex/macbook-ingestion-grammar-sync'`
- carried MacBook head:
  - `249117d2` `Strengthen 2UP and challenge tour guardrails`

Expected outcomes from that merge remain intact:

- `2UP` persona scoring stays lane-isolated
- Watch Mode includes `CHALLENGE TOUR / CHALLENGING STAGES ONLY`
- challenge tour begins at Challenging Stage `3-4` and advances through
  Challenging Stage `7-8` without ship loss in the checked flow
- overall quality remained about `8.6/10`
- weakest category remained `challenge-set-piece`

## What This Session Added After The MacBook Merge

Hosted Arcade Music recovery and publish pass:

- `707c4437` `Add hosted Arcade Music iframe fallback`
- `45a0f542` `Harden hosted Arcade Music fallback`
- `1bc961e8` `Strengthen hosted Arcade Music iframe recovery`
- `ddeddcef` `Loosen hosted Arcade Music iframe promotion`
- release-doc and review-packet refresh commits through:
  - `ed8d7f18` `Refresh code review packet after handoff conformance docs`

Practical result:

- localhost still reaches direct playable Arcade Music
- hosted `/dev` and `/beta` now recover into playable iframe-only fallback
  state instead of falling through to `Arcade Music unavailable`
- this is a hosted playback recovery pass, not the final release-process
  hardening pass

## What The Other Machine Should Not Redo

Do not reopen these as if they were still unmerged:

- `codex/macbook-ingestion-grammar-sync`
- the hosted Arcade Music recovery/publish chain
- the public/private artifact boundary baseline

The correct starting point is current `origin/main`, not any older local topic
branch that predates `ed8d7f18`.

## Best Next Continuation Options

### Option 1: Guardians Quality

Branch:

```bash
git switch main
git pull --rebase origin main
git switch -c codex/macbook-challenge-set-piece-quality
```

Goal:

- attack the weakest remaining category directly
- use measured reference windows and evidence-first challenge-stage review
- treat this as gameplay quality work, not release-process work

### Option 2: Release/Platform Guardrails

Branch:

```bash
git switch main
git pull --rebase origin main
git switch -c codex/macbook-release-lane-guardrails
```

Goal:

- require fresh hosted `/dev` parity before `/beta` publish
- add a hosted Arcade Music verifier that expects real fallback play state
- make future lane state less confusing

## Commands To Re-Ground On The Other Machine

```bash
cd <your-local-Codex-Test1-checkout>
git switch main
git pull --rebase origin main
git status --short
git rev-parse --short HEAD
npm run machine:bootstrap
npm run machine:status
npm run machine:doctor
npm run release:show-authority
```

Expected current head after sync:

```text
ed8d7f18
```

## Release Boundary Reminder

The other machine may continue development, harness, analysis, and branch work.

The other machine should not:

- approve beta
- promote production
- publish beta
- publish production

Unless release authority is explicitly transferred away from `iMacM1`.
