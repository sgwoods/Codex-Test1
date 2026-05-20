# Galaga Alien Temporal Targets

Generated: 2026-05-19T23:43:43.499Z

This report promotes target pose sequences for Boss, Bee, and Butterfly runtime cadence scoring. It deliberately distinguishes trusted motion-reference crops from provisional source-sheet flaps so the metric can improve without pretending we have final frame-timed animation truth.

## Summary

- Temporal rows: 3
- Trusted crop links: 5
- Provisional crop links: 4
- Next best step: Confirm segmented-reference cadence against raw gameplay or ROM-derived timing, then extend the method to dive/rotation and challenge-only aliens.

## Temporal Rows

| Row | Status | Pose Sequence | Evidence | Next Gap |
| --- | --- | --- | --- | --- |
| Boss Galaga Pulse Pair<br><code>boss-line</code> | frame-timed-target-window<br>timing: frame-labeled-segmented-reference-window<br>confidence: medium-high | `formation-front` -> `flap-a` -> `flap-b` -> `flap-b` -> `flap-a` -> `formation-front` | Uses two cleaned boss identities visible in the segmented alien motion reference as a trusted color/pulse target pair. Frame-labeled cadence now comes from segmented-motion-reference-video: Frame-labeled window from the preserved segmented Galaga alien motion reference. It shows a repeated compact/extended Boss pulse at readable cadence, but it is not raw gameplay footage.<br><br>Frame-labeled cadence: 24 frames at 4 fps; cycle 1s; phases `compact`, `extended`.<br><br>`boss-galaga-formation-front` (accepted-trusted-motion-reference)<br>`boss-galaga-flap-a` (accepted-trusted-motion-reference)<br>`boss-galaga-flap-b` (accepted-trusted-motion-reference) | Confirm this segmented-reference cadence against raw gameplay or ROM-derived timing, then extend the same target method to dive/rotation and challenge-only aliens. |
| Bee / Zako Pulse Pair<br><code>bee-line</code> | frame-timed-target-window<br>timing: frame-labeled-segmented-reference-window<br>confidence: medium-high | `formation-front` -> `flap-a` -> `flap-b` -> `flap-b` -> `flap-a` -> `formation-front` | Formation identity is trusted from the segmented alien motion reference; flap pair still comes from provisional source-sheet cells. Frame-labeled cadence now comes from segmented-motion-reference-video: Frame-labeled window from the preserved segmented Galaga alien motion reference. It cleanly separates Bee wing-open and wing-compact phases for runtime cadence scoring.<br><br>Frame-labeled cadence: 24 frames at 4 fps; cycle 1s; phases `extended`, `compact`.<br><br>`bee-zako-formation-front` (accepted-trusted-motion-reference)<br>`bee-zako-flap-a` (provisional-source-sheet-cell)<br>`bee-zako-flap-b` (provisional-source-sheet-cell) | Confirm this segmented-reference cadence against raw gameplay or ROM-derived timing, then extend the same target method to dive/rotation and challenge-only aliens. |
| Butterfly / Escort Pulse Pair<br><code>but-line</code> | frame-timed-target-window<br>timing: frame-labeled-segmented-reference-window<br>confidence: medium-high | `formation-front` -> `flap-a` -> `flap-b` -> `flap-b` -> `flap-a` -> `formation-front` | Formation identity is trusted from the segmented alien motion reference; flap pair still comes from provisional source-sheet cells. Frame-labeled cadence now comes from segmented-motion-reference-video: Frame-labeled window from the preserved segmented Galaga alien motion reference. It cleanly separates Butterfly wing-compact and wing-open phases for runtime cadence scoring.<br><br>Frame-labeled cadence: 24 frames at 4 fps; cycle 1s; phases `compact`, `extended`.<br><br>`butterfly-escort-formation-front` (accepted-trusted-motion-reference)<br>`butterfly-escort-flap-a` (provisional-source-sheet-cell)<br>`butterfly-escort-flap-b` (provisional-source-sheet-cell) | Confirm this segmented-reference cadence against raw gameplay or ROM-derived timing, then extend the same target method to dive/rotation and challenge-only aliens. |

## Measurement Rule

The runtime-vs-target cadence scorer may consume frame-labeled cadence rows when present. These segmented-reference rows lift the old pose-only cap, but final arcade-perfect timing still needs raw gameplay or ROM-derived windows.
