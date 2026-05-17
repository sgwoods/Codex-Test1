# Aurora Audio Conformance Lab v2

Generated: 2026-05-17T02:18:22.446Z
Commit: 612f086f (dirty)

## Summary

- Audio score: 7.2/10
- Semantic audio: 9.78/10
- Highest current risk: challengeTransition 4.28/10
- Cue-contract readiness: 9.24/10
- Contract blocked cues: 5
- Runtime trial rejections tracked: 2
- Runtime promotions accepted by this lab: 1

## Cue Families

| Family | Cues | Swept | Accepted keepers | Average risk | Decision | Next |
| --- | --- | ---: | ---: | ---: | --- | --- |
| Formation / Stage Ambience | stagePulse | 1/1 | 0 | 0.84 | swept-no-runtime-keeper | stagePulse: Do not promote Formation Pulse yet; use the measured best candidate to refine the generator or scoring gates. |
| Impact / Explosion Feedback | enemyHit, bossHit, enemyBoom, bossBoom | 4/4 | 0 | 1.95 | swept-no-runtime-keeper | enemyBoom: Do not promote Enemy Boom yet; use the measured best candidate to refine the generator or scoring gates. |
| Reward / Loss Feedback | playerHit, rescueJoin, challengePerfect | 3/3 | 2 | 2.98 | runtime-trial-rejected-needs-new-strategy | playerHit: Build a contract-aware playerHit candidate/pass that either separates death onset/body/tail into runtime cue phases or improves the scoring/capture strategy so the active body is evaluated against the intended sub-event. |

## Promotion Rule

This analyzer records keeper candidates but does not edit runtime cue definitions. Runtime promotion requires a keeper, a refreshed full theme comparison, no cue-alignment regression, no semantic regression, and overall quality >= 9.2.
