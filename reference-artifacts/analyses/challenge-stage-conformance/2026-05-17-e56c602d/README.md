# Challenge Stage Conformance Analysis

Generated: 2026-05-17T16:54:04.588Z
Commit: e56c602d
Branch: codex/macbook-challenge-reference-ingestion

## Executive Summary

This is now a strict challenge-stage readout. The prior alien-entry score looked too healthy because it rewarded coverage, type labels, and broad stage signatures. That was useful harness progress, but it overstated the player-facing experience. This report follows the current project decision that challenging stages start at **1/10 interesting**, **1/10 movement**, and **1/10 graphical conformance** until they earn credit through reference-grounded movement, active visual evidence, alien/stage novelty, and durable bonus-stage contracts.

Current result: **2.8/10 interesting factor** and **2.8/10 challenge-stage conformance**. Movement is **3/10**, graphical conformance is **2.1/10**, and alien/stage novelty is **3.4/10**. The strongest rule finding is that current probes show no enemy shots, no attack starts, and no ship losses during sampled challenge windows. The weakest player-facing finding is that current challenge stages are functionally safe but not yet fully credible Galaga-like bonus exhibitions: strict movement is 3/10, strict graphics is 2.1/10, alien/stage novelty is 3.4/10, active sprite-motion evidence is missing, and late challenge references are first-pass window labels rather than full five-group object tracks. Diagnostic legacy coverage was 6.4/10, which is why the old read was too generous.

## Method

- Runtime challenge states were sampled through the browser-backed Aurora harness using `challengeFormationState()`.
- Reference targets came from media-backed Galaga path labels and contact sheets.
- Existing path-family comparison supplied best-match vector scores against labeled Galaga challenge entries, but those broad scores are now retained as diagnostic coverage instead of the conformance score.
- Strict movement scoring compares runtime y-range, path length, turn count, reversals, lower-field share, and trajectory best-match against the selected Galaga challenge reference vector. It is capped by current temporal-measurement limits because the harness still samples summaries rather than full tracked choreography.
- Strict graphical scoring is intentionally low until challenge-window sprite animation is measured: flaps, pulsing, dive/rotation silhouettes, capture/rescue transitions, and direct target crop comparison.
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

