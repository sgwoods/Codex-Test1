# Aurora Stage 4 Lane-2 Action Precision

Generated: `2026-05-07T21:05:42.535Z`

## Problem

The archived Stage 4 lane-2 butterfly body-contact loss has a known source attacker and key-event timing, but the committed fresh replay keeps that attacker high in formation.

## Strategy

Replay the committed scenario, source-exact key timings, and final-turn timing variants under controlled clock. For each run, sample player lane, column-5 butterfly state, nearby lane threats, attack events, and collision margins around the source loss window.

## Success Measure

If source-exact timing makes the column-5 butterfly dive into the player band, harness scenario precision is the first fix. If not, the next gameplay change should be a bounded Stage 4 attacker-scheduling adjustment.

## Results

### current-scenario
- Source-column dive frames: 0/87
- Source-column lower-field frames: 0/87
- Best source-column contact: 289.765 at t=14.3
- Best lane-threat contact: 83.8 at t=14.7
- Diagnosis: source column-5 butterfly remains in formation; this is an attacker scheduling gap more than an input precision gap

### source-exact-events
- Source-column dive frames: 0/87
- Source-column lower-field frames: 0/87
- Best source-column contact: 289.765 at t=14.3
- Best lane-threat contact: 83.8 at t=14.7
- Diagnosis: source column-5 butterfly remains in formation; this is an attacker scheduling gap more than an input precision gap

### source-exact-final-turn-minus-one-frame
- Source-column dive frames: 0/86
- Source-column lower-field frames: 0/86
- Best source-column contact: 289.765 at t=14.3
- Best lane-threat contact: 83.8 at t=14.7
- Diagnosis: source column-5 butterfly remains in formation; this is an attacker scheduling gap more than an input precision gap

### source-exact-final-turn-plus-one-frame
- Source-column dive frames: 0/86
- Source-column lower-field frames: 0/86
- Best source-column contact: 289.765 at t=14.3
- Best lane-threat contact: 83.8 at t=14.7
- Diagnosis: source column-5 butterfly remains in formation; this is an attacker scheduling gap more than an input precision gap

### source-exact-final-turn-2-frames-earlier
- Source-column dive frames: 0/86
- Source-column lower-field frames: 0/86
- Best source-column contact: 289.765 at t=14.3
- Best lane-threat contact: 83.8 at t=14.7
- Diagnosis: source column-5 butterfly remains in formation; this is an attacker scheduling gap more than an input precision gap

### source-exact-final-turn-3-frames-earlier
- Source-column dive frames: 0/87
- Source-column lower-field frames: 0/87
- Best source-column contact: 289.765 at t=14.3
- Best lane-threat contact: 83.8 at t=14.7
- Diagnosis: source column-5 butterfly remains in formation; this is an attacker scheduling gap more than an input precision gap

### source-exact-final-turn-3p5-frames-earlier
- Source-column dive frames: 0/86
- Source-column lower-field frames: 0/86
- Best source-column contact: 289.765 at t=14.3
- Best lane-threat contact: 83.8 at t=14.7
- Diagnosis: source column-5 butterfly remains in formation; this is an attacker scheduling gap more than an input precision gap

### source-exact-final-turn-4-frames-earlier
- Source-column dive frames: 0/86
- Source-column lower-field frames: 0/86
- Best source-column contact: 289.765 at t=14.3
- Best lane-threat contact: 83.8 at t=14.7
- Diagnosis: source column-5 butterfly remains in formation; this is an attacker scheduling gap more than an input precision gap

### source-exact-final-turn-4p25-frames-earlier
- Source-column dive frames: 0/86
- Source-column lower-field frames: 0/86
- Best source-column contact: 289.765 at t=14.3
- Best lane-threat contact: 83.8 at t=14.7
- Diagnosis: source column-5 butterfly remains in formation; this is an attacker scheduling gap more than an input precision gap

### source-exact-final-turn-4p5-frames-earlier
- Source-column dive frames: 0/86
- Source-column lower-field frames: 0/86
- Best source-column contact: 289.765 at t=14.3
- Best lane-threat contact: 83.8 at t=14.7
- Diagnosis: source column-5 butterfly remains in formation; this is an attacker scheduling gap more than an input precision gap

### source-exact-final-turn-4p75-frames-earlier
- Source-column dive frames: 0/86
- Source-column lower-field frames: 0/86
- Best source-column contact: 289.765 at t=14.3
- Best lane-threat contact: 83.8 at t=14.7
- Diagnosis: source column-5 butterfly remains in formation; this is an attacker scheduling gap more than an input precision gap

### source-exact-final-turn-5-frames-earlier
- Source-column dive frames: 0/86
- Source-column lower-field frames: 0/86
- Best source-column contact: 289.765 at t=14.3
- Best lane-threat contact: 83.8 at t=14.7
- Diagnosis: source column-5 butterfly remains in formation; this is an attacker scheduling gap more than an input precision gap

### source-exact-final-turn-5p5-frames-earlier
- Source-column dive frames: 0/86
- Source-column lower-field frames: 0/86
- Best source-column contact: 289.765 at t=14.3
- Best lane-threat contact: 83.8 at t=14.7
- Diagnosis: source column-5 butterfly remains in formation; this is an attacker scheduling gap more than an input precision gap

