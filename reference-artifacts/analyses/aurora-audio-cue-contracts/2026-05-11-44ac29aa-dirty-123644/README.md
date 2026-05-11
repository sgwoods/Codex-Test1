# Aurora Audio Cue Contract Analysis

Generated: `2026-05-11T12:36:44.221Z`
Commit: `44ac29aa (dirty)`

## Problem

Aurora audio needs a formal contract layer so ingestion, candidate generation, runtime logging, comparison, promotion, and theme variation all optimize the same player-facing meaning rather than isolated waveform similarity.

## Strategy

Load the audio cue contracts, join them to application guide mappings, event-gap risks, focused candidate reports, promotion prechecks, and current quality scoring, then identify which cue families need stronger evidence or a different generation strategy.

## Summary

- Contracts: 8
- Average readiness: 9.09/10
- Highest risk cue: stagePulse (5.02/10)
- Runtime-trial allowed cues: 0
- Blocked cues: 8

## Cue Contracts

| Priority | Cue | Family | Readiness | Risk | Status | Recommendation |
| ---: | --- | --- | ---: | ---: | --- | --- |
| 1 | stagePulse | formation-stage-ambience | 9.68 | 5.02 | blocked-by-promotion-precheck | Do not promote convoy-current-window; the latest stagePulse pass improved local risk but still failed masking/stability gates. Build a lower-brightness, lower-variance pressure-bed family before another runtime trial. |
| 2 | enemyHit | impact-explosion-feedback | 8.8 | 2.08 | candidate-loop-needs-new-strategy | Keep this cue as a guardrail while higher-risk audio contracts are improved. |
| 2 | playerHit | reward-loss-feedback | 9.68 | 1.5 | blocked-by-promotion-precheck | Build composite loss-cue scoring before any runtime promotion: onset/body/tail should be scheduled and scored separately against restart and gameOver overlap. |
| 2 | bossHit | impact-explosion-feedback | 8.8 | 1.17 | candidate-loop-needs-new-strategy | Keep this cue as a guardrail while higher-risk audio contracts are improved. |
| 2 | bossBoom | impact-explosion-feedback | 8.8 | 1.06 | candidate-loop-needs-new-strategy | Keep this cue as a guardrail while higher-risk audio contracts are improved. |
| 2 | enemyBoom | impact-explosion-feedback | 8.8 | 1.05 | candidate-loop-needs-new-strategy | Keep this cue as a guardrail while higher-risk audio contracts are improved. |
| 3 | rescueJoin | reward-loss-feedback | 9.68 | 3.27 | blocked-by-promotion-precheck | Do not promote runtime audio; add candidate diversity or broaden segmentation before another measured trial. |
| 3 | challengePerfect | reward-loss-feedback | 8.47 | 1.43 | candidate-loop-needs-new-strategy | Keep this cue as a guardrail while higher-risk audio contracts are improved. |

## Process Position

The audio process now separates contract readiness from runtime promotion. Current evidence says contracts can guide the next candidate cycle, but no cue should ship from synthetic or focused evidence alone.

## Recommended Next Step

StagePulse candidate convoy-current-window is a measured near miss: full-theme precheck shows improvement, but focused masking/stability gates reject promotion. Next build a stronger low-brightness, low-variance pressure-bed generator, then rerun focused repeats and promotion precheck.