| Stage | Challenge | Interest | Movement | Graphics | Alien Novelty | Strict Score | Diagnostic Best Reference | No-Shot/No-Kill | Critical Gap |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| 3 | 1 | 2.9/10 | 3.3/10 | 2.1/10 | 3.4/10 | 2.9/10 | challenge-1-late-wave-group-4 (8.2/10 legacy) | pass | Movement conformance is only 3.3/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.<br>Graphical conformance is only 2.1/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.<br>Alien/stage novelty is only 3.4/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns. |
| 7 | 2 | 2.5/10 | 2.7/10 | 1.7/10 | 3.4/10 | 2.5/10 | challenge-4-pink-serpentine-group-1 (8.9/10 legacy) | pass | Best reference match is challenge-4-pink-serpentine-group-1, not expected challenge-2-arrival-group-1.<br>Movement conformance is only 2.7/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.<br>Graphical conformance is only 1.7/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.<br>Alien/stage novelty is only 3.4/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Cross-sweep identity is visible in labels, but the measured vector still lands closest to the same challenge-2 reference as most other challenge stages. |
| 11 | 3 | 2.7/10 | 2.7/10 | 2.2/10 | 3.4/10 | 2.7/10 | challenge-4-pink-serpentine-group-1 (9/10 legacy) | pass | Best reference match is challenge-4-pink-serpentine-group-1, not expected challenge-3-arrival-group-1.<br>Movement conformance is only 2.7/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.<br>Graphical conformance is only 2.2/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.<br>Alien/stage novelty is only 3.4/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Dragonfly family appears, but sprite-motion novelty and tracked Galaga challenge-3 path phases are not yet scored. |
| 15 | 4 | 3.1/10 | 3.7/10 | 2.2/10 | 3.4/10 | 3.1/10 | challenge-4-pink-serpentine-group-1 (9.3/10 legacy) | pass | Movement conformance is only 3.7/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.<br>Graphical conformance is only 2.2/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.<br>Alien/stage novelty is only 3.4/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Pink-serpentine identity now lands on its first-pass late reference, but it still needs five-group frame labels, target sprite-motion evidence, and stronger player-visible novelty before it can claim maturity. |
| 19 | 5 | 3.1/10 | 3.5/10 | 2.2/10 | 3.4/10 | 3.1/10 | challenge-5-pink-green-cascade-group-1 (8.8/10 legacy) | pass | Movement conformance is only 3.5/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.<br>Graphical conformance is only 2.2/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.<br>Alien/stage novelty is only 3.4/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Pink/green cascade identity now lands on its first-pass late reference, but the current window still needs five group labels and stronger lower-field route readability. |
| 23 | 6 | 2.4/10 | 2.2/10 | 2.2/10 | 3.4/10 | 2.4/10 | challenge-1-late-wave-group-4 (7.3/10 legacy) | pass | Best reference match is challenge-1-late-wave-group-4, not expected challenge-6-green-ladder-split-group-1.<br>Movement conformance is only 2.2/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.<br>Graphical conformance is only 2.2/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.<br>Alien/stage novelty is only 3.4/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Green-ladder split is now represented as its own runtime contract, but the measured vector still reads closer to an early challenge than the expected ladder/split reference. |
| 27 | 7 | 2.5/10 | 2.4/10 | 2.2/10 | 3.4/10 | 2.5/10 | challenge-8-blue-purple-finale-group-1 (8.2/10 legacy) | pass | Best reference match is challenge-8-blue-purple-finale-group-1, not expected challenge-7-yellow-diagonal-fan-group-1.<br>Movement conformance is only 2.4/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.<br>Graphical conformance is only 2.2/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.<br>Alien/stage novelty is only 3.4/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Yellow diagonal fan is now represented as its own runtime contract, but it still needs stronger diagonal lane identity and must not collapse into the blue/purple finale signature. |
| 31 | 8 | 2.9/10 | 3.2/10 | 2.2/10 | 3.4/10 | 3/10 | challenge-8-blue-purple-finale-group-1 (7.9/10 legacy) | pass | Movement conformance is only 3.2/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.<br>Graphical conformance is only 2.2/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.<br>Alien/stage novelty is only 3.4/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Blue/purple finale is now represented as its own runtime contract, but it still needs fuller path length and active sprite-motion evidence before it feels like a late-loop capstone. |


## Stage 3 / Challenge 1

**Current score:** interesting factor 2.9/10; challenge conformance 2.9/10. Movement 3.3/10, graphics 2.1/10, alien novelty 3.4/10, progression 2.8/10.

**Legacy broad coverage score:** 6.2/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** First Galaga-style challenging stage: readable bonus set piece, no fire, no ship loss, upper-band mirrored entries, bee/butterfly line waves, visible arrival/peel-off.

**Aurora current:** first-challenge-peel / first-challenge-peel; lanes bee, bee, bee, bee, but, but, but, but; first-wave types bee, bee, bee, bee, but, but, but, but; visual families classic; strict movement 3.3/10, graphics 2.1/10, alien novelty 3.4/10.

**Graphics read:** Strict graphics score 2.1/10. Current visible family/type labels are present, but challenge-window graphics are capped at 2.2/10 until live sprite flaps, pulsing, rotation/dive silhouettes, capture/rescue transitions, and Galaga target sprite crops are scored in motion.

**Movement read:** Strict movement score 3.3/10 against challenge-1-late-wave-group-4: y-range fit 1, path-length fit 0.68, turn fit 1. Current probes are still sampled summaries, so full temporal choreography is not yet proven. Legacy broad vector best-match was 8.2/10 against challenge-1-late-wave-group-4; xRange 1.4, yRange 0.5081, pathLength 0.4901.

