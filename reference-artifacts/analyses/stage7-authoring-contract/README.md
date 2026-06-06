# Stage 7 Challenge Authoring Contract

Generated: 2026-06-06T12:23:59.530Z
Commit: e43ff631a
Branch: codex/aurora-challenge-movement-grammar

## Purpose

Stage 7 is Aurora's internal marker for **Challenging Stage 2**. This contract turns the current no-keeper evidence into an authored target: aliens should arrive in coherent groups, stay readable as scoring targets, and avoid magic appearance or screen-space clumping.

## Current Read

The stronger direct deconflict family now beats the earlier readability/timing family on bunching, but it remains far from the promotion gate. Route-aware offsets reduce magic-appearance risk and are now a useful grammar seam, but they did not beat deconflict-only on bunching in this pass, so they should remain measured rather than promoted.

## Target Group Evidence

| Group | Tracks | Visible Window | Entry | Exit | X Range | Y Range | Path Length | Lower Field Share |
| ---: | ---: | --- | --- | --- | ---: | ---: | ---: | ---: |
| 1 | 16 | 0-1.88s | center | left | 0.617 | 0.177 | 0.118 | 0.982 |
| 2 | 9 | 2.88-6.38s | center | center | 0.186 | 0.677 | 0.169 | 0.312 |
| 3 | 2 | 4.25-5s | center | center | 0.053 | 0.085 | 0.154 | 1 |
| 4 | 25 | 7.13-10.38s | left | center | 0.886 | 0.68 | 0.147 | 0.516 |
| 5 | 9 | 13.38-15.88s | center | center | 0.145 | 0.68 | 0.242 | 0.436 |

## Promotion Gates

- Safety remains pass: no challenge enemy shots, enemy attacks, or ship loss.
- Human-perfect potential must not regress from baseline and should remain >= 7.4/10.
- Human-visible score should improve materially and remain >= 7.8/10 before promotion.
- Bunching risk should move toward <= 0.36; interim candidates below 0.65 are worth full-analyzer review.
- Magic-appearance risk should stay <= 0.18, preserving visible group lead-ins.
- Expected challenge identity must not regress; target-video fit must clear the latest rejected full-analyzer calibration.

## Next Work

- Use route-aware group offsets to separate whole groups before adding object-level offsets.
- Prefer contract-shaped candidates over broad blind sweeps.
- Generate path visuals for baseline, best readability, best route-aware, and best deconflict candidates.
- Promote only after full analyzer confirms the expected-label and target-video lift.
- Generalize only the proven primitive to Challenging Stage 1 and Challenging Stage 3.
