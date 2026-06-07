# Galaxy Guardians Routeability Before/After

Generated: 2026-06-05T09:43:45.292Z
Status: planning-study-with-bounded-preview-adoption

## Summary

Measured 3 stage-five relief candidates. Balanced stage-five routeability relief is best so far: 1.3/10 routeability lift, -33 collision-loss point delta, 153% pressure retention.

| Candidate | Baseline Routeability | Candidate Routeability | Lift | Collision Losses | Pressure Retention | Gate |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Balanced stage-five routeability relief | 4.5/10 | 5.8/10 | 1.3/10 | 80% -> 47% | 153% | passes planning gate |
| Lane readability relief | 4.5/10 | 5.5/10 | 1/10 | 80% -> 70% | 136% | passes planning gate |
| Shot density relief | 4.5/10 | 4.9/10 | 0.4/10 | 80% -> 87% | 139% | blocked |

## Best Candidate

stage5-routeability-relief-balanced-v0 is the current best measured planning candidate.
Balanced stage-five routeability relief changes stage-five routeability by 1.3/10, collision-loss share by -33 points, and retains 153% of measured pressure.

This artifact started as a planning study before any runtime change landed. The
current Guardians preview now adopts a bounded version of the balanced
rank-three/four relief strategy that this study identified as the best
candidate. Use this artifact as the planning ledger for why that bounded change
was chosen, not as the post-change runtime baseline.
