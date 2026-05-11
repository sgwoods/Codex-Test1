# Aurora Audio Conformance Lab v2

Generated: 2026-05-09T20:55:32.360Z
Commit: fa13c102 (dirty)

## Summary

- Audio score: 6.8/10
- Semantic audio: 9.78/10
- Highest current risk: stagePulse 5.01/10
- Runtime promotions accepted by this lab: 4

## Cue Families

| Family | Cues | Swept | Accepted keepers | Average risk | Decision | Next |
| --- | --- | ---: | ---: | ---: | --- | --- |
| Formation / Stage Ambience | stagePulse | 1/1 | 0 | 5.01 | swept-no-runtime-keeper | Continue candidate generation for stagePulse; current risk 5.01/10. |
| Impact / Explosion Feedback | enemyHit, bossHit, enemyBoom, bossBoom | 4/4 | 4 | 2.69 | keeper-found-awaiting-full-promotion-gates | Review accepted Impact / Explosion Feedback cue(s) against final theme comparison, semantic score, and overall quality before editing runtime audio. |
| Reward / Loss Feedback | playerHit, rescueJoin, challengePerfect | 3/3 | 0 | 2.45 | swept-no-runtime-keeper | Continue candidate generation for rescueJoin; current risk 3.44/10. |

## Promotion Rule

This analyzer records keeper candidates but does not edit runtime cue definitions. Runtime promotion requires a keeper, a refreshed full theme comparison, no cue-alignment regression, no semantic regression, and overall quality >= 9.2.

