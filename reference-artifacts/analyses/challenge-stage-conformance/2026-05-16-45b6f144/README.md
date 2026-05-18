# Challenge Stage Conformance Analysis

Generated: 2026-05-16T11:59:58.206Z
Commit: 45b6f144
Branch: codex/macbook-audio-entry-grounding-cycle

## Executive Summary

This is a deliberately critical challenge-stage readout. The prior alien-entry score can look healthy because it rewards coverage and broad stage signatures. This report applies a harsher "interesting factor" lens that starts every challenge stage at 1.0/10 and only adds credit for measured no-combat rule conformance, Galaga-reference trajectory match, stage-specific visual/alien novelty, and durable reference evidence.

Current result: **4.1/10 interesting factor** and **4.4/10 challenge-stage conformance**. The strongest rule finding is that current probes show no enemy shots, no attack starts, and no ship losses during sampled challenge windows. The weakest player-facing finding is that challenge stages are still not authored enough as memorable Galaga-like set pieces: most measured runtime vectors best-match the same Galaga challenge-2 reference, stage 3 does not clearly read as the original first challenge, and stage 19 has no durable reference target yet.

## Method

- Runtime challenge states were sampled through the browser-backed Aurora harness using `challengeFormationState()`.
- Reference targets came from media-backed Galaga path labels and contact sheets.
- Existing path-family comparison supplied best-match vector scores against labeled Galaga challenge entries.
- Safety is measured separately from interest: no shots/no kills is necessary, but it does not make a challenge visually conformant.
- Prior 24-second evidence windows can include post-challenge normal play, so enemy bullets/attackers in those older windows are not treated as challenge-rule failures here.

## Stage Summary

| Stage | Challenge | Interest | Score | Best Reference Match | Aurora Path Family | No-Shot/No-Kill | Critical Gap |
| --- | --- | ---: | ---: | --- | --- | --- | --- |
| 3 | 1 | 3.7/10 | 4/10 | challenge-2-arrival-group-1 (4.5/10) | classic-lane-wave | pass | Best reference match is challenge-2-arrival-group-1, not expected challenge-1-arrival-group-1 or challenge-1-late-wave-group-4.<br>First challenge still mixes boss entries into the opening lane sequence; the original first challenge reads more like a clean bonus pattern language than combat grammar. |
| 7 | 2 | 4.9/10 | 4.9/10 | challenge-2-arrival-group-1 (5/10) | cross-sweep | pass | Cross-sweep identity is visible in labels, but the measured vector still lands closest to the same challenge-2 reference as most other challenge stages. |
| 11 | 3 | 4.5/10 | 4.9/10 | challenge-2-arrival-group-1 (4.7/10) | hook-arc | pass | Best reference match is challenge-2-arrival-group-1, not expected challenge-3-arrival-group-1.<br>Dragonfly family appears, but sprite-motion novelty and tracked Galaga challenge-3 path phases are not yet scored. |
| 15 | 4 | 4.6/10 | 4.9/10 | challenge-2-arrival-group-1 (5/10) | boss-led-loop | pass | Best reference match is challenge-2-arrival-group-1, not expected challenge-3-arrival-group-1.<br>Boss-led-loop has the strongest runtime spread, yet it still best-matches challenge 2 and lacks a late-stage Galaga contact-sheet target. |
| 19 | 5 | 2.8/10 | 3.1/10 | pending (n/a/10) | crown-split-cascade | pass | Stage 19 has a configured crown-split-cascade, but durable path extraction and Galaga late-challenge reference labels are missing. |


## Stage 3 / Challenge 1

**Current score:** interesting factor 3.7/10; challenge conformance 4/10.

**Original target:** First Galaga-style challenging stage: readable bonus set piece, no fire, no ship loss, upper-band mirrored entries, bee/butterfly line waves, visible arrival/peel-off.

**Aurora current:** classic-lane-wave / classic-lane-wave; lanes boss, boss, but, bee, but, but, bee, but; first-wave types boss, boss, but, bee, but, but, bee, but; visual families classic.

