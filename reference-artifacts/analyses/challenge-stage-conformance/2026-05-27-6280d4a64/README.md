# Challenge Stage Conformance Analysis

Generated: 2026-05-27T07:07:49.163Z
Commit: 6280d4a64
Branch: codex/challenge-target-authority-setpiece-upgrade

## Executive Summary

This is now a strict challenge-stage readout. The prior alien-entry score looked too healthy because it rewarded coverage, type labels, and broad stage signatures. That was useful harness progress, but it overstated the player-facing experience. This report follows the current project decision that challenging stages start at **1/10 interesting**, **1/10 movement**, and **1/10 graphical conformance** until they earn credit through reference-grounded movement, active visual evidence, alien/stage novelty, and durable bonus-stage contracts.

Current result: **4.3/10 interesting factor** and **4.2/10 challenge-stage conformance**. Movement is **4.2/10**, graphical conformance is **4.6/10**, alien/stage novelty is **3.9/10**, and player shot opportunity is **5.6/10**. The strongest rule finding is that current probes show no enemy shots, no attack starts, and no ship losses during sampled challenge windows. The weakest player-facing finding is that current challenge stages are functionally safe but not yet fully credible Galaga-like bonus exhibitions: strict movement is 4.2/10, strict graphics is 4.6/10, alien/stage novelty is 3.9/10, player shot opportunity is 5.6/10, target-video object-track fit is 3.7/10, and sprite-motion correspondence is 7.83/10 with target timing status frame-labeled-segmented-reference-windows. Diagnostic legacy coverage was 6.7/10, which is why the old read was too generous.

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
| 3 | 1 | 4.3/10 | 4.3/10 | 4.6/10 | 3.9/10 | 5.7/10 | 4.3/10 | challenge-1-arrival-group-1 (8.5/10 legacy) | pass | Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns. |
| 7 | 2 | 3.7/10 | 3/10 | 4.1/10 | 3.9/10 | 5.7/10 | 3.6/10 | challenge-1-arrival-group-1 (8.4/10 legacy) | pass | Best reference match is challenge-1-arrival-group-1, not expected challenge-2-arrival-group-1.<br>Movement conformance is only 3/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.<br>Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Cross-sweep identity is visible in labels, but the measured vector still misses the expected Challenge 2 reference family. |
| 11 | 3 | 4.3/10 | 4.2/10 | 4.7/10 | 3.9/10 | 5.6/10 | 4.3/10 | challenge-3-arrival-group-1 (8/10 legacy) | pass | Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Dragonfly/boss-led identity now lands on the expected Challenge 3 reference family, but sprite-motion novelty and tracked Galaga challenge-3 path phases are not yet scored. |
| 15 | 4 | 4.4/10 | 4.3/10 | 4.8/10 | 3.9/10 | 5.9/10 | 4.4/10 | challenge-4-pink-serpentine-group-1 (8.9/10 legacy) | pass | Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Target-contract fit is only 4.7/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.<br>Pink-serpentine identity now lands on its first-pass late reference, but it still needs five-group frame labels, target sprite-motion evidence, and stronger player-visible novelty before it can claim maturity. |
| 19 | 5 | 4.4/10 | 4.6/10 | 4.8/10 | 3.9/10 | 5.5/10 | 4.4/10 | challenge-5-pink-green-cascade-group-4 (9.6/10 legacy) | pass | Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Target-contract fit is only 4.3/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.<br>Pink/green cascade identity now lands on its first-pass late reference, but the current window still needs five group labels and stronger lower-field route readability. |
| 23 | 6 | 4.3/10 | 4.3/10 | 4.6/10 | 3.9/10 | 5.8/10 | 4.2/10 | challenge-6-green-ladder-split-group-1 (8.9/10 legacy) | pass | Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Target-contract fit is only 4.5/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.<br>Green-ladder split now lands on a Challenge 6 ladder/split reference; remaining work is fuller path length, lower reversal noise, and object-tracked group timing. |
| 27 | 7 | 4.2/10 | 4.3/10 | 4.7/10 | 3.9/10 | 5.2/10 | 4.2/10 | challenge-7-yellow-diagonal-fan-group-1 (8.8/10 legacy) | pass | Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Target-contract fit is only 4.7/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.<br>Yellow diagonal fan now lands on a Challenge 7 diagonal-fan reference; remaining work is stronger lower-field travel and object-tracked diagonal lane timing. |
| 31 | 8 | 4.4/10 | 4.3/10 | 4.8/10 | 3.9/10 | 5.7/10 | 4.3/10 | challenge-8-blue-purple-finale-group-1 (8.9/10 legacy) | pass | Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Target-contract fit is only 4.4/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.<br>Blue/purple finale is now represented as its own runtime contract, but it still needs fuller path length and active sprite-motion evidence before it feels like a late-loop capstone. |


