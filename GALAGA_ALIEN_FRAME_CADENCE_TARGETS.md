# Galaga Alien Frame Cadence Targets

Generated: 2026-05-19T22:27:40.099Z

This report promotes frame-labeled cadence windows for Boss, Bee, and Butterfly from the preserved segmented Galaga alien motion reference. These are stronger than pose-only rows because every frame has a timecode and phase label, but they remain segmented-reference evidence rather than raw gameplay truth.

## Summary

- Rows: 3
- Accepted rows: 3
- Total labeled frames: 72
- Timing status: frame-labeled-segmented-reference-windows
- Source video: `reference-artifacts/ingestion/galaga-alien-motion-reference/source-video/galaga-alien-pulse-reference.mp4`

## Cadence Rows

| Row | Timing | Preview Frames | Read | Next Gap |
| --- | --- | --- | --- | --- |
| Boss Galaga Pulse Cadence<br><code>boss-line</code> | 24 frames at 4 fps<br>cycle 1s<br><code>compact</code> <code>extended</code> | ![](reference-artifacts/analyses/galaga-alien-frame-cadence-targets/latest-frames/boss-line-00-compact.png)<br><code>2s compact</code><br>![](reference-artifacts/analyses/galaga-alien-frame-cadence-targets/latest-frames/boss-line-12-compact.png)<br><code>5s compact</code><br>![](reference-artifacts/analyses/galaga-alien-frame-cadence-targets/latest-frames/boss-line-23-extended.png)<br><code>7.75s extended</code> | Frame-labeled window from the preserved segmented Galaga alien motion reference. It shows a repeated compact/extended Boss pulse at readable cadence, but it is not raw gameplay footage.<br>avg delta 126.348; max delta 248 | Replace or confirm this segmented-reference cadence with raw gameplay or ROM-derived timing evidence before claiming final animation conformance. |
| Bee / Zako Pulse Cadence<br><code>bee-line</code> | 24 frames at 4 fps<br>cycle 1s<br><code>extended</code> <code>compact</code> | ![](reference-artifacts/analyses/galaga-alien-frame-cadence-targets/latest-frames/bee-line-00-extended.png)<br><code>2s extended</code><br>![](reference-artifacts/analyses/galaga-alien-frame-cadence-targets/latest-frames/bee-line-12-extended.png)<br><code>5s extended</code><br>![](reference-artifacts/analyses/galaga-alien-frame-cadence-targets/latest-frames/bee-line-23-extended.png)<br><code>7.75s extended</code> | Frame-labeled window from the preserved segmented Galaga alien motion reference. It cleanly separates Bee wing-open and wing-compact phases for runtime cadence scoring.<br>avg delta 87.261; max delta 182 | Replace or confirm this segmented-reference cadence with raw gameplay or ROM-derived timing evidence before claiming final animation conformance. |
| Butterfly / Escort Pulse Cadence<br><code>but-line</code> | 24 frames at 4 fps<br>cycle 1s<br><code>compact</code> <code>extended</code> | ![](reference-artifacts/analyses/galaga-alien-frame-cadence-targets/latest-frames/but-line-00-compact.png)<br><code>2s compact</code><br>![](reference-artifacts/analyses/galaga-alien-frame-cadence-targets/latest-frames/but-line-12-compact.png)<br><code>5s compact</code><br>![](reference-artifacts/analyses/galaga-alien-frame-cadence-targets/latest-frames/but-line-23-compact.png)<br><code>7.75s compact</code> | Frame-labeled window from the preserved segmented Galaga alien motion reference. It cleanly separates Butterfly wing-compact and wing-open phases for runtime cadence scoring.<br>avg delta 151; max delta 293 | Replace or confirm this segmented-reference cadence with raw gameplay or ROM-derived timing evidence before claiming final animation conformance. |

## Measurement Limits

- The reference windows are frame-labeled and repeatable, but they come from a segmented educational/reference clip rather than direct arcade gameplay.
- They are appropriate for lifting pose-only provisional caps and for measuring whether Aurora has visible pulse/cadence correspondence.
- Future raw gameplay windows should replace or validate these cadence rows before final high-confidence conformance claims.
