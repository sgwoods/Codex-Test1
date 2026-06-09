# Stage 3 Group 1 Fast-Lane Report

Generated: 2026-06-09T02:04:57.669Z
Commit: abb5c464
Branch: codex/macbook-pro-1.4.1-stage7-object-track-keeper

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
| 2 | 0 | 0 | -0.0016 | 0 | 0 | true |
| 3 | 0 | 0 | 0.0035 | 0 | 0 | true |
| 4 | -0.0151 | 0.0138 | 0.023 | 0.25 | 0 | true |
| 5 | 0 | 0 | 0 | 0 | 0 | true |

## Guardrails

- Motion/profile pass: false
- Spacing/readability pass: false; spacing 0.405, bunching 0.679
- Scoreable routes pass: true
- No-combat grammar pass: true
- Safety pass: true

Contact sheet: reference-artifacts/analyses/reference-execution-source-attempts/stage3-challenge1/group1-fast-lane/latest-group1-fast-lane-contact-sheet.svg

## Blockers

- semantic-line-role-not-improved: The top-right bee-line or first-visible timing read did not improve.
- motion-profile-regression: The focused motion/profile proxy failed.
- guardrail-regression: spacingReadability did not pass.
