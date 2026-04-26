# Galaga Gameplay Arcade - Snake Latino

This folder catalogs a locally provided `Galaga` gameplay video for the
reference library.

It is intended as a gameplay-review source for later Aurora fidelity work,
especially:

- stage-opening timing
- player movement traces
- shot cadence
- first-dive pressure
- challenge-stage and later-stage review if present in the clip

## Source

- Local file:
  - `/Users/sgwoods/Downloads/🎮🕹️👉Galaga (1981) - Gameplay Arcade - Snake Latino (360p, h264).mp4`
- Catalog date:
  - `2026-04-26`
- File size observed locally:
  - `15,329,343 bytes`
- Container / codec notes:
  - MP4 / ISO Base Media
  - H.264 video (`avc1`)
  - AAC audio (`mp4a`)
- Filename notes:
  - title indicates `Galaga (1981)`
  - source label indicates `Gameplay Arcade - Snake Latino`
  - filename indicates `360p, h264`

## Repository Storage Decision

The video itself is not committed in this pass.

Reason:

- it is a local source media file
- provenance and usage rights still need review
- the current artifact policy prefers committed README/manifest anchors before
  committing source video blobs

This folder therefore records the local anchor and intended analysis role.

## Current Status

Status: `cataloged-local-source`

This video has not yet been clipped, timestamped, or converted into event logs.

## First Analysis Windows To Extract

Suggested first windows:

1. `stage-1-opening`
   - credit / start through first formation arrival and first dive
2. `player-movement-sample`
   - a window with visible taps, holds, reversals, and firing
3. `challenge-stage-if-present`
   - first challenge-stage entry, target groups, and results
4. `later-pressure-if-present`
   - a later stage with denser dives and player survival pressure

## Next Steps

1. Confirm playable duration and frame rate with a local media tool.
2. Pick the first `stage-1-opening` timestamp window.
3. Generate a contact sheet.
4. Create a reference event-log skeleton.
5. Link any extracted event families into the existing Galaga timing and
   movement correspondence program.
