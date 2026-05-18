# Challenge Stage Conformance Analysis

Generated: 2026-05-16T14:55:30.675Z
Commit: 708f7909
Branch: codex/macbook-audio-entry-grounding-cycle

## Executive Summary

This is a deliberately critical challenge-stage readout. The prior alien-entry score can look healthy because it rewards coverage and broad stage signatures. This report applies a harsher "interesting factor" lens that starts every challenge stage at 1.0/10 and only adds credit for measured no-combat rule conformance, Galaga-reference trajectory match, stage-specific visual/alien novelty, and durable reference evidence.

Current result: **5.8/10 interesting factor** and **5.8/10 challenge-stage conformance**. The strongest rule finding is that current probes show no enemy shots, no attack starts, and no ship losses during sampled challenge windows. The weakest player-facing finding is that challenge stages are still not authored enough as memorable Galaga-like set pieces: 1 sampled stage(s) still best-match the same Galaga challenge-2 reference, stage 3 now lands on the first-challenge bee-line reference but needs stronger trajectory precision, active sprite-motion novelty is unscored, and stage 19 lacks reference grounding.

## Method

- Runtime challenge states were sampled through the browser-backed Aurora harness using `challengeFormationState()`.
- Reference targets came from media-backed Galaga path labels and contact sheets.
- Existing path-family comparison supplied best-match vector scores against labeled Galaga challenge entries, with challenge windows scored on arrival-phase geometry plus alien-role semantics.
- Safety is measured separately from interest: no shots/no kills is necessary, but it does not make a challenge visually conformant.
- Prior 24-second evidence windows can include post-challenge normal play, so enemy bullets/attackers in those older windows are not treated as challenge-rule failures here.

## Stage Summary

| Stage | Challenge | Interest | Score | Group Identity | Best Reference Match | Aurora Path Family | No-Shot/No-Kill | Critical Gap |
| --- | --- | ---: | ---: | ---: | --- | --- | --- | --- |
| 3 | 1 | 5.7/10 | 5.7/10 | 7.2/10 | challenge-1-arrival-group-1 (5.5/10) | first-challenge-peel | pass | Reference target hit; remaining work is trajectory precision and active motion scoring. |
| 7 | 2 | 5.9/10 | 5.9/10 | 8.3/10 | challenge-2-arrival-group-1 (5.9/10) | cross-sweep | pass | Cross-sweep identity is visible in labels, but the measured vector still lands closest to the same challenge-2 reference as most other challenge stages. |
| 11 | 3 | 6.3/10 | 6.3/10 | 8/10 | challenge-3-arrival-group-1 (5.2/10) | hook-arc | pass | Dragonfly family appears, but sprite-motion novelty and tracked Galaga challenge-3 path phases are not yet scored. |
| 15 | 4 | 6.3/10 | 6.3/10 | 7.7/10 | challenge-3-arrival-group-1 (5.5/10) | boss-led-loop | pass | Boss-led-loop now lands on the challenge-3 reference, but late-stage reference labels and high-bonus readability probes are still thin. |
| 19 | 5 | 4.6/10 | 5/10 | 7.5/10 | challenge-3-arrival-group-1 (5.7/10) | crown-split-cascade | pass | Stage 19 now has crown-split-cascade runtime path extraction, but Galaga late-challenge reference labels and high-bonus readability probes are still missing. |


## Stage 3 / Challenge 1

**Current score:** interesting factor 5.7/10; challenge conformance 5.7/10.

**Original target:** First Galaga-style challenging stage: readable bonus set piece, no fire, no ship loss, upper-band mirrored entries, bee/butterfly line waves, visible arrival/peel-off.

**Aurora current:** first-challenge-peel / first-challenge-peel; lanes bee, bee, bee, bee, but, but, but, but; first-wave types bee, bee, bee, bee, but, but, but, but; visual families classic; group identity 7.2/10.

**Graphics read:** Current graphics show classic family styling with bee, but alien types. This is still a proxy for visual identity; no active sprite-motion phase score is attached to the challenge window yet.

