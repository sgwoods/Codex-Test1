# Galaxy Guardians Routeability Review

Generated: 2026-06-05T09:52:58.836Z
Status: dev-preview-routeability-gate-planning-not-runtime-promotion

## Summary

Guardians routeability is 5.4/10. The weakest route is midrun-stage-five-stress at 4.5/10, which keeps stage-five-and-beyond movement work behind a player-routeability gate before any pressure or movement candidate should be promoted.

## Group Scores

| Group | Routeability | Runs | Survival | Progression | Collision Losses | Read |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| competitive-three-ship | 5.4/10 | 4 | 44% | 8% | 17% | competitive-three-ship averages 5.4/10 routeability, 44% survival share, 8% progression share, and 17% collision-loss share. |
| review-five-ship | 6.7/10 | 3 | 87% | 22% | 13% | review-five-ship averages 6.7/10 routeability, 87% survival share, 22% progression share, and 13% collision-loss share. |
| midrun-stage-five-stress | 4.5/10 | 3 | 60% | 0% | 80% | midrun-stage-five-stress averages 4.5/10 routeability, 60% survival share, 0% progression share, and 80% collision-loss share. |

## Persona Runs

| Group | Persona | Start Stage | Final Stage | Routeability | Score | Sim Time | End |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| competitive-three-ship | novice | 1 | 1 | 4.3/10 | 530 | 23.983s | alien_scout_collision |
| competitive-three-ship | advanced | 1 | 1 | 4.8/10 | 800 | 30.35s | enemy_shot |
| competitive-three-ship | expert | 1 | 2 | 7.5/10 | 3420 | 179.5s | active |
| competitive-three-ship | professional | 1 | 1 | 4.9/10 | 830 | 80.8s | enemy_shot |
| review-five-ship | advanced | 1 | 1 | 5.1/10 | 2000 | 146.817s | enemy_shot |
| review-five-ship | expert | 1 | 2 | 7.3/10 | 4440 | 239.983s | active |
| review-five-ship | professional | 1 | 2 | 7.6/10 | 2190 | 239.633s | active |
| midrun-stage-five-stress | advanced | 5 | 5 | 3.8/10 | 970 | 50.55s | alien_scout_collision |
| midrun-stage-five-stress | expert | 5 | 5 | 4.2/10 | 1430 | 71.15s | alien_scout_collision |
| midrun-stage-five-stress | professional | 5 | 5 | 5.4/10 | 1190 | 93.2s | enemy_shot |

## Promotion Policy

Future Guardians movement candidates should not be promoted only because dive cadence, object tracks, or pressure metrics become more reference-like. They should also preserve or improve routeability: stronger personas must retain learnable survival/scoring windows, midrun stage-five stress must not become collision-dominated, and shot/dive pressure must remain readable enough for persona review to convert pressure into clears.
