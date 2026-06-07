# Challenge Stage Candidate Sweep Index

Generated: 2026-06-05T13:27:09.610Z
Commit: 738781c90
Branch: codex/aurora-challenge-movement-grammar

## Purpose

This index preserves the latest candidate-sweep result for each challenged Aurora stage. It prevents a single `latest.json` sweep from hiding earlier stage evidence, and it makes failed search work reusable for the next conformance cycle.

## Summary

- Stages covered: 8.
- Total candidates represented by latest per-stage rows: 15581.
- Runtime-ready candidates under current identity policy: 0.
- Legacy ready candidates needing resweep: 0.
- Rows with human-perfect scoring: 5.
- Strongest target-video lift: 1.5/10 on stage 3.
- Strongest expected-label lift: 1.8/10 on stage 31.
- Strongest human-perfect lift: 1.7/10 on stage 19.
- Strongest human-visible lift: 0.1/10 on stage 11.

## Latest Per-Stage Rows

| Stage | Candidates | Decision | Current Ready | Legacy Resweep | Expected | Target Video | Human-Perfect | Human Lift | Human-Visible | Identity Margin | Best Match | Late Identity | Next Step |
| ---: | ---: | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| 3 | 928 | no-runtime-keeper-yet | no | no | 5.6/10 | 4.6/10 | 7.7/10 | 0.3 | 6.3/10 (-0.2; blocked) | 0 | challenge-1-arrival-group-1 | pass | Use target-trajectory controls and richer reference labels before changing runtime stage-3 gameplay. |
| 7 | 928 | no-runtime-keeper-yet | no | no | 5.6/10 | 4.8/10 | 7.5/10 | 0.2 | 7.4/10 (-0.2; blocked) | 0 | challenge-2-arrival-group-1 | pass | Do not promote stage7-a128-d09-x62-w128-s009-lb0-p0; strengthen the full-stage scorer or author a richer Stage 7 contract before another runtime trial. |
| 11 | 280 | no-runtime-keeper-yet | no | no | 5.1/10 | 4.6/10 | 7.6/10 | 0 | 7/10 (0.1; blocked) | 0 | challenge-3-arrival-group-1 | pass | Use target-trajectory controls and richer reference labels before changing runtime stage-11 gameplay. |
| 15 | 5248 | no-runtime-keeper-yet | no | no | 5.9/10 | 3.8/10 | 6/10 | 0.4 | 6.4/10 (-0.4; blocked) | 0 | challenge-2-arrival-group-1 | pass | Use target-trajectory controls and richer reference labels before changing runtime stage-15 gameplay. |
| 19 | 3610 | no-runtime-keeper-yet | no | no | 4.5/10 | 4/10 | 7.8/10 | 1.7 | 6.5/10 (-0.3; blocked) | 0 | challenge-5-pink-green-cascade-group-3 | pass | Use target-trajectory controls and richer reference labels before changing runtime stage-19 gameplay. |
| 23 | 484 | no-runtime-keeper-yet | no | no | 5.4/10 | 4.1/10 | n/a/10 | n/a | n/a | -0.4 | challenge-1-arrival-group-1 | n/a | Use target-trajectory controls and richer reference labels before changing runtime stage-23 gameplay. |
| 27 | 514 | no-runtime-keeper-yet | no | no | 5.1/10 | 3/10 | n/a/10 | n/a | n/a | -0.2 | challenge-1-arrival-group-1 | blocked (1 vs 7; penalty 2.31) | Use target-trajectory controls and richer reference labels before changing runtime stage-27 gameplay. |
| 31 | 3589 | no-runtime-keeper-yet | no | no | 6/10 | 2.9/10 | n/a/10 | n/a | n/a | n/a | challenge-2-arrival-group-1 | n/a | Broaden the candidate strategy to include path-shape constants or richer reference labels before changing runtime stage-31 gameplay. |
