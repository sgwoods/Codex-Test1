# Aurora Audio Conformance Lab v2

Generated: 2026-05-17T10:55:51.439Z
Commit: ab80e4c7 (dirty)

## Summary

- Audio score: 7.2/10
- Semantic audio: 9.78/10
- Highest current risk: challengePerfect 7.07/10
- Cue-contract readiness: 9.24/10
- Contract blocked cues: 5
- Runtime trial rejections tracked: 3
- Runtime promotions accepted by this lab: 0

## Cue Families

| Family | Cues | Swept | Accepted keepers | Average risk | Decision | Next |
| --- | --- | ---: | ---: | ---: | --- | --- |
| Formation / Stage Ambience | stagePulse | 1/1 | 0 | 0.38 | swept-no-runtime-keeper | stagePulse: Do not promote Formation Pulse yet; use the measured best candidate to refine the generator or scoring gates. |
| Impact / Explosion Feedback | enemyHit, bossHit, enemyBoom, bossBoom | 4/4 | 0 | 1.85 | swept-no-runtime-keeper | enemyBoom: Do not promote Enemy Boom yet; use the measured best candidate to refine the generator or scoring gates. |
| Reward / Loss Feedback | playerHit, rescueJoin, challengePerfect | 3/3 | 2 | 4.51 | runtime-trial-rejected-needs-new-strategy | challengePerfect: Do not promote Challenge Perfect runtime audio yet. Keep the new harness evidence, stabilize repeated full-theme capture, then compare bossHit, challengeTransition, and gameOver for the next best audio return. |

## Promotion Rule

This analyzer records keeper candidates but does not edit runtime cue definitions. Runtime promotion requires a keeper, a refreshed full theme comparison, no cue-alignment regression, no semantic regression, and overall quality >= 9.2.
