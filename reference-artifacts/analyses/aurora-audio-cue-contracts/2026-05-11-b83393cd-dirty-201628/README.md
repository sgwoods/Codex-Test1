# Aurora Audio Cue Contract Analysis

Generated: `2026-05-11T20:16:28.410Z`
Commit: `b83393cd (dirty)`

## Problem

Aurora audio needs a formal contract layer so ingestion, candidate generation, runtime logging, comparison, promotion, and theme variation all optimize the same player-facing meaning rather than isolated waveform similarity.

## Strategy

Load the audio cue contracts, join them to application guide mappings, event-gap risks, focused candidate reports, promotion prechecks, and current quality scoring, then identify which cue families need stronger evidence or a different generation strategy.

## Summary

- Contracts: 8
- Average readiness: 9.09/10
- Highest risk cue: playerHit (3.61/10)
- Runtime-trial allowed cues: 1
- Blocked cues: 7

## Cue Contracts

| Priority | Cue | Family | Readiness | Risk | Status | Recommendation |
| ---: | --- | --- | ---: | ---: | --- | --- |
| 1 | stagePulse | formation-stage-ambience | 9.68 | 0.42 | blocked-by-promotion-precheck | Do not promote convoy-current-window; the latest stagePulse pass improved local risk but still failed masking/stability gates. Build a lower-brightness, lower-variance pressure-bed family before another runtime trial. |
| 2 | playerHit | reward-loss-feedback | 9.68 | 3.61 | runtime-validated-watch-tail | Keep the calibrated layered ship-loss cue in runtime and focus the next pass on the residual playerHit tail gap or a higher-value stagePulse pressure-bed strategy. |
| 2 | bossBoom | impact-explosion-feedback | 8.8 | 3.12 | candidate-loop-needs-new-strategy | Keep this cue as a guardrail while higher-risk audio contracts are improved. |
| 2 | enemyBoom | impact-explosion-feedback | 8.8 | 1.08 | candidate-loop-needs-new-strategy | Keep this cue as a guardrail while higher-risk audio contracts are improved. |
| 2 | bossHit | impact-explosion-feedback | 8.8 | 1.02 | candidate-loop-needs-new-strategy | Keep this cue as a guardrail while higher-risk audio contracts are improved. |
| 2 | enemyHit | impact-explosion-feedback | 8.8 | 0.93 | candidate-loop-needs-new-strategy | Keep this cue as a guardrail while higher-risk audio contracts are improved. |
| 3 | rescueJoin | reward-loss-feedback | 9.68 | 3.33 | blocked-by-promotion-precheck | Do not promote runtime audio; add candidate diversity or broaden segmentation before another measured trial. |
| 3 | challengePerfect | reward-loss-feedback | 8.47 | 1.44 | candidate-loop-needs-new-strategy | Keep this cue as a guardrail while higher-risk audio contracts are improved. |

## Process Position

The audio process now separates contract readiness from runtime promotion. Current evidence says contracts can guide the next candidate cycle, but no cue should ship from synthetic or focused evidence alone.

## Recommended Next Step

Keep the calibrated layered playerHit runtime cue; next either refine the residual playerHit tail/body gap with the same calibrated scorer or move effort to stagePulse pressure-bed strategy if user impact per compute looks higher.
