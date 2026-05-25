# Challenge Stage Candidate Sweep Index

Generated: 2026-05-25T06:56:08.979Z
Commit: 9001395d8
Branch: codex/macbook-challenge-stage-conformance-cycle

## Purpose

This index preserves the latest candidate-sweep result for each challenged Aurora stage. It prevents a single `latest.json` sweep from hiding earlier stage evidence, and it makes failed search work reusable for the next conformance cycle.

## Summary

- Stages covered: 8.
- Total candidates represented by latest per-stage rows: 15428.
- Runtime-ready candidates under current identity policy: 1.
- Legacy ready candidates needing resweep: 0.
- Strongest target-video lift: 0.7/10 on stage 7.
- Strongest expected-label lift: 1.8/10 on stage 31.

## Latest Per-Stage Rows

| Stage | Candidates | Decision | Current Ready | Legacy Resweep | Expected | Target Video | Identity Margin | Best Match | Next Step |
| ---: | ---: | --- | --- | --- | ---: | ---: | ---: | --- | --- |
| 3 | 892 | no-runtime-keeper-yet | no | no | 6.2/10 | 2.9/10 | 0 | challenge-1-arrival-group-1 | Broaden the candidate strategy to include path-shape constants or richer reference labels before changing runtime stage-3 gameplay. |
| 7 | 928 | candidate-ready-for-full-analyzer-review | yes | no | 5.9/10 | 3.9/10 | 0 | challenge-2-arrival-group-1 | Apply the best candidate temporarily, rerun full challenge-stage conformance plus guardrails, and accept it only if the full analyzer confirms the expected lift. |
| 11 | 181 | no-runtime-keeper-yet | no | no | 7.6/10 | n/a/10 | n/a | challenge-3-arrival-group-1 | Broaden the candidate strategy to include path-shape constants or richer reference labels before changing runtime stage-11 gameplay. |
| 15 | 5240 | no-runtime-keeper-yet | no | no | 5.9/10 | 3.8/10 | 0 | challenge-2-arrival-group-1 | Use target-trajectory controls and richer reference labels before changing runtime stage-15 gameplay. |
| 19 | 3610 | no-runtime-keeper-yet | no | no | 5.2/10 | 3.5/10 | 0 | challenge-3-arrival-group-1 | Use target-trajectory controls and richer reference labels before changing runtime stage-19 gameplay. |
| 23 | 484 | no-runtime-keeper-yet | no | no | 5.4/10 | 4.1/10 | -0.4 | challenge-1-arrival-group-1 | Use target-trajectory controls and richer reference labels before changing runtime stage-23 gameplay. |
| 27 | 504 | no-runtime-keeper-yet | no | no | 5.1/10 | 3/10 | -0.2 | challenge-1-arrival-group-1 | Use target-trajectory controls and richer reference labels before changing runtime stage-27 gameplay. |
| 31 | 3589 | no-runtime-keeper-yet | no | no | 6/10 | 2.9/10 | n/a | challenge-2-arrival-group-1 | Broaden the candidate strategy to include path-shape constants or richer reference labels before changing runtime stage-31 gameplay. |