**Alien variation read:** Strict alien/progression novelty score 3.4/10. Current stages expose labels and type mixes, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 2 type(s) and classic visual family labels. Group identity diagnostic: 5/5 wave type signatures and 1/5 path signatures; average within-wave spawn span 0.48s.

**Group identity read:** 5/5 wave type signatures and 1/5 path signatures; average within-wave spawn span 0.48s.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Movement conformance is only 3.3/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.
- Graphical conformance is only 2.1/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.
- Alien/stage novelty is only 3.4/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.

**Next actions:**
- Protect the first-challenge bee/butterfly line contract, then tune path length, turn count, and rack-slot precision against challenge-1 arrival and late-wave labels.
- Add contact-sheet comparison for first-visible frame, entry side, exit side, lane occupancy, and group timing so the next tuning pass can improve trajectory precision without subjective guessing.


## Stage 7 / Challenge 2

**Current score:** interesting factor 2.5/10; challenge conformance 2.5/10. Movement 2.7/10, graphics 1.7/10, alien novelty 3.4/10, progression 2.4/10.

**Legacy broad coverage score:** 5.9/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Second challenge should feel denser and more novel than challenge 1 while staying nonlethal and non-shooting.

**Aurora current:** scorpion-cross-sweep / cross-sweep; lanes but, boss, rogue, bee, bee, rogue, boss, but; first-wave types but, boss, rogue, bee, bee, rogue, boss, but; visual families classic; strict movement 2.7/10, graphics 1.7/10, alien novelty 3.4/10.

**Graphics read:** Strict graphics score 1.7/10. Current visible family/type labels are present, but challenge-window graphics are capped at 2.2/10 until live sprite flaps, pulsing, rotation/dive silhouettes, capture/rescue transitions, and Galaga target sprite crops are scored in motion.

**Movement read:** Strict movement score 2.7/10 against challenge-2-arrival-group-1: y-range fit 1, path-length fit 1, turn fit 1. Current probes are still sampled summaries, so full temporal choreography is not yet proven. Legacy broad vector best-match was 8.9/10 against challenge-4-pink-serpentine-group-1; xRange 1.3571, yRange 0.7703, pathLength 0.9567.

**Alien variation read:** Strict alien/progression novelty score 3.4/10. Current stages expose labels and type mixes, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and classic visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.42s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.42s.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Best reference match is challenge-4-pink-serpentine-group-1, not expected challenge-2-arrival-group-1.
- Movement conformance is only 2.7/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.
- Graphical conformance is only 1.7/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.
- Alien/stage novelty is only 3.4/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Cross-sweep identity is visible in labels, but the measured vector still lands closest to the same challenge-2 reference as most other challenge stages.

**Next actions:**
- Tune challenge 2 toward the denser mixed-novelty-line reference instead of relying on a generic cross-sweep.
- Score separate group identities so stage 7 is not just a slightly wider stage 3.


## Stage 11 / Challenge 3

**Current score:** interesting factor 2.7/10; challenge conformance 2.7/10. Movement 2.7/10, graphics 2.2/10, alien novelty 3.4/10, progression 2.4/10.

**Legacy broad coverage score:** 6.5/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Third challenge should make the new visual family and boss-led novelty obvious, with larger sweep vocabulary and no attacks.

**Aurora current:** stingray-crown-hook-hybrid / hook-arc; lanes boss, rogue, but, bee, boss, bee, but, rogue; first-wave types boss, rogue, but, bee, boss, bee, but, rogue; visual families dragonfly; strict movement 2.7/10, graphics 2.2/10, alien novelty 3.4/10.

**Graphics read:** Strict graphics score 2.2/10. Current visible family/type labels are present, but challenge-window graphics are capped at 2.2/10 until live sprite flaps, pulsing, rotation/dive silhouettes, capture/rescue transitions, and Galaga target sprite crops are scored in motion.

