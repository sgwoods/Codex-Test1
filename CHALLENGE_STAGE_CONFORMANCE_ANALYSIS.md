# Challenge Stage Conformance Analysis

Generated: 2026-06-08T13:41:19.325Z
Commit: 089f16b0f
Branch: codex/macbook-pro-1.4.1-stage7-object-track-keeper

## Executive Summary

This is now a strict challenge-stage readout. The prior alien-entry score looked too healthy because it rewarded coverage, type labels, and broad stage signatures. That was useful harness progress, but it overstated the player-facing experience. This report follows the current project decision that challenging stages start at **1/10 interesting**, **1/10 movement**, and **1/10 graphical conformance** until they earn credit through reference-grounded movement, active visual evidence, alien/stage novelty, and durable bonus-stage contracts.

Current result: **4.3/10 interesting factor** and **4.3/10 challenge-stage conformance**. Movement is **4.4/10**, graphical conformance is **4.5/10**, alien/stage novelty is **3.9/10**, and player shot opportunity is **5.4/10**. The strongest rule finding is that current probes show no enemy shots, no attack starts, and no ship losses during sampled challenge windows. The weakest player-facing finding is that current challenge stages are functionally safe but not yet fully credible Galaga-like bonus exhibitions: strict movement is 4.4/10, strict graphics is 4.5/10, alien/stage novelty is 3.9/10, player shot opportunity is 5.4/10, target-video object-track fit is 3.6/10, and sprite-motion correspondence is 6.18/10 with target timing status frame-labeled-segmented-reference-windows. Diagnostic legacy coverage was 6.8/10, which is why the old read was too generous.

## Method

- Runtime challenge states were sampled through the browser-backed Aurora harness using `challengeFormationState()`.
- Reference targets came from media-backed Galaga path labels and contact sheets.
- Existing path-family comparison supplied best-match vector scores against labeled Galaga challenge entries, but those broad scores are now retained as diagnostic coverage instead of the conformance score.
- Strict movement scoring compares runtime y-range, path length, turn count, reversals, lower-field share, and trajectory best-match against the selected Galaga challenge reference vector. It is capped by current temporal-measurement limits because the harness still samples summaries rather than full tracked choreography.
- Strict graphical scoring now includes active sprite-motion plus object-tracked runtime pixel/silhouette crops for flap state, phase coverage, visual family diversity, path-pose diversity, lit-pixel stability, and bounding-box variation. It remains capped until those object tracks are compared frame-by-frame to Galaga target crops, rotations, dive poses, capture/rescue transitions, and direct target crop sequences.
- First-pass target contracts now score group count, group path-family order, expected type order, and expected family order for any challenge that has a persisted media-backed contract. This is deliberately reported as a separate contract-fit read until target-video object tracking exists.
- Player shot-opportunity scoring samples plausible firing lanes through each challenge window so movement work can be judged by whether it creates learnable high-bonus routes, not only by broad movement shape.
- Challenge path-slot extraction suppresses player fire for challenge windows, so trajectory comparison measures authored alien motion instead of bullet-truncated player-score fragments.
- Safety is measured separately from interest: no shots/no kills is necessary, but it does not make a challenge visually conformant and contributes only as a guardrail.
- Prior 24-second evidence windows can include post-challenge normal play, so enemy bullets/attackers in those older windows are not treated as challenge-rule failures here.


## Target Artifact Coverage

The broader Galaga target-artifact coverage read is **5.1/10** overall and **4.5/10** for challenge-stage target readiness. The important implication is not that Aurora lacks all grounding; it is that the currently ingested challenge-stage corpus is still early-stage heavy. Aurora now has media-backed windows for all tracked Galaga challenge stages, including Challenges 4-8. The bottleneck has moved from source acquisition to precision: each window needs five-group frame labels for entry side, path family, scoreable band, exit side, alien family, and perfect-bonus opportunity before direct trajectory scoring should rise.

| Challenge | Stage Marker | Target Status | Coverage | Next Need |
| ---: | ---: | --- | ---: | --- |
| 1 | 3 | partially-ingested | 4.5/10 | Convert existing windows into fuller five-group trajectory labels and build Aurora Stage 3 against those exact group contracts. |
| 2 | 7 | partially-ingested | 4.5/10 | Add late-wave/results windows and group 2-5 labels. |
| 3 | 11 | partially-ingested | 4.5/10 | Add late-wave/results windows and map specialty alien novelty explicitly. |
| 4 | 15 | partially-ingested | 4.5/10 | Promote five-group labels for the pink serpentine reference and rebuild Aurora Stage 15 around a distinct late-stage specialty arc. |
| 5 | 19 | partially-ingested | 4.5/10 | Promote five-group labels for the pink/green cascade reference and align Aurora's mosquito/specialty-family novelty to the visible target. |
| 6 | 23 | partially-ingested | 4.5/10 | Promote five-group labels for the green ladder/split reference and add runtime probes for staggered group spacing. |
| 7 | 27 | partially-ingested | 4.5/10 | Promote five-group labels for the yellow diagonal fan reference and use it as the strongest late-stage visual novelty target. |
| 8 | 31 | partially-ingested | 4.5/10 | Promote five-group labels for the blue/purple finale reference and use it as the late-loop capstone contract. |

Full target-artifact report: `GALAGA_TARGET_ARTIFACT_COVERAGE.md` and `reference-artifacts/analyses/galaga-target-artifact-coverage/latest.json`.


