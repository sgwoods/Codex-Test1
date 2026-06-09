# Stage 3 Browser Transfer Proof

Generated: 2026-06-08T21:57:26.264Z
Commit: 75b621dc
Branch: codex/macbook-pro-1.4.1-stage7-object-track-keeper

Candidate: stage3-semantic-fresh-g4-score-window-shape-peel-0.1

Source-readiness classification: visible-transfer-but-source-blocked

## Runtime Control Consumption

| Semantic control | Runtime field | Value | Runtime consumes | Consumed by proof | Applied targets / reason |
| --- | --- | ---: | --- | --- | --- |
| referencePath.playbackScale | groupReferencePaths[3].playbackScale | 0.5 | false | false | Stage 3 current runtime has no reference-backed groupReferencePaths for Challenge 1, so playbackScale has no path points to consume. |
| routeCurveY | motionSpecGroups[3].controls.routeCurveY | 17.464 | true | true | motionSpecGroups[3].controls.routeCurveY: null -> 17.464 |
| path endpoint / exit-side control | motionSpecGroups[3].controls.routeOffsetX | 32 | true | true | motionSpecGroups[3].controls.routeOffsetX: null -> 32 |

## Group 4 Transfer Read

- Baseline exit side: center
- Compiled exit side: right
- Expected exit side: right
- Browser-visible path movement: true
- Browser-visible peel movement: true
- Path-length direction pass: true
- Target-distance improved: true
- Peel readability improved: true
- Upper-band score-window preserved: true

## Protected Groups

| Group | X range delta | Y range delta | Path length delta | Start delta | End delta | Pass |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | 0 | 0 | 0 | 0 | 0 | true |
| 2 | 0 | 0 | 0.009 | 0 | 0 | true |
| 3 | 0 | 0 | 0.0083 | 0 | 0 | true |
| 5 | 0 | 0 | 0 | 0 | 0 | true |

## Guardrails

- Motion/profile proxy pass: true
- Spacing/readability pass: true; spacing 0.597, bunching 0.464
- Scoreable routes pass: true
- No-combat grammar pass: true
- Safety pass: true; no shots true, no attacks true, no losses true

Contact sheet: reference-artifacts/analyses/reference-execution-runtime-expressibility/stage3-challenge1/latest-transfer-proof-contact-sheet.svg

## Blockers

- not-runtime-expressible: The semantic candidate still depends on referencePath.playbackScale, but Stage 3 has no reference-backed path for that control.

## Decision

stage3-semantic-fresh-g4-score-window-shape-peel-0.1 is not runtime-source-attempt-ready. The proof should feed compiler/control mapping refinement, not more candidate generation.

## Reuse Note

Future Stage 3 candidates can reuse this proof path by changing the selected candidate id and adding compiler mappings instead of writing bespoke browser scripts.
