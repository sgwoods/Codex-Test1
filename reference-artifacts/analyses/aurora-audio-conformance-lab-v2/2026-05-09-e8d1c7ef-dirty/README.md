# Aurora Audio Conformance Lab v2

Generated: 2026-05-09T20:43:27.825Z
Commit: e8d1c7ef (dirty)

## Summary

- Audio score: 6.7/10
- Semantic audio: 9.78/10
- Highest current risk: stagePulse 5.04/10
- Runtime promotions accepted by this lab: 3

## Cue Families

| Family | Cues | Swept | Accepted keepers | Average risk | Decision | Next |
| --- | --- | ---: | ---: | ---: | --- | --- |
| Formation / Stage Ambience | stagePulse | 1/1 | 0 | 5.04 | swept-no-runtime-keeper | Continue candidate generation for stagePulse; current risk 5.04/10. |
| Impact / Explosion Feedback | enemyHit, bossHit, enemyBoom, bossBoom | 4/4 | 4 | 3.29 | keeper-found-awaiting-full-promotion-gates | Review accepted Impact / Explosion Feedback cue(s) against final theme comparison, semantic score, and overall quality before editing runtime audio. |
| Reward / Loss Feedback | playerHit, rescueJoin, challengePerfect | 3/3 | 1 | 1.88 | keeper-found-awaiting-full-promotion-gates | Review accepted Reward / Loss Feedback cue(s) against final theme comparison, semantic score, and overall quality before editing runtime audio. |

## Promotion Rule

This analyzer records keeper candidates but does not edit runtime cue definitions. Runtime promotion requires a keeper, a refreshed full theme comparison, no cue-alignment regression, no semantic regression, and overall quality >= 9.2.

