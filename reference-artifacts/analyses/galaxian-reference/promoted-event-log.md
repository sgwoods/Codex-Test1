# Galaxian Promoted Event Log

Status: `promoted-reviewed-event-windows`

This log promotes the first reviewed Galaxian windows from the generated contact
sheets and waveforms into named semantic events for the future Galaxy Guardians
0.1 scout-wave preview. These are broad observed windows, not frame-accurate
runtime timings yet.

## Events

- `attract_mission_text` (matt-hawkins-arcade-intro, 0-10s): Attract mode opens with the mission language and red title text before score-table display.
- `score_advance_table` (matt-hawkins-arcade-intro, 10-35s): The source shows four ranked alien/charger rows with distinct point bands rather than Aurora enemy families.
- `formation_rack_complete` (nenriki-15-wave-session, 60-75s): The formation appears as a completed rack with top flagship/escort ranks and lower rows of repeated scouts.
- `formation_entry_start` (matt-hawkins-arcade-intro, 40-45s): The intro source first shows the demo/playfield rack after attract scoring screens, giving the earliest broad entry window.
- `formation_entry_settle` (matt-hawkins-arcade-intro, 45-55s): The rack is visibly present and stable across the later demo/playfield samples before game-over return.
- `alien_dive_start` (arcades-lounge-level-5, 20-30s): Mid-wave pressure shows independent aliens leaving the rack and occupying lower-field attack paths.
- `flagship_dive_start` (nenriki-15-wave-session, 90-135s): The long-session source shows top-rank pressure with flagship-colored enemies and escorts in active dive windows.
- `escort_join` (nenriki-15-wave-session, 90-135s): Escort pressure is visible alongside flagship movement during the same lower-field attack windows.
- `player_shot_fired` (arcades-lounge-level-5, 0-20s): The player fire read is narrow and single-shot oriented, with shot cadence distinct from Aurora dual-fighter possibility.
- `player_shot_resolved` (arcades-lounge-level-5, 20-40s): Shot resolution occurs amid ongoing dive pressure and formation depletion, without capture/rescue branching.
- `enemy_wrap_or_return` (nenriki-15-wave-session, 105-150s): Enemies continue threat movement through lower-field windows and appear to re-enter/return as pressure cycles continue.

## Next Use

- Convert these broad windows into frame-level timings where needed.
- Use the promoted target names as the first Guardians event vocabulary.
- Keep Aurora-specific capture, dual-fighter, challenge-stage, and scoring rules out of the Guardians preview.
