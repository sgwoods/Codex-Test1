# Level Visual Conformance Index

Generated: 2026-05-18T13:12:58.202Z
Commit: 215b3f98
Branch: codex/macbook-conformance-investment-review

## Summary

The generated index now contains 39 ordered rows: 31 regular levels and 8 challenging stages. Every row has a current Aurora runtime screenshot, an actual Galaga target-gameplay frame, and paired 10-second current/target gameplay clips for inline motion review. The important caveat is grounding quality: 14/39 target rows are exact ingested windows, while 25 regular-level rows use representative actual Galaga gameplay until a full per-level normal-stage corpus is ingested. Challenge-stage visual conformance remains the most human-visible failure: exact challenge target screenshots exist, but the strict challenge score is only 3.8/10.

| Order | Row | Kind | Status | Score | Target Grounding | Critical Gap |
| ---: | --- | --- | --- | ---: | --- | --- |
| 1 | Level 1 | regular | exact regular-stage target | n/a/10 | exact | Exact frame exists, but the current index still uses a single mid-level snapshot; next precision requires temporal path overlays and per-entry group labels. |
| 2 | Level 2 | regular | exact regular-stage target | n/a/10 | exact | Exact frame exists, but the current index still uses a single mid-level snapshot; next precision requires temporal path overlays and per-entry group labels. |
| 3 | Level 3 | regular | representative regular-stage target | n/a/10 | representative | Exact target frame for Level 3 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance. |
| 4 | Challenging Stage 1 (Levels 3-4) | challenge | strict challenge-stage scorer | 3.7/10 | exact | Movement conformance is only 3.3/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories. |
| 5 | Level 4 | regular | exact regular-stage target | n/a/10 | exact | Exact frame exists, but the current index still uses a single mid-level snapshot; next precision requires temporal path overlays and per-entry group labels. |
| 6 | Level 5 | regular | exact regular-stage target | n/a/10 | exact | Exact frame exists, but the current index still uses a single mid-level snapshot; next precision requires temporal path overlays and per-entry group labels. |
| 7 | Level 6 | regular | exact regular-stage target | n/a/10 | exact | Exact frame exists, but the current index still uses a single mid-level snapshot; next precision requires temporal path overlays and per-entry group labels. |
| 8 | Level 7 | regular | representative regular-stage target | n/a/10 | representative | Exact target frame for Level 7 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance. |
| 9 | Challenging Stage 2 (Levels 7-8) | challenge | strict challenge-stage scorer | 3.6/10 | exact | Movement conformance is only 3.4/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories. |
| 10 | Level 8 | regular | representative regular-stage target | n/a/10 | representative | Exact target frame for Level 8 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance. |
| 11 | Level 9 | regular | representative regular-stage target | n/a/10 | representative | Exact target frame for Level 9 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance. |
| 12 | Level 10 | regular | exact regular-stage target | n/a/10 | exact | Exact frame exists, but the current index still uses a single mid-level snapshot; next precision requires temporal path overlays and per-entry group labels. |
| 13 | Level 11 | regular | representative regular-stage target | n/a/10 | representative | Exact target frame for Level 11 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance. |
| 14 | Challenging Stage 3 (Levels 11-12) | challenge | strict challenge-stage scorer | 3.8/10 | exact | Movement conformance is only 3.5/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories. |
| 15 | Level 12 | regular | representative regular-stage target | n/a/10 | representative | Exact target frame for Level 12 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance. |
| 16 | Level 13 | regular | representative regular-stage target | n/a/10 | representative | Exact target frame for Level 13 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance. |
| 17 | Level 14 | regular | representative regular-stage target | n/a/10 | representative | Exact target frame for Level 14 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance. |
| 18 | Level 15 | regular | representative regular-stage target | n/a/10 | representative | Exact target frame for Level 15 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance. |
| 19 | Challenging Stage 4 (Levels 15-16) | challenge | strict challenge-stage scorer | 3.9/10 | exact | Movement conformance is only 3.7/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories. |
| 20 | Level 16 | regular | representative regular-stage target | n/a/10 | representative | Exact target frame for Level 16 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance. |
| 21 | Level 17 | regular | representative regular-stage target | n/a/10 | representative | Exact target frame for Level 17 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance. |
| 22 | Level 18 | regular | representative regular-stage target | n/a/10 | representative | Exact target frame for Level 18 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance. |
| 23 | Level 19 | regular | representative regular-stage target | n/a/10 | representative | Exact target frame for Level 19 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance. |
| 24 | Challenging Stage 5 (Levels 19-20) | challenge | strict challenge-stage scorer | 3.9/10 | exact | Movement conformance is only 3.7/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories. |
| 25 | Level 20 | regular | representative regular-stage target | n/a/10 | representative | Exact target frame for Level 20 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance. |
| 26 | Level 21 | regular | representative regular-stage target | n/a/10 | representative | Exact target frame for Level 21 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance. |
| 27 | Level 22 | regular | representative regular-stage target | n/a/10 | representative | Exact target frame for Level 22 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance. |
| 28 | Level 23 | regular | representative regular-stage target | n/a/10 | representative | Exact target frame for Level 23 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance. |
| 29 | Challenging Stage 6 (Levels 23-24) | challenge | strict challenge-stage scorer | 3.7/10 | exact | Movement conformance is only 3.2/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories. |
| 30 | Level 24 | regular | representative regular-stage target | n/a/10 | representative | Exact target frame for Level 24 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance. |
| 31 | Level 25 | regular | representative regular-stage target | n/a/10 | representative | Exact target frame for Level 25 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance. |
| 32 | Level 26 | regular | representative regular-stage target | n/a/10 | representative | Exact target frame for Level 26 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance. |
| 33 | Level 27 | regular | representative regular-stage target | n/a/10 | representative | Exact target frame for Level 27 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance. |
| 34 | Challenging Stage 7 (Levels 27-28) | challenge | strict challenge-stage scorer | 3.7/10 | exact | Movement conformance is only 3.4/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories. |
| 35 | Level 28 | regular | representative regular-stage target | n/a/10 | representative | Exact target frame for Level 28 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance. |
| 36 | Level 29 | regular | representative regular-stage target | n/a/10 | representative | Exact target frame for Level 29 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance. |
| 37 | Level 30 | regular | representative regular-stage target | n/a/10 | representative | Exact target frame for Level 30 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance. |
| 38 | Level 31 | regular | representative regular-stage target | n/a/10 | representative | Exact target frame for Level 31 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance. |
| 39 | Challenging Stage 8 (Levels 31-32) | challenge | strict challenge-stage scorer | 3.8/10 | exact | Movement conformance is only 3.4/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories. |

