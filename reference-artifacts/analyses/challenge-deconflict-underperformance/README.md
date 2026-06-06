# Challenge Deconflict Underperformance

Generated: 2026-06-06T01:15:21.325Z
Commit: 67c8a70af
Branch: codex/aurora-challenge-movement-grammar

## Summary

The stronger direct deconflict family now beats the earlier readability/timing family on bunching, but it remains far from the promotion gate. Route-aware offsets reduce magic-appearance risk and are now a useful grammar seam, but they did not beat deconflict-only on bunching in this pass, so they should remain measured rather than promoted.

- Baseline bunching risk: 1
- Best readability bunching risk: 0.75
- Least-bunched diagnostic risk: 0.688
- Best deconflict risk: 0.688
- Best route-aware risk: 0.75
- Deconflict gap vs least-bunched: 0
- Route-aware gap vs least-bunched: 0.062

## Candidate Comparison

| Candidate | Expected | Target Fit | Human Perfect | Human Visible | Bunching Risk | Magic Risk | Spacing | Arrival | Gate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| baseline-current | 5.7 | 3.9 | 7.5 | 5.2 | 1 | 0.696 | 0.005 | 0.304 | blocked |
| stage7-target-starts-current-speed-p0 | 5.7 | 4.5 | 7.5 | 6.6 | 0.811 | 0.288 | 0.185 | 0.712 | blocked |
| stage7-read-balanced-balanced-outer-ls0-sd022-ripple | 5.4 | 4.1 | 7.5 | 7.6 | 0.75 | 0.072 | 0.368 | 0.928 | blocked |
| stage7-deconflict-strong-softbias-tiered-zipper | 5.6 | 4 | 7.4 | 7.5 | 0.688 | 0.072 | 0.347 | 0.928 | blocked |
| stage7-deconflict-wide-softbias-flat-sync | 5.7 | 4 | 7.3 | 7.5 | 0.688 | 0.072 | 0.347 | 0.928 | blocked |
| stage7-route-deconflict-spread-left-right-wide-soft-flat-fan-sd016 | 5.7 | 4 | 7.3 | 7.5 | 0.75 | 0.072 | 0.324 | 0.928 | blocked |

## Next Primitive

Move entire challenge groups as authored routes before applying per-lane/object separation. This should reduce inter-group overlap while preserving the feeling that aliens arrive in coherent Galaga-like waves.