**Graphics read:** Current graphics show classic family styling with bee, boss, but alien types. This is still a proxy for visual identity; no active sprite-motion phase score is attached to the challenge window yet.

**Movement read:** Trajectory vector best-match score 4.5/10 against challenge-2-arrival-group-1; xRange 0.4208, yRange 0.3338, pathLength 0.3313.

**Alien variation read:** Opening wave exposes 3 type(s) and classic visual family labels; later-stage novelty is not yet backed by sprite-motion scoring.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Best reference match is challenge-2-arrival-group-1, not expected challenge-1-arrival-group-1 or challenge-1-late-wave-group-4.
- First challenge still mixes boss entries into the opening lane sequence; the original first challenge reads more like a clean bonus pattern language than combat grammar.

**Next actions:**
- Replace the first challenge with reference-labeled challenge-1 group contracts: top-right bee-line entry, late top-left butterfly wave, peel-off exits, and clearer no-combat bonus staging.
- Add contact-sheet comparison for first-visible frame, entry side, exit side, lane occupancy, and group timing before tuning visuals.


## Stage 7 / Challenge 2

**Current score:** interesting factor 4.9/10; challenge conformance 4.9/10.

**Original target:** Second challenge should feel denser and more novel than challenge 1 while staying nonlethal and non-shooting.

**Aurora current:** scorpion-cross-sweep / cross-sweep; lanes but, boss, rogue, bee, bee, rogue, boss, but; first-wave types but, boss, rogue, bee, bee, rogue, boss, but; visual families classic.

**Graphics read:** Current graphics show classic family styling with bee, boss, but, rogue alien types. This is still a proxy for visual identity; no active sprite-motion phase score is attached to the challenge window yet.

**Movement read:** Trajectory vector best-match score 5/10 against challenge-2-arrival-group-1; xRange 0.5366, yRange 0.3074, pathLength 0.389.

**Alien variation read:** Opening wave exposes 4 type(s) and classic visual family labels; later-stage novelty is not yet backed by sprite-motion scoring.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Cross-sweep identity is visible in labels, but the measured vector still lands closest to the same challenge-2 reference as most other challenge stages.

**Next actions:**
- Tune challenge 2 toward the denser mixed-novelty-line reference instead of relying on a generic cross-sweep.
- Score separate group identities so stage 7 is not just a slightly wider stage 3.


## Stage 11 / Challenge 3

**Current score:** interesting factor 4.5/10; challenge conformance 4.9/10.

**Original target:** Third challenge should make the new visual family and boss-led novelty obvious, with larger sweep vocabulary and no attacks.

**Aurora current:** stingray-hook-arc / hook-arc; lanes rogue, but, boss, bee, boss, bee, but, rogue; first-wave types rogue, but, boss, bee, boss, bee, but, rogue; visual families dragonfly.

**Graphics read:** Current graphics show dragonfly family styling with bee, boss, but, rogue alien types. This is still a proxy for visual identity; no active sprite-motion phase score is attached to the challenge window yet.

**Movement read:** Trajectory vector best-match score 4.7/10 against challenge-2-arrival-group-1; xRange 0.518, yRange 0.4048, pathLength 0.4579.

**Alien variation read:** Opening wave exposes 4 type(s) and dragonfly visual family labels; later-stage novelty is not yet backed by sprite-motion scoring.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Best reference match is challenge-2-arrival-group-1, not expected challenge-3-arrival-group-1.
- Dragonfly family appears, but sprite-motion novelty and tracked Galaga challenge-3 path phases are not yet scored.

**Next actions:**
- Promote challenge-3 boss-led reference phases and score dragonfly visual novelty as animation, not only family label.
- Add motion windows for wing flaps, pulsing, dive/rotation silhouette, and challenge-only nonlethal arrival.


## Stage 15 / Challenge 4

**Current score:** interesting factor 4.6/10; challenge conformance 4.9/10.

