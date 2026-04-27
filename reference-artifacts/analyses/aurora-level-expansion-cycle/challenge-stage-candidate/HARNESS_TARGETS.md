# challenge-stage-candidate Harness Targets

## Observed Targets

- assert `challenge_wave_start` appears in the window event log
- assert `challenge_enemy_path` appears in the window event log
- assert `challenge_enemy_hit` appears in the window event log
- assert `challenge_result` appears in the window event log

## Missing Or Follow-Up Targets

- all planned event families observed in this pass

## First Candidate Check

A future harness should load the same scenario seed, run the deterministic window, and compare player range, max pressure, and event-family coverage against `trace/trace.json` and `events/reference-events.json`.