## Stage 3 / Challenge 1

**Current score:** interesting factor 4.3/10; challenge conformance 4.3/10. Movement 4.3/10, graphics 4.6/10, alien novelty 3.9/10, progression 3.2/10, player shot opportunity 5.7/10.

**Legacy broad coverage score:** 6.4/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** First Galaga-style challenging stage: readable bonus set piece, no fire, no ship loss, upper-band mirrored entries, bee/butterfly line waves, visible arrival/peel-off.

**Aurora current:** first-challenge-peel / first-challenge-peel; lanes bee, bee, bee, bee, but, but, but, but; first-wave types bee, bee, bee, bee, but, but, but, but; visual families classic; strict movement 4.3/10, graphics 4.6/10, alien novelty 3.9/10, shot opportunity 5.7/10, target-contract fit 6.9/10.

**Graphics read:** Strict graphics score 4.6/10. Current visible family/type labels are present, Direct runtime-vs-Galaga target-crop comparator reads 6.18/10 overall and 4.31/10 for challenge specialty sprites; weakest challenge crop is challenge-mosquito at 4.04/10. Runtime sprite-motion hook observed 1 visual family/families, 3 path pose family/families, 6/6 animation phase buckets, both flap state(s), and 40 object-tracked silhouette track(s). Aurora runtime motion corresponds to 3 frame-labeled segmented-reference target row(s), average 7.8/10; phase-order average is 5.6/10. Weakest row bee-zako-pulse-pair at 7.42/10. Graphics remain capped at 5.1/10 until object tracks are compared as full temporal Galaga target-crop sequences, rotations, dive poses, and capture/rescue transitions.

**Movement read:** Strict movement score 4.3/10 against challenge-1-arrival-group-1: y-range fit 1, path-length fit 1, turn fit 1, object-track fit 0.29. Current probes now include runtime object tracks compared against CPU-extracted Galaga target-video object tracks where available. Legacy broad vector best-match was 8.5/10 against challenge-1-arrival-group-1; xRange 0.798, yRange 0.7318, pathLength 0.7441.

**Alien variation read:** Strict alien/progression novelty score 3.9/10. Current stages expose labels, type mixes, direct specialty-sprite target-crop evidence, and 1 visual family/families, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 2 type(s) and classic visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.48s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.48s.

**Target contract read:** Target contract fit is 6.9/10 for Challenging Stage 1 (Levels 3-4): group count 1, path-family order 1, type order 1, family order 1, object-track 0.29 via direct target-video tracks. This is a group/object-track read, not frame-perfect sprite identity recognition.

**Shot-opportunity read:** Shot-opportunity probe found scoreable targets in 47 sampled windows; 77% had a lane with 2+ targets, lane diversity was 1, and center-lane bias was 0.33.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.

**Next actions:**
- Protect the first-challenge bee/butterfly line contract, then tune path length, turn count, and rack-slot precision against challenge-1 arrival and late-wave labels.
- Add contact-sheet comparison for first-visible frame, entry side, exit side, lane occupancy, and group timing so the next tuning pass can improve trajectory precision without subjective guessing.


## Stage 7 / Challenge 2

**Current score:** interesting factor 3.7/10; challenge conformance 3.6/10. Movement 3/10, graphics 4.1/10, alien novelty 3.9/10, progression 2.4/10, player shot opportunity 5.7/10.

**Legacy broad coverage score:** 5.8/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Second challenge should feel denser and more novel than challenge 1 while staying nonlethal and non-shooting.

**Aurora current:** scorpion-cross-sweep / cross-sweep; lanes but, boss, rogue, bee, bee, rogue, boss, but; first-wave types but, boss, rogue, bee, bee, rogue, boss, but; visual families classic; strict movement 3/10, graphics 4.1/10, alien novelty 3.9/10, shot opportunity 5.7/10, target-contract fit 6.2/10.