## Stage Summary

| Stage | Challenge | Interest | Movement | Graphics | Alien Novelty | Shot Opportunity | Strict Score | Diagnostic Best Reference | No-Shot/No-Kill | Critical Gap |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| 3 | 1 | 4.3/10 | 4.3/10 | 4.4/10 | 3.9/10 | 5.6/10 | 4.2/10 | challenge-1-arrival-group-1 (8.5/10 legacy) | pass | Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.<br>Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns. |
| 7 | 2 | 4.2/10 | 4.4/10 | 4.1/10 | 3.9/10 | 5.5/10 | 4.2/10 | challenge-2-arrival-group-1 (8.7/10 legacy) | pass | Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.<br>Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Cross-sweep identity now lands on the expected Challenge 2 reference family; next work is trajectory precision and active visual novelty, not basic identity. |
| 11 | 3 | 4.4/10 | 4.4/10 | 4.7/10 | 3.9/10 | 5.9/10 | 4.4/10 | challenge-3-arrival-group-1 (8.5/10 legacy) | pass | Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.<br>Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Dragonfly/boss-led identity now lands on the expected Challenge 3 reference family, but sprite-motion novelty and tracked Galaga challenge-3 path phases are not yet scored. |
| 15 | 4 | 4.3/10 | 4.3/10 | 4.7/10 | 3.9/10 | 5.2/10 | 4.3/10 | challenge-4-pink-serpentine-group-1 (8.9/10 legacy) | pass | Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.<br>Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Target-contract fit is only 4.4/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.<br>Pink-serpentine identity now lands on its first-pass late reference, but it still needs five-group frame labels, target sprite-motion evidence, and stronger player-visible novelty before it can claim maturity. |
| 19 | 5 | 4.4/10 | 4.6/10 | 4.7/10 | 3.9/10 | 5.2/10 | 4.4/10 | challenge-5-pink-green-cascade-group-2 (9.6/10 legacy) | pass | Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.<br>Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Target-contract fit is only 3.9/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.<br>Pink/green cascade identity now lands on its first-pass late reference, but the current window still needs five group labels and stronger lower-field route readability. |
| 23 | 6 | 4.2/10 | 4.3/10 | 4.5/10 | 3.9/10 | 5.5/10 | 4.2/10 | challenge-6-green-ladder-split-group-1 (8.9/10 legacy) | pass | Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.<br>Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Target-contract fit is only 4.5/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.<br>Green-ladder split now lands on a Challenge 6 ladder/split reference; remaining work is fuller path length, lower reversal noise, and object-tracked group timing. |
| 27 | 7 | 4.2/10 | 4.5/10 | 4.6/10 | 3.9/10 | 5.1/10 | 4.2/10 | challenge-7-yellow-diagonal-fan-group-5 (9.5/10 legacy) | pass | Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.<br>Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Target-contract fit is only 4.2/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.<br>Yellow diagonal fan now lands on a Challenge 7 diagonal-fan reference; remaining work is stronger lower-field travel and object-tracked diagonal lane timing. |
| 31 | 8 | 4.4/10 | 4.5/10 | 4.7/10 | 3.9/10 | 5.5/10 | 4.4/10 | challenge-8-blue-purple-finale-group-4 (9.3/10 legacy) | pass | Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.<br>Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Target-contract fit is only 4.2/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.<br>Blue/purple finale is now represented as its own runtime contract, but it still needs fuller path length and active sprite-motion evidence before it feels like a late-loop capstone. |


## Stage 3 / Challenge 1

**Current score:** interesting factor 4.3/10; challenge conformance 4.2/10. Movement 4.3/10, graphics 4.4/10, alien novelty 3.9/10, progression 3.2/10, player shot opportunity 5.6/10.

**Legacy broad coverage score:** 6.4/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** First Galaga-style challenging stage: readable bonus set piece, no fire, no ship loss, upper-band mirrored entries, bee/butterfly line waves, visible arrival/peel-off.

**Aurora current:** first-challenge-peel / first-challenge-peel; lanes bee, bee, bee, bee, but, but, but, but; first-wave types bee, bee, bee, bee, but, but, but, but; visual families classic; strict movement 4.3/10, graphics 4.4/10, alien novelty 3.9/10, shot opportunity 5.6/10, target-contract fit 6.9/10.

**Graphics read:** Strict graphics score 4.4/10. Current visible family/type labels are present, Direct runtime-vs-Galaga target-crop comparator reads 5.97/10 overall and 3.86/10 for challenge specialty sprites; weakest challenge crop is challenge-mosquito at 3.68/10. Runtime sprite-motion hook observed 1 visual family/families, 3 path pose family/families, 6/6 animation phase buckets, both flap state(s), and 38 object-tracked silhouette track(s). Aurora runtime motion corresponds to 3 frame-labeled segmented-reference target row(s), average 6.2/10; phase-order average is 4.8/10. Weakest row bee-zako-pulse-pair at 5.42/10. Graphics remain capped at 5.1/10 until object tracks are compared as full temporal Galaga target-crop sequences, rotations, dive poses, and capture/rescue transitions.

**Movement read:** Strict movement score 4.3/10 against challenge-1-arrival-group-1: y-range fit 1, path-length fit 1, turn fit 1, object-track fit 0.3. Current probes now include runtime object tracks compared against CPU-extracted Galaga target-video object tracks where available. Legacy broad vector best-match was 8.5/10 against challenge-1-arrival-group-1; xRange 1.0447, yRange 0.7448, pathLength 0.7585.

