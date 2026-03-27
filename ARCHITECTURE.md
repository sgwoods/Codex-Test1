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

- Served file:
  - `/Users/stevenwoods/Documents/Codex-Test1/dist/production/index.html`
- Build metadata:
  - `/Users/stevenwoods/Documents/Codex-Test1/dist/production/build-info.json`
- Promoted beta snapshot:
  - `/Users/stevenwoods/Documents/Codex-Test1/dist/beta/`

## Build / Deploy Flow

### Local Build

- Build script:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/build/build-index.js`
- Generates:
  - `/Users/stevenwoods/Documents/Codex-Test1/dist/production/index.html`
  - `/Users/stevenwoods/Documents/Codex-Test1/dist/production/build-info.json`

### Pages Deploy

- Workflow:
  - `/Users/stevenwoods/Documents/Codex-Test1/.github/workflows/pages.yml`
- CI rebuilds before deploy so the hosted game reflects committed source, not just local generated files

### Public Project Pages Sync

- Sync script:
  - `/Users/stevenwoods/Documents/Codex-Test1/tools/build/sync-public-pages.js`
- Workflow:
  - `/Users/stevenwoods/Documents/Codex-Test1/.github/workflows/sync-public-pages.yml`

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
