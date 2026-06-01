# Challenge Stage Conformance Analysis

Generated: 2026-06-01T13:45:13.782Z
Commit: b7231d3b4
Branch: codex/macbook-challenge-stage-gameplay-spectacle

## Executive Summary

This is now a strict challenge-stage readout. The prior alien-entry score looked too healthy because it rewarded coverage, type labels, and broad stage signatures. That was useful harness progress, but it overstated the player-facing experience. This report follows the current project decision that challenging stages start at **1/10 interesting**, **1/10 movement**, and **1/10 graphical conformance** until they earn credit through reference-grounded movement, active visual evidence, alien/stage novelty, and durable bonus-stage contracts.

Current result: **4.4/10 interesting factor** and **4.4/10 challenge-stage conformance**. Movement is **4.3/10**, graphical conformance is **4.6/10**, alien/stage novelty is **3.9/10**, player shot opportunity is **6.9/10**, and human-perfect potential is **7.7/10**. The strongest rule finding is that current probes show no enemy shots, no attack starts, and no ship losses during sampled challenge windows. The weakest player-facing finding is that current challenge stages are functionally safe but not yet fully credible Galaga-like bonus exhibitions: strict movement is 4.3/10, strict graphics is 4.6/10, alien/stage novelty is 3.9/10, player shot opportunity is 6.9/10, human-perfect potential is 7.7/10 with weakest interval Challenging Stage 2-3 at 7.5/10, target-video object-track fit is 2.6/10, and sprite-motion correspondence is 6.18/10 with target timing status frame-labeled-segmented-reference-windows. Diagnostic legacy coverage was 6.8/10, which is why the old read was too generous.

## Method

- Runtime challenge states were sampled through the browser-backed Aurora harness using `challengeFormationState()`.
- Reference targets came from media-backed Galaga path labels and contact sheets.
- Existing path-family comparison supplied best-match vector scores against labeled Galaga challenge entries, but those broad scores are now retained as diagnostic coverage instead of the conformance score.
- Strict movement scoring compares runtime y-range, path length, turn count, reversals, lower-field share, and trajectory best-match against the selected Galaga challenge reference vector. It is capped by current temporal-measurement limits because the harness still samples summaries rather than full tracked choreography.
- Strict graphical scoring now includes active sprite-motion plus object-tracked runtime pixel/silhouette crops for flap state, phase coverage, visual family diversity, path-pose diversity, lit-pixel stability, and bounding-box variation. It remains capped until those object tracks are compared frame-by-frame to Galaga target crops, rotations, dive poses, capture/rescue transitions, and direct target crop sequences.
- First-pass target contracts now score group count, group path-family order, expected type order, and expected family order for any challenge that has a persisted media-backed contract. This is deliberately reported as a separate contract-fit read until target-video object tracking exists.
- Player shot-opportunity scoring samples plausible firing lanes through each challenge window so movement work can be judged by whether it creates learnable high-bonus routes, not only by broad movement shape.
- Human-perfect route scoring estimates whether 40 expected challenge targets have ballistic shot windows, repeated aim windows, readable altitude, and a greedy strong-player route within the current player movement speed and shot cooldown.
- Challenge path-slot extraction suppresses player fire for challenge windows, so trajectory comparison measures authored alien motion instead of bullet-truncated player-score fragments.
- Safety is measured separately from interest: no shots/no kills is necessary, but it does not make a challenge visually conformant and contributes only as a guardrail.
- Prior 24-second evidence windows can include post-challenge normal play, so enemy bullets/attackers in those older windows are not treated as challenge-rule failures here.


## Target Artifact Coverage

The broader Galaga target-artifact coverage read is **5.1/10** overall and **4.5/10** for challenge-stage target readiness. The important implication is not that Aurora lacks all grounding; it is that the currently ingested challenge-stage corpus is still early-stage heavy. Aurora now has media-backed windows for all tracked Galaga challenge stages, including Challenges 4-8. The bottleneck has moved from source acquisition to precision: each window needs five-group frame labels for entry side, path family, scoreable band, exit side, alien family, and perfect-bonus opportunity before direct trajectory scoring should rise.

| Challenging Stage | Internal Marker | Target Status | Coverage | Next Need |
| --- | ---: | --- | ---: | --- |
| Challenging Stage 2-3 | 3 | partially-ingested | 4.5/10 | Convert existing windows into fuller five-group trajectory labels and build Aurora Stage 3 against those exact group contracts. |
| Challenging Stage 6-7 | 7 | partially-ingested | 4.5/10 | Add late-wave/results windows and group 2-5 labels. |
| Challenging Stage 10-11 | 11 | partially-ingested | 4.5/10 | Add late-wave/results windows and map specialty alien novelty explicitly. |
| Challenging Stage 14-15 | 15 | partially-ingested | 4.5/10 | Promote five-group labels for the pink serpentine reference and rebuild Aurora Stage 15 around a distinct late-stage specialty arc. |
| Challenging Stage 18-19 | 19 | partially-ingested | 4.5/10 | Promote five-group labels for the pink/green cascade reference and align Aurora's mosquito/specialty-family novelty to the visible target. |
| Challenging Stage 22-23 | 23 | partially-ingested | 4.5/10 | Promote five-group labels for the green ladder/split reference and add runtime probes for staggered group spacing. |
| Challenging Stage 26-27 | 27 | partially-ingested | 4.5/10 | Promote five-group labels for the yellow diagonal fan reference and use it as the strongest late-stage visual novelty target. |
| Challenging Stage 30-31 | 31 | partially-ingested | 4.5/10 | Promote five-group labels for the blue/purple finale reference and use it as the late-loop capstone contract. |

Full target-artifact report: `GALAGA_TARGET_ARTIFACT_COVERAGE.md` and `reference-artifacts/analyses/galaga-target-artifact-coverage/latest.json`.


## Stage Summary

