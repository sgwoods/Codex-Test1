# Galaxy Guardians 6-Hour Conformance Pass Plan

Updated: May 12, 2026

## Purpose

This document turns the next long Galaxy working block into a measurable,
artifact-backed execution pass instead of a vague polish session.

The goal is not to finish `Galaxy Guardians` in one sitting.

The goal is to spend one disciplined six-hour pass moving the game from
"interesting second-cabinet preview" toward "first-class one-level playable
game" using the same evidence-driven conformance habits that already protect
Aurora.

## Baseline At Session Start

The maintained Galaxy baseline at the start of this pass is:

- reference conformance: `7.7/10`
- playtest-weighted conformance: `6.9/10`
- reference maturity: `7.0/10`
- implementation gate coverage: `9.5/10`
- public release readiness: `3.9/10`
- platform boundary integrity: `10/10`

The highest-value remaining player-facing gaps are:

- score, replay, and pilot-history identity still behave too much like a
  single-game Aurora-first platform
- end-state flow still contains preview placeholder behavior instead of a clear
  game-owned completion/loss contract
- motion pressure remains the weakest feel category
- visuals and audio still need more human-reviewed evidence at live gameplay
  scale

## Starting Evidence For This Pass

The current codebase confirms the first tranche should begin with operational
identity and result-state clarity:

- [src/js/11-leaderboard-service.js](src/js/11-leaderboard-service.js) remote
  score fetch and submit paths still only move score, stage, initials, and
  build, with no explicit game identifier
- [src/js/00-boot.js](src/js/00-boot.js) local score persistence still stores
  a single shared top-10 table and score history with no per-game split
- [src/js/02-replay-telemetry.js](src/js/02-replay-telemetry.js) replay
  metadata records score, stage, pilot, and build, but not explicit
  game-owned identity
- [src/js/06-movie.js](src/js/06-movie.js) replay catalog UI still renders a
  shared run list without making game ownership first-class
- [src/js/13-galaxy-guardians-gameplay-adapter.js](src/js/13-galaxy-guardians-gameplay-adapter.js)
  still uses the placeholder result copy `DEV PREVIEW COMPLETE`

These are not only presentation issues.

They affect whether Platinum can honestly claim to host two games without
silent data leakage across score, replay, and pilot surfaces.

## Session Goals

### Hard Goals

- move playtest-weighted conformance from `6.9` to at least `7.0`
- preserve platform boundary integrity at `10/10`
- preserve current reference conformance at `>=7.7`
- leave behind committed artifacts and updated docs for every accepted change

### Strong Goals

- move playtest-weighted conformance into the `7.1-7.2` band
- raise public-readiness from `3.9` toward `4.3-4.5`
- raise single-shot threat/scoring/progression from `7.5` toward `7.8+`
- improve motion-pressure from `6.2` toward `6.6+`

### Non-Goals

- full multi-stage `Galaxian` parity
- final audio or pixel-identity perfection
- production/public messaging that overclaims maturity
- merging the other machine's work by assumption instead of evidence

## Session Structure

### Phase 1. Baseline Lock And Capture

Time budget: `30-45 min`

Actions:

- rerun the Galaxy conformance spine from clean source
- capture the exact before-state for:
  - score/progression/result behavior
  - motion-pressure metrics
  - visual readability
  - audio character
- record any current drift between docs, artifacts, and runtime behavior

Expected outputs:

- refreshed baseline notes in this document or a linked artifact
- a clean before-state command set for later comparison

Primary commands:

- `npm run harness:check:galaxy-guardians-first-class-conformance`
- `npm run harness:check:galaxy-guardians-reference-conformance`
- `npm run harness:check:galaxy-guardians-playtest-conformance-review`
- `npm run harness:check:galaxy-guardians-score-progression`
- `npm run harness:check:galaxy-guardians-runtime-slice`

### Phase 2. Score, Replay, Pilot, And Result Identity

Time budget: `75-90 min`

Actions contemplated:

- add explicit `gameKey` and readable game identity to score rows, replay
  metadata, and pilot-facing history rows
- separate or filter score surfaces so Aurora and Galaxy do not silently mix
- replace preview-only result messaging with a clear one-level completion/loss
  contract
- make the current mission outcome visible enough to support playtest review

Success criteria:

- a Guardians run is visibly attributable as a Guardians run
- score rows can no longer be interpreted as game-agnostic by default
- result-state messaging no longer says `DEV PREVIEW COMPLETE`

Primary commands:

- `npm run harness:check:galaxy-guardians-game-owned-identity`
- `npm run harness:check:galaxy-guardians-one-level-completion`
- `npm run harness:check:galaxy-guardians-score-progression`
- `npm run harness:check:galaxy-guardians-playable-preview`
- `npm run harness:check:gameplay-adapter-boundaries`

### Phase 3. Motion-Pressure Pass

Time budget: `75-90 min`

Actions contemplated:

- retune first scout dive timing
- retune flagship/escort pressure timing
- retune enemy-shot cadence and live-shot pressure
- retune bottom wrap/return cadence
- review stage-rank pressure scaling after each accepted change