## Level 1

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-01.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-01.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-01.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-01.webm`

**Target source:** Galaga Stage 1 opening rack entry; exact target row.

**Current roles:** Bee / Zako: 20, Butterfly / escort: 16, Boss Galaga: 4

**Conformance read:** This row has an exact ingested Galaga regular-stage target frame. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band opening; target family regular-stage-entry.

**Current read:** Bee / Zako: 20, Butterfly / escort: 16, Boss Galaga: 4

**Critical gap:** Exact frame exists, but the current index still uses a single mid-level snapshot; next precision requires temporal path overlays and per-entry group labels.

**Next:** Add target/current motion overlays for the first two entry groups and boss/capture windows.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`

## Level 2

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-02.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-02.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-02.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-02.webm`

**Target source:** Galaga Stage 2 early formation entry; exact target row.

**Current roles:** Bee / Zako: 20, Butterfly / escort: 16, Boss Galaga: 4

**Conformance read:** This row has an exact ingested Galaga regular-stage target frame. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band opening; target family regular-stage-entry.

**Current read:** Bee / Zako: 20, Butterfly / escort: 16, Boss Galaga: 4

**Critical gap:** Exact frame exists, but the current index still uses a single mid-level snapshot; next precision requires temporal path overlays and per-entry group labels.

**Next:** Add target/current motion overlays for the first two entry groups and boss/capture windows.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`

## Level 3

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-03.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-03.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-03.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-03.webm`

**Target source:** Representative Galaga target: Stage 4 post-challenge rack entry; representative actual target gameplay row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 4

**Conformance read:** This row is honest about target debt: it uses actual Galaga gameplay from Representative Galaga target: Stage 4 post-challenge rack entry, but not an exact per-level target capture. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band early-pressure; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 4

**Critical gap:** Exact target frame for Level 3 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance.

**Next:** Ingest or extract a precise Galaga Level 3 window, then replace this representative target row.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Challenging Stage 1 (Levels 3-4)

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/challenge-01.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/challenge-01.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/challenge-01.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/challenge-01.webm`

