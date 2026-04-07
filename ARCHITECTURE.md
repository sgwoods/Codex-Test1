# Architecture

This document is the repo-level technical map.

Use it when the question is:

- where in the codebase does something live
- what is platform-owned versus application-owned in implementation terms
- how do builds, hosted docs, and lane promotion work
- where do harnesses and review tools fit into the system

For the canonical platform document, start with:

- `/Users/stevenwoods/Documents/Codex-Test1/PLATINUM.md`

For the application-layer view, use:

- `/Users/stevenwoods/Documents/Codex-Test1/APPLICATIONS_ON_PLATINUM.md`

## Current State

This repo is now post-`1.2.0`, not pre-launch.

What is already true:

- `Platinum` is a real shipped host platform
- `Aurora Galactica` is the first shipped playable application on Platinum
- hosted lanes exist for local `localhost`, hosted `/dev`, hosted `/beta`, and hosted `/production`
- the hosted documentation set is now part of the intended release surface

What is still transitional:

- some naming and compatibility residue is still Aurora-shaped
- the game-pack contract is still practical rather than strongly versioned
- the second application is still preview-only rather than fully playable

## Runtime Layout

### Platform-oriented files

- shell, metadata, build identity, shared UI state:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/00-boot.js`
- runtime shell helpers:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/01-runtime-shell.js`
- replay and session plumbing:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/02-replay-telemetry.js`
- shared service policy:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/03-platform-services.js`
- shared leaderboard and account UI helpers:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/04-leaderboard-ui.js`
- shared auth/session helpers:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/12-auth-session.js`
- shared pack selection:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/15-game-picker.js`
- shared shell rendering:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/19-render-shell.js`
- harness hooks and deterministic controls:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/90-harness.js`

### Aurora application files

- Aurora player flow and lifecycle:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/05-player-flow.js`
- Aurora combat and bullet behavior:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/05-player-combat.js`
- Aurora enemy behavior:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/06-enemy-behavior.js`
- Aurora capture and rescue:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/07-capture-rescue.js`
- Aurora scoring and bonus helpers:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/08-score-awards.js`
- Aurora stage flow:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/09-stage-flow.js`
- Aurora gameplay orchestration:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/10-gameplay.js`
- Aurora pack metadata:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/13-aurora-game-pack.js`
- shared entity model used by packs:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/14-entity-model.js`
- Aurora render orchestration:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/20-render.js`
- Aurora board and sprite rendering:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/21-render-board.js`

## Build And Hosted Docs Flow

Build script:

- `/Users/stevenwoods/Documents/Codex-Test1/tools/build/build-index.js`

Generated local `localhost` artifacts:

- `/Users/stevenwoods/Documents/Codex-Test1/dist/dev/index.html`
- `/Users/stevenwoods/Documents/Codex-Test1/dist/dev/project-guide.html`
- `/Users/stevenwoods/Documents/Codex-Test1/dist/dev/platinum-guide.html`
- `/Users/stevenwoods/Documents/Codex-Test1/dist/dev/player-guide.html`
- `/Users/stevenwoods/Documents/Codex-Test1/dist/dev/release-dashboard.html`
- `/Users/stevenwoods/Documents/Codex-Test1/dist/dev/build-info.json`
- `/Users/stevenwoods/Documents/Codex-Test1/dist/dev/release-notes.json`

Promotion scripts:

- promote hosted `/beta` candidate:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/build/promote-beta.js`
- promote hosted `/production` candidate:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/build/promote-production.js`

Publish and verification scripts:

- publish lane:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/build/publish-lane.js`
- lane preflight:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/build/check-publish-ready.js`
- live lane verification:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/build/verify-live-lane.js`

## Hosted Lane Contract

The intended hosted lane contract is:

- hosted `/dev`
  - current integrated candidate
- hosted `/beta`
  - release candidate under review
- hosted `/production`
  - approved public build

The hosted documentation set should exist on each lane as part of that
contract.

## Harness And Evidence Flow

Core harness tools:

- scenario runner:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/run-gameplay.js`
- batch runner:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/run-batch.js`
- run analysis:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/analyze-run.js`

Harness families should now be thought of in categories:

- platform-only harnesses
- application/gameplay harnesses
- seam and contract harnesses
- migration and compatibility harnesses

The intended release rule is automation-first:

- automate when the behavior is stable enough to measure
- use manual review mainly for feel and visual quality

## Related Docs

- platform guide:
  - `/Users/stevenwoods/Documents/Codex-Test1/PLATINUM.md`
- application guide:
  - `/Users/stevenwoods/Documents/Codex-Test1/APPLICATIONS_ON_PLATINUM.md`
- platform diagrams:
  - `/Users/stevenwoods/Documents/Codex-Test1/PLATINUM_ARCHITECTURE_OVERVIEW.md`
- testing and release discipline:
  - `/Users/stevenwoods/Documents/Codex-Test1/TESTING_AND_RELEASE_GATES.md`
