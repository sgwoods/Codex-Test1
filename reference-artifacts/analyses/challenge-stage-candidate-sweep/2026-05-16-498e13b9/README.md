# Stage 11 Challenge Candidate Sweep

Generated: 2026-05-16T20:46:21.217Z
Commit: 498e13b9
Branch: codex/macbook-audio-entry-grounding-cycle

## Purpose

Stage 11 currently has safe challenge behavior but still does not consistently read as the third Galaga challenge reference. This sweep is a harness-only candidate loop: it varies layout/path parameters, samples runtime challenge motion, compares each candidate against media-backed Galaga challenge labels, and refuses runtime promotion unless a measured keeper improves the expected stage-11 reference without safety regression.

## Summary

- Baseline expected-reference score: 6.9/10.
- Best candidate expected-reference score: 7.5/10.
- Best candidate: stage11-a208-d102-x72-p4.
- Keeper decision: keeper-ready-for-runtime-review.
- Player-facing meaning: A measured stage-11 layout candidate now better matches the third Galaga challenge reference while keeping challenge stages safe.
- Process meaning: Future challenge tuning can now compare many runtime candidates against Galaga labels before editing game constants.

## Top Candidates

| Rank | Candidate | Selection | Expected Challenge 3 | Best Match | Expected Hit | Safety |
| ---: | --- | ---: | ---: | --- | --- | --- |
| 1 | stage11-a208-d102-x72-p4 | 8.45/10 | 7.5/10 | challenge-3-arrival-group-1 (7.5/10) | yes | pass |
| 2 | stage11-a208-d122-x86-p4 | 8.45/10 | 7.5/10 | challenge-3-arrival-group-1 (7.5/10) | yes | pass |
| 3 | stage11-a188-d112-x72-p4 | 8.35/10 | 7.4/10 | challenge-3-arrival-group-1 (7.4/10) | yes | pass |
| 4 | stage11-a208-d102-x86-p4 | 8.35/10 | 7.4/10 | challenge-3-arrival-group-1 (7.4/10) | yes | pass |
| 5 | stage11-a208-d112-x72-p4 | 8.35/10 | 7.4/10 | challenge-3-arrival-group-1 (7.4/10) | yes | pass |
| 6 | stage11-a208-d112-x86-p4 | 8.35/10 | 7.4/10 | challenge-3-arrival-group-1 (7.4/10) | yes | pass |
| 7 | stage11-a208-d122-x58-p4 | 8.35/10 | 7.4/10 | challenge-3-arrival-group-1 (7.4/10) | yes | pass |
| 8 | stage11-a188-d102-x86-p4 | 8.25/10 | 7.3/10 | challenge-3-arrival-group-1 (7.3/10) | yes | pass |
| 9 | stage11-a188-d112-x58-p4 | 8.25/10 | 7.3/10 | challenge-3-arrival-group-1 (7.3/10) | yes | pass |
| 10 | stage11-a208-d122-x72-p4 | 8.25/10 | 7.3/10 | challenge-3-arrival-group-1 (7.3/10) | yes | pass |
| 11 | stage11-a168-d112-x58-p4 | 8.15/10 | 7.2/10 | challenge-3-arrival-group-1 (7.2/10) | yes | pass |
| 12 | stage11-a168-d122-x86-p4 | 8.15/10 | 7.2/10 | challenge-3-arrival-group-1 (7.2/10) | yes | pass |

## Next Step

Promote the best candidate into the stage-11 layout, rebuild, and rerun challenge-stage conformance plus guardrails.
