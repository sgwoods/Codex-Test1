# Aurora Cadence And Perfect-Route Risk Probe

Generated: 2026-06-12T15:37:59.195Z
Commit: b64d4cc7
Branch: codex/aurora-cadence-perfect-route-investigation

## Verdict

- Status: `cadence-perfect-route-risk-found`
- Concerns: `some-targets-never-fully-enter-screen-proxy`, `professional-deterministic-runs-below-success-trajectory`, `challenge-no-combat-grammar-regression`
- Recommendation: Treat this as measurement-backed cleanup input. Do not tune yet; next compare affected waits and challenge paths against archived reference clips before choosing the smallest runtime change.

## Transition Cadence

| Probe | Target Stage | Challenge | Configured Wait | Cue Delay | Read |
| --- | ---: | --- | ---: | ---: | --- |
| regular-stage-1-to-2 | 2 | no | 3.2s | 2.02s | spawn committed through stage-flow transition path |
| regular-stage-4-to-5 | 5 | no | 3.2s | 2.02s | spawn committed through stage-flow transition path |
| challenge-entry-stage-2-to-3 | 3 | yes | 3.35s | 2.22s | spawn committed through stage-flow transition path |

Challenge result handoff:

- Result hold window: 7.77s
- Total clear-to-spawn: 15.15s
- Read: result banner hold plus challengeResult transition committed to next regular stage

## Target Visibility

| Challenge | Internal Stage | Layout | Sprite Full-Inside Coverage | Score Window Coverage | Missing Sprite Proxy | Risk |
| ---: | ---: | --- | ---: | ---: | ---: | --- |
| 1 | 3 | first-challenge-peel | 0.925 | 0.925 | 3 | target-full-visibility-risk |
| 2 | 7 | scorpion-cross-sweep | 0.95 | 0.95 | 2 | target-full-visibility-risk |
| 3 | 11 | stingray-crown-hook-hybrid | 1 | 0.975 | 0 | target-full-visibility-proxy-pass |
| 4 | 15 | pink-serpentine-late | 0.525 | 0.525 | 19 | target-full-visibility-risk |
| 5 | 19 | pink-green-cascade | 0.7 | 0.7 | 12 | target-full-visibility-risk |
| 6 | 23 | green-ladder-split | 0.75 | 0.75 | 10 | target-full-visibility-risk |
| 7 | 27 | yellow-diagonal-fan | 0.375 | 0.375 | 25 | target-full-visibility-risk |
| 8 | 31 | blue-purple-finale | 0.625 | 0.625 | 15 | target-full-visibility-risk |

## Persona Trajectory

| Persona | Avg Hit Rate | Avg Target | Perfects | Below Target Rows | No-Combat Grammar |
| --- | ---: | ---: | ---: | ---: | --- |
| Beginner | 0.575 | 0.281 | 0/8 | 0 | no |
| Intermediate | 0.597 | 0.5 | 0/8 | 0 | no |
| Expert | 0.609 | 0.705 | 0/8 | 5 | no |
| Professional | 0.181 | 0.825 | 0/8 | 8 | yes |

## Limits

- The attached success-rate sheet is treated as a design trajectory, not a hard release gate.
- Persona rows are one deterministic seed per persona/challenge stage; they expose risk but do not prove probabilities.
- Visibility uses center, sprite-size, and score-window proxy boxes from runtime enemy positions; follow-up should use contact sheets or frame-level reference clips for final tuning.
