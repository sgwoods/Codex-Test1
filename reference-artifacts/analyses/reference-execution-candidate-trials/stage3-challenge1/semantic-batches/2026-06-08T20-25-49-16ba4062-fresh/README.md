# Stage 3 Semantic Candidate Batch

Generated: 2026-06-08T20:25:49.715Z
Commit: 16ba4062
Branch: codex/macbook-pro-1.4.1-stage7-object-track-keeper

## Decision

Recommendation: transfer-proof-tie-select-smallest

Trial-promising candidate: none

Transfer-proof-ready candidate: stage3-semantic-fresh-g4-score-window-shape-peel-0.1

Runtime keeper: not-a-runtime-keeper

stage3-semantic-fresh-g4-score-window-shape-peel-0.1 is recommended for a later non-overwriting browser transfer proof only. Runtime source remains unauthorized.

## Ranked Candidates

| Rank | Candidate | Class | Object | Path shape | Path sanity | Peel | Guardrails | Trial promising |
| ---: | --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| 1 | stage3-semantic-fresh-direct-lines-balanced-shape-peel-0.1 | player-visible-semantic-lift | 3.5 | 0.678 | 0.395 | 1 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | true |
| 2 | stage3-semantic-fresh-staggered-direct-lines-shape-peel-0.1 | player-visible-semantic-lift | 3.6 | 0.672 | 0.375 | 1 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | true |
| 3 | stage3-semantic-fresh-g4-anchor-g1-peel-protect-0.1 | player-visible-semantic-lift | 3.5 | 0.605 | 0.375 | 1 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | true |
| 4 | stage3-semantic-fresh-direct-lines-conservative-shape-peel-0.1 | player-visible-semantic-lift | 3.4 | 0.634 | 0.356 | 1 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | true |
| 5 | stage3-semantic-fresh-g1-recovery-g4-peel-protect-0.1 | player-visible-semantic-lift | 3.4 | 0.601 | 0.279 | 1 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | true |
| 6 | stage3-semantic-fresh-g4-score-window-shape-peel-0.1 | player-visible-semantic-lift | 3.4 | 0.592 | 0.374 | 0.82 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | true |
| 7 | stage3-semantic-fresh-g1-score-window-shape-peel-0.1 | player-visible-semantic-lift | 3.4 | 0.588 | 0.138 | 0.82 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | true |
| 8 | stage3-semantic-fresh-direct-lines-path-only-sensitivity-0.1 | metric-only-probe | 3.7 | 0.691 | 0.462 | 0.64 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | false |
| 9 | stage3-semantic-fresh-g1-path-only-sensitivity-0.1 | metric-only-probe | 3.5 | 0.603 | 0.315 | 0.64 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | false |
| 10 | stage3-semantic-fresh-direct-lines-peel-only-sensitivity-0.1 | semantic-only-probe | 3.1 | 0.507 | 0.137 | 1 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | false |

## Class Yield

| Class | Generated | Valid | Improved | Guardrail-safe | Trial-promising | Blocked |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| group1-object-track-path-fit | 7 | 7 | 7 | 7 | 5 | 2 |
| group4-object-track-path-fit | 6 | 6 | 6 | 6 | 5 | 1 |
| group1-peel-off-readability | 7 | 7 | 7 | 7 | 6 | 1 |
| group4-peel-off-readability | 7 | 7 | 7 | 7 | 6 | 1 |
| preserve-upper-band-scoreability | 10 | 10 | 10 | 10 | 7 | 3 |
| protect-semantic-line-roles | 10 | 10 | 10 | 10 | 7 | 3 |
| protect-no-combat-scoreable-routes | 10 | 10 | 10 | 10 | 7 | 3 |

## Calibration

The fresh out-of-sample batch preserved the calibrated ranking rule: geometry-only probes stayed metric-only, player-visible multi-axis candidates ranked above them, and the language is stable enough to choose one later browser transfer-proof target.

- Semantic-high/object-weak candidates: 10
- Object-track responsive: true
- Path-length/shape responsive: true
- Peel-off responsive: true

## Blocker Summary

- 10x runtime source expression proof does not exist for these Stage 3 semantic transforms
- 4x strict object-track fit remains below first trial floor (3.4/10)
- 3x strict object-track fit remains below first trial floor (3.5/10)
- 2x geometry-only lift: object/path improved without player-visible peel/readability lift
- 2x no peel-off readability lift
- 1x no path-shape or path-length sanity lift
- 1x no strict object-track lift
- 1x strict object-track fit remains below first trial floor (3.1/10)
- 1x strict object-track fit remains below first trial floor (3.6/10)
- 1x strict object-track fit remains below first trial floor (3.7/10)

## Blocker Taxonomy

- 10x runtime-expression-proof-missing
- 10x strict-object-track-floor
- 7x player-visible-semantic-lift
- 2x geometry-only-lift
