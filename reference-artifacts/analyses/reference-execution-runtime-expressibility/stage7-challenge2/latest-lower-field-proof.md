# Stage 7 Lower-Field Runtime Expressibility Proof

Generated: 2026-06-08T17:46:42.833Z
Commit: bf4ea169c
Branch: codex/macbook-pro-1.4.1-stage7-object-track-keeper

Source-ready for candidates: false

Semantic transform: lower-field-overstay-reduction

Candidate: stage7-semantic-lower-field-overstay-reduction-0.1

## Compiled Controls

| Runtime field | Value | Runtime consumes | Consumed by proof | Applied layout targets |
| --- | ---: | --- | --- | --- |
| motionSpecGroups[1].controls.lowerFieldBias | 36 | true | true | motionSpecGroups[1].controls.lowerFieldBias: 0 -> 36 |
| motionSpecGroups[1].controls.yOffset | 0 | true | true | motionSpecGroups[1].controls.yOffset: 0 -> 0 |

## Target Group Movement

| Group | Baseline lower share | Compiled lower share | Lower share delta | Mean Y delta px | Y range delta | Path length delta | Intended direction | Actual direction | Visible movement | Direction pass |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- |
| 2 | 0.6667 | 0.6667 | 0 | 0.01 | 0.0003 | 0.0002 | reduce-lower-field-share | held | false | false |

## Protected Groups

Group 4/5 preserved: true

| Group | Lower share delta | Y range delta | Path length delta | Start delta | End delta | Pass |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 4 | 0 | 0 | 0 | 0 | 0 | true |
| 5 | 0 | 0 | 0 | 0 | 0 | true |

## Guardrails

- Motion/profile proxy pass: false
- Spacing/readability pass: false; spacing 0.592, bunching 0.452
- Scoreable routes pass: true
- Safety pass: true; no shots true, no attacks true, no losses true

## Blockers

- guardrail-regression: The compiled lower-field controls do not pass the focused motion/profile proxy.
- guardrail-regression: The compiled lower-field controls reduce spacing/readability below the Stage 7 floor.
- not-runtime-expressible: Group 2 did not show enough browser-visible lower-field movement.
- not-runtime-expressible: Group 2 movement did not reduce lower-field overstay in the intended direction.

## Decision

lower-field-overstay-reduction remains analysis-only under the current lowerFieldBias/yOffset projection. Pause Stage 7 candidate work and apply the RED pipeline front-first to Stage 3.