| Challenging Stage | Internal Marker | Interest | Movement | Graphics | Alien Novelty | Shot Opportunity | Human Perfect | Strict Score | Diagnostic Best Reference | No-Shot/No-Kill | Critical Gap |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| Challenging Stage 2-3 | 3 | 4.4/10 | 4.2/10 | 4.5/10 | 3.9/10 | 6.8/10 | 7.5/10 | 4.4/10 | challenge-1-arrival-group-1 (8.5/10 legacy) | pass | Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.<br>Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns. |
| Challenging Stage 6-7 | 7 | 4.4/10 | 4.4/10 | 4.2/10 | 3.9/10 | 6.9/10 | 7.5/10 | 4.4/10 | challenge-2-arrival-group-1 (8.7/10 legacy) | pass | Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.<br>Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Cross-sweep identity now lands on the expected Challenging Stage 6-7 reference family; next work is trajectory precision and active visual novelty, not basic identity. |
| Challenging Stage 10-11 | 11 | 4.5/10 | 4.3/10 | 4.6/10 | 3.9/10 | 6.9/10 | 7.5/10 | 4.4/10 | challenge-3-arrival-group-1 (8.4/10 legacy) | pass | Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.<br>Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Dragonfly/boss-led identity now lands on the expected Challenging Stage 10-11 reference family, but sprite-motion novelty and tracked Galaga 10-11 path phases are not yet scored. |
| Challenging Stage 14-15 | 15 | 4.4/10 | 4.2/10 | 4.6/10 | 3.9/10 | 7.1/10 | 7.7/10 | 4.3/10 | challenge-4-pink-serpentine-group-1 (8.2/10 legacy) | pass | Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.<br>Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Target-contract fit is only 4.6/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.<br>Pink-serpentine identity now lands on its first-pass late reference, but it still needs five-group frame labels, target sprite-motion evidence, and stronger player-visible novelty before it can claim maturity. |
| Challenging Stage 18-19 | 19 | 4.5/10 | 4.4/10 | 4.7/10 | 3.9/10 | 6.8/10 | 7.8/10 | 4.5/10 | challenge-5-pink-green-cascade-group-4 (9.6/10 legacy) | pass | Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.<br>Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Target-contract fit is only 3.1/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.<br>Pink/green cascade identity now lands on its first-pass late reference, but the current window still needs five group labels and stronger lower-field route readability. |
| Challenging Stage 22-23 | 23 | 4.4/10 | 4.1/10 | 4.6/10 | 3.9/10 | 7/10 | 8/10 | 4.3/10 | challenge-6-green-ladder-split-group-3 (9/10 legacy) | pass | Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.<br>Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Target-contract fit is only 3.4/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.<br>Green-ladder split now lands on a Challenging Stage 22-23 ladder/split reference; remaining work is fuller path length, lower reversal noise, and object-tracked group timing. |
| Challenging Stage 26-27 | 27 | 4.4/10 | 4.3/10 | 4.7/10 | 3.9/10 | 6.9/10 | 7.9/10 | 4.4/10 | challenge-7-yellow-diagonal-fan-group-4 (9.2/10 legacy) | pass | Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.<br>Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Target-contract fit is only 3.3/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.<br>Yellow diagonal fan now lands on a Challenging Stage 26-27 diagonal-fan reference; remaining work is stronger lower-field travel and object-tracked diagonal lane timing. |
| Challenging Stage 30-31 | 31 | 4.4/10 | 4.2/10 | 4.7/10 | 3.9/10 | 6.8/10 | 7.7/10 | 4.4/10 | challenge-8-blue-purple-finale-group-4 (9.1/10 legacy) | pass | Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.<br>Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Target-contract fit is only 3.2/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.<br>Blue/purple finale is now represented as its own runtime contract, but it still needs fuller path length and active sprite-motion evidence before it feels like a late-loop capstone. |


## Challenging Stage 2-3

Internal challenge marker: 3.

**Current score:** interesting factor 4.4/10; challenge conformance 4.4/10. Movement 4.2/10, graphics 4.5/10, alien novelty 3.9/10, progression 3.2/10, player shot opportunity 6.8/10, human-perfect potential 7.5/10.

**Legacy broad coverage score:** 6.4/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Challenging Stage 2-3 should be a readable Galaga-style bonus set piece: no fire, no ship loss, upper-band mirrored entries, bee/butterfly line waves, visible arrival/peel-off.

**Aurora current:** first-challenge-peel / first-challenge-peel; lanes bee, bee, bee, bee, but, but, but, but; first-wave types bee, bee, bee, bee, but, but, but, but; visual families classic; strict movement 4.2/10, graphics 4.5/10, alien novelty 3.9/10, shot opportunity 6.8/10, target-contract fit 6.2/10.

**Graphics read:** Strict graphics score 4.5/10. Current visible family/type labels are present, Direct runtime-vs-Galaga target-crop comparator reads 5.97/10 overall and 3.86/10 for challenge specialty sprites; weakest challenge crop is challenge-mosquito at 3.68/10. Runtime sprite-motion hook observed 1 visual family/families, 3 path pose family/families, 6/6 animation phase buckets, both flap state(s), and 40 object-tracked silhouette track(s). Aurora runtime motion corresponds to 3 frame-labeled segmented-reference target row(s), average 6.2/10; phase-order average is 4.8/10. Weakest row bee-zako-pulse-pair at 5.42/10. Graphics remain capped at 5.1/10 until object tracks are compared as full temporal Galaga target-crop sequences, rotations, dive poses, and capture/rescue transitions.

**Movement read:** Strict movement score 4.2/10 against challenge-1-arrival-group-1: y-range fit 1, path-length fit 1, turn fit 1, object-track fit 0.25. Current probes now include runtime object tracks compared against CPU-extracted Galaga target-video object tracks where available. Legacy broad vector best-match was 8.5/10 against challenge-1-arrival-group-1; xRange 0.6062, yRange 0.7101, pathLength 0.9997.

**Alien variation read:** Strict alien/progression novelty score 3.9/10. Current stages expose labels, type mixes, direct specialty-sprite target-crop evidence, and 1 visual family/families, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 2 type(s) and classic visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.54s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.54s.

**Target contract read:** Target contract fit is 6.2/10 for Challenging Stage 2-3 target-video object tracks: group count 1, path-family order 0.6, type order 1, family order 1, object-track 0.25 via direct target-video tracks. This is a group/object-track read, not frame-perfect sprite identity recognition.