**Movement read:** Trajectory vector best-match score 5.5/10 against challenge-1-arrival-group-1; xRange 0.4686, yRange 0.2039, pathLength 0.2711.

**Alien variation read:** Opening wave exposes 2 type(s) and classic visual family labels. Group identity: 5/5 wave type signatures and 1/5 path signatures; average within-wave spawn span 0.48s. Active sprite-motion novelty remains a separate unscored gap.

**Group identity read:** 5/5 wave type signatures and 1/5 path signatures; average within-wave spawn span 0.48s.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Reference target hit; remaining work is trajectory precision, lane timing, and active sprite-motion scoring.

**Next actions:**
- Protect the first-challenge bee/butterfly line contract, then tune path length, turn count, and rack-slot precision against challenge-1 arrival and late-wave labels.
- Add contact-sheet comparison for first-visible frame, entry side, exit side, lane occupancy, and group timing so the next tuning pass can improve trajectory precision without subjective guessing.


## Stage 7 / Challenge 2

**Current score:** interesting factor 5.9/10; challenge conformance 5.9/10.

**Original target:** Second challenge should feel denser and more novel than challenge 1 while staying nonlethal and non-shooting.

**Aurora current:** scorpion-cross-sweep / cross-sweep; lanes but, boss, rogue, bee, bee, rogue, boss, but; first-wave types but, boss, rogue, bee, bee, rogue, boss, but; visual families classic; group identity 8.3/10.

**Graphics read:** Current graphics show classic family styling with bee, boss, but, rogue alien types. This is still a proxy for visual identity; no active sprite-motion phase score is attached to the challenge window yet.

**Movement read:** Trajectory vector best-match score 5.9/10 against challenge-2-arrival-group-1; xRange 0.5332, yRange 0.2388, pathLength 0.3567.

**Alien variation read:** Opening wave exposes 4 type(s) and classic visual family labels. Group identity: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.42s. Active sprite-motion novelty remains a separate unscored gap.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.42s.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Cross-sweep identity is visible in labels, but the measured vector still lands closest to the same challenge-2 reference as most other challenge stages.

**Next actions:**
- Tune challenge 2 toward the denser mixed-novelty-line reference instead of relying on a generic cross-sweep.
- Score separate group identities so stage 7 is not just a slightly wider stage 3.


## Stage 11 / Challenge 3

**Current score:** interesting factor 6.3/10; challenge conformance 6.3/10.

**Original target:** Third challenge should make the new visual family and boss-led novelty obvious, with larger sweep vocabulary and no attacks.

**Aurora current:** stingray-hook-arc / hook-arc; lanes boss, rogue, but, bee, boss, bee, but, rogue; first-wave types boss, rogue, but, bee, boss, bee, but, rogue; visual families dragonfly; group identity 8/10.

**Graphics read:** Current graphics show dragonfly family styling with bee, boss, but, rogue alien types. This is still a proxy for visual identity; no active sprite-motion phase score is attached to the challenge window yet.

**Movement read:** Trajectory vector best-match score 5.2/10 against challenge-3-arrival-group-1; xRange 0.4706, yRange 0.2758, pathLength 0.3365.

**Alien variation read:** Opening wave exposes 4 type(s) and dragonfly visual family labels. Group identity: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.36s. Active sprite-motion novelty remains a separate unscored gap.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.36s.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Dragonfly family appears, but sprite-motion novelty and tracked Galaga challenge-3 path phases are not yet scored.

**Next actions:**
- Promote challenge-3 boss-led reference phases and score dragonfly visual novelty as animation, not only family label.
- Add motion windows for wing flaps, pulsing, dive/rotation silhouette, and challenge-only nonlethal arrival.


## Stage 15 / Challenge 4

**Current score:** interesting factor 6.3/10; challenge conformance 6.3/10.

**Original target:** Later challenge should increase set-piece complexity, boss-led grouping, path length, and visual novelty without becoming combat.

