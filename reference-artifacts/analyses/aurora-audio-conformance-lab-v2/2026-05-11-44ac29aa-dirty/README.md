# Aurora Audio Conformance Lab v2

Generated: 2026-05-11T13:30:13.200Z
Commit: 44ac29aa (dirty)

## Summary

- Audio score: 7.3/10
- Semantic audio: 9.78/10
- Highest current risk: playerHit 7.57/10
- Cue-contract readiness: 9.09/10
- Contract blocked cues: 8
- Runtime promotions accepted by this lab: 0

## Cue Families

| Family | Cues | Swept | Accepted keepers | Average risk | Decision | Next |
| --- | --- | ---: | ---: | ---: | --- | --- |
| Formation / Stage Ambience | stagePulse | 1/1 | 0 | 4.38 | swept-no-runtime-keeper | Continue candidate generation for stagePulse; current risk 4.38/10. |
| Impact / Explosion Feedback | enemyHit, bossHit, enemyBoom, bossBoom | 4/4 | 0 | 2.37 | swept-no-runtime-keeper | Continue candidate generation for bossHit; current risk 2.88/10. |
| Reward / Loss Feedback | playerHit, rescueJoin, challengePerfect | 3/3 | 2 | 4.07 | keeper-found-awaiting-full-promotion-gates | Review accepted Reward / Loss Feedback cue(s) against final theme comparison, semantic score, and overall quality before editing runtime audio. |

## Promotion Rule

This analyzer records keeper candidates but does not edit runtime cue definitions. Runtime promotion requires a keeper, a refreshed full theme comparison, no cue-alignment regression, no semantic regression, and overall quality >= 9.2.
