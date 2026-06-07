# Challenge Deconflict Underperformance

Generated: 2026-06-06T12:23:59.520Z
Commit: e43ff631a
Branch: codex/aurora-challenge-movement-grammar

## Summary

Route-aware group offsets now beat direct deconflict on bunching risk, but they remain far from the promotion gate and need density, target-fit, and human-perfect review before runtime promotion. Direct deconflict still improves baseline readability, but the rejected full-analyzer trial shows local deconfliction can create misleading wins.

- Baseline bunching risk: 1
- Best readability bunching risk: 0.75
- Least-bunched diagnostic risk: 0.667
- Best deconflict risk: 0.688
- Best route-aware risk: 0.667
- Deconflict gap vs least-bunched: 0.021
- Route-aware gap vs least-bunched: 0

## Candidate Comparison

| Candidate | Expected | Target Fit | Human Perfect | Human Visible | Bunching Risk | Magic Risk | Spacing | Arrival | Gate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| baseline-current | 5.7 | 3.9 | 7.5 | 5.2 | 1 | 0.696 | 0.005 | 0.304 | blocked |
| stage7-target-starts-current-speed-p0 | 5.7 | 4.5 | 7.5 | 6.6 | 0.811 | 0.288 | 0.185 | 0.712 | blocked |
| stage7-read-balanced-balanced-outer-ls0-sd022-ripple | 5.4 | 4.1 | 7.5 | 7.6 | 0.75 | 0.072 | 0.368 | 0.928 | blocked |
| stage7-route-spread-left-right-id-sd016 | 5.7 | 4 | 7.4 | 7.4 | 0.667 | 0.144 | 0.371 | 0.856 | blocked |
| stage7-deconflict-wide-softbias-flat-sync | 5.7 | 4 | 7.3 | 7.5 | 0.688 | 0.072 | 0.347 | 0.928 | blocked |
| stage7-route-spread-left-right-fan-sd016 | 5.7 | 4 | 7.3 | 7.4 | 0.667 | 0.144 | 0.371 | 0.856 | blocked |

## Next Primitive

Move entire challenge groups as authored routes before applying per-lane/object separation. This should reduce inter-group overlap while preserving the feeling that aliens arrive in coherent Galaga-like waves.
