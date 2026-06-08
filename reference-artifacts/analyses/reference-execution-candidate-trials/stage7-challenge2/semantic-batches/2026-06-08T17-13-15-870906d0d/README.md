# Stage 7 Semantic Candidate Batch

Generated: 2026-06-08T17:13:15.996Z
Commit: 870906d0d
Branch: codex/macbook-pro-1.4.1-stage7-object-track-keeper

## Decision

Recommendation: no-runtime-source-candidate

Runtime source candidate: none

No semantic candidate passed the full pre-source promotion gate; preserve this batch as measurement evidence and refine the failing transformation classes.

## Truth Alignment

Live gate order: cross-sweep, cross-sweep, hook-arc, hook-arc, boss-led-loop

Measured intent order: cross-sweep, hook-arc, hook-arc, cross-sweep, hook-arc

Measured intent matches live gate: false

Measured reference intent disagrees with the restored live gate order. Treat this as an unresolved source-of-truth conflict; do not update old gates merely to pass the rejected candidate.

| Source | Role | Path-family order | Matches live gate |
| --- | --- | --- | --- |
| reference-execution-description | measured-reference-intent | cross-sweep, hook-arc, hook-arc, cross-sweep, hook-arc | false |
| challenge-setpiece-contracts | measured-reference-intent | cross-sweep, hook-arc, hook-arc, cross-sweep, hook-arc | false |
| challenge-stage-target-contracts | live-promotion-gate | cross-sweep, cross-sweep, hook-arc, hook-arc, boss-led-loop | true |
| challenge-motion-profile-check | live-promotion-gate | cross-sweep, cross-sweep, hook-arc, hook-arc, boss-led-loop | true |
| runtime-layout | live-runtime-source | cross-sweep, cross-sweep, hook-arc, hook-arc, boss-led-loop | true |
| runtime-motion-spec | live-runtime-source | cross-sweep, cross-sweep, hook-arc, hook-arc, boss-led-loop | true |
| runtime-contract-groups | live-runtime-source | cross-sweep, cross-sweep, hook-arc, hook-arc, boss-led-loop | true |

## Candidates