**Graphics read:** Strict graphics score 4.1/10. Current visible family/type labels are present, Direct runtime-vs-Galaga target-crop comparator reads 6.18/10 overall and 4.31/10 for challenge specialty sprites; weakest challenge crop is challenge-mosquito at 4.04/10. Runtime sprite-motion hook observed 1 visual family/families, 1 path pose family/families, 6/6 animation phase buckets, both flap state(s), and 8 object-tracked silhouette track(s). Aurora runtime motion corresponds to 3 frame-labeled segmented-reference target row(s), average 7.8/10; phase-order average is 5.6/10. Weakest row bee-zako-pulse-pair at 7.42/10. Graphics remain capped at 5.1/10 until object tracks are compared as full temporal Galaga target-crop sequences, rotations, dive poses, and capture/rescue transitions.

**Movement read:** Strict movement score 3/10 against challenge-2-arrival-group-1: y-range fit 1, path-length fit 1, turn fit 0.5, object-track fit 0.3. Current probes now include runtime object tracks compared against CPU-extracted Galaga target-video object tracks where available. Legacy broad vector best-match was 8.4/10 against challenge-1-arrival-group-1; xRange 0.7782, yRange 0.5279, pathLength 0.8934.

**Alien variation read:** Strict alien/progression novelty score 3.9/10. Current stages expose labels, type mixes, direct specialty-sprite target-crop evidence, and 1 visual family/families, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and classic visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.42s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.42s.

**Target contract read:** Target contract fit is 6.2/10 for Challenging Stage 2 (Levels 7-8): group count 1, path-family order 0.6, type order 1, family order 1, object-track 0.3 via direct target-video tracks. This is a group/object-track read, not frame-perfect sprite identity recognition.

**Shot-opportunity read:** Shot-opportunity probe found scoreable targets in 4 sampled windows; 100% had a lane with 2+ targets, lane diversity was 0.71, and center-lane bias was 0.11.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Best reference match is challenge-1-arrival-group-1, not expected challenge-2-arrival-group-1.
- Movement conformance is only 3/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.
- Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Cross-sweep identity is visible in labels, but the measured vector still misses the expected Challenge 2 reference family.

**Next actions:**
- Tune challenge 2 toward the denser mixed-novelty-line reference instead of relying on a generic cross-sweep.
- Score separate group identities so stage 7 is not just a slightly wider stage 3.


## Stage 11 / Challenge 3

**Current score:** interesting factor 4.3/10; challenge conformance 4.3/10. Movement 4.2/10, graphics 4.7/10, alien novelty 3.9/10, progression 3.2/10, player shot opportunity 5.6/10.

**Legacy broad coverage score:** 6.8/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Third challenge should make the new visual family and boss-led novelty obvious, with larger sweep vocabulary and no attacks.

**Aurora current:** stingray-crown-hook-hybrid / hook-arc; lanes boss, rogue, but, bee, boss, bee, but, rogue; first-wave types boss, rogue, but, bee, boss, bee, but, rogue; visual families dragonfly; strict movement 4.2/10, graphics 4.7/10, alien novelty 3.9/10, shot opportunity 5.6/10, target-contract fit 7.3/10.

**Graphics read:** Strict graphics score 4.7/10. Current visible family/type labels are present, Direct runtime-vs-Galaga target-crop comparator reads 6.18/10 overall and 4.31/10 for challenge specialty sprites; weakest challenge crop is challenge-mosquito at 4.04/10. Runtime sprite-motion hook observed 1 visual family/families, 2 path pose family/families, 6/6 animation phase buckets, both flap state(s), and 16 object-tracked silhouette track(s). Aurora runtime motion corresponds to 3 frame-labeled segmented-reference target row(s), average 7.8/10; phase-order average is 5.6/10. Weakest row bee-zako-pulse-pair at 7.42/10. Graphics remain capped at 5.1/10 until object tracks are compared as full temporal Galaga target-crop sequences, rotations, dive poses, and capture/rescue transitions.

**Movement read:** Strict movement score 4.2/10 against challenge-3-arrival-group-1: y-range fit 1, path-length fit 0.95, turn fit 0.5, object-track fit 0.54. Current probes now include runtime object tracks compared against CPU-extracted Galaga target-video object tracks where available. Legacy broad vector best-match was 8/10 against challenge-3-arrival-group-1; xRange 0.445, yRange 0.7001, pathLength 0.8128.

