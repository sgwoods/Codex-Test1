# Stage 7 Semantic Candidate Batch

Generated: 2026-06-08T15:21:45.884Z
Commit: c75a9a660
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
| stage7-semantic-canonical-family-alignment-0.1 | canonical-family-alignment | 4.7 | 0 | 0.503 | 3.5 | 5 | 4.9 | true | true | false | false | candidate projected path-family order cross-sweep, hook-arc, hook-arc, cross-sweep, hook-arc does not match all live promotion gates<br>total object-track score lift 0/10 does not exceed 0.05/10<br>group 1 does not improve over baseline 3.5/10 |
| stage7-semantic-preserve-scoreable-window-0.1 | preserve-scoreable-window | 4.7 | 0 | 0.503 | 3.5 | 5 | 4.9 | false | true | false | false | candidate has no runtime-transform class; guardrail-only candidates cannot be source-ready<br>total object-track score lift 0/10 does not exceed 0.05/10<br>group 1 does not improve over baseline 3.5/10 |
| stage7-semantic-group1-path-compression-0.1 | group1-path-length-compression | 4.7 | 0 | 0.503 | 3.5 | 5 | 4.9 | false | true | false | false | group1-path-length-compression: no explicit runtime-expressibility mapping for source promotion (Map path-length compression to explicit consumed fields such as reference path geometry, pathScaleX/pathScaleY, playbackScale, or a proven motion-spec control.)<br>candidate has no runtime-transform class; guardrail-only candidates cannot be source-ready<br>group 1: pathLength trial control is not an explicit consumed runtime source field |
| stage7-semantic-phase-align-protect-0.1 | canonical-family-alignment, phase-duration-rebalance, preserve-scoreable-window, protect-group4-group5 | 5 | 0.3 | 0.541 | 4 | 5.3 | 4.9 | true | true | false | false | phase-duration-rebalance: no explicit runtime-expressibility mapping for source promotion (Compile visibleStartS/visibleEndS intent into explicit spawnOffsetS, phaseDurations, reference duration, or playbackScale changes and verify actual browser-visible windows.)<br>candidate projected path-family order cross-sweep, hook-arc, hook-arc, cross-sweep, hook-arc does not match all live promotion gates<br>group 1: visibleStartS/visibleEndS trial timing is not an explicit consumed runtime control |
| stage7-semantic-protect-group4-group5-0.1 | protect-group4-group5 | 4.7 | 0 | 0.503 | 3.5 | 5 | 4.9 | false | false | false | false | candidate has no runtime-transform class; guardrail-only candidates cannot be source-ready<br>group 4 touched but does not match canonical family<br>group 5 touched but does not match canonical family |
| stage7-semantic-lower-field-overstay-reduction-0.1 | lower-field-overstay-reduction | 4.8 | 0.1 | 0.507 | 3.5 | 5 | 4.9 | false | true | false | false | lower-field-overstay-reduction: no explicit runtime-expressibility mapping for source promotion (Derive concrete lowerFieldBias/yOffset or reference-path geometry changes and verify their actual lower-field share in browser runtime.)<br>candidate has no runtime-transform class; guardrail-only candidates cannot be source-ready<br>candidate projected path-family order cross-sweep, hook-arc, hook-arc, hook-arc, boss-led-loop does not match all live promotion gates |
| stage7-semantic-opener-align-protect-0.1 | canonical-family-alignment, group1-path-length-compression, lower-field-overstay-reduction, preserve-scoreable-window, protect-group4-group5 | 4.8 | 0.1 | 0.507 | 3.5 | 5 | 4.9 | true | true | false | false | group1-path-length-compression: no explicit runtime-expressibility mapping for source promotion (Map path-length compression to explicit consumed fields such as reference path geometry, pathScaleX/pathScaleY, playbackScale, or a proven motion-spec control.)<br>lower-field-overstay-reduction: no explicit runtime-expressibility mapping for source promotion (Derive concrete lowerFieldBias/yOffset or reference-path geometry changes and verify their actual lower-field share in browser runtime.)<br>candidate projected path-family order cross-sweep, hook-arc, hook-arc, cross-sweep, hook-arc does not match all live promotion gates |
| stage7-semantic-phase-duration-rebalance-0.1 | phase-duration-rebalance | 5 | 0.3 | 0.541 | 4 | 5.3 | 4.9 | false | true | false | false | phase-duration-rebalance: no explicit runtime-expressibility mapping for source promotion (Compile visibleStartS/visibleEndS intent into explicit spawnOffsetS, phaseDurations, reference duration, or playbackScale changes and verify actual browser-visible windows.)<br>candidate has no runtime-transform class; guardrail-only candidates cannot be source-ready<br>candidate projected path-family order cross-sweep, hook-arc, hook-arc, cross-sweep, boss-led-loop does not match all live promotion gates |