**Movement read:** Strict movement score 2.7/10 against challenge-3-arrival-group-1: y-range fit 1, path-length fit 1, turn fit 1. Current probes are still sampled summaries, so full temporal choreography is not yet proven. Legacy broad vector best-match was 9/10 against challenge-4-pink-serpentine-group-1; xRange 1.5143, yRange 0.7166, pathLength 1.0442.

**Alien variation read:** Strict alien/progression novelty score 3.4/10. Current stages expose labels and type mixes, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and dragonfly visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.36s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.36s.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Best reference match is challenge-4-pink-serpentine-group-1, not expected challenge-3-arrival-group-1.
- Movement conformance is only 2.7/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.
- Graphical conformance is only 2.2/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.
- Alien/stage novelty is only 3.4/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Dragonfly family appears, but sprite-motion novelty and tracked Galaga challenge-3 path phases are not yet scored.

**Next actions:**
- Promote challenge-3 boss-led reference phases and score dragonfly visual novelty as animation, not only family label.
- Add motion windows for wing flaps, pulsing, dive/rotation silhouette, and challenge-only nonlethal arrival.


## Stage 15 / Challenge 4

**Current score:** interesting factor 3.1/10; challenge conformance 3.1/10. Movement 3.7/10, graphics 2.2/10, alien novelty 3.4/10, progression 3.1/10.

**Legacy broad coverage score:** 7/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Fourth challenge should shift into long specialty serpentine arcs with obvious new color/family identity while staying nonlethal.

**Aurora current:** pink-serpentine-late / pink-serpentine; lanes boss, rogue, but, bee, bee, but, rogue, boss; first-wave types boss, rogue, but, bee, bee, but, rogue, boss; visual families galboss; strict movement 3.7/10, graphics 2.2/10, alien novelty 3.4/10.

**Graphics read:** Strict graphics score 2.2/10. Current visible family/type labels are present, but challenge-window graphics are capped at 2.2/10 until live sprite flaps, pulsing, rotation/dive silhouettes, capture/rescue transitions, and Galaga target sprite crops are scored in motion.

**Movement read:** Strict movement score 3.7/10 against challenge-4-pink-serpentine-group-1: y-range fit 1, path-length fit 1, turn fit 1. Current probes are still sampled summaries, so full temporal choreography is not yet proven. Legacy broad vector best-match was 9.3/10 against challenge-4-pink-serpentine-group-1; xRange 1.5286, yRange 0.7771, pathLength 1.0173.

**Alien variation read:** Strict alien/progression novelty score 3.4/10. Current stages expose labels and type mixes, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and galboss visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.3s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.3s.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Movement conformance is only 3.7/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.
- Graphical conformance is only 2.2/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.
- Alien/stage novelty is only 3.4/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Pink-serpentine identity now lands on its first-pass late reference, but it still needs five-group frame labels, target sprite-motion evidence, and stronger player-visible novelty before it can claim maturity.

**Next actions:**
- Promote the Challenge 4 pink-serpentine window into five group labels and tune the runtime path so all groups keep a readable serpentine score lane.
- Add high-bonus readability probes so late-stage complexity stays learnable instead of becoming visual noise.


## Stage 19 / Challenge 5

**Current score:** interesting factor 3.1/10; challenge conformance 3.1/10. Movement 3.5/10, graphics 2.2/10, alien novelty 3.4/10, progression 3.1/10.

**Legacy broad coverage score:** 6.9/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Fifth challenge should distinguish itself with pink/green cascade motion, alternating group identity, and stronger lower-field pass readability.

**Aurora current:** pink-green-cascade / pink-green-cascade; lanes rogue, boss, but, bee, boss, but, bee, rogue; first-wave types rogue, boss, but, bee, boss, but, bee, rogue; visual families galboss; strict movement 3.5/10, graphics 2.2/10, alien novelty 3.4/10.

**Graphics read:** Strict graphics score 2.2/10. Current visible family/type labels are present, but challenge-window graphics are capped at 2.2/10 until live sprite flaps, pulsing, rotation/dive silhouettes, capture/rescue transitions, and Galaga target sprite crops are scored in motion.

