# Stage Signature Distance

This artifact compares Aurora evidence windows as gameplay signatures so level-arc conformance can penalize repetition with computation instead of narrative judgment.

- Windows: 6
- Pairs: 15
- Signature score: 6.7/10
- Mean distance: 0.272
- Minimum distance: 0.106
- Distinct pair ratio: 0.533
- Repetition risk: 0.518
- Closest pair: mid-run-entry-variant / mid-run-pressure (0.106)
- Most distinct pair: challenge-stage-candidate / late-run-escort-variant (0.474)
- Regular windows: 5
- Mean regular distance: 0.182
- Minimum regular distance: 0.106
- Minimum mid/late distance: 0.138
- Closest mid/late pair: late-run-escort-variant / mid-run-pressure (0.138)
- Closest same-band regular pair: mid-run-entry-variant / mid-run-pressure (0.106)

## Windows

### challenge-stage-candidate
- Scenario: stage3-challenge
- Stage: 3
- Stage band: challenge
- Challenge: true
- Observed event families: challenge_enemy_hit, challenge_enemy_path, challenge_result, challenge_wave_start
- Pressure read: max attackers 2, max enemy bullets 1, max challenge enemies 40

### late-run-cleanup-or-failure
- Scenario: stage12-variety
- Stage: 12
- Stage band: late
- Challenge: false
- Observed event families: enemy_dive_start, enemy_projectile, escort_dive_start
- Pressure read: max attackers 4, max enemy bullets 3, max challenge enemies 0

### late-run-escort-variant
- Scenario: stage14-escort-variant
- Stage: 14
- Stage band: late
- Challenge: false
- Observed event families: enemy_dive_start, enemy_projectile, escort_dive_start, formation_entry
- Pressure read: max attackers 5, max enemy bullets 2, max challenge enemies 0

### mid-run-entry-variant
- Scenario: stage8-entry-variant
- Stage: 8
- Stage band: mid
- Challenge: false
- Observed event families: enemy_dive_start, enemy_projectile, escort_dive_start, flank_dive_start, formation_entry, player_hit
- Pressure read: max attackers 4, max enemy bullets 2, max challenge enemies 0

### mid-run-pressure
- Scenario: stage6-regular
- Stage: 6
- Stage band: mid
- Challenge: false
- Observed event families: enemy_dive_start, enemy_projectile, escort_dive_start, formation_entry, player_hit
- Pressure read: max attackers 3, max enemy bullets 2, max challenge enemies 0

### stage-1-baseline
- Scenario: stage1-descent
- Stage: 1
- Stage band: early
- Challenge: false
- Observed event families: enemy_dive_start, enemy_projectile, formation_entry, player_move, stage_start
- Pressure read: max attackers 2, max enemy bullets 1, max challenge enemies 0

## Pair Distances

| Pair | Distance |
| --- | ---: |
| mid-run-entry-variant / mid-run-pressure | 0.106 |
| late-run-escort-variant / mid-run-pressure | 0.138 |
| late-run-cleanup-or-failure / late-run-escort-variant | 0.144 |
| late-run-cleanup-or-failure / mid-run-pressure | 0.159 |
| late-run-cleanup-or-failure / mid-run-entry-variant | 0.163 |
| late-run-escort-variant / mid-run-entry-variant | 0.166 |
| mid-run-pressure / stage-1-baseline | 0.213 |
| mid-run-entry-variant / stage-1-baseline | 0.228 |
| late-run-cleanup-or-failure / stage-1-baseline | 0.238 |
| late-run-escort-variant / stage-1-baseline | 0.263 |
| challenge-stage-candidate / stage-1-baseline | 0.425 |
| challenge-stage-candidate / mid-run-pressure | 0.446 |
| challenge-stage-candidate / late-run-cleanup-or-failure | 0.453 |
| challenge-stage-candidate / mid-run-entry-variant | 0.459 |
| challenge-stage-candidate / late-run-escort-variant | 0.474 |
