# Challenge Stage Conformance Analysis

Generated: 2026-05-17T14:17:40.266Z
Commit: 0d73c585
Branch: codex/macbook-audio-entry-grounding-cycle

## Executive Summary

This is now a strict challenge-stage readout. The prior alien-entry score looked too healthy because it rewarded coverage, type labels, and broad stage signatures. That was useful harness progress, but it overstated the player-facing experience. This report follows the current project decision that challenging stages start at **1/10 interesting**, **1/10 movement**, and **1/10 graphical conformance** until they earn credit through reference-grounded movement, active visual evidence, alien/stage novelty, and durable bonus-stage contracts.

Current result: **2.6/10 interesting factor** and **2.5/10 challenge-stage conformance**. Movement is **2.3/10**, graphical conformance is **2.1/10**, and alien/stage novelty is **3.4/10**. The strongest rule finding is that current probes show no enemy shots, no attack starts, and no ship losses during sampled challenge windows. The weakest player-facing finding is that current challenge stages are functionally safe but not yet credible Galaga-like bonus exhibitions: strict movement is 2.3/10, strict graphics is 2.1/10, alien/stage novelty is 3.4/10, active sprite-motion evidence is missing, and late challenge references remain thin. Diagnostic legacy coverage was 6.1/10, which is why the old read was too generous.

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

The broader Galaga target-artifact coverage read is **3.6/10** overall and **1.7/10** for challenge-stage target readiness. The important implication is not that Aurora lacks all grounding; it is that the currently ingested challenge-stage corpus is still early-stage heavy. Aurora has enough Galaga source material to prove the current challenge-stage gap, but not enough late-stage media-backed material to rebuild the later challenge stages with high confidence. The most valuable next ingestion work is controlled or sourced capture for Challenge Stages 4-8, followed by per-group movement and alien-novelty labels.

| Challenge | Stage Marker | Target Status | Coverage | Next Need |
| ---: | ---: | --- | ---: | --- |
| 1 | 3 | partially-ingested | 4.5/10 | Convert existing windows into fuller five-group trajectory labels and build Aurora Stage 3 against those exact group contracts. |
| 2 | 7 | partially-ingested | 4.5/10 | Add late-wave/results windows and group 2-5 labels. |
| 3 | 11 | partially-ingested | 4.5/10 | Add late-wave/results windows and map specialty alien novelty explicitly. |
| 4 | 15 | not-ingested | 0/10 | Acquire and label a full reference challenge window; do not reuse Challenge 3 as the best target except as a temporary diagnostic. |
| 5 | 19 | not-ingested | 0/10 | Acquire and label a full reference challenge window with mosquito/specialty-family novelty. |
| 6 | 23 | not-ingested | 0/10 | Acquire and label full reference challenge window for late-stage progression. |
| 7 | 27 | not-ingested | 0/10 | Acquire and label full reference challenge window for late-stage progression. |
| 8 | 31 | not-ingested | 0/10 | Acquire and label full reference challenge window and special blue-spaceship novelty. |

Full target-artifact report: `GALAGA_TARGET_ARTIFACT_COVERAGE.md` and `reference-artifacts/analyses/galaga-target-artifact-coverage/latest.json`.


## Stage Summary

| Stage | Challenge | Interest | Movement | Graphics | Alien Novelty | Strict Score | Diagnostic Best Reference | No-Shot/No-Kill | Critical Gap |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| 3 | 1 | 2.6/10 | 2.3/10 | 2.1/10 | 3.4/10 | 2.5/10 | challenge-1-arrival-group-1 (6.8/10 legacy) | pass | Movement conformance is only 2.3/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.<br>Graphical conformance is only 2.1/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.<br>Alien/stage novelty is only 3.4/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns. |
| 7 | 2 | 2.5/10 | 2.2/10 | 1.7/10 | 3.4/10 | 2.5/10 | challenge-2-arrival-group-1 (6.6/10 legacy) | pass | Movement conformance is only 2.2/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.<br>Graphical conformance is only 1.7/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.<br>Alien/stage novelty is only 3.4/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Cross-sweep identity is visible in labels, but the measured vector still lands closest to the same challenge-2 reference as most other challenge stages. |
| 11 | 3 | 2.7/10 | 2.5/10 | 2.2/10 | 3.4/10 | 2.7/10 | challenge-3-arrival-group-1 (7.4/10 legacy) | pass | Movement conformance is only 2.5/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.<br>Graphical conformance is only 2.2/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.<br>Alien/stage novelty is only 3.4/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Dragonfly family appears, but sprite-motion novelty and tracked Galaga challenge-3 path phases are not yet scored. |
| 15 | 4 | 2.7/10 | 2.5/10 | 2.2/10 | 3.4/10 | 2.7/10 | challenge-3-arrival-group-1 (6.8/10 legacy) | pass | Movement conformance is only 2.5/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.<br>Graphical conformance is only 2.2/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.<br>Alien/stage novelty is only 3.4/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Boss-led-loop now lands on the challenge-3 reference, but late-stage reference labels and high-bonus readability probes are still thin. |
| 19 | 5 | 2.3/10 | 1.9/10 | 2.2/10 | 3.4/10 | 2.2/10 | challenge-3-arrival-group-1 (7.3/10 legacy) | pass | Movement conformance is only 1.9/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.<br>Graphical conformance is only 2.2/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.<br>Alien/stage novelty is only 3.4/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.<br>Stage 19 now has crown-split-cascade runtime path extraction, but Galaga late-challenge reference labels and high-bonus readability probes are still missing. |


