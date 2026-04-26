# Matt Hawkins Galaxian Arcade Intro

Window id: `matt-hawkins-arcade-intro`

Status: `events-observed`

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
  - H.264 video (`avc1`), `560x720`, `30 fps`, progressive, bt709
  - AAC audio (`mp4a`), stereo, `44.1 kHz`
  - source duration: `59.267438 seconds`
  - audio level probe: mean `-91.0 dB`, max `-90.3 dB`
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

## First-Pass Observations

The contact sheet confirms this source includes:

- title/mission presentation text
- score advance table
- Namco presentation
- full alien rack
- game-over state
- visible player Galaxip
- at least one visible shot/player-pressure moment

This source is currently strong for visual sequencing and beginning-phase
semantic mapping. It is weak for audio identity because the encoded audio track
is effectively silent in the first probe.

## Subwindow Decision

The first useful split is:

- `title-mission`: `0.000s` to `6.000s`
  - presentation/title semantics only
- `score-advance-table`: `5.000s` to `29.000s`
  - scoring and enemy-family naming semantics
- `rack-handoff`: `34.000s` to `42.000s`
  - rack composition and attract/game-over presentation
- `late-attract-pressure`: `48.000s` to `59.133333s`
  - visible Galaxip, attacker, shot/projectile, and explosion states

The late pressure window is not yet safe as player-control authority because
`GAME OVER` remains visible. Treat it as attract/demo evidence until compared
against an active gameplay source.

## Remaining Required Artifacts

Before this source becomes implementation evidence, add:

- frame-exact still sequences for the rack and late-pressure windows
- clipped media or reproducible capture instructions only if rights are cleared
- semantic profile updates
- comparison against an active gameplay source

## Current Files

- `source-metadata.json`
  - exact `ffprobe` stream and format metadata
- `frames/contact-sheet-0-59s.png`
  - 12-frame visual contact sheet sampled every 5 seconds
- `frames/contact-sheet-1fps-0-59s.png`
  - 60-frame visual contact sheet sampled every 1 second
- `frames/subwindow-title-mission-0-6s.png`
- `frames/subwindow-title-mission-0-6s-4fps.png`
- `frames/subwindow-score-table-5-29s.png`
- `frames/subwindow-score-table-5-29s-2fps.png`
- `frames/subwindow-rack-display-28-42s.png`
- `frames/subwindow-rack-handoff-34-42s-4fps.png`
- `frames/subwindow-late-pressure-42-59s.png`
- `frames/subwindow-late-pressure-48-59s-4fps.png`
  - subwindow review contact sheets
- `frames/still-000s.png`
- `frames/still-005s.png`
- `frames/still-010s.png`
- `frames/still-015s.png`
- `frames/still-020s.png`
- `frames/still-030s.png`
- `frames/still-045s.png`
- `frames/still-055s.png`
  - representative still frames for visual review
- `audio/waveform-0-59s.png`
  - linear waveform render; expected to appear nearly flat because the track is
    effectively silent
- `audio/waveform-0-59s-log.png`
  - log-scaled waveform render for low-level audio review
- `events/reference-events.json`
  - event-log scaffold with first-pass visual observations
- `subwindows/reference-subwindows.json`
  - subwindow boundaries, nominal frame ranges, tile cadence, observations, and
    implementation-use notes

The `clips` folder remains available for canonical subwindow extraction after
rights review.
