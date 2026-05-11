# Aurora Audio Cue Contract Analysis

Generated: `2026-05-11T13:30:31.848Z`
Commit: `44ac29aa (dirty)`

## Problem

Aurora audio needs a formal contract layer so ingestion, candidate generation, runtime logging, comparison, promotion, and theme variation all optimize the same player-facing meaning rather than isolated waveform similarity.

## Strategy

Load the audio cue contracts, join them to application guide mappings, event-gap risks, focused candidate reports, promotion prechecks, and current quality scoring, then identify which cue families need stronger evidence or a different generation strategy.

## Summary

- Contracts: 8
- Average readiness: 9.09/10
- Highest risk cue: playerHit (7.57/10)
- Runtime-trial allowed cues: 1
- Blocked cues: 7

## Cue Contracts

| Priority | Cue | Family | Readiness | Risk | Status | Recommendation |
| ---: | --- | --- | ---: | ---: | --- | --- |
| 1 | stagePulse | formation-stage-ambience | 9.68 | 4.38 | blocked-by-promotion-precheck | Do not promote convoy-current-window; the latest stagePulse pass improved local risk but still failed masking/stability gates. Build a lower-brightness, lower-variance pressure-bed family before another runtime trial. |
| 2 | playerHit | reward-loss-feedback | 9.68 | 7.57 | runtime-trial-allowed-not-promoted | Build composite loss-cue scoring before any runtime promotion: onset/body/tail should be scheduled and scored separately against restart and gameOver overlap. |
| 2 | bossHit | impact-explosion-feedback | 8.8 | 2.88 | candidate-loop-needs-new-strategy | Keep this cue as a guardrail while higher-risk audio contracts are improved. |
| 2 | bossBoom | impact-explosion-feedback | 8.8 | 2.3 | candidate-loop-needs-new-strategy | Keep this cue as a guardrail while higher-risk audio contracts are improved. |
| 2 | enemyHit | impact-explosion-feedback | 8.8 | 2.24 | candidate-loop-needs-new-strategy | Keep this cue as a guardrail while higher-risk audio contracts are improved. |
| 2 | enemyBoom | impact-explosion-feedback | 8.8 | 2.06 | candidate-loop-needs-new-strategy | Keep this cue as a guardrail while higher-risk audio contracts are improved. |
| 3 | rescueJoin | reward-loss-feedback | 9.68 | 3.11 | blocked-by-promotion-precheck | Do not promote runtime audio; add candidate diversity or broaden segmentation before another measured trial. |
| 3 | challengePerfect | reward-loss-feedback | 8.47 | 1.54 | candidate-loop-needs-new-strategy | Keep this cue as a guardrail while higher-risk audio contracts are improved. |

## Process Position

The audio process now separates contract readiness from runtime promotion. Current evidence says contracts can guide the next candidate cycle, but no cue should ship from synthetic or focused evidence alone.

## Recommended Next Step

Run a contract-aware candidate pass for playerHit, then rerun promotion precheck and live validation.
