# Aurora Stage 4 Lane7 Input Sensitivity Sweep

Generated: `2026-05-07T11:51:57.505Z`

## Problem

A real Stage 4 lane7 boss-contact loss exists in the pressure archive, but exact key-event replay did not reproduce that specific loss. This makes subjective tuning risky: the gap may be replay/input precision instead of missing gameplay pressure.

## Strategy

Replay the archived lane7 source session under controlled clock and sweep small key-event timing shifts around the danger turn. Sample player/attacker geometry at 60 Hz and compare each variant to the source loss position, expected loss window, and contact score.

## Success Measure

The sweep identifies whether small timing shifts can reproduce collision geometry or near-contact geometry, and records the player-position delta at the source loss time for future replay precision work.

## Results

- `source-turn-pair-early-0.25`: best=4.38, source-time player x delta=-79.95, diagnosis=controlled sweep kept the threat close but outside collision bounds
- `source-turn-pair-early-0.20`: best=4.38, source-time player x delta=-67.91, diagnosis=controlled sweep kept the threat close but outside collision bounds
- `source-turn-pair-early-0.35`: best=4.6, source-time player x delta=-90.59, diagnosis=controlled sweep kept the threat close but outside collision bounds
- `source-after-10s-early-0.10`: best=5.32, source-time player x delta=-12.3, diagnosis=controlled sweep kept the threat close but outside collision bounds
- `hand-scenario`: best=9.935, source-time player x delta=-25.49, diagnosis=controlled sweep kept the threat close but outside collision bounds
- `source-turn-pair-early-0.15`: best=10.05, source-time player x delta=-51.69, diagnosis=controlled sweep kept the threat close but outside collision bounds
- `source-after-10s-early-0.05`: best=14.8, source-time player x delta=-16.62, diagnosis=controlled sweep stayed outside the source collision geometry
- `source-after-10s-early-0.20`: best=16.12, source-time player x delta=-58.52, diagnosis=controlled sweep stayed outside the source collision geometry
- `source-turn-pair-early-0.10`: best=16.75, source-time player x delta=-54.73, diagnosis=controlled sweep stayed outside the source collision geometry
- `source-turn-pair-early-0.05`: best=25.26, source-time player x delta=-49.67, diagnosis=controlled sweep stayed outside the source collision geometry

## Recommendation

Do not promote `source-after-10s-early-0.35` as conformant yet: it recovers a nearby pressure loss, but outside the expected source danger window. Use it to tune replay/input precision.
