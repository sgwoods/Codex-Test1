# Level Arc Opportunity Windows

This artifact turns Aurora level-expansion evidence into ranked, measurable work items. It is meant to reduce subjective gameplay tuning by pointing to the next window where computation says conformance value is likely.

- Score: 7.8/10
- Windows: 6
- Full coverage windows: 6/6
- Mean pressure index: 5.2/10
- Mean reward index: 3.8/10
- Mean identity index: 7.5/10
- Skill-route reward windows: 4
- Outcome reward windows: 5
- Outcome special reward bonus: 14400
- Highest priority opportunity: closest-regular-stage-signature-gap

## Problem

Aurora needs a Galaga-like level arc: stages should become more distinct, reward-bearing, and learnable over time rather than repeating a similar pressure loop.

## Strategy

Compute opportunity windows from deterministic evidence by combining event-family coverage, pressure shape, reward signal, identity signal, and stage-signature distance before choosing a gameplay change.

## Success Measure

Future work should raise the opportunity-window score, reduce missing event families, increase closest regular-stage signature distance, and improve level-arc score without hiding Stage 4 exact replay gaps.

## Ranked Opportunities

### closest-regular-stage-signature-gap
- Priority: high
- Window: mid-run-entry-variant/mid-run-pressure
- Score: 3.4
- Problem: mid-run-entry-variant and mid-run-pressure are too similar by computed gameplay signature distance (0.106).
- Strategy: Use the feature trace to add one distinct movement/reward grammar to the weaker window, then rerun stage-signature distance.
- Success measure: Closest regular pair distance rises above 0.16 and signatureScore10 improves without increasing exact pressure-loss regressions.

## Window Reads

| Window | Stage | Pressure | Reward | Identity | Semantic Missing | Raw Missing / Notes |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| challenge-stage-candidate | 3 challenge | 1.6 | 6.6 | 8.6 | none | none |
| late-run-cleanup-or-failure | 12 | 6.3 | 5.3 (base 0.7; skill 10) | 7.3 | none | player_hit, wave_clear, game_over; notes: player_hit=satisfied-by-widened-outcome-route, wave_clear=satisfied-by-widened-endpoint-route, game_over=not-required |
| late-run-escort-variant | 14 | 6.6 | 6.3 (base 2.5; skill 10) | 7.3 | none | player_hit, wave_clear, game_over; notes: player_hit=satisfied-by-widened-outcome-route, wave_clear=satisfied-by-widened-endpoint-route, game_over=not-required |
| mid-run-entry-variant | 8 | 7.5 | 1 | 8.1 | none | wave_clear; notes: wave_clear=satisfied-by-widened-endpoint-route |
| mid-run-pressure | 6 | 6.8 | 1.8 (base 1.2; skill 2.3) | 7.3 | none | flank_dive_start, wave_clear; notes: flank_dive_start=not-applicable, wave_clear=satisfied-by-widened-endpoint-route |
| stage-1-baseline | 1 | 2.4 | 1.6 (base 0; skill 3.2) | 6.4 | none | player_shot, wave_clear; notes: player_shot=satisfied-by-widened-shot-route, wave_clear=satisfied-by-widened-endpoint-route |

## Pressure Curve

- stage-1-baseline -> mid-run-pressure: +4.4
- mid-run-pressure -> mid-run-entry-variant: +0.7
- mid-run-entry-variant -> late-run-cleanup-or-failure: -1.2
- late-run-cleanup-or-failure -> late-run-escort-variant: +0.3