**Alien variation read:** Strict alien/progression novelty score 3.9/10. Current stages expose labels, type mixes, direct specialty-sprite target-crop evidence, and 1 visual family/families, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and dragonfly visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.36s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.36s.

**Target contract read:** Target contract fit is 7.3/10 for Challenging Stage 3 (Levels 11-12): group count 1, path-family order 1, type order 1, family order 1, object-track 0.54 via direct target-video tracks. This is a group/object-track read, not frame-perfect sprite identity recognition.

**Shot-opportunity read:** Shot-opportunity probe found scoreable targets in 7 sampled windows; 100% had a lane with 2+ targets, lane diversity was 0.86, and center-lane bias was 0.17.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Dragonfly/boss-led identity now lands on the expected Challenge 3 reference family, but sprite-motion novelty and tracked Galaga challenge-3 path phases are not yet scored.

**Next actions:**
- Promote challenge-3 boss-led reference phases and score dragonfly visual novelty as animation, not only family label.
- Add motion windows for wing flaps, pulsing, dive/rotation silhouette, and challenge-only nonlethal arrival.


## Stage 15 / Challenge 4

**Current score:** interesting factor 4.4/10; challenge conformance 4.4/10. Movement 4.3/10, graphics 4.8/10, alien novelty 3.9/10, progression 3.1/10, player shot opportunity 5.9/10.

**Legacy broad coverage score:** 6.9/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Fourth challenge should shift into long specialty serpentine arcs with obvious new color/family identity while staying nonlethal.

**Aurora current:** pink-serpentine-late / pink-serpentine; lanes boss, rogue, but, bee, bee, but, rogue, boss; first-wave types boss, rogue, but, bee, bee, but, rogue, boss; visual families galboss; strict movement 4.3/10, graphics 4.8/10, alien novelty 3.9/10, shot opportunity 5.9/10, target-contract fit 4.7/10.

**Graphics read:** Strict graphics score 4.8/10. Current visible family/type labels are present, Direct runtime-vs-Galaga target-crop comparator reads 6.18/10 overall and 4.31/10 for challenge specialty sprites; weakest challenge crop is challenge-mosquito at 4.04/10. Runtime sprite-motion hook observed 2 visual family/families, 2 path pose family/families, 6/6 animation phase buckets, both flap state(s), and 29 object-tracked silhouette track(s). Aurora runtime motion corresponds to 3 frame-labeled segmented-reference target row(s), average 7.8/10; phase-order average is 5.6/10. Weakest row bee-zako-pulse-pair at 7.42/10. Graphics remain capped at 5.1/10 until object tracks are compared as full temporal Galaga target-crop sequences, rotations, dive poses, and capture/rescue transitions.

**Movement read:** Strict movement score 4.3/10 against challenge-4-pink-serpentine-group-1: y-range fit 1, path-length fit 1, turn fit 1, object-track fit 0.37. Current probes now include runtime object tracks compared against CPU-extracted Galaga target-video object tracks where available. Legacy broad vector best-match was 8.9/10 against challenge-4-pink-serpentine-group-1; xRange 1.0617, yRange 0.6363, pathLength 1.3096.

**Alien variation read:** Strict alien/progression novelty score 3.9/10. Current stages expose labels, type mixes, direct specialty-sprite target-crop evidence, and 1 visual family/families, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and galboss visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.24s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.24s.

**Target contract read:** Target contract fit is 4.7/10 for Challenging Stage 4 target-video object tracks: group count 1, path-family order 0, type order 0, family order 0, object-track 0.37 via direct target-video tracks. This is a group/object-track read, not frame-perfect sprite identity recognition.

**Shot-opportunity read:** Shot-opportunity probe found scoreable targets in 35 sampled windows; 86% had a lane with 2+ targets, lane diversity was 1, and center-lane bias was 0.14.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Target-contract fit is only 4.7/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.
- Pink-serpentine identity now lands on its first-pass late reference, but it still needs five-group frame labels, target sprite-motion evidence, and stronger player-visible novelty before it can claim maturity.

**Next actions:**
- Promote the Challenge 4 pink-serpentine window into five group labels and tune the runtime path so all groups keep a readable serpentine score lane.
- Add high-bonus readability probes so late-stage complexity stays learnable instead of becoming visual noise.


## Stage 19 / Challenge 5

**Current score:** interesting factor 4.4/10; challenge conformance 4.4/10. Movement 4.6/10, graphics 4.8/10, alien novelty 3.9/10, progression 3.1/10, player shot opportunity 5.5/10.