Success criteria:

- motion-pressure improves without breaking boundary or evidence gates
- browser review feels more like a coherent Galaxian-family pressure curve

Primary commands:

- `npm run harness:check:galaxy-guardians-movement-pacing`
- `npm run harness:check:galaxy-guardians-stage-rank-pressure`
- `npm run harness:check:galaxy-guardians-runtime-reference-movement`

### Phase 4. Visual Readability Pass

Time budget: `45-75 min`

Actions contemplated:

- improve gameplay-scale readability of player, scout, escort, and flagship
  separation
- improve rack-density and score-surface readability
- promote human-reviewed sprite or attract/score targets where current proxy
  targets are too weak

Success criteria:

- visual identity rises without overfitting to one crop or one still
- player craft and alien families read clearly during active play

Primary commands:

- `npm run harness:check:galaxy-guardians-visual-readability`
- `npm run harness:check:galaxy-guardians-sprite-grid-targets`
- `npm run harness:check:galaxy-guardians-sprite-component-targets`

### Phase 5. Audio Character Pass

Time budget: `45-75 min`

Actions contemplated:

- human-review the most player-salient cues first
- replace weak isolated windows only where evidence supports it
- keep the audio-lab and cue-target path measurable instead of subjective

Target cue set:

- player shot
- enemy shot
- scout/flagship dive
- alien hit
- player loss
- game over / stage-complete outcome

Primary commands:

- `npm run harness:check:galaxy-guardians-audio-cue-targets`
- `npm run harness:check:galaxy-guardians-audio-character`
- `npm run harness:check:galaxy-guardians-audio-conformance-lab`

### Phase 6. Rerun, Rescore, And Document

Time budget: `45-60 min`

Actions:

- rerun the core Galaxy spine
- compare before/after numbers
- update plans, scorecards, and review docs
- leave a clear next queue for the following pass

Primary commands:

- `npm run harness:check:galaxy-guardians-first-class-conformance`
- `npm run harness:check:galaxy-guardians-reference-conformance`
- `npm run harness:check:galaxy-guardians-playtest-conformance-review`
- `npm run harness:build:conformance-metrics-overview`
- `npm run harness:check:documentation-freshness`

## Metrics To Track During The Pass

### Primary session metrics

- playtest-weighted conformance score
- reference conformance score
- public release readiness score
- platform boundary integrity score

### Area targets for this pass

- motion-pressure: `6.2 -> 6.6+`
- visual identity: `6.7-6.8 -> 6.9+`
- audio character: `6.4 -> 6.6+`
- scoring/progression clarity: `7.5 -> 7.8+`
- public readiness: `3.9 -> 4.3-4.5`

### Non-regression requirements

- boundary/platform contract remains `10/10`
- evidence durability remains `>=9.7`
- implementation gate coverage remains `>=9.5`

## Decision Rules

1. Measured evidence outranks intuition.
   Timing, motion, audio, and visual changes should start from committed
   reference artifacts or harness outputs, not only subjective feel.

2. Browser review can veto a metric-only win.
   If a change improves a harness number but feels worse in live review, do not
   keep it without stronger evidence.

3. One family of change at a time.
   Avoid mixing broad score/result, motion, visual, and audio edits into one
   unreadable batch.

4. Do not let score identity leak across games.
   Any score/replay/pilot change accepted here should make the two-game model
   clearer, not blurrier.

5. Do not overclaim maturity in docs.
   The session should strengthen the game and its evidence without pretending
   every category is now production-complete.

## First Tranche To Execute Immediately

The first work lane in this six-hour pass is:

1. game-owned score identity
2. replay/session metadata identity
3. pilot-history attribution
4. result-state and one-level outcome clarity

This is the best opening move because it improves:

- product honesty
- two-game platform validation value
- public-readiness planning score
- the usefulness of every later motion/audio/visual review artifact

## Current Progress In This Pass

The first tranche is now materially underway:

- `Galaxy Guardians` score rows, score history, replay labels, and pilot-facing
  history now preserve game-owned identity instead of silently defaulting to
  Aurora
- local-only score-submit behavior is now explicit for Guardians until a
  game-owned remote schema exists
- loss flow now renders a real result surface instead of the old preview
  placeholder
- one-level rack clear now ends in a real `MISSION COMPLETE` surface with a
  measured `mission_complete` runtime event
- the runtime/browser checks for this tranche now include:
  - `npm run harness:check:galaxy-guardians-game-owned-identity`
  - `npm run harness:check:galaxy-guardians-one-level-completion`

## Relationship To Other Galaxy Docs

- the long-running Galaxy quality target stays in
  [GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md](GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md)
- the branch-specific playable-game scope stays in
  [GALAXY_GUARDIANS_PLAYABLE_0_1_BRANCH_PLAN.md](GALAXY_GUARDIANS_PLAYABLE_0_1_BRANCH_PLAN.md)
- this document is the active execution plan for the current long measured
  working block
