# Stage 7 Phase-Duration Runtime Expressibility Proof

Generated: 2026-06-08T17:25:49.733Z
Commit: 83e96c452
Branch: codex/macbook-pro-1.4.1-stage7-object-track-keeper

Source-ready for candidates: false

Browser-visible effect confirmed: true

Motion/profile-compatible compiled proof: false

Candidate: stage7-semantic-phase-align-protect-0.1

## Compiler Contract

| Semantic field | Generated runtime field | Runtime consumes | Expected visible effect | Proof status |
| --- | --- | --- | --- | --- |
| visibleStartS | groupSpawnOffsets[groupIndex-1] or motionSpecGroups[groupIndex-1].spawnOffsetS | true | moves a group visible window earlier/later relative to other groups | browser-proof-pass |
| phaseDurationS / visibleEndS | motionSpecGroups[groupIndex-1].phaseDurations.trackS | true | changes when the reference path enters its exit/overrun phase | browser-proof-pass |
| phaseDurationS / visibleEndS | groupReferencePaths[groupIndex-1].playbackScale | true | stretches or compresses reference path playback in browser-visible time | browser-proof-pass |
| exitDurationS | motionSpecGroups[groupIndex-1].phaseDurations.exitS | false | none until runtime implements this field | blocked-unconsumed-field |

## Compiled Semantic Candidate

Intended phase groups: 1, 2, 3

Protected groups: 4, 5

| Runtime field | Value | Runtime consumes | Applied layout targets |
| --- | ---: | --- | --- |
| groupSpawnOffsets[0] or motionSpecGroups[0].spawnOffsetS | 0 | true | groupSpawnOffsets[0], motionSpecGroups[0].spawnOffsetS |
| motionSpecGroups[0].phaseDurations.trackS | 1.88 | true | motionSpecGroups[0].phaseDurations.trackS |
| groupReferencePaths[0].playbackScale | 0.931 | true | groupReferencePaths[0].playbackScale |
| groupSpawnOffsets[1] or motionSpecGroups[1].spawnOffsetS | 2.88 | true | groupSpawnOffsets[1], motionSpecGroups[1].spawnOffsetS |
| motionSpecGroups[1].phaseDurations.trackS | 3.5 | true | motionSpecGroups[1].phaseDurations.trackS |
| groupReferencePaths[1].playbackScale | 0.786 | true | groupReferencePaths[1].playbackScale |
| groupSpawnOffsets[2] or motionSpecGroups[2].spawnOffsetS | 4.25 | true | groupSpawnOffsets[2], motionSpecGroups[2].spawnOffsetS |
| motionSpecGroups[2].phaseDurations.trackS | 0.75 | true | motionSpecGroups[2].phaseDurations.trackS |
| groupReferencePaths[2].playbackScale | 1.4 | true | groupReferencePaths[2].playbackScale |

## Protected Timing

Protected group timing pass: true

| Group | Baseline window | Compiled window | Start delta | End delta | Duration delta | Pass |
| ---: | --- | --- | ---: | ---: | ---: | --- |
| 4 | 7.25-10.5 | 7.25-10.5 | 0 | 0 | 0 | true |
| 5 | 13.5-16.5 | 13.5-16.5 | 0 | 0 | 0 | true |

## Browser Proof Variants

| Variant | Control | Group | Visible effect | Motion/profile proxy | Group 4/5 preserved | Effect score (s) |
| --- | --- | ---: | --- | --- | --- | ---: |
| compiled-stage7-semantic-phase-align-protect-0.1 | compiledRuntimeControls.phaseDurationRebalance | null | true | false | true | 2 |
| spawn-offset-group2-plus-0.45 | groupSpawnOffsets[1] | 2 | true | false | true | 0.5 |
| track-duration-group1-shorter-0.62x | motionSpecGroups[0].phaseDurations.trackS | 1 | true | false | true | 0.75 |
| playback-scale-group1-slower-0.55 | groupReferencePaths[0].playbackScale | 1 | true | false | true | 2 |

## Failure Classification

- guardrail-regression: The compiled timing controls reduce spacing/readability below the Stage 7 challenge-motion-profile floor.

## Decision

phase-duration-rebalance has a candidate-specific compiler-transfer proof, but the compiled candidate is not source-ready until the listed blockers are resolved.
