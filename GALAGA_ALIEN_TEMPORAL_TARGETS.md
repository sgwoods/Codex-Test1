# Galaga Alien Temporal Targets

Generated: 2026-05-19T18:24:11.103Z

This report promotes target pose sequences for Boss, Bee, and Butterfly runtime cadence scoring. It deliberately distinguishes trusted motion-reference crops from provisional source-sheet flaps so the metric can improve without pretending we have final frame-timed animation truth.

## Summary

- Temporal rows: 3
- Trusted crop links: 5
- Provisional crop links: 4
- Next best step: Promote true frame-timed Bee and Butterfly flap windows, then replace provisional source-sheet flap cells in this temporal target artifact.

## Temporal Rows

| Row | Status | Pose Sequence | Evidence | Next Gap |
| --- | --- | --- | --- | --- |
| Boss Galaga Pulse Pair<br><code>boss-line</code> | trusted-color-pulse-pair-not-frame-timed<br>confidence: medium-high | `formation-front` -> `flap-a` -> `flap-b` -> `flap-b` -> `flap-a` -> `formation-front` | Uses two cleaned boss identities visible in the segmented alien motion reference as a trusted color/pulse target pair.<br><br>`boss-galaga-formation-front` (accepted-trusted-motion-reference)<br>`boss-galaga-flap-a` (accepted-trusted-motion-reference)<br>`boss-galaga-flap-b` (accepted-trusted-motion-reference) | Extract a true frame-labeled boss animation window from gameplay or ROM-derived frame evidence. |
| Bee / Zako Pulse Pair<br><code>bee-line</code> | mixed-trusted-formation-plus-provisional-flap-pair<br>confidence: medium-low | `formation-front` -> `flap-a` -> `flap-b` -> `flap-b` -> `flap-a` -> `formation-front` | Formation identity is trusted from the segmented alien motion reference; flap pair still comes from provisional source-sheet cells.<br><br>`bee-zako-formation-front` (accepted-trusted-motion-reference)<br>`bee-zako-flap-a` (provisional-source-sheet-cell)<br>`bee-zako-flap-b` (provisional-source-sheet-cell) | Promote clean Bee flap frames from a true animated target window. |
| Butterfly / Escort Pulse Pair<br><code>but-line</code> | mixed-trusted-formation-plus-provisional-flap-pair<br>confidence: medium-low | `formation-front` -> `flap-a` -> `flap-b` -> `flap-b` -> `flap-a` -> `formation-front` | Formation identity is trusted from the segmented alien motion reference; flap pair still comes from provisional source-sheet cells.<br><br>`butterfly-escort-formation-front` (accepted-trusted-motion-reference)<br>`butterfly-escort-flap-a` (provisional-source-sheet-cell)<br>`butterfly-escort-flap-b` (provisional-source-sheet-cell) | Promote clean Butterfly flap frames from a true animated target window. |

## Measurement Rule

The runtime-vs-target cadence scorer may consume these pose sequences, but rows with provisional flap cells should remain medium-low confidence until true animated target windows are promoted.