**Target source:** Galaga Challenging Stage 1 (Levels 3-4); exact target row.

**Current roles:** Bee / Zako: 20, Butterfly / escort: 20

**Conformance read:** This is a no-combat bonus exhibition, so safety is only the floor. Current Aurora still reads weak on movement grammar, alien novelty, and graphical spectacle unless the strict scores here are materially higher than 6/10.

**Variation read:** Introductory challenge teaches vertical columns, simple side hooks, upper-band score windows, and the perfect-result loop.

**Current read:** first-challenge-peel / first-challenge-peel; lanes bee, bee, bee, bee, but, but, but, but; first-wave types bee, bee, bee, bee, but, but, but, but; visual families classic; strict movement 3.3/10, graphics 4.1/10, alien novelty 3.4/10, shot opportunity 5.7/10.

**Critical gap:** Movement conformance is only 3.3/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.

**Next:** Protect the first-challenge bee/butterfly line contract, then tune path length, turn count, and rack-slot precision against challenge-1 arrival and late-wave labels.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`

## Level 4

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-04.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-04.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-04.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-04.webm`

**Target source:** Galaga Stage 4 post-challenge rack entry; exact target row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 4

**Conformance read:** This row has an exact ingested Galaga regular-stage target frame. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band early-pressure; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 4

**Critical gap:** Exact frame exists, but the current index still uses a single mid-level snapshot; next precision requires temporal path overlays and per-entry group labels.

**Next:** Add target/current motion overlays for the first two entry groups and boss/capture windows.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Level 5

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-05.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-05.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-05.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-05.webm`

**Target source:** Galaga Stage 5 opening rack entry; exact target row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 4

**Conformance read:** This row has an exact ingested Galaga regular-stage target frame. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band early-pressure; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 4

**Critical gap:** Exact frame exists, but the current index still uses a single mid-level snapshot; next precision requires temporal path overlays and per-entry group labels.

**Next:** Add target/current motion overlays for the first two entry groups and boss/capture windows.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Level 6

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-06.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-06.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-06.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-06.webm`

**Target source:** Galaga Stage 6 capture and boss pressure; exact target row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 15, Boss Galaga: 4

**Conformance read:** This row has an exact ingested Galaga regular-stage target frame. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band early-pressure; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 15, Boss Galaga: 4

**Critical gap:** Exact frame exists, but the current index still uses a single mid-level snapshot; next precision requires temporal path overlays and per-entry group labels.

**Next:** Add target/current motion overlays for the first two entry groups and boss/capture windows.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Level 7

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-07.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-07.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-07.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-07.webm`

**Target source:** Representative Galaga target: Stage 6 capture and boss pressure; representative actual target gameplay row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 15, Boss Galaga: 4

**Conformance read:** This row is honest about target debt: it uses actual Galaga gameplay from Representative Galaga target: Stage 6 capture and boss pressure, but not an exact per-level target capture. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band capture-pressure; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 15, Boss Galaga: 4

**Critical gap:** Exact target frame for Level 7 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance.

**Next:** Ingest or extract a precise Galaga Level 7 window, then replace this representative target row.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Challenging Stage 2 (Levels 7-8)

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/challenge-02.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/challenge-02.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/challenge-02.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/challenge-02.webm`

**Target source:** Galaga Challenging Stage 2 (Levels 7-8); exact target row.

**Current roles:** Boss Galaga: 10, Butterfly / escort: 10, Captured / rogue fighter: 10, Specialty challenge alien: 6, Bee / Zako: 4

**Conformance read:** This is a no-combat bonus exhibition, so safety is only the floor. Current Aurora still reads weak on movement grammar, alien novelty, and graphical spectacle unless the strict scores here are materially higher than 6/10.

**Variation read:** Adds side-crossing and vertical red-column trains; groups arrive through visible route commitments rather than appearing in place.

**Current read:** scorpion-cross-sweep / cross-sweep; lanes but, boss, rogue, bee, bee, rogue, boss, but; first-wave types but, boss, rogue, bee, bee, rogue, boss, but; visual families classic; strict movement 3.4/10, graphics 3.9/10, alien novelty 3.4/10, shot opportunity 4.9/10.

**Critical gap:** Movement conformance is only 3.4/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.

**Next:** Tune challenge 2 toward the denser mixed-novelty-line reference instead of relying on a generic cross-sweep.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Captured / rogue fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/rogue-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`

## Level 8

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-08.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-08.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-08.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-08.webm`

