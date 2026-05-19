# Stage 15 Challenge Candidate Sweep

Generated: 2026-05-19T04:12:46.975Z
Commit: fda97ed9
Branch: codex/macbook-conformance-investment-review

## Purpose

Stage 15 currently has safe challenge behavior but still does not consistently read as its expected Galaga challenge reference. This sweep is a harness-only candidate loop: it varies layout/path parameters, samples runtime challenge motion, compares each candidate against media-backed Galaga challenge labels, and refuses runtime promotion unless a measured keeper improves the expected stage reference without safety regression.

## Summary

- Baseline expected-reference score: 5.8/10.
- Best candidate expected-reference score: 6.3/10.
- Best candidate: stage15-a168-d092-x74-w106-s008-p2.
- Keeper decision: no-runtime-keeper-yet.
- Player-facing meaning: This pass improved the search process more than the shipped game: no candidate earned enough measured lift to promote safely.
- Process meaning: Future challenge tuning can now compare many runtime candidates against Galaga labels before editing game constants.

## Top Candidates

| Rank | Candidate | Selection | Expected Labels | Target-Video Fit | Best Match | Expected Hit | Safety |
| ---: | --- | ---: | ---: | ---: | --- | --- | --- |
| 1 | stage15-a168-d092-x74-w106-s008-p2 | 7.18/10 | 6.3/10 | 3.1/10 | challenge-2-arrival-group-1 (6.9/10) | no | pass |
| 2 | stage15-a168-d092-x68-w106-s01-p0 | 7.08/10 | 6.2/10 | 3.1/10 | challenge-2-arrival-group-1 (7/10) | no | pass |
| 3 | stage15-a194-d092-x68-w106-s008-p2 | 7.06/10 | 6.2/10 | 3/10 | challenge-2-arrival-group-1 (6.9/10) | no | pass |
| 4 | stage15-a194-d092-x82-w106-s008-p2 | 7.06/10 | 6.2/10 | 3/10 | challenge-3-arrival-group-1 (6.9/10) | no | pass |
| 5 | stage15-target-late-hold-current-speed-p0 | 7.06/10 | 6.2/10 | 3/10 | challenge-2-arrival-group-1 (6.9/10) | no | pass |
| 6 | stage15-a194-d108-x68-w122-s008-p0 | 7.05/10 | 6.1/10 | 3.4/10 | challenge-2-arrival-group-1 (7.1/10) | no | pass |
| 7 | stage15-a168-d108-x68-w122-s01-p0 | 7/10 | 6.1/10 | 3.2/10 | challenge-2-arrival-group-1 (7.1/10) | no | pass |
| 8 | stage15-a194-d124-x68-w106-s008-p0 | 7/10 | 6.1/10 | 3.2/10 | challenge-2-arrival-group-1 (7.2/10) | no | pass |
| 9 | stage15-a168-d108-x74-w106-s01-p0 | 6.98/10 | 6.1/10 | 3.1/10 | challenge-2-arrival-group-1 (7/10) | no | pass |
| 10 | stage15-a168-d124-x74-w106-s008-p0 | 6.95/10 | 6/10 | 3.4/10 | challenge-2-arrival-group-1 (6.9/10) | no | pass |
| 11 | stage15-a194-d124-x82-w106-s008-p0 | 6.95/10 | 6/10 | 3.4/10 | challenge-2-arrival-group-1 (7.1/10) | no | pass |
| 12 | stage15-a168-d108-x74-w122-s01-p0 | 6.93/10 | 6/10 | 3.3/10 | challenge-2-arrival-group-1 (7/10) | no | pass |

## Next Step

Broaden the candidate strategy to include path-shape constants or richer reference labels before changing runtime stage-15 gameplay.
