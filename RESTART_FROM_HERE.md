# Restart From Here

This document is the durable handoff point for restarting Aurora and Platinum
work from a new machine or a new Codex thread after the April 24, 2026 release
push.

## Authoritative Repo

- repo:
  - `/Users/steven/Documents/Codex-Test1`
- primary Git remote:
  - `origin -> https://github.com/sgwoods/Codex-Test1.git`
- active integration branch going forward:
  - `main`

## Live Lane State

Verified on April 24, 2026:

- hosted `/dev`
  - `1.2.3+build.470.sha.e4732eb`
  - [dev build-info](https://sgwoods.github.io/Aurora-Galactica/dev/build-info.json)
- hosted `/beta`
  - `1.2.3-beta.1+build.489.sha.f6ba6c2.beta`
  - [beta build-info](https://sgwoods.github.io/Aurora-Galactica/beta/build-info.json)
- hosted `/production`
  - `1.2.3+build.489.sha.f6ba6c2`
  - [production build-info](https://sgwoods.github.io/Aurora-Galactica/build-info.json)

This means hosted `/beta` and hosted `/production` are now aligned to the same
release commit family, while hosted `/dev` remains older and can be refreshed
later as part of the next polish cycle.

## Public Project Page State

The raw `sgwoods/public` Aurora page has already been synced to the shipped
production posture and includes the new current-focus text and provenance
marker.

Known note from this checkpoint:

- the rendered GitHub Pages copy at
  [sgwoods.github.io/public/aurora-galactica.html](https://sgwoods.github.io/public/aurora-galactica.html)
  was still showing the older beta-promotion focus text immediately after sync
- the raw GitHub content already reflects the shipped production posture
- treat this as a propagation/cache follow-up first, not as a missing source
  sync

First follow-up check on a fresh machine/thread:

```bash
npm run verify:public
```

If that still fails only on rendered current-focus text, compare:

- raw:
  - `https://raw.githubusercontent.com/sgwoods/public/main/aurora-galactica.html`
- rendered:
  - `https://sgwoods.github.io/public/aurora-galactica.html`

## What Is Persisted

The important project state is committed and pushed:

- release and planning docs
- quality scorecard
- beta-to-production plan
- Platinum/application boundary review
- developer machine baseline
- correspondence framework and harnesses
- committed release-decision artifacts
- reference-video alignment pack
- refreshed audio identity comparison evidence

Important docs to read first:

- [PLAN.md](/Users/steven/Documents/Codex-Test1/PLAN.md)
- [GO_FORWARD_EXECUTION_PLAN.md](/Users/steven/Documents/Codex-Test1/GO_FORWARD_EXECUTION_PLAN.md)
- [PRODUCT_ROADMAP.md](/Users/steven/Documents/Codex-Test1/PRODUCT_ROADMAP.md)
- [QUALITY_RELEASE_SCORECARD.md](/Users/steven/Documents/Codex-Test1/QUALITY_RELEASE_SCORECARD.md)
- [BETA_TO_PRODUCTION_PLAN.md](/Users/steven/Documents/Codex-Test1/BETA_TO_PRODUCTION_PLAN.md)
- [PLATINUM_INTERFACE_REVIEW.md](/Users/steven/Documents/Codex-Test1/PLATINUM_INTERFACE_REVIEW.md)
- [VIDEO_ALIGNMENT_PROGRAM.md](/Users/steven/Documents/Codex-Test1/VIDEO_ALIGNMENT_PROGRAM.md)
- [REFERENCE_MEDIA_INVENTORY.md](/Users/steven/Documents/Codex-Test1/REFERENCE_MEDIA_INVENTORY.md)
- [DEVELOPER_MACHINE_BASELINE.md](/Users/steven/Documents/Codex-Test1/DEVELOPER_MACHINE_BASELINE.md)

## What Was Just Shipped

The `1.2.3+build.489.sha.f6ba6c2` production refresh includes:

- stage timing and challenge timing improvements
- audio cue alignment improvements
- refreshed audio identity evidence
- trace-backed movement analysis improvements
- production-safe defaults in the developer/settings surfaces:
  - `Galaga Reference Audio`
  - `Aurora Borealis`
  - `Reference` starfield speed
  - `Bright` starfield intensity
- production-only lock on developer start-state controls
- `Root` backdoor with code `n00b`
- corresponding harness coverage for those settings/lock behaviors

## What Is Not Yet Done

The next polish cycle should prioritize:

1. player-ship movement fidelity against real Galaga footage
2. richer audio identity polish beyond cue timing
3. Platinum/application boundary cleanup
4. expanded reference-video event logging and visual artifact extraction
5. future-game ingestion planning for a second game such as `Galaxian`

## How To Restart On A New Machine

1. Clone the repo:

```bash
git clone https://github.com/sgwoods/Codex-Test1.git
cd Codex-Test1
```

2. Install dependencies:

```bash
npm install
```

3. Verify toolchain and auth:

```bash
node -v
npm -v
python3 --version
gh auth status
git remote -v
```

4. Make sure you are on the current integration line:

```bash
git switch main
git pull origin main
```

5. Run the local app:

```bash
npm run build
npm run local:resume
```

Confirm:

- game:
  - `http://127.0.0.1:8000/`
- viewer:
  - `http://127.0.0.1:4311/`

6. Run the representative checks:

```bash
npm run harness:check:close-shot-hit
npm run harness:check:persona-stage2-safety
npm run harness:check:production-developer-lock
npm run harness:check:player-movement-conformance
npm run harness:score:quality-conformance
```

7. Verify live/public state if release work is continuing:

```bash
npm run publish:verify:beta
npm run publish:verify:production
npm run verify:public
```

## Branching From Here

For new work:

- branch from `main`
- use short-lived `codex/*` topic branches
- merge back into `main`

Recommended branch families:

- `codex/movement-*`
- `codex/audio-*`
- `codex/fidelity-*`
- `codex/platform-*`
- `codex/galaxian-*`

## Release Process Reminder

Keep this rule:

- if an artifact is relied on to justify a release, it must either be committed
  directly or its conclusions must be captured in committed docs

That rule now applies to:

- quality scores
- correspondence evidence
- reference-video alignment packs
- audio identity comparisons
- beta/production readiness records