| Candidate | Transformations | Score | Delta | Coverage | G1 | G4 | G5 | Canonical families | Semantic valid | Runtime expressible | Source-ready | First blockers |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- |
| stage7-semantic-phase-align-protect-0.1 | phase-duration-rebalance, preserve-scoreable-window, protect-group4-group5 | 5 | 0.3 | 0.537 | 4 | 5.3 | 4.9 | false | true | false | false | phase-duration-rebalance: missing passing runtime expressibility proof reference-artifacts/analyses/reference-execution-runtime-expressibility/stage7-challenge2/latest-phase-duration-proof.json<br>group 2: path family cross-sweep does not match canonical hook-arc<br>group 4: path family hook-arc does not match canonical cross-sweep |
| stage7-semantic-phase-duration-rebalance-0.1 | phase-duration-rebalance | 5 | 0.3 | 0.537 | 4 | 5.3 | 4.9 | false | true | false | false | phase-duration-rebalance: missing passing runtime expressibility proof reference-artifacts/analyses/reference-execution-runtime-expressibility/stage7-challenge2/latest-phase-duration-proof.json<br>group 2: path family cross-sweep does not match canonical hook-arc<br>group 4: path family hook-arc does not match canonical cross-sweep |
| stage7-semantic-canonical-family-alignment-0.1 | canonical-family-alignment | 4.7 | 0 | 0.503 | 3.5 | 5 | 4.9 | true | true | false | false | candidate projected path-family order cross-sweep, hook-arc, hook-arc, cross-sweep, hook-arc does not match all live promotion gates<br>total object-track score lift 0/10 does not exceed 0.05/10<br>group 1 does not improve over baseline 3.5/10 |
| stage7-semantic-preserve-scoreable-window-0.1 | preserve-scoreable-window | 4.7 | 0 | 0.503 | 3.5 | 5 | 4.9 | false | true | false | false | candidate has no runtime-transform class; guardrail-only candidates cannot be source-ready<br>total object-track score lift 0/10 does not exceed 0.05/10<br>group 1 does not improve over baseline 3.5/10 |
| stage7-semantic-protect-group4-group5-0.1 | protect-group4-group5 | 4.7 | 0 | 0.503 | 3.5 | 5 | 4.9 | false | true | false | false | candidate has no runtime-transform class; guardrail-only candidates cannot be source-ready<br>total object-track score lift 0/10 does not exceed 0.05/10<br>group 1 does not improve over baseline 3.5/10 |
| stage7-semantic-lower-field-overstay-reduction-0.1 | lower-field-overstay-reduction | 4.8 | 0.1 | 0.507 | 3.5 | 5 | 4.9 | false | true | false | false | lower-field-overstay-reduction: not expressible in runtime yet for source promotion (Verify concrete lowerFieldBias/yOffset controls against actual browser lower-field share, spacing/readability, and scoreable-route guardrails.)<br>candidate has no runtime-transform class; guardrail-only candidates cannot be source-ready<br>group 2: lower-field trial control remains analysis-only until lowerFieldBias/yOffset proof exists |
| stage7-semantic-group1-path-compression-0.1 | group1-path-length-compression | 4.7 | 0 | 0.503 | 3.5 | 5 | 4.9 | false | true | false | false | group1-path-length-compression: not expressible in runtime yet for source promotion (Prove the playbackScale/path-geometry transfer against browser object tracks before allowing source promotion.)<br>candidate has no runtime-transform class; guardrail-only candidates cannot be source-ready<br>group 1: pathLength trial control remains analysis-only until playbackScale/path geometry proof exists |
| stage7-semantic-opener-align-protect-0.1 | group1-path-length-compression, lower-field-overstay-reduction, preserve-scoreable-window, protect-group4-group5 | 4.8 | 0.1 | 0.507 | 3.5 | 5 | 4.9 | false | true | false | false | group1-path-length-compression: not expressible in runtime yet for source promotion (Prove the playbackScale/path-geometry transfer against browser object tracks before allowing source promotion.)<br>lower-field-overstay-reduction: not expressible in runtime yet for source promotion (Verify concrete lowerFieldBias/yOffset controls against actual browser lower-field share, spacing/readability, and scoreable-route guardrails.)<br>candidate has no runtime-transform class; guardrail-only candidates cannot be source-ready |

## Class Summary

