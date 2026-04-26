# Seed Window: Formation Entry And First Dive

Window id: `seed-window-formation-entry`

Status: `planned`

This is the first planned end-to-end analysis window for the `Galaxian`
reference lineage and the future `Galaxy Guardians` scout-wave slice.

## Intended Coverage

The window should start just before the first playable formation appears and end
after the first dive has either returned, exited, or produced a first meaningful
player exchange.

Target duration: about `25s`

## Analysis Questions

- How long does formation entry take?
- When does the rack first become stable?
- How soon does the first dive begin?
- Does the first dive use one alien, a flagship, or an escort group?
- What player movement is visible before the first shot?
- How long does the player wait before another shot is possible?
- Does the first exchange produce useful scoring or loss evidence?

## Required Artifacts

Before this window becomes implementation evidence, add:

- exact source id
- start and end timestamps
- clipped media or reproducible capture instructions
- contact sheet
- first-pass event log
- confidence notes
- semantic profile updates

## Current Files

- `events/reference-events.json`
  - event-log skeleton
- `semantic-scout-wave-profile.md`
  - semantic model scaffold

The `clips`, `frames`, and `audio` folders are present as artifact targets.