**Legacy broad coverage score:** 7.1/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Fifth challenge should distinguish itself with pink/green cascade motion, alternating group identity, and stronger lower-field pass readability.

**Aurora current:** pink-green-cascade / pink-green-cascade; lanes rogue, boss, but, bee, boss, but, bee, rogue; first-wave types rogue, boss, but, bee, boss, but, bee, rogue; visual families galboss; strict movement 4.6/10, graphics 4.8/10, alien novelty 3.9/10, shot opportunity 5.5/10, target-contract fit 4.3/10.

**Graphics read:** Strict graphics score 4.8/10. Current visible family/type labels are present, Direct runtime-vs-Galaga target-crop comparator reads 6.18/10 overall and 4.31/10 for challenge specialty sprites; weakest challenge crop is challenge-mosquito at 4.04/10. Runtime sprite-motion hook observed 3 visual family/families, 3 path pose family/families, 6/6 animation phase buckets, both flap state(s), and 37 object-tracked silhouette track(s). Aurora runtime motion corresponds to 3 frame-labeled segmented-reference target row(s), average 7.8/10; phase-order average is 5.6/10. Weakest row bee-zako-pulse-pair at 7.42/10. Graphics remain capped at 5.1/10 until object tracks are compared as full temporal Galaga target-crop sequences, rotations, dive poses, and capture/rescue transitions.

**Movement read:** Strict movement score 4.6/10 against challenge-5-pink-green-cascade-group-4: y-range fit 1, path-length fit 1, turn fit 1, object-track fit 0.31. Current probes now include runtime object tracks compared against CPU-extracted Galaga target-video object tracks where available. Legacy broad vector best-match was 9.6/10 against challenge-5-pink-green-cascade-group-4; xRange 1.0651, yRange 0.6492, pathLength 1.6956.

**Alien variation read:** Strict alien/progression novelty score 3.9/10. Current stages expose labels, type mixes, direct specialty-sprite target-crop evidence, and 1 visual family/families, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and galboss visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.25s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.25s.

**Target contract read:** Target contract fit is 4.3/10 for Challenging Stage 5 target-video object tracks: group count 1, path-family order 0, type order 0, family order 0, object-track 0.31 via direct target-video tracks. This is a group/object-track read, not frame-perfect sprite identity recognition.

**Shot-opportunity read:** Shot-opportunity probe found scoreable targets in 35 sampled windows; 80% had a lane with 2+ targets, lane diversity was 1, and center-lane bias was 0.17.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Target-contract fit is only 4.3/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.
- Pink/green cascade identity now lands on its first-pass late reference, but the current window still needs five group labels and stronger lower-field route readability.

**Next actions:**
- Promote the Challenge 5 pink/green cascade window into five group labels and tune lower-field pass timing against those labels.
- Score group-to-group alternation so cascade identity is not just a different path-family name.


## Stage 23 / Challenge 6

**Current score:** interesting factor 4.3/10; challenge conformance 4.2/10. Movement 4.3/10, graphics 4.6/10, alien novelty 3.9/10, progression 2.7/10, player shot opportunity 5.8/10.

**Legacy broad coverage score:** 6.8/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Sixth challenge should emphasize green ladder rhythm and split exits.

**Aurora current:** green-ladder-split / green-ladder-split; lanes bee, but, rogue, boss, boss, rogue, but, bee; first-wave types bee, but, rogue, boss, boss, rogue, but, bee; visual families dragonfly; strict movement 4.3/10, graphics 4.6/10, alien novelty 3.9/10, shot opportunity 5.8/10, target-contract fit 4.5/10.

**Graphics read:** Strict graphics score 4.6/10. Current visible family/type labels are present, Direct runtime-vs-Galaga target-crop comparator reads 6.18/10 overall and 4.31/10 for challenge specialty sprites; weakest challenge crop is challenge-mosquito at 4.04/10. Runtime sprite-motion hook observed 2 visual family/families, 1 path pose family/families, 6/6 animation phase buckets, both flap state(s), and 38 object-tracked silhouette track(s). Aurora runtime motion corresponds to 3 frame-labeled segmented-reference target row(s), average 7.8/10; phase-order average is 5.6/10. Weakest row bee-zako-pulse-pair at 7.42/10. Graphics remain capped at 5.1/10 until object tracks are compared as full temporal Galaga target-crop sequences, rotations, dive poses, and capture/rescue transitions.

