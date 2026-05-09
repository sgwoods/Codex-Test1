# Stage Signature Distance

This artifact compares Aurora evidence windows as gameplay signatures so level-arc conformance can penalize repetition with computation instead of narrative judgment.

- Windows: 11
- Pairs: 55
- Signature score: 10/10
- Mean distance: 0.426
- Minimum distance: 0.265
- Distinct pair ratio: 1
- Repetition risk: 0
- Closest pair: late-run-crown-entry / late-run-escort-variant (0.265)
- Most distinct pair: challenge-stage-candidate / late-run-escort-variant (0.581)
- Regular windows: 7
- Mean regular distance: 0.32
- Minimum regular distance: 0.265
- Minimum mid/late distance: 0.271
- Closest mid/late pair: mid-run-entry-variant / mid-run-pincer-variant (0.271)
- Closest same-band regular pair: late-run-crown-entry / late-run-escort-variant (0.265)

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

### late-run-crown-entry
- Scenario: stage16-crown-entry
- Stage: 16
- Stage band: late
- Challenge: false
- Observed event families: enemy_dive_start, enemy_projectile, escort_dive_start, formation_entry, player_hit
- Pressure read: max attackers 7, max enemy bullets 2, max challenge enemies 0

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

### mid-run-pincer-variant
- Scenario: stage10-pincer-entry
- Stage: 10
- Stage band: late
- Challenge: false
- Observed event families: enemy_dive_start, enemy_projectile, escort_dive_start, flank_dive_start, formation_entry
- Pressure read: max attackers 4, max enemy bullets 3, max challenge enemies 0

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
| late-run-crown-entry / late-run-escort-variant | 0.265 |
| mid-run-entry-variant / mid-run-pincer-variant | 0.271 |
| late-run-crown-entry / mid-run-pressure | 0.28 |
| mid-run-pincer-variant / mid-run-pressure | 0.284 |
| late-run-escort-variant / mid-run-pressure | 0.286 |
| late-run-cleanup-or-failure / mid-run-entry-variant | 0.293 |
| late-run-cleanup-or-failure / mid-run-pincer-variant | 0.298 |
| mid-run-entry-variant / mid-run-pressure | 0.303 |
| late-run-crown-entry / mid-run-entry-variant | 0.309 |
| late-run-crown-entry / mid-run-pincer-variant | 0.316 |
| late-run-cleanup-or-failure / stage-1-baseline | 0.318 |
| mid-run-entry-variant / stage-1-baseline | 0.318 |
| mid-run-pincer-variant / stage-1-baseline | 0.327 |
| late-run-cleanup-or-failure / mid-run-pressure | 0.328 |
| late-run-escort-variant / mid-run-pincer-variant | 0.332 |
| late-run-cleanup-or-failure / late-run-crown-entry | 0.34 |
| challenge-stage-scorpion-cross / challenge-stage-stingray-hook | 0.342 |
| late-run-escort-variant / mid-run-entry-variant | 0.343 |
| mid-run-pressure / stage-1-baseline | 0.345 |
| challenge-stage-boss-led-loop / challenge-stage-scorpion-cross | 0.356 |
| challenge-stage-boss-led-loop / challenge-stage-stingray-hook | 0.358 |
| challenge-stage-candidate / challenge-stage-scorpion-cross | 0.358 |
| challenge-stage-candidate / challenge-stage-stingray-hook | 0.359 |
| late-run-cleanup-or-failure / late-run-escort-variant | 0.365 |
| late-run-crown-entry / stage-1-baseline | 0.383 |
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
| challenge-stage-boss-led-loop / mid-run-pincer-variant | 0.513 |
| challenge-stage-scorpion-cross / mid-run-pincer-variant | 0.515 |
| challenge-stage-stingray-hook / mid-run-entry-variant | 0.519 |
| challenge-stage-boss-led-loop / mid-run-pressure | 0.521 |
| challenge-stage-candidate / mid-run-pincer-variant | 0.521 |
| challenge-stage-stingray-hook / mid-run-pincer-variant | 0.523 |
| challenge-stage-scorpion-cross / mid-run-pressure | 0.528 |
| challenge-stage-boss-led-loop / late-run-crown-entry | 0.536 |
| challenge-stage-stingray-hook / mid-run-pressure | 0.538 |
| challenge-stage-scorpion-cross / late-run-crown-entry | 0.55 |
| challenge-stage-candidate / late-run-crown-entry | 0.557 |
| challenge-stage-stingray-hook / late-run-crown-entry | 0.557 |
| challenge-stage-scorpion-cross / late-run-escort-variant | 0.572 |
| challenge-stage-stingray-hook / late-run-escort-variant | 0.579 |
| challenge-stage-candidate / late-run-escort-variant | 0.581 |

