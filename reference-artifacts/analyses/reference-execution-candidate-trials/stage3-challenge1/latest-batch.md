# Stage 3 Semantic Candidate Batch

Generated: 2026-06-08T19:32:37.534Z
Commit: 54f53496
Branch: codex/macbook-pro-1.4.1-stage7-object-track-keeper

## Decision

Recommendation: metric-language-improvements-before-more-generation

Trial-promising candidate: none

Runtime keeper: not-a-runtime-keeper

The batch did not produce one clearly superior trial-promising candidate; refine metrics or semantic language before generating more variants.

## Ranked Candidates

| Rank | Candidate | Transforms | Object | Focus object | Path/shape | Peel | Guardrails | Trial promising |
| ---: | --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| 1 | stage3-semantic-direct-lines-red-target-probe-0.1 | group1-object-track-path-fit<br>group4-object-track-path-fit<br>preserve-upper-band-scoreability<br>protect-semantic-line-roles<br>protect-no-combat-scoreable-routes | 3.9 | 5 | 0.599 | 0.64 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | true |
| 2 | stage3-semantic-direct-lines-shape-peel-0.1 | group1-object-track-path-fit<br>group4-object-track-path-fit<br>group1-peel-off-readability<br>group4-peel-off-readability<br>preserve-upper-band-scoreability<br>protect-semantic-line-roles<br>protect-no-combat-scoreable-routes | 3.5 | 3.85 | 0.375 | 1 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | true |
| 3 | stage3-semantic-g4-path-peel-0.1 | group4-object-track-path-fit<br>group4-peel-off-readability<br>preserve-upper-band-scoreability<br>protect-semantic-line-roles<br>protect-no-combat-scoreable-routes | 3.3 | 3.5 | 0.375 | 0.82 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | true |
| 4 | stage3-semantic-direct-lines-path-fit-0.1 | group1-object-track-path-fit<br>group4-object-track-path-fit<br>preserve-upper-band-scoreability<br>protect-semantic-line-roles<br>protect-no-combat-scoreable-routes | 3.5 | 4 | 0.375 | 0.64 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | true |
| 5 | stage3-semantic-g4-path-fit-0.1 | group4-object-track-path-fit<br>preserve-upper-band-scoreability<br>protect-semantic-line-roles<br>protect-no-combat-scoreable-routes | 3.4 | 3.65 | 0.375 | 0.64 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | true |
| 6 | stage3-semantic-g1-path-peel-0.1 | group1-object-track-path-fit<br>group1-peel-off-readability<br>preserve-upper-band-scoreability<br>protect-semantic-line-roles<br>protect-no-combat-scoreable-routes | 3.4 | 3.55 | 0.137 | 0.82 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | false |
| 7 | stage3-semantic-direct-lines-peel-read-0.1 | group1-peel-off-readability<br>group4-peel-off-readability<br>preserve-upper-band-scoreability<br>protect-semantic-line-roles<br>protect-no-combat-scoreable-routes | 3.1 | 3.05 | 0.137 | 1 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | false |
| 8 | stage3-semantic-g1-path-fit-0.1 | group1-object-track-path-fit<br>preserve-upper-band-scoreability<br>protect-semantic-line-roles<br>protect-no-combat-scoreable-routes | 3.4 | 3.55 | 0.137 | 0.64 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | false |
| 9 | stage3-semantic-g1-peel-read-0.1 | group1-peel-off-readability<br>preserve-upper-band-scoreability<br>protect-semantic-line-roles<br>protect-no-combat-scoreable-routes | 3.2 | 3.2 | 0.137 | 0.82 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | false |
| 10 | stage3-semantic-g4-peel-read-0.1 | group4-peel-off-readability<br>preserve-upper-band-scoreability<br>protect-semantic-line-roles<br>protect-no-combat-scoreable-routes | 3.1 | 3.05 | 0.137 | 0.82 | spacingReadability:true<br>scoreableRoutes:true<br>safety:true<br>noCombatGrammar:true | false |

## Class Yield

| Class | Generated | Valid | Improved | Guardrail-safe | Trial-promising | Blocked |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| group1-object-track-path-fit | 5 | 5 | 5 | 5 | 3 | 2 |
| group4-object-track-path-fit | 5 | 5 | 5 | 5 | 5 | 0 |
| group1-peel-off-readability | 4 | 4 | 4 | 4 | 1 | 3 |
| group4-peel-off-readability | 4 | 4 | 4 | 4 | 2 | 2 |
| preserve-upper-band-scoreability | 10 | 10 | 10 | 10 | 5 | 5 |
| protect-semantic-line-roles | 10 | 10 | 10 | 10 | 5 | 5 |
| protect-no-combat-scoreable-routes | 10 | 10 | 10 | 10 | 5 | 5 |

## Calibration

The gate is responsive, but its top rank is still geometry-heavy while a close multi-axis shape+peel candidate trails it. Tighten ranking/calibration before more generation or runtime transfer work.

- Semantic-high/object-weak candidates: 10
- Object-track responsive: true
- Path-length/shape responsive: true
- Peel-off responsive: true

## Blocker Summary

- 10x runtime source expression proof does not exist for these Stage 3 semantic transforms
- 3x no strict object-track lift
- 3x strict object-track fit remains below first trial floor (3.4/10)
- 2x strict object-track fit remains below first trial floor (3.1/10)
- 2x strict object-track fit remains below first trial floor (3.5/10)
- 1x strict object-track fit remains below first trial floor (3.2/10)
- 1x strict object-track fit remains below first trial floor (3.3/10)
- 1x strict object-track fit remains below first trial floor (3.9/10)
