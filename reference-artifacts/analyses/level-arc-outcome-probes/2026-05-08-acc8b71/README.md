# Level Arc Outcome Probes

This artifact records deterministic gameplay outcomes for mid and late windows so level-arc planning can separate visual/signature variety from actual loss, clear, score, and reward opportunity behavior.

- Score: 6.2/10
- Probes: 6/6
- Windows with endpoint evidence: 5/6
- Windows with collision-loss pressure: 4/6
- Windows with special reward evidence: 2/6
- Total special reward bonus: 3200

## Probe Results

### mid-run-pressure
- Scenario: `stage6-regular`
- OK: yes
- Score: 550
- Lives: 3
- Attacks: 6
- Enemy bullets: 4
- Losses: 0
- Clears: 0
- Collision losses: 0
- Special attack count: 0

### mid-run-entry-variant
- Scenario: `stage8-entry-variant`
- OK: yes
- Score: 700
- Lives: 3
- Attacks: 7
- Enemy bullets: 7
- Losses: 1
- Clears: 0
- Collision losses: 0
- Special attack count: 0
- First loss: `{"t":5.133,"stageClock":5.133,"cause":"enemy_bullet","sourceType":"bee","sourceDive":0,"sourceAttackMode":null,"playerLane":5,"sourceLane":5,"sourceColumn":null,"recentAttackStarts":3,"recentEnemyBullets":1}`

### late-run-cleanup-or-failure
- Scenario: `stage12-variety`
- OK: yes
- Score: 380
- Lives: 4
- Attacks: 22
- Enemy bullets: 20
- Losses: 1
- Clears: 0
- Collision losses: 1
- Special attack count: 0
- First loss: `{"t":11.067,"stageClock":11.067,"cause":"enemy_collision","sourceType":"but","sourceDive":5,"sourceAttackMode":"escort","playerLane":0,"sourceLane":0,"sourceColumn":5,"recentAttackStarts":4,"recentEnemyBullets":3}`

### late-run-natural-squadron-reward
- Scenario: `stage12-natural-squadron-reward`
- OK: yes
- Score: 3030
- Lives: 4
- Attacks: 25
- Enemy bullets: 23
- Losses: 1
- Clears: 0
- Collision losses: 1
- Special attack count: 1
- First loss: `{"t":18.443,"stageClock":18.443,"cause":"enemy_collision","sourceType":"but","sourceDive":1,"sourceAttackMode":"dive","playerLane":5,"sourceLane":5,"sourceColumn":9,"recentAttackStarts":2,"recentEnemyBullets":2}`

### late-run-squadron-reward
- Scenario: `stage12-squadron-bonus`
- OK: yes
- Score: 1680
- Lives: 4
- Attacks: 3
- Enemy bullets: 0
- Losses: 1
- Clears: 1
- Collision losses: 1
- Special attack count: 1
- First loss: `{"t":1.7,"stageClock":1.7,"cause":"enemy_collision","sourceType":"but","sourceDive":1,"sourceAttackMode":"escort","playerLane":5,"sourceLane":5,"sourceColumn":2,"recentAttackStarts":3,"recentEnemyBullets":0}`

### late-run-escort-variant
- Scenario: `stage14-escort-variant`
- OK: yes
- Score: 970
- Lives: 4
- Attacks: 11
- Enemy bullets: 11
- Losses: 1
- Clears: 0
- Collision losses: 1
- Special attack count: 0
- First loss: `{"t":5.367,"stageClock":5.367,"cause":"enemy_collision","sourceType":"but","sourceDive":1,"sourceAttackMode":"dive","playerLane":8,"sourceLane":8,"sourceColumn":9,"recentAttackStarts":2,"recentEnemyBullets":4}`