**Alien variation read:** Strict alien/progression novelty score 3.9/10. Current stages expose labels, type mixes, direct specialty-sprite target-crop evidence, and 1 visual family/families, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 2 type(s) and classic visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.54s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.54s.

**Target contract read:** Target contract fit is 6.9/10 for Challenging Stage 1 (Levels 3-4): group count 1, runtime path-family order 1, declared path-family order n/a, type order 1, family order 1, object-track 0.3 via direct target-video tracks. This is a group/object-track read, not frame-perfect sprite identity recognition.

**Shot-opportunity read:** Shot-opportunity probe found scoreable targets in 61 sampled windows; 82% had a lane with 2+ targets, lane diversity was 1, and center-lane bias was 0.11.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.
- Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.

**Next actions:**
- The first Stage 3 / Challenge 1 RED artifact is now available at `reference-artifacts/ingestion/reference-execution-descriptions/aurora-stage3-challenge1-0.1.json`, with analysis at `reference-artifacts/analyses/reference-execution-description/stage3-challenge1/latest.json`. It explicitly captures the top-right bee line, late top-left butterfly line, upper-band score windows, peel-off exits, no-combat grammar, path-family order, scoreable-window expectations, safety, and uncertainty/provenance.
- The non-overwriting Stage 3 candidate-trial gate is now available at `reference-artifacts/analyses/reference-execution-candidate-trials/stage3-challenge1/latest.json`, with input format documented in `reference-artifacts/ingestion/reference-execution-candidate-trials/README.md`. The baseline-control trial is a process keeper, not a runtime keeper: it reports semantic score `0.918`, object-track `3.2/10`, `5/5` strict weak rows, `4/5` human-vs-CPU field-occupancy conflicts, and target-vs-runtime authority conflicts for groups 3 and 5.
- The fresh non-overwriting Stage 3 semantic batch is now available at `reference-artifacts/analyses/reference-execution-candidate-trials/stage3-challenge1/latest-batch.json`, with the prior calibrated `10` candidates preserved as `reference-artifacts/analyses/reference-execution-candidate-trials/stage3-challenge1/latest-regression-baseline.json` and old-vs-new yield comparison at `reference-artifacts/analyses/reference-execution-candidate-trials/stage3-challenge1/latest-batch-comparison.json`. It generated `10` fresh named candidates and kept no-combat, scoreable-route, spacing/readability, and safety guardrails intact. Geometry-only candidates stayed `metric-only-probe` and not trial-promising. Player-visible semantic lifts rose from `3` to `7`, so the candidate language is stable enough to choose one later browser transfer-proof target. Because multiple candidates were close, the gate selected the smallest/least-authority-conflicted target: `stage3-semantic-fresh-g4-score-window-shape-peel-0.1`. Do not treat the RED, trial gate, or batch as runtime promotion authority by itself.
- The single browser transfer proof for `stage3-semantic-fresh-g4-score-window-shape-peel-0.1` is now available at `reference-artifacts/analyses/reference-execution-runtime-expressibility/stage3-challenge1/latest-transfer-proof.json`, with SVG contact-sheet evidence at `reference-artifacts/analyses/reference-execution-runtime-expressibility/stage3-challenge1/latest-transfer-proof-contact-sheet.svg`. It confirms visible group 4 transfer through consumed `routeCurveY` and `routeOffsetX` controls: the exit read moves from `center` to `right`, path length drops from `1.5589` to `1.3814`, upper-band scoreability is preserved, protected groups 1, 2, 3, and 5 preserve, and spacing, scoreable-route, no-combat, and no-shot/no-attack/no-loss guardrails pass. It is not source-ready because `referencePath.playbackScale` cannot be consumed while Stage 3 is not reference-path backed. Next Stage 3 work should refine the compiler/runtime control mapping for path-length expression before any source edit or new candidate batch.


## Stage 7 / Challenge 2

**Current score:** interesting factor 4.2/10; challenge conformance 4.2/10. Movement 4.4/10, graphics 4.1/10, alien novelty 3.9/10, progression 3.2/10, player shot opportunity 5.5/10.

**Legacy broad coverage score:** 6.5/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Second challenge should feel denser and more novel than challenge 1 while staying nonlethal and non-shooting.

**Aurora current:** scorpion-cross-sweep / cross-sweep; lanes but, boss, rogue, bee, bee, rogue, boss, but; first-wave types but, boss, rogue, bee, bee, rogue, boss, but; visual families classic; strict movement 4.4/10, graphics 4.1/10, alien novelty 3.9/10, shot opportunity 5.5/10, target-contract fit 7.2/10.

**Graphics read:** Strict graphics score 4.1/10. Current visible family/type labels are present, Direct runtime-vs-Galaga target-crop comparator reads 5.97/10 overall and 3.86/10 for challenge specialty sprites; weakest challenge crop is challenge-mosquito at 3.68/10. Runtime sprite-motion hook observed 3 visual family/families, 3 path pose family/families, 6/6 animation phase buckets, both flap state(s), and 38 object-tracked silhouette track(s). Aurora runtime motion corresponds to 3 frame-labeled segmented-reference target row(s), average 6.2/10; phase-order average is 4.8/10. Weakest row bee-zako-pulse-pair at 5.42/10. Graphics remain capped at 5.1/10 until object tracks are compared as full temporal Galaga target-crop sequences, rotations, dive poses, and capture/rescue transitions.