**Per-group movement rows:**
| Group | Status | Fit | Aurora runtime | Galaga target | Gap |
| --- | --- | ---: | --- | --- | --- |
| 1 | measured | 2.1/10 | left -> right; start 0.25s; end 1.5s; path 0.8 | center -> center; start 0s; end 3.25s; path 0.29 |  |
| 2 | measured | 3.1/10 | center -> center; start 3.5s; end 12.25s; path 1.04 | center -> center; start 4.38s; end 10.5s; path 1.46 |  |
| 3 | measured | 3.4/10 | center -> center; start 6.5s; end 10s; path 1.06 | left -> center; start 7.75s; end 11.88s; path 0.82 |  |
| 4 | measured | 3.3/10 | center -> center; start 9.25s; end 14.25s; path 1.44 | center -> center; start 11.25s; end 15.88s; path 1.11 |  |
| 5 | measured | 2.5/10 | center -> right; start 12.25s; end 14s; path 0.66 | center -> center; start 15.25s; end 15.88s; path 0.15 |  |

**Shot-opportunity read:** Shot-opportunity probe found scoreable targets in 45 sampled windows; 98% had a lane with 2+ targets, lane diversity was 0.86, center-lane bias was 0.39, and the human-perfect route read is 7.5/10. Human-perfect probe estimates 38/40 expected targets reachable by a greedy strong-player route, 95% with any ballistic window, 80% with repeated aim windows, and 1% top-crowd pressure.

**Human-perfect route read:** Human-perfect probe estimates 38/40 expected targets reachable by a greedy strong-player route, 95% with any ballistic window, 80% with repeated aim windows, and 1% top-crowd pressure.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.
- Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.

**Next actions:**
- Protect the Challenging Stage 2-3 bee/butterfly line contract, then tune path length, turn count, and rack-slot precision against the 2-3 arrival and late-wave labels.
- Add contact-sheet comparison for first-visible frame, entry side, exit side, lane occupancy, and group timing so the next tuning pass can improve trajectory precision without subjective guessing.


## Challenging Stage 6-7

Internal challenge marker: 7.

**Current score:** interesting factor 4.4/10; challenge conformance 4.4/10. Movement 4.4/10, graphics 4.2/10, alien novelty 3.9/10, progression 3.2/10, player shot opportunity 6.9/10, human-perfect potential 7.5/10.

**Legacy broad coverage score:** 6.4/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Challenging Stage 6-7 should feel denser and more novel than Challenging Stage 2-3 while staying nonlethal and non-shooting.

**Aurora current:** scorpion-cross-sweep / cross-sweep; lanes but, boss, rogue, bee, bee, rogue, boss, but; first-wave types but, boss, rogue, bee, bee, rogue, boss, but; visual families classic; strict movement 4.4/10, graphics 4.2/10, alien novelty 3.9/10, shot opportunity 6.9/10, target-contract fit 7/10.

**Graphics read:** Strict graphics score 4.2/10. Current visible family/type labels are present, Direct runtime-vs-Galaga target-crop comparator reads 5.97/10 overall and 3.86/10 for challenge specialty sprites; weakest challenge crop is challenge-mosquito at 3.68/10. Runtime sprite-motion hook observed 3 visual family/families, 3 path pose family/families, 6/6 animation phase buckets, both flap state(s), and 40 object-tracked silhouette track(s). Aurora runtime motion corresponds to 3 frame-labeled segmented-reference target row(s), average 6.2/10; phase-order average is 4.8/10. Weakest row bee-zako-pulse-pair at 5.42/10. Graphics remain capped at 5.1/10 until object tracks are compared as full temporal Galaga target-crop sequences, rotations, dive poses, and capture/rescue transitions.

**Movement read:** Strict movement score 4.4/10 against challenge-2-arrival-group-1: y-range fit 1, path-length fit 1, turn fit 0.9, object-track fit 0.36. Current probes now include runtime object tracks compared against CPU-extracted Galaga target-video object tracks where available. Legacy broad vector best-match was 8.7/10 against challenge-2-arrival-group-1; xRange 0.5046, yRange 0.7211, pathLength 0.9273.

**Alien variation read:** Strict alien/progression novelty score 3.9/10. Current stages expose labels, type mixes, direct specialty-sprite target-crop evidence, and 1 visual family/families, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and classic visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.42s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.42s.

**Target contract read:** Target contract fit is 7/10 for Challenging Stage 6-7 target-video object tracks: group count 1, path-family order 1, type order 1, family order 1, object-track 0.36 via direct target-video tracks. This is a group/object-track read, not frame-perfect sprite identity recognition.

**Per-group movement rows:**
| Group | Status | Fit | Aurora runtime | Galaga target | Gap |
| --- | --- | ---: | --- | --- | --- |
| 1 | measured | 2.6/10 | left -> right; start 0.25s; end 2s; path 0.97 | center -> center; start 0s; end 1.88s; path 0.06 |  |
| 2 | measured | 4.1/10 | center -> center; start 3s; end 5.75s; path 0.94 | center -> center; start 2.88s; end 6.38s; path 1.4 |  |
| 3 | measured | 4.2/10 | center -> center; start 4.5s; end 5.5s; path 0.41 | center -> center; start 4.25s; end 5s; path 0.07 |  |
| 4 | measured | 4.1/10 | left -> center; start 7.5s; end 9.75s; path 1.33 | center -> center; start 7.13s; end 10.38s; path 1.6 |  |
| 5 | measured | 3.4/10 | center -> center; start 13.5s; end 15.5s; path 0.98 | center -> center; start 13.38s; end 15.88s; path 0.63 |  |

**Shot-opportunity read:** Shot-opportunity probe found scoreable targets in 35 sampled windows; 97% had a lane with 2+ targets, lane diversity was 1, center-lane bias was 0.41, and the human-perfect route read is 7.5/10. Human-perfect probe estimates 40/40 expected targets reachable by a greedy strong-player route, 100% with any ballistic window, 95% with repeated aim windows, and 10% top-crowd pressure.

**Human-perfect route read:** Human-perfect probe estimates 40/40 expected targets reachable by a greedy strong-player route, 100% with any ballistic window, 95% with repeated aim windows, and 10% top-crowd pressure.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.
- Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Cross-sweep identity now lands on the expected Challenging Stage 6-7 reference family; next work is trajectory precision and active visual novelty, not basic identity.

**Next actions:**
- Tune Challenging Stage 6-7 toward the denser mixed-novelty-line reference instead of relying on a generic cross-sweep.
- Score separate group identities so Challenging Stage 6-7 is not just a slightly wider repeat of Challenging Stage 2-3.


## Challenging Stage 10-11

