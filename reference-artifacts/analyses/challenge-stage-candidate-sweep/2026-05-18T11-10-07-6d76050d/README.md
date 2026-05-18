# Stage 23 Challenge Candidate Sweep

Generated: 2026-05-18T11:10:07.511Z
Commit: 6d76050d
Branch: main

## Purpose

Stage 23 currently has safe challenge behavior but still does not consistently read as its expected Galaga challenge reference. This sweep is a harness-only candidate loop: it varies layout/path parameters, samples runtime challenge motion, compares each candidate against media-backed Galaga challenge labels, and refuses runtime promotion unless a measured keeper improves the expected stage reference without safety regression.

## Summary

- Baseline expected-reference score: 3.6/10.
- Best candidate expected-reference score: 3.8/10.
- Best candidate: stage23-a142-d118-x88-w098-s007.
- Keeper decision: no-runtime-keeper-yet.
- Player-facing meaning: This pass improved the search process more than the shipped game: no candidate earned enough measured lift to promote safely.
- Process meaning: Future challenge tuning can now compare many runtime candidates against Galaga labels before editing game constants.

## Top Candidates

| Rank | Candidate | Selection | Expected Labels | Best Match | Expected Hit | Safety |
| ---: | --- | ---: | ---: | --- | --- | --- |
| 1 | stage23-a142-d118-x88-w098-s007 | 4/10 | 3.8/10 | challenge-1-arrival-group-1 (6/10) | no | pass |
| 2 | stage23-a142-d118-x88-w098-s009 | 4/10 | 3.8/10 | challenge-1-arrival-group-1 (6/10) | no | pass |
| 3 | stage23-a142-d134-x88-w098-s007 | 4/10 | 3.8/10 | challenge-1-arrival-group-1 (6/10) | no | pass |
| 4 | stage23-a142-d134-x88-w098-s009 | 4/10 | 3.8/10 | challenge-1-arrival-group-1 (6/10) | no | pass |
| 5 | stage23-a158-d118-x88-w098-s007 | 4/10 | 3.8/10 | challenge-1-arrival-group-1 (6/10) | no | pass |
| 6 | stage23-a158-d118-x88-w098-s009 | 4/10 | 3.8/10 | challenge-1-arrival-group-1 (6/10) | no | pass |
| 7 | stage23-a158-d134-x88-w098-s007 | 4/10 | 3.8/10 | challenge-1-arrival-group-1 (6/10) | no | pass |
| 8 | stage23-a158-d134-x88-w098-s009 | 4/10 | 3.8/10 | challenge-1-arrival-group-1 (6/10) | no | pass |
| 9 | stage23-a178-d118-x88-w098-s007 | 4/10 | 3.8/10 | challenge-1-arrival-group-1 (6/10) | no | pass |
| 10 | stage23-a178-d118-x88-w098-s009 | 4/10 | 3.8/10 | challenge-1-arrival-group-1 (6/10) | no | pass |
| 11 | stage23-a178-d134-x88-w098-s007 | 4/10 | 3.8/10 | challenge-1-arrival-group-1 (6/10) | no | pass |
| 12 | stage23-a178-d134-x88-w098-s009 | 4/10 | 3.8/10 | challenge-1-arrival-group-1 (6/10) | no | pass |

## Next Step

Broaden the candidate strategy to include path-shape constants or richer reference labels before changing runtime stage-23 gameplay.
