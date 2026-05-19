# Aurora Sprite Motion Correspondence

Generated: 2026-05-19T21:50:21.379Z

This report joins Galaga temporal target rows to Aurora runtime sprite-motion captures. It is intentionally conservative: visible runtime animation gets credit, but scores are capped until the target side has frame-labeled cadence windows rather than only pose sequences.

## Summary

- Score: 6/10
- Rows: 3
- Frame-timed target rows: 0
- Weakest row: bee-zako-pulse-pair (5.8/10)
- Next best step: Promote true frame-labeled Boss, Bee, and Butterfly target cadence windows, then compare Aurora runtime cadence frames directly against those target windows.

## Rows

| Row | Score | Target Readiness | Runtime Motion | Cap | Next Gap |
| --- | ---: | --- | --- | --- | --- |
| Boss Galaga Pulse Pair<br><code>boss-line</code> | 6.5/10 | 6.5/10; trusted 3, provisional 0 | phase 6.8/10; cadence 7.4/10; static 6.5/10; seeds 4/4 | 6.5/10<br>Capped because the Galaga target rows are pose sequences without final frame-timed cadence windows. | Promote a true frame-labeled target cadence window so runtime cadence can be compared to target timing, not only visible runtime change. |
| Bee / Zako Pulse Pair<br><code>bee-line</code> | 5.8/10 | 5.4/10; trusted 1, provisional 2 | phase 6.3/10; cadence 7.1/10; static 6.3/10; seeds 4/4 | 5.8/10<br>Capped because this row still uses provisional target flap crops; it can guide work but cannot claim mature animation conformance. | Promote frame-clean Bee / Zako Pulse Pair target flaps from source gameplay/video before raising this above planning confidence. |
| Butterfly / Escort Pulse Pair<br><code>but-line</code> | 5.8/10 | 5.4/10; trusted 1, provisional 2 | phase 9.4/10; cadence 9.3/10; static 6.6/10; seeds 4/4 | 5.8/10<br>Capped because this row still uses provisional target flap crops; it can guide work but cannot claim mature animation conformance. | Promote frame-clean Butterfly / Escort Pulse Pair target flaps from source gameplay/video before raising this above planning confidence. |

## Measurement Limits

- This score joins target pose rows to runtime motion samples; it is not a final arcade-perfect animation score.
- Rows are capped while Galaga target evidence is pose-sequence only and lacks exact frame timing.
- Bee and Butterfly rows remain especially capped while flap targets use provisional source-sheet cells.
- This artifact should influence challenge-stage graphical scoring as a measured signal, but gameplay challenge conformance still depends on path choreography, group timing, alien novelty, and shot opportunity.