**Movement read:** Strict movement score 4.3/10 against challenge-6-green-ladder-split-group-1: y-range fit 1, path-length fit 1, turn fit 1, object-track fit 0.35. Current probes now include runtime object tracks compared against CPU-extracted Galaga target-video object tracks where available. Legacy broad vector best-match was 8.9/10 against challenge-6-green-ladder-split-group-1; xRange 1.0698, yRange 0.8046, pathLength 2.0754.

**Alien variation read:** Strict alien/progression novelty score 3.9/10. Current stages expose labels, type mixes, direct specialty-sprite target-crop evidence, and 1 visual family/families, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and dragonfly visual family labels. Group identity diagnostic: 5/5 wave type signatures and 1/5 path signatures; average within-wave spawn span 0.24s.

**Group identity read:** 5/5 wave type signatures and 1/5 path signatures; average within-wave spawn span 0.24s.

**Target contract read:** Target contract fit is 4.5/10 for Challenging Stage 6 target-video object tracks: group count 1, path-family order 0, type order 0, family order 0, object-track 0.35 via direct target-video tracks. This is a group/object-track read, not frame-perfect sprite identity recognition.

**Shot-opportunity read:** Shot-opportunity probe found scoreable targets in 32 sampled windows; 84% had a lane with 2+ targets, lane diversity was 1, and center-lane bias was 0.18.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Target-contract fit is only 4.5/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.
- Green-ladder split now lands on a Challenge 6 ladder/split reference; remaining work is fuller path length, lower reversal noise, and object-tracked group timing.

**Next actions:**
- Rebuild Challenge 6 around green ladder and split-exit timing until its measured vector hits challenge-6-green-ladder-split-group-1.
- Add frame labels for staggered ladder rungs, split exit side, and upper-band scoreability.


## Stage 27 / Challenge 7

**Current score:** interesting factor 4.2/10; challenge conformance 4.2/10. Movement 4.3/10, graphics 4.7/10, alien novelty 3.9/10, progression 2.7/10, player shot opportunity 5.2/10.

**Legacy broad coverage score:** 6.8/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Seventh challenge should introduce a yellow diagonal fan with a memorable scoring lane.

**Aurora current:** yellow-diagonal-fan / yellow-diagonal-fan; lanes boss, bee, but, rogue, rogue, but, bee, boss; first-wave types boss, bee, but, rogue, rogue, but, bee, boss; visual families crown; strict movement 4.3/10, graphics 4.7/10, alien novelty 3.9/10, shot opportunity 5.2/10, target-contract fit 4.7/10.

**Graphics read:** Strict graphics score 4.7/10. Current visible family/type labels are present, Direct runtime-vs-Galaga target-crop comparator reads 6.18/10 overall and 4.31/10 for challenge specialty sprites; weakest challenge crop is challenge-mosquito at 4.04/10. Runtime sprite-motion hook observed 1 visual family/families, 1 path pose family/families, 6/6 animation phase buckets, both flap state(s), and 28 object-tracked silhouette track(s). Aurora runtime motion corresponds to 3 frame-labeled segmented-reference target row(s), average 7.8/10; phase-order average is 5.6/10. Weakest row bee-zako-pulse-pair at 7.42/10. Graphics remain capped at 5.1/10 until object tracks are compared as full temporal Galaga target-crop sequences, rotations, dive poses, and capture/rescue transitions.

**Movement read:** Strict movement score 4.3/10 against challenge-7-yellow-diagonal-fan-group-1: y-range fit 0.98, path-length fit 1, turn fit 1, object-track fit 0.38. Current probes now include runtime object tracks compared against CPU-extracted Galaga target-video object tracks where available. Legacy broad vector best-match was 8.8/10 against challenge-7-yellow-diagonal-fan-group-1; xRange 1.004, yRange 0.5503, pathLength 1.2483.

**Alien variation read:** Strict alien/progression novelty score 3.9/10. Current stages expose labels, type mixes, direct specialty-sprite target-crop evidence, and 1 visual family/families, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and crown visual family labels. Group identity diagnostic: 5/5 wave type signatures and 1/5 path signatures; average within-wave spawn span 0.23s.

**Group identity read:** 5/5 wave type signatures and 1/5 path signatures; average within-wave spawn span 0.23s.

