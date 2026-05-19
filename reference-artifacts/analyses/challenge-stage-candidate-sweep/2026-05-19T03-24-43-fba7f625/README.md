# Stage 27 Challenge Candidate Sweep

Generated: 2026-05-19T03:24:43.125Z
Commit: fba7f625
Branch: codex/macbook-conformance-investment-review

## Purpose

Stage 27 currently has safe challenge behavior but still does not consistently read as its expected Galaga challenge reference. This sweep is a harness-only candidate loop: it varies layout/path parameters, samples runtime challenge motion, compares each candidate against media-backed Galaga challenge labels, and refuses runtime promotion unless a measured keeper improves the expected stage reference without safety regression.

## Summary

- Baseline expected-reference score: 3.8/10.
- Best candidate expected-reference score: 4.6/10.
- Best candidate: stage27-a168-d142-x92-w094-s0065.
- Keeper decision: no-runtime-keeper-yet.
- Player-facing meaning: This pass improved the search process more than the shipped game: no candidate earned enough measured lift to promote safely.
- Process meaning: Future challenge tuning can now compare many runtime candidates against Galaga labels before editing game constants.

## Top Candidates

| Rank | Candidate | Selection | Expected Labels | Target-Video Fit | Best Match | Expected Hit | Safety |
| ---: | --- | ---: | ---: | ---: | --- | --- | --- |
| 1 | stage27-a168-d142-x92-w094-s0065 | 5.42/10 | 4.6/10 | 2.8/10 | challenge-1-arrival-group-1 (6/10) | no | pass |
| 2 | stage27-a168-d142-x92-w094-s0085 | 5.39/10 | 4.6/10 | 2.7/10 | challenge-1-arrival-group-1 (6/10) | no | pass |
| 3 | stage27-a168-d142-x76-w094-s0065 | 5.32/10 | 4.5/10 | 2.8/10 | challenge-1-arrival-group-1 (5.9/10) | no | pass |
| 4 | stage27-a168-d142-x76-w106-s0065 | 5.32/10 | 4.5/10 | 2.8/10 | challenge-1-arrival-group-1 (5.9/10) | no | pass |
| 5 | stage27-a168-d142-x84-w094-s0065 | 5.32/10 | 4.5/10 | 2.8/10 | challenge-1-arrival-group-1 (6/10) | no | pass |
| 6 | stage27-a168-d142-x76-w094-s0085 | 5.29/10 | 4.5/10 | 2.7/10 | challenge-1-arrival-group-1 (5.9/10) | no | pass |
| 7 | stage27-a168-d142-x84-w094-s0085 | 5.29/10 | 4.5/10 | 2.7/10 | challenge-1-arrival-group-1 (6/10) | no | pass |
| 8 | stage27-a168-d142-x84-w106-s0065 | 5.29/10 | 4.5/10 | 2.7/10 | challenge-1-arrival-group-1 (5.9/10) | no | pass |
| 9 | stage27-a168-d142-x84-w106-s0085 | 5.29/10 | 4.5/10 | 2.7/10 | challenge-1-arrival-group-1 (5.9/10) | no | pass |
| 10 | stage27-a168-d142-x92-w106-s0065 | 5.29/10 | 4.5/10 | 2.7/10 | challenge-1-arrival-group-1 (6/10) | no | pass |
| 11 | stage27-a168-d142-x92-w106-s0085 | 5.29/10 | 4.5/10 | 2.7/10 | challenge-1-arrival-group-1 (5.9/10) | no | pass |
| 12 | stage27-a168-d142-x76-w106-s0085 | 5.22/10 | 4.4/10 | 2.8/10 | challenge-1-arrival-group-1 (5.9/10) | no | pass |

## Next Step

Broaden the candidate strategy to include path-shape constants or richer reference labels before changing runtime stage-27 gameplay.
