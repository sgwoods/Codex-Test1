# Aurora Audio Cue Contract Analysis

Generated: `2026-05-10T00:08:46.517Z`
Commit: `c9ef29d2 (dirty)`

## Problem

Aurora audio needs a formal contract layer so ingestion, candidate generation, runtime logging, comparison, promotion, and theme variation all optimize the same player-facing meaning rather than isolated waveform similarity.

## Strategy

Load the audio cue contracts, join them to application guide mappings, event-gap risks, focused candidate reports, promotion prechecks, and current quality scoring, then identify which cue families need stronger evidence or a different generation strategy.

## Summary

- Contracts: 8
- Average readiness: 9.09/10
- Highest risk cue: stagePulse (5.11/10)
- Runtime-trial allowed cues: 1
- Blocked cues: 3

## Cue Contracts

| Priority | Cue | Family | Readiness | Risk | Status | Recommendation |
| ---: | --- | --- | ---: | ---: | --- | --- |
| 1 | stagePulse | formation-stage-ambience | 9.68 | 5.11 | blocked-by-promotion-precheck | Do not promote soft-attack-low-march; the latest stagePulse pass improved local risk but still failed masking/stability gates. Build a lower-brightness, lower-variance pressure-bed family before another runtime trial. |
| 2 | enemyBoom | impact-explosion-feedback | 8.8 | 3.99 | contract-ready-for-next-candidate-cycle | Keep this cue as a guardrail while higher-risk audio contracts are improved. |
| 2 | bossHit | impact-explosion-feedback | 8.8 | 2.97 | contract-ready-for-next-candidate-cycle | Keep this cue as a guardrail while higher-risk audio contracts are improved. |
| 2 | bossBoom | impact-explosion-feedback | 8.8 | 2.22 | contract-ready-for-next-candidate-cycle | Keep this cue as a guardrail while higher-risk audio contracts are improved. |
| 2 | enemyHit | impact-explosion-feedback | 8.8 | 2.08 | contract-ready-for-next-candidate-cycle | Keep this cue as a guardrail while higher-risk audio contracts are improved. |
| 2 | playerHit | reward-loss-feedback | 9.68 | 0.95 | blocked-by-promotion-precheck | Build composite loss-cue scoring before any runtime promotion: onset/body/tail should be scheduled and scored separately against restart and gameOver overlap. |
| 3 | rescueJoin | reward-loss-feedback | 9.68 | 3.3 | runtime-trial-allowed-not-promoted | Run a measured runtime trial only if it can be recaptured immediately with full event-gap, cue-alignment, and quality scoring. |
| 3 | challengePerfect | reward-loss-feedback | 8.47 | 1.8 | candidate-loop-needs-new-strategy | Keep this cue as a guardrail while higher-risk audio contracts are improved. |

## Process Position

The audio process now separates contract readiness from runtime promotion. Current evidence says contracts can guide the next candidate cycle, but no cue should ship from synthetic or focused evidence alone.

## Recommended Next Step

StagePulse candidate soft-attack-low-march is a measured near miss: full-theme precheck shows improvement, but focused masking/stability gates reject promotion. Next build a stronger low-brightness, low-variance pressure-bed generator, then rerun focused repeats and promotion precheck.