| Class | Candidates | Best candidate | Best delta | Promise kind | Rejection examples |
| --- | ---: | --- | ---: | --- | --- |
| canonical-family-alignment | 1 | stage7-semantic-canonical-family-alignment-0.1 | 0 | no-current-promise | stage7-semantic-canonical-family-alignment-0.1: candidate projected path-family order cross-sweep, hook-arc, hook-arc, cross-sweep, hook-arc does not match all live promotion gates<br>stage7-semantic-canonical-family-alignment-0.1: total object-track score lift 0/10 does not exceed 0.05/10<br>stage7-semantic-canonical-family-alignment-0.1: group 1 does not improve over baseline 3.5/10 |
| group1-path-length-compression | 2 | stage7-semantic-group1-path-compression-0.1 | 0 | analysis-only-until-runtime-mapped | stage7-semantic-group1-path-compression-0.1: group1-path-length-compression: not expressible in runtime yet for source promotion (Prove the playbackScale/path-geometry transfer against browser object tracks before allowing source promotion.)<br>stage7-semantic-group1-path-compression-0.1: candidate has no runtime-transform class; guardrail-only candidates cannot be source-ready<br>stage7-semantic-group1-path-compression-0.1: group 1: pathLength trial control remains analysis-only until playbackScale/path geometry proof exists |
| lower-field-overstay-reduction | 2 | stage7-semantic-lower-field-overstay-reduction-0.1 | 0.1 | analysis-only-until-runtime-mapped | stage7-semantic-lower-field-overstay-reduction-0.1: lower-field-overstay-reduction: not expressible in runtime yet for source promotion (Verify concrete lowerFieldBias/yOffset controls against actual browser lower-field share, spacing/readability, and scoreable-route guardrails.)<br>stage7-semantic-lower-field-overstay-reduction-0.1: candidate has no runtime-transform class; guardrail-only candidates cannot be source-ready<br>stage7-semantic-lower-field-overstay-reduction-0.1: group 2: lower-field trial control remains analysis-only until lowerFieldBias/yOffset proof exists |
| phase-duration-rebalance | 2 | stage7-semantic-phase-align-protect-0.1 | 0.3 | no-current-promise | stage7-semantic-phase-align-protect-0.1: phase-duration-rebalance: missing passing runtime expressibility proof reference-artifacts/analyses/reference-execution-runtime-expressibility/stage7-challenge2/latest-phase-duration-proof.json<br>stage7-semantic-phase-align-protect-0.1: group 2: path family cross-sweep does not match canonical hook-arc<br>stage7-semantic-phase-align-protect-0.1: group 4: path family hook-arc does not match canonical cross-sweep |
| preserve-scoreable-window | 3 | stage7-semantic-phase-align-protect-0.1 | 0.3 | guardrail-only | stage7-semantic-phase-align-protect-0.1: phase-duration-rebalance: missing passing runtime expressibility proof reference-artifacts/analyses/reference-execution-runtime-expressibility/stage7-challenge2/latest-phase-duration-proof.json<br>stage7-semantic-phase-align-protect-0.1: group 2: path family cross-sweep does not match canonical hook-arc<br>stage7-semantic-phase-align-protect-0.1: group 4: path family hook-arc does not match canonical cross-sweep |
| protect-group4-group5 | 3 | stage7-semantic-phase-align-protect-0.1 | 0.3 | guardrail-or-composition-only | stage7-semantic-phase-align-protect-0.1: phase-duration-rebalance: missing passing runtime expressibility proof reference-artifacts/analyses/reference-execution-runtime-expressibility/stage7-challenge2/latest-phase-duration-proof.json<br>stage7-semantic-phase-align-protect-0.1: group 2: path family cross-sweep does not match canonical hook-arc<br>stage7-semantic-phase-align-protect-0.1: group 4: path family hook-arc does not match canonical cross-sweep |

## Compiler Coverage

| Class | Role | Mapping status | Compiled controls | Analysis mappings | Proof pass | Browser-visible only | Read |
| --- | --- | --- | ---: | ---: | --- | --- | --- |
| canonical-family-alignment | runtime-transform | source-ready-mapped | 0 | 0 | false | false | canonical-family-alignment does not currently emit proof-backed runtime controls. |
| group1-path-length-compression | runtime-transform-analysis-only | analysis-only-unproven-runtime-transfer | 0 | 4 | false | false | group1-path-length-compression has an analysis compiler mapping but no proof-backed source readiness. |
| lower-field-overstay-reduction | runtime-transform-analysis-only | analysis-only-unproven-runtime-transfer | 0 | 4 | false | false | lower-field-overstay-reduction has an analysis compiler mapping but no proof-backed source readiness. |
| phase-duration-rebalance | runtime-transform | compiled-browser-visible-proofed-but-not-source-ready | 16 | 0 | false | true | phase-duration-rebalance has browser-visible proof but still fails a source-readiness guard. |
| preserve-scoreable-window | guardrail-only | source-ready-mapped | 0 | 0 | false | false | preserve-scoreable-window does not currently emit proof-backed runtime controls. |
| protect-group4-group5 | guardrail-only | source-ready-mapped | 0 | 0 | false | false | protect-group4-group5 does not currently emit proof-backed runtime controls. |

## Source-Ready Blocker Taxonomy

