# Nenriki Gaming Channel Galaxian 15-Wave Session

Window id: `nenriki-15-wave-session`

Status: `planned`

This folder catalogs a locally provided long-session `Galaxian` reference video
for the future `Galaxy Guardians` progression-ingestion program.

## Source

- Local file:
  - `/Users/sgwoods/Downloads/Galaxian (Arcade) original video game  15-wave session for 1 Player 👾🌌🕹️ - Nenriki Gaming Channel (1080p, h264).mp4`
- Catalog date:
  - `2026-04-26`
- File size observed locally:
  - `152,204,417 bytes`
- Container / codec notes:
  - MP4 / ISO Base Media
  - H.264 video (`avc1`)
  - AAC audio (`mp4a`)
- Filename notes:
  - title indicates `Galaxian (Arcade) original video game`
  - source label indicates `Nenriki Gaming Channel`
  - filename indicates `15-wave session for 1 Player`
  - filename indicates `1080p, h264`

## Repository Storage Decision

The video itself is not committed in this pass.

Reason:

- it is a local source media file
- it is large for normal git storage
- provenance and usage rights still need review
- the current artifact policy prefers committed README/manifest anchors before
  committing source video blobs

## Analysis Purpose

This source is valuable because it appears to cover a broad one-player session,
not only an intro or isolated later wave.

Use it to answer:

- how pressure scales across repeated waves
- how wave transitions are presented and timed
- how often flagship / escort attacks appear
- how player movement strategy changes over a longer session
- which smaller windows should become canonical opening, mid-run, and
  late-session examples

## Recommended Window Split

Do not analyze the full source as one monolithic clip.

Recommended first splits:

1. opening wave
   - start through first formation / first dive
2. early progression
   - around waves 2-3 if cleanly identifiable
3. mid-run pressure
   - around waves 5-8 if cleanly identifiable
4. late-session pressure
   - around waves 12-15 if cleanly identifiable
5. transition sample
   - a clean wave-clear into next-wave setup

## Required Artifacts

Before this source becomes implementation evidence, add:

- exact source window timestamps
- clipped media or reproducible capture instructions
- contact sheets for the selected sub-windows
- first-pass event logs
- confidence notes
- semantic profile updates

## Current Files

- `events/reference-events.json`
  - long-session event-log skeleton
- `semantic-scout-wave-profile.md`
  - progression semantic scaffold

The `clips`, `frames`, and `audio` folders are present as artifact targets.
