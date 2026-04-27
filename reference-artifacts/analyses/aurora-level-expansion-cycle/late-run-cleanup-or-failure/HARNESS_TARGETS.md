# late-run-cleanup-or-failure Harness Targets

## Observed Targets

- assert `enemy_dive_start` appears in the window event log
- assert `enemy_projectile` appears in the window event log

## Missing Or Follow-Up Targets

- create a scenario or source window that observes `player_hit`
- create a scenario or source window that observes `wave_clear`
- create a scenario or source window that observes `game_over`

## First Candidate Check

A future harness should load the same scenario seed, run the deterministic window, and compare player range, max pressure, and event-family coverage against `trace/trace.json` and `events/reference-events.json`.