**Original target:** Later challenge should increase set-piece complexity, boss-led grouping, path length, and visual novelty without becoming combat.

**Aurora current:** boss-led-late-loop / boss-led-loop; lanes boss, rogue, boss, but, rogue, but, boss, bee; first-wave types boss, rogue, boss, but, rogue, but, boss, bee; visual families dragonfly.

**Graphics read:** Current graphics show dragonfly family styling with bee, boss, but, rogue alien types. This is still a proxy for visual identity; no active sprite-motion phase score is attached to the challenge window yet.

**Movement read:** Trajectory vector best-match score 5/10 against challenge-2-arrival-group-1; xRange 0.6774, yRange 0.3797, pathLength 0.524.

**Alien variation read:** Opening wave exposes 4 type(s) and dragonfly visual family labels; later-stage novelty is not yet backed by sprite-motion scoring.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Best reference match is challenge-2-arrival-group-1, not expected challenge-3-arrival-group-1.
- Boss-led-loop has the strongest runtime spread, yet it still best-matches challenge 2 and lacks a late-stage Galaga contact-sheet target.

**Next actions:**
- Capture or label later Galaga challenge references, then make boss-led-loop a late-stage contract with stronger exits and bonus route clarity.
- Add high-bonus readability probes so later challenge complexity stays learnable.


## Stage 19 / Challenge 5

**Current score:** interesting factor 2.8/10; challenge conformance 3.1/10.

**Original target:** Very-late challenge should have a specialty cascade identity and a supported reference window before it is trusted.

**Aurora current:** crown-split-cascade / crown-split-cascade; lanes boss, rogue, but, boss, bee, but, rogue, boss; first-wave types boss, rogue, but, boss, bee, but, rogue, boss; visual families mosquito.

**Graphics read:** Current graphics show mosquito family styling with bee, boss, but, rogue alien types. This is still a proxy for visual identity; no active sprite-motion phase score is attached to the challenge window yet.

**Movement read:** No reference trajectory comparison row was found for this stage.

**Alien variation read:** Opening wave exposes 4 type(s) and mosquito visual family labels; later-stage novelty is not yet backed by sprite-motion scoring.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Stage 19 has a configured crown-split-cascade, but durable path extraction and Galaga late-challenge reference labels are missing.

**Next actions:**
- Create a stage-19 evidence window and late-challenge reference target before treating crown-split-cascade as conformant.
- Promote mosquito/crown visual novelty into runtime sprite-motion scoring.


## Plan To Improve

1. Tighten the scorer first: separate first-visible arrival side, entry side, exit side, group index, no-fire/no-kill rule, path similarity, alien family novelty, and sprite-motion novelty.
2. Implement stage 3 against the first Galaga challenge target: top-right bee-line entry, late top-left butterfly wave, clean peel-off exits, bonus-stage readable grouping, no combat grammar.
3. Implement stage 7 as the second challenge: denser mixed-novelty-line behavior with a measured increase in crossing path depth and learnable timing.
4. Implement stage 11 as the third challenge: boss-led/dragonfly novelty with explicit animation-phase scoring for flapping, pulsing, and silhouette changes.
5. Capture or label later Galaga challenge references before claiming stage 15/19 maturity; then tune boss-led-loop and crown-split-cascade against those references.
6. Promote challenge-stage contact sheets and motion SVGs into the Application Guide so a reviewer can see the actual visual delta, not only score text.

## Success Criteria

- Raise challenge-stage interesting factor from 4.1/10 toward 6.0/10 without regressing no-shot/no-kill guardrails.
- Make stage 3 best-match challenge-1 references instead of challenge 2.
- Preserve 0 enemy shots, 0 enemy attack starts, and 0 ship losses during challenge windows.
- Add durable stage 19 evidence and reference labels before treating the late challenge as conformant.
- Add sprite-motion scoring for challenge enemies so visual novelty is active-motion evidence, not only a family label.
