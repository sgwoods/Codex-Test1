# Stage Signature Distance

This artifact compares Aurora evidence windows as gameplay signatures so level-arc conformance can penalize repetition with computation instead of narrative judgment.

- Windows: 9
- Pairs: 36
- Signature score: 10/10
- Mean distance: 0.438
- Minimum distance: 0.286
- Distinct pair ratio: 1
- Repetition risk: 0
- Closest pair: late-run-escort-variant / mid-run-pressure (0.286)
- Most distinct pair: challenge-stage-candidate / late-run-escort-variant (0.581)
- Regular windows: 5
- Mean regular distance: 0.332
- Minimum regular distance: 0.286
- Minimum mid/late distance: 0.286
- Closest mid/late pair: late-run-escort-variant / mid-run-pressure (0.286)
- Closest same-band regular pair: mid-run-entry-variant / mid-run-pressure (0.303)

## Windows

### challenge-stage-boss-led-loop
- Scenario: stage15-challenge-boss-led-loop
- Stage: 15
- Stage band: challenge
- Challenge: true
- Observed event families: challenge_enemy_hit, challenge_enemy_path, challenge_result, challenge_wave_start
- Pressure read: max attackers 8, max enemy bullets 3, max challenge enemies 40

### challenge-stage-candidate
- Scenario: stage3-challenge
- Stage: 3
- Stage band: challenge
- Challenge: true
- Observed event families: challenge_enemy_hit, challenge_enemy_path, challenge_result, challenge_wave_start
- Pressure read: max attackers 1, max enemy bullets 1, max challenge enemies 40

### challenge-stage-scorpion-cross
- Scenario: stage7-challenge-cross-sweep
- Stage: 7
- Stage band: challenge
- Challenge: true
- Observed event families: challenge_enemy_hit, challenge_enemy_path, challenge_result, challenge_wave_start
- Pressure read: max attackers 2, max enemy bullets 2, max challenge enemies 40

### challenge-stage-stingray-hook
- Scenario: stage11-challenge-hook-arc
- Stage: 11
- Stage band: challenge
- Challenge: true
- Observed event families: challenge_enemy_hit, challenge_enemy_path, challenge_result, challenge_wave_start
- Pressure read: max attackers 2, max enemy bullets 2, max challenge enemies 40

### late-run-cleanup-or-failure
- Scenario: stage12-variety
- Stage: 12
- Stage band: late
- Challenge: false
- Observed event families: enemy_dive_start, enemy_projectile, player_hit
- Pressure read: max attackers 2, max enemy bullets 3, max challenge enemies 0

### late-run-escort-variant
- Scenario: stage14-escort-variant
- Stage: 14
- Stage band: late
- Challenge: false
- Observed event families: enemy_dive_start, enemy_projectile, escort_dive_start, formation_entry, player_hit
- Pressure read: max attackers 9, max enemy bullets 3, max challenge enemies 0

### mid-run-entry-variant
- Scenario: stage8-entry-variant
- Stage: 8
- Stage band: mid
- Challenge: false
- Observed event families: enemy_dive_start, enemy_projectile, escort_dive_start, flank_dive_start, formation_entry, player_hit
- Pressure read: max attackers 3, max enemy bullets 2, max challenge enemies 0

### mid-run-pressure
- Scenario: stage6-regular
- Stage: 6
- Stage band: mid
- Challenge: false
- Observed event families: enemy_dive_start, enemy_projectile, escort_dive_start, formation_entry
- Pressure read: max attackers 6, max enemy bullets 2, max challenge enemies 0

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
| late-run-escort-variant / mid-run-pressure | 0.286 |
| late-run-cleanup-or-failure / mid-run-entry-variant | 0.293 |
| mid-run-entry-variant / mid-run-pressure | 0.303 |
| late-run-cleanup-or-failure / stage-1-baseline | 0.318 |
| mid-run-entry-variant / stage-1-baseline | 0.318 |
| late-run-cleanup-or-failure / mid-run-pressure | 0.328 |
| challenge-stage-scorpion-cross / challenge-stage-stingray-hook | 0.342 |
| late-run-escort-variant / mid-run-entry-variant | 0.343 |
| mid-run-pressure / stage-1-baseline | 0.345 |
| challenge-stage-boss-led-loop / challenge-stage-scorpion-cross | 0.356 |
| challenge-stage-boss-led-loop / challenge-stage-stingray-hook | 0.358 |
| challenge-stage-candidate / challenge-stage-scorpion-cross | 0.358 |
| challenge-stage-candidate / challenge-stage-stingray-hook | 0.359 |
| late-run-cleanup-or-failure / late-run-escort-variant | 0.365 |
| challenge-stage-boss-led-loop / challenge-stage-candidate | 0.387 |
| late-run-escort-variant / stage-1-baseline | 0.416 |
| challenge-stage-stingray-hook / late-run-cleanup-or-failure | 0.453 |
| challenge-stage-scorpion-cross / mid-run-entry-variant | 0.456 |
| challenge-stage-candidate / mid-run-pressure | 0.482 |
| challenge-stage-candidate / stage-1-baseline | 0.493 |
| challenge-stage-scorpion-cross / stage-1-baseline | 0.496 |
| challenge-stage-scorpion-cross / late-run-cleanup-or-failure | 0.499 |
| challenge-stage-candidate / late-run-cleanup-or-failure | 0.503 |
| challenge-stage-boss-led-loop / late-run-cleanup-or-failure | 0.504 |
| challenge-stage-stingray-hook / stage-1-baseline | 0.507 |
| challenge-stage-boss-led-loop / stage-1-baseline | 0.511 |
| challenge-stage-boss-led-loop / late-run-escort-variant | 0.512 |
| challenge-stage-candidate / mid-run-entry-variant | 0.512 |
| challenge-stage-boss-led-loop / mid-run-entry-variant | 0.513 |
| challenge-stage-stingray-hook / mid-run-entry-variant | 0.519 |
| challenge-stage-boss-led-loop / mid-run-pressure | 0.521 |
| challenge-stage-scorpion-cross / mid-run-pressure | 0.528 |
| challenge-stage-stingray-hook / mid-run-pressure | 0.538 |
| challenge-stage-scorpion-cross / late-run-escort-variant | 0.572 |
| challenge-stage-stingray-hook / late-run-escort-variant | 0.579 |
| challenge-stage-candidate / late-run-escort-variant | 0.581 |
