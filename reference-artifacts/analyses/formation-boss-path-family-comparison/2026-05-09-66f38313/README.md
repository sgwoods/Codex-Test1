# Formation Boss Path Family Comparison

This artifact classifies extracted Aurora boss, escort, rack-settle, and challenge-stage trajectories into reusable path families.

- Score: 6.8/10
- Score before cap: 9.9/10
- Reference comparison cap: 6.8/10
- Confidence: 0.64
- Classified tracks: 520/520
- Expected family coverage: 1

Problem: Boss and formation conformance needs not just path capture, but a reusable grammar that distinguishes rack-settle, boss, escort, pressure-dive, and challenge-stage path families.

Plan: Classify extracted runtime paths into Galaga-like reference families, score coverage with a confidence/cap penalty, and use the result to select future reference-labeling or gameplay-tuning investments.

Success: Raise path-family score above the heuristic cap only after reference contact sheets or video-derived path labels can compare boss, escort, rack, and challenge trajectories directly.

## Families

| Family | Target | Observed | Coverage | Examples |
| --- | ---: | ---: | ---: | --- |
| Rack slot settle | 5 | 360 | 1 | regular:regular:969422282, regular:regular:684708567, regular:regular:54585824, regular:regular:955225200, regular:regular:204165053, regular:regular:430616322 |
| Entry arc to rack | 5 | 359 | 1 | regular:regular:969422282, regular:regular:684708567, regular:regular:54585824, regular:regular:955225200, regular:regular:204165053, regular:regular:430616322 |
| Boss entry or dive | 4 | 76 | 1 | regular:regular:955225200, regular:regular:204165053, regular:regular:430616322, regular:regular:808136305, challenge:challenge:442231940, challenge:challenge:961215851 |
| Escort paired dive | 2 | 21 | 1 | regular:regular:495474296, regular:regular:593546258, regular:regular:976651071, regular:regular:781982328, regular:regular:886246380, regular:regular:67357575 |
| Challenge lane wave | 1 | 160 | 1 | challenge:challenge:442231940, challenge:challenge:961215851, challenge:challenge:119064950, challenge:challenge:721524834, challenge:challenge:926206961, challenge:challenge:998228731 |
| Challenge sweeping path | 1 | 142 | 1 | challenge:challenge:442231940, challenge:challenge:961215851, challenge:challenge:926206961, challenge:challenge:998228731, challenge:challenge:71704346, challenge:challenge:523718549 |

## Windows

| Window | Stage | Families | Classified Tracks |
| --- | ---: | --- | ---: |
| stage-1-baseline | 1 | boss-entry-or-dive, boss-looping-arc, entry-arc-to-rack, escort-paired-dive, rack-slot-settle | 40/40 |
| challenge-stage-candidate | 3 | boss-entry-or-dive, boss-looping-arc, challenge-lane-wave, challenge-sweeping-path, entry-arc-to-rack, entry-scorpion-stagger-entry, player-pressure-dive, rack-slot-settle | 80/80 |
| challenge-stage-scorpion-cross | 7 | boss-entry-or-dive, boss-looping-arc, challenge-cross-sweep, challenge-lane-wave, challenge-sweeping-path, entry-arc-to-rack, entry-stingray-wide-flank-entry, player-pressure-dive, rack-slot-settle | 80/80 |
| challenge-stage-stingray-hook | 11 | boss-entry-or-dive, boss-looping-arc, challenge-hook-arc, challenge-lane-wave, challenge-sweeping-path, entry-arc-to-rack, entry-galboss-low-hook-entry, player-pressure-dive, rack-slot-settle | 80/80 |
| challenge-stage-boss-led-loop | 15 | boss-entry-or-dive, boss-looping-arc, challenge-boss-led-loop, challenge-lane-wave, challenge-sweeping-path, entry-arc-to-rack, entry-late-boss-column-weave, escort-paired-dive, player-pressure-dive, rack-slot-settle | 80/80 |
| mid-run-pressure | 6 | boss-entry-or-dive, boss-looping-arc, entry-arc-to-rack, entry-scorpion-stagger-entry, escort-paired-dive, rack-slot-settle | 40/40 |
| mid-run-entry-variant | 8 | boss-entry-or-dive, boss-looping-arc, entry-arc-to-rack, entry-stingray-wide-flank-entry, escort-paired-dive, rack-slot-settle | 40/40 |
| late-run-cleanup-or-failure | 12 | boss-entry-or-dive, boss-looping-arc, entry-arc-to-rack, entry-galboss-low-hook-entry, escort-paired-dive, rack-slot-settle | 40/40 |
| late-run-escort-variant | 14 | boss-entry-or-dive, boss-looping-arc, entry-arc-to-rack, entry-late-boss-column-weave, escort-paired-dive, rack-slot-settle | 40/40 |
