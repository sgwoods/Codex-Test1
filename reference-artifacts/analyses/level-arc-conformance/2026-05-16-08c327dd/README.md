# Level Arc And Encounter Shape Conformance

This artifact scores whether Aurora changes shape over a long run in a Galaga-like way, instead of merely repeating a strong early-stage loop.

- Score: 8.8/10
- Priority: high
- Stage families blueprinted: 6/6
- Challenge-stage content layers blueprinted: 3/3
- Evidence windows present: 11/6
- Strongest submetric: Stage distinctiveness (10/10)
- Weakest submetric: Long-run non-repetition (6/10)

## Submetrics

### Stage distinctiveness
- Score: 10/10
- Read: 6/6 stage families are blueprinted and 11/6 target evidence windows are present; stage-signature distinct pair ratio is 1.

### Challenge-stage identity
- Score: 9.3/10
- Read: 5/5 challenge timing checks pass and 3/3 content layers are blueprinted; opportunity-window readiness is 7.8/10.

### Movement grammar expansion
- Score: 10/10
- Read: Later-level entry, escort, regrouping, and challenge-path grammar is planned; the stage-signature distance score is 10/10.

### Pressure curve over time
- Score: 7.5/10
- Read: 3/3 source pressure/loss windows are found, but 0 reproduce as exact losses under replay. Pressure-collision replay diagnostics classify 0 as same-window or exact collision pressure.

### Boss and reward opportunity design
- Score: 8.1/10
- Read: 3/3 capture/rescue scenarios match; level-arc opportunity windows show mean reward/opportunity signal 3.8/10.

### Boss entry and formation grammar
- Score: 9.3/10
- Read: Boss/formation grammar scores 9.4/10; weakest metric is Path shape and set-formation precision (8.2/10).

### Learning and mastery windows
- Score: 8.8/10
- Read: 19/20 persona checks pass; progression ordering is not fully preserved.

### Long-run non-repetition
- Score: 6/10
- Read: Stage-signature repetition risk is 0; closest pair is late-run-crown-entry / late-run-escort-variant.

## Next Recommended Work

- improve Stage 4 pressure replay precision so source loss windows reproduce as exact deterministic windows
- preserve stage-8 flank and stage-14 escort grammar while adding the next measured challenge/reward slice
- advance boss/formation grammar by targeting Path shape and set-formation precision: 680 tracks classified into path families; expected family coverage 1; accepted Galaga labels 6 regular / 4 challenge; trajectory-vector/rack score 5.5/10 (reference-trajectory-vector-comparison-active-no-cap-lift); cap 8.2/10 (media-backed-reference-label-cap).
- mid-run-entry-variant and mid-run-pressure are too similar by computed gameplay signature distance (0.106). Strategy: Use the feature trace to add one distinct movement/reward grammar to the weaker window, then rerun stage-signature distance.
- implement one challenge-stage movement and reward slice with clear perfect/near-perfect feedback