**Aurora current:** boss-led-late-loop / boss-led-loop; lanes boss, rogue, boss, but, rogue, but, boss, bee; first-wave types boss, rogue, boss, but, rogue, but, boss, bee; visual families dragonfly; group identity 7.7/10.

**Graphics read:** Current graphics show dragonfly family styling with bee, boss, but, rogue alien types. This is still a proxy for visual identity; no active sprite-motion phase score is attached to the challenge window yet.

**Movement read:** Trajectory vector best-match score 5.5/10 against challenge-3-arrival-group-1; xRange 0.6364, yRange 0.3097, pathLength 0.4837.

**Alien variation read:** Opening wave exposes 4 type(s) and dragonfly visual family labels. Group identity: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.3s. Active sprite-motion novelty remains a separate unscored gap.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.3s.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Boss-led-loop now lands on the challenge-3 reference, but late-stage reference labels and high-bonus readability probes are still thin.

**Next actions:**
- Capture or label later Galaga challenge references, then make boss-led-loop a late-stage contract with stronger exits and bonus route clarity.
- Add high-bonus readability probes so later challenge complexity stays learnable.


## Stage 19 / Challenge 5

**Current score:** interesting factor 4.6/10; challenge conformance 5/10.

**Original target:** Very-late challenge should have a specialty cascade identity and a supported reference window before it is trusted.

**Aurora current:** crown-split-cascade / crown-split-cascade; lanes boss, rogue, but, boss, bee, but, rogue, boss; first-wave types boss, rogue, but, boss, bee, but, rogue, boss; visual families mosquito; group identity 7.5/10.

**Graphics read:** Current graphics show mosquito family styling with bee, boss, but, rogue alien types. This is still a proxy for visual identity; no active sprite-motion phase score is attached to the challenge window yet.

**Movement read:** Trajectory vector best-match score 5.7/10 against challenge-3-arrival-group-1; xRange 0.6837, yRange 0.2607, pathLength 0.5362.

**Alien variation read:** Opening wave exposes 4 type(s) and mosquito visual family labels. Group identity: 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.25s. Active sprite-motion novelty remains a separate unscored gap.

**Group identity read:** 5/5 wave type signatures and 3/5 path signatures; average within-wave spawn span 0.25s.

**Safety rule:** enemy shots 0, attack starts 0, ship losses 0.

**Critical gaps:**
- Stage 19 now has crown-split-cascade runtime path extraction, but Galaga late-challenge reference labels and high-bonus readability probes are still missing.

**Next actions:**
- Promote the stage-19 evidence window into a late-challenge reference-label target before treating crown-split-cascade as conformant.
- Promote mosquito/crown visual novelty into runtime sprite-motion scoring.


## Plan To Improve

1. Tighten the scorer first: separate first-visible arrival side, entry side, exit side, group index, no-fire/no-kill rule, path similarity, alien family novelty, and sprite-motion novelty.
2. Protect the stage 3 first-challenge reference hit, then improve its path-length and rack-slot precision against challenge-1 arrival/late-wave labels.
3. Implement stage 7 as the second challenge: denser mixed-novelty-line behavior with a measured increase in crossing path depth and learnable timing.
4. Implement stage 11 as the third challenge: boss-led/dragonfly novelty with explicit animation-phase scoring for flapping, pulsing, and silhouette changes.
5. Capture or label later Galaga challenge references before claiming stage 15/19 maturity; then tune boss-led-loop and crown-split-cascade against those references.
6. Promote challenge-stage contact sheets and motion SVGs into the Application Guide so a reviewer can see the actual visual delta, not only score text.

## Success Criteria

- Raise challenge-stage interesting factor from 5.8/10 toward 6.0/10 without regressing no-shot/no-kill guardrails.
- Keep stage 3 best-matching challenge-1 references while improving its raw trajectory score.
- Preserve 0 enemy shots, 0 enemy attack starts, and 0 ship losses during challenge windows.
- Add stage 19 late-reference labels and high-bonus readability probes before treating the late challenge as conformant.
- Add sprite-motion scoring for challenge enemies so visual novelty is active-motion evidence, not only a family label.
