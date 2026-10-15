# Challenge Contact Visual Review

October 4, 2026. Baseline19db19d0, docs/capture-tool-only dirty files.
Fresh development build: 1.4.1.1+build.1208.sha.19db19d0.dirty.
Run: node tools/harness/capture-challenge-contact-review.js.
Report records build identity, method/bundle/source hashes and each PNG SHA-256.
Canvas captured after controlled60Hz update/draw at each target's first contact.
No enemy/player state or path parameter is changed.

| Stage | Seed | Contacts | Bullets / attackers | Lives | Completed |
| --- | --- | --- | --- | --- | --- |
| 31 | 9131 | 4 | 0 / 0 | 3 -> 3 | yes |
| 35 | 9135 | 3 | 0 / 0 | 3 -> 3 | yes |
| 39 | 9139 | 7 | 0 / 0 | 3 -> 3 | yes |

All14 events report nonLethal=1. Safety observations are not a complete event-based
safety gate or evidence of readable/hittable opportunities.

## Lead Visual Findings

Fresh green captures at frame519 across all three stages show an alien immediately
above the player. First-frame appearance does not prove an inappropriate crossing.
Disposition remains unresolved, not accepted.

Fresh Stage35 target287155051/frame484 crowds the player's upper-right side.
Stage31 target709114509/frame681 appears to touch the lower-right edge.
Stage39 target10852263/frame670 visibly merges alien/player shapes at the ship.
These are visible-contact concerns, not established box-only false positives.
Keep them open for sequence review; do not waive them.

Raw report retains pending-visual-review for every contact. These provisional
observations are not per-target approval. Earlier exploratory frames were also
inspected; their older build identity is marked in that packet.

## Limits And Next Work

One stationary no-fire seed per stage, first contact frame only, default
crown-aurora theme. No arcade-theme, moving-player, pixel-mask, temporal crossing
or original-game conformance verdict. Original footage may be censored by shooting;
no separate Challenge9/10 reference is available. Local persistence is not backup.

Next capture before/through/after sequences for green and crowded blue exits,
including theme-specific sprites. The219.391px green phase jump is a separate
confirmed continuity defect. Independent review recommends an exit-only endpoint
anchoring experiment, preserving per-target dwell/full entry, Stage3/yellow keepers
and no-combat/no-loss safety. No accepted candidate; prior broad attempts rejected.
No gameplay change, legacy gate update, push or publication.

## Independent Review

Hypatia verified method/source hashes, all14 PNG hashes and exact event/diagnostic
agreement with the exploratory packet. Fresh frame670 retains the visible
crowding concern; frame519 separation cannot establish the full encounter.
Zero contacts accepted. Tool limitation: hashes are recorded after capture,
without a before/after immutability assertion. No concurrent source/build writer
was assigned in this cycle; require that assertion before using this as a gate.
