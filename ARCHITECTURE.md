# Architecture

This document is the short technical map for how the project is organized and
how work should flow through it.

## Runtime Layout

### Source Files

- HTML shell:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/index.template.html`
- Styles:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/styles.css`
- Boot / metadata / audio / UI / logging:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/00-boot.js`
- Gameplay / stage flow / scoring / capture / enemy logic:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/10-gameplay.js`
- Rendering / HUD / overlays / sprites:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/20-render.js`
- Harness hooks:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/90-harness.js`

### Generated Output

- Local dev build:
  - `/Users/stevenwoods/Documents/Codex-Test1/dist/dev/index.html`
- Local dev build metadata:
  - `/Users/stevenwoods/Documents/Codex-Test1/dist/dev/build-info.json`
- Stable production artifact:
  - `/Users/stevenwoods/Documents/Codex-Test1/dist/production/index.html`
- Stable production build metadata:
  - `/Users/stevenwoods/Documents/Codex-Test1/dist/production/build-info.json`
- Promoted beta snapshot:
  - `/Users/stevenwoods/Documents/Codex-Test1/dist/beta/`

## Build / Deploy Flow

### Local Build

- Build script:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/build/build-index.js`
- Generates:
  - `/Users/stevenwoods/Documents/Codex-Test1/dist/dev/index.html`
  - `/Users/stevenwoods/Documents/Codex-Test1/dist/dev/build-info.json`
- Production promotion:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/build/promote-production.js`
- Produces:
  - `/Users/stevenwoods/Documents/Codex-Test1/dist/production/index.html`
  - `/Users/stevenwoods/Documents/Codex-Test1/dist/production/build-info.json`
- Local ready-state helper:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/dev/local-resume.js`
  - starts the local `dist/dev` game server and the log viewer together for machine handoff/debugging

### Pages Deploy

- Workflow:
  - `/Users/stevenwoods/Documents/Codex-Test1/.github/workflows/pages.yml`
- CI rebuilds the dev repo’s generated outputs, but the publicly shared Aurora production and beta lanes are published from the separate `Aurora-Galactica` repo.
- In practice:
  - `Codex-Test1` produces generated artifacts in `dist/`
  - `Aurora-Galactica` is the public artifact host for:
    - `/`
    - `/beta/`
  - lane publishing is now scripted through:
    - `/Users/stevenwoods/Documents/Codex-Test1/tools/build/publish-lane.js`
  - publish readiness is checked through:
    - `/Users/stevenwoods/Documents/Codex-Test1/tools/build/check-publish-ready.js`

### Public Project Pages Sync

- Sync script:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/build/sync-public-pages.js`
- Workflow:
  - `/Users/stevenwoods/Documents/Codex-Test1/.github/workflows/sync-public-pages.yml`
- This syncs project/status surfaces to `sgwoods/public`.
- It does not publish the playable game.

## Testing / Evidence Flow

### Harness

- Run gameplay:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/run-gameplay.js`
- Analyze a run:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/analyze-run.js`
- Batch runner:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/run-batch.js`
- Batch prioritization:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/tuning-report.js`
- Scenarios:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/scenarios/`

### Log Viewer

- Local review server:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/log-viewer/server.js`
- Viewer UI:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/log-viewer/index.html`
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/log-viewer/app.js`
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/log-viewer/styles.css`
- The viewer reads the same recursive artifact tree under:
  - `/Users/stevenwoods/Documents/Codex-Test1/harness-artifacts/`
- Review-ready runs should include:
  - `summary.json`
  - `neo-galaga-session-*.json`
  - `neo-galaga-video-*.review.webm` when available
- The viewer uses `summary.json` as the run index and then resolves the neighboring session/video files from the summary metadata.

### Real Play

- Player-generated `.json` and `.webm` can be imported and analyzed
- The same analysis pipeline should be used whenever possible so live play and harness results stay comparable
- The log viewer can inspect those imported runs as long as they are copied into the expected `harness-artifacts/` folder structure and have a `summary.json` beside them.

## Reference Flow

### Durable Sources

- Reference root:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/`
- Manual:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/manuals/galaga-1981-namco/`
- Walkthrough notes:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/walkthroughs/trueachievements-galaga/`

### Decision Priority

1. Original/manual-backed rule evidence
2. Original gameplay footage
3. Secondary walkthrough/progression references
4. Tuning inference from our own harness and live play

## System Boundaries

### Stable Rule Areas

These should change carefully and usually only with reference evidence:

- challenge stage structure
- capture / rescue rules
- carried fighter scoring
- special attack squadron bonuses
- results / high-score flow

### Tunable Areas

These are expected to change often:

- dive timing
- collision fairness
- challenge readability
- later-stage band variety
- visuals and presentation

## Collaboration Model

The project is moving toward two parallel tracks:

1. Reference-baseline / fidelity work
2. Harness / gameplay tuning / shipping quality

That split should let collaborators work with less conflict and clearer ownership.

## Early Post-1.0 Platform Direction

Shortly after `1.0`, this codebase should start moving toward a shared arcade
platform rather than remaining a one-off Aurora-only runtime.

Tracked umbrella:

- `#111` shared arcade platform extraction for Galaga-family cabinet shooters

The intended stable/shared layer is:

- cabinet shell / HUD / control rail surfaces
- replay, logging, and artifact model
- harness runner and event vocabulary
- build / publish / local handoff flow
- left-right cabinet input primitives

The intended configurable/game-pack layer is:

- formations
- enemy families
- scoring tables
- stage cadence
- attack scripts
- optional mechanics such as capture/rescue or challenge stages

The goal is to reduce churn in mature infrastructure while letting future games
such as Galaxian, Aurora variants, or similar fixed-screen cabinet shooters
reuse the stable platform with smaller game-specific packs.
