# Stage 11 Challenge Candidate Sweep

Generated: 2026-05-16T20:48:19.355Z
Commit: 498e13b9
Branch: codex/macbook-audio-entry-grounding-cycle

## Purpose

Stage 11 currently has safe challenge behavior but still does not consistently read as the third Galaga challenge reference. This sweep is a harness-only candidate loop: it varies layout/path parameters, samples runtime challenge motion, compares each candidate against media-backed Galaga challenge labels, and refuses runtime promotion unless a measured keeper improves the expected stage-11 reference without safety regression.

## Summary

- Baseline expected-reference score: 7.4/10.
- Best candidate expected-reference score: 7.6/10.
- Best candidate: stage11-a208-d096-x86-p0.
- Keeper decision: no-runtime-keeper-yet.
- Player-facing meaning: This pass improved the search process more than the shipped game: no candidate earned enough measured lift to promote safely.
- Process meaning: Future challenge tuning can now compare many runtime candidates against Galaga labels before editing game constants.

## Top Candidates

| Rank | Candidate | Selection | Expected Challenge 3 | Best Match | Expected Hit | Safety |
| ---: | --- | ---: | ---: | --- | --- | --- |
| 1 | stage11-a208-d096-x86-p0 | 8.55/10 | 7.6/10 | challenge-3-arrival-group-1 (7.6/10) | yes | pass |
| 2 | stage11-a222-d096-x86-p0 | 8.55/10 | 7.6/10 | challenge-3-arrival-group-1 (7.6/10) | yes | pass |
| 3 | stage11-a222-d112-x64-p0 | 8.55/10 | 7.6/10 | challenge-3-arrival-group-1 (7.6/10) | yes | pass |
| 4 | stage11-a208-d102-x86-p0 | 8.45/10 | 7.5/10 | challenge-3-arrival-group-1 (7.5/10) | yes | pass |
| 5 | stage11-a208-d112-x86-p0 | 8.45/10 | 7.5/10 | challenge-3-arrival-group-1 (7.5/10) | yes | pass |
| 6 | stage11-a222-d102-x64-p0 | 8.45/10 | 7.5/10 | challenge-3-arrival-group-1 (7.5/10) | yes | pass |
| 7 | stage11-a222-d102-x72-p0 | 8.45/10 | 7.5/10 | challenge-3-arrival-group-1 (7.5/10) | yes | pass |
| 8 | stage11-a222-d102-x86-p0 | 8.45/10 | 7.5/10 | challenge-3-arrival-group-1 (7.5/10) | yes | pass |
| 9 | baseline-current | 8.35/10 | 7.4/10 | challenge-3-arrival-group-1 (7.4/10) | yes | pass |
| 10 | stage11-a208-d096-x72-p0 | 8.35/10 | 7.4/10 | challenge-3-arrival-group-1 (7.4/10) | yes | pass |
| 11 | stage11-a208-d102-x72-p0 | 8.35/10 | 7.4/10 | challenge-3-arrival-group-1 (7.4/10) | yes | pass |
| 12 | stage11-a222-d096-x72-p0 | 8.35/10 | 7.4/10 | challenge-3-arrival-group-1 (7.4/10) | yes | pass |

## Next Step

Broaden the candidate strategy to include path-shape constants or richer reference labels before changing runtime stage-11 gameplay.
