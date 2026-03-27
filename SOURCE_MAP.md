# Source Map

This file is the quick orientation guide for the current codebase. It is meant
to answer "where does this behavior live?" before someone starts changing
gameplay or tuning values.

## Main Editable Sources

- `/Users/stevenwoods/Documents/Codex-Test1/src/index.template.html`
  - base HTML shell for the served game
  - settings drawer, overlays, feedback modal, and HUD containers

- `/Users/stevenwoods/Documents/Codex-Test1/src/styles.css`
  - all in-game presentation and overlay styling

- `/Users/stevenwoods/Documents/Codex-Test1/src/js/00-boot.js`
  - bootstrapping, constants, build metadata, audio, input, logging, scoreboard
  - release/build identity surfaced to the UI

- `/Users/stevenwoods/Documents/Codex-Test1/src/js/10-gameplay.js`
  - stage spawning, enemy movement, challenge flow, scoring, capture/rescue,
    bullet logic, ship loss, and the main update loop

- `/Users/stevenwoods/Documents/Codex-Test1/src/js/20-render.js`
  - sprite rendering, hitbox rendering assumptions, overlays, HUD, banners

- `/Users/stevenwoods/Documents/Codex-Test1/src/js/90-harness.js`
  - harness-only hooks exposed on `window.__galagaHarness__`
  - deterministic setup helpers for scenarios and regression checks

- `/Users/stevenwoods/Documents/Codex-Test1/tools/log-viewer/`
  - local artifact review app
  - `server.js` indexes run folders under `harness-artifacts/`
  - `app.js` synchronizes repaired videos, event streams, clips, and issue drafting
  - expects a run folder with `summary.json` plus neighboring session/video artifacts

## Build / Deploy

- `/Users/stevenwoods/Documents/Codex-Test1/tools/build/build-index.js`
  - assembles source files into `/Users/stevenwoods/Documents/Codex-Test1/dist/production/index.html`
  - writes `/Users/stevenwoods/Documents/Codex-Test1/dist/production/build-info.json`

- `/Users/stevenwoods/Documents/Codex-Test1/tools/build/promote-beta.js`
  - copies the current production build into `/Users/stevenwoods/Documents/Codex-Test1/dist/beta/`
  - rewrites build identity there for the public beta lane

- `/Users/stevenwoods/Documents/Codex-Test1/tools/build/publish-lane.js`
  - publishes either `dist/beta/` or `dist/production/` into `sgwoods/Aurora-Galactica`
  - automates the clone/copy/commit/push release step

- `/Users/stevenwoods/Documents/Codex-Test1/tools/build/check-publish-ready.js`
  - verifies the repo is clean and the chosen lane was built from the current `HEAD`
  - fails early if required generated files are missing or stale

- `/Users/stevenwoods/Documents/Codex-Test1/tools/build/sync-public-pages.js`
  - exports project-status content from the current production build into the separate `sgwoods/public` repo
  - does not publish the playable Aurora build

- `/Users/stevenwoods/Documents/Codex-Test1/tools/build/sync-public-pages.js`
  - syncs the separate `sgwoods/public` repo from build metadata

- `/Users/stevenwoods/Documents/Codex-Test1/.github/workflows/pages.yml`
  - builds and deploys the actual playable GitHub Pages site

- `/Users/stevenwoods/Documents/Codex-Test1/.github/workflows/sync-public-pages.yml`
  - updates the public project-summary pages in `sgwoods/public`

## Gameplay Areas

### Stage Flow

- `/Users/stevenwoods/Documents/Codex-Test1/src/js/10-gameplay.js`
  - `spawnFormation()`
  - `spawnChallenge()`
  - `spawnStage()`
  - `runStage1Script()`

These functions define the main board composition and stage transitions.

### Challenge Stages

- `/Users/stevenwoods/Documents/Codex-Test1/src/js/10-gameplay.js`
  - `spawnChallenge()`
  - `updateChallengeEnemy()`
  - `challengeGroupBonus()`

Challenge stages are one of the main fidelity-sensitive systems. Manual-backed
rules currently modeled:
- 40 enemies
- 5 groups of 8
- per-group bonus scoring
- perfect bonus handling

### Capture / Rescue / Dual Fighter

- `/Users/stevenwoods/Documents/Codex-Test1/src/js/10-gameplay.js`
  - `canCapture()`
  - `capturePlayer()`
  - `finishCapture()`
  - `destroyCarriedFighter()`
  - rescue handling inside `awardKill(...)`
  - rescue completion inside `update(...)`

Recent manual-backed rule work includes:
- blocking a second capture when one fighter is already carried
- scoring for destroying a carried fighter:
  - 500 standby
  - 1000 attacking

### Special Attack Squadrons

- `/Users/stevenwoods/Documents/Codex-Test1/src/js/10-gameplay.js`
  - `assignEscorts(...)`
  - `activeEscortCount(...)`
  - boss dive scoring inside `awardKill(...)`

This is where the Stage 4+ special squadron bonus behavior now lives.

### Later-Stage Pressure

- `/Users/stevenwoods/Documents/Codex-Test1/src/js/10-gameplay.js`
  - `stageTune(...)` in `/Users/stevenwoods/Documents/Codex-Test1/src/js/00-boot.js`
  - `stageBandProfile(...)` in `/Users/stevenwoods/Documents/Codex-Test1/src/js/00-boot.js`
  - attack-gap / recovery timing in `spawnStage()` and `loseShip()`
  - dive decisions in `updateEnemy()`

If Stage 4/5 feels wrong, this is usually where to look first.

### Later-Stage Variety

- `/Users/stevenwoods/Documents/Codex-Test1/src/js/00-boot.js`
  - `STAGE_BAND_PROFILES`
  - `stageBandProfile(...)`
  - `enemyFamilyForType(...)`

- `/Users/stevenwoods/Documents/Codex-Test1/src/js/10-gameplay.js`
  - `makeEnemy(...)`
  - `familyMotion(...)`
  - `spawnStage()` stage-profile logging

- `/Users/stevenwoods/Documents/Codex-Test1/src/js/20-render.js`
  - `enemyPalette(...)`
  - `FAMILY_PIXELS`

This is where stage-banded family progression now lives for issues like
later-stage enemy variety and future transform-style fidelity work.

## Harness / Measurement

- `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/run-gameplay.js`
  - launches Chrome and runs deterministic scenarios

- `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/analyze-run.js`
  - derives metrics from recorded `.json` + `.webm`

- `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/tuning-report.js`
  - rolls per-run analysis into prioritized findings

- `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/scenarios/`
  - scenario definitions for challenge, rescue, carried-fighter scoring,
    descent timing, Stage 4 pressure, and squadron bonuses

- `/Users/stevenwoods/Documents/Codex-Test1/harness-artifacts/`
  - canonical local evidence tree for harness runs and imported manual sessions
  - the log viewer walks this tree recursively and treats each folder containing `summary.json` as a reviewable run

## Reference Material

Primary rule references:
- `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/manuals/galaga-1981-namco/README.md`
- `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/manuals/galaga-1981-namco/Galaga_-_1981_-_Namco.pdf`

Secondary progression/fidelity notes:
- `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/walkthroughs/trueachievements-galaga/README.md`

Use the manual first when a rule question exists. Use walkthrough/reference
clips as secondary help for later-stage variety and visual comparison.
