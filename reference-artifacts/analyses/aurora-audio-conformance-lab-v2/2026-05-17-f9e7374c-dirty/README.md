# Aurora Audio Conformance Lab v2

Generated: 2026-05-17T12:57:33.133Z
Commit: f9e7374c (dirty)

## Summary

- Audio score: 7/10
- Semantic audio: 9.78/10
- Highest current risk: challengePerfect 7.7/10
- Cue-contract readiness: 9.3/10
- Contract blocked cues: 5
- Runtime trial rejections tracked: 3
- Runtime promotions accepted by this lab: 0

## Cue Families

| Family | Cues | Swept | Accepted keepers | Average risk | Decision | Next |
| --- | --- | ---: | ---: | ---: | --- | --- |
| Formation / Stage Ambience | stagePulse | 1/1 | 0 | 0.68 | swept-no-runtime-keeper | stagePulse: Do not promote Formation Pulse yet; use the measured best candidate to refine the generator or scoring gates. |
| Impact / Explosion Feedback | enemyHit, bossHit, enemyBoom, bossBoom | 4/4 | 0 | 0.87 | swept-no-runtime-keeper | bossHit: Do not promote Boss Hit yet; use the measured best candidate to refine the generator or scoring gates. |
| Reward / Loss Feedback | playerHit, rescueJoin, challengePerfect | 3/3 | 2 | 3.52 | runtime-trial-rejected-needs-new-strategy | challengePerfect: Do not promote Challenge Perfect from isolated onset/body candidates. Replace the next audio strategy with full-phrase/segment-boundary work: stabilize the scorer on canonical reference-vs-reference capture, then generate candidates that optimize onset, body, tail, and live capture segmentation together. |

## Promotion Rule

This analyzer records keeper candidates but does not edit runtime cue definitions. Runtime promotion requires a keeper, a refreshed full theme comparison, no cue-alignment regression, no semantic regression, and overall quality >= 9.2.
