# Architecture

This document is the repo-level technical map.

Use it when the question is:

- where in the codebase does something live
- what is platform-owned versus application-owned in implementation terms
- how do builds, hosted docs, and lane promotion work
- where do harnesses and review tools fit into the system

For the canonical platform document, start with:

- `/Users/steven/Documents/Codex-Test1/PLATINUM.md`

For the application-layer view, use:

- `/Users/steven/Documents/Codex-Test1/APPLICATIONS_ON_PLATINUM.md`

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
- the second application is still public-preview-only rather than fully
  playable; it now has a development-only playable-preview adapter for local
  runtime proof
- the second-game preview now owns placeholder pack data, but playable
  second-game work still needs measured game data and a gameplay adapter rather
  than Aurora gameplay reuse

## Runtime Layout

### Platform-oriented files

- shell, metadata, build identity, shared UI state:
  - `/Users/steven/Documents/Codex-Test1/src/js/00-boot.js`
- runtime shell helpers:
  - `/Users/steven/Documents/Codex-Test1/src/js/01-runtime-shell.js`
- replay and session plumbing:
  - `/Users/steven/Documents/Codex-Test1/src/js/02-replay-telemetry.js`
- shared service policy:
  - `/Users/steven/Documents/Codex-Test1/src/js/03-platform-services.js`
- shared leaderboard and account UI helpers:
  - `/Users/steven/Documents/Codex-Test1/src/js/04-leaderboard-ui.js`
- shared auth/session helpers:
  - `/Users/steven/Documents/Codex-Test1/src/js/12-auth-session.js`
- shared pack selection:
  - `/Users/steven/Documents/Codex-Test1/src/js/15-game-picker.js`
- shared pack registry and active-pack helpers:
  - `/Users/steven/Documents/Codex-Test1/src/js/13-game-pack-registry.js`
- shared gameplay adapter registry:
  - `/Users/steven/Documents/Codex-Test1/src/js/13-gameplay-adapter-registry.js`
- shared shell rendering:
  - `/Users/steven/Documents/Codex-Test1/src/js/19-render-shell.js`
- shared game-board renderer registry and dispatch:
  - `/Users/steven/Documents/Codex-Test1/src/js/20-render.js`
- harness hooks and deterministic controls:
  - `/Users/steven/Documents/Codex-Test1/src/js/90-harness.js`

### Aurora application files

- Aurora player flow and lifecycle:
  - `/Users/steven/Documents/Codex-Test1/src/js/05-player-flow.js`
- Aurora combat and bullet behavior:
  - `/Users/steven/Documents/Codex-Test1/src/js/05-player-combat.js`
- Aurora enemy behavior:
  - `/Users/steven/Documents/Codex-Test1/src/js/06-enemy-behavior.js`
- Aurora capture and rescue:
  - `/Users/steven/Documents/Codex-Test1/src/js/07-capture-rescue.js`
- Aurora scoring and bonus helpers:
  - `/Users/steven/Documents/Codex-Test1/src/js/08-score-awards.js`
- Aurora stage flow:
  - `/Users/steven/Documents/Codex-Test1/src/js/09-stage-flow.js`
- Aurora gameplay orchestration:
  - `/Users/steven/Documents/Codex-Test1/src/js/10-gameplay.js`
- Aurora pack metadata:
  - `/Users/steven/Documents/Codex-Test1/src/js/13-aurora-game-pack.js`
- Galaxy Guardians preview pack metadata:
  - `/Users/steven/Documents/Codex-Test1/src/js/13-galaxy-guardians-game-pack.js`
- Galaxy Guardians disabled gameplay adapter skeleton:
  - `/Users/steven/Documents/Codex-Test1/src/js/13-galaxy-guardians-gameplay-adapter.js`
- Galaxy Guardians dev-only scout-wave runtime:
  - `/Users/steven/Documents/Codex-Test1/src/js/13-galaxy-guardians-runtime.js`
- shared entity model used by packs:
  - `/Users/steven/Documents/Codex-Test1/src/js/14-entity-model.js`
- Aurora board and sprite rendering:
  - `/Users/steven/Documents/Codex-Test1/src/js/21-render-board.js`
- Galaxy Guardians dev-only preview board rendering:
  - `/Users/steven/Documents/Codex-Test1/src/js/22-galaxy-guardians-preview-renderer.js`

## Build And Hosted Docs Flow

Build script:

- `/Users/steven/Documents/Codex-Test1/tools/build/build-index.js`

Generated local `localhost` artifacts:

- `/Users/steven/Documents/Codex-Test1/dist/dev/index.html`
- `/Users/steven/Documents/Codex-Test1/dist/dev/project-guide.html`
- `/Users/steven/Documents/Codex-Test1/dist/dev/platinum-guide.html`
- `/Users/steven/Documents/Codex-Test1/dist/dev/player-guide.html`
- `/Users/steven/Documents/Codex-Test1/dist/dev/release-dashboard.html`
- `/Users/steven/Documents/Codex-Test1/dist/dev/build-info.json`
- `/Users/steven/Documents/Codex-Test1/dist/dev/release-notes.json`

Promotion scripts:

- promote hosted `/beta` candidate:
  - `/Users/steven/Documents/Codex-Test1/tools/build/promote-beta.js`
