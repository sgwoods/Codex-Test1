# Architecture

This document is the short technical map for how the project is organized and
how work should flow through it.

## Runtime Layout

### Source Files

- HTML shell:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/index.template.html`
- Styles:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/styles.css`
- Boot / metadata / audio / storage / session logging:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/00-boot.js`
- Shared runtime input / build-stamp / shell helpers:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/01-runtime-shell.js`
- Shared replay / session telemetry / recording helpers:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/02-replay-telemetry.js`
- Shared platform service policy / identity / transport helpers:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/03-platform-services.js`
- Shared leaderboard / account UI / panel-state helpers:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/04-leaderboard-ui.js`
- Aurora-specific enemy dive / challenge motion / attack helpers:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/06-enemy-behavior.js`
- Aurora-specific capture / rescue / carried-fighter helpers:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/07-capture-rescue.js`
- Aurora-specific scoring / rescue-award / challenge-bonus helpers:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/08-score-awards.js`
- Aurora-specific stage setup / formation / transition helpers:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/js/09-stage-flow.js`
- Gameplay / scoring / capture / enemy logic:
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

- Player-generated `.json` and `.webm` are browser download artifacts first
  - they typically land in the user’s downloads location
- Player-native in-game replay state is browser-local storage, not the harness archive
- Player-generated `.json` and `.webm` can then be imported and analyzed
- The same analysis pipeline should be used whenever possible so live play and harness results stay comparable
- The log viewer can inspect those imported runs as long as they are copied into the expected `harness-artifacts/` folder structure and have a `summary.json` beside them.
- Formal policy:
  - `/Users/stevenwoods/Documents/Codex-Test1/ARTIFACT_POLICY.md`

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

## Platform Extraction Order

The platform path should be incremental. Aurora remains the proof project while
we extract stable seams out of the current one-off runtime.

### Release-Line Mapping

Use the extraction phases as release guidance, not just architecture guidance.

- `1.1.x`
  - stabilize Aurora into explicit layers
  - extract shared monorepo modules without redesigning gameplay
- `1.2.x`
  - generalize shared services and add the first operator/control-centre
    surfaces
- later `1.x`
  - prove reuse with one close sibling game
  - add optional shared media/publishing on top of stable identity and service
    seams

### Phase 1: Stabilize Aurora Into Explicit Layers

Do this before creating generalized packages.

Separate the current runtime mentally and structurally into:

- shared runtime core
  - loop
  - timing
  - input primitives
  - scene/state transitions
  - deterministic event vocabulary
- shared shell
  - cabinet frame
  - HUD slots
  - popup/layout system
  - build/update surfaces
- shared play services
  - score submission boundary
  - identity boundary
  - feedback boundary
  - replay persistence boundary
- Aurora game pack
  - formations
  - enemy families
  - scoring tables
  - stage cadence
  - capture/rescue rules
  - challenge rules
  - sprites/theme

### Phase 2: Extract Shared Modules Inside The Monorepo

Keep one repo and extract modules only after Aurora already runs cleanly across
the layer seams above.

Target internal package/module boundaries:

- `packages/arcade-runtime`
- `packages/arcade-shell`
- `packages/arcade-replay`
- `packages/arcade-services`
- `games/aurora`

Important rule:

- first extraction should be mostly relocation plus interface cleanup
- do not redesign behavior during the extraction itself

### Phase 3: Make Aurora Rules Data-Driven Enough To Reuse

Once Aurora is stable on the extracted runtime, move Aurora-specific rules
toward a `gamePack` or `gameDef` contract.

Expected configurable areas:

- formation definitions
- enemy-family definitions
- attack scripts
- scoring tables
- stage progression bands
- optional mechanic flags
  - capture/rescue
  - challenge stages
  - special squadrons
  - dual-fighter mode

Important rule:

- do not force every future game to implement every optional mechanic

### Phase 4: Generalize Shared Services

Only after runtime seams stabilize:

- make identity game-agnostic
- make scores keyed by:
  - `gameKey`
  - `version`
  - `playerId`
  - `runId`
- keep replay metadata independent of Aurora-specific assumptions
- move feedback toward a platform-owned API rather than a game-specific form

Expected first shared-service targets:

- pilot identity
- scoreboard and run records
- feedback intake
- environment-aware backend boundaries

### Phase 5: Add Operator / Control Centre

The first shared operational surface should come after the runtime and service
seams are real.

First control-centre scope:

- score moderation
- player account admin
- replay/video publish status
- release/lane status

### Phase 6: Prove Reuse With A Second Game

The first proof is not “many games.” The first proof is:

- Aurora cleanly running on the shared runtime

The second proof should be:

- one close sibling fixed-screen shooter game pack

Recommended first sibling:

- Galaxian-like before Space Invaders

That keeps the runtime honest without forcing broad abstraction too early.

## What Not To Generalize Too Early

Avoid premature platform work in these areas:

- generic physics engine
- broad multi-genre engine abstractions
- repo splitting
- full admin platform before service seams are stable
- multiplayer/live-service assumptions

The rule is simple:

- extract only the seams that Aurora already proves are real

## Platform Defaults

Until the platform work is more mature, keep these defaults:

- one monorepo
- one primary proof game:
  - Aurora
- static-first client hosting
- managed services where they reduce operational burden
- reusable runtime and service seams proven by Aurora before they are made
  generic
