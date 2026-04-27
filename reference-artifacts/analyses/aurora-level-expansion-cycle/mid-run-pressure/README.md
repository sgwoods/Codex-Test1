# mid-run-pressure

Status: source-pending evidence window

Role: mid_run_pressure

Source kind: aurora_harness_or_self_play_video

This folder is the planned artifact target for the Aurora level-by-level expansion cycle. It is generated from `reference-artifacts/analyses/aurora-level-expansion-cycle/aurora-four-window-cycle.plan.json` so the same review loop can be reused for Aurora, Galaxy Guardians, and later Platinum packs.

## Event Families

- `formation_entry`
- `enemy_dive_start`
- `escort_dive_start`
- `enemy_projectile`
- `player_hit`
- `wave_clear`

## Required Artifacts

- source or generated run manifest
- contact sheet
- notable still frames
- waveform only if audio timing becomes relevant
- motion / pressure trace
- semantic event scaffold
- promoted reviewed event log
- playable-slice note
- harness target list

## Scaffold

- `reference-artifacts/analyses/aurora-level-expansion-cycle/mid-run-pressure/events/reference-events.json`

## Next Review Step

Record or ingest the source window, generate contact sheets/stills/trace, then promote visually confirmed events from null timestamps into reviewed observations.