**Movement read:** Strict movement score 4.4/10 against challenge-2-arrival-group-1: y-range fit 1, path-length fit 1, turn fit 0.9, object-track fit 0.5. Current probes now include runtime object tracks compared against CPU-extracted Galaga target-video object tracks where available. Legacy broad vector best-match was 8.7/10 against challenge-2-arrival-group-1; xRange 0.672, yRange 0.7129, pathLength 0.9196.

**Alien variation read:** Strict alien/progression novelty score 3.9/10. Current stages expose labels, type mixes, direct specialty-sprite target-crop evidence, and 1 visual family/families, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and classic visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.53s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.53s.

**Target contract read:** Target contract fit is 7.2/10 for Challenging Stage 2 (Levels 7-8): group count 1, runtime path-family order 1, declared path-family order 1, type order 1, family order 1, object-track 0.5 via direct target-video tracks. This is a group/object-track read, not frame-perfect sprite identity recognition.

**Shot-opportunity read:** Shot-opportunity probe found scoreable targets in 47 sampled windows; 74% had a lane with 2+ targets, lane diversity was 1, and center-lane bias was 0.36.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Keeper-cycle note:** The June 8 timing/canonical-label runtime candidate was rejected, not promoted. It improved group 1 and shot opportunity, but reduced total object-track fit from 4.7/10 to 4.6/10, lowered coverage from 0.503 to 0.482, dropped group 4 from 5.0/10 to 3.8/10, and slipped group 5 from 4.9/10 to 4.8/10. The reference execution description remains a measurement/process keeper. A non-overwriting Stage 7 candidate-trial path and semantic batch layer now exist for pre-source executable-intent variants. The first semantic runtime projection, `stage7-semantic-phase-align-protect-0.1`, was also rejected as a runtime keeper: it predicted object-track 5.0/10, coverage 0.541, group 1 at 4.0, group 4 at 5.3, and group 5 at 4.9, but actual browser runtime stayed at object-track 4.7/10, coverage 0.503, group 1 at 3.5, group 4 at 5.0, and group 5 at 4.9. It preserved no-shot/no-attack/no-loss safety and scoreable routes, but tripped `harness:check:challenge-motion-profile` while applied because the projected path order drifted from the older motion-profile target artifact. Runtime source was restored. Evidence is preserved under `reference-artifacts/analyses/reference-execution-runtime-calibrations/stage7-challenge2/2026-06-08-stage7-semantic-phase-align-protect-runtime-rejection/`. The semantic compiler/evaluator has now been tightened: latest batch output is `no-runtime-source-candidate`, and the calibration audit records that measured reference intent (`cross-sweep`, `hook-arc`, `hook-arc`, `cross-sweep`, `hook-arc`) is not aligned with live promotion gates/restored runtime source (`cross-sweep`, `cross-sweep`, `hook-arc`, `hook-arc`, `boss-led-loop`). The current authority decision keeps live promotion gates/restored runtime source as source-ready authority while explicitly preserving RED/setpiece as target-conformance debt. The phase-duration compiler now emits consumed `compiledRuntimeControls` for `groupSpawnOffsets` / `motionSpecGroup.spawnOffsetS`, `phaseDurations.trackS`, and `referencePath.playbackScale`, declares intended/protected groups, and emits per-group timing deltas. The candidate-specific proof confirms browser-visible timing/path movement and now preserves protected group 4/5 timing, but it still rejects source readiness because the constrained phase-duration controls fail the focused motion/profile proxy on spacing/readability (`spacingScore` 0.64 below the 0.72 floor and `bunchingRisk` 0.387 above the 0.38 cap). `exitS` remains unconsumed. The single lower-field-overstay transfer proof confirms `lowerFieldBias` / `yOffset` controls are consumed, but group 2 lower-field share held at 0.6667 instead of moving toward 0.4522, visible lower-field movement was false, and motion/profile plus spacing/readability guards failed. Scoreable routes, no-shot/no-attack/no-loss safety, and group 4/5 preservation stayed intact. Group 1 path-length compression remains analysis-only with no browser transfer proof. No Stage 7 source-ready candidate exists; pause Stage 7 candidate work and apply the RED pipeline front-first to Stage 3 / Challenge 1.

**Critical gaps:**
- Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.
- Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Cross-sweep identity now lands on the expected Challenge 2 reference family; next work is trajectory precision and active visual novelty, not basic identity.

**Next actions:**
- Tune challenge 2 toward the denser mixed-novelty-line reference instead of relying on a generic cross-sweep.
- Score separate group identities so stage 7 is not just a slightly wider stage 3.


## Stage 11 / Challenge 3

**Current score:** interesting factor 4.4/10; challenge conformance 4.4/10. Movement 4.4/10, graphics 4.7/10, alien novelty 3.9/10, progression 3.2/10, player shot opportunity 5.9/10.

**Legacy broad coverage score:** 6.9/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Third challenge should make the new visual family and boss-led novelty obvious, with larger sweep vocabulary and no attacks.

