# Aurora Stage 4 Lane7 Pressure Regression

Generated: `2026-05-07T13:11:10.305Z`

## Problem

The archived Stage 4 lane7 pressure loss is input-sensitive. A conformance improvement is only useful if the platform can keep measuring the recovered pressure window automatically.

## Strategy

Promote the best input-sensitivity sweep variant into a controlled-clock sampler scenario and assert that it still produces an enemy-body-contact loss inside the source danger window.

## Success Measure

The scenario produces at least one `enemy_collision` ship loss between stage clocks 13.65 and 14.05, or close pressure geometry with contact score <= 12.

## Result

- Outcome: pass
- Matching loss: none
- Best expected-window contact: {"stageClock":13.677,"player":{"x":195.91,"y":340,"vx":0,"spawn":0},"id":675911940,"type":"but","column":1,"row":0,"lane":6,"dive":5,"x":180.82,"y":358.5,"dx":15.09,"dy":18.5,"marginX":4.86,"marginY":9.935,"contactScore":9.935,"colliding":false}
- Close pressure: yes
- Losses: []

## Note

The controlled-clock primitive now advances exact requested durations. Under that stricter timing model this target currently preserves close pressure rather than reproducing the archived loss exactly.
