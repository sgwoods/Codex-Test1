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
- game-owned review gates plus explicit artifact-review checkpoints
- platform-boundary and two-game validation harnesses
- game-owned release framing, version tracking, and future candidate path

It also means Guardians should sit in the Platinum frame with the same class of
platform-owned support Aurora already benefits from:

- pilot sign-in and signed-in game framing
- game-owned high scores, pilot records, and leaderboard views
- replay and video-capture/export surfaces
- bug-report and feedback transport surfaces
- Arcade Music, SFX, and mute/volume controls through the shared shell
- message, trophy, and other shared overlay surfaces that stay game-aware
  instead of Aurora-shaped

As a standing rule, artifact-grounded evidence should lead the process. Human
play/listen/look review is still allowed when the evidence package cannot yet
settle a question cleanly, but it should be fallback confirmation rather than
the primary baseline.

## Current Baseline

The current maintained source of truth is:

- reference conformance: `7.6/10`
- playtest-weighted conformance: `6.9/10`
- long-surface and persona review: `7.0/10`
- reference maturity: `7.2/10`
- implementation gate coverage: `9.6/10`
- public release readiness: `4.2/10`

This means the Galaxy program is no longer missing machinery.

It already has a serious ingestion-backed evidence stack, but it is still short
of first-class product parity because the highest-value remaining gaps are the
ones a player feels immediately:

- opening `WAIT`/start-stage presentation and score-advance surfaces
- rack march cadence and left-right swarm motion
- explosion and hit/destruction visual feedback
- opening swarm palette families and stage-color progression
- moving starfield / scrolling background motion
- player readiness / missile-ready ship state
- reserve-ship and remaining-life icon fidelity
- level/stage flag graphics and progression markers
- bottom-pass-through wrap/return re-entry from top, not simple reappearance
- formation/rack timing
- lower-field motion pressure
- stage-five-and-beyond survivability and clear consistency
- sprite likeness at real gameplay scale
- audio character under live playback
- score/progression/end-state clarity
- game-owned review flow and release framing
- platform-frame parity across sign-in, scores, replay/video capture, bug
  reports, music, and shared overlays

## Public Slice vs. Deeper-Run Review

The hosted `dev` and `beta` lanes still expose a one-level visible public slice
for Guardians.

This plan also tracks a deeper internal conformance layer built from repeated
rack behavior, bounded stage-band escalation, and deterministic persona runs.

So when this document talks about stage five, later bands, or bounded late-loop
pressure, it is describing the deeper runtime that the harnesses can already
measure, not claiming that the current public preview already exposes multiple
visible levels.

Do not treat later-band metrics as public-release marketing until the playable
lane actually surfaces that depth.

The immediate visual baseline for the current public slice should therefore be
treated as a first-order plan item, not a cosmetic afterthought.

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
| First-class preview `0.2` | `>=8.0/10` reference, `>=7.4/10` playtest, `>=4.5/10` public-readiness planning score | Strong second game for two-game platform validation, with artifact-backed sprite/audio evidence and runtime-measured feel. |
| Beta-worthy application candidate | `>=8.4/10` reference, `>=7.8/10` playtest, `>=7.0/10` public readiness | A game-specific candidate can be reviewed on its own merits without pretending it already matches Aurora maturity. |
| Multi-game Platinum candidate | `>=9.0/10` reference, `>=8.8/10` playtest, `>=8.5/10` public readiness | Platinum can honestly claim two serious games with separate evidence, release identity, and validation value. |

## Strategy By Area

| Area | Current read | Near-term target | Strategy |
| --- | --- | --- | --- |
| Source coverage and provenance | `9.6/10` | keep `>=9.6/10` while promoting stronger artifact-backed evidence | Preserve the three-source Galaxian profile, then convert proxy sprite/cue work into promoted targets rather than replacing provenance with tuning; use human spot-checks only when the artifacts stay ambiguous. |
| Promoted semantic event coverage | `7.8/10` | `>=8.5/10` | Keep the event log central, then add score-table, attract-surface, result-state, and completion-state evidence that can be reviewed against source windows. |
| Opening-stage presentation and HUD fidelity | partial | first visible slice should read as unmistakably Galaxian-family before deeper-run claims expand | Build baseline artifacts for `WAIT`/headline typography, score advance table, reserve ships, missile-ready player state, level flags, moving starfield/background motion, and score/HUD presentation from gameplay-video crops, contact sheets, palette extraction, and other primary sources. |
| Formation and rack timing | `6.2/10` | `>=7.2/10` | Move from connected-component/object proxy timing toward sprite-recognized rack timing plus browser-captured side-by-side traces. |
| Motion and lower-field pressure | `6.2/10` reference and playtest | `>=7.2/10` playtest | Use runtime/reference track comparison first, then promote faster march-like rack cadence, bottom-pass-through top re-entry, dive-path targets, wrap cadence, and later-wave pressure with captured trace review. |
| Single-shot threat, scoring, and progression | `7.5/10` | `>=8.2/10` | Keep the score table game-owned, then add score isolation, proper completion/loss endings, replay identity, and clearer one-level mission closure. |
| Visual alien and player identity | `6.8/10` reference, `6.7/10` playtest | `>=7.2/10` | Promote component-crop work into artifact-backed sprite recognition, attract/score-surface comparison, explosion-state fidelity, and gameplay-scale captured-surface review. |
| Audio character and acoustic fit | `6.4/10` | `>=7.0/10` | Keep the cue-target and audio-lab pipeline, prefer waveform/spectrogram/cue-window baselines, and fall back to human listening only for unresolved edge cases. |
| Persona and review maturity | partial | explicit game-owned beginner/intermediate/expert/professional expectations | Stop treating persona review as Aurora-only; define Guardians-specific survival, score, and route expectations by wave band. |
| Platform boundary and multi-game validation | `10/10` | keep `10/10` | Preserve no-Aurora-leakage rules while expanding score, replay, pilot, and settings surfaces to work cleanly for two games. |
| Platform-frame capability parity | partial | Guardians should feel first-class inside the shell rather than like a special-case preview | Align sign-in, high scores, pilot records, replay/video capture, bug-report transport, Arcade Music/SFX controls, and other shared frame surfaces so they work for Guardians as naturally as they do for Aurora. |
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
- opening-slice baseline
  - `npm run harness:check:galaxy-guardians-opening-slice-baseline`
  - `npm run harness:check:galaxy-guardians-opening-slice-render-surface`
  - `npm run harness:check:galaxy-guardians-attract-score-surface`
