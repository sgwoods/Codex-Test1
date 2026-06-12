# Galaxy Guardians Stage-Five Readability Candidate

Generated: 2026-06-12T22:50:38.905Z
Status: analysis-only-no-runtime-change

## Summary

Measured 10 stage-five readability candidates against guardians-stage-five-lower-field-readability-v0. Commitment window v1 is the best gate-clearing profile; Threat source corridor v1 has the highest strict readability but does not clear the gate. Missile pace preserved: yes.

This artifact is candidate-harness evidence only. It does not change shipped
Guardians runtime constants.

| Candidate | Readability | Lift | Routeability | Collision Losses | Lane Overlap | Pressure Retention | Gate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Lower-field path clarity v0 | 3.1/10 | -0.2/10 | 6/10 | 41% | 33% | 112% | blocked |
| Lane separation v1 | 2.4/10 | -0.9/10 | 5.5/10 | 72% | 26% | 116% | blocked |
| Commitment window v1 | 3.5/10 | 0.2/10 | 6.4/10 | 20% | 30% | 104% | measurement pass |
| Commitment window v2 | 3.1/10 | -0.2/10 | 6.5/10 | 45% | 25% | 121% | blocked |
| Topology lane offset v1 | 3.3/10 | 0/10 | 5.8/10 | 27% | 29% | 89% | blocked |
| Topology corridor v2 | 2.7/10 | -0.6/10 | 6.1/10 | 60% | 35% | 119% | blocked |
| Topology lane weave v3 | 3.4/10 | 0.1/10 | 6.8/10 | 33% | 26% | 121% | blocked |
| Threat source corridor v1 | 3.6/10 | 0.3/10 | 6.5/10 | 50% | 12% | 125% | blocked |
| Threat source separation v2 | 2.8/10 | -0.5/10 | 5.5/10 | 62% | 16% | 109% | blocked |
| Threat source formation v3 | 2.7/10 | -0.6/10 | 5.3/10 | 57% | 17% | 86% | blocked |

## Baseline

| Signal | Current |
| --- | ---: |
| Lower-field readability | 3.3/10 |
| Routeability | 5.8/10 |
| Collision-loss share | 27% |
| Lane-overlap share | 35% |
| Enemy missile speed | 128.563px/s |
| Single-shot cooldown | 0.72s |

## Best Candidate

guardians-stage-five-commitment-window-v1 is the current best measured
candidate. Commitment window v1 is the best gate-clearing candidate: lower-field readability changes by 0.2/10, routeability by 0.6/10, collision-loss share by -7 points, and measured pressure retention is 104%.

## Next Step

- Use the best passing candidate, if any, to generate a browser/contact-sheet before-after review.
- Do not promote runtime constants until the candidate also passes stage-five closeness, routeability review, and first-class conformance after refreshed artifacts.
- If the threat-source family still does not clear visual review, the next candidate family should combine source eligibility with dive selection fairness before changing missile pace.
