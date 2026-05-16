# Formation Boss Path Slot Extraction

This artifact samples Aurora runtime formation, boss, escort, and challenge-stage trajectories without changing gameplay.

Challenge windows are captured as no-fire reference-motion passes so killed enemies do not shorten the measured alien trajectories. Gameplay scoring and challenge-perfect probes remain separate.

- Score before reference cap: 9.8/10
- Capped path/slot score: 5.5/10
- Total tracks: 680
- Moving tracks: 680
- Boss moving tracks: 107
- Escort tracks: 22
- Slot coverage: 1

Problem: Boss entry and formation grammar needs frame-level path and rack-slot evidence before gameplay changes can be ranked precisely.

Plan: Extract runtime boss, escort, formation, and challenge trajectories first; then compare those trajectories to reference path families and use the scorer to select gameplay changes.

Success: Runtime extraction should hit the capped path/slot score, then reference-comparison work should lift the cap by adding Galaga-derived path/slot targets.

## Windows

| Window | Stage | Measurement | Tracks | Moving | Boss moving | Escorts | Slot tracks | SVG |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | --- |
| stage-1-baseline | 1 | scripted-gameplay-window | 40 | 40 | 4 | 1 | 40 | stage-1-baseline.svg |
| challenge-stage-candidate | 3 | challenge-reference-motion-no-player-fire | 80 | 80 | 4 | 0 | 80 | challenge-stage-candidate.svg |
| challenge-stage-scorpion-cross | 7 | challenge-reference-motion-no-player-fire | 80 | 80 | 14 | 0 | 80 | challenge-stage-scorpion-cross.svg |
| challenge-stage-stingray-hook | 11 | challenge-reference-motion-no-player-fire | 80 | 80 | 17 | 2 | 80 | challenge-stage-stingray-hook.svg |
| challenge-stage-boss-led-loop | 15 | challenge-reference-motion-no-player-fire | 80 | 80 | 21 | 6 | 80 | challenge-stage-boss-led-loop.svg |
| challenge-stage-crown-split-cascade | 19 | challenge-reference-motion-no-player-fire | 80 | 80 | 23 | 0 | 80 | challenge-stage-crown-split-cascade.svg |
| mid-run-pressure | 6 | scripted-gameplay-window | 40 | 40 | 4 | 2 | 40 | mid-run-pressure.svg |
| mid-run-entry-variant | 8 | scripted-gameplay-window | 40 | 40 | 4 | 2 | 40 | mid-run-entry-variant.svg |
| mid-run-pincer-variant | 10 | scripted-gameplay-window | 40 | 40 | 4 | 0 | 40 | mid-run-pincer-variant.svg |
| late-run-cleanup-or-failure | 12 | scripted-gameplay-window | 40 | 40 | 4 | 2 | 40 | late-run-cleanup-or-failure.svg |
| late-run-escort-variant | 14 | scripted-gameplay-window | 40 | 40 | 4 | 3 | 40 | late-run-escort-variant.svg |
| late-run-crown-entry | 16 | scripted-gameplay-window | 40 | 40 | 4 | 4 | 40 | late-run-crown-entry.svg |
