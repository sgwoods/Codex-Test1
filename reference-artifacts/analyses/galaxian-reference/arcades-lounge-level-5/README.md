# ARCADE'S LOUNGE Galaxian Level 5

Window id: `arcades-lounge-level-5`

Status: `events-observed`

This folder catalogs a locally provided later-progression `Galaxian` reference
video for the future `Galaxy Guardians` scout-wave and progression-ingestion
program.

## Source

- Local file:
  - `/Users/sgwoods/Downloads/GALAXIAN (1979) - LEVEL 5 passed ! Video game - ARCADE'S LOUNGE (1080p, h264).mp4`
- Catalog date:
  - `2026-04-26`
- File size observed locally:
  - `4,701,332 bytes`
- Container / codec notes:
  - MP4 / ISO Base Media
  - H.264 video (`avc1`), `1080x1920`, `25 fps`, progressive, bt709
  - AAC audio (`mp4a`), stereo, `44.1 kHz`
  - source duration: `58.322086 seconds`
  - audio level probe: mean `-19.3 dB`, max `-4.8 dB`
- Filename notes:
  - title indicates `GALAXIAN (1979)`
  - source label indicates `ARCADE'S LOUNGE`
  - filename indicates `LEVEL 5 passed`
  - filename indicates `1080p, h264`

## Repository Storage Decision

The video itself is not committed in this pass.

Reason:

- it is a local source media file
- provenance and usage rights still need review
- the current artifact policy prefers committed README/manifest anchors before
  committing source video blobs

## Analysis Purpose

This source is valuable because it appears to show later progression rather than
only the beginning phase.

Use it to answer:

- how Level 5 pressure differs from opening-wave pressure
- how many attackers are visible during dense moments
- whether flagship / escort behavior is visible under progression
- whether player movement becomes more continuous or reactive
- what later-pressure hooks the first `Galaxy Guardians` scout-wave slice should
  leave room for

## First-Pass Observations

The contact sheets confirm this source includes active play:

- settled rack at clip start
- visible player Galaxip and reserve ships
- repeated alien dives
- enemy projectiles and player shots
- explosions and score changes
- later-wave thinning and cleanup pressure
- usable audio levels for future waveform/audio review

This is currently the strongest active-gameplay Galaxian source in the local
library. It complements the Matt Hawkins source, which is stronger for
presentation, score table, and attract/rack semantics.

## Subwindow Decision

The first useful split is:

- `opening-rack-pressure`: `0.000s` to `8.000s`
  - settled active rack and early pressure
- `early-attacks`: `8.000s` to `20.000s`
  - multi-attacker pressure, player movement, shots, and explosions
- `mid-pressure`: `20.000s` to `40.000s`
  - thinned formation and dense active pressure
- `late-cleanup`: `40.000s` to `58.240s`
  - depleted rack and late-wave cleanup behavior

## Remaining Required Artifacts

Before this source becomes implementation evidence, add:

- manual spot-check of the first Galaxip x-position trace
- frame-exact still sequences for `mid-pressure`
- projectile / attacker-count pass for dense moments
- clipped media or reproducible capture instructions only if rights are cleared

## Current Files

- `source-metadata.json`
  - exact `ffprobe` stream and format metadata
- `frames/contact-sheet-1fps-0-58s.png`
  - 1 fps visual review sheet
- `frames/contact-sheet-5s-0-58s.png`
  - coarse 5 second overview sheet
- `frames/still-000s.png`
- `frames/still-005s.png`
- `frames/still-010s.png`
- `frames/still-020s.png`
- `frames/still-030s.png`
- `frames/still-040s.png`
- `frames/still-050s.png`
- `frames/still-057s.png`
  - representative still frames for visual review
- `frames/subwindow-opening-rack-0-8s-4fps.png`
- `frames/subwindow-early-attacks-8-20s-4fps.png`
- `frames/subwindow-mid-pressure-20-40s-2fps.png`
- `frames/subwindow-late-cleanup-40-58s-2fps.png`
  - subwindow review contact sheets
- `audio/waveform-0-58s.png`
- `audio/waveform-0-58s-log.png`
  - waveform renders for audio review
- `events/reference-events.json`
  - event-log scaffold with first-pass visual observations
- `semantic-scout-wave-profile.md`
  - later-pressure semantic profile
- `subwindows/reference-subwindows.json`
  - subwindow boundaries, nominal frame ranges, tile cadence, observations, and
    implementation-use notes
- `traces/early-attacks-galaxip-x/`
  - first-pass frame-level Galaxip x-position and lower-pressure component
    trace for the `8.000s` to `20.000s` early-attacks window

The `clips` folder remains available for canonical subwindow extraction after
rights review.
