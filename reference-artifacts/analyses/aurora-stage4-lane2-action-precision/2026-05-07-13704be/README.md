# Aurora Stage 4 Lane-2 Action Precision

Generated: `2026-05-07T20:50:21.021Z`

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

## Recommended Next Step

- Add a bounded Stage 4 column-5 butterfly scheduling cue or cool-down bias, then rerun this action-precision artifact before claiming gameplay conformance gain.
