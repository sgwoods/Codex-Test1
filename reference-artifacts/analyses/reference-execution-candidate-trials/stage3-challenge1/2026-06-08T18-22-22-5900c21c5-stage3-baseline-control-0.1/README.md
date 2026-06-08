# Stage 3 Reference Execution Candidate Trial

Generated: 2026-06-08T18:22:22.075Z
Commit: 5900c21c5
Branch: codex/macbook-pro-1.4.1-stage7-object-track-keeper

Candidate: `stage3-baseline-control-0.1`

## Decision

Measurement/process keeper: accept-process-keeper

Runtime keeper: not-a-runtime-keeper

Ready for runtime source candidate: false

The Stage 3 non-overwriting trial gate cleanly evaluates the baseline-control candidate and exposes semantic, authority, and metric debt without runtime source edits.

## Scores

Baseline object-track: 3.2/10, coverage 0.297

Trial object-track: 3.2/10, coverage 0.297

Semantic overall: 0.918

- Line-role preservation: 0.868
- Upper-band scoreability: 0.968
- Peel-off readability: 0.752
- Route learnability: 1
- No-combat grammar: 1

| Group | Role | Candidate family | RED family | Object score | Semantic score | Human/CPU occupancy conflict | Notes |
| ---: | --- | --- | --- | ---: | ---: | --- | --- |
| 1 | bee-line | first-challenge-peel | first-challenge-peel | 2.4 | 0.92 | true | aggregate object-track score 2.4/10 is below the first RED trial floor<br>primary object-track score 2.4/10 is below the first RED trial floor<br>aggregate path-length ratio 56.16 exceeds the first RED trial floor<br>primary path-length ratio 11.78 exceeds the first RED trial floor<br>runtime exit side right does not clearly read as left peel-off<br>human upper-band scoreability conflicts with CPU lower-field occupancy; keep both metrics visible |
| 2 | bee-column | classic-column-drop | classic-column-drop | 4 | 0.912 | true | aggregate object-track score 4/10 is below the first RED trial floor<br>primary object-track score 3.1/10 is below the first RED trial floor<br>aggregate path-length ratio 4.63 exceeds the first RED trial floor<br>semantic role is inferred rather than directly accepted from a path label<br>runtime exit side left does not clearly read as lower exit<br>human upper-band scoreability conflicts with CPU lower-field occupancy; keep both metrics visible |
| 3 | butterfly-column | classic-column-drop | classic-column-drop | 2 | 0.912 | true | aggregate object-track score 2/10 is below the first RED trial floor<br>primary object-track score 1/10 is below the first RED trial floor<br>aggregate path-length ratio 4.3 exceeds the first RED trial floor<br>authority conflict: setpiece schedule says first-challenge-peel while target contract says classic-column-drop; movement grammar says first-challenge-peel while target contract says classic-column-drop<br>semantic role is inferred rather than directly accepted from a path label<br>runtime exit side left does not clearly read as lower exit<br>human upper-band scoreability conflicts with CPU lower-field occupancy; keep both metrics visible |
| 4 | butterfly-line | side-hook-return | side-hook-return | 4 | 0.92 | true | aggregate object-track score 4/10 is below the first RED trial floor<br>primary object-track score 1.7/10 is below the first RED trial floor<br>runtime exit side center does not clearly read as right peel-off<br>human upper-band scoreability conflicts with CPU lower-field occupancy; keep both metrics visible |
| 5 | mixed-closing-peel | first-challenge-peel | first-challenge-peel | 3.7 | 0.924 | false | aggregate object-track score 3.7/10 is below the first RED trial floor<br>primary object-track score 3.7/10 is below the first RED trial floor<br>authority conflict: setpiece schedule says side-hook-return while target contract says first-challenge-peel; movement grammar says side-hook-return while target contract says first-challenge-peel<br>semantic role is inferred rather than directly accepted from a path label<br>runtime exit side left does not clearly read as lower-sides peel-off |

## Guardrails

- Spacing/readability pass: true; spacing 0.676, bunching 0.321
- Scoreable routes pass: true; score 5.6, active windows 61
- Safety pass: true; no shots true, no attacks true, no losses true, no contacts true

## Authority And Metric Debt

- Human-vs-CPU field conflict rows: 4
- Target-vs-runtime authority conflict rows: 4
- Strict weak rows: 5

- Group 1: aggregate object-track 2.4/10 below floor; primary object-track 2.4/10 below floor; human-vs-CPU field occupancy conflict exists
- Group 2: aggregate object-track 4/10 below floor; primary object-track 3.1/10 below floor; human-vs-CPU field occupancy conflict exists
- Group 3: aggregate object-track 2/10 below floor; primary object-track 1/10 below floor; target-vs-runtime authority conflict exists; human-vs-CPU field occupancy conflict exists
- Group 4: aggregate object-track 4/10 below floor; primary object-track 1.7/10 below floor; human-vs-CPU field occupancy conflict exists
- Group 5: aggregate object-track 3.7/10 below floor; primary object-track 3.7/10 below floor; target-vs-runtime authority conflict exists

## Reuse Read

Reusable mechanics:
- external candidate input with non-overwriting predicted runtime vectors
- RED artifact loading and group-by-group comparison
- object-track fit against aggregate and primary target vectors
- guardrail normalization for spacing/readability, scoreable routes, and challenge safety
- path-family order and authority-conflict reporting
- field-occupancy tension rows that keep human-visible and CPU/geometry reads separate
- process-keeper vs runtime-keeper separation

Temporary Stage 3 code:
- the top-right bee-line and late top-left butterfly-line expectations are currently declared in this analyzer until the RED schema owns reusable role contracts
- upper-band scoreability scoring is Stage 3-specific because Stage 7 used lower-field timing pressure as the dominant semantic issue
- peel-off readability uses simple entry/exit-side compatibility until a reusable gesture vocabulary exists

## Blockers

- none
