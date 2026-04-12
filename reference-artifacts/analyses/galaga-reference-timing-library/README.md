# Galaga Reference Timing Library

This library is the durable reference spine for Galaga-aligned timing, audio, pacing, and transition work in Aurora.

It is meant to shorten iteration cycles by giving us one place to look for:

- canonical event families
- strongest current reference assets
- measured timing targets
- current Aurora comparison numbers
- reusable rules for future fixed-screen arcade packs

## Default rule

- use measured reference artifacts first for timing, motion, audio, pacing, and transition decisions
- use manual listening/viewing as validation after the measured baseline is in place
- preserve full canonical phrases when feasible and widen the game window before shortening them

## Current source spine

- `reference-artifacts/analyses/galaga-stage-reference-video/README.md`
- `reference-artifacts/analyses/galaga-audio-reference-video/README.md`
- `reference-artifacts/analyses/galaga-audio-reference-video-2/README.md`
- `reference-artifacts/analyses/galaga-audio-reference-video-3/README.md`
- `reference-artifacts/analyses/galaga-audio-cue-matrix/README.md`
- `reference-artifacts/analyses/galaga-timing-alignment/2026-04-11-main-0549c6f/README.md`
- `reference-artifacts/analyses/galaga-audio-overlap/2026-04-12-main-a777fba/README.md`
- `reference-artifacts/analyses/galaga-stage-opening-timing/2026-04-12-main-a777fba/README.md`

## Current latest measured artifacts

- Timing alignment: `reference-artifacts/analyses/galaga-timing-alignment/2026-04-11-main-0549c6f`
- Audio overlap: `reference-artifacts/analyses/galaga-audio-overlap/2026-04-12-main-a777fba`
- Stage opening timing: `reference-artifacts/analyses/galaga-stage-opening-timing/2026-04-12-main-a777fba`

## Canonical event families

| Event family | Aurora cue slots | Key measured targets / current comparison |
| --- | --- | --- |
| Opening Sequence | `gameStart`, `formationArrival`, `stagePulse` | startPhraseDuration: 4; formationArrivalAfterStart: 4.18; firstVisibleAlienArrivalsAfterStart: 5.35; firstConvoyPulseAfterStart: 6.15 |
| Formation Arrival And Convoy Cadence | `formationArrival`, `stagePulse`, `attackCharge` | firstStagePulseAfterSpawn: 0.817; firstAttackAfterSpawn: 8.2; firstLowerFieldAfterSpawn: 9.35 |
| Enemy Dive And Charge | `attackCharge` | firstChargeAfterDive: 0 |
| Capture Beam And Capture Flow | `captureBeam`, `captureSuccess`, `captureRetreat`, `capturedFighterDestroyed`, `rescueJoin` | Reference assets and notes only |
| Ship Loss And Respawn | `playerHit`, `gameOver` | playerHitCueRelativeToLoss: 0 |
| Stage Clear And Next Stage | `stageTransition`, `stagePulse` | transitionWindow: 3.204; transitionCueAfterProbe: 2.022; spawnAfterTransitionCue: 1.182 |
| Challenge Entry, Results, And Perfect | `challengeTransition`, `challengeResults`, `challengePerfect`, `stageTransition` | challengeEntry.cueAfterProbe: 2.219; challengeEntry.spawnAfterCue: 0.583; challengePerfect.resultCueAfterClear: 0.342; challengePerfect.nextCueAfterClear: 2.85 |
| Boss Hit And Boss Death | `bossHit`, `bossBoom` | Reference assets and notes only |
| High Score And Results Flow | `highScoreFirst`, `highScoreOther` | Reference assets and notes only |

## How to use this library

1. Put the polish issue into one event family first.
2. Start from the linked reference assets and measured timing values.
3. Compare Aurora runtime behavior against those values before changing clips or delays.
4. If a full canonical phrase exists, try to widen the gameplay window before creating a shortened runtime-safe excerpt.
5. Add new measured evidence back into this library so the next pass starts faster.

## Recommended next extensions

- add a boss-specific timing probe and feed it into the `boss-hit-and-boss-death` family
- add visual sync measurements for ship loss and respawn
- add capture-flow timing probes for beam deploy, successful capture, retreat, and rescue join
- add a parallel `galaxian-reference-timing-library` when second-game work begins

## Generated outputs

- Library JSON: `reference-artifacts/analyses/galaga-reference-timing-library/event-families.json`
- This README: `reference-artifacts/analyses/galaga-reference-timing-library/README.md`
