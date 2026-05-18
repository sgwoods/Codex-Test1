# Stage 27 Challenge Candidate Sweep

Generated: 2026-05-18T11:35:52.244Z
Commit: 6d76050d
Branch: main

## Purpose

Stage 27 currently has safe challenge behavior but still does not consistently read as its expected Galaga challenge reference. This sweep is a harness-only candidate loop: it varies layout/path parameters, samples runtime challenge motion, compares each candidate against media-backed Galaga challenge labels, and refuses runtime promotion unless a measured keeper improves the expected stage reference without safety regression.

## Summary

- Baseline expected-reference score: 2.6/10.
- Best candidate expected-reference score: 3.4/10.
- Best candidate: stage27-a168-d142-x84-w094-s0085.
- Keeper decision: no-runtime-keeper-yet.
- Player-facing meaning: This pass improved the search process more than the shipped game: no candidate earned enough measured lift to promote safely.
- Process meaning: Future challenge tuning can now compare many runtime candidates against Galaga labels before editing game constants.

## Top Candidates

| Rank | Candidate | Selection | Expected Labels | Best Match | Expected Hit | Safety |
| ---: | --- | ---: | ---: | --- | --- | --- |
| 1 | stage27-a168-d142-x84-w094-s0085 | 3.6/10 | 3.4/10 | challenge-1-arrival-group-1 (5.9/10) | no | pass |
| 2 | stage27-a168-d142-x84-w106-s0065 | 3.6/10 | 3.4/10 | challenge-1-arrival-group-1 (5.9/10) | no | pass |
| 3 | stage27-a168-d142-x92-w094-s0065 | 3.6/10 | 3.4/10 | challenge-1-arrival-group-1 (5.8/10) | no | pass |
| 4 | stage27-a168-d142-x92-w094-s0085 | 3.6/10 | 3.4/10 | challenge-1-arrival-group-1 (5.9/10) | no | pass |
| 5 | stage27-a168-d142-x92-w106-s0065 | 3.6/10 | 3.4/10 | challenge-1-arrival-group-1 (5.9/10) | no | pass |
| 6 | stage27-a168-d142-x92-w106-s0085 | 3.6/10 | 3.4/10 | challenge-1-arrival-group-1 (5.9/10) | no | pass |
| 7 | stage27-a168-d142-x76-w094-s0065 | 3.5/10 | 3.3/10 | challenge-1-arrival-group-1 (5.8/10) | no | pass |
| 8 | stage27-a168-d142-x76-w094-s0085 | 3.5/10 | 3.3/10 | challenge-1-arrival-group-1 (5.8/10) | no | pass |
| 9 | stage27-a168-d142-x76-w106-s0065 | 3.5/10 | 3.3/10 | challenge-1-arrival-group-1 (5.8/10) | no | pass |
| 10 | stage27-a168-d142-x76-w106-s0085 | 3.5/10 | 3.3/10 | challenge-1-arrival-group-1 (5.8/10) | no | pass |
| 11 | stage27-a168-d142-x84-w094-s0065 | 3.5/10 | 3.3/10 | challenge-1-arrival-group-1 (5.8/10) | no | pass |
| 12 | stage27-a168-d142-x84-w106-s0085 | 3.5/10 | 3.3/10 | challenge-1-arrival-group-1 (5.9/10) | no | pass |

## Next Step

Broaden the candidate strategy to include path-shape constants or richer reference labels before changing runtime stage-27 gameplay.
