# Challenge Stage Candidate Sweep Index

Generated: 2026-05-24T18:02:23.729Z
Commit: 47f2c7e1d
Branch: codex/macbook-challenge-stage-conformance-cycle

## Purpose

This index preserves the latest candidate-sweep result for each challenged Aurora stage. It prevents a single `latest.json` sweep from hiding earlier stage evidence, and it makes failed search work reusable for the next conformance cycle.

## Summary

- Stages covered: 8.
- Total candidates represented by latest per-stage rows: 13883.
- Runtime-ready candidates under current identity policy: 0.
- Legacy ready candidates needing resweep: 2.
- Strongest target-video lift: 0.7/10 on stage 3.
- Strongest expected-label lift: 1.8/10 on stage 31.

## Latest Per-Stage Rows

| Stage | Candidates | Decision | Current Ready | Legacy Resweep | Expected | Target Video | Identity Margin | Best Match | Next Step |
| ---: | ---: | --- | --- | --- | ---: | ---: | ---: | --- | --- |
| 3 | 892 | candidate-ready-for-full-analyzer-review | no | yes | 5.9/10 | 3.2/10 | n/a | challenge-1-arrival-group-1 | Apply the best candidate temporarily, rerun full challenge-stage conformance plus guardrails, and accept it only if the full analyzer confirms the expected lift. |
| 7 | 217 | keeper-ready-for-runtime-review | no | yes | 7.3/10 | 2.6/10 | n/a | challenge-2-arrival-group-1 | Promote the best candidate into the stage-7 layout, rebuild, and rerun challenge-stage conformance plus guardrails. |
| 11 | 181 | no-runtime-keeper-yet | no | no | 7.6/10 | n/a/10 | n/a | challenge-3-arrival-group-1 | Broaden the candidate strategy to include path-shape constants or richer reference labels before changing runtime stage-11 gameplay. |
| 15 | 5212 | no-runtime-keeper-yet | no | no | 6.3/10 | 3.3/10 | n/a | challenge-2-arrival-group-1 | Broaden the candidate strategy to include path-shape constants or richer reference labels before changing runtime stage-15 gameplay. |
| 19 | 3556 | no-runtime-keeper-yet | no | no | 5.2/10 | 3.9/10 | -0.3 | challenge-2-arrival-group-1 | Broaden the candidate strategy to include path-shape constants or richer reference labels before changing runtime stage-19 gameplay. |
| 23 | 118 | no-runtime-keeper-yet | no | no | 5.4/10 | 4.1/10 | -0.4 | challenge-1-arrival-group-1 | Broaden the candidate strategy to include path-shape constants or richer reference labels before changing runtime stage-23 gameplay. |
| 27 | 118 | no-runtime-keeper-yet | no | no | 4.9/10 | 3.1/10 | -0.9 | challenge-1-arrival-group-1 | Broaden the candidate strategy to include path-shape constants or richer reference labels before changing runtime stage-27 gameplay. |
| 31 | 3589 | no-runtime-keeper-yet | no | no | 6/10 | 2.9/10 | n/a | challenge-2-arrival-group-1 | Broaden the candidate strategy to include path-shape constants or richer reference labels before changing runtime stage-31 gameplay. |
