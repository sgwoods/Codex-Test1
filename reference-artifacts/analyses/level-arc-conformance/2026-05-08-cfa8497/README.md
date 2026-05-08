# Level Arc And Encounter Shape Conformance

This artifact scores whether Aurora changes shape over a long run in a Galaga-like way, instead of merely repeating a strong early-stage loop.

- Score: 8.5/10
- Priority: high
- Stage families blueprinted: 6/6
- Challenge-stage content layers blueprinted: 3/3
- Evidence windows present: 6/6
- Strongest submetric: Challenge-stage identity (9/10)
- Weakest submetric: Pressure curve over time (7.5/10)

## Submetrics

### Stage distinctiveness
- Score: 8.4/10
- Read: 6/6 stage families are blueprinted and 6/6 target evidence windows are present; stage-signature distinct pair ratio is 0.467.

### Challenge-stage identity
- Score: 9/10
- Read: 5/5 challenge timing checks pass and 3/3 content layers are blueprinted; opportunity-window readiness is 6.7/10.

### Movement grammar expansion
- Score: 8.7/10
- Read: Later-level entry, escort, regrouping, and challenge-path grammar is planned; the stage-signature distance score is 6.8/10.

### Pressure curve over time
- Score: 7.5/10
- Read: 3/3 source pressure/loss windows are found, but 0 reproduce as exact losses under replay. Pressure-collision replay diagnostics classify 0 as same-window or exact collision pressure.

### Boss and reward opportunity design
- Score: 8.1/10
- Read: 3/3 capture/rescue scenarios match; level-arc opportunity windows show mean reward/opportunity signal 3.4/10.

### Learning and mastery windows
- Score: 9/10
- Read: 20/20 persona checks pass; progression ordering is not fully preserved.

### Long-run non-repetition
- Score: 8.5/10
- Read: Stage-signature repetition risk is 0.382; closest pair is late-run-cleanup-or-failure / late-run-escort-variant.

## Next Recommended Work

- improve Stage 4 pressure replay precision so source loss windows reproduce as exact deterministic windows
- preserve stage-8 flank and stage-14 escort grammar while adding the next measured challenge/reward slice
- stage-1-baseline does not yet observe player_shot, wave_clear. Strategy: Add or widen deterministic evidence windows before gameplay tuning so the harness can distinguish missing behavior from absent conformance.
- implement one challenge-stage movement and reward slice with clear perfect/near-perfect feedback

