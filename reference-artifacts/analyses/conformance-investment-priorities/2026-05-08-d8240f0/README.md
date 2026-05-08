# Conformance Investment Priorities

This artifact ranks candidate work by expected contribution to the overall quality/conformance score, current gap size, measurement confidence, platform reuse, risk, and expected compute cost.

- Overall score: 9.1/10
- Top candidate: Tighten audio reference segmentation and cue matching
- Top investment score: 3.57

## Selection Criteria

- Overall-score leverage: equal category weight multiplied by expected category lift.
- Gap urgency: lower current category scores get more priority.
- Confidence: prefer candidates with frozen harnesses and clear pass/fail metrics.
- Reuse: prefer work that improves ingestion/platform logic as well as gameplay.
- Risk/cost: discount broad, fragile, or expensive cycles until their evaluators are tighter.

## Ranked Candidates

| Rank | Candidate | Category | Gap | Expected Overall Lift | Score | Next Action |
| ---: | --- | --- | ---: | ---: | ---: | --- |
| 1 | Tighten audio reference segmentation and cue matching | audio | 3.7 | 0.064 | 3.57 | Run a longer audio segmentation/model-assisted analysis cycle. |
| 2 | Naturalize Stage 12 boss/escort reward window | level-arc | 1.6 | 0.025 | 2.28 | Apply one narrow Stage 12 reward candidate and rerun the frozen conformance loop. |
| 3 | Improve Stage 4 pressure exact replay | level-arc | 1.6 | 0.032 | 1.76 | Run focused source-window replay matching after the Stage 12 loop validates candidate mechanics. |
| 4 | Stage 1 opening timing polish | stage1-timing | 1.5 | 0.016 | 0.86 | Defer until higher-gap audio and level-arc candidates have been exercised. |
| 5 | UI/graphics shell polish | ui-shell | 0.8 | 0.011 | 0.45 | Defer unless new ingestion evidence reveals a larger graphics-conformance gap. |

## Interpretation

Audio remains the largest raw gap, but the Stage 12 natural reward loop ranks competitively because it has low compute cost, high measurement readiness, and strong reuse as a candidate-loop proving ground. Use this artifact as the tie-breaker before committing multi-hour compute cycles.

