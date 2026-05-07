# Aurora Stage 4 Lane-2 Action Precision

Generated: `2026-05-07T21:38:08.817Z`

## Problem

The archived Stage 4 lane-2 butterfly body-contact loss has a known source attacker and key-event timing, but the committed fresh replay keeps that attacker high in formation.

## Strategy

Replay the committed scenario, source-exact key timings, and final-turn timing variants under controlled clock. For each run, sample player lane, column-5 butterfly state, nearby lane threats, attack events, and collision margins around the source loss window.

## Success Measure

If source-exact timing makes the column-5 butterfly dive into the player band, harness scenario precision is the first fix. If not, the next gameplay change should be a bounded Stage 4 attacker-scheduling adjustment.

## Results

### current-scenario
- Source-column dive frames: 87/87
- Source-column lower-field frames: 33/87
- Best source-column contact: 1.97 at t=15.283
- Best lane-threat contact: 1.97 at t=15.283
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-events
- Source-column dive frames: 87/87
- Source-column lower-field frames: 33/87
- Best source-column contact: 1.97 at t=15.283
- Best lane-threat contact: 1.97 at t=15.283
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-final-turn-minus-one-frame
- Source-column dive frames: 59/86
- Source-column lower-field frames: 24/86
- Best source-column contact: 3.34 at t=15.266
- Best lane-threat contact: 3.34 at t=15.266
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-final-turn-plus-one-frame
- Source-column dive frames: 86/86
- Source-column lower-field frames: 33/86
- Best source-column contact: 4.97 at t=15.3
- Best lane-threat contact: 4.97 at t=15.3
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-final-turn-2-frames-earlier
- Source-column dive frames: 59/86
- Source-column lower-field frames: 24/86
- Best source-column contact: 4.64 at t=15.25
- Best lane-threat contact: 4.64 at t=15.25
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-final-turn-3-frames-earlier
- Source-column dive frames: 59/87
- Source-column lower-field frames: 24/87
- Best source-column contact: 0.65 at t=15.25
- Best lane-threat contact: 0.65 at t=15.25
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-final-turn-3p5-frames-earlier
- Source-column dive frames: 58/86
- Source-column lower-field frames: 23/86
- Best source-column contact: 1.3 at t=15.242
- Best lane-threat contact: 1.3 at t=15.242
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-final-turn-4-frames-earlier
- Source-column dive frames: 57/86
- Source-column lower-field frames: 22/86
- Best source-column contact: 2.04 at t=15.233
- Best lane-threat contact: 2.04 at t=15.233
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-final-turn-4p25-frames-earlier
- Source-column dive frames: 57/86
- Source-column lower-field frames: 22/86
- Best source-column contact: 2.37 at t=15.229
- Best lane-threat contact: 2.37 at t=15.229
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-final-turn-4p5-frames-earlier
- Source-column dive frames: 57/86
- Source-column lower-field frames: 22/86
- Best source-column contact: 2.7 at t=15.225
- Best lane-threat contact: 2.7 at t=15.225
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-final-turn-4p75-frames-earlier
- Source-column dive frames: 57/86
- Source-column lower-field frames: 22/86
- Best source-column contact: 3.56 at t=15.221
- Best lane-threat contact: 3.56 at t=15.221
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-final-turn-5-frames-earlier
- Source-column dive frames: 57/86
- Source-column lower-field frames: 22/86
- Best source-column contact: 4.86 at t=15.217
- Best lane-threat contact: 4.86 at t=15.217
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-final-turn-5p5-frames-earlier
- Source-column dive frames: 57/86
- Source-column lower-field frames: 22/86
- Best source-column contact: 2.36 at t=15.224
- Best lane-threat contact: 2.36 at t=15.224
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-final-turn-6-frames-earlier
- Source-column dive frames: 57/87
- Source-column lower-field frames: 22/87
- Best source-column contact: 4.96 at t=15.216
- Best lane-threat contact: 4.96 at t=15.216
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-cooldown-only-12p8
- Scheduling probe: `{"mode":"cooldown-only","start":12.8,"end":15.1,"maxCool":0}`
- Source-column dive frames: 81/177
- Source-column lower-field frames: 23/177
- Best source-column contact: 2.32 at t=15.166
- Best lane-threat contact: 2.32 at t=15.166
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-cooldown-only-13p2
- Scheduling probe: `{"mode":"cooldown-only","start":13.2,"end":15.1,"maxCool":0}`
- Source-column dive frames: 83/153
- Source-column lower-field frames: 22/153
- Best source-column contact: 4.87 at t=15.2
- Best lane-threat contact: 4.87 at t=15.2
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-cooldown-only-13p6
- Scheduling probe: `{"mode":"cooldown-only","start":13.6,"end":15.1,"maxCool":0}`
- Source-column dive frames: 84/129
- Source-column lower-field frames: 23/129
- Best source-column contact: 2.52 at t=15.216
- Best lane-threat contact: 2.52 at t=15.216
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-cooldown-gap-13p2
- Scheduling probe: `{"mode":"cooldown-gap","start":13.2,"end":15.1,"maxCool":0,"maxGap":0}`
- Source-column dive frames: 114/153
- Source-column lower-field frames: 33/153
- Best source-column contact: 0.84 at t=15.2
- Best lane-threat contact: 0.84 at t=15.2
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-cooldown-gap-13p6
- Scheduling probe: `{"mode":"cooldown-gap","start":13.6,"end":15.1,"maxCool":0,"maxGap":0}`
- Source-column dive frames: 87/129
- Source-column lower-field frames: 25/129
- Best source-column contact: 2.47 at t=15.266
- Best lane-threat contact: 1.23 at t=15.416
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-cooldown-gap-recover-13p2
- Scheduling probe: `{"mode":"cooldown-gap-recover","start":13.2,"end":15.1,"maxCool":0,"maxGap":0,"maxRecover":0}`
- Source-column dive frames: 114/153
- Source-column lower-field frames: 33/153
- Best source-column contact: 0.84 at t=15.2
- Best lane-threat contact: 0.84 at t=15.2
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-cooldown-rate4-13p2
- Scheduling probe: `{"mode":"cooldown-rate","start":13.2,"end":15.1,"maxCool":0,"diveRateBoost":4}`
- Source-column dive frames: 83/153
- Source-column lower-field frames: 22/153
- Best source-column contact: 4.87 at t=15.2
- Best lane-threat contact: 4.87 at t=15.2
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-cooldown-rate8-13p2
- Scheduling probe: `{"mode":"cooldown-rate","start":13.2,"end":15.1,"maxCool":0,"diveRateBoost":8}`
- Source-column dive frames: 83/153
- Source-column lower-field frames: 22/153
- Best source-column contact: 4.87 at t=15.2
- Best lane-threat contact: 4.87 at t=15.2
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-cooldown-rate16-13p2
- Scheduling probe: `{"mode":"cooldown-rate","start":13.2,"end":15.1,"maxCool":0,"diveRateBoost":16}`
- Source-column dive frames: 83/153
- Source-column lower-field frames: 22/153
- Best source-column contact: 4.87 at t=15.2
- Best lane-threat contact: 4.87 at t=15.2
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-cooldown-rate8-gap-13p2
- Scheduling probe: `{"mode":"cooldown-rate-gap","start":13.2,"end":15.1,"maxCool":0,"diveRateBoost":8,"maxGap":0}`
- Source-column dive frames: 145/153
- Source-column lower-field frames: 32/153
- Best source-column contact: 46.37 at t=14.85
- Best lane-threat contact: 46.37 at t=14.85
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-priority-13p2
- Scheduling probe: `{"mode":"priority","start":13.2,"end":13.35,"maxCool":0}`
- Source-column dive frames: 152/153
- Source-column lower-field frames: 32/153
- Best source-column contact: 7.41 at t=14.633
- Best lane-threat contact: 7.41 at t=14.633
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-priority-13p6
- Scheduling probe: `{"mode":"priority","start":13.6,"end":13.75,"maxCool":0}`
- Source-column dive frames: 128/129
- Source-column lower-field frames: 33/129
- Best source-column contact: 15.6 at t=15.083
- Best lane-threat contact: 15.6 at t=15.083
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-priority-13p85
- Scheduling probe: `{"mode":"priority","start":13.85,"end":14,"maxCool":0}`
- Source-column dive frames: 114/114
- Source-column lower-field frames: 33/114
- Best source-column contact: 4.78 at t=15.283
- Best lane-threat contact: 4.78 at t=15.283
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

## Recommended Next Step

- Test calibrated timing variant `source-exact-final-turn-3-frames-earlier` in the committed lane-2 scenario; it is the closest measured geometry but still needs replay-loss confirmation.

