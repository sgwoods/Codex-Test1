# Aurora Stage 4 Lane7 Input Sensitivity Sweep

Generated: `2026-05-07T11:41:05.701Z`

## Problem

A real Stage 4 lane7 boss-contact loss exists in the pressure archive, but exact key-event replay did not reproduce that specific loss. This makes subjective tuning risky: the gap may be replay/input precision instead of missing gameplay pressure.

## Strategy

Replay the archived lane7 source session under controlled clock and sweep small key-event timing shifts around the danger turn. Sample player/attacker geometry at 60 Hz and compare each variant to the source loss position and contact score.

## Success Measure

The sweep identifies whether small timing shifts can reproduce collision geometry or near-contact geometry, and records the player-position delta at the source loss time for future replay precision work.

## Results

- `source-after-10s-early-0.15`: best=0.67, source-time player x delta=35.17, diagnosis=controlled sweep reproduced a ship-loss event inside the source danger window
- `source-after-10s-late-0.15`: best=2.14, source-time player x delta=68.02, diagnosis=controlled sweep reached near-contact geometry; one-frame/input rounding can decide this pressure window
- `hand-scenario`: best=7.77, source-time player x delta=68.02, diagnosis=controlled sweep reproduced a ship-loss event inside the source danger window
- `source-after-10s-late-0.45`: best=22.55, source-time player x delta=68.02, diagnosis=controlled sweep stayed outside the source collision geometry
- `source-after-10s-late-0.30`: best=22.87, source-time player x delta=68.02, diagnosis=controlled sweep stayed outside the source collision geometry
- `source-after-10s-early-0.45`: best=58.29, source-time player x delta=35.17, diagnosis=controlled sweep stayed outside the source collision geometry
- `source-turn-pair-late-0.30`: best=98.94, source-time player x delta=68.02, diagnosis=controlled sweep stayed outside the source collision geometry
- `source-after-10s-early-0.30`: best=151.91, source-time player x delta=-44.62, diagnosis=controlled sweep stayed outside the source collision geometry
- `source-turn-pair-early-0.75`: best=152.5, source-time player x delta=-165.06, diagnosis=controlled sweep stayed outside the source collision geometry
- `source-exact`: best=153.09, source-time player x delta=68.02, diagnosis=controlled sweep stayed outside the source collision geometry

## Recommendation

Promote `source-after-10s-early-0.15` into a deterministic regression scenario before changing gameplay constants; the archived pressure is recoverable through input timing.
