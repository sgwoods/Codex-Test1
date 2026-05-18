# Aurora Audio Conformance Lab v2

Generated: 2026-05-16T23:59:05.601Z
Commit: 8a54cf6f (dirty)

## Summary

- Audio score: 7.1/10
- Semantic audio: 9.78/10
- Highest current risk: challengePerfect 6.97/10
- Cue-contract readiness: 9.24/10
- Contract blocked cues: 6
- Runtime promotions accepted by this lab: 1

## Cue Families

| Family | Cues | Swept | Accepted keepers | Average risk | Decision | Next |
| --- | --- | ---: | ---: | ---: | --- | --- |
| Formation / Stage Ambience | stagePulse | 1/1 | 0 | 0.71 | swept-no-runtime-keeper | stagePulse: Do not promote Formation Pulse yet; use the measured best candidate to refine the generator or scoring gates. |
| Impact / Explosion Feedback | enemyHit, bossHit, enemyBoom, bossBoom | 4/4 | 0 | 1.66 | swept-no-runtime-keeper | bossBoom: Do not promote Boss Boom yet; use the measured best candidate to refine the generator or scoring gates. |
| Reward / Loss Feedback | playerHit, rescueJoin, challengePerfect | 3/3 | 2 | 4.03 | keeper-found-awaiting-full-promotion-gates | Review accepted Reward / Loss Feedback cue(s) against final theme comparison, semantic score, and overall quality before editing runtime audio. |

## Promotion Rule

This analyzer records keeper candidates but does not edit runtime cue definitions. Runtime promotion requires a keeper, a refreshed full theme comparison, no cue-alignment regression, no semantic regression, and overall quality >= 9.2.