**Aurora current:** stingray-crown-hook-hybrid / hook-arc; lanes boss, rogue, but, bee, boss, bee, but, rogue; first-wave types boss, rogue, but, bee, boss, bee, but, rogue; visual families dragonfly; strict movement 4.4/10, graphics 4.7/10, alien novelty 3.9/10, shot opportunity 5.9/10, target-contract fit 7.2/10.

**Graphics read:** Strict graphics score 4.7/10. Current visible family/type labels are present, Direct runtime-vs-Galaga target-crop comparator reads 5.97/10 overall and 3.86/10 for challenge specialty sprites; weakest challenge crop is challenge-mosquito at 3.68/10. Runtime sprite-motion hook observed 3 visual family/families, 3 path pose family/families, 6/6 animation phase buckets, both flap state(s), and 40 object-tracked silhouette track(s). Aurora runtime motion corresponds to 3 frame-labeled segmented-reference target row(s), average 6.2/10; phase-order average is 4.8/10. Weakest row bee-zako-pulse-pair at 5.42/10. Graphics remain capped at 5.1/10 until object tracks are compared as full temporal Galaga target-crop sequences, rotations, dive poses, and capture/rescue transitions.

**Movement read:** Strict movement score 4.4/10 against challenge-3-arrival-group-1: y-range fit 1, path-length fit 1, turn fit 1, object-track fit 0.5. Current probes now include runtime object tracks compared against CPU-extracted Galaga target-video object tracks where available. Legacy broad vector best-match was 8.5/10 against challenge-3-arrival-group-1; xRange 0.5336, yRange 0.8672, pathLength 1.2258.

**Alien variation read:** Strict alien/progression novelty score 3.9/10. Current stages expose labels, type mixes, direct specialty-sprite target-crop evidence, and 1 visual family/families, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and dragonfly visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.36s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.36s.

**Target contract read:** Target contract fit is 7.2/10 for Challenging Stage 3 (Levels 11-12): group count 1, runtime path-family order 1, declared path-family order 1, type order 1, family order 1, object-track 0.5 via direct target-video tracks. This is a group/object-track read, not frame-perfect sprite identity recognition.

**Shot-opportunity read:** Shot-opportunity probe found scoreable targets in 53 sampled windows; 89% had a lane with 2+ targets, lane diversity was 1, and center-lane bias was 0.28.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.
- Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Dragonfly/boss-led identity now lands on the expected Challenge 3 reference family, but sprite-motion novelty and tracked Galaga challenge-3 path phases are not yet scored.

**Next actions:**
- Promote challenge-3 boss-led reference phases and score dragonfly visual novelty as animation, not only family label.
- Add motion windows for wing flaps, pulsing, dive/rotation silhouette, and challenge-only nonlethal arrival.


## Stage 15 / Challenge 4

**Current score:** interesting factor 4.3/10; challenge conformance 4.3/10. Movement 4.3/10, graphics 4.7/10, alien novelty 3.9/10, progression 3.1/10, player shot opportunity 5.2/10.

**Legacy broad coverage score:** 6.9/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Fourth challenge should shift into long specialty serpentine arcs with obvious new color/family identity while staying nonlethal.

**Aurora current:** pink-serpentine-late / pink-serpentine; lanes boss, rogue, but, bee, bee, but, rogue, boss; first-wave types boss, rogue, but, bee, bee, but, rogue, boss; visual families galboss; strict movement 4.3/10, graphics 4.7/10, alien novelty 3.9/10, shot opportunity 5.2/10, target-contract fit 4.4/10.

**Graphics read:** Strict graphics score 4.7/10. Current visible family/type labels are present, Direct runtime-vs-Galaga target-crop comparator reads 5.97/10 overall and 3.86/10 for challenge specialty sprites; weakest challenge crop is challenge-mosquito at 3.68/10. Runtime sprite-motion hook observed 2 visual family/families, 3 path pose family/families, 6/6 animation phase buckets, both flap state(s), and 23 object-tracked silhouette track(s). Aurora runtime motion corresponds to 3 frame-labeled segmented-reference target row(s), average 6.2/10; phase-order average is 4.8/10. Weakest row bee-zako-pulse-pair at 5.42/10. Graphics remain capped at 5.1/10 until object tracks are compared as full temporal Galaga target-crop sequences, rotations, dive poses, and capture/rescue transitions.

**Movement read:** Strict movement score 4.3/10 against challenge-4-pink-serpentine-group-1: y-range fit 1, path-length fit 1, turn fit 1, object-track fit 0.33. Current probes now include runtime object tracks compared against CPU-extracted Galaga target-video object tracks where available. Legacy broad vector best-match was 8.9/10 against challenge-4-pink-serpentine-group-1; xRange 1.0153, yRange 0.5676, pathLength 1.6346.

**Alien variation read:** Strict alien/progression novelty score 3.9/10. Current stages expose labels, type mixes, direct specialty-sprite target-crop evidence, and 1 visual family/families, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and galboss visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.24s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.24s.

**Target contract read:** Target contract fit is 4.4/10 for Challenging Stage 4 target-video object tracks: group count 1, runtime path-family order 0, declared path-family order n/a, type order 0, family order 0, object-track 0.33 via direct target-video tracks. This is a group/object-track read, not frame-perfect sprite identity recognition.

**Shot-opportunity read:** Shot-opportunity probe found scoreable targets in 58 sampled windows; 59% had a lane with 2+ targets, lane diversity was 1, and center-lane bias was 0.18.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.
- Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Target-contract fit is only 4.4/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.
- Pink-serpentine identity now lands on its first-pass late reference, but it still needs five-group frame labels, target sprite-motion evidence, and stronger player-visible novelty before it can claim maturity.