Internal challenge marker: 11.

**Current score:** interesting factor 4.5/10; challenge conformance 4.4/10. Movement 4.3/10, graphics 4.6/10, alien novelty 3.9/10, progression 3.2/10, player shot opportunity 6.9/10, human-perfect potential 7.5/10.

**Legacy broad coverage score:** 6.9/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Challenging Stage 10-11 should make the new visual family and boss-led novelty obvious, with larger sweep vocabulary and no attacks.

**Aurora current:** stingray-crown-hook-hybrid / hook-arc; lanes boss, rogue, but, bee, boss, bee, but, rogue; first-wave types boss, rogue, but, bee, boss, bee, but, rogue; visual families dragonfly; strict movement 4.3/10, graphics 4.6/10, alien novelty 3.9/10, shot opportunity 6.9/10, target-contract fit 7/10.

**Graphics read:** Strict graphics score 4.6/10. Current visible family/type labels are present, Direct runtime-vs-Galaga target-crop comparator reads 5.97/10 overall and 3.86/10 for challenge specialty sprites; weakest challenge crop is challenge-mosquito at 3.68/10. Runtime sprite-motion hook observed 3 visual family/families, 3 path pose family/families, 6/6 animation phase buckets, both flap state(s), and 40 object-tracked silhouette track(s). Aurora runtime motion corresponds to 3 frame-labeled segmented-reference target row(s), average 6.2/10; phase-order average is 4.8/10. Weakest row bee-zako-pulse-pair at 5.42/10. Graphics remain capped at 5.1/10 until object tracks are compared as full temporal Galaga target-crop sequences, rotations, dive poses, and capture/rescue transitions.

**Movement read:** Strict movement score 4.3/10 against challenge-3-arrival-group-1: y-range fit 1, path-length fit 1, turn fit 1, object-track fit 0.35. Current probes now include runtime object tracks compared against CPU-extracted Galaga target-video object tracks where available. Legacy broad vector best-match was 8.4/10 against challenge-3-arrival-group-1; xRange 0.4521, yRange 0.867, pathLength 1.1787.

**Alien variation read:** Strict alien/progression novelty score 3.9/10. Current stages expose labels, type mixes, direct specialty-sprite target-crop evidence, and 1 visual family/families, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and dragonfly visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.36s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.36s.

**Target contract read:** Target contract fit is 7/10 for Challenging Stage 10-11 target-video object tracks: group count 1, path-family order 1, type order 1, family order 1, object-track 0.35 via direct target-video tracks. This is a group/object-track read, not frame-perfect sprite identity recognition.

**Per-group movement rows:**
| Group | Status | Fit | Aurora runtime | Galaga target | Gap |
| --- | --- | ---: | --- | --- | --- |
| 1 | measured | 4.3/10 | right -> right; start 0.25s; end 1.5s; path 0.87 | right -> right; start 0s; end 1.5s; path 0.61 |  |
| 2 | measured | 3.6/10 | center -> center; start 1s; end 3.5s; path 1.3 | right -> center; start 0.88s; end 3.88s; path 0.77 |  |
| 3 | measured | 3.3/10 | center -> right; start 4.5s; end 7.25s; path 1.09 | right -> center; start 4.38s; end 8.38s; path 1.42 |  |
| 4 | measured | 4.2/10 | left -> center; start 8s; end 12s; path 1.62 | center -> center; start 7.88s; end 12.88s; path 1.63 |  |
| 5 | measured | 2.5/10 | center -> center; start 12.25s; end 14.5s; path 1.01 | center -> center; start 12.13s; end 15.88s; path 0.74 |  |

**Shot-opportunity read:** Shot-opportunity probe found scoreable targets in 47 sampled windows; 100% had a lane with 2+ targets, lane diversity was 1, center-lane bias was 0.32, and the human-perfect route read is 7.5/10. Human-perfect probe estimates 40/40 expected targets reachable by a greedy strong-player route, 100% with any ballistic window, 95% with repeated aim windows, and 15% top-crowd pressure.

**Human-perfect route read:** Human-perfect probe estimates 40/40 expected targets reachable by a greedy strong-player route, 100% with any ballistic window, 95% with repeated aim windows, and 15% top-crowd pressure.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.
- Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Dragonfly/boss-led identity now lands on the expected Challenging Stage 10-11 reference family, but sprite-motion novelty and tracked Galaga 10-11 path phases are not yet scored.

**Next actions:**
- Promote Challenging Stage 10-11 boss-led reference phases and score dragonfly visual novelty as animation, not only family label.
- Add motion windows for wing flaps, pulsing, dive/rotation silhouette, and challenge-only nonlethal arrival.


## Challenging Stage 14-15

Internal challenge marker: 15.

**Current score:** interesting factor 4.4/10; challenge conformance 4.3/10. Movement 4.2/10, graphics 4.6/10, alien novelty 3.9/10, progression 2.7/10, player shot opportunity 7.1/10, human-perfect potential 7.7/10.

**Legacy broad coverage score:** 6.7/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Challenging Stage 14-15 should shift into long specialty serpentine arcs with obvious new color/family identity while staying nonlethal.

**Aurora current:** pink-serpentine-late / pink-serpentine; lanes boss, rogue, but, bee, bee, but, rogue, boss; first-wave types boss, rogue, but, bee, bee, but, rogue, boss; visual families galboss; strict movement 4.2/10, graphics 4.6/10, alien novelty 3.9/10, shot opportunity 7.1/10, target-contract fit 4.6/10.

**Graphics read:** Strict graphics score 4.6/10. Current visible family/type labels are present, Direct runtime-vs-Galaga target-crop comparator reads 5.97/10 overall and 3.86/10 for challenge specialty sprites; weakest challenge crop is challenge-mosquito at 3.68/10. Runtime sprite-motion hook observed 2 visual family/families, 1 path pose family/families, 6/6 animation phase buckets, both flap state(s), and 40 object-tracked silhouette track(s). Aurora runtime motion corresponds to 3 frame-labeled segmented-reference target row(s), average 6.2/10; phase-order average is 4.8/10. Weakest row bee-zako-pulse-pair at 5.42/10. Graphics remain capped at 5.1/10 until object tracks are compared as full temporal Galaga target-crop sequences, rotations, dive poses, and capture/rescue transitions.