- promote hosted `/production` candidate:
  - `/Users/steven/Documents/Codex-Test1/tools/build/promote-production.js`

Publish and verification scripts:

- publish lane:
  - `/Users/steven/Documents/Codex-Test1/tools/build/publish-lane.js`
- lane preflight:
  - `/Users/steven/Documents/Codex-Test1/tools/build/check-publish-ready.js`
- live lane verification:
  - `/Users/steven/Documents/Codex-Test1/tools/build/verify-live-lane.js`

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
  - `/Users/steven/Documents/Codex-Test1/tools/harness/run-gameplay.js`
- batch runner:
  - `/Users/steven/Documents/Codex-Test1/tools/harness/run-batch.js`
- run analysis:
  - `/Users/steven/Documents/Codex-Test1/tools/harness/analyze-run.js`

Harness families should now be thought of in categories:

- platform-only harnesses
- application/gameplay harnesses
- seam and contract harnesses
- migration and compatibility harnesses

Pack-boundary harness:

- `tools/harness/check-pack-registry-boundaries.js`
  verifies that the Galaxy Guardians preview pack owns separate placeholder
  tables, stays non-playable, and does not inherit Aurora challenge cadence,
  challenge layout, or reference timings.
- `tools/harness/check-gameplay-adapter-boundaries.js`
  verifies that Aurora is the only registered public gameplay adapter, Galaxy
  Guardians remains blocked from public playability, and the explicit
  development-only preview adapter starts only the Guardians-owned runtime
  slice.
- `tools/harness/check-guardians-adapter-skeleton.js`
  verifies that the Galaxy Guardians skeleton exists, stays disabled, exposes a
  single-shot scout-wave state shape, cites the promoted event log, and fails
  closed until measured runtime implementation exists.
- `tools/harness/build-galaxian-reference-profile.js`
  probes the local Galaxian videos and generates source manifests, contact
  sheets, waveforms, the initial measured profile, and the promoted reviewed
  event log used by the disabled Galaxy Guardians skeleton.
- `tools/harness/check-galaxian-reference-profile.js`
  verifies that the generated Galaxian profile has the expected source roles,
  artifacts, promoted event targets, and first-slice scout-wave baseline.
- `tools/harness/check-galaxy-guardians-runtime-slice.js`
  verifies the dev-only Galaxy Guardians scout-wave runtime model: 38-slot rack,
  flagship/escort/scout roles, single-shot firing, promoted event emission,
  Guardians-owned scoring, Guardians-owned visual/audio catalog bindings, and
  no Aurora capture/challenge/dual-fighter state.
- `tools/harness/check-galaxy-guardians-identity-baseline.js`
  verifies that the persistent 0.1 identity artifact in
  `reference-artifacts/analyses/galaxy-guardians-identity/` matches the
  pack-owned sprite glyphs, audio cue catalog, theme cues, runtime cue map, and
  dev-preview audio history.
- `tools/harness/check-galaxy-guardians-movement-pacing.js`
  verifies that the persistent movement/pacing artifact matches runtime rules
  and that sampled scout/flagship/escort dive behavior exposes real linked
  escort craft and wrap/return pressure.
- `tools/harness/check-galaxy-guardians-playable-preview.js`
  verifies the development-only Galaxy Guardians playable-preview adapter:
  keyboard fire routing, life loss, reset, game over, owned audio cue IDs, and
  isolation from the public playable adapter registry.
- `tools/harness/check-compact-cabinet-rails.js`
  verifies that both side-frame icon rails remain visible and inside the
  cabinet frame at the compact in-app browser scale, and that the Galaxy
  Guardians preview modal stays readable in that compact layout. It also
  verifies the dev-only Guardians preview renderer by checking its render mode,
  registered renderer key, visual catalog IDs, audio cue IDs, signal palette,
  Platinum harness alias, and non-playable adapter state.
- `tools/harness/check-platinum-renderer-boundaries.js`
  verifies statically that platform render orchestration is game-agnostic,
  board renderers register themselves through the Platinum renderer registry,
  and the Galaxy Guardians renderer remains preview-only and adapter-gated.

Application/gameplay harnesses must stay game-owned. A harness that proves
Aurora capture/rescue, challenge-stage cadence, or dual-fighter behavior does
not prove Galaxy Guardians behavior. Shared harness helpers belong in Platinum;
game behavior assertions belong to the owning game.

The intended release rule is automation-first:

- automate when the behavior is stable enough to measure
- use manual review mainly for feel and visual quality

## Related Docs

- platform guide:
  - `/Users/steven/Documents/Codex-Test1/PLATINUM.md`
- application guide:
  - `/Users/steven/Documents/Codex-Test1/APPLICATIONS_ON_PLATINUM.md`
- game boundary audit:
  - `/Users/steven/Documents/Codex-Test1/PLATINUM_GAME_BOUNDARY_AUDIT.md`
- platform diagrams:
  - `/Users/steven/Documents/Codex-Test1/PLATINUM_ARCHITECTURE_OVERVIEW.md`
- testing and release discipline:
  - `/Users/steven/Documents/Codex-Test1/TESTING_AND_RELEASE_GATES.md`
