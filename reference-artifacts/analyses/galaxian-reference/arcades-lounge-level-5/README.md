# ARCADE'S LOUNGE Galaxian Level 5

Window id: `arcades-lounge-level-5`

Status: `planned`

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
  - H.264 video (`avc1`)
  - AAC audio (`mp4a`)
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

## Required Artifacts

Before this source becomes implementation evidence, add:

- exact source window timestamps
- clipped media or reproducible capture instructions
- contact sheet
- first-pass event log
- confidence notes
- semantic profile updates

## Current Files

- `events/reference-events.json`
  - event-log skeleton
- `semantic-scout-wave-profile.md`
  - later-pressure semantic scaffold

The `clips`, `frames`, and `audio` folders are present as artifact targets.
