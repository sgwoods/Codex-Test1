# Level Arc Outcome Probes

This artifact records deterministic gameplay outcomes for mid and late windows so level-arc planning can separate visual/signature variety from actual loss, clear, score, and reward opportunity behavior.

- Score: 7.3/10
- Probes: 11/11
- Windows with endpoint evidence: 10/11
- Windows with collision-loss pressure: 7/11
- Windows with special reward evidence: 5/11
- Total special reward bonus: 14400

## Probe Results

### stage-1-baseline-clear-route
- Scenario: `stage1-baseline-clear-route`
- OK: yes
- Score: 1930
- Lives: 4
- Attacks: 14
- Enemy bullets: 18
- Player shots: 127
- Losses: 1
- Clears: 0
- Collision losses: 1
- Special attack count: 0
- Boss damage count: 2
- Boss kill count: 1
- Escort dive kill count: 2
- First loss: `{"t":22.037,"stageClock":22.037,"cause":"enemy_collision","sourceType":"but","sourceDive":5,"sourceAttackMode":"escort","playerLane":0,"sourceLane":0,"sourceColumn":3,"recentAttackStarts":2,"recentEnemyBullets":1}`

### mid-run-pressure
- Scenario: `stage6-regular`
- OK: yes
- Score: 550
- Lives: 3
- Attacks: 6
- Enemy bullets: 4
- Player shots: 21
- Losses: 0
- Clears: 0
- Collision losses: 0
- Special attack count: 0
- Boss damage count: 0
- Boss kill count: 0
- Escort dive kill count: 2

### mid-run-pressure-widened-endpoint
- Scenario: `stage6-mid-run-wave-clear`
- OK: yes
- Score: 1030
- Lives: 3
- Attacks: 40
- Enemy bullets: 25
- Player shots: 94
- Losses: 2
- Clears: 0
- Collision losses: 2
- Special attack count: 0
- Boss damage count: 2
- Boss kill count: 0
- Escort dive kill count: 1
- First loss: `{"t":8.62,"stageClock":8.62,"cause":"enemy_collision","sourceType":"but","sourceDive":1,"sourceAttackMode":"dive","playerLane":1,"sourceLane":2,"sourceColumn":0,"recentAttackStarts":2,"recentEnemyBullets":1}`

### mid-run-entry-variant
- Scenario: `stage8-entry-variant`
- OK: yes
- Score: 700
- Lives: 3
- Attacks: 7
- Enemy bullets: 7
- Player shots: 24
- Losses: 1
- Clears: 0
- Collision losses: 0
- Special attack count: 0
- Boss damage count: 0
- Boss kill count: 0
- Escort dive kill count: 1
- First loss: `{"t":5.133,"stageClock":5.133,"cause":"enemy_bullet","sourceType":"bee","sourceDive":0,"sourceAttackMode":null,"playerLane":5,"sourceLane":5,"sourceColumn":null,"recentAttackStarts":3,"recentEnemyBullets":1}`

### late-run-cleanup-or-failure
- Scenario: `stage12-variety`
- OK: yes
- Score: 380
- Lives: 4
- Attacks: 22
- Enemy bullets: 20
- Player shots: 71
- Losses: 1
- Clears: 0
- Collision losses: 1
- Special attack count: 0
- Boss damage count: 0
- Boss kill count: 0
- Escort dive kill count: 0
- First loss: `{"t":11.067,"stageClock":11.067,"cause":"enemy_collision","sourceType":"but","sourceDive":5,"sourceAttackMode":"escort","playerLane":0,"sourceLane":0,"sourceColumn":5,"recentAttackStarts":4,"recentEnemyBullets":3}`

