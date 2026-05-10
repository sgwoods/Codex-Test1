# Aurora Audio Conformance Lab v2

Generated: 2026-05-10T00:08:53.160Z
Commit: c9ef29d2 (dirty)

## Summary

- Audio score: 6.8/10
- Semantic audio: 9.78/10
- Highest current risk: stagePulse 5.11/10
- Cue-contract readiness: 9.09/10
- Contract blocked cues: 3
- Runtime promotions accepted by this lab: 4

## Cue Families

| Family | Cues | Swept | Accepted keepers | Average risk | Decision | Next |
| --- | --- | ---: | ---: | ---: | --- | --- |
| Formation / Stage Ambience | stagePulse | 1/1 | 0 | 5.11 | swept-no-runtime-keeper | Continue candidate generation for stagePulse; current risk 5.11/10. |
| Impact / Explosion Feedback | enemyHit, bossHit, enemyBoom, bossBoom | 4/4 | 4 | 2.82 | keeper-found-awaiting-full-promotion-gates | Review accepted Impact / Explosion Feedback cue(s) against final theme comparison, semantic score, and overall quality before editing runtime audio. |
| Reward / Loss Feedback | playerHit, rescueJoin, challengePerfect | 3/3 | 1 | 2.02 | keeper-found-awaiting-full-promotion-gates | Review accepted Reward / Loss Feedback cue(s) against final theme comparison, semantic score, and overall quality before editing runtime audio. |

## Promotion Rule

This analyzer records keeper candidates but does not edit runtime cue definitions. Runtime promotion requires a keeper, a refreshed full theme comparison, no cue-alignment regression, no semantic regression, and overall quality >= 9.2.