**Next actions:**
- Promote the Challenge 4 pink-serpentine window into five group labels and tune the runtime path so all groups keep a readable serpentine score lane.
- Add high-bonus readability probes so late-stage complexity stays learnable instead of becoming visual noise.


## Stage 19 / Challenge 5

**Current score:** interesting factor 4.4/10; challenge conformance 4.4/10. Movement 4.6/10, graphics 4.7/10, alien novelty 3.9/10, progression 3.1/10, player shot opportunity 5.2/10.

**Legacy broad coverage score:** 7.1/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Fifth challenge should distinguish itself with pink/green cascade motion, alternating group identity, and stronger lower-field pass readability.

**Aurora current:** pink-green-cascade / pink-green-cascade; lanes rogue, boss, but, bee, boss, but, bee, rogue; first-wave types rogue, boss, but, bee, boss, but, bee, rogue; visual families galboss; strict movement 4.6/10, graphics 4.7/10, alien novelty 3.9/10, shot opportunity 5.2/10, target-contract fit 3.9/10.

**Graphics read:** Strict graphics score 4.7/10. Current visible family/type labels are present, Direct runtime-vs-Galaga target-crop comparator reads 5.97/10 overall and 3.86/10 for challenge specialty sprites; weakest challenge crop is challenge-mosquito at 3.68/10. Runtime sprite-motion hook observed 3 visual family/families, 3 path pose family/families, 6/6 animation phase buckets, both flap state(s), and 23 object-tracked silhouette track(s). Aurora runtime motion corresponds to 3 frame-labeled segmented-reference target row(s), average 6.2/10; phase-order average is 4.8/10. Weakest row bee-zako-pulse-pair at 5.42/10. Graphics remain capped at 5.1/10 until object tracks are compared as full temporal Galaga target-crop sequences, rotations, dive poses, and capture/rescue transitions.

**Movement read:** Strict movement score 4.6/10 against challenge-5-pink-green-cascade-group-2: y-range fit 1, path-length fit 1, turn fit 1, object-track fit 0.23. Current probes now include runtime object tracks compared against CPU-extracted Galaga target-video object tracks where available. Legacy broad vector best-match was 9.6/10 against challenge-5-pink-green-cascade-group-2; xRange 1.0344, yRange 0.6434, pathLength 1.9861.

**Alien variation read:** Strict alien/progression novelty score 3.9/10. Current stages expose labels, type mixes, direct specialty-sprite target-crop evidence, and 1 visual family/families, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and galboss visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.25s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.25s.

**Target contract read:** Target contract fit is 3.9/10 for Challenging Stage 5 target-video object tracks: group count 1, runtime path-family order 0, declared path-family order n/a, type order 0, family order 0, object-track 0.23 via direct target-video tracks. This is a group/object-track read, not frame-perfect sprite identity recognition.

**Shot-opportunity read:** Shot-opportunity probe found scoreable targets in 45 sampled windows; 67% had a lane with 2+ targets, lane diversity was 1, and center-lane bias was 0.18.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.
- Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Target-contract fit is only 3.9/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.
- Pink/green cascade identity now lands on its first-pass late reference, but the current window still needs five group labels and stronger lower-field route readability.

**Next actions:**
- Promote the Challenge 5 pink/green cascade window into five group labels and tune lower-field pass timing against those labels.
- Score group-to-group alternation so cascade identity is not just a different path-family name.


## Stage 23 / Challenge 6

**Current score:** interesting factor 4.2/10; challenge conformance 4.2/10. Movement 4.3/10, graphics 4.5/10, alien novelty 3.9/10, progression 2.7/10, player shot opportunity 5.5/10.

**Legacy broad coverage score:** 6.8/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Sixth challenge should emphasize green ladder rhythm and split exits.

**Aurora current:** green-ladder-split / green-ladder-split; lanes bee, but, rogue, boss, boss, rogue, but, bee; first-wave types bee, but, rogue, boss, boss, rogue, but, bee; visual families dragonfly; strict movement 4.3/10, graphics 4.5/10, alien novelty 3.9/10, shot opportunity 5.5/10, target-contract fit 4.5/10.

**Graphics read:** Strict graphics score 4.5/10. Current visible family/type labels are present, Direct runtime-vs-Galaga target-crop comparator reads 5.97/10 overall and 3.86/10 for challenge specialty sprites; weakest challenge crop is challenge-mosquito at 3.68/10. Runtime sprite-motion hook observed 2 visual family/families, 1 path pose family/families, 6/6 animation phase buckets, both flap state(s), and 30 object-tracked silhouette track(s). Aurora runtime motion corresponds to 3 frame-labeled segmented-reference target row(s), average 6.2/10; phase-order average is 4.8/10. Weakest row bee-zako-pulse-pair at 5.42/10. Graphics remain capped at 5.1/10 until object tracks are compared as full temporal Galaga target-crop sequences, rotations, dive poses, and capture/rescue transitions.

**Movement read:** Strict movement score 4.3/10 against challenge-6-green-ladder-split-group-1: y-range fit 1, path-length fit 1, turn fit 1, object-track fit 0.34. Current probes now include runtime object tracks compared against CPU-extracted Galaga target-video object tracks where available. Legacy broad vector best-match was 8.9/10 against challenge-6-green-ladder-split-group-1; xRange 1.0501, yRange 0.7984, pathLength 2.0261.