**Movement read:** Strict movement score 3.5/10 against challenge-5-pink-green-cascade-group-1: y-range fit 1, path-length fit 0.79, turn fit 0.93. Current probes are still sampled summaries, so full temporal choreography is not yet proven. Legacy broad vector best-match was 8.8/10 against challenge-5-pink-green-cascade-group-1; xRange 1.5429, yRange 0.509, pathLength 0.8055.

**Alien variation read:** Strict alien/progression novelty score 3.4/10. Current stages expose labels and type mixes, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and galboss visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.25s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.25s.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Movement conformance is only 3.5/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.
- Graphical conformance is only 2.2/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.
- Alien/stage novelty is only 3.4/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Pink/green cascade identity now lands on its first-pass late reference, but the current window still needs five group labels and stronger lower-field route readability.

**Next actions:**
- Promote the Challenge 5 pink/green cascade window into five group labels and tune lower-field pass timing against those labels.
- Score group-to-group alternation so cascade identity is not just a different path-family name.


## Stage 23 / Challenge 6

**Current score:** interesting factor 2.4/10; challenge conformance 2.4/10. Movement 2.2/10, graphics 2.2/10, alien novelty 3.4/10, progression 2/10.

**Legacy broad coverage score:** 6.1/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Sixth challenge should emphasize green ladder rhythm and split exits.

**Aurora current:** green-ladder-split / green-ladder-split; lanes bee, but, rogue, boss, boss, rogue, but, bee; first-wave types bee, but, rogue, boss, boss, rogue, but, bee; visual families dragonfly; strict movement 2.2/10, graphics 2.2/10, alien novelty 3.4/10.

**Graphics read:** Strict graphics score 2.2/10. Current visible family/type labels are present, but challenge-window graphics are capped at 2.2/10 until live sprite flaps, pulsing, rotation/dive silhouettes, capture/rescue transitions, and Galaga target sprite crops are scored in motion.

**Movement read:** Strict movement score 2.2/10 against challenge-6-green-ladder-split-group-1: y-range fit 0.71, path-length fit 0.5, turn fit 1. Current probes are still sampled summaries, so full temporal choreography is not yet proven. Legacy broad vector best-match was 7.3/10 against challenge-1-late-wave-group-4; xRange 1.5714, yRange 0.4429, pathLength 0.4873.

**Alien variation read:** Strict alien/progression novelty score 3.4/10. Current stages expose labels and type mixes, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and dragonfly visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.24s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.24s.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Best reference match is challenge-1-late-wave-group-4, not expected challenge-6-green-ladder-split-group-1.
- Movement conformance is only 2.2/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.
- Graphical conformance is only 2.2/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.
- Alien/stage novelty is only 3.4/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Green-ladder split is now represented as its own runtime contract, but the measured vector still reads closer to an early challenge than the expected ladder/split reference.

**Next actions:**
- Rebuild Challenge 6 around green ladder and split-exit timing until its measured vector hits challenge-6-green-ladder-split-group-1.
- Add frame labels for staggered ladder rungs, split exit side, and upper-band scoreability.


## Stage 27 / Challenge 7

**Current score:** interesting factor 2.5/10; challenge conformance 2.5/10. Movement 2.4/10, graphics 2.2/10, alien novelty 3.4/10, progression 2/10.

**Legacy broad coverage score:** 6.2/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Seventh challenge should introduce a yellow diagonal fan with a memorable scoring lane.

**Aurora current:** yellow-diagonal-fan / yellow-diagonal-fan; lanes boss, bee, but, rogue, rogue, but, bee, boss; first-wave types boss, bee, but, rogue, rogue, but, bee, boss; visual families crown; strict movement 2.4/10, graphics 2.2/10, alien novelty 3.4/10.

**Graphics read:** Strict graphics score 2.2/10. Current visible family/type labels are present, but challenge-window graphics are capped at 2.2/10 until live sprite flaps, pulsing, rotation/dive silhouettes, capture/rescue transitions, and Galaga target sprite crops are scored in motion.

