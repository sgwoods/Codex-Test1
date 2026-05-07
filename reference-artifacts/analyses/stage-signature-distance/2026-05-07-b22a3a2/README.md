# Stage Signature Distance

This artifact compares Aurora evidence windows as gameplay signatures so level-arc conformance can penalize repetition with computation instead of narrative judgment.

- Windows: 4
- Pairs: 6
- Signature score: 7.9/10
- Mean distance: 0.321
- Minimum distance: 0.116
- Distinct pair ratio: 0.667
- Repetition risk: 0.473
- Closest pair: late-run-cleanup-or-failure / mid-run-pressure (0.116)
- Most distinct pair: challenge-stage-candidate / late-run-cleanup-or-failure (0.471)

## Windows

### challenge-stage-candidate
- Scenario: stage3-challenge
- Stage: 3
- Challenge: true
- Observed event families: challenge_enemy_hit, challenge_enemy_path, challenge_result, challenge_wave_start
- Pressure read: max attackers 3, max enemy bullets 1, max challenge enemies 40

### late-run-cleanup-or-failure
- Scenario: stage12-variety
- Stage: 12
- Challenge: false
- Observed event families: enemy_dive_start, enemy_projectile
- Pressure read: max attackers 5, max enemy bullets 3, max challenge enemies 0

### mid-run-pressure
- Scenario: stage6-regular
- Stage: 6
- Challenge: false
- Observed event families: enemy_dive_start, enemy_projectile, formation_entry, player_hit
- Pressure read: max attackers 4, max enemy bullets 2, max challenge enemies 0

### stage-1-baseline
- Scenario: stage1-descent
- Stage: 1
- Challenge: false
- Observed event families: enemy_dive_start, enemy_projectile, formation_entry, player_move, stage_start
- Pressure read: max attackers 2, max enemy bullets 1, max challenge enemies 0

## Pair Distances

| Pair | Distance |
| --- | ---: |
| late-run-cleanup-or-failure / mid-run-pressure | 0.116 |
| mid-run-pressure / stage-1-baseline | 0.2 |
| late-run-cleanup-or-failure / stage-1-baseline | 0.256 |
| challenge-stage-candidate / mid-run-pressure | 0.436 |
| challenge-stage-candidate / stage-1-baseline | 0.446 |
| challenge-stage-candidate / late-run-cleanup-or-failure | 0.471 |