### late-run-squadron-reward-best-route
- Scenario: `stage12-squadron-reward-best-route`
- OK: yes
- Score: 4950
- Lives: 2
- Attacks: 20
- Enemy bullets: 18
- Player shots: 67
- Losses: 3
- Clears: 0
- Collision losses: 1
- Special attack count: 2
- Boss damage count: 3
- Boss kill count: 3
- Escort dive kill count: 6
- First loss: `{"t":10.927,"stageClock":10.927,"cause":"enemy_bullet","sourceType":"but","sourceDive":1,"sourceAttackMode":"dive","playerLane":5,"sourceLane":5,"sourceColumn":8,"recentAttackStarts":2,"recentEnemyBullets":3}`

### late-run-natural-squadron-reward
- Scenario: `stage12-natural-squadron-reward`
- OK: yes
- Score: 5270
- Lives: 3
- Attacks: 24
- Enemy bullets: 19
- Player shots: 72
- Losses: 2
- Clears: 0
- Collision losses: 0
- Special attack count: 2
- Boss damage count: 3
- Boss kill count: 3
- Escort dive kill count: 8
- First loss: `{"t":10.927,"stageClock":10.927,"cause":"enemy_bullet","sourceType":"but","sourceDive":1,"sourceAttackMode":"dive","playerLane":5,"sourceLane":5,"sourceColumn":8,"recentAttackStarts":2,"recentEnemyBullets":3}`

### late-run-squadron-reward
- Scenario: `stage12-squadron-bonus`
- OK: yes
- Score: 1680
- Lives: 4
- Attacks: 3
- Enemy bullets: 0
- Player shots: 5
- Losses: 1
- Clears: 1
- Collision losses: 1
- Special attack count: 1
- Boss damage count: 1
- Boss kill count: 1
- Escort dive kill count: 1
- First loss: `{"t":1.7,"stageClock":1.7,"cause":"enemy_collision","sourceType":"but","sourceDive":1,"sourceAttackMode":"escort","playerLane":5,"sourceLane":5,"sourceColumn":2,"recentAttackStarts":3,"recentEnemyBullets":0}`

### late-run-escort-variant
- Scenario: `stage14-escort-variant`
- OK: yes
- Score: 970
- Lives: 4
- Attacks: 11
- Enemy bullets: 11
- Player shots: 31
- Losses: 1
- Clears: 0
- Collision losses: 1
- Special attack count: 0
- Boss damage count: 2
- Boss kill count: 1
- Escort dive kill count: 1
- First loss: `{"t":5.367,"stageClock":5.367,"cause":"enemy_collision","sourceType":"but","sourceDive":1,"sourceAttackMode":"dive","playerLane":8,"sourceLane":8,"sourceColumn":9,"recentAttackStarts":2,"recentEnemyBullets":4}`

### late-run-escort-reward-best-route
- Scenario: `stage14-escort-reward-best-route`
- OK: yes
- Score: 6240
- Lives: 1
- Attacks: 22
- Enemy bullets: 14
- Player shots: 63
- Losses: 4
- Clears: 0
- Collision losses: 2
- Special attack count: 3
- Boss damage count: 4
- Boss kill count: 4
- Escort dive kill count: 6
- First loss: `{"t":3.327,"stageClock":3.327,"cause":"enemy_bullet","sourceType":"boss","sourceDive":0,"sourceAttackMode":null,"playerLane":5,"sourceLane":5,"sourceColumn":null,"recentAttackStarts":4,"recentEnemyBullets":2}`

### late-run-natural-escort-reward
- Scenario: `stage14-natural-escort-reward`
- OK: yes
- Score: 3240
- Lives: 4
- Attacks: 27
- Enemy bullets: 16
- Player shots: 74
- Losses: 1
- Clears: 0
- Collision losses: 0
- Special attack count: 2
- Boss damage count: 3
- Boss kill count: 3
- Escort dive kill count: 5
- First loss: `{"t":4.833,"stageClock":4.833,"cause":"enemy_bullet","sourceType":"bee","sourceDive":0,"sourceAttackMode":null,"playerLane":3,"sourceLane":4,"sourceColumn":null,"recentAttackStarts":5,"recentEnemyBullets":1}`