- longer-surface and persona review
  - `npm run harness:analyze:galaxy-guardians-long-surface-conformance`
  - `npm run harness:check:galaxy-guardians-long-surface-conformance`
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

## Artifact Review Loop

Automation is not enough yet for the last Guardians gaps, but the default
should still be committed artifact comparison before human judgement. Each
serious Galaxy review pass should first include:

1. rendered or captured side-by-side traces of rack settle, first dive,
   flagship/escort pressure, and wrap/return timing against promoted windows
2. sprite/contact-sheet and attract/score-surface comparisons at gameplay
   scale
3. cue-window, waveform, and spectrogram comparisons for shot, enemy-shot,
   dive, hit, player-loss, and game-over moments
4. result-state and mission-complete artifacts so loss and completion language
   are reviewable without preview-only placeholder messaging

Targeted human play/listen checks are still allowed when the artifact package
does not yet settle the question, but they should be fallback confirmation
rather than the primary baseline.

## Opening-Slice Baseline Program

Because the current live public slice is only one visible level, the most
important immediate misses are the first ones a player sees. The next Guardians
baseline program should explicitly include:

1. `WAIT` / start-stage headline treatment
2. score-advance table and attract/readiness surfaces
3. faster, more march-like left-right swarm cadence
4. explosion and alien-hit visual states
5. opening swarm color families and early stage palette progression
6. moving starfield / scrolling background motion
7. missile-ready player-ship graphic/state
8. reserve-ship / ships-remaining icons
9. level/stage flag markers
10. bottom-exit ships visibly continuing through and re-entering from the top
   rather than simply popping back in

Each of these should be grounded in committed baseline artifacts from gameplay
video, frame crops, contact sheets, palette extraction, timing traces, and
other primary sources before runtime tuning broadens. The existing
`nenriki-15-wave-session` long-session source should remain one of the main
baseline references for background motion, wrap/return behavior, and sustained
swarm feel.

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

- build the opening-slice baseline artifact package for `WAIT`, score table,
  rack march cadence, explosion states, palettes, moving starfield motion,
  reserve ships, missile-ready state, stage flags, and bottom-pass-through top
  re-entry behavior
- promote artifact-backed sprite targets and attract/score surfaces
- promote artifact-backed cue targets and runtime/reference audio pairs
- compare motion pressure after each measured timing change using captured
  runtime/reference traces

### 5. Two-game validation value

- use Guardians as a standing second-game smoke for platform changes
- require multi-game validation whenever shell, score, replay, pilot, or pack
  boundaries move

### 6. Platform-frame parity

- make Guardians a first-class consumer of pilot sign-in, pilot card, high
  scores, leaderboard, and trophy surfaces
- make replay and video-capture/export flows game-aware for Guardians, not just
  Aurora-shaped
- make bug-report and feedback transport preserve Guardians identity cleanly
- make Arcade Music, SFX, mute, and volume surfaces behave consistently for
  Guardians through the shared shell
- use these parity surfaces as part of the standing two-game validation story,
  not as optional polish after gameplay work

## Relationship To Other Plans

- the active long working-block execution sequence is tracked in
  [GALAXY_GUARDIANS_8_HOUR_VISUAL_AUDIO_MOTION_PASS_PLAN.md](GALAXY_GUARDIANS_8_HOUR_VISUAL_AUDIO_MOTION_PASS_PLAN.md)
- the maintained longer-surface and persona review model is in
  [GALAXY_GUARDIANS_LONG_SURFACE_AND_PERSONA_PLAN.md](GALAXY_GUARDIANS_LONG_SURFACE_AND_PERSONA_PLAN.md)
- the maintained game-arc, stage-band, and homage-variant grammar is in
  [GALAXY_GUARDIANS_STAGE_ARC_AND_HOMAGE_PLAN.md](GALAXY_GUARDIANS_STAGE_ARC_AND_HOMAGE_PLAN.md)
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