**Target source:** Representative Galaga target: Stage 10 opening rack entry; representative actual target gameplay row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 15, Boss Galaga: 4

**Conformance read:** This row is honest about target debt: it uses actual Galaga gameplay from Representative Galaga target: Stage 10 opening rack entry, but not an exact per-level target capture. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band capture-pressure; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 15, Boss Galaga: 4

**Critical gap:** Exact target frame for Level 8 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance.

**Next:** Ingest or extract a precise Galaga Level 8 window, then replace this representative target row.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Level 9

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-09.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-09.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-09.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-09.webm`

**Target source:** Representative Galaga target: Stage 10 opening rack entry; representative actual target gameplay row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 15, Boss Galaga: 4

**Conformance read:** This row is honest about target debt: it uses actual Galaga gameplay from Representative Galaga target: Stage 10 opening rack entry, but not an exact per-level target capture. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band capture-pressure; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 15, Boss Galaga: 4

**Critical gap:** Exact target frame for Level 9 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance.

**Next:** Ingest or extract a precise Galaga Level 9 window, then replace this representative target row.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Level 10

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-10.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-10.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-10.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-10.webm`

**Target source:** Galaga Stage 10 opening rack entry; exact target row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 4

**Conformance read:** This row has an exact ingested Galaga regular-stage target frame. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band capture-pressure; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 4

**Critical gap:** Exact frame exists, but the current index still uses a single mid-level snapshot; next precision requires temporal path overlays and per-entry group labels.

**Next:** Add target/current motion overlays for the first two entry groups and boss/capture windows.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Level 11

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-11.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-11.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-11.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-11.webm`

**Target source:** Representative Galaga target: Stage 10 opening rack entry; representative actual target gameplay row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 15, Boss Galaga: 4

**Conformance read:** This row is honest about target debt: it uses actual Galaga gameplay from Representative Galaga target: Stage 10 opening rack entry, but not an exact per-level target capture. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band mid-loop; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 15, Boss Galaga: 4

**Critical gap:** Exact target frame for Level 11 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance.

**Next:** Ingest or extract a precise Galaga Level 11 window, then replace this representative target row.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Challenging Stage 3 (Levels 11-12)

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/challenge-03.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/challenge-03.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/challenge-03.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/challenge-03.webm`

**Target source:** Galaga Challenging Stage 3 (Levels 11-12); exact target row.

**Current roles:** Boss Galaga: 13, Butterfly / escort: 9, Captured / rogue fighter: 8, Challenge dragonfly family: 4, Specialty challenge alien: 2

**Conformance read:** This is a no-combat bonus exhibition, so safety is only the floor. Current Aurora still reads weak on movement grammar, alien novelty, and graphical spectacle unless the strict scores here are materially higher than 6/10.

**Variation read:** Blue side hooks and green novelty shapes make the third challenge visually distinct and less column-like.

**Current read:** stingray-crown-hook-hybrid / hook-arc; lanes boss, rogue, but, bee, boss, bee, but, rogue; first-wave types boss, rogue, but, bee, boss, bee, but, rogue; visual families dragonfly; strict movement 3.5/10, graphics 4.4/10, alien novelty 3.4/10, shot opportunity 4.7/10.

**Critical gap:** Movement conformance is only 3.5/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.

**Next:** Promote challenge-3 boss-led reference phases and score dragonfly visual novelty as animation, not only family label.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`
- Captured / rogue fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/rogue-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Challenge dragonfly family: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Level 12

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-12.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-12.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-12.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-12.webm`

**Target source:** Representative Galaga target: Stage 10 opening rack entry; representative actual target gameplay row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 3

**Conformance read:** This row is honest about target debt: it uses actual Galaga gameplay from Representative Galaga target: Stage 10 opening rack entry, but not an exact per-level target capture. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band mid-loop; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 3

**Critical gap:** Exact target frame for Level 12 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance.

**Next:** Ingest or extract a precise Galaga Level 12 window, then replace this representative target row.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Level 13

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-13.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-13.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-13.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-13.webm`

**Target source:** Representative Galaga target: Stage 10 opening rack entry; representative actual target gameplay row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 3

**Conformance read:** This row is honest about target debt: it uses actual Galaga gameplay from Representative Galaga target: Stage 10 opening rack entry, but not an exact per-level target capture. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band mid-loop; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 3

**Critical gap:** Exact target frame for Level 13 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance.

**Next:** Ingest or extract a precise Galaga Level 13 window, then replace this representative target row.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Level 14

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-14.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-14.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-14.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-14.webm`

