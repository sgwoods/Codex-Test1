# Temporal Contact Review And Opportunity Design

October4,2026. Baseline daa9448c, unchanged gameplay/build1210. Tool-only edits.
Four sequences,28 full-canvas PNGs: Stage31 green target372665405 and Stage39
blue target10852263, Classic Arcade and Aurora Crown graphics. Seven frames
each from -4 through +8 relative to baseline contact, every two60Hz ticks.
Report preserves resolved visual atmosphere, contact events, diagnostic positions,
PNG/source/bundle/method hashes. Before/after source/bundle immutability passes;
contact present at offset0, target diagnostics and resolved theme are asserted.

## Visual Finding

Lead inspected initial packet frames519 and525 for green, and674 for blue,
in arcade/crown. Green goes from above the ship into its visible body area;
blue exits crowd/interleave shapes at the player. Not blanket box-only overlaps.
These are visible crossing concerns to repair, not lethal combat or proof of
original-game divergence. Fresh asserted rerun preserves provenance and targets.
No contact waiver. Initial packet16-37-07 is exploratory, before added assertions.

## Next Repair Constraints

Use the real shot rules, not geometric dwell alone. Source review at daa9448c:
src/js/05-player-combat.js: challenge cooldown0.095s, two-live-bullet single-ship
cap, upward560px/s from playerY-18, swept segment top=min(previousY,y)-16,
bottom=max(previousY,y)+2, strict horizontal hitbox intersection. Challenge
targets1HP. Enemy-array traversal controls interception order.
src/js/05-player-flow.js: manual movement includes acceleration/reversal blending;
professional policy is not optimal manual control. Do not assume instantaneous
player positioning or equate a failed pilot with impossible gameplay.

Next bounded measurement: enumerate single-target feasible launch windows using
actual update/hit/removal order, then verify representative successful input
witnesses in runtime. Separate isolated target opportunity from board-aware
interception, player reachability, cooldown and bullet occupancy. Report window
duration/width, travel time and witness. Do not invent a reference-derived
minimum duration. Forty independent opportunities do not prove a perfect route.

Retained no-fire trajectories use rounded coordinates and change after kills;
avoid smooth interpolation through teleports. A new green exit must preserve
measured opportunities/full entry while joining continuously and avoiding the
observed ship crossing. Current endpoint translations failed per-target dwell;
no new curve parameters or gameplay keeper are justified by this packet alone.

Public packaged flow, full encounter, moving player and multi-seed coverage
remain open. Local persistence is not off-machine backup. No gameplay change,
professional sweep, main push or publication.
