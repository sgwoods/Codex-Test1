# Early Attacks Galaxip X Trace

Source window: `arcades-lounge-level-5/early-attacks`

Status: `first-pass-frame-trace`

This trace samples the ARCADE'S LOUNGE Level 5 source from `8.000s` to
`20.000s` at the source cadence of `25 fps`.

## Method

- Tool:
  - `tools/harness/trace-classic-arcade-video.js`
- Command:
  - `npm run harness:trace:classic-arcade -- --source "/Users/sgwoods/Downloads/GALAXIAN (1979) - LEVEL 5 passed ! Video game - ARCADE'S LOUNGE (1080p, h264).mp4" --out reference-artifacts/analyses/galaxian-reference/arcades-lounge-level-5/traces/early-attacks-galaxip-x --window-id arcades-lounge-level-5/early-attacks --start 8 --duration 12 --fps 25 --width 270 --height 480`
- Analysis resolution:
  - `270x480`
- Detection approach:
  - raw RGB frames from `ffmpeg`
  - color/component heuristic for the active Galaxip's cyan body
  - lower-playfield pressure counts from bright color components

## Summary

- sample count: `300`
- player detections: `300`
- player detection rate: `1.000`
- normalized Galaxip x min: `0.2246`
- normalized Galaxip x max: `0.6556`
- normalized Galaxip x range: `0.4310`
- mean absolute normalized x delta per frame: `0.0083`
- max colored component count: `68`
- max lower-pressure component count: `20`
- max projectile-like count: `14`
- max attacker-like count: `55`

## Files

- `trace.json`
  - full frame-level sample trace and summary
- `trace.csv`
  - compact frame-level table for spreadsheet/review use
- `player-x.svg`
  - simple chart of normalized Galaxip x over time, with lower-pressure bars

## Confidence

This is a first-pass automated trace. It is useful for prioritizing tuning and
review windows, but it should be spot-checked before becoming implementation
authority.

Known limitations:

- the detector uses color/component heuristics, not semantic object tracking
- lower-pressure counts include colored formation and projectile components
- attacker/projectile categories are approximate
- source video is a user-provided local media reference and is not committed
