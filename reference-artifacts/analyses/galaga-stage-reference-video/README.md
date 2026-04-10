# Galaga Stage Reference Video

This analysis folder catalogs a long-form original Galaga gameplay video that
we can reuse as a durable visual and motion reference for Aurora fidelity work.

## Source Artifact

- Original file:
  - `/Users/stevenwoods/Downloads/90 stage 1 player galaga example.mp4`
- Technical profile:
  - container: `MP4`
  - video codec: `h264`
  - audio codec: `aac`
  - resolution: `360 x 480`
  - frame rate: `30fps`
  - duration: `3031.85s` (`50m 31.85s`)

## What This Is Good For

Use this video as a visual and pacing reference for:

- classic starfield density, brightness, color mix, and downward motion
- stage opening intensity and overall board readability
- formation spacing and enemy motion cadence
- player movement feel relative to screen scale
- bullet brightness and sprite contrast against the background
- later-stage pressure and overall on-screen busyness

Use it carefully for:

- capture / rescue / dual-fighter rule details
- exact scoring interpretations
- edge-case mechanical behavior

Those should still be cross-checked against stronger primary sources when
possible.

## Extracted Frames

This folder includes a few checkpoint stills:

- `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-stage-reference-video/frames/galaga-reference-00m12s.png`
  - early scoring / title-state board
  - useful for:
    - starfield visibility against low board clutter
    - title/text color intensity
    - basic contrast ratios

- `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-stage-reference-video/frames/galaga-reference-05m00s.png`
  - live gameplay with sparse surviving enemies
  - useful for:
    - starfield visibility during active play
    - bullet brightness
    - ship readability against the moving field

- `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-stage-reference-video/frames/galaga-reference-10m00s.png`
  - fuller active board state
  - useful for:
    - mixed enemy motion readability
    - starfield intensity under heavier play pressure
    - on-screen sprite hierarchy

- `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-stage-reference-video/frames/galaga-reference-20m00s.png`
  - score/results style state
  - useful for:
    - starfield readability in non-combat presentation
    - text treatment against the live field

## Current Aurora Notes

As of the current Bundle A atmosphere work:

- Aurora classic gameplay starfield should track this reference more closely for:
  - visible but not noisy pixel stars
  - clear multi-color star mix
  - constant downward drift that is readable during active play
- Aurora aurora-themed stages intentionally diverge by layering aurora ribbons
  over the starfield, but the underlying starfield should still remain legible.

## How To Use This Reference

When using this video for a fidelity decision:

1. name the topic being compared
   - for example:
     - `classic starfield speed`
     - `bullet brightness`
     - `stage opening density`
2. cite this folder and, when possible, the nearest extracted frame
3. write whether the comparison is:
   - presentation reference
   - motion reference
   - or stronger gameplay-behavior evidence
4. tie the conclusion to:
   - a GitHub issue
   - a harness check
   - or a release/bundle note

## Recommendation

Keep this as a standing reference for Bundle A and later Aurora polish work,
especially when comparing:

- classic stars
- sprite intensity
- motion pacing
- stage readability
