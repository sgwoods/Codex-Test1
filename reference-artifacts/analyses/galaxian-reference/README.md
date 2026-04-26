# Galaxian Reference Ingestion Seed

This folder is the first source-to-semantics ingestion seed for the future
`Galaxy Guardians` Platinum pack.

It follows the process in:

- `CLASSIC_ARCADE_INGESTION_FRAMEWORK.md`

## Status

Current status: `source-discovery-seed`

This is not yet a canonical gameplay baseline. It is the first manifest and
window scaffold we will use to automate the rest of the process.

## Current Goals

1. Track candidate `Galaxian` gameplay and rules sources with provenance.
2. Select one narrow formation-entry / first-dive reference window.
3. Create an event-log skeleton before implementing a playable slice.
4. Convert the first analyzed window into a semantic scout-wave profile.
5. Use that profile to define harness targets for `Galaxy Guardians`.

## Folder Layout

- `manifest.json`
  - candidate sources, source status, and first window plan
- `seed-window-formation-entry/`
  - first planned analysis window
- `seed-window-formation-entry/events/reference-events.json`
  - editable event-log skeleton
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

Create or locate an analyzable clip for `seed-window-formation-entry`, then fill
in exact timestamps, generated contact sheets, and first-pass events.
