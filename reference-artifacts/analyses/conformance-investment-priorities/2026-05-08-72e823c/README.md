# Conformance Investment Priorities

This artifact ranks candidate work by expected contribution to the overall quality/conformance score, current gap size, measurement confidence, platform reuse, risk, and expected compute cost.

- Overall score: 9.2/10
- Top candidate: Tighten audio reference segmentation and cue matching
- Top investment score: 3.11

## Selection Criteria

- Overall-score leverage: equal category weight multiplied by expected category lift.
- Gap urgency: lower current category scores get more priority.
- Confidence: prefer candidates with frozen harnesses and clear pass/fail metrics.
- Reuse: prefer work that improves ingestion/platform logic as well as gameplay.
- Risk/cost: discount broad, fragile, or expensive cycles until their evaluators are tighter.

## Ranked Candidates

| Rank | Candidate | Category | Gap | Expected Overall Lift | Score | Next Action |
| ---: | --- | --- | ---: | ---: | ---: | --- |
| 1 | Tighten audio reference segmentation and cue matching | audio | 2.6 | 0.064 | 3.11 | Split or further label shared shot/impact/explosion reference mappings, especially playerShot/enemyShot/bossHit and enemyHit/enemyBoom, then rerun audio comparison and semantic event-gap analysis. |
| 2 | Tighten level-arc opportunity coverage and late reward reads | level-arc | 1.5 | 0.022 | 1.92 | Widen the Stage 1 baseline evidence window for player-shot and endpoint semantics before gameplay tuning. |
| 3 | Improve Stage 4 pressure exact replay | level-arc | 1.5 | 0.032 | 1.73 | Run focused source-window replay matching after the Stage 12 loop validates candidate mechanics. |
| 4 | Stage 1 opening timing polish | stage1-timing | 1.5 | 0.016 | 0.86 | Defer until higher-gap audio and level-arc candidates have been exercised. |
| 5 | UI/graphics shell polish | ui-shell | 0.8 | 0.011 | 0.45 | Defer unless new ingestion evidence reveals a larger graphics-conformance gap. |

## Interpretation

Audio remains the largest raw gap. Level-arc work remains the best lower-cost gameplay-adjacent investment; Stage 12 and Stage 14 reward-route uncertainty has been reduced, and the immediate level-arc task is now stage-1-baseline-missing-event-coverage.

