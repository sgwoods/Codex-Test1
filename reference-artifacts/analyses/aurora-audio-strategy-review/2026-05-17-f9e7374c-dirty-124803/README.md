# Aurora Audio Conformance Strategy Review

Generated: `2026-05-17T12:48:03.916Z`
Commit: `f9e7374c (dirty)`

## Executive Read

Aurora audio is not failing because the reference clips are bad. It is failing because the current loop overweights isolated waveform wins while the live full-theme capture, segmentation, and event-in-context scoring are unstable enough to reverse those wins. The next audio investment should stabilize the measurement harness before more runtime cue promotion.

## Current Evidence

- Latest audio event-gap highest risk: `challengePerfect` 7.7/10.
- Latest average worst-segment risk: 3.27/10.
- Risk stability: 19/21 cues volatile; most volatile `captureBeam` (3.89/10 range).
- Promotion stability gate: 0 runtime trials allowed; global block on.
- Latest runtime trial: `challengePerfect` runtime-trial-rejected.

## Why Accurate References Are Not Enough

- **The target clip is accurate, but the measured event is not the same object:** A Galaga reference phrase can be exact while Aurora plays it through a different event contract: different ceremony length, stop-cue behavior, background cadence, player state, and score handoff. Isolated cue similarity cannot guarantee player-facing conformance.
- **Full-theme capture and segmentation are currently too volatile:** The latest stability run marks 19/21 cues volatile. That means a single full-theme comparison can move more than a candidate change, so promotion based on one run is not trustworthy.
- **Onset scoring dominates musical/semantic quality:** Challenge Perfect can improve average risk while still worsening as the highest-risk cue because a small onset or segment-boundary shift dominates the score. The scorer needs canonical self-similarity controls and confidence intervals before it should drive runtime edits.
- **The current candidate loop optimizes subwindows before context:** The loop is good at finding plausible reference subclips, but weak at proving that the chosen clip survives live game timing, overlap, cooldown, stop-cue interactions, and score/transition pacing.
- **Theme latitude and strict conformance are mixed together:** Aurora needs both a conformant reference lane and expressive theme lanes. The current score sometimes punishes a theme for being thematic while also not being stable enough to prove strict reference improvement.

## Revised Strategy

| Priority | Strategy | Success Measure |
| ---: | --- | --- |
| 1 | Add reference-vs-reference and current-vs-current calibration controls to every full-theme audio report. | Known identical captures score near zero gap with cue risk range <= 0.4/10 before runtime promotion gates are allowed. |
| 2 | Move promotion decisions to repeated median and confidence-bound scoring. | A candidate clears only when the 3-run median improves and the lower-confidence improvement exceeds max(0.5/10, 2x measured standard deviation). |
| 3 | Score in-context event scenarios in addition to isolated cue captures. | Challenge Perfect, challengeTransition, and gameOver are replayed inside their actual transition windows with stop-cue, cadence, and handoff timing active. |
| 4 | Promote event contracts before waveform candidates. | Each cue has explicit onset/body/tail meaning, expected duration, masking tolerance, semantic role, and player-facing read before candidate generation starts. |
| 5 | Separate strict Galaga conformance mode from Aurora theme-expression mode. | Dashboard shows two audio reads: reference-conformant lane and themed-latitude lane, with promotion gates tied to the intended lane. |
| 6 | Use local CPU sweeps for candidate generation, and reserve model/Codex time for strategy, failure classification, and harness design. | Economics reports show more local CPU candidate attempts per accepted harness improvement, while Codex/GPU-equivalent time is tied to durable algorithm changes. |

## Next Experiment

Before any more runtime audio promotion, build a calibration pass that captures Galaga reference cues through the same browser path twice and measures reference-vs-reference, current-vs-current, and current-vs-reference variance for challengePerfect, challengeTransition, gameOver, captureBeam, and stagePulse.

## Source Artifacts

- audioEventGap: `reference-artifacts/analyses/aurora-audio-event-gap/latest.json`
- audioRiskStability: `reference-artifacts/analyses/aurora-audio-risk-stability/latest.json`
- promotionStabilityGate: `reference-artifacts/analyses/aurora-audio-promotion-stability-gate/latest.json`
- runtimeTrial: `reference-artifacts/analyses/aurora-audio-runtime-trials/2026-05-17-f9e7374c-dirty-123945-challenge-perfect-rejected/report.json`