**Movement read:** Strict movement score 4.2/10 against challenge-4-pink-serpentine-group-1: y-range fit 1, path-length fit 0.94, turn fit 1, object-track fit 0.36. Current probes now include runtime object tracks compared against CPU-extracted Galaga target-video object tracks where available. Legacy broad vector best-match was 8.2/10 against challenge-4-pink-serpentine-group-1; xRange 0.4587, yRange 0.6764, pathLength 0.884.

**Alien variation read:** Strict alien/progression novelty score 3.9/10. Current stages expose labels, type mixes, direct specialty-sprite target-crop evidence, and 1 visual family/families, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and galboss visual family labels. Group identity diagnostic: 5/5 wave type signatures and 1/5 path signatures; average within-wave spawn span 0.24s.

**Group identity read:** 5/5 wave type signatures and 1/5 path signatures; average within-wave spawn span 0.24s.

**Target contract read:** Target contract fit is 4.6/10 for Challenging Stage 14-15 target-video object tracks: group count 1, path-family order 0, type order 0, family order 0, object-track 0.36 via direct target-video tracks. This is a group/object-track read, not frame-perfect sprite identity recognition.

**Per-group movement rows:**
| Group | Status | Fit | Aurora runtime | Galaga target | Gap |
| --- | --- | ---: | --- | --- | --- |
| 1 | measured | 3/10 | right -> center; start 0.25s; end 6.75s; path 1.34 | right -> center; start 0s; end 3.25s; path 0.54 |  |
| 2 | measured | 2.8/10 | center -> center; start 0.75s; end 6s; path 0.66 | center -> center; start 0.5s; end 3.25s; path 0.4 |  |
| 3 | measured | 4.5/10 | center -> center; start 3s; end 6.75s; path 0.9 | center -> center; start 2.88s; end 6.63s; path 0.78 |  |
| 4 | measured | 2.8/10 | right -> center; start 6.5s; end 7.75s; path 0.79 | center -> center; start 6.38s; end 9.88s; path 1.52 |  |
| 5 | measured | 5.2/10 | left -> center; start 13.25s; end 19s; path 0.73 | center -> center; start 13.13s; end 15.88s; path 0.81 |  |

**Shot-opportunity read:** Shot-opportunity probe found scoreable targets in 48 sampled windows; 100% had a lane with 2+ targets, lane diversity was 1, center-lane bias was 0.28, and the human-perfect route read is 7.7/10. Human-perfect probe estimates 38/40 expected targets reachable by a greedy strong-player route, 95% with any ballistic window, 85% with repeated aim windows, and 0% top-crowd pressure.

**Human-perfect route read:** Human-perfect probe estimates 38/40 expected targets reachable by a greedy strong-player route, 95% with any ballistic window, 85% with repeated aim windows, and 0% top-crowd pressure.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.
- Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Target-contract fit is only 4.6/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.
- Pink-serpentine identity now lands on its first-pass late reference, but it still needs five-group frame labels, target sprite-motion evidence, and stronger player-visible novelty before it can claim maturity.

**Next actions:**
- Promote the Challenging Stage 14-15 pink-serpentine window into five group labels and tune the runtime path so all groups keep a readable serpentine score lane.
- Add high-bonus readability probes so late-stage complexity stays learnable instead of becoming visual noise.


## Challenging Stage 18-19

Internal challenge marker: 19.

**Current score:** interesting factor 4.5/10; challenge conformance 4.5/10. Movement 4.4/10, graphics 4.7/10, alien novelty 3.9/10, progression 3.1/10, player shot opportunity 6.8/10, human-perfect potential 7.8/10.

**Legacy broad coverage score:** 7.1/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Challenging Stage 18-19 should distinguish itself with pink/green cascade motion, alternating group identity, and stronger lower-field pass readability.

**Aurora current:** pink-green-cascade / pink-green-cascade; lanes rogue, boss, but, bee, boss, but, bee, rogue; first-wave types rogue, boss, but, bee, boss, but, bee, rogue; visual families galboss; strict movement 4.4/10, graphics 4.7/10, alien novelty 3.9/10, shot opportunity 6.8/10, target-contract fit 3.1/10.

**Graphics read:** Strict graphics score 4.7/10. Current visible family/type labels are present, Direct runtime-vs-Galaga target-crop comparator reads 5.97/10 overall and 3.86/10 for challenge specialty sprites; weakest challenge crop is challenge-mosquito at 3.68/10. Runtime sprite-motion hook observed 3 visual family/families, 3 path pose family/families, 6/6 animation phase buckets, both flap state(s), and 40 object-tracked silhouette track(s). Aurora runtime motion corresponds to 3 frame-labeled segmented-reference target row(s), average 6.2/10; phase-order average is 4.8/10. Weakest row bee-zako-pulse-pair at 5.42/10. Graphics remain capped at 5.1/10 until object tracks are compared as full temporal Galaga target-crop sequences, rotations, dive poses, and capture/rescue transitions.

**Movement read:** Strict movement score 4.4/10 against challenge-5-pink-green-cascade-group-4: y-range fit 1, path-length fit 1, turn fit 1, object-track fit 0.09. Current probes now include runtime object tracks compared against CPU-extracted Galaga target-video object tracks where available. Legacy broad vector best-match was 9.6/10 against challenge-5-pink-green-cascade-group-4; xRange 1.0738, yRange 0.8799, pathLength 1.9441.

**Alien variation read:** Strict alien/progression novelty score 3.9/10. Current stages expose labels, type mixes, direct specialty-sprite target-crop evidence, and 1 visual family/families, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and galboss visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.25s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.25s.

**Target contract read:** Target contract fit is 3.1/10 for Challenging Stage 18-19 target-video object tracks: group count 1, path-family order 0, type order 0, family order 0, object-track 0.09 via direct target-video tracks. This is a group/object-track read, not frame-perfect sprite identity recognition.

