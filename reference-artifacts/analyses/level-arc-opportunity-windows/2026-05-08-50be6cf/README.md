# Level Arc Opportunity Windows

This artifact turns Aurora level-expansion evidence into ranked, measurable work items. It is meant to reduce subjective gameplay tuning by pointing to the next window where computation says conformance value is likely.

- Score: 4.5/10
- Windows: 6
- Full coverage windows: 1/6
- Mean pressure index: 4.8/10
- Mean reward index: 2.1/10
- Mean identity index: 5.7/10
- Outcome reward windows: 1
- Outcome special reward bonus: 1600
- Highest priority opportunity: late-run-cleanup-or-failure-late-reward-thinness

## Problem

Aurora needs a Galaga-like level arc: stages should become more distinct, reward-bearing, and learnable over time rather than repeating a similar pressure loop.

## Strategy

Compute opportunity windows from deterministic evidence by combining event-family coverage, pressure shape, reward signal, identity signal, and stage-signature distance before choosing a gameplay change.

## Success Measure

Future work should raise the opportunity-window score, reduce missing event families, increase closest regular-stage signature distance, and improve level-arc score without hiding Stage 4 exact replay gaps.

## Ranked Opportunities

### late-run-cleanup-or-failure-late-reward-thinness
- Priority: high
- Window: late-run-cleanup-or-failure
- Score: 8.7
- Problem: late-run-cleanup-or-failure has late-stage pressure evidence but low reward/opportunity signal (1.3/10).
- Strategy: Measure boss/escort score opportunities, hit-before-loss events, and clear/failure outcomes; then add one visible late-stage reward window rather than increasing raw attack density.
- Success measure: Reward index reaches 5+/10 while pressure index does not increase by more than 1 point unless survival evidence also improves.

### late-run-cleanup-or-failure-missing-event-coverage
- Priority: high
- Window: late-run-cleanup-or-failure
- Score: 8
- Problem: late-run-cleanup-or-failure does not yet observe wave_clear, game_over.
- Strategy: Add or widen deterministic evidence windows before gameplay tuning so the harness can distinguish missing behavior from absent conformance.
- Success measure: The same window reports full planned event-family coverage and level-arc identity/readiness scores rise without weakening survival checks.

### late-run-escort-variant-missing-event-coverage
- Priority: high
- Window: late-run-escort-variant
- Score: 8
- Problem: late-run-escort-variant does not yet observe wave_clear, game_over.
- Strategy: Add or widen deterministic evidence windows before gameplay tuning so the harness can distinguish missing behavior from absent conformance.
- Success measure: The same window reports full planned event-family coverage and level-arc identity/readiness scores rise without weakening survival checks.

### mid-run-entry-variant-missing-event-coverage
- Priority: high
- Window: mid-run-entry-variant
- Score: 8
- Problem: mid-run-entry-variant does not yet observe escort_dive_start, wave_clear.
- Strategy: Add or widen deterministic evidence windows before gameplay tuning so the harness can distinguish missing behavior from absent conformance.
- Success measure: The same window reports full planned event-family coverage and level-arc identity/readiness scores rise without weakening survival checks.

### mid-run-pressure-missing-event-coverage
- Priority: high
- Window: mid-run-pressure
- Score: 8
- Problem: mid-run-pressure does not yet observe flank_dive_start, wave_clear.
- Strategy: Add or widen deterministic evidence windows before gameplay tuning so the harness can distinguish missing behavior from absent conformance.
- Success measure: The same window reports full planned event-family coverage and level-arc identity/readiness scores rise without weakening survival checks.

### stage-1-baseline-missing-event-coverage
- Priority: high
- Window: stage-1-baseline
- Score: 8
- Problem: stage-1-baseline does not yet observe player_shot, wave_clear.
- Strategy: Add or widen deterministic evidence windows before gameplay tuning so the harness can distinguish missing behavior from absent conformance.
- Success measure: The same window reports full planned event-family coverage and level-arc identity/readiness scores rise without weakening survival checks.

### late-run-escort-variant-late-reward-thinness
- Priority: high
- Window: late-run-escort-variant
- Score: 7.3
- Problem: late-run-escort-variant has late-stage pressure evidence but low reward/opportunity signal (2.7/10).
- Strategy: Measure boss/escort score opportunities, hit-before-loss events, and clear/failure outcomes; then add one visible late-stage reward window rather than increasing raw attack density.
- Success measure: Reward index reaches 5+/10 while pressure index does not increase by more than 1 point unless survival evidence also improves.

### closest-regular-stage-signature-gap
- Priority: high
- Window: late-run-cleanup-or-failure/late-run-escort-variant
- Score: 1.5
- Problem: late-run-cleanup-or-failure and late-run-escort-variant are too similar by computed gameplay signature distance (0.136).
- Strategy: Use the feature trace to add one distinct movement/reward grammar to the weaker window, then rerun stage-signature distance.
- Success measure: Closest regular pair distance rises above 0.16 and signatureScore10 improves without increasing exact pressure-loss regressions.

## Window Reads

| Window | Stage | Pressure | Reward | Identity | Missing Families |
| --- | ---: | ---: | ---: | ---: | --- |
| challenge-stage-candidate | 3 challenge | 2 | 6.7 | 8.6 | none |
| late-run-cleanup-or-failure | 12 | 6.6 | 1.3 | 4.8 | wave_clear, game_over |
| late-run-escort-variant | 14 | 6.7 | 2.7 | 5.1 | wave_clear, game_over |
| mid-run-entry-variant | 8 | 4.4 | 0.6 | 5.1 | escort_dive_start, wave_clear |
| mid-run-pressure | 6 | 6.8 | 1.2 | 5.8 | flank_dive_start, wave_clear |
| stage-1-baseline | 1 | 2.4 | 0 | 4.9 | player_shot, wave_clear |

## Pressure Curve

- stage-1-baseline -> mid-run-pressure: +4.4
- mid-run-pressure -> mid-run-entry-variant: -2.4
- mid-run-entry-variant -> late-run-cleanup-or-failure: +2.2
- late-run-cleanup-or-failure -> late-run-escort-variant: +0.1