**Alien variation read:** Strict alien/progression novelty score 3.9/10. Current stages expose labels, type mixes, direct specialty-sprite target-crop evidence, and 1 visual family/families, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and dragonfly visual family labels. Group identity diagnostic: 5/5 wave type signatures and 1/5 path signatures; average within-wave spawn span 0.24s.

**Group identity read:** 5/5 wave type signatures and 1/5 path signatures; average within-wave spawn span 0.24s.

**Target contract read:** Target contract fit is 4.5/10 for Challenging Stage 6 target-video object tracks: group count 1, runtime path-family order 0, declared path-family order n/a, type order 0, family order 0, object-track 0.33 via direct target-video tracks. This is a group/object-track read, not frame-perfect sprite identity recognition.

**Shot-opportunity read:** Shot-opportunity probe found scoreable targets in 42 sampled windows; 81% had a lane with 2+ targets, lane diversity was 1, and center-lane bias was 0.17.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.
- Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Target-contract fit is only 4.5/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.
- Green-ladder split now lands on a Challenge 6 ladder/split reference; remaining work is fuller path length, lower reversal noise, and object-tracked group timing.

**Next actions:**
- Rebuild Challenge 6 around green ladder and split-exit timing until its measured vector hits challenge-6-green-ladder-split-group-1.
- Add frame labels for staggered ladder rungs, split exit side, and upper-band scoreability.


## Stage 27 / Challenge 7

**Current score:** interesting factor 4.2/10; challenge conformance 4.2/10. Movement 4.5/10, graphics 4.6/10, alien novelty 3.9/10, progression 2.7/10, player shot opportunity 5.1/10.

**Legacy broad coverage score:** 6.9/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Seventh challenge should introduce a yellow diagonal fan with a memorable scoring lane.

**Aurora current:** yellow-diagonal-fan / yellow-diagonal-fan; lanes boss, bee, but, rogue, rogue, but, bee, boss; first-wave types boss, bee, but, rogue, rogue, but, bee, boss; visual families crown; strict movement 4.5/10, graphics 4.6/10, alien novelty 3.9/10, shot opportunity 5.1/10, target-contract fit 4.2/10.

**Graphics read:** Strict graphics score 4.6/10. Current visible family/type labels are present, Direct runtime-vs-Galaga target-crop comparator reads 5.97/10 overall and 3.86/10 for challenge specialty sprites; weakest challenge crop is challenge-mosquito at 3.68/10. Runtime sprite-motion hook observed 1 visual family/families, 1 path pose family/families, 6/6 animation phase buckets, both flap state(s), and 20 object-tracked silhouette track(s). Aurora runtime motion corresponds to 3 frame-labeled segmented-reference target row(s), average 6.2/10; phase-order average is 4.8/10. Weakest row bee-zako-pulse-pair at 5.42/10. Graphics remain capped at 5.1/10 until object tracks are compared as full temporal Galaga target-crop sequences, rotations, dive poses, and capture/rescue transitions.

**Movement read:** Strict movement score 4.5/10 against challenge-7-yellow-diagonal-fan-group-5: y-range fit 0.93, path-length fit 1, turn fit 1, object-track fit 0.29. Current probes now include runtime object tracks compared against CPU-extracted Galaga target-video object tracks where available. Legacy broad vector best-match was 9.5/10 against challenge-7-yellow-diagonal-fan-group-5; xRange 1.0468, yRange 0.538, pathLength 1.8102.

**Alien variation read:** Strict alien/progression novelty score 3.9/10. Current stages expose labels, type mixes, direct specialty-sprite target-crop evidence, and 1 visual family/families, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and crown visual family labels. Group identity diagnostic: 5/5 wave type signatures and 1/5 path signatures; average within-wave spawn span 0.23s.

**Group identity read:** 5/5 wave type signatures and 1/5 path signatures; average within-wave spawn span 0.23s.

**Target contract read:** Target contract fit is 4.2/10 for Challenging Stage 7 target-video object tracks: group count 1, runtime path-family order 0, declared path-family order n/a, type order 0, family order 0, object-track 0.29 via direct target-video tracks. This is a group/object-track read, not frame-perfect sprite identity recognition.

**Shot-opportunity read:** Shot-opportunity probe found scoreable targets in 31 sampled windows; 74% had a lane with 2+ targets, lane diversity was 1, and center-lane bias was 0.19.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.
- Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Target-contract fit is only 4.2/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.
- Yellow diagonal fan now lands on a Challenge 7 diagonal-fan reference; remaining work is stronger lower-field travel and object-tracked diagonal lane timing.

**Next actions:**
- Rebuild Challenge 7 around the yellow diagonal fan so the best match lands on challenge-7-yellow-diagonal-fan-group-1, not the finale label.
- Add a player-hit opportunity probe that rewards firing along the diagonal band rather than center-lane waiting.


## Stage 31 / Challenge 8

**Current score:** interesting factor 4.4/10; challenge conformance 4.4/10. Movement 4.5/10, graphics 4.7/10, alien novelty 3.9/10, progression 3.1/10, player shot opportunity 5.5/10.

**Legacy broad coverage score:** 7/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Eighth visible challenge should act as a compact blue/purple late-loop capstone.

