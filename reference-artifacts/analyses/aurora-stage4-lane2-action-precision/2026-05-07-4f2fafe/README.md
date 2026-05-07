# Aurora Stage 4 Lane-2 Action Precision

Generated: `2026-05-07T21:36:21.902Z`

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
- Best source-column contact: 20.38 at t=15.333
- Best lane-threat contact: 20.38 at t=15.333
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-events
- Source-column dive frames: 87/87
- Source-column lower-field frames: 33/87
- Best source-column contact: 20.38 at t=15.333
- Best lane-threat contact: 20.38 at t=15.333
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-final-turn-minus-one-frame
- Source-column dive frames: 86/86
- Source-column lower-field frames: 32/86
- Best source-column contact: 18.38 at t=15.316
- Best lane-threat contact: 18.38 at t=15.316
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-final-turn-plus-one-frame
- Source-column dive frames: 86/86
- Source-column lower-field frames: 33/86
- Best source-column contact: 21.46 at t=15.333
- Best lane-threat contact: 21.46 at t=15.333
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-final-turn-2-frames-earlier
- Source-column dive frames: 86/86
- Source-column lower-field frames: 33/86
- Best source-column contact: 14.71 at t=15.317
- Best lane-threat contact: 14.71 at t=15.317
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-final-turn-3-frames-earlier
- Source-column dive frames: 87/87
- Source-column lower-field frames: 33/87
- Best source-column contact: 14.59 at t=15.316
- Best lane-threat contact: 14.59 at t=15.316
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-final-turn-3p5-frames-earlier
- Source-column dive frames: 86/86
- Source-column lower-field frames: 32/86
- Best source-column contact: 11.83 at t=15.308
- Best lane-threat contact: 11.83 at t=15.308
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-final-turn-4-frames-earlier
- Source-column dive frames: 86/86
- Source-column lower-field frames: 32/86
- Best source-column contact: 11.17 at t=15.299
- Best lane-threat contact: 11.17 at t=15.299
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-final-turn-4p25-frames-earlier
- Source-column dive frames: 86/86
- Source-column lower-field frames: 32/86
- Best source-column contact: 11.41 at t=15.295
- Best lane-threat contact: 11.41 at t=15.295
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-final-turn-4p5-frames-earlier
- Source-column dive frames: 86/86
- Source-column lower-field frames: 33/86
- Best source-column contact: 11.64 at t=15.291
- Best lane-threat contact: 11.64 at t=15.291
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-final-turn-4p75-frames-earlier
- Source-column dive frames: 86/86
- Source-column lower-field frames: 33/86
- Best source-column contact: 10.34 at t=15.304
- Best lane-threat contact: 10.34 at t=15.304
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-final-turn-5-frames-earlier
- Source-column dive frames: 86/86
- Source-column lower-field frames: 33/86
- Best source-column contact: 8.96 at t=15.3
- Best lane-threat contact: 8.96 at t=15.3
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-final-turn-5p5-frames-earlier
- Source-column dive frames: 86/86
- Source-column lower-field frames: 33/86
- Best source-column contact: 6.92 at t=15.291
- Best lane-threat contact: 6.92 at t=15.291
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-final-turn-6-frames-earlier
- Source-column dive frames: 87/87
- Source-column lower-field frames: 33/87
- Best source-column contact: 6.24 at t=15.283
- Best lane-threat contact: 6.24 at t=15.283
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-cooldown-only-12p8
- Scheduling probe: `{"mode":"cooldown-only","start":12.8,"end":15.1,"maxCool":0}`
- Source-column dive frames: 114/177
- Source-column lower-field frames: 33/177
- Best source-column contact: 39.87 at t=15.35
- Best lane-threat contact: n/a at t=n/a
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-cooldown-only-13p2
- Scheduling probe: `{"mode":"cooldown-only","start":13.2,"end":15.1,"maxCool":0}`
- Source-column dive frames: 114/153
- Source-column lower-field frames: 33/153
- Best source-column contact: 24.74 at t=15.316
- Best lane-threat contact: 24.74 at t=15.316
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-cooldown-only-13p6
- Scheduling probe: `{"mode":"cooldown-only","start":13.6,"end":15.1,"maxCool":0}`
- Source-column dive frames: 114/129
- Source-column lower-field frames: 33/129
- Best source-column contact: 15.91 at t=15.316
- Best lane-threat contact: 15.91 at t=15.316
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-cooldown-gap-13p2
- Scheduling probe: `{"mode":"cooldown-gap","start":13.2,"end":15.1,"maxCool":0,"maxGap":0}`
- Source-column dive frames: 114/153
- Source-column lower-field frames: 34/153
- Best source-column contact: 15.79 at t=15.366
- Best lane-threat contact: 7.95 at t=14.867
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-cooldown-gap-13p6
- Scheduling probe: `{"mode":"cooldown-gap","start":13.6,"end":15.1,"maxCool":0,"maxGap":0}`
- Source-column dive frames: 90/129
- Source-column lower-field frames: 25/129
- Best source-column contact: 0.85 at t=15.316
- Best lane-threat contact: 0.85 at t=15.316
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-cooldown-gap-recover-13p2
- Scheduling probe: `{"mode":"cooldown-gap-recover","start":13.2,"end":15.1,"maxCool":0,"maxGap":0,"maxRecover":0}`
- Source-column dive frames: 114/153
- Source-column lower-field frames: 34/153
- Best source-column contact: 16.19 at t=15.366
- Best lane-threat contact: 7.95 at t=14.867
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-cooldown-rate4-13p2
- Scheduling probe: `{"mode":"cooldown-rate","start":13.2,"end":15.1,"maxCool":0,"diveRateBoost":4}`
- Source-column dive frames: 114/153
- Source-column lower-field frames: 33/153
- Best source-column contact: 24.74 at t=15.316
- Best lane-threat contact: 24.74 at t=15.316
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-cooldown-rate8-13p2
- Scheduling probe: `{"mode":"cooldown-rate","start":13.2,"end":15.1,"maxCool":0,"diveRateBoost":8}`
- Source-column dive frames: 114/153
- Source-column lower-field frames: 33/153
- Best source-column contact: 24.74 at t=15.316
- Best lane-threat contact: 24.74 at t=15.316
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

### source-exact-cooldown-rate16-13p2
- Scheduling probe: `{"mode":"cooldown-rate","start":13.2,"end":15.1,"maxCool":0,"diveRateBoost":16}`
- Source-column dive frames: 114/153
- Source-column lower-field frames: 33/153
- Best source-column contact: 24.74 at t=15.316
- Best lane-threat contact: 24.74 at t=15.316
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
- Best source-column contact: 21.68 at t=15.316
- Best lane-threat contact: 21.68 at t=15.316
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

## Recommended Next Step

- Test calibrated timing variant `source-exact-cooldown-gap-13p6` in the committed lane-2 scenario; it is the closest measured geometry but still needs replay-loss confirmation.