**Target source:** Representative Galaga target: Stage 10 opening rack entry; representative actual target gameplay row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 15, Boss Galaga: 4

**Conformance read:** This row is honest about target debt: it uses actual Galaga gameplay from Representative Galaga target: Stage 10 opening rack entry, but not an exact per-level target capture. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band mid-loop; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 15, Boss Galaga: 4

**Critical gap:** Exact target frame for Level 14 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance.

**Next:** Ingest or extract a precise Galaga Level 14 window, then replace this representative target row.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Level 15

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-15.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-15.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-15.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-15.webm`

**Target source:** Representative Galaga target: Stage 10 opening rack entry; representative actual target gameplay row.

**Current roles:** Specialty challenge alien: 19, Butterfly / escort: 16, Boss Galaga: 4

**Conformance read:** This row is honest about target debt: it uses actual Galaga gameplay from Representative Galaga target: Stage 10 opening rack entry, but not an exact per-level target capture. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band mid-loop; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 19, Butterfly / escort: 16, Boss Galaga: 4

**Critical gap:** Exact target frame for Level 15 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance.

**Next:** Ingest or extract a precise Galaga Level 15 window, then replace this representative target row.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Challenging Stage 4 (Levels 15-16)

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/challenge-04.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/challenge-04.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/challenge-04.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/challenge-04.webm`

**Target source:** Galaga Challenging Stage 4 (Levels 15-16); exact target row.

**Current roles:** Butterfly / escort: 7, Boss Galaga: 6, Captured / rogue fighter: 6, Challenge dragonfly family: 4, Specialty challenge alien: 4

**Conformance read:** This is a no-combat bonus exhibition, so safety is only the floor. Current Aurora still reads weak on movement grammar, alien novelty, and graphical spectacle unless the strict scores here are materially higher than 6/10.

**Variation read:** Late challenge starts showing long pink serpentine arcs and separate green specialty entries.

**Current read:** pink-serpentine-late / pink-serpentine; lanes boss, rogue, but, bee, bee, but, rogue, boss; first-wave types boss, rogue, but, bee, bee, but, rogue, boss; visual families galboss; strict movement 3.7/10, graphics 4.4/10, alien novelty 3.4/10, shot opportunity 5.1/10.

**Critical gap:** Movement conformance is only 3.7/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.

**Next:** Promote the Challenge 4 pink-serpentine window into five group labels and tune the runtime path so all groups keep a readable serpentine score lane.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`
- Captured / rogue fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/rogue-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Challenge dragonfly family: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Level 16

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-16.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-16.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-16.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-16.webm`

**Target source:** Representative Galaga target: Stage 10 opening rack entry; representative actual target gameplay row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 4

**Conformance read:** This row is honest about target debt: it uses actual Galaga gameplay from Representative Galaga target: Stage 10 opening rack entry, but not an exact per-level target capture. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band mid-loop; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 4

**Critical gap:** Exact target frame for Level 16 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance.

**Next:** Ingest or extract a precise Galaga Level 16 window, then replace this representative target row.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Level 17

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-17.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-17.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-17.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-17.webm`

**Target source:** Representative Galaga target: Stage 10 opening rack entry; representative actual target gameplay row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 15, Boss Galaga: 4

**Conformance read:** This row is honest about target debt: it uses actual Galaga gameplay from Representative Galaga target: Stage 10 opening rack entry, but not an exact per-level target capture. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band mid-loop; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 15, Boss Galaga: 4

**Critical gap:** Exact target frame for Level 17 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance.

**Next:** Ingest or extract a precise Galaga Level 17 window, then replace this representative target row.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Level 18

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-18.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-18.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-18.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-18.webm`

**Target source:** Representative Galaga target: Stage 10 opening rack entry; representative actual target gameplay row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 4

**Conformance read:** This row is honest about target debt: it uses actual Galaga gameplay from Representative Galaga target: Stage 10 opening rack entry, but not an exact per-level target capture. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band mid-loop; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 4

**Critical gap:** Exact target frame for Level 18 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance.

