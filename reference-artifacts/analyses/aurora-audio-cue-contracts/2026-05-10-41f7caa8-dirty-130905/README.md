# Aurora Audio Cue Contract Analysis

Generated: `2026-05-10T13:09:05.487Z`
Commit: `41f7caa8 (dirty)`

## Problem

Aurora audio needs a formal contract layer so ingestion, candidate generation, runtime logging, comparison, promotion, and theme variation all optimize the same player-facing meaning rather than isolated waveform similarity.

## Strategy

Load the audio cue contracts, join them to application guide mappings, event-gap risks, focused candidate reports, promotion prechecks, and current quality scoring, then identify which cue families need stronger evidence or a different generation strategy.

## Summary

- Contracts: 8
- Average readiness: 9.09/10
- Highest risk cue: stagePulse (5.18/10)
- Runtime-trial allowed cues: 1
- Blocked cues: 3

## Cue Contracts

| Priority | Cue | Family | Readiness | Risk | Status | Recommendation |
| ---: | --- | --- | ---: | ---: | --- | --- |
| 1 | stagePulse | formation-stage-ambience | 9.68 | 5.18 | blocked-by-promotion-precheck | Do not promote cadence-phase-muted-square-body; the targeted low-brightness/stability family lost pressure-bed character and still failed masking. Move to phase/envelope-aware or reference-subclip candidates. |
| 2 | playerHit | reward-loss-feedback | 9.68 | 5.1 | blocked-by-promotion-precheck | Build composite loss-cue scoring before any runtime promotion: onset/body/tail should be scheduled and scored separately against restart and gameOver overlap. |
| 2 | enemyHit | impact-explosion-feedback | 8.8 | 1.85 | contract-ready-for-next-candidate-cycle | Keep this cue as a guardrail while higher-risk audio contracts are improved. |
| 2 | enemyBoom | impact-explosion-feedback | 8.8 | 1.05 | contract-ready-for-next-candidate-cycle | Keep this cue as a guardrail while higher-risk audio contracts are improved. |
| 2 | bossBoom | impact-explosion-feedback | 8.8 | 1 | contract-ready-for-next-candidate-cycle | Keep this cue as a guardrail while higher-risk audio contracts are improved. |
| 2 | bossHit | impact-explosion-feedback | 8.8 | 0.87 | contract-ready-for-next-candidate-cycle | Keep this cue as a guardrail while higher-risk audio contracts are improved. |
| 3 | rescueJoin | reward-loss-feedback | 9.68 | 3.28 | runtime-trial-allowed-not-promoted | Run a measured runtime trial only if it can be recaptured immediately with full event-gap, cue-alignment, and quality scoring. |
| 3 | challengePerfect | reward-loss-feedback | 8.47 | 1.45 | candidate-loop-needs-new-strategy | Keep this cue as a guardrail while higher-risk audio contracts are improved. |

## Process Position

The audio process now separates contract readiness from runtime promotion. Current evidence says contracts can guide the next candidate cycle, but no cue should ship from synthetic or focused evidence alone.

## Recommended Next Step

StagePulse candidate cadence-phase-muted-square-body confirms that simple low-brightness stabilization loses pressure-bed character and still fails masking. Next try phase/envelope-aware synthesis or reference-subclip candidates, then rerun focused repeats and promotion precheck.