**Target contract read:** Target contract fit is 4.7/10 for Challenging Stage 7 target-video object tracks: group count 1, path-family order 0, type order 0, family order 0, object-track 0.38 via direct target-video tracks. This is a group/object-track read, not frame-perfect sprite identity recognition.

**Shot-opportunity read:** Shot-opportunity probe found scoreable targets in 23 sampled windows; 78% had a lane with 2+ targets, lane diversity was 1, and center-lane bias was 0.17.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Target-contract fit is only 4.7/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.
- Yellow diagonal fan now lands on a Challenge 7 diagonal-fan reference; remaining work is stronger lower-field travel and object-tracked diagonal lane timing.

**Next actions:**
- Rebuild Challenge 7 around the yellow diagonal fan so the best match lands on challenge-7-yellow-diagonal-fan-group-1, not the finale label.
- Add a player-hit opportunity probe that rewards firing along the diagonal band rather than center-lane waiting.


## Stage 31 / Challenge 8

**Current score:** interesting factor 4.4/10; challenge conformance 4.3/10. Movement 4.3/10, graphics 4.8/10, alien novelty 3.9/10, progression 3.1/10, player shot opportunity 5.7/10.

**Legacy broad coverage score:** 6.9/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Eighth visible challenge should act as a compact blue/purple late-loop capstone.

**Aurora current:** blue-purple-finale / blue-purple-finale; lanes rogue, boss, bee, but, but, bee, boss, rogue; first-wave types rogue, boss, bee, but, but, bee, boss, rogue; visual families stingray; strict movement 4.3/10, graphics 4.8/10, alien novelty 3.9/10, shot opportunity 5.7/10, target-contract fit 4.4/10.

**Graphics read:** Strict graphics score 4.8/10. Current visible family/type labels are present, Direct runtime-vs-Galaga target-crop comparator reads 6.18/10 overall and 4.31/10 for challenge specialty sprites; weakest challenge crop is challenge-mosquito at 4.04/10. Runtime sprite-motion hook observed 3 visual family/families, 3 path pose family/families, 6/6 animation phase buckets, both flap state(s), and 35 object-tracked silhouette track(s). Aurora runtime motion corresponds to 3 frame-labeled segmented-reference target row(s), average 7.8/10; phase-order average is 5.6/10. Weakest row bee-zako-pulse-pair at 7.42/10. Graphics remain capped at 5.1/10 until object tracks are compared as full temporal Galaga target-crop sequences, rotations, dive poses, and capture/rescue transitions.

**Movement read:** Strict movement score 4.3/10 against challenge-8-blue-purple-finale-group-1: y-range fit 1, path-length fit 1, turn fit 1, object-track fit 0.32. Current probes now include runtime object tracks compared against CPU-extracted Galaga target-video object tracks where available. Legacy broad vector best-match was 8.9/10 against challenge-8-blue-purple-finale-group-1; xRange 1.0571, yRange 0.8113, pathLength 1.9462.

**Alien variation read:** Strict alien/progression novelty score 3.9/10. Current stages expose labels, type mixes, direct specialty-sprite target-crop evidence, and 1 visual family/families, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and stingray visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.21s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.21s.

**Target contract read:** Target contract fit is 4.4/10 for Challenging Stage 8 target-video object tracks: group count 1, path-family order 0, type order 0, family order 0, object-track 0.32 via direct target-video tracks. This is a group/object-track read, not frame-perfect sprite identity recognition.

**Shot-opportunity read:** Shot-opportunity probe found scoreable targets in 31 sampled windows; 87% had a lane with 2+ targets, lane diversity was 1, and center-lane bias was 0.18.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Target-contract fit is only 4.4/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.
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
- Raise movement conformance from 4.2/10 by increasing y-range, path length, turn count, and exit-side match against the Galaga challenge references.
- Raise graphical conformance from 4.6/10 by extending the object-tracked silhouette hook into Galaga target-crop sequence comparisons; do not inflate it from type labels alone.
- Raise player shot opportunity from 5.6/10 by creating lane-readable scoring windows for each challenge rather than incidental central-lane hits.
- Preserve 0 enemy shots, 0 enemy attack starts, and 0 ship losses during challenge windows.
- Convert the first-pass late-reference labels into five-group frame/object labels before treating the late challenge sequence as conformant.
- Extend sprite-motion scoring for challenge enemies so visual novelty becomes object-tracked pixel evidence, not only a phase/family hook.