| Blocker kind | Count | Candidates | Examples |
| --- | ---: | --- | --- |
| missing-or-failing-proof | 2 | stage7-semantic-phase-align-protect-0.1, stage7-semantic-phase-duration-rebalance-0.1 | stage7-semantic-phase-align-protect-0.1: phase-duration-rebalance: missing passing runtime expressibility proof reference-artifacts/analyses/reference-execution-runtime-expressibility/stage7-challenge2/latest-phase-duration-proof.json<br>stage7-semantic-phase-duration-rebalance-0.1: phase-duration-rebalance: missing passing runtime expressibility proof reference-artifacts/analyses/reference-execution-runtime-expressibility/stage7-challenge2/latest-phase-duration-proof.json |
| target-conformance-authority-debt | 21 | stage7-semantic-group1-path-compression-0.1, stage7-semantic-lower-field-overstay-reduction-0.1, stage7-semantic-opener-align-protect-0.1, stage7-semantic-phase-align-protect-0.1, stage7-semantic-phase-duration-rebalance-0.1, stage7-semantic-preserve-scoreable-window-0.1, stage7-semantic-protect-group4-group5-0.1 | stage7-semantic-phase-align-protect-0.1: group 2: path family cross-sweep does not match canonical hook-arc<br>stage7-semantic-phase-align-protect-0.1: group 4: path family hook-arc does not match canonical cross-sweep<br>stage7-semantic-phase-align-protect-0.1: group 5: path family boss-led-loop does not match canonical hook-arc |
| blocked-by-promotion-authority | 1 | stage7-semantic-canonical-family-alignment-0.1 | stage7-semantic-canonical-family-alignment-0.1: candidate projected path-family order cross-sweep, hook-arc, hook-arc, cross-sweep, hook-arc does not match all live promotion gates |
| metric-or-score-blocker | 10 | stage7-semantic-canonical-family-alignment-0.1, stage7-semantic-group1-path-compression-0.1, stage7-semantic-lower-field-overstay-reduction-0.1, stage7-semantic-opener-align-protect-0.1, stage7-semantic-preserve-scoreable-window-0.1, stage7-semantic-protect-group4-group5-0.1 | stage7-semantic-canonical-family-alignment-0.1: total object-track score lift 0/10 does not exceed 0.05/10<br>stage7-semantic-canonical-family-alignment-0.1: group 1 does not improve over baseline 3.5/10<br>stage7-semantic-preserve-scoreable-window-0.1: total object-track score lift 0/10 does not exceed 0.05/10 |
| guardrail-only-no-source-movement | 5 | stage7-semantic-group1-path-compression-0.1, stage7-semantic-lower-field-overstay-reduction-0.1, stage7-semantic-opener-align-protect-0.1, stage7-semantic-preserve-scoreable-window-0.1, stage7-semantic-protect-group4-group5-0.1 | stage7-semantic-preserve-scoreable-window-0.1: candidate has no runtime-transform class; guardrail-only candidates cannot be source-ready<br>stage7-semantic-protect-group4-group5-0.1: candidate has no runtime-transform class; guardrail-only candidates cannot be source-ready<br>stage7-semantic-lower-field-overstay-reduction-0.1: candidate has no runtime-transform class; guardrail-only candidates cannot be source-ready |
| not-expressible-in-runtime-yet | 8 | stage7-semantic-group1-path-compression-0.1, stage7-semantic-lower-field-overstay-reduction-0.1, stage7-semantic-opener-align-protect-0.1 | stage7-semantic-lower-field-overstay-reduction-0.1: lower-field-overstay-reduction: not expressible in runtime yet for source promotion (Verify concrete lowerFieldBias/yOffset controls against actual browser lower-field share, spacing/readability, and scoreable-route guardrails.)<br>stage7-semantic-lower-field-overstay-reduction-0.1: group 2: lower-field trial control remains analysis-only until lowerFieldBias/yOffset proof exists<br>stage7-semantic-group1-path-compression-0.1: group1-path-length-compression: not expressible in runtime yet for source promotion (Prove the playbackScale/path-geometry transfer against browser object tracks before allowing source promotion.) |

## Next Step

Refine the semantic compiler before touching runtime source: keep Stage 7 source-ready path families aligned with live gates, keep phase-duration motion/profile-compatible while preserving group 4/group 5 timing, and add proof harnesses for path-length/lower-field mappings.
