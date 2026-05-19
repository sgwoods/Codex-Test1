# Stage 7 Challenge Candidate Sweep

Generated: 2026-05-19T03:31:11.739Z
Commit: fba7f625
Branch: codex/macbook-conformance-investment-review

## Purpose

Stage 7 currently has safe challenge behavior but still does not consistently read as its expected Galaga challenge reference. This sweep is a harness-only candidate loop: it varies layout/path parameters, samples runtime challenge motion, compares each candidate against media-backed Galaga challenge labels, and refuses runtime promotion unless a measured keeper improves the expected stage reference without safety regression.

## Summary

- Baseline expected-reference score: 6.9/10.
- Best candidate expected-reference score: 7.3/10.
- Best candidate: stage7-a128-d114-x78-w128-s014-p2.
- Keeper decision: keeper-ready-for-runtime-review.
- Player-facing meaning: A measured stage-7 layout candidate now better matches the expected Galaga challenge reference while keeping challenge stages safe.
- Process meaning: Future challenge tuning can now compare many runtime candidates against Galaga labels before editing game constants.

## Top Candidates

| Rank | Candidate | Selection | Expected Labels | Target-Video Fit | Best Match | Expected Hit | Safety |
| ---: | --- | ---: | ---: | ---: | --- | --- | --- |
| 1 | stage7-a128-d114-x78-w128-s014-p2 | 8.82/10 | 7.3/10 | 2.6/10 | challenge-2-arrival-group-1 (7.3/10) | yes | pass |
| 2 | stage7-a188-d114-x78-w128-s014-p2 | 8.74/10 | 7.2/10 | 2.7/10 | challenge-2-arrival-group-1 (7.2/10) | yes | pass |
| 3 | stage7-a128-d138-x78-w128-s014-p1 | 8.68/10 | 7.2/10 | 2.4/10 | challenge-2-arrival-group-1 (7.2/10) | yes | pass |
| 4 | stage7-a128-d09-x78-w128-s009-p2 | 8.67/10 | 7.1/10 | 2.8/10 | challenge-2-arrival-group-1 (7.1/10) | yes | pass |
| 5 | stage7-a128-d114-x78-w156-s014-p2 | 8.67/10 | 7.1/10 | 2.8/10 | challenge-2-arrival-group-1 (7.1/10) | yes | pass |
| 6 | stage7-a128-d138-x78-w128-s009-p2 | 8.67/10 | 7.1/10 | 2.8/10 | challenge-2-arrival-group-1 (7.1/10) | yes | pass |
| 7 | stage7-a158-d114-x62-w128-s014-p2 | 8.67/10 | 7.1/10 | 2.8/10 | challenge-2-arrival-group-1 (7.1/10) | yes | pass |
| 8 | stage7-a158-d114-x78-w128-s009-p2 | 8.67/10 | 7.1/10 | 2.8/10 | challenge-2-arrival-group-1 (7.1/10) | yes | pass |
| 9 | stage7-a158-d114-x78-w128-s014-p2 | 8.67/10 | 7.1/10 | 2.8/10 | challenge-2-arrival-group-1 (7.1/10) | yes | pass |
| 10 | stage7-a188-d114-x62-w128-s014-p2 | 8.67/10 | 7.1/10 | 2.8/10 | challenge-2-arrival-group-1 (7.1/10) | yes | pass |
| 11 | stage7-a188-d114-x78-w128-s009-p0 | 8.67/10 | 7.1/10 | 2.8/10 | challenge-2-arrival-group-1 (7.1/10) | yes | pass |
| 12 | stage7-a128-d09-x62-w128-s014-p2 | 8.64/10 | 7.1/10 | 2.7/10 | challenge-2-arrival-group-1 (7.1/10) | yes | pass |

## Next Step

Promote the best candidate into the stage-7 layout, rebuild, and rerun challenge-stage conformance plus guardrails.