## Class Summary

| Class | Candidates | Best candidate | Best delta | Promise kind | Rejection examples |
| --- | ---: | --- | ---: | --- | --- |
| canonical-family-alignment | 3 | stage7-semantic-canonical-family-alignment-0.1 | 0 | no-current-promise | stage7-semantic-canonical-family-alignment-0.1: candidate projected path-family order cross-sweep, hook-arc, hook-arc, cross-sweep, hook-arc does not match all live promotion gates<br>stage7-semantic-canonical-family-alignment-0.1: total object-track score lift 0/10 does not exceed 0.05/10<br>stage7-semantic-canonical-family-alignment-0.1: group 1 does not improve over baseline 3.5/10 |
| group1-path-length-compression | 2 | stage7-semantic-group1-path-compression-0.1 | 0 | analysis-only-until-runtime-mapped | stage7-semantic-group1-path-compression-0.1: group1-path-length-compression: no explicit runtime-expressibility mapping for source promotion (Map path-length compression to explicit consumed fields such as reference path geometry, pathScaleX/pathScaleY, playbackScale, or a proven motion-spec control.)<br>stage7-semantic-group1-path-compression-0.1: candidate has no runtime-transform class; guardrail-only candidates cannot be source-ready<br>stage7-semantic-group1-path-compression-0.1: group 1: pathLength trial control is not an explicit consumed runtime source field |
| lower-field-overstay-reduction | 2 | stage7-semantic-lower-field-overstay-reduction-0.1 | 0.1 | analysis-only-until-runtime-mapped | stage7-semantic-lower-field-overstay-reduction-0.1: lower-field-overstay-reduction: no explicit runtime-expressibility mapping for source promotion (Derive concrete lowerFieldBias/yOffset or reference-path geometry changes and verify their actual lower-field share in browser runtime.)<br>stage7-semantic-lower-field-overstay-reduction-0.1: candidate has no runtime-transform class; guardrail-only candidates cannot be source-ready<br>stage7-semantic-lower-field-overstay-reduction-0.1: candidate projected path-family order cross-sweep, hook-arc, hook-arc, hook-arc, boss-led-loop does not match all live promotion gates |
| phase-duration-rebalance | 2 | stage7-semantic-phase-align-protect-0.1 | 0.3 | analysis-only-until-runtime-mapped | stage7-semantic-phase-align-protect-0.1: phase-duration-rebalance: no explicit runtime-expressibility mapping for source promotion (Compile visibleStartS/visibleEndS intent into explicit spawnOffsetS, phaseDurations, reference duration, or playbackScale changes and verify actual browser-visible windows.)<br>stage7-semantic-phase-align-protect-0.1: candidate projected path-family order cross-sweep, hook-arc, hook-arc, cross-sweep, hook-arc does not match all live promotion gates<br>stage7-semantic-phase-align-protect-0.1: group 1: visibleStartS/visibleEndS trial timing is not an explicit consumed runtime control |
| preserve-scoreable-window | 3 | stage7-semantic-preserve-scoreable-window-0.1 | 0 | guardrail-only | stage7-semantic-preserve-scoreable-window-0.1: candidate has no runtime-transform class; guardrail-only candidates cannot be source-ready<br>stage7-semantic-preserve-scoreable-window-0.1: total object-track score lift 0/10 does not exceed 0.05/10<br>stage7-semantic-preserve-scoreable-window-0.1: group 1 does not improve over baseline 3.5/10 |
| protect-group4-group5 | 3 | stage7-semantic-phase-align-protect-0.1 | 0.3 | guardrail-or-composition-only | stage7-semantic-phase-align-protect-0.1: phase-duration-rebalance: no explicit runtime-expressibility mapping for source promotion (Compile visibleStartS/visibleEndS intent into explicit spawnOffsetS, phaseDurations, reference duration, or playbackScale changes and verify actual browser-visible windows.)<br>stage7-semantic-phase-align-protect-0.1: candidate projected path-family order cross-sweep, hook-arc, hook-arc, cross-sweep, hook-arc does not match all live promotion gates<br>stage7-semantic-phase-align-protect-0.1: group 1: visibleStartS/visibleEndS trial timing is not an explicit consumed runtime control |

## Next Step

Refine the semantic compiler before touching runtime source: reconcile Stage 7 path-family truth across live gates, then map phase-duration/path-length/lower-field intent to explicit consumed runtime controls.
