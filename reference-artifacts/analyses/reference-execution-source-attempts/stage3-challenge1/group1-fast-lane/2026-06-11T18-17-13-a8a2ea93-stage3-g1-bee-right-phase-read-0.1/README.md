# Stage 3 Group 1 Fast-Lane Report

Generated: 2026-06-11T18:17:13.811Z
Commit: a8a2ea93
Branch: main

Mode: source-attempt
Verdict: rejected
Selected candidate: stage3-g1-bee-right-phase-read-0.1

## Group 1 Read

- Bee entry: left -> right
- Bee exit: right -> left
- Group path length: 0.9501 -> 1.0065
- First visible: 0.25 -> 0.25
- Upper-band share: 0.7439 -> 0.7485

## Protected Groups

| Group | X range delta | Y range delta | Path length delta | Start delta | End delta | Pass |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 2 | 0 | 0 | 0.0001 | 0 | 0 | true |
| 3 | 0 | 0 | 0.0018 | 0 | 0 | true |
| 4 | -0.0185 | -0.0279 | 0.002 | 0 | 0 | true |
| 5 | 0 | 0 | 0 | 0 | 0 | true |

## Guardrails

- Motion/profile pass: true
- Spacing/readability pass: true; spacing 0.632, bunching 0.429
- Scoreable routes pass: true
- No-combat grammar pass: true
- Safety pass: true

Contact sheet: reference-artifacts/analyses/reference-execution-source-attempts/stage3-challenge1/group1-fast-lane/2026-06-11T18-17-13-a8a2ea93-stage3-g1-bee-right-phase-read-0.1/contact-sheet.svg

## Blockers

- source-control-not-consumed: One or more group 1 source controls did not appear on runtime enemies.