**Per-group movement rows:**
| Group | Status | Fit | Aurora runtime | Galaga target | Gap |
| --- | --- | ---: | --- | --- | --- |
| 1 | measured | 1.3/10 | left -> center; start 0.5s; end 21s; path 1.84 | center -> left; start 0s; end 3.25s; path 0.91 |  |
| 2 | measured | 1.7/10 | center -> left; start 2s; end 19.75s; path 1.98 | right -> right; start 3.13s; end 7.5s; path 1.47 |  |
| 3 | measured | 1.8/10 | left -> center; start 2.5s; end 21.25s; path 2.25 | left -> left; start 7.38s; end 10.88s; path 0.76 |  |
| 4 | measured | 1.9/10 | right -> right; start 3.75s; end 23.25s; path 1.85 | right -> center; start 10.63s; end 13s; path 1.06 |  |
| 5 | measured | 1.5/10 | left -> left; start 4.75s; end 23.5s; path 1.8 | left -> center; start 12.88s; end 15.88s; path 1.21 |  |

**Shot-opportunity read:** Shot-opportunity probe found scoreable targets in 86 sampled windows; 90% had a lane with 2+ targets, lane diversity was 1, center-lane bias was 0.12, and the human-perfect route read is 7.8/10. Human-perfect probe estimates 40/40 expected targets reachable by a greedy strong-player route, 100% with any ballistic window, 100% with repeated aim windows, and 7% top-crowd pressure.

**Human-perfect route read:** Human-perfect probe estimates 40/40 expected targets reachable by a greedy strong-player route, 100% with any ballistic window, 100% with repeated aim windows, and 7% top-crowd pressure.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.
- Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Target-contract fit is only 3.1/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.
- Pink/green cascade identity now lands on its first-pass late reference, but the current window still needs five group labels and stronger lower-field route readability.

**Next actions:**
- Promote the Challenging Stage 18-19 pink/green cascade window into five group labels and tune lower-field pass timing against those labels.
- Score group-to-group alternation so cascade identity is not just a different path-family name.


## Challenging Stage 22-23

Internal challenge marker: 23.

**Current score:** interesting factor 4.4/10; challenge conformance 4.3/10. Movement 4.1/10, graphics 4.6/10, alien novelty 3.9/10, progression 2.7/10, player shot opportunity 7/10, human-perfect potential 8/10.

**Legacy broad coverage score:** 6.8/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Challenging Stage 22-23 should emphasize green ladder rhythm and split exits.

**Aurora current:** green-ladder-split / green-ladder-split; lanes bee, but, rogue, boss, boss, rogue, but, bee; first-wave types bee, but, rogue, boss, boss, rogue, but, bee; visual families dragonfly; strict movement 4.1/10, graphics 4.6/10, alien novelty 3.9/10, shot opportunity 7/10, target-contract fit 3.4/10.

**Graphics read:** Strict graphics score 4.6/10. Current visible family/type labels are present, Direct runtime-vs-Galaga target-crop comparator reads 5.97/10 overall and 3.86/10 for challenge specialty sprites; weakest challenge crop is challenge-mosquito at 3.68/10. Runtime sprite-motion hook observed 2 visual family/families, 1 path pose family/families, 6/6 animation phase buckets, both flap state(s), and 40 object-tracked silhouette track(s). Aurora runtime motion corresponds to 3 frame-labeled segmented-reference target row(s), average 6.2/10; phase-order average is 4.8/10. Weakest row bee-zako-pulse-pair at 5.42/10. Graphics remain capped at 5.1/10 until object tracks are compared as full temporal Galaga target-crop sequences, rotations, dive poses, and capture/rescue transitions.

**Movement read:** Strict movement score 4.1/10 against challenge-6-green-ladder-split-group-3: y-range fit 1, path-length fit 1, turn fit 1, object-track fit 0.13. Current probes now include runtime object tracks compared against CPU-extracted Galaga target-video object tracks where available. Legacy broad vector best-match was 9/10 against challenge-6-green-ladder-split-group-3; xRange 1.0737, yRange 0.8678, pathLength 2.0491.

**Alien variation read:** Strict alien/progression novelty score 3.9/10. Current stages expose labels, type mixes, direct specialty-sprite target-crop evidence, and 1 visual family/families, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and dragonfly visual family labels. Group identity diagnostic: 5/5 wave type signatures and 1/5 path signatures; average within-wave spawn span 0.24s.

**Group identity read:** 5/5 wave type signatures and 1/5 path signatures; average within-wave spawn span 0.24s.

**Target contract read:** Target contract fit is 3.4/10 for Challenging Stage 22-23 target-video object tracks: group count 1, path-family order 0, type order 0, family order 0, object-track 0.13 via direct target-video tracks. This is a group/object-track read, not frame-perfect sprite identity recognition.

**Per-group movement rows:**
| Group | Status | Fit | Aurora runtime | Galaga target | Gap |
| --- | --- | ---: | --- | --- | --- |
| 1 | measured | 1.7/10 | right -> right; start 0.75s; end 19s; path 2.42 | right -> right; start 0s; end 2.63s; path 0.27 |  |
| 2 | measured | 1.7/10 | center -> left; start 2s; end 19.75s; path 2.03 | center -> center; start 2.63s; end 6.75s; path 1.16 |  |
| 3 | measured | 2/10 | center -> right; start 3s; end 20.25s; path 1.94 | center -> center; start 5.75s; end 10s; path 0.96 |  |
| 4 | measured | 2.9/10 | center -> left; start 4s; end 20.5s; path 1.97 | center -> left; start 9.63s; end 14.13s; path 0.7 |  |
| 5 | measured | 1.6/10 | center -> right; start 5s; end 21.5s; path 1.89 | center -> right; start 14s; end 15.88s; path 0.4 |  |

**Shot-opportunity read:** Shot-opportunity probe found scoreable targets in 77 sampled windows; 94% had a lane with 2+ targets, lane diversity was 1, center-lane bias was 0.11, and the human-perfect route read is 8/10. Human-perfect probe estimates 40/40 expected targets reachable by a greedy strong-player route, 100% with any ballistic window, 100% with repeated aim windows, and 2% top-crowd pressure.

**Human-perfect route read:** Human-perfect probe estimates 40/40 expected targets reachable by a greedy strong-player route, 100% with any ballistic window, 100% with repeated aim windows, and 2% top-crowd pressure.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.
- Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Target-contract fit is only 3.4/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.
- Green-ladder split now lands on a Challenging Stage 22-23 ladder/split reference; remaining work is fuller path length, lower reversal noise, and object-tracked group timing.

**Next actions:**
- Rebuild Challenging Stage 22-23 around green ladder and split-exit timing until its measured vector hits challenge-6-green-ladder-split-group-1.
- Add frame labels for staggered ladder rungs, split exit side, and upper-band scoreability.


