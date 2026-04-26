# Nenriki Gaming Channel Galaxian 15-Wave Session

Window id: `nenriki-15-wave-session`

Status: `source-selected`

This folder catalogs a locally provided long-session `Galaxian` reference video
for the future `Galaxy Guardians` progression-ingestion program. It now has
first-pass metadata, stills, contact sheets, full-source waveforms, and coarse
candidate subwindows. Exact wave boundaries still need manual review before this
source becomes implementation authority.

## Source

- Local file:
  - `/Users/sgwoods/Downloads/Galaxian (Arcade) original video game  15-wave session for 1 Player 👾🌌🕹️ - Nenriki Gaming Channel (1080p, h264).mp4`
- Catalog date:
  - `2026-04-26`
- File size observed locally:
  - `152,204,417 bytes`
- Container / codec notes:
  - MP4 / ISO Base Media
  - H.264 video (`avc1`), 1080x1234, 60 fps
  - AAC stereo audio (`mp4a`), 44.1 kHz
  - duration `944.093583` seconds
  - first full-source volume probe: mean `-19.8 dB`, max `-0.2 dB`
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

## First-Pass Artifacts

- `source-metadata.json`
  - ffprobe stream and container metadata
- `frames/contact-sheet-30s-overview.png`
  - coarse full-session overview at 30 second cadence
- `frames/contact-sheet-10s-opening-0-180s.png`
  - opening progression overview at 10 second cadence
- `frames/still-000s.png`, `still-030s.png`, `still-060s.png`,
  `still-120s.png`, `still-180s.png`, `still-240s.png`, `still-300s.png`,
  `still-420s.png`, `still-600s.png`, `still-660s.png`, `still-720s.png`
  - representative still frames across the session
- `audio/waveform-full.png`
  - linear full-source waveform
- `audio/waveform-full-log.png`
  - log-scale full-source waveform
- `subwindows/reference-subwindows.json`
  - generated coarse window candidates for later review

## Candidate Window Split

Do not analyze the full source as one monolithic clip. The first generated
candidate split is:

1. `opening-progression-scout`
   - `0.000-60.000s`
   - use for opening presentation, first setup, and early progression scouting
2. `mid-session-candidate`
   - `180.000-240.000s`
   - use for candidate mid-run pressure review
3. `late-session-candidate`
   - `660.866-720.866s`
   - use for candidate late-session pressure review

## Required Next Artifacts

Before this source becomes implementation evidence, add:

- exact source window timestamps
- clipped media or reproducible capture instructions
- contact sheets for the selected sub-windows
- first-pass event logs
- confidence notes
- semantic profile updates
- selected-window movement / pressure traces

## Current Files

- `events/reference-events.json`
  - candidate long-session event anchors
- `semantic-scout-wave-profile.md`
  - progression semantic scaffold updated from the first-pass artifacts
- `subwindows/reference-subwindows.json`
  - coarse generated candidate windows

The `clips`, `frames`, and `audio` folders are present as artifact targets.