**Aurora current:** blue-purple-finale / blue-purple-finale; lanes rogue, boss, bee, but, but, bee, boss, rogue; first-wave types rogue, boss, bee, but, but, bee, boss, rogue; visual families stingray; strict movement 4.5/10, graphics 4.7/10, alien novelty 3.9/10, shot opportunity 5.5/10, target-contract fit 4.2/10.

**Graphics read:** Strict graphics score 4.7/10. Current visible family/type labels are present, Direct runtime-vs-Galaga target-crop comparator reads 5.97/10 overall and 3.86/10 for challenge specialty sprites; weakest challenge crop is challenge-mosquito at 3.68/10. Runtime sprite-motion hook observed 3 visual family/families, 3 path pose family/families, 6/6 animation phase buckets, both flap state(s), and 24 object-tracked silhouette track(s). Aurora runtime motion corresponds to 3 frame-labeled segmented-reference target row(s), average 6.2/10; phase-order average is 4.8/10. Weakest row bee-zako-pulse-pair at 5.42/10. Graphics remain capped at 5.1/10 until object tracks are compared as full temporal Galaga target-crop sequences, rotations, dive poses, and capture/rescue transitions.

**Movement read:** Strict movement score 4.5/10 against challenge-8-blue-purple-finale-group-4: y-range fit 1, path-length fit 1, turn fit 1, object-track fit 0.29. Current probes now include runtime object tracks compared against CPU-extracted Galaga target-video object tracks where available. Legacy broad vector best-match was 9.3/10 against challenge-8-blue-purple-finale-group-4; xRange 0.9897, yRange 0.7369, pathLength 2.5453.

**Alien variation read:** Strict alien/progression novelty score 3.9/10. Current stages expose labels, type mixes, direct specialty-sprite target-crop evidence, and 1 visual family/families, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and stingray visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.21s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.21s.

**Target contract read:** Target contract fit is 4.2/10 for Challenging Stage 8 target-video object tracks: group count 1, runtime path-family order 0, declared path-family order n/a, type order 0, family order 0, object-track 0.29 via direct target-video tracks. This is a group/object-track read, not frame-perfect sprite identity recognition.

**Shot-opportunity read:** Shot-opportunity probe found scoreable targets in 38 sampled windows; 74% had a lane with 2+ targets, lane diversity was 1, and center-lane bias was 0.16.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.
- Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Target-contract fit is only 4.2/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.
- Blue/purple finale is now represented as its own runtime contract, but it still needs fuller path length and active sprite-motion evidence before it feels like a late-loop capstone.

**Next actions:**
- Refine the Challenge 8 blue/purple finale with fuller path length and compact late-loop timing.
- Promote challenge enemy active-motion scoring so visual novelty is measured through animation, not only family labels.


## Plan To Improve

1. Treat the current strict scores as the release-facing truth: the broad coverage score is diagnostic only.
2. Build the challenge-stage target grammar: per-challenge group order, first-visible frame, entry side, exit side, path length, turn count, featured alien family, scoring window, perfect-bonus expectation, and result feedback.
3. Implement Stage 3 / Challenging Stage 1 first: top-right bee line, late top-left butterfly line, visibly longer upper-band sweep, clear peel-off exits, no combat grammar, and reference-matched duration/turn count.
4. Implement Stage 7 / Challenging Stage 2 as a different authored set piece, not just wider Stage 3: denser mixed novelty, crossing pattern, different entry side and exit side, readable scoring route.
5. Implement Stage 11 / Challenging Stage 3 with boss-led novelty and active animation evidence: featured alien role, flapping/pulsing/rotation windows, and a distinct reward read.
6. Continue the late-stage rebuild now that Challenges 4-8 have media-backed windows: preserve the new Stage 15, 19, 23, 27, and 31 contracts, then promote five group labels for each.
7. Prioritize Challenge 6 green-ladder and Challenge 7 yellow-fan precision work, because they now hit the expected reference families but still need longer path length, cleaner lower-field travel, and lower reversal noise.
8. Promote challenge-stage contact sheets, trajectory SVGs, active sprite-motion probes, and per-stage motion timelines into the Application Guide so the human review can see the actual delta, not only score text.

## Success Criteria

- Raise challenge-stage interesting factor from 4.3/10 to 5.0/10 as the first honest beta-facing gate by implementing one visibly reference-like challenge, then toward 6.0/10 after Stage 3, 7, and 11 each have distinct authored contracts.
- Keep the separate target-contract read above 7.0/10 for Challenge Stage 1 while promoting contracts for Stages 7 and 11; group-contract success is useful but does not replace frame-level motion/graphics scoring.
- Raise movement conformance from 4.4/10 by increasing y-range, path length, turn count, and exit-side match against the Galaga challenge references.
- Raise graphical conformance from 4.5/10 by extending the object-tracked silhouette hook into Galaga target-crop sequence comparisons; do not inflate it from type labels alone.
- Raise player shot opportunity from 5.4/10 by creating lane-readable scoring windows for each challenge rather than incidental central-lane hits.
- Preserve 0 enemy shots, 0 enemy attack starts, and 0 ship losses during challenge windows.
- Convert the first-pass late-reference labels into five-group frame/object labels before treating the late challenge sequence as conformant.
- Extend sprite-motion scoring for challenge enemies so visual novelty becomes object-tracked pixel evidence, not only a phase/family hook.