## Challenging Stage 26-27

Internal challenge marker: 27.

**Current score:** interesting factor 4.4/10; challenge conformance 4.4/10. Movement 4.3/10, graphics 4.7/10, alien novelty 3.9/10, progression 2.7/10, player shot opportunity 6.9/10, human-perfect potential 7.9/10.

**Legacy broad coverage score:** 6.9/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Challenging Stage 26-27 should introduce a yellow diagonal fan with a memorable scoring lane.

**Aurora current:** yellow-diagonal-fan / yellow-diagonal-fan; lanes boss, bee, but, rogue, rogue, but, bee, boss; first-wave types boss, bee, but, rogue, rogue, but, bee, boss; visual families crown; strict movement 4.3/10, graphics 4.7/10, alien novelty 3.9/10, shot opportunity 6.9/10, target-contract fit 3.3/10.

**Graphics read:** Strict graphics score 4.7/10. Current visible family/type labels are present, Direct runtime-vs-Galaga target-crop comparator reads 5.97/10 overall and 3.86/10 for challenge specialty sprites; weakest challenge crop is challenge-mosquito at 3.68/10. Runtime sprite-motion hook observed 1 visual family/families, 1 path pose family/families, 6/6 animation phase buckets, both flap state(s), and 40 object-tracked silhouette track(s). Aurora runtime motion corresponds to 3 frame-labeled segmented-reference target row(s), average 6.2/10; phase-order average is 4.8/10. Weakest row bee-zako-pulse-pair at 5.42/10. Graphics remain capped at 5.1/10 until object tracks are compared as full temporal Galaga target-crop sequences, rotations, dive poses, and capture/rescue transitions.

**Movement read:** Strict movement score 4.3/10 against challenge-7-yellow-diagonal-fan-group-4: y-range fit 1, path-length fit 1, turn fit 1, object-track fit 0.12. Current probes now include runtime object tracks compared against CPU-extracted Galaga target-video object tracks where available. Legacy broad vector best-match was 9.2/10 against challenge-7-yellow-diagonal-fan-group-4; xRange 1.0787, yRange 0.7295, pathLength 2.592.

**Alien variation read:** Strict alien/progression novelty score 3.9/10. Current stages expose labels, type mixes, direct specialty-sprite target-crop evidence, and 1 visual family/families, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and crown visual family labels. Group identity diagnostic: 5/5 wave type signatures and 1/5 path signatures; average within-wave spawn span 0.23s.

**Group identity read:** 5/5 wave type signatures and 1/5 path signatures; average within-wave spawn span 0.23s.

**Target contract read:** Target contract fit is 3.3/10 for Challenging Stage 26-27 target-video object tracks: group count 1, path-family order 0, type order 0, family order 0, object-track 0.12 via direct target-video tracks. This is a group/object-track read, not frame-perfect sprite identity recognition.

**Per-group movement rows:**
| Group | Status | Fit | Aurora runtime | Galaga target | Gap |
| --- | --- | ---: | --- | --- | --- |
| 1 | measured | 1.4/10 | center -> right; start 0.75s; end 15.25s; path 2.58 | right -> right; start 0s; end 2s; path 0.14 |  |
| 2 | measured | 1.6/10 | center -> left; start 1.75s; end 16s; path 2.57 | right -> left; start 1.25s; end 5.5s; path 0.92 |  |
| 3 | measured | 3/10 | center -> right; start 2.75s; end 17s; path 2.62 | center -> left; start 4.75s; end 7.63s; path 1.11 |  |
| 4 | measured | 1.6/10 | center -> left; start 3.75s; end 17.75s; path 2.59 | center -> left; start 9.13s; end 11.25s; path 0.43 |  |
| 5 | measured | 1.7/10 | center -> right; start 4.75s; end 18.75s; path 2.6 | center -> right; start 10.38s; end 12s; path 0.48 |  |

**Shot-opportunity read:** Shot-opportunity probe found scoreable targets in 70 sampled windows; 93% had a lane with 2+ targets, lane diversity was 1, center-lane bias was 0.13, and the human-perfect route read is 7.9/10. Human-perfect probe estimates 40/40 expected targets reachable by a greedy strong-player route, 100% with any ballistic window, 100% with repeated aim windows, and 2% top-crowd pressure.

**Human-perfect route read:** Human-perfect probe estimates 40/40 expected targets reachable by a greedy strong-player route, 100% with any ballistic window, 100% with repeated aim windows, and 2% top-crowd pressure.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.
- Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Target-contract fit is only 3.3/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.
- Yellow diagonal fan now lands on a Challenging Stage 26-27 diagonal-fan reference; remaining work is stronger lower-field travel and object-tracked diagonal lane timing.

**Next actions:**
- Rebuild Challenging Stage 26-27 around the yellow diagonal fan so the best match lands on challenge-7-yellow-diagonal-fan-group-1, not the finale label.
- Add a player-hit opportunity probe that rewards firing along the diagonal band rather than center-lane waiting.


## Challenging Stage 30-31

Internal challenge marker: 31.

**Current score:** interesting factor 4.4/10; challenge conformance 4.4/10. Movement 4.2/10, graphics 4.7/10, alien novelty 3.9/10, progression 3.1/10, player shot opportunity 6.8/10, human-perfect potential 7.7/10.

**Legacy broad coverage score:** 7/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Challenging Stage 30-31 should act as a compact blue/purple late-loop capstone.

**Aurora current:** blue-purple-finale / blue-purple-finale; lanes rogue, boss, bee, but, but, bee, boss, rogue; first-wave types rogue, boss, bee, but, but, bee, boss, rogue; visual families stingray; strict movement 4.2/10, graphics 4.7/10, alien novelty 3.9/10, shot opportunity 6.8/10, target-contract fit 3.2/10.

**Graphics read:** Strict graphics score 4.7/10. Current visible family/type labels are present, Direct runtime-vs-Galaga target-crop comparator reads 5.97/10 overall and 3.86/10 for challenge specialty sprites; weakest challenge crop is challenge-mosquito at 3.68/10. Runtime sprite-motion hook observed 3 visual family/families, 3 path pose family/families, 6/6 animation phase buckets, both flap state(s), and 40 object-tracked silhouette track(s). Aurora runtime motion corresponds to 3 frame-labeled segmented-reference target row(s), average 6.2/10; phase-order average is 4.8/10. Weakest row bee-zako-pulse-pair at 5.42/10. Graphics remain capped at 5.1/10 until object tracks are compared as full temporal Galaga target-crop sequences, rotations, dive poses, and capture/rescue transitions.