## Stage 3 / Challenge 1

**Current score:** interesting factor 2.6/10; challenge conformance 2.5/10. Movement 2.3/10, graphics 2.1/10, alien novelty 3.4/10, progression 2.8/10.

**Legacy broad coverage score:** 6/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** First Galaga-style challenging stage: readable bonus set piece, no fire, no ship loss, upper-band mirrored entries, bee/butterfly line waves, visible arrival/peel-off.

**Aurora current:** first-challenge-peel / first-challenge-peel; lanes bee, bee, bee, bee, but, but, but, but; first-wave types bee, bee, bee, bee, but, but, but, but; visual families classic; strict movement 2.3/10, graphics 2.1/10, alien novelty 3.4/10.

**Graphics read:** Strict graphics score 2.1/10. Current visible family/type labels are present, but challenge-window graphics are capped at 2.2/10 until live sprite flaps, pulsing, rotation/dive silhouettes, capture/rescue transitions, and Galaga target sprite crops are scored in motion.

**Movement read:** Strict movement score 2.3/10 against challenge-1-arrival-group-1: y-range fit 0.22, path-length fit 0.29, turn fit 0.38. Current probes are still sampled summaries, so full temporal choreography is not yet proven. Legacy broad vector best-match was 6.8/10 against challenge-1-arrival-group-1; xRange 0.5542, yRange 0.0621, pathLength 0.1951.

**Alien variation read:** Strict alien/progression novelty score 3.4/10. Current stages expose labels and type mixes, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 2 type(s) and classic visual family labels. Group identity diagnostic: 5/5 wave type signatures and 1/5 path signatures; average within-wave spawn span 0.48s.

**Group identity read:** 5/5 wave type signatures and 1/5 path signatures; average within-wave spawn span 0.48s.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Movement conformance is only 2.3/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.
- Graphical conformance is only 2.1/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.
- Alien/stage novelty is only 3.4/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.

**Next actions:**
- Protect the first-challenge bee/butterfly line contract, then tune path length, turn count, and rack-slot precision against challenge-1 arrival and late-wave labels.
- Add contact-sheet comparison for first-visible frame, entry side, exit side, lane occupancy, and group timing so the next tuning pass can improve trajectory precision without subjective guessing.


## Stage 7 / Challenge 2

**Current score:** interesting factor 2.5/10; challenge conformance 2.5/10. Movement 2.2/10, graphics 1.7/10, alien novelty 3.4/10, progression 3.2/10.

**Legacy broad coverage score:** 6/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Second challenge should feel denser and more novel than challenge 1 while staying nonlethal and non-shooting.

**Aurora current:** scorpion-cross-sweep / cross-sweep; lanes but, boss, rogue, bee, bee, rogue, boss, but; first-wave types but, boss, rogue, bee, bee, rogue, boss, but; visual families classic; strict movement 2.2/10, graphics 1.7/10, alien novelty 3.4/10.

**Graphics read:** Strict graphics score 1.7/10. Current visible family/type labels are present, but challenge-window graphics are capped at 2.2/10 until live sprite flaps, pulsing, rotation/dive silhouettes, capture/rescue transitions, and Galaga target sprite crops are scored in motion.

**Movement read:** Strict movement score 2.2/10 against challenge-2-arrival-group-1: y-range fit 0.37, path-length fit 0.4, turn fit 0.33. Current probes are still sampled summaries, so full temporal choreography is not yet proven. Legacy broad vector best-match was 6.6/10 against challenge-2-arrival-group-1; xRange 0.557, yRange 0.1243, pathLength 0.3259.

