# Matt Hawkins Galaxian Arcade Intro

Window id: `matt-hawkins-arcade-intro`

Status: `planned`

This folder catalogs a locally provided beginning-phase `Galaxian` reference
video for the future `Galaxy Guardians` scout-wave ingestion program.

## Source

- Local file:
  - `/Users/sgwoods/Downloads/Galaxian (Namco 1979) - Arcade Intro - Matt Hawkins (720p, h264).mp4`
- Catalog date:
  - `2026-04-26`
- File size observed locally:
  - `5,429,248 bytes`
- Container / codec notes:
  - MP4 / ISO Base Media
  - H.264 video (`avc1`)
  - AAC audio (`mp4a`)
- Filename notes:
  - title indicates `Galaxian (Namco 1979)`
  - source label indicates `Arcade Intro - Matt Hawkins`
  - filename indicates `720p, h264`

## Repository Storage Decision

The video itself is not committed in this pass.

Reason:

- it is a local source media file
- provenance and usage rights still need review
- the current artifact policy prefers committed README/manifest anchors before
  committing source video blobs

## Analysis Purpose

This source is valuable because it appears focused on the beginning phase.

Use it to answer:

- what intro or title surface appears before gameplay
- how the beginning phase hands off into formation presentation
- whether the formation rows and top-rank enemies are readable at 720p
- whether the clip includes first movement, first shot, or first dive evidence

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

The `clips`, `frames`, and `audio` folders are present as artifact targets.
