# Stage 3 Group 1 Fast-Lane Report

Generated: 2026-06-11T17:45:43.568Z
Commit: a8a2ea93
Branch: main

Mode: non-overwriting-proof
Verdict: blocked
Selected candidate: stage3-g1-soft-curve-score-window-0.1

## Group 1 Read

- Bee entry: left -> center
- Bee exit: right -> left
- Group path length: 0.9501 -> 0.2419
- First visible: 0.25 -> 0.25
- Upper-band share: 0.7439 -> 1

## Protected Groups

| Group | X range delta | Y range delta | Path length delta | Start delta | End delta | Pass |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 2 | 0 | 0 | 0.0009 | 0 | 0 | true |
| 3 | 0 | 0 | -0.0022 | 0 | 0 | true |
| 4 | -0.0151 | 0.0138 | 0.023 | 0.25 | 0 | true |
| 5 | 0 | 0 | 0 | 0 | 0 | true |

## Guardrails

- Motion/profile pass: true
- Spacing/readability pass: true; spacing 0.531, bunching 0.464
- Scoreable routes pass: true
- No-combat grammar pass: true
- Safety pass: true

Contact sheet: reference-artifacts/analyses/reference-execution-source-attempts/stage3-challenge1/group1-fast-lane/2026-06-11T17-45-43-a8a2ea93-stage3-g1-soft-curve-score-window-0.1/contact-sheet.svg

## Blockers

- semantic-line-role-not-improved: The top-right bee-line or first-visible timing read did not improve.
