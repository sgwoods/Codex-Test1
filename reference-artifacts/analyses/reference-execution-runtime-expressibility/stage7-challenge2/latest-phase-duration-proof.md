# Stage 7 Phase-Duration Runtime Expressibility Proof

Generated: 2026-06-08T16:26:22.438Z
Commit: d4de278ad
Branch: codex/macbook-pro-1.4.1-stage7-object-track-keeper

Source-ready for candidates: false

Browser-visible effect confirmed: true

## Compiler Contract

| Semantic field | Generated runtime field | Runtime consumes | Expected visible effect | Proof status |
| --- | --- | --- | --- | --- |
| visibleStartS | groupSpawnOffsets[groupIndex-1] or motionSpecGroups[groupIndex-1].spawnOffsetS | true | moves a group visible window earlier/later relative to other groups | browser-proof-pass |
| phaseDurationS / visibleEndS | motionSpecGroups[groupIndex-1].phaseDurations.trackS | true | changes when the reference path enters its exit/overrun phase | browser-proof-pass |
| phaseDurationS / visibleEndS | groupReferencePaths[groupIndex-1].playbackScale | true | stretches or compresses reference path playback in browser-visible time | browser-proof-pass |
| exitDurationS | motionSpecGroups[groupIndex-1].phaseDurations.exitS | false | none until runtime implements this field | blocked-unconsumed-field |

## Browser Proof Variants

| Variant | Control | Group | Visible effect | Motion/profile proxy | Group 4/5 preserved | Effect score (s) |
| --- | --- | ---: | --- | --- | --- | ---: |
| spawn-offset-group2-plus-0.45 | groupSpawnOffsets[1] | 2 | true | false | true | 0.5 |
| track-duration-group1-shorter-0.62x | motionSpecGroups[0].phaseDurations.trackS | 1 | true | false | true | 0.75 |
| playback-scale-group1-slower-0.55 | groupReferencePaths[0].playbackScale | 1 | true | false | true | 2 |

## Decision

phase-duration-rebalance now has a concrete runtime-consumed control contract and browser-visible proof, but no current semantic batch candidate is source-ready from this proof alone.
