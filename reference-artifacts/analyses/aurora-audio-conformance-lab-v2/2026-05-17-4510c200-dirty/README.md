# Aurora Audio Conformance Lab v2

Generated: 2026-05-17T01:21:40.035Z
Commit: 4510c200 (dirty)

## Summary

- Audio score: 7.1/10
- Semantic audio: 9.78/10
- Highest current risk: challengePerfect 6.97/10
- Cue-contract readiness: 9.24/10
- Contract blocked cues: 5
- Runtime trial rejections tracked: 2
- Runtime promotions accepted by this lab: 1

## Cue Families

| Family | Cues | Swept | Accepted keepers | Average risk | Decision | Next |
| --- | --- | ---: | ---: | ---: | --- | --- |
| Formation / Stage Ambience | stagePulse | 1/1 | 0 | 0.71 | swept-no-runtime-keeper | stagePulse: Do not promote Formation Pulse yet; use the measured best candidate to refine the generator or scoring gates. |
| Impact / Explosion Feedback | enemyHit, bossHit, enemyBoom, bossBoom | 4/4 | 0 | 1.66 | swept-no-runtime-keeper | bossBoom: Do not promote Boss Boom yet; use the measured best candidate to refine the generator or scoring gates. |
| Reward / Loss Feedback | playerHit, rescueJoin, challengePerfect | 3/3 | 2 | 4.03 | runtime-trial-rejected-needs-new-strategy | challengePerfect: Preserve perfect-measured-onset-soft-ceremony-tail as a focused keeper, but do not promote it directly. Next generate a safer Challenge Perfect ceremony-tail family that keeps the measured onset/body subclip, reduces tail/overlap collapse under live capture, and must hold or improve audio score, event-gap rollup, cue alignment, and overall quality. |

## Promotion Rule

This analyzer records keeper candidates but does not edit runtime cue definitions. Runtime promotion requires a keeper, a refreshed full theme comparison, no cue-alignment regression, no semantic regression, and overall quality >= 9.2.
