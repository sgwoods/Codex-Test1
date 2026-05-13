# Galaxy Guardians First-Class Conformance Plan

Updated: May 13, 2026

## Purpose

This plan turns `Galaxy Guardians` into a first-class conformance program on
Platinum instead of treating it as only a preview card plus scattered harnesses.

Near-parity with Aurora does not mean the same score today.

It means `Galaxy Guardians` should have the same kinds of durable project
surfaces:

- game-owned ingestion artifacts and provenance
- game-owned catalog rows for visuals, audio, stages, and personas
- game-owned runtime, scoring, and progression contracts
- game-owned conformance metrics and playtest review
- game-owned review gates plus explicit manual-review checkpoints
- platform-boundary and two-game validation harnesses
- game-owned release framing, version tracking, and future candidate path

## Current Baseline

The current maintained source of truth is:

- reference conformance: `7.7/10`
- playtest-weighted conformance: `6.9/10`
- reference maturity: `7.0/10`
- implementation gate coverage: `9.5/10`
- public release readiness: `3.9/10`

This means the Galaxy program is no longer missing machinery.

It already has a serious ingestion-backed evidence stack, but it is still short
of first-class product parity because the highest-value remaining gaps are the
ones a player feels immediately:

- formation/rack timing
- lower-field motion pressure
- sprite likeness at real gameplay scale
- audio character under live playback
- score/progression/end-state clarity
- game-owned review flow and release framing

## First-Class Definition

`Galaxy Guardians` counts as a first-class conformance target when all of the
following are true:

1. Its gameplay claims are grounded in committed Galaxian-family source
   artifacts, not Aurora carry-over or memory-only tuning.
2. Its conformance story is readable from one maintained plan plus one
   aggregate process gate, not only from many unrelated checks.
3. Its runtime owns score, progression, completion, loss, replay metadata, and
   pilot-history identity as game-owned data.
4. Its harness family covers ingestion, visuals, audio, scoring, motion,
   runtime flow, manual-review checkpoints, and platform boundaries.
5. Its next candidate path can be discussed as a game candidate, not only as a
   platform curiosity.

## Target Ladder

| Milestone | Score intent | Meaning |
| --- | --- | --- |
| Playable `0.1` branch floor | keep `7.7/10` reference, raise playtest to at least `7.0/10`, keep boundary score `10/10` | Honest one-level playable game with game-owned score/progression/result flow and no Aurora leakage. |
| First-class preview `0.2` | `>=8.0/10` reference, `>=7.4/10` playtest, `>=4.5/10` public-readiness planning score | Strong second game for two-game platform validation, with human-reviewed sprite/audio evidence and browser-reviewed feel. |
| Beta-worthy application candidate | `>=8.4/10` reference, `>=7.8/10` playtest, `>=7.0/10` public readiness | A game-specific candidate can be reviewed on its own merits without pretending it already matches Aurora maturity. |
| Multi-game Platinum candidate | `>=9.0/10` reference, `>=8.8/10` playtest, `>=8.5/10` public readiness | Platinum can honestly claim two serious games with separate evidence, release identity, and validation value. |

## Strategy By Area

| Area | Current read | Near-term target | Strategy |
| --- | --- | --- | --- |
| Source coverage and provenance | `9.6/10` | keep `>=9.6/10` while promoting stronger human-approved evidence | Preserve the three-source Galaxian profile, then convert proxy sprite/cue work into approved targets rather than replacing provenance with tuning. |
| Promoted semantic event coverage | `7.8/10` | `>=8.5/10` | Keep the event log central, then add score-table, attract-surface, result-state, and completion-state evidence that can be reviewed against source windows. |
| Formation and rack timing | `6.2/10` | `>=7.2/10` | Move from connected-component/object proxy timing toward sprite-recognized rack timing plus browser-reviewed side-by-side traces. |
| Motion and lower-field pressure | `6.2/10` reference and playtest | `>=7.2/10` playtest | Use runtime/reference track comparison first, then promote dive-path targets, wrap cadence, and later-wave pressure with browser review. |
| Single-shot threat, scoring, and progression | `7.5/10` | `>=8.2/10` | Keep the score table game-owned, then add score isolation, proper completion/loss endings, replay identity, and clearer one-level mission closure. |
| Visual alien and player identity | `6.8/10` reference, `6.7/10` playtest | `>=7.2/10` | Promote component-crop work into human-reviewed sprite recognition, attract/score-surface comparison, and gameplay-scale browser review. |
| Audio character and acoustic fit | `6.4/10` | `>=7.0/10` | Keep the cue-target and audio-lab pipeline, but require human listening and cleaner isolated windows before broader claims. |
| Persona and review maturity | partial | explicit game-owned beginner/intermediate/expert/professional expectations | Stop treating persona review as Aurora-only; define Guardians-specific survival, score, and route expectations by wave band. |
| Platform boundary and multi-game validation | `10/10` | keep `10/10` | Preserve no-Aurora-leakage rules while expanding score, replay, pilot, and settings surfaces to work cleanly for two games. |
| Public release readiness | `3.9/10` | `4.5/10` on the branch, `7.0/10` before beta-quality game claims | Keep the score honest until the game has better sound, better feel, clearer completion, and a game-owned review story. |