### source-exact-final-turn-6-frames-earlier
- Source-column dive frames: 0/87
- Source-column lower-field frames: 0/87
- Best source-column contact: 289.765 at t=14.3
- Best lane-threat contact: 83.8 at t=14.7
- Diagnosis: source column-5 butterfly remains in formation; this is an attacker scheduling gap more than an input precision gap

### source-exact-cooldown-only-12p8
- Scheduling probe: `{"mode":"cooldown-only","start":12.8,"end":15.1,"maxCool":0}`
- Source-column dive frames: 74/177
- Source-column lower-field frames: 0/177
- Best source-column contact: 109.425 at t=15.7
- Best lane-threat contact: n/a at t=n/a
- Diagnosis: source column-5 butterfly started a dive but never reached the player band; dive velocity/timing is the next likely gap

### source-exact-cooldown-only-13p2
- Scheduling probe: `{"mode":"cooldown-only","start":13.2,"end":15.1,"maxCool":0}`
- Source-column dive frames: 0/153
- Source-column lower-field frames: 0/153
- Best source-column contact: 288.005 at t=13.2
- Best lane-threat contact: 83.8 at t=14.7
- Diagnosis: source column-5 butterfly remains in formation; this is an attacker scheduling gap more than an input precision gap

### source-exact-cooldown-only-13p6
- Scheduling probe: `{"mode":"cooldown-only","start":13.6,"end":15.1,"maxCool":0}`
- Source-column dive frames: 0/129
- Source-column lower-field frames: 0/129
- Best source-column contact: 288.245 at t=13.6
- Best lane-threat contact: 83.8 at t=14.7
- Diagnosis: source column-5 butterfly remains in formation; this is an attacker scheduling gap more than an input precision gap

### source-exact-cooldown-gap-13p2
- Scheduling probe: `{"mode":"cooldown-gap","start":13.2,"end":15.1,"maxCool":0,"maxGap":0}`
- Source-column dive frames: 0/153
- Source-column lower-field frames: 0/153
- Best source-column contact: 288.005 at t=13.2
- Best lane-threat contact: 7.95 at t=14.867
- Diagnosis: input timing preserves nearby Stage 4 pressure, but the archived source attacker is not scheduled to dive

### source-exact-cooldown-gap-13p6
- Scheduling probe: `{"mode":"cooldown-gap","start":13.6,"end":15.1,"maxCool":0,"maxGap":0}`
- Source-column dive frames: 0/129
- Source-column lower-field frames: 0/129
- Best source-column contact: 288.245 at t=13.6
- Best lane-threat contact: 36.08 at t=15.183
- Diagnosis: source column-5 butterfly remains in formation; this is an attacker scheduling gap more than an input precision gap

### source-exact-cooldown-gap-recover-13p2
- Scheduling probe: `{"mode":"cooldown-gap-recover","start":13.2,"end":15.1,"maxCool":0,"maxGap":0,"maxRecover":0}`
- Source-column dive frames: 0/153
- Source-column lower-field frames: 0/153
- Best source-column contact: 288.005 at t=13.2
- Best lane-threat contact: 7.95 at t=14.867
- Diagnosis: input timing preserves nearby Stage 4 pressure, but the archived source attacker is not scheduled to dive

### source-exact-cooldown-rate4-13p2
- Scheduling probe: `{"mode":"cooldown-rate","start":13.2,"end":15.1,"maxCool":0,"diveRateBoost":4}`
- Source-column dive frames: 0/153
- Source-column lower-field frames: 0/153
- Best source-column contact: 288.005 at t=13.2
- Best lane-threat contact: 83.8 at t=14.7
- Diagnosis: source column-5 butterfly remains in formation; this is an attacker scheduling gap more than an input precision gap

### source-exact-cooldown-rate8-13p2
- Scheduling probe: `{"mode":"cooldown-rate","start":13.2,"end":15.1,"maxCool":0,"diveRateBoost":8}`
- Source-column dive frames: 0/153
- Source-column lower-field frames: 0/153
- Best source-column contact: 288.005 at t=13.2
- Best lane-threat contact: 83.8 at t=14.7
- Diagnosis: source column-5 butterfly remains in formation; this is an attacker scheduling gap more than an input precision gap

### source-exact-cooldown-rate16-13p2
- Scheduling probe: `{"mode":"cooldown-rate","start":13.2,"end":15.1,"maxCool":0,"diveRateBoost":16}`
- Source-column dive frames: 0/153
- Source-column lower-field frames: 0/153
- Best source-column contact: 288.005 at t=13.2
- Best lane-threat contact: 83.8 at t=14.7
- Diagnosis: source column-5 butterfly remains in formation; this is an attacker scheduling gap more than an input precision gap

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
- Source-column dive frames: 113/114
- Source-column lower-field frames: 33/114
- Best source-column contact: 4.53 at t=15.266
- Best lane-threat contact: 4.53 at t=15.266
- Diagnosis: source column-5 butterfly entered the lower field; action timing may be sufficient and collision/lane drift should be inspected next

## Recommended Next Step

- Add a bounded Stage 4 column-5 butterfly scheduling cue or cool-down bias, then rerun this action-precision artifact before claiming gameplay conformance gain.

