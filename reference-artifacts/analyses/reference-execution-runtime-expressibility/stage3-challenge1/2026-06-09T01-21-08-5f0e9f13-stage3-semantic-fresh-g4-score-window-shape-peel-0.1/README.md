# Stage 3 Browser Transfer Proof

Generated: 2026-06-09T01:21:08.698Z
Commit: 5f0e9f13
Branch: codex/macbook-pro-1.4.1-stage7-object-track-keeper

Candidate: stage3-semantic-fresh-g4-score-window-shape-peel-0.1

Source-readiness classification: runtime-source-attempt-ready

## Runtime Control Consumption

Previous blocker: groupReferencePaths[3].playbackScale was replaced-for-motionSpec-backed-stage3-proof.

New motionSpec control: pathPlaybackScale (Scale local non-reference challenge path playback for a motionSpec-backed group without requiring groupReferencePaths.)

| Semantic control | Runtime field | Value | Runtime consumes | Consumed by proof | Applied targets / reason |
| --- | --- | ---: | --- | --- | --- |
| motionSpec.pathPlaybackScale | motionSpecGroups[3].controls.pathPlaybackScale | 0.5 | true | true | motionSpecGroups[3].controls.pathPlaybackScale: null -> 0.5 |
| routeCurveY | motionSpecGroups[3].controls.routeCurveY | 17.464 | true | true | motionSpecGroups[3].controls.routeCurveY: null -> 17.464 |
| path endpoint / exit-side control | motionSpecGroups[3].controls.routeOffsetX | 60 | true | true | motionSpecGroups[3].controls.routeOffsetX: null -> 60 |

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
- Spacing/readability pass: true; spacing 0.594, bunching 0.464
- Scoreable routes pass: true
- No-combat grammar pass: true
- Safety pass: true; no shots true, no attacks true, no losses true

Contact sheet: reference-artifacts/analyses/reference-execution-runtime-expressibility/stage3-challenge1/2026-06-09T01-21-08-5f0e9f13-stage3-semantic-fresh-g4-score-window-shape-peel-0.1/contact-sheet.svg

## Blockers

- none

## Decision

stage3-semantic-fresh-g4-score-window-shape-peel-0.1 is runtime-source-attempt-ready only. It is not a keeper until a later source edit produces strict before/after evidence.

## Reuse Note

Future Stage 3 candidates can reuse this proof path by changing the selected candidate id and adding compiler mappings instead of writing bespoke browser scripts.
