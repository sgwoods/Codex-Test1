# Formation Boss Path Family Comparison

This artifact classifies extracted Aurora boss, escort, rack-settle, and challenge-stage trajectories into reusable path families.

- Score: 8.2/10
- Score before cap: 10/10
- Reference comparison cap: 8.2/10
- Reference cap reason: media-backed-reference-label-cap
- Confidence: 0.8
- Classified tracks: 680/680
- Expected family coverage: 1
- Reference labels: 6 regular / 4 challenge
- Trajectory-vector comparison: 5.5/10 (reference-trajectory-vector-comparison-active-no-cap-lift)

Problem: Boss and formation conformance needs not just path capture, but a reusable grammar that distinguishes rack-settle, boss, escort, pressure-dive, and challenge-stage path families.

Plan: Classify extracted runtime paths into Galaga-like reference families, score coverage with a confidence/cap penalty, and use the result to select future reference-labeling or gameplay-tuning investments.

Success: Raise path-family score beyond the label-backed cap (8.2/10) only after reference trajectories are tracked against Aurora paths, not just labeled by contact-sheet family. Current trajectory-vector score is 5.5/10.

## Families

| Family | Target | Observed | Coverage | Examples |
| --- | ---: | ---: | ---: | --- |
| Rack slot settle | 5 | 480 | 1 | regular:regular:969422282, regular:regular:684708567, regular:regular:54585824, regular:regular:955225200, regular:regular:204165053, regular:regular:430616322 |
| Entry arc to rack | 5 | 480 | 1 | regular:regular:969422282, regular:regular:684708567, regular:regular:54585824, regular:regular:955225200, regular:regular:204165053, regular:regular:430616322 |
| Boss entry or dive | 4 | 107 | 1 | regular:regular:955225200, regular:regular:204165053, regular:regular:430616322, regular:regular:808136305, regular:regular:677910331, regular:regular:573928647 |
| Escort paired dive | 2 | 22 | 1 | regular:regular:495474296, regular:regular:55735812, regular:regular:161653840, regular:regular:297646198, regular:regular:886246380, regular:regular:719362354 |
| Challenge lane wave | 1 | 200 | 1 | challenge:challenge:442231940, challenge:challenge:961215851, challenge:challenge:119064950, challenge:challenge:721524834, challenge:challenge:926206961, challenge:challenge:998228731 |
| Challenge sweeping path | 1 | 200 | 1 | challenge:challenge:442231940, challenge:challenge:961215851, challenge:challenge:119064950, challenge:challenge:721524834, challenge:challenge:926206961, challenge:challenge:998228731 |

## Windows

| Window | Stage | Families | Classified Tracks |
| --- | ---: | --- | ---: |
| stage-1-baseline | 1 | boss-entry-or-dive, boss-looping-arc, entry-arc-to-rack, escort-paired-dive, rack-slot-settle | 40/40 |
| challenge-stage-candidate | 3 | boss-entry-or-dive, boss-looping-arc, challenge-first-challenge-peel, challenge-lane-wave, challenge-sweeping-path, entry-arc-to-rack, entry-scorpion-stagger-entry, player-pressure-dive, rack-slot-settle | 80/80 |
| challenge-stage-scorpion-cross | 7 | boss-entry-or-dive, boss-looping-arc, challenge-boss-led-loop, challenge-cross-sweep, challenge-hook-arc, challenge-lane-wave, challenge-sweeping-path, entry-arc-to-rack, entry-stingray-wide-flank-entry, player-pressure-dive, rack-slot-settle | 80/80 |
| challenge-stage-stingray-hook | 11 | boss-entry-or-dive, boss-looping-arc, challenge-boss-led-loop, challenge-cross-sweep, challenge-hook-arc, challenge-lane-wave, challenge-sweeping-path, entry-arc-to-rack, entry-galboss-low-hook-entry, escort-paired-dive, player-pressure-dive, rack-slot-settle | 80/80 |
| challenge-stage-boss-led-loop | 15 | boss-entry-or-dive, boss-looping-arc, challenge-boss-led-loop, challenge-crown-split-cascade, challenge-hook-arc, challenge-lane-wave, challenge-sweeping-path, entry-arc-to-rack, entry-crown-looping-split-entry, escort-paired-dive, player-pressure-dive, rack-slot-settle | 80/80 |
| challenge-stage-crown-split-cascade | 19 | boss-entry-or-dive, boss-looping-arc, challenge-boss-led-loop, challenge-crown-split-cascade, challenge-hook-arc, challenge-lane-wave, challenge-sweeping-path, entry-arc-to-rack, entry-crown-looping-split-entry, player-pressure-dive, rack-slot-settle | 80/80 |
| mid-run-pressure | 6 | boss-entry-or-dive, boss-looping-arc, entry-arc-to-rack, entry-scorpion-tandem-hook-entry, escort-paired-dive, rack-slot-settle | 40/40 |
| mid-run-entry-variant | 8 | boss-entry-or-dive, boss-looping-arc, entry-arc-to-rack, entry-stingray-wide-flank-entry, escort-paired-dive, rack-slot-settle | 40/40 |
| mid-run-pincer-variant | 10 | boss-entry-or-dive, boss-looping-arc, entry-arc-to-rack, entry-stingray-pincer-entry, rack-slot-settle | 40/40 |
| late-run-cleanup-or-failure | 12 | boss-entry-or-dive, boss-looping-arc, entry-arc-to-rack, entry-galboss-low-hook-entry, escort-paired-dive, rack-slot-settle | 40/40 |
| late-run-escort-variant | 14 | boss-entry-or-dive, boss-looping-arc, entry-arc-to-rack, entry-late-boss-column-drop-weave, escort-paired-dive, rack-slot-settle | 40/40 |
| late-run-crown-entry | 16 | boss-entry-or-dive, boss-looping-arc, entry-arc-to-rack, entry-crown-looping-split-entry, escort-paired-dive, rack-slot-settle | 40/40 |
