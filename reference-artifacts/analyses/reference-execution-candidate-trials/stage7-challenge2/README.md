# Stage 7 Reference Execution Candidate Trial

Generated: 2026-06-08T13:56:36.830Z
Commit: 273b71984
Branch: codex/macbook-pro-1.4.1-stage7-object-track-keeper

Candidate: `stage7-baseline-control-0.1`

## Decision

Measurement keeper: accept-trial-mechanism

Runtime keeper: not-a-runtime-keeper

Ready for one runtime source candidate: false

This external trial is useful measurement, but it is not ready for runtime source promotion.

## Object-Track Read

Baseline total: 4.7/10, coverage 0.503

Trial total: 4.7/10, coverage 0.503

Delta: 0/10, coverage 0

| Group | Trial family | Canonical family | Aggregate score | Aggregate delta | Primary score | Path ratio | Lower-field delta | Notes |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | cross-sweep | cross-sweep | 3.5 | 0 | 3.7 | 4.32 | 0.018 | aggregate object-track score 3.5/10 is below first promotion floor<br>primary object-track score 3.7/10 is below first promotion floor<br>aggregate path-length ratio 4.32 exceeds first promotion floor |
| 2 | cross-sweep | hook-arc | 5.2 | 0 | 2.6 | 5.74 | 0.358 | path family cross-sweep does not match canonical hook-arc<br>primary object-track score 2.6/10 is below first promotion floor<br>aggregate path-length ratio 5.74 exceeds first promotion floor<br>lower-field overstay +0.358 exceeds aggregate gate |
| 3 | hook-arc | hook-arc | 5 | 0 | 4.6 | 3.9 | 0 | primary object-track score 4.6/10 is below first promotion floor<br>aggregate path-length ratio 3.9 exceeds first promotion floor<br>primary path-length ratio 3.31 exceeds first promotion floor |
| 4 | hook-arc | cross-sweep | 5 | 0 | 1.8 | 9.23 | -0.266 | path family hook-arc does not match canonical cross-sweep<br>primary object-track score 1.8/10 is below first promotion floor<br>aggregate path-length ratio 9.23 exceeds first promotion floor<br>primary path-length ratio 7.23 exceeds first promotion floor<br>lower-field undershoot -0.266 exceeds aggregate gate |
| 5 | boss-led-loop | hook-arc | 4.9 | 0 | 3 | 3.83 | -0.166 | path family boss-led-loop does not match canonical hook-arc<br>aggregate object-track score 4.9/10 is below first promotion floor<br>primary object-track score 3/10 is below first promotion floor<br>aggregate path-length ratio 3.83 exceeds first promotion floor |

## Guardrails

- Spacing/readability pass: true; spacing 0.765, bunching 0.292
- Scoreable routes pass: true; score 5.5, active windows 47
- Safety pass: true; no shots true, no attacks true, no losses true

## Blockers

- total object-track score lift 0/10 does not exceed 0.05/10
- group 1 does not improve over baseline 3.5/10
- group 2: path family cross-sweep does not match canonical hook-arc
- group 4: path family hook-arc does not match canonical cross-sweep
- group 5: path family boss-led-loop does not match canonical hook-arc