**Alien variation read:** Strict alien/progression novelty score 3.4/10. Current stages expose labels and type mixes, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and classic visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.42s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.42s.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Movement conformance is only 2.2/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.
- Graphical conformance is only 1.7/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.
- Alien/stage novelty is only 3.4/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Cross-sweep identity is visible in labels, but the measured vector still lands closest to the same challenge-2 reference as most other challenge stages.

**Next actions:**
- Tune challenge 2 toward the denser mixed-novelty-line reference instead of relying on a generic cross-sweep.
- Score separate group identities so stage 7 is not just a slightly wider stage 3.


## Stage 11 / Challenge 3

**Current score:** interesting factor 2.7/10; challenge conformance 2.7/10. Movement 2.5/10, graphics 2.2/10, alien novelty 3.4/10, progression 3.2/10.

**Legacy broad coverage score:** 6.7/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Third challenge should make the new visual family and boss-led novelty obvious, with larger sweep vocabulary and no attacks.

**Aurora current:** stingray-crown-hook-hybrid / hook-arc; lanes boss, rogue, but, bee, boss, bee, but, rogue; first-wave types boss, rogue, but, bee, boss, bee, but, rogue; visual families dragonfly; strict movement 2.5/10, graphics 2.2/10, alien novelty 3.4/10.

**Graphics read:** Strict graphics score 2.2/10. Current visible family/type labels are present, but challenge-window graphics are capped at 2.2/10 until live sprite flaps, pulsing, rotation/dive silhouettes, capture/rescue transitions, and Galaga target sprite crops are scored in motion.

**Movement read:** Strict movement score 2.5/10 against challenge-3-arrival-group-1: y-range fit 0.37, path-length fit 0.67, turn fit 0.36. Current probes are still sampled summaries, so full temporal choreography is not yet proven. Legacy broad vector best-match was 7.4/10 against challenge-3-arrival-group-1; xRange 0.7479, yRange 0.1316, pathLength 0.5787.

**Alien variation read:** Strict alien/progression novelty score 3.4/10. Current stages expose labels and type mixes, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and dragonfly visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.36s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.36s.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Movement conformance is only 2.5/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.
- Graphical conformance is only 2.2/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.
- Alien/stage novelty is only 3.4/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Dragonfly family appears, but sprite-motion novelty and tracked Galaga challenge-3 path phases are not yet scored.

**Next actions:**
- Promote challenge-3 boss-led reference phases and score dragonfly visual novelty as animation, not only family label.
- Add motion windows for wing flaps, pulsing, dive/rotation silhouette, and challenge-only nonlethal arrival.


## Stage 15 / Challenge 4

**Current score:** interesting factor 2.7/10; challenge conformance 2.7/10. Movement 2.5/10, graphics 2.2/10, alien novelty 3.4/10, progression 3.1/10.

**Legacy broad coverage score:** 6.5/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Later challenge should increase set-piece complexity, boss-led grouping, path length, and visual novelty without becoming combat.

**Aurora current:** boss-led-late-loop / boss-led-loop; lanes boss, rogue, boss, but, rogue, but, boss, bee; first-wave types boss, rogue, boss, but, rogue, but, boss, bee; visual families dragonfly; strict movement 2.5/10, graphics 2.2/10, alien novelty 3.4/10.

**Graphics read:** Strict graphics score 2.2/10. Current visible family/type labels are present, but challenge-window graphics are capped at 2.2/10 until live sprite flaps, pulsing, rotation/dive silhouettes, capture/rescue transitions, and Galaga target sprite crops are scored in motion.

**Movement read:** Strict movement score 2.5/10 against challenge-3-arrival-group-1: y-range fit 0.45, path-length fit 0.56, turn fit 0.41. Current probes are still sampled summaries, so full temporal choreography is not yet proven. Legacy broad vector best-match was 6.8/10 against challenge-3-arrival-group-1; xRange 0.6455, yRange 0.1612, pathLength 0.4834.

**Alien variation read:** Strict alien/progression novelty score 3.4/10. Current stages expose labels and type mixes, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and dragonfly visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.3s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.3s.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Movement conformance is only 2.5/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.
- Graphical conformance is only 2.2/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.
- Alien/stage novelty is only 3.4/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Boss-led-loop now lands on the challenge-3 reference, but late-stage reference labels and high-bonus readability probes are still thin.

**Next actions:**
- Capture or label later Galaga challenge references, then make boss-led-loop a late-stage contract with stronger exits and bonus route clarity.
- Add high-bonus readability probes so later challenge complexity stays learnable.


## Stage 19 / Challenge 5

