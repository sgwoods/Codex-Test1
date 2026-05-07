# Stage 4 Lane 2 Priority Dive Candidate

## Problem

Archived Stage 4 source evidence contains a butterfly pressure/loss window near lane 2 at
stageClock 15.25. The current random attacker scheduler did not reliably select the source
column butterfly early enough, so source-exact player inputs could pass through the window
without a comparable lower-field body-contact threat.

## Strategy

Measure a probe ladder first, then promote the smallest useful runtime candidate:

- force one Stage 4, non-challenge, column-5 row-1 butterfly to start an existing `startDive`
  attack between stageClock 13.85 and 14.00
- reset the one-shot flag on every stage spawn
- preserve the existing dive path, collision, event logging, and scoring behavior

This is intentionally a scheduling change, not a collision-radius or scripted-loss change.

## Measured Results

- Action-precision analyzer:
  - variants: 27
  - variants with source-column dive: 27
  - variants with source-column lower-field presence: 27
  - variants with close lane threat: 25
  - current source-exact contact score: 1.97
  - best candidate variant: `source-exact-final-turn-3-frames-earlier`, contact score 0.65
- Geometry analyzer:
  - lane-2 best expected contact score: 1.97
  - diagnosis: near-contact window; small timing/player drift can decide loss
- Source/replay comparison:
  - near replay windows: 2/3
- Loss-window gate:
  - exact replay windows: 0/3
  - same-window or exact pressure-collision windows: 2/3
  - lane-2 video-backed probe: same-window alternate collision
  - later boss-window video-backed probe: blocked before source window by the new lane-2 pressure
- Quality score:
  - overall quality remains 9.1/10
  - level-arc score is 8.3/10, down from the prior 8.4/10 snapshot

## Assessment

This is a qualified advancement. It improves measured Stage 4 pressure shape by creating a
real lower-field lane-2 threat with the correct source-column attacker, and it raises
pressure-collision replay diagnostics to 2/3. It does not yet improve exact replay
reproduction, and it creates a measurable interaction with the later boss-window probe.

## Next Recommended Step

Keep this as a measured candidate only if the next cycle targets exactness rather than more
pressure. The next candidate should try to preserve the lane-2 source-column dive while
recovering the boss-window probe and level-arc score, probably by tuning the priority timing
or attacker selection conditions rather than by changing collision geometry.
