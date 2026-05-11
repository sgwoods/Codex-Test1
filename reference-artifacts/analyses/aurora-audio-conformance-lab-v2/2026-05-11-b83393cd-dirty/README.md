# Aurora Audio Conformance Lab v2

Generated: 2026-05-11T20:17:29.213Z
Commit: b83393cd (dirty)

## Summary

- Audio score: 7.3/10
- Semantic audio: 9.78/10
- Highest current risk: playerHit 3.61/10
- Cue-contract readiness: 9.09/10
- Contract blocked cues: 7
- Runtime promotions accepted by this lab: 1

## Cue Families

| Family | Cues | Swept | Accepted keepers | Average risk | Decision | Next |
| --- | --- | ---: | ---: | ---: | --- | --- |
| Formation / Stage Ambience | stagePulse | 1/1 | 0 | 0.42 | swept-no-runtime-keeper | Continue candidate generation for stagePulse; current risk 0.42/10. |
| Impact / Explosion Feedback | enemyHit, bossHit, enemyBoom, bossBoom | 4/4 | 0 | 1.54 | swept-no-runtime-keeper | Continue candidate generation for bossBoom; current risk 3.12/10. |
| Reward / Loss Feedback | playerHit, rescueJoin, challengePerfect | 3/3 | 2 | 2.79 | keeper-found-awaiting-full-promotion-gates | Review accepted Reward / Loss Feedback cue(s) against final theme comparison, semantic score, and overall quality before editing runtime audio. |

## Promotion Rule

This analyzer records keeper candidates but does not edit runtime cue definitions. Runtime promotion requires a keeper, a refreshed full theme comparison, no cue-alignment regression, no semantic regression, and overall quality >= 9.2.