**Movement read:** Strict movement score 4.2/10 against challenge-8-blue-purple-finale-group-4: y-range fit 1, path-length fit 1, turn fit 1, object-track fit 0.1. Current probes now include runtime object tracks compared against CPU-extracted Galaga target-video object tracks where available. Legacy broad vector best-match was 9.1/10 against challenge-8-blue-purple-finale-group-4; xRange 1.0748, yRange 0.8807, pathLength 2.0792.

**Alien variation read:** Strict alien/progression novelty score 3.9/10. Current stages expose labels, type mixes, direct specialty-sprite target-crop evidence, and 1 visual family/families, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and stingray visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.21s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.21s.

**Target contract read:** Target contract fit is 3.2/10 for Challenging Stage 30-31 target-video object tracks: group count 1, path-family order 0, type order 0, family order 0, object-track 0.1 via direct target-video tracks. This is a group/object-track read, not frame-perfect sprite identity recognition.

**Per-group movement rows:**
| Group | Status | Fit | Aurora runtime | Galaga target | Gap |
| --- | --- | ---: | --- | --- | --- |
| 1 | measured | 1.6/10 | center -> left; start 0.5s; end 18.75s; path 2.22 | center -> center; start 1s; end 3s; path 0.96 |  |
| 2 | measured | 1.2/10 | center -> left; start 1.75s; end 18.25s; path 1.95 | right -> center; start 2.38s; end 5.25s; path 0.81 |  |
| 3 | measured | 1.8/10 | left -> left; start 2.25s; end 19.5s; path 1.66 | left -> center; start 5.38s; end 10.13s; path 1.06 |  |
| 4 | measured | 2.5/10 | center -> left; start 3.25s; end 16.75s; path 2.65 | center -> center; start 10.75s; end 15.38s; path 1.8 |  |
| 5 | measured | 1.7/10 | left -> left; start 3.75s; end 20.75s; path 1.92 | center -> center; start 13.5s; end 15.88s; path 0.78 |  |

**Shot-opportunity read:** Shot-opportunity probe found scoreable targets in 75 sampled windows; 89% had a lane with 2+ targets, lane diversity was 1, center-lane bias was 0.13, and the human-perfect route read is 7.7/10. Human-perfect probe estimates 40/40 expected targets reachable by a greedy strong-player route, 100% with any ballistic window, 100% with repeated aim windows, and 7% top-crowd pressure.

**Human-perfect route read:** Human-perfect probe estimates 40/40 expected targets reachable by a greedy strong-player route, 100% with any ballistic window, 100% with repeated aim windows, and 7% top-crowd pressure.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Sprite-motion correspondence is 6.18/10: runtime flapping/cadence is visible, but target frame timing is still frame-labeled-segmented-reference-windows and weakest motion row is bee-zako-pulse-pair.
- Alien/stage novelty is only 3.9/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Target-contract fit is only 3.2/10: the runtime group order, path families, type/family mix, or group count still misses the first-pass media-backed challenge contract.
- Blue/purple finale is now represented as its own runtime contract, but it still needs fuller path length and active sprite-motion evidence before it feels like a late-loop capstone.

**Next actions:**
- Refine the Challenging Stage 30-31 blue/purple finale with fuller path length and compact late-loop timing.
- Promote challenge enemy active-motion scoring so visual novelty is measured through animation, not only family labels.


## Plan To Improve

1. Treat the current strict scores as the release-facing truth: the broad coverage score is diagnostic only.
2. Build the challenge-stage target grammar: per-challenge group order, first-visible frame, entry side, exit side, path length, turn count, featured alien family, scoring window, perfect-bonus expectation, and result feedback.
3. Implement Challenging Stage 2-3 first: top-right bee line, late top-left butterfly line, visibly longer upper-band sweep, clear peel-off exits, no combat grammar, and reference-matched duration/turn count.
4. Implement Challenging Stage 6-7 as a different authored set piece, not just a wider early challenge: denser mixed novelty, crossing pattern, different entry side and exit side, readable scoring route.
5. Implement Challenging Stage 10-11 with boss-led novelty and active animation evidence: featured alien role, flapping/pulsing/rotation windows, and a distinct reward read.
6. Continue the late-stage rebuild now that Challenges 4-8 have media-backed windows: preserve the new Stage 15, 19, 23, 27, and 31 contracts, then promote five group labels for each.
7. Prioritize Challenging Stage 22-23 green-ladder and Challenging Stage 26-27 yellow-fan precision work, because they now hit the expected reference families but still need longer path length, cleaner lower-field travel, and lower reversal noise.
8. Promote challenge-stage contact sheets, trajectory SVGs, active sprite-motion probes, and per-stage motion timelines into the Application Guide so the human review can see the actual delta, not only score text.

## Success Criteria

- Raise challenge-stage interesting factor from 4.4/10 to 5.0/10 as the first honest beta-facing gate by implementing one visibly reference-like challenge, then toward 6.0/10 after Stage 3, 7, and 11 each have distinct authored contracts.
- Keep the separate target-contract read above 7.0/10 for Challenging Stage 2-3 while promoting contracts for Challenging Stage 6-7 and Challenging Stage 10-11; group-contract success is useful but does not replace frame-level motion/graphics scoring.
- Raise movement conformance from 4.3/10 by increasing y-range, path length, turn count, and exit-side match against the Galaga challenge references.
- Raise graphical conformance from 4.6/10 by extending the object-tracked silhouette hook into Galaga target-crop sequence comparisons; do not inflate it from type labels alone.
- Raise player shot opportunity from 6.9/10 by creating lane-readable scoring windows for each challenge rather than incidental central-lane hits.
- Preserve 0 enemy shots, 0 enemy attack starts, and 0 ship losses during challenge windows.
- Convert the first-pass late-reference labels into five-group frame/object labels before treating the late challenge sequence as conformant.
- Extend sprite-motion scoring for challenge enemies so visual novelty becomes object-tracked pixel evidence, not only a phase/family hook.
