# Aurora Audio Conformance Lab v2

Generated: 2026-05-16T21:56:54.716Z
Commit: b456e040 (dirty)

## Summary

- Audio score: 7.3/10
- Semantic audio: 9.78/10
- Highest current risk: challengePerfect 6.95/10
- Cue-contract readiness: 9.09/10
- Contract blocked cues: 7
- Runtime promotions accepted by this lab: 1

## Cue Families

| Family | Cues | Swept | Accepted keepers | Average risk | Decision | Next |
| --- | --- | ---: | ---: | ---: | --- | --- |
| Formation / Stage Ambience | stagePulse | 1/1 | 0 | 0.43 | swept-no-runtime-keeper | stagePulse: Do not promote Formation Pulse yet; use the measured best candidate to refine the generator or scoring gates. |
| Impact / Explosion Feedback | enemyHit, bossHit, enemyBoom, bossBoom | 4/4 | 0 | 1.8 | swept-no-runtime-keeper | enemyBoom: Do not promote Enemy Boom yet; use the measured best candidate to refine the generator or scoring gates. |
| Reward / Loss Feedback | playerHit, rescueJoin, challengePerfect | 3/3 | 1 | 4.06 | keeper-found-awaiting-full-promotion-gates | challengePerfect: Use the compact high-pass segment-air result to decide whether synthesized cue roles can satisfy both segmentation and band-shape gates, or whether this event needs a reference-clip/subclip playback strategy. |

## Promotion Rule

This analyzer records keeper candidates but does not edit runtime cue definitions. Runtime promotion requires a keeper, a refreshed full theme comparison, no cue-alignment regression, no semantic regression, and overall quality >= 9.2.