**Next:** Ingest or extract a precise Galaga Level 18 window, then replace this representative target row.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Level 19

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-19.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-19.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-19.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-19.webm`

**Target source:** Representative Galaga target: Stage 10 opening rack entry; representative actual target gameplay row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 3

**Conformance read:** This row is honest about target debt: it uses actual Galaga gameplay from Representative Galaga target: Stage 10 opening rack entry, but not an exact per-level target capture. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band late-loop; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 3

**Critical gap:** Exact target frame for Level 19 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance.

**Next:** Ingest or extract a precise Galaga Level 19 window, then replace this representative target row.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Challenging Stage 5 (Levels 19-20)

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/challenge-05.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/challenge-05.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/challenge-05.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/challenge-05.webm`

**Target source:** Galaga Challenging Stage 5 (Levels 19-20); exact target row.

**Current roles:** Butterfly / escort: 7, Captured / rogue fighter: 4, Boss Galaga: 3, Specialty challenge alien: 2, Challenge dragonfly family: 1

**Conformance read:** This is a no-combat bonus exhibition, so safety is only the floor. Current Aurora still reads weak on movement grammar, alien novelty, and graphical spectacle unless the strict scores here are materially higher than 6/10.

**Variation read:** Continues specialty novelty with pink arcs, green lower-field entries, and a clearer split between group identities.

**Current read:** pink-green-cascade / pink-green-cascade; lanes rogue, boss, but, bee, boss, but, bee, rogue; first-wave types rogue, boss, but, bee, boss, but, bee, rogue; visual families galboss; strict movement 3.7/10, graphics 4.5/10, alien novelty 3.4/10, shot opportunity 5.3/10.

**Critical gap:** Movement conformance is only 3.7/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.

**Next:** Promote the Challenge 5 pink/green cascade window into five group labels and tune lower-field pass timing against those labels.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`
- Captured / rogue fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/rogue-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Challenge dragonfly family: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Level 20

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-20.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-20.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-20.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-20.webm`

**Target source:** Representative Galaga target: Stage 10 opening rack entry; representative actual target gameplay row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 4

**Conformance read:** This row is honest about target debt: it uses actual Galaga gameplay from Representative Galaga target: Stage 10 opening rack entry, but not an exact per-level target capture. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band late-loop; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 4

**Critical gap:** Exact target frame for Level 20 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance.

**Next:** Ingest or extract a precise Galaga Level 20 window, then replace this representative target row.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Level 21

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-21.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-21.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-21.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-21.webm`

**Target source:** Representative Galaga target: Stage 10 opening rack entry; representative actual target gameplay row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 4

**Conformance read:** This row is honest about target debt: it uses actual Galaga gameplay from Representative Galaga target: Stage 10 opening rack entry, but not an exact per-level target capture. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band late-loop; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 4

**Critical gap:** Exact target frame for Level 21 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance.

**Next:** Ingest or extract a precise Galaga Level 21 window, then replace this representative target row.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Level 22

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-22.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-22.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-22.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-22.webm`

**Target source:** Representative Galaga target: Stage 10 opening rack entry; representative actual target gameplay row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 4

**Conformance read:** This row is honest about target debt: it uses actual Galaga gameplay from Representative Galaga target: Stage 10 opening rack entry, but not an exact per-level target capture. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band late-loop; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 4

**Critical gap:** Exact target frame for Level 22 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance.

**Next:** Ingest or extract a precise Galaga Level 22 window, then replace this representative target row.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Level 23

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-23.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-23.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-23.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-23.webm`

**Target source:** Representative Galaga target: Stage 10 opening rack entry; representative actual target gameplay row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 15, Boss Galaga: 4

**Conformance read:** This row is honest about target debt: it uses actual Galaga gameplay from Representative Galaga target: Stage 10 opening rack entry, but not an exact per-level target capture. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band late-loop; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 15, Boss Galaga: 4

**Critical gap:** Exact target frame for Level 23 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance.

**Next:** Ingest or extract a precise Galaga Level 23 window, then replace this representative target row.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Challenging Stage 6 (Levels 23-24)

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/challenge-06.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/challenge-06.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/challenge-06.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/challenge-06.webm`

**Target source:** Galaga Challenging Stage 6 (Levels 23-24); exact target row.

**Current roles:** Captured / rogue fighter: 9, Challenge dragonfly family: 7, Boss Galaga: 6, Butterfly / escort: 5, Challenge mosquito family: 2

**Conformance read:** This is a no-combat bonus exhibition, so safety is only the floor. Current Aurora still reads weak on movement grammar, alien novelty, and graphical spectacle unless the strict scores here are materially higher than 6/10.