**Current score:** interesting factor 2.3/10; challenge conformance 2.2/10. Movement 1.9/10, graphics 2.2/10, alien novelty 3.4/10, progression 1.5/10.

**Legacy broad coverage score:** 5.3/10. This is retained as diagnostic evidence only; it no longer counts as the player-facing conformance score.

**Original target:** Very-late challenge should have a specialty cascade identity and a supported reference window before it is trusted.

**Aurora current:** crown-split-cascade / crown-split-cascade; lanes boss, rogue, but, boss, bee, but, rogue, boss; first-wave types boss, rogue, but, boss, bee, but, rogue, boss; visual families mosquito; strict movement 1.9/10, graphics 2.2/10, alien novelty 3.4/10.

**Graphics read:** Strict graphics score 2.2/10. Current visible family/type labels are present, but challenge-window graphics are capped at 2.2/10 until live sprite flaps, pulsing, rotation/dive silhouettes, capture/rescue transitions, and Galaga target sprite crops are scored in motion.

**Movement read:** Strict movement score 1.9/10 against challenge-3-arrival-group-1: y-range fit 0.43, path-length fit 0.74, turn fit 0.42. Current probes are still sampled summaries, so full temporal choreography is not yet proven. Legacy broad vector best-match was 7.3/10 against challenge-3-arrival-group-1; xRange 0.7536, yRange 0.1536, pathLength 0.6406.

**Alien variation read:** Strict alien/progression novelty score 3.4/10. Current stages expose labels and type mixes, but this does not yet prove Galaga-like stage-by-stage introduction, fresh featured aliens, or memorable bonus-stage teaching moments. Opening wave exposes 4 type(s) and mosquito visual family labels. Group identity diagnostic: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.25s.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.25s.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Movement conformance is only 1.9/10 under the strict scorer: current paths are too short/shallow and do not yet show the sweeping, turning, learnable Galaga challenge-stage trajectories.
- Graphical conformance is only 2.2/10 because challenge sprites are still scored as static/type labels; active flapping, pulsing, dive/rotation silhouettes, and reference sprite crops are not yet measured in the challenge window.
- Alien/stage novelty is only 3.4/10: the current type mix does not yet prove Galaga-like new alien introductions, memorable challenge-specific roles, or distinct bonus-stage learning patterns.
- Stage 19 now has crown-split-cascade runtime path extraction, but Galaga late-challenge reference labels and high-bonus readability probes are still missing.

**Next actions:**
- Promote the stage-19 evidence window into a late-challenge reference-label target before treating crown-split-cascade as conformant.
- Promote mosquito/crown visual novelty into runtime sprite-motion scoring.


## Plan To Improve

1. Treat the current strict scores as the release-facing truth: the broad coverage score is diagnostic only.
2. Build the challenge-stage target grammar: per-challenge group order, first-visible frame, entry side, exit side, path length, turn count, featured alien family, scoring window, perfect-bonus expectation, and result feedback.
3. Implement Stage 3 / Challenging Stage 1 first: top-right bee line, late top-left butterfly line, visibly longer upper-band sweep, clear peel-off exits, no combat grammar, and reference-matched duration/turn count.
4. Implement Stage 7 / Challenging Stage 2 as a different authored set piece, not just wider Stage 3: denser mixed novelty, crossing pattern, different entry side and exit side, readable scoring route.
5. Implement Stage 11 / Challenging Stage 3 with boss-led novelty and active animation evidence: featured alien role, flapping/pulsing/rotation windows, and a distinct reward read.
6. Do not claim late challenge conformance for Stage 15/19 until later Galaga challenge references are labeled or an explicit inspired-but-non-Galaga contract is documented.
7. Promote challenge-stage contact sheets, trajectory SVGs, and per-stage motion timelines into the Application Guide so the human review can see the actual delta, not only score text.

## Success Criteria

- Raise challenge-stage interesting factor from 2.6/10 to 3.5/10 as the first honest gate by implementing one visibly reference-like challenge, then toward 6.0/10 after Stage 3, 7, and 11 each have distinct authored contracts.
- Raise movement conformance from 2.3/10 by increasing y-range, path length, turn count, and exit-side match against the Galaga challenge references.
- Raise graphical conformance from 2.1/10 only when active sprite-motion windows and reference target crops are attached; do not inflate it from type labels alone.
- Preserve 0 enemy shots, 0 enemy attack starts, and 0 ship losses during challenge windows.
- Add stage 19 late-reference labels and high-bonus readability probes before treating the late challenge as conformant.
- Add sprite-motion scoring for challenge enemies so visual novelty is active-motion evidence, not only a family label.
