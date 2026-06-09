# Stage 3 Group 1 Fast-Lane Report

Generated: 2026-06-09T02:02:54.746Z
Commit: abb5c464
Branch: codex/macbook-pro-1.4.1-stage7-object-track-keeper

Mode: non-overwriting-proof
Verdict: blocked
Selected candidate: stage3-g1-conservative-right-bee-slot-0.1

## Group 1 Read

- Bee entry: left -> right
- Bee exit: right -> left
- Group path length: 0.9501 -> 1.5565
- First visible: 0.25 -> 0.25
- Upper-band share: 0.7439 -> 0.7457

## Protected Groups

| Group | X range delta | Y range delta | Path length delta | Start delta | End delta | Pass |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 2 | 0.03 | -0.0125 | 0.0069 | -0.25 | -0.25 | true |
| 3 | 0.0301 | 0.0276 | 0.0452 | -0.5 | -0.25 | false |
| 4 | 0.0182 | 0.0652 | 0.2196 | -0.25 | 0 | false |
| 5 | -0.0243 | 0.0017 | 0.0067 | -0.5 | 0 | false |

## Guardrails

- Motion/profile pass: false
- Spacing/readability pass: true; spacing 0.545, bunching 0.571
- Scoreable routes pass: true
- No-combat grammar pass: true
- Safety pass: true

Contact sheet: reference-artifacts/analyses/reference-execution-source-attempts/stage3-challenge1/group1-fast-lane/2026-06-09T02-02-54-abb5c464-stage3-g1-conservative-right-bee-slot-0.1/contact-sheet.svg

## Blockers

- protected-group-regression: A protected Stage 3 group moved beyond preservation limits.
- motion-profile-regression: The focused motion/profile proxy failed.
