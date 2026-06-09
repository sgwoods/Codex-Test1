# Stage 3 Group 2 Fast-Lane Report

Generated: 2026-06-09T02:33:32.214Z
Commit: b3cc71ac
Branch: codex/macbook-pro-1.4.1-stage7-object-track-keeper

Mode: non-overwriting-proof
Verdict: blocked
Selected candidate: stage3-g2-column-tighten-0.1

## Group 2 Read

- Entry side: center -> center
- Exit side: center -> center
- X range: 1.0626 -> 1.009
- Y range: 1.1193 -> 1.1263
- Path length: 1.0973 -> 1.1261
- Upper-band share: 0.6 -> 0.6418
- Lower-field share: 0.384 -> 0.3507
- Column compactness improved: true
- Semantic column role preserved: true

## Protected Groups

| Group | X range delta | Y range delta | Path length delta | Start delta | End delta | Pass |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | 0 | 0 | 0 | 0 | 0 | true |
| 3 | 0 | 0 | -0.0002 | 0 | 0 | true |
| 4 | -0.2467 | 0.0228 | 0.0809 | 0.25 | 0 | false |
| 5 | 0 | 0 | 0 | 0 | 0 | true |

## Guardrails

- Motion/profile pass: true
- Spacing/readability pass: true; spacing 0.604, bunching 0.5
- Scoreable routes pass: true
- No-combat grammar pass: true
- Safety pass: true

Contact sheet: reference-artifacts/analyses/reference-execution-source-attempts/stage3-challenge1/group2-fast-lane/latest-group2-fast-lane-contact-sheet.svg

## Blockers

- phase-timing-regression: Group 2 visible timing drifted too far from the source phrase.
- protected-group-regression: A protected Stage 3 group moved beyond preservation limits.
