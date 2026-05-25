# Challenge Trajectory Controls

Generated: 2026-05-25T06:39:36.991Z
Commit: 9001395d8
Branch: codex/macbook-challenge-stage-conformance-cycle

## Purpose

This artifact turns Galaga challenge-stage object tracks into reusable runtime candidate controls. It is intentionally between ingestion and gameplay: the controls guide sweeps, but they do not change Aurora unless a later candidate clears strict identity, target-video, and safety gates.

## Summary

- Challenges covered: 8.
- Groups covered: 40.
- Average source-track confidence: 0.685.
- Control readiness: 8.6/10.
- Runtime-ready candidates in current sweep index: 0.

Reference video object tracks now produce explicit candidate controls for challenge-stage group timing, speed, arc/drop scale, lower-field travel, y-offset, path-family hints, and representative sampled paths. This should reduce blind CPU sweeps and make failed candidates easier to diagnose.

## Controls

| Challenge | Stage | Groups | Avg Confidence | Readiness | Current Sweep | Path Hints |
| ---: | ---: | ---: | ---: | ---: | --- | --- |
| 1 | 3 | 5 | 0.714 | 8.7/10 | no-runtime-keeper-yet | first-challenge-peel, classic-column-drop, first-challenge-peel, side-hook-return, side-hook-return |
| 2 | 7 | 5 | 0.67 | 8.5/10 | no-runtime-keeper-yet | cross-sweep, hook-arc, hook-arc, cross-sweep, hook-arc |
| 3 | 11 | 5 | 0.686 | 8.6/10 | no-runtime-keeper-yet | hook-arc, hook-arc, hook-arc, hook-arc, hook-arc |
| 4 | 15 | 5 | 0.691 | 8.6/10 | no-runtime-keeper-yet | pink-serpentine, pink-serpentine, pink-serpentine, pink-serpentine, pink-serpentine |
| 5 | 19 | 5 | 0.681 | 8.5/10 | no-runtime-keeper-yet | pink-green-low-sweep, pink-green-low-sweep, pink-green-cascade, pink-green-cascade, pink-green-cascade |
| 6 | 23 | 5 | 0.678 | 8.5/10 | no-runtime-keeper-yet | green-ladder-high-exit, green-ladder-deep-drop, green-ladder-deep-drop, green-ladder-deep-drop, green-ladder-high-exit |
| 7 | 27 | 5 | 0.651 | 8.4/10 | no-runtime-keeper-yet | yellow-fan-low-drift, yellow-fan-cross-cut, yellow-fan-cross-cut, yellow-fan-cross-cut, yellow-fan-cross-cut |
| 8 | 31 | 5 | 0.711 | 8.7/10 | no-runtime-keeper-yet | blue-purple-finale, blue-purple-finale, blue-purple-finale, blue-purple-finale, blue-purple-finale |
