# Galaxy Guardians Stage-Five Readability Candidate

Generated: 2026-09-24T22:13:47.671Z
Status: analysis-only-no-runtime-change

## Summary

Measured 15 stage-five readability candidates against guardians-stage-five-lower-field-readability-v0. Active dive cap v5 is the best gate-clearing profile; Active dive cap v4 has the highest strict readability but does not clear the gate. Missile pace preserved: yes.

This artifact is candidate-harness evidence only. It does not change shipped
Guardians runtime constants.

| Candidate | Readability | Lift | Routeability | Collision Losses | Lane Overlap | Pressure Retention | Gate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Lower-field path clarity v0 | 3.2/10 | 0.2/10 | 5.7/10 | 59% | 33% | 102% | blocked |
| Lane separation v1 | 3.2/10 | 0.2/10 | 5.5/10 | 62% | 26% | 101% | blocked |
| Commitment window v1 | 3.7/10 | 0.7/10 | 6.4/10 | 35% | 30% | 109% | measurement pass |
| Commitment window v2 | 3.1/10 | 0.1/10 | 6.5/10 | 47% | 25% | 116% | blocked |
| Topology lane offset v1 | 3.4/10 | 0.4/10 | 5.6/10 | 53% | 29% | 93% | blocked |
| Topology corridor v2 | 2.9/10 | -0.1/10 | 6.1/10 | 63% | 35% | 112% | blocked |
| Topology lane weave v3 | 3.6/10 | 0.6/10 | 6.1/10 | 40% | 26% | 96% | measurement pass |
| Threat source corridor v1 | 3.7/10 | 0.7/10 | 6.3/10 | 55% | 12% | 113% | blocked |
| Threat source separation v2 | 3.5/10 | 0.5/10 | 6.2/10 | 48% | 16% | 112% | measurement pass |
| Threat source formation v3 | 3/10 | 0/10 | 5.6/10 | 60% | 17% | 96% | blocked |
| Combined corridor fairness v1 | 3.4/10 | 0.4/10 | 6.3/10 | 51% | 20% | 118% | blocked |
| Combined lane spacing v2 | 4/10 | 1/10 | 6.5/10 | 32% | 14% | 112% | measurement pass |
| Combined single-lower-threat v3 | 3.6/10 | 0.6/10 | 6.4/10 | 49% | 12% | 113% | measurement pass |
| Active dive cap v4 | 4.8/10 | 1.8/10 | 6.7/10 | 12% | 12% | 87% | blocked |
| Active dive cap v5 | 4.7/10 | 1.7/10 | 6.6/10 | 40% | 8% | 103% | measurement pass |

## Baseline

| Signal | Current |
| --- | ---: |
| Lower-field readability | 3/10 |
| Routeability | 5.6/10 |
| Collision-loss share | 49% |
| Lane-overlap share | 35% |
| Enemy missile speed | 128.563px/s |
| Single-shot cooldown | 0.72s |

## Best Candidate

guardians-stage-five-active-dive-cap-v5 is the current best measured
candidate. Active dive cap v5 is the best gate-clearing candidate: lower-field readability changes by 1.7/10, routeability by 1/10, collision-loss share by -9 points, and measured pressure retention is 103%.

## Next Step

- Use the best passing candidate, if any, to generate a browser/contact-sheet before-after review.
- Do not promote runtime constants until the candidate also passes stage-five closeness, routeability review, and first-class conformance after refreshed artifacts.
- If the threat-source family still does not clear visual review, the next candidate family should combine source eligibility with dive selection fairness before changing missile pace.
