# Stage 3 Challenge Candidate Sweep

Generated: 2026-05-19T03:21:45.064Z
Commit: fba7f625
Branch: codex/macbook-conformance-investment-review

## Purpose

Stage 3 currently has safe challenge behavior but still does not consistently read as its expected Galaga challenge reference. This sweep is a harness-only candidate loop: it varies layout/path parameters, samples runtime challenge motion, compares each candidate against media-backed Galaga challenge labels, and refuses runtime promotion unless a measured keeper improves the expected stage reference without safety regression.

## Summary

- Baseline expected-reference score: 7.2/10.
- Best candidate expected-reference score: 7.3/10.
- Best candidate: stage3-a092-d096-x56-w142-s01-p0.
- Keeper decision: no-runtime-keeper-yet.
- Player-facing meaning: This pass improved the search process more than the shipped game: no candidate earned enough measured lift to promote safely.
- Process meaning: Future challenge tuning can now compare many runtime candidates against Galaga labels before editing game constants.

## Top Candidates

| Rank | Candidate | Selection | Expected Labels | Best Match | Expected Hit | Safety |
| ---: | --- | ---: | ---: | --- | --- | --- |
| 1 | stage3-a092-d096-x56-w142-s01-p0 | 8.25/10 | 7.3/10 | challenge-1-arrival-group-1 (7.3/10) | yes | pass |
| 2 | stage3-a092-d114-x56-w142-s01-p0 | 8.25/10 | 7.3/10 | challenge-1-arrival-group-1 (7.3/10) | yes | pass |
| 3 | stage3-a092-d114-x56-w142-s01-p1 | 8.25/10 | 7.3/10 | challenge-1-arrival-group-1 (7.3/10) | yes | pass |
| 4 | stage3-a092-d114-x56-w142-s015-p1 | 8.25/10 | 7.3/10 | challenge-1-arrival-group-1 (7.3/10) | yes | pass |
| 5 | stage3-a092-d114-x56-w168-s01-p0 | 8.25/10 | 7.3/10 | challenge-1-arrival-group-1 (7.3/10) | yes | pass |
| 6 | stage3-a092-d114-x56-w168-s01-p1 | 8.25/10 | 7.3/10 | challenge-1-arrival-group-1 (7.3/10) | yes | pass |
| 7 | stage3-a092-d114-x56-w168-s015-p1 | 8.25/10 | 7.3/10 | challenge-1-arrival-group-1 (7.3/10) | yes | pass |
| 8 | stage3-a092-d114-x72-w142-s01-p1 | 8.25/10 | 7.3/10 | challenge-1-arrival-group-1 (7.3/10) | yes | pass |
| 9 | stage3-a092-d114-x72-w142-s015-p0 | 8.25/10 | 7.3/10 | challenge-1-arrival-group-1 (7.3/10) | yes | pass |
| 10 | stage3-a092-d114-x72-w142-s015-p1 | 8.25/10 | 7.3/10 | challenge-1-arrival-group-1 (7.3/10) | yes | pass |
| 11 | stage3-a092-d114-x72-w168-s01-p0 | 8.25/10 | 7.3/10 | challenge-1-arrival-group-1 (7.3/10) | yes | pass |
| 12 | stage3-a092-d114-x72-w168-s01-p1 | 8.25/10 | 7.3/10 | challenge-1-arrival-group-1 (7.3/10) | yes | pass |

## Next Step

Broaden the candidate strategy to include path-shape constants or richer reference labels before changing runtime stage-3 gameplay.