## Required Harness Spine

The first-class Galaxy process should always be reviewable through this spine:

- ingestion and provenance
  - `npm run harness:check:galaxian-reference-profile`
- aggregate process parity
  - `npm run harness:check:galaxy-guardians-first-class-conformance`
- current reference and playtest posture
  - `npm run harness:check:galaxy-guardians-reference-conformance`
  - `npm run harness:check:galaxy-guardians-playtest-conformance-review`
- runtime completeness
- `npm run harness:check:galaxy-guardians-runtime-slice`
- `npm run harness:check:galaxy-guardians-playable-preview`
- `npm run harness:check:galaxy-guardians-game-owned-identity`
- `npm run harness:check:galaxy-guardians-one-level-completion`
- `npm run harness:check:galaxy-guardians-score-progression`
- `npm run harness:check:galaxy-guardians-threat-scoring`
- visual identity
  - `npm run harness:check:galaxy-guardians-visual-readability`
  - `npm run harness:check:galaxy-guardians-sprite-grid-targets`
  - `npm run harness:check:galaxy-guardians-sprite-component-targets`
- motion and rack pressure
  - `npm run harness:check:galaxy-guardians-formation-entry`
  - `npm run harness:check:galaxy-guardians-movement-pacing`
  - `npm run harness:check:galaxy-guardians-stage-rank-pressure`
  - `npm run harness:check:galaxy-guardians-runtime-reference-movement`
- audio identity
  - `npm run harness:check:galaxy-guardians-audio-cue-targets`
  - `npm run harness:check:galaxy-guardians-audio-character`
  - `npm run harness:check:galaxy-guardians-audio-conformance-lab`
- platform and multi-game boundaries
  - `npm run harness:check:gameplay-adapter-boundaries`
  - `npm run harness:check:platinum-pack-boot`
  - `npm run harness:check:compact-cabinet-rails`

## Manual Review Loop

Automation is not enough yet for the last Guardians gaps. Each serious Galaxy
review pass should also include:

1. browser review of rack settle, first dive, flagship/escort pressure, and
   wrap/return feel
2. browser review of sprite density, rack readability, and score/mission
   surfaces at real gameplay scale
3. human listening against promoted cue previews for shot, enemy-shot, dive,
   hit, player-loss, and game-over moments
4. result-state review so loss and completion are understandable without
   preview-only placeholder messaging

These manual reads should update committed artifacts or docs, not live only in
chat.

## Immediate Work To Start Now

### 1. Conformance-process parity

- add and keep the aggregate `harness:check:galaxy-guardians-first-class-conformance`
  gate green
- make the core docs cite one Galaxy-first-class plan instead of only scattered
  references

### 2. Game-owned operational identity

- complete score isolation so Guardians results do not silently mix with Aurora
- carry `gameKey` cleanly through score, replay, pilot, and result surfaces

### 3. Completion and result clarity

- replace preview-only completion messaging with real one-level completion and
  loss result flow
- make the mission objective and end-state evidence explicit in runtime and
  harness artifacts

### 4. Highest-value conformance lifts

- human-review sprite targets and attract/score surfaces
- human-review cue targets and runtime/reference audio pairs
- browser-review motion pressure after each measured timing change

### 5. Two-game validation value

- use Guardians as a standing second-game smoke for platform changes
- require multi-game validation whenever shell, score, replay, pilot, or pack
  boundaries move

## Relationship To Other Plans

- the active long working-block execution sequence is tracked in
  [GALAXY_GUARDIANS_8_HOUR_VISUAL_AUDIO_MOTION_PASS_PLAN.md](GALAXY_GUARDIANS_8_HOUR_VISUAL_AUDIO_MOTION_PASS_PLAN.md)
- the earlier six-hour pass remains recorded in
  [GALAXY_GUARDIANS_6_HOUR_CONFORMANCE_PASS_PLAN.md](GALAXY_GUARDIANS_6_HOUR_CONFORMANCE_PASS_PLAN.md)
- branch-local gameplay-completeness work remains in
  [GALAXY_GUARDIANS_PLAYABLE_0_1_BRANCH_PLAN.md](GALAXY_GUARDIANS_PLAYABLE_0_1_BRANCH_PLAN.md)
- top-level release sequencing remains in [PLAN.md](PLAN.md) and
  [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md)
- shared rules for how game evidence should enter Platinum remain in
  [CLASSIC_ARCADE_INGESTION_FRAMEWORK.md](CLASSIC_ARCADE_INGESTION_FRAMEWORK.md)

This document is the maintained Galaxy-specific bridge between ingestion,
runtime quality, review practice, and release planning.