**Movement read:** Strict movement score 2.4/10 against challenge-7-yellow-diagonal-fan-group-1: y-range fit 0.86, path-length fit 0.76, turn fit 1. Current probes are still sampled summaries, so full temporal choreography is not yet proven. Legacy broad vector best-match was 8.2/10 against challenge-8-blue-purple-finale-group-1; xRange 1.6, yRange 0.4816, pathLength 0.8359.

**Alien variation read:** Strict alien/progression novelty score 3.4/10. Current stages expose labels and type mixes, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and crown visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.23s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.23s.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Best reference match is challenge-8-blue-purple-finale-group-1, not expected challenge-7-yellow-diagonal-fan-group-1.
- Movement conformance is only 2.4/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.
- Graphical conformance is only 2.2/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.
- Alien/stage novelty is only 3.4/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Yellow diagonal fan is now represented as its own runtime contract, but it still needs stronger diagonal lane identity and must not collapse into the blue/purple finale signature.

**Next actions:**
- Rebuild Challenge 7 around the yellow diagonal fan so the best match lands on challenge-7-yellow-diagonal-fan-group-1, not the finale label.
- Add a player-hit opportunity probe that rewards firing along the diagonal band rather than center-lane waiting.


## Stage 31 / Challenge 8

**Current score:** interesting factor 2.9/10; challenge conformance 3/10. Movement 3.2/10, graphics 2.2/10, alien novelty 3.4/10, progression 3.1/10.

**Legacy broad coverage score:** 6.7/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Eighth visible challenge should act as a compact blue/purple late-loop capstone.

**Aurora current:** blue-purple-finale / blue-purple-finale; lanes rogue, boss, bee, but, but, bee, boss, rogue; first-wave types rogue, boss, bee, but, but, bee, boss, rogue; visual families stingray; strict movement 3.2/10, graphics 2.2/10, alien novelty 3.4/10.

**Graphics read:** Strict graphics score 2.2/10. Current visible family/type labels are present, but challenge-window graphics are capped at 2.2/10 until live sprite flaps, pulsing, rotation/dive silhouettes, capture/rescue transitions, and Galaga target sprite crops are scored in motion.

**Movement read:** Strict movement score 3.2/10 against challenge-8-blue-purple-finale-group-1: y-range fit 0.89, path-length fit 0.52, turn fit 0.87. Current probes are still sampled summaries, so full temporal choreography is not yet proven. Legacy broad vector best-match was 7.9/10 against challenge-8-blue-purple-finale-group-1; xRange 1.6143, yRange 0.4464, pathLength 0.5506.

**Alien variation read:** Strict alien/progression novelty score 3.4/10. Current stages expose labels and type mixes, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and stingray visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.21s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.21s.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Movement conformance is only 3.2/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.
- Graphical conformance is only 2.2/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.
- Alien/stage novelty is only 3.4/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
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
7. Prioritize Challenge 6 green-ladder and Challenge 7 yellow-fan misses, because those still best-match the wrong reference family under the strict scorer.
8. Promote challenge-stage contact sheets, trajectory SVGs, and per-stage motion timelines into the Application Guide so the human review can see the actual delta, not only score text.

## Success Criteria

- Raise challenge-stage interesting factor from 2.8/10 to 3.5/10 as the first honest gate by implementing one visibly reference-like challenge, then toward 6.0/10 after Stage 3, 7, and 11 each have distinct authored contracts.
- Raise movement conformance from 3/10 by increasing y-range, path length, turn count, and exit-side match against the Galaga challenge references.
- Raise graphical conformance from 2.1/10 only when active sprite-motion windows and reference target crops are attached; do not inflate it from type labels alone.
- Preserve 0 enemy shots, 0 enemy attack starts, and 0 ship losses during challenge windows.
- Convert the first-pass late-reference labels into five-group frame/object labels before treating the late challenge sequence as conformant.
- Add sprite-motion scoring for challenge enemies so visual novelty is active-motion evidence, not only a family label.
