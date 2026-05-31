# Aurora Sprite Motion Correspondence

Generated: 2026-05-31T01:28:54.032Z

This report joins Galaga temporal target rows to Aurora runtime sprite-motion captures. It is intentionally conservative: visible runtime animation gets credit, but scores are capped until the target side has frame-labeled cadence windows rather than only pose sequences.

## Summary

- Score: 6.2/10
- Phase-order score: 4.8/10
- Rows: 3
- Frame-timed target rows: 3
- Weakest row: bee-zako-pulse-pair (5.4/10)
- Next best step: Confirm segmented-reference cadence against raw gameplay or ROM-derived timing, then tune Aurora runtime cadence and challenge-stage alien motion against the accepted target rows.

## Rows

| Row | Score | Target Readiness | Runtime Motion | Cap | Next Gap |
| --- | ---: | --- | --- | --- | --- |
| Boss Galaga Pulse Pair<br><code>boss-line</code> | 7.5/10 | 8.8/10; trusted 3, provisional 0 | phase 6.8/10; cadence 7.4/10; phase-order 5.9/10; static 5/10; seeds 4/4 | 8.5/10<br>Frame-labeled target rows exist, so the correspondence score may move beyond pose-only planning evidence. | Confirm Boss Galaga Pulse Pair cadence against raw gameplay or ROM-derived timing, then tune Aurora runtime cadence toward that target. |
| Bee / Zako Pulse Pair<br><code>bee-line</code> | 5.4/10 | 8.8/10; trusted 1, provisional 2 | phase 1/10; cadence 3.3/10; phase-order 4.2/10; static 5.6/10; seeds 4/4 | 8.5/10<br>Frame-labeled segmented-reference cadence replaces provisional flap-cell timing for this row; final raw gameplay timing is still needed before high-confidence conformance claims. | Confirm Bee / Zako Pulse Pair cadence against raw gameplay or ROM-derived timing, then tune Aurora runtime cadence toward that target. |
| Butterfly / Escort Pulse Pair<br><code>but-line</code> | 5.6/10 | 8.8/10; trusted 1, provisional 2 | phase 1/10; cadence 3.3/10; phase-order 4.2/10; static 7.6/10; seeds 4/4 | 8.5/10<br>Frame-labeled segmented-reference cadence replaces provisional flap-cell timing for this row; final raw gameplay timing is still needed before high-confidence conformance claims. | Confirm Butterfly / Escort Pulse Pair cadence against raw gameplay or ROM-derived timing, then tune Aurora runtime cadence toward that target. |

## Measurement Limits

- This score joins target pose rows to runtime motion samples; it is not a final arcade-perfect animation score.
- Rows remain capped when Galaga target evidence is pose-sequence only and lacks frame timing with frame-labeled windows.
- Frame-labeled segmented-reference rows are stronger than provisional source-sheet cells, but still lower-confidence than raw gameplay or ROM-derived frame windows.
- Phase-order scoring compares compact/extended runtime cadence labels against target phase labels, allowing inversion when the runtime metric polarity is reversed.
- Bee and Butterfly rows should no longer be capped solely by provisional flap cells once segmented-reference cadence is present.
- This artifact should influence challenge-stage graphical scoring as a measured signal, but gameplay challenge conformance still depends on path choreography, group timing, alien novelty, and shot opportunity.
