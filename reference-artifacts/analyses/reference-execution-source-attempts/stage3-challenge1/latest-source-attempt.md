# Stage 3 Source Attempt Report

Generated: 2026-06-09T01:46:41.893Z
Commit: 30fdad3c
Branch: codex/macbook-pro-1.4.1-stage7-object-track-keeper

Candidate: stage3-semantic-fresh-g4-score-window-shape-peel-0.1
Verdict: dev-visible-gameplay-keeper

## Source Controls

| Runtime field | Proof value | Source value | Runtime consumed | Matches proof |
| --- | ---: | ---: | --- | --- |
| motionSpecGroups[3].controls.pathPlaybackScale | 0.5 | 0.5 | true | true |
| motionSpecGroups[3].controls.routeCurveY | 17.464 | 17.464 | true | true |
| motionSpecGroups[3].controls.routeOffsetX | 60 | 60 | true | true |

## Group 4 Before/After

- Exit side: center -> right
- Path length: 1.5589 -> 1.1897
- Upper-band share: 0.775 -> 0.9474
- Browser-visible path movement: true
- Browser-visible peel movement: true
- Path-length direction pass: true
- Upper-band score-window preserved: true

## Protected Groups

| Group | X range delta | Y range delta | Path length delta | Start delta | End delta | Pass |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | 0 | 0 | 0 | 0 | 0 | true |
| 2 | 0 | 0 | 0.009 | 0 | 0 | true |
| 3 | 0 | 0 | 0.0083 | 0 | 0 | true |
| 5 | 0 | 0 | 0 | 0 | 0 | true |

## Guardrails

- Motion/profile pass: true
- Spacing/readability pass: true; spacing 0.594, bunching 0.464
- Scoreable routes pass: true
- No-combat grammar pass: true
- Safety pass: true; no shots true, no attacks true, no losses true, no challenge contacts true

Contact sheet: reference-artifacts/analyses/reference-execution-source-attempts/stage3-challenge1/latest-source-attempt-contact-sheet.svg

## Blockers

- none

## Decision

stage3-semantic-fresh-g4-score-window-shape-peel-0.1 reproduced the proof in source and is accepted as a dev-visible gameplay keeper only. It is not beta justification by itself.
