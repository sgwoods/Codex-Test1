# Stage 3 Semantic Candidate Batch

Generated: 2026-06-08T19:32:37.534Z
Commit: 16ba4062
Branch: codex/macbook-pro-1.4.1-stage7-object-track-keeper

## Decision

Recommendation: ready-for-one-more-small-stage3-semantic-batch

Trial-promising candidate: stage3-semantic-direct-lines-shape-peel-0.1

Runtime keeper: not-a-runtime-keeper

stage3-semantic-direct-lines-shape-peel-0.1 is trial-promising only as a calibration exemplar. Generate one more small Stage 3 semantic batch with this calibrated ranker before any transfer-proof or runtime-source work.

## Ranked Candidates

| Rank | Candidate | Class | Object | Path shape | Path sanity | Peel | Guardrails | Trial promising |
| ---: | --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| 1 | stage3-semantic-direct-lines-shape-peel-0.1 | player-visible-semantic-lift | 3.5 | 0.665 | 0.375 | 1 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | true |
| 2 | stage3-semantic-g4-path-peel-0.1 | player-visible-semantic-lift | 3.3 | 0.588 | 0.375 | 0.82 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | true |
| 3 | stage3-semantic-g1-path-peel-0.1 | player-visible-semantic-lift | 3.4 | 0.584 | 0.137 | 0.82 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | true |
| 4 | stage3-semantic-direct-lines-red-target-probe-0.1 | metric-only-probe | 3.9 | 0.708 | 0.599 | 0.64 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | false |
| 5 | stage3-semantic-direct-lines-path-fit-0.1 | metric-only-probe | 3.5 | 0.665 | 0.375 | 0.64 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | false |
| 6 | stage3-semantic-g4-path-fit-0.1 | metric-only-probe | 3.4 | 0.588 | 0.375 | 0.64 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | false |
| 7 | stage3-semantic-g1-path-fit-0.1 | metric-only-probe | 3.4 | 0.584 | 0.137 | 0.64 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | false |
| 8 | stage3-semantic-direct-lines-peel-read-0.1 | semantic-only-probe | 3.1 | 0.507 | 0.137 | 1 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | false |
| 9 | stage3-semantic-g1-peel-read-0.1 | semantic-only-probe | 3.2 | 0.507 | 0.137 | 0.82 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | false |
| 10 | stage3-semantic-g4-peel-read-0.1 | semantic-only-probe | 3.1 | 0.507 | 0.137 | 0.82 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | false |

## Before/After Ranking Calibration

| Candidate | Before rank | Before score | After rank | After score | After class | Trial promising |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| stage3-semantic-direct-lines-red-target-probe-0.1 | 1 | 0.7022 | 4 | 0.6018 | metric-only-probe | false |
| stage3-semantic-direct-lines-shape-peel-0.1 | 2 | 0.6845 | 1 | 0.7184 | player-visible-semantic-lift | true |

The previous model weighted focus object-track and path-length geometry enough that the RED target probe could rank first even though direct-line peel readability stayed at baseline.

The calibrated model places the multi-axis path+peel candidate ahead of the geometry-only probe because trial-promising status now requires object/path movement plus player-visible peel/readability lift.

## Class Yield

| Class | Generated | Valid | Improved | Guardrail-safe | Trial-promising | Blocked |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| group1-object-track-path-fit | 5 | 5 | 5 | 5 | 2 | 3 |
| group4-object-track-path-fit | 5 | 5 | 5 | 5 | 2 | 3 |
| group1-peel-off-readability | 4 | 4 | 4 | 4 | 2 | 2 |
| group4-peel-off-readability | 4 | 4 | 4 | 4 | 2 | 2 |
| preserve-upper-band-scoreability | 10 | 10 | 10 | 10 | 3 | 7 |
| protect-semantic-line-roles | 10 | 10 | 10 | 10 | 3 | 7 |
| protect-no-combat-scoreable-routes | 10 | 10 | 10 | 10 | 3 | 7 |

## Calibration

The calibrated gate now ranks a player-visible multi-axis path+peel candidate above the geometry-only probe. It is ready for one more small Stage 3 semantic batch, still without runtime source authorization.

- Semantic-high/object-weak candidates: 10
- Object-track responsive: true
- Path-length/shape responsive: true
- Peel-off responsive: true

## Blocker Summary

- 10x runtime source expression proof does not exist for these Stage 3 semantic transforms
- 4x geometry-only lift: object/path improved without player-visible peel/readability lift
- 4x no peel-off readability lift
- 3x no path-shape or path-length sanity lift
- 3x no strict object-track lift
- 3x strict object-track fit remains below first trial floor (3.4/10)
- 2x strict object-track fit remains below first trial floor (3.1/10)
- 2x strict object-track fit remains below first trial floor (3.5/10)
- 1x strict object-track fit remains below first trial floor (3.2/10)
- 1x strict object-track fit remains below first trial floor (3.3/10)
- 1x strict object-track fit remains below first trial floor (3.9/10)

## Blocker Taxonomy

- 10x runtime-expression-proof-missing
- 10x strict-object-track-floor
- 4x geometry-only-lift
- 3x player-visible-semantic-lift