**Variation read:** Green ladder and split entries emphasize staggered group timing and route separation.

**Current read:** green-ladder-split / green-ladder-split; lanes bee, but, rogue, boss, boss, rogue, but, bee; first-wave types bee, but, rogue, boss, boss, rogue, but, bee; visual families dragonfly; strict movement 3.2/10, graphics 4.4/10, alien novelty 3.4/10, shot opportunity 5.4/10.

**Critical gap:** Movement conformance is only 3.2/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.

**Next:** Rebuild Challenge 6 around green ladder and split-exit timing until its measured vector hits challenge-6-green-ladder-split-group-1.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Captured / rogue fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/rogue-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Challenge dragonfly family: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`
- Challenge mosquito family: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-mosquito.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Level 24

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-24.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-24.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-24.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-24.webm`

**Target source:** Representative Galaga target: Stage 10 opening rack entry; representative actual target gameplay row.

**Current roles:** Specialty challenge alien: 19, Butterfly / escort: 16, Boss Galaga: 4

**Conformance read:** This row is honest about target debt: it uses actual Galaga gameplay from Representative Galaga target: Stage 10 opening rack entry, but not an exact per-level target capture. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band late-loop; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 19, Butterfly / escort: 16, Boss Galaga: 4

**Critical gap:** Exact target frame for Level 24 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance.

**Next:** Ingest or extract a precise Galaga Level 24 window, then replace this representative target row.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Level 25

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-25.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-25.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-25.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-25.webm`

**Target source:** Representative Galaga target: Stage 10 opening rack entry; representative actual target gameplay row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 4

**Conformance read:** This row is honest about target debt: it uses actual Galaga gameplay from Representative Galaga target: Stage 10 opening rack entry, but not an exact per-level target capture. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band late-loop; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 4

**Critical gap:** Exact target frame for Level 25 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance.

**Next:** Ingest or extract a precise Galaga Level 25 window, then replace this representative target row.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Level 26

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-26.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-26.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-26.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-26.webm`

**Target source:** Representative Galaga target: Stage 10 opening rack entry; representative actual target gameplay row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 15, Boss Galaga: 4

**Conformance read:** This row is honest about target debt: it uses actual Galaga gameplay from Representative Galaga target: Stage 10 opening rack entry, but not an exact per-level target capture. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band late-loop; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 15, Boss Galaga: 4

**Critical gap:** Exact target frame for Level 26 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance.

**Next:** Ingest or extract a precise Galaga Level 26 window, then replace this representative target row.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Level 27

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-27.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-27.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-27.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-27.webm`

**Target source:** Representative Galaga target: Stage 10 opening rack entry; representative actual target gameplay row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 4

**Conformance read:** This row is honest about target debt: it uses actual Galaga gameplay from Representative Galaga target: Stage 10 opening rack entry, but not an exact per-level target capture. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band late-loop; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 4

**Critical gap:** Exact target frame for Level 27 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance.

**Next:** Ingest or extract a precise Galaga Level 27 window, then replace this representative target row.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Challenging Stage 7 (Levels 27-28)

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/challenge-07.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/challenge-07.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/challenge-07.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/challenge-07.webm`

**Target source:** Galaga Challenging Stage 7 (Levels 27-28); exact target row.

**Current roles:** No active enemy roles visible in this sampled current frame.

**Conformance read:** This is a no-combat bonus exhibition, so safety is only the floor. Current Aurora still reads weak on movement grammar, alien novelty, and graphical spectacle unless the strict scores here are materially higher than 6/10.

**Variation read:** Yellow diagonal trains create a memorable late-stage fan/diagonal score lane.

**Current read:** yellow-diagonal-fan / yellow-diagonal-fan; lanes boss, bee, but, rogue, rogue, but, bee, boss; first-wave types boss, bee, but, rogue, rogue, but, bee, boss; visual families crown; strict movement 3.4/10, graphics 4.3/10, alien novelty 3.4/10, shot opportunity 4.6/10.

**Critical gap:** Movement conformance is only 3.4/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.

