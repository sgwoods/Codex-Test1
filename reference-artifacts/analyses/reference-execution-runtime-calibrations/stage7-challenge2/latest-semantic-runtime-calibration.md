# Stage 7 Semantic Runtime Calibration

Generated: 2026-06-08T15:21:52.246Z
Commit: c75a9a660
Branch: codex/macbook-pro-1.4.1-stage7-object-track-keeper

Candidate: `stage7-semantic-phase-align-protect-0.1`

Decision: runtime candidate blocked

## Predicted Vs Actual

| Metric | Predicted | Actual | Delta | Read |
| --- | ---: | ---: | ---: | --- |
| totalObjectTrackScore10 | 5 | 4.7 | -0.3 | actual runtime stayed at baseline |
| totalObjectTrackCoverage | 0.541 | 0.503 | -0.038 | coverage did not realize the predicted lift |
| group1 | 4 | 3.5 | -0.5 | predicted group 1 lift did not transfer |
| group4 | 5.3 | 5 | -0.3 | protected group held baseline but not predicted lift |
| group5 | 4.9 | 4.9 | 0 | protected group matched prediction |
| canonicalPathFamilyStatus | 1 | 0 | n/a | canonical reference-execution match did not imply live motion/profile gate match |

## Truth Alignment

Live gate order: cross-sweep, cross-sweep, hook-arc, hook-arc, boss-led-loop

Measured intent order: cross-sweep, hook-arc, hook-arc, cross-sweep, hook-arc

Candidate projected order: cross-sweep, hook-arc, hook-arc, cross-sweep, hook-arc

Measured intent matches live gate: false

Candidate matches live gate: false

Use the live promotion gates and restored runtime source as candidate gate authority until the project explicitly migrates them to the measured reference-execution/setpiece order.

| Source | Role | Path-family order | Canonicality |
| --- | --- | --- | --- |
| reference-execution-description | measured-reference-intent | cross-sweep, hook-arc, hook-arc, cross-sweep, hook-arc | canonical for semantic/object-track candidate analysis |
| challenge-setpiece-contracts | measured-reference-intent | cross-sweep, hook-arc, hook-arc, cross-sweep, hook-arc | measured setpiece contract; agrees with reference execution description |
| semantic-candidate | candidate-projection | cross-sweep, hook-arc, hook-arc, cross-sweep, hook-arc | candidate attempted runtime projection |
| challenge-motion-profile-check | live-promotion-gate | cross-sweep, cross-sweep, hook-arc, hook-arc, boss-led-loop | live gate for runtime promotion until explicitly migrated |
| challenge-stage-target-contracts | live-promotion-gate | cross-sweep, cross-sweep, hook-arc, hook-arc, boss-led-loop | current strict-conformance target-contract source |
| runtime-layout | live-runtime-source | cross-sweep, cross-sweep, hook-arc, hook-arc, boss-led-loop | restored baseline runtime layout |
| runtime-motion-spec | live-runtime-source | cross-sweep, cross-sweep, hook-arc, hook-arc, boss-led-loop | runtime path generator input |
| runtime-contract-groups | live-runtime-source | cross-sweep, cross-sweep, hook-arc, hook-arc, boss-led-loop | runtime contract group exposure |

## Runtime Expressibility

| Transform | Source-ready | Role | Source fields | Gap |
| --- | --- | --- | --- | --- |
| canonical-family-alignment | true | runtime-transform | src/js/13-aurora-game-pack.js Stage 7 groupPathFamilies<br>src/js/13-aurora-game-pack.js AURORA_CHALLENGE_STAGE7_MOTION_SPEC_GROUPS pathFamilyHint<br>src/js/13-aurora-game-pack.js AURORA_CHALLENGE_STAGE7_CONTRACT_GROUPS pathFamily<br>reference-artifacts/ingestion/challenge-stage-target-contracts/aurora-challenge-contracts-0.1.json Stage 7 groups pathFamily | This is label and gate alignment only. It must not claim object-track score lift unless paired with a runtime-expressible movement transform. |
| phase-duration-rebalance | false | analysis-only | src/js/13-aurora-game-pack.js Stage 7 groupSpawnOffsets<br>src/js/13-aurora-game-pack.js AURORA_CHALLENGE_STAGE7_MOTION_SPEC_GROUPS phaseDurations<br>src/js/13-aurora-game-pack.js AURORA_CHALLENGE_STAGE7_REFERENCE_PATHS durationS/playbackScale when present | Compile visibleStartS/visibleEndS intent into explicit spawnOffsetS, phaseDurations, reference duration, or playbackScale changes and verify actual browser-visible windows. |
| preserve-scoreable-window | true | guardrail-only | none | Cannot make a candidate source-ready by itself. |
| protect-group4-group5 | true | guardrail-only | none | A predictedRuntimeVector used only for protection is not proof that a source edit can express a new vector. |

## Overprediction

| Transform | Overpredicted | Read |
| --- | --- | --- |
| canonical-family-alignment | true | Path-family labels transferred while applied, but label alignment alone did not move object-track score and conflicted with live motion/profile order. |
| phase-duration-rebalance | true | Predicted lift came from visibleStartS/visibleEndS trial vectors, but the runtime projection did not compile those windows into consumed timing fields. |
| preserve-scoreable-window | false | Guardrail held; this class does not claim movement lift. |
| protect-group4-group5 | false | Group 5 was preserved and group 4 did not regress in actual runtime, but this protection is not a movement compiler. |

## Recommendation

Do not try another Stage 7 runtime candidate. First reconcile the Stage 7 path-family source of truth or make the batch gate deliberately read a single canonical artifact, then compile phase-duration intent into explicit consumed runtime controls and prove the mapping with browser conformance and motion/profile checks.
