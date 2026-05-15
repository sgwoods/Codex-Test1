# Formation Boss Path Slot Extraction

This artifact samples Aurora runtime formation, boss, escort, and challenge-stage trajectories without changing gameplay.

- Score before reference cap: 9.8/10
- Capped path/slot score: 5.5/10
- Total tracks: 600
- Moving tracks: 591
- Boss moving tracks: 85
- Escort tracks: 20
- Slot coverage: 1

Problem: Boss entry and formation grammar needs frame-level path and rack-slot evidence before gameplay changes can be ranked precisely.

Plan: Extract runtime boss, escort, formation, and challenge trajectories first; then compare those trajectories to reference path families and use the scorer to select gameplay changes.

Success: Runtime extraction should hit the capped path/slot score, then reference-comparison work should lift the cap by adding Galaga-derived path/slot targets.

## Windows

| Window | Stage | Tracks | Moving | Boss moving | Escorts | Slot tracks | SVG |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| stage-1-baseline | 1 | 40 | 40 | 4 | 1 | 40 | stage-1-baseline.svg |
| challenge-stage-candidate | 3 | 80 | 76 | 12 | 0 | 80 | challenge-stage-candidate.svg |
| challenge-stage-scorpion-cross | 7 | 80 | 80 | 14 | 0 | 80 | challenge-stage-scorpion-cross.svg |
| challenge-stage-stingray-hook | 11 | 80 | 79 | 14 | 0 | 80 | challenge-stage-stingray-hook.svg |
| challenge-stage-boss-led-loop | 15 | 80 | 76 | 17 | 3 | 80 | challenge-stage-boss-led-loop.svg |
| mid-run-pressure | 6 | 40 | 40 | 4 | 2 | 40 | mid-run-pressure.svg |
| mid-run-entry-variant | 8 | 40 | 40 | 4 | 4 | 40 | mid-run-entry-variant.svg |
| mid-run-pincer-variant | 10 | 40 | 40 | 4 | 0 | 40 | mid-run-pincer-variant.svg |
| late-run-cleanup-or-failure | 12 | 40 | 40 | 4 | 2 | 40 | late-run-cleanup-or-failure.svg |
| late-run-escort-variant | 14 | 40 | 40 | 4 | 3 | 40 | late-run-escort-variant.svg |
| late-run-crown-entry | 16 | 40 | 40 | 4 | 5 | 40 | late-run-crown-entry.svg |