**Next:** Rebuild Challenge 7 around the yellow diagonal fan so the best match lands on challenge-7-yellow-diagonal-fan-group-1, not the finale label.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Level 28

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-28.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-28.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-28.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-28.webm`

**Target source:** Representative Galaga target: Stage 10 opening rack entry; representative actual target gameplay row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 15, Boss Galaga: 4

**Conformance read:** This row is honest about target debt: it uses actual Galaga gameplay from Representative Galaga target: Stage 10 opening rack entry, but not an exact per-level target capture. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band late-loop; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 15, Boss Galaga: 4

**Critical gap:** Exact target frame for Level 28 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance.

**Next:** Ingest or extract a precise Galaga Level 28 window, then replace this representative target row.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Level 29

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-29.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-29.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-29.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-29.webm`

**Target source:** Representative Galaga target: Stage 10 opening rack entry; representative actual target gameplay row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 15, Boss Galaga: 4

**Conformance read:** This row is honest about target debt: it uses actual Galaga gameplay from Representative Galaga target: Stage 10 opening rack entry, but not an exact per-level target capture. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band late-loop; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 15, Boss Galaga: 4

**Critical gap:** Exact target frame for Level 29 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance.

**Next:** Ingest or extract a precise Galaga Level 29 window, then replace this representative target row.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Level 30

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-30.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-30.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-30.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-30.webm`

**Target source:** Representative Galaga target: Stage 10 opening rack entry; representative actual target gameplay row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 15, Boss Galaga: 4

**Conformance read:** This row is honest about target debt: it uses actual Galaga gameplay from Representative Galaga target: Stage 10 opening rack entry, but not an exact per-level target capture. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band late-loop; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 15, Boss Galaga: 4

**Critical gap:** Exact target frame for Level 30 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance.

**Next:** Ingest or extract a precise Galaga Level 30 window, then replace this representative target row.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Level 31

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/level-31.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/level-31.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/level-31.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/level-31.webm`

**Target source:** Representative Galaga target: Stage 10 opening rack entry; representative actual target gameplay row.

**Current roles:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 3

**Conformance read:** This row is honest about target debt: it uses actual Galaga gameplay from Representative Galaga target: Stage 10 opening rack entry, but not an exact per-level target capture. The useful review question is whether Aurora’s current frame has a readable rack/entry state, recognizable bee/butterfly/boss roles, and stage-band pressure rather than only a different background.

**Variation read:** Regular level band late-loop; target family regular-stage-entry.

**Current read:** Specialty challenge alien: 20, Butterfly / escort: 16, Boss Galaga: 3

**Critical gap:** Exact target frame for Level 31 is missing from the ingested corpus; this should not be scored as fully grounded visual conformance.

**Next:** Ingest or extract a precise Galaga Level 31 window, then replace this representative target row.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Bee / Zako: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/bee-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-zako-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`

## Challenging Stage 8 (Levels 31-32)

![Aurora current](reference-artifacts/analyses/level-visual-conformance-index/latest-current-screenshots/challenge-08.png)

![Galaga target](reference-artifacts/analyses/level-visual-conformance-index/latest-target-screenshots/challenge-08.jpg)

**Aurora 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-current-videos/challenge-08.webm`

**Galaga target 10s video:** `reference-artifacts/analyses/level-visual-conformance-index/latest-target-videos/challenge-08.webm`

**Target source:** Galaga Challenging Stage 8 (Levels 31-32); exact target row.

**Current roles:** Butterfly / escort: 5, Captured / rogue fighter: 4, Specialty challenge alien: 4, Boss Galaga: 3

**Conformance read:** This is a no-combat bonus exhibition, so safety is only the floor. Current Aurora still reads weak on movement grammar, alien novelty, and graphical spectacle unless the strict scores here are materially higher than 6/10.

**Variation read:** Final visible challenge window emphasizes blue/purple clustered arcs and a compact all-perfect finish.

**Current read:** blue-purple-finale / blue-purple-finale; lanes rogue, boss, bee, but, but, bee, boss, rogue; first-wave types rogue, boss, bee, but, but, bee, boss, rogue; visual families stingray; strict movement 3.4/10, graphics 4.5/10, alien novelty 3.4/10, shot opportunity 5.3/10.

**Critical gap:** Movement conformance is only 3.4/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.

**Next:** Refine the Challenge 8 blue/purple finale with fuller path length and compact late-loop timing.

**Sprite / alien bitmap references:**
- Player fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/player-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
- Boss Galaga: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/boss-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-command-boss.png`
- Specialty challenge alien: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/challenge-dragonfly.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-specialty-dive.png`
- Butterfly / escort: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-butterfly-escort.png`
- Captured / rogue fighter: current `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/rogue-fighter.png`; target `reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1/galaga-player-fighter.png`
