# Galaxian Reference Ingestion Seed

This folder is the first source-to-semantics ingestion seed for the future
`Galaxy Guardians` Platinum pack.

It follows the process in:

- `CLASSIC_ARCADE_INGESTION_FRAMEWORK.md`

## Status

Current status: `long-cycle-artifact-seed`

This is not yet a canonical gameplay baseline. It now includes local metadata,
contact sheets, waveforms, stills, subwindows, and first-pass traces that we
will use to automate the rest of the process.

## Current Goals

1. Track candidate `Galaxian` gameplay and rules sources with provenance.
2. Select one narrow formation-entry / first-dive reference window.
3. Create an event-log skeleton before implementing a playable slice.
4. Convert the first analyzed window into a semantic scout-wave profile.
5. Use that profile to define harness targets for `Galaxy Guardians`.
6. Convert the best evidence into a first playable preview spec.

## Validation

Run:

```sh
npm run harness:check:classic-arcade-ingestion
```

The validator checks the source manifest, selected windows, event-log schema,
confidence labels, artifact target folders, and semantic profile anchors.

To regenerate the local Galaxian long-cycle artifact set, run:

```sh
npm run harness:cycle:galaxian-reference
```

This requires the locally supplied source videos under `/Users/sgwoods/Downloads`
and a working `ffmpeg` / `ffprobe` install.

## Folder Layout

- `manifest.json`
  - candidate sources, source status, and first window plan
- `FIRST_GALAXIAN_PREVIEW_EVIDENCE_MAP.md`
  - current source roles and implementation evidence map for the preview slice
- `local-cycle-summary.json`
  - last local long-cycle summary
- `seed-window-formation-entry/`
  - first planned analysis window
- `seed-window-formation-entry/events/reference-events.json`
  - editable event-log skeleton
- `matt-hawkins-arcade-intro/`
  - local beginning-phase source scaffold
- `matt-hawkins-arcade-intro/events/reference-events.json`
  - intro / formation handoff event-log skeleton
- `arcades-lounge-level-5/`
  - local later-pressure / Level 5 source scaffold
- `arcades-lounge-level-5/events/reference-events.json`
  - progression and later-pressure event-log skeleton
- `arcades-lounge-level-5/traces/`
  - active-play Galaxip x-position and pressure-component traces
- `nenriki-15-wave-session/`
  - local long-session / 15-wave source scaffold
- `nenriki-15-wave-session/events/reference-events.json`
  - wave progression and pressure-scaling candidate anchors
- `nenriki-15-wave-session/subwindows/reference-subwindows.json`
  - generated opening, mid-session, and late-session candidate windows
- `seed-window-formation-entry/semantic-scout-wave-profile.md`
  - first semantic model scaffold

## Working Rule

Do not treat a source as implementation evidence until it has:

- a manifest entry
- a clipped or locally reproducible window
- event notes
- confidence labels
- a semantic interpretation tied to harness targets

## Next Action

Promote one exact Nenriki progression or wave-transition subwindow, then draft
the `Galaxy Guardians` first playable preview spec against the evidence map.
