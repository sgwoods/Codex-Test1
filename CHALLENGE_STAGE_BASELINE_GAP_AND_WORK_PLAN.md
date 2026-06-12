# Challenge Stage Baseline Gap And Work Plan

Saved: 2026-06-05
Branch: `codex/aurora-challenge-movement-grammar`
Baseline commit: `9cdd2d5ec`
Primary refreshed artifact: `reference-artifacts/analyses/challenge-stage-conformance/latest.json`

## Purpose

This is the saved go-forward plan for Aurora's Galaga-style challenging-stage work. It preserves the current evidence-backed read before the next gameplay changes, stage by stage, and states the most specific work that can move each stage toward a major improvement.

The important current finding is narrow but useful: recent runtime work improved clock handling, spacing, and Challenge 2 identity enough to nudge the strict score from about `4.2/10` to `4.3/10`. That is real headway, but not a major player-facing transformation yet. The large remaining gap is still target-video choreography, active alien visual novelty, and human-learnable perfect-score route design.

## Naming Note

Runtime and historical artifacts currently use internal stage markers `3`, `7`, `11`, `15`, `19`, `23`, `27`, and `31` for the eight tracked challenge windows. Human-facing documentation should avoid implying that these are ordinary levels. Going forward, use the pattern `Challenging Stage A-B` where the runtime mapping confirms the challenge occurs between regular stages A and B, while preserving the internal marker in evidence tables.

Until that mapping is cleaned up everywhere, this report uses:

`Challenge N / internal stage marker M`

## Current Topline Read

| Metric | Current |
| --- | ---: |
| Strict challenge-stage conformance | `4.3/10` |
| Interesting factor | `4.3/10` |
| Movement conformance | `4.4/10` |
| Graphical conformance | `4.5/10` |
| Alien/stage novelty | `3.9/10` |
| Progression conformance | `3.0/10` |
| Player shot opportunity | `5.5/10` |
| Target contract fit | `5.3/10` |
| Target-video object-track fit | `3.6/10` |
| Target-track readiness | `8.6/10` |
| Sprite-motion correspondence | `6.18/10` |
| Safety rule | `10/10` |
| Diagnostic legacy coverage | `6.8/10` |

Interpretation:

- Safety is the strongest rule: sampled challenge windows preserve no enemy shots, no attacks, and no ship losses.
- Legacy coverage is not the player-facing score. It says we have broad labels and path-family coverage, not that the challenges feel conformant.
- The current hard blocker is visual and temporal specificity: the target-video object-track fit is `3.6/10`, novelty is `3.9/10`, and sprite motion is still capped by frame-labeled segmented-reference windows.
- Candidate sweeps have produced useful evidence but no runtime keeper across all eight stages.

## Saved Go-Forward Plan Set

1. Treat strict challenge-stage conformance as the release-facing truth. Broad coverage remains diagnostic only.
2. Keep safety as a hard guardrail: no enemy fire, no attacks, no ship loss during challenge windows.
3. Finish the motion grammar vocabulary so each challenge is defined as five groups with entry side, exit side, path family, timing, score lane, alien family, and result opportunity.
4. Make the first five challenges the near-term quality target, because they are the user-visible foundation and currently have the strongest grammar artifacts.
5. Do not promote a runtime candidate only because one proxy improves. Promotion must improve or preserve target-video fit, human-visible readability, human-perfect routeability, spacing, and identity.
6. Use synchronized target/current video and contact sheets as review artifacts before changing runtime tuning.
7. Add active sprite-motion scoring for challenge aliens: flap cadence, pulse, rotation/dive silhouette, and specialty alien phases.
8. Add persona-perfect route checks so a strong persona can actually hit the intended groups without hidden or unfair timing.
9. Feed spacing, lead-in continuity, and no-magic-appearance checks into strict challenge scoring instead of leaving them as separate guardrails.
10. Update Application Guide and project docs after each meaningful pass so the human-visible story matches the current artifacts.

## June 12 Follow-Up: Cadence And Perfect-Route Risk

This is an important follow-up note from manual play review, not yet a measured
artifact.

Two concerns need explicit investigation before claiming mature challenge-stage
or level-flow conformance:

1. Between-level cadence may have regressed. The current Aurora release appears
   to have significant new waits between the end of one level and the start of
   the next. If those waits are intentional audio/conformance pacing, document
   the expected timing and compare it to the Galaga reference flow. If they are
   not intentional, treat them as a timing/performance regression and restore a
   reference-consistent stage-to-stage cadence.
2. Challenge stages must preserve real perfect-score opportunity. A skilled
   persona, especially professional, should have probabilistic perfect-score
   routes across many challenge windows. Every target group must be fully
   visible on screen at some point, with enough scoreable window to make a
   perfect result hard but possible. If later-stage alien progression is so fast
   that targets are partly hidden, unreachable, or feel unlike the original,
   slow/tune the progression or widen the scoreable window before promoting the
   work.

Reference target shape from `Success Trajectory - Challenging - Google
Sheets.pdf`:

| Persona | I | II | III | IV | V | VI | VII | VIII | IX | X |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Beginner | 75 | 60 | 45 | 30 | 15 | 0 | 0 | 0 | 0 | 0 |
| Intermediate | 85 | 75 | 65 | 55 | 45 | 35 | 25 | 15 | 5 | -5 |
| Expert | 95 | 88 | 81 | 74 | 67 | 60 | 53 | 46 | 39 | 32 |
| Professional | 100 | 95 | 90 | 85 | 80 | 75 | 70 | 65 | 60 | 55 |

Use this as a design trajectory, not a measured score. The next harness work
should clamp any implemented success-rate target at `0%` or above; the `-5`
source-table value is preserved only as a "falls below floor" trend marker. The
next harness work should add:

- a level-transition timing probe that compares end-of-level to next-level-start
  waits against reference expectations
- a challenge perfect-route opportunity probe by persona and challenge number
- a full-target-visibility assertion for challenge groups
- a late-challenge speed/readability guard so higher difficulty does not become
  non-conformant acceleration

Measured follow-up now exists at
`reference-artifacts/analyses/aurora-cadence-perfect-route-risk/latest.json`.
Initial read: ordinary stage handoffs measure at `3.2s`, challenge entry at
`3.35s`, and challenge-result clear-to-next-stage spawn at `15.15s` (`7.77s`
result hold plus `7.35s` transition window). This supports treating the
between-level complaint as challenge-result cadence debt until it is compared
against archived reference footage. The same packet flags full-target
visibility gaps in seven of eight sampled challenge stages, no professional
perfects across the sampled challenge set, and challenge-contact events for
some lower-persona rows. Do not tune from this packet alone; use it to choose
the next reference-video/contact-sheet comparison.

Measured reference comparison now exists at
`reference-artifacts/analyses/aurora-cadence-reference-comparison/latest.json`.
The critical timing read is that the current Challenge 1 perfect-result
clear-to-next-stage spawn measures `15.15s`, while the preserved
Galaga-aligned challenge timing target remains `4.401s`. The current source
configuration explains the wait as `7.77s` result hold plus `7.35s`
next-stage transition, and blame places the long ceremony timing in May 30-31
challenge timing/audio work rather than in the Stage 3 group 1 keeper. Treat
this as challenge-result cadence regression risk unless a newer measured
audio-conformance decision explicitly supersedes the `4.401s` target.

The same comparison ties the routeability concern to reference evidence:
Galaga challenge object tracks provide five target groups across all eight
tracked challenge windows, but the current one-seed professional probe produced
`0/8` perfects and cleared only `2/8` sampled challenge rows. The visibility
proxy remains severe: seven of eight challenge stages have at least one target
that never fully enters, with Challenge 7 / Stage 27 the worst row at `0.375`
full-sprite coverage. Next step should refresh
`npm run harness:check:challenge-stage-correspondence` against the current
build, then make the smallest timing/visibility repair before any new gameplay
tuning or promotion work.

## Evidence Sources

- `CHALLENGE_STAGE_CONFORMANCE_ANALYSIS.md`
- `CHALLENGE_SETPIECE_CONTRACTS.md`
- `GALAGA_CHALLENGE_VIDEO_REFERENCE_ANALYSIS.md`
- `GALAGA_TARGET_ARTIFACT_COVERAGE.md`
- `reference-artifacts/analyses/challenge-stage-conformance/latest.json`
- `reference-artifacts/analyses/challenge-stage-candidate-sweep-index/latest.json`
- `reference-artifacts/analyses/challenge-movement-grammar/latest.json`
- `reference-artifacts/analyses/challenge-motion-primitives/latest.json`
- `reference-artifacts/analyses/aurora-cadence-perfect-route-risk/latest.json`
- `reference-artifacts/analyses/aurora-cadence-reference-comparison/latest.json`
- `reference-artifacts/analyses/galaga-challenge-object-tracks/latest.json`
- `tools/harness/check-challenge-motion-profile.js`

Current local runtime work behind this report:

- Delayed challenge-wave clocks no longer age while enemies are hidden.
- Reference-backed challenge paths now have side-aware lane offsets.
- Challenge motion/profile guardrails now cover delayed wave starts and spacing/bunching risk.
- The refreshed analyzer now reads Challenge 2 against the expected `challenge-2-arrival-group-1` family instead of incorrectly matching Challenge 1.

## Stage-By-Stage Assessment

### Challenge 1 / Internal Stage Marker 3

Current score: `4.2/10`

| Axis | Current |
| --- | ---: |
| Movement | `4.3/10` |
| Graphics | `4.4/10` |
| Novelty | `3.9/10` |
| Shot opportunity | `5.6/10` |
| Target contract fit | `6.9/10` |
| Target-video object-track fit | `3.2/10` |
| Best reference | `challenge-1-arrival-group-1` |

Target state:

- The first Galaga-style challenge should teach that this is a safe score exhibition, not combat.
- It should show clean bee/butterfly group entries, readable upper-band passes, peel-off exits, and a learnable route toward perfect bonus.

Current Aurora state:

- Runtime identity is now a credible first-challenge peel: bee and butterfly lanes, classic family labels, and no-shoot/no-kill safety.
- Target contract fit is the strongest of the current set at `6.9/10`.
- The visible target-video fit remains weak at `3.2/10`, so the stage is not yet moving like the baseline.

Differences and conformance gap:

- It has the right broad idea, but not enough frame-level timing, exact group spacing, or score-lane choreography.
- The current visual score is capped because active sprite motion is not yet compared as a target-crop sequence.

Most specific work to improve:

1. Promote full five-group frame labels for Challenge 1, including first-visible frame, entry side, exit side, and scoreable band.
2. Feed the new delayed-clock and spacing guardrail measurements into the strict scorer so current stability improvements are scored directly.
3. Re-run candidate search with hard bunching limits and reject candidates that hurt human-visible readability.
4. Add a persona-perfect route probe for Challenge 1 so the stage is judged by whether a skilled player can actually learn and clear the set piece.
5. Generate a synchronized target/current video from stage start to result screen for manual review.

### Challenge 2 / Internal Stage Marker 7

Current score: `4.2/10`

| Axis | Current |
| --- | ---: |
| Movement | `4.4/10` |
| Graphics | `4.1/10` |
| Novelty | `3.9/10` |
| Shot opportunity | `6.0/10` |
| Target contract fit | `6.6/10` |
| Target-video object-track fit | `4.8/10` |
| Best reference | `challenge-2-arrival-group-1` |

Target state:

- The second challenge should not feel like a wider Challenge 1.
- It should introduce denser mixed-family movement and a crossing pattern that is still safe and learnable.

Current Aurora state:

- This stage improved materially in the refreshed analyzer: the best match now lands on the expected Challenge 2 reference family.
- Shot opportunity is relatively strong at `6.0/10`.
- Graphics remain weak at `4.1/10`, so it is still not a strong visual spectacle.

Differences and conformance gap:

- The broad identity is now right, but the stage still lacks a crisp cross-sweep visual read and active sprite novelty.
- The candidate sweep had no keeper; the best prior candidate had only `+0.1/10` human-visible lift.

Most specific work to improve:

1. Lock this as the first post-fix review target because it now has the best combination of correct identity and target-video fit.
2. Add group-by-group target labels for the crossing pattern and score separate group identities.
3. Strengthen graphics by measuring active alien animation and specialty poses during the crossing route.
4. Tune path spacing and phase offsets against the reference, not against a generic cross-sweep label.
5. Add a human-visible pass/fail guard for "not magic appearing" and coherent group entry-to-exit continuity.

### Challenge 3 / Internal Stage Marker 11

Current score: `4.4/10`

| Axis | Current |
| --- | ---: |
| Movement | `4.4/10` |
| Graphics | `4.6/10` |
| Novelty | `3.9/10` |
| Shot opportunity | `5.9/10` |
| Target contract fit | `7.2/10` |
| Target-video object-track fit | `4.7/10` |
| Best reference | `challenge-3-arrival-group-1` |

Target state:

- This should become a boss-led or new-family challenge with visibly different motion from Challenges 1 and 2.
- It should make specialty alien identity and active animation obvious.

Current Aurora state:

- This is currently one of the better measured stages: strict `4.4/10`, target contract `7.2/10`, target-video fit `4.7/10`.
- The dragonfly/boss-led identity lands on the expected reference family.

Differences and conformance gap:

- The stage still gets only `3.9/10` novelty because alien and animation evidence is too label-based.
- The target phase timing is not yet strong enough to claim real Galaga-like motion.

Most specific work to improve:

1. Promote Challenge 3 boss-led frame labels and active sprite-motion targets.
2. Add direct scoring for flap, pulse, and path-pose phase order during the stage.
3. Build a target/current video review pair that highlights the boss-led entry and exit rhythm.
4. Tune lower-field score lanes so a skilled persona has a clearer perfect route.
5. Convert the current high target-contract fit into a runtime keeper only after target-video and human-visible gates improve together.

### Challenge 4 / Internal Stage Marker 15

Current score: `4.2/10`

| Axis | Current |
| --- | ---: |
| Movement | `4.3/10` |
| Graphics | `4.6/10` |
| Novelty | `3.9/10` |
| Shot opportunity | `5.2/10` |
| Target contract fit | `4.4/10` |
| Target-video object-track fit | `3.4/10` |
| Best reference | `challenge-4-pink-serpentine-group-1` |

Target state:

- This should be the first clearly late-stage feeling challenge: specialty serpentine arcs, more memorable path shape, and stronger color/family identity.

Current Aurora state:

- The stage is correctly named around pink-serpentine identity, but the measured contract fit is only `4.4/10`.
- Candidate search had many attempts but no safe runtime keeper; prior evidence showed proxy gains that did not translate into target-video or human-visible gains.

Differences and conformance gap:

- The labels say "serpentine"; the current object tracks do not yet prove the target's serpentine motion.
- Shot opportunity dropped to `5.2/10`, which means late complexity may be reducing fair perfect-score potential.

Most specific work to improve:

1. Promote exact five-group labels for Challenge 4 before another runtime tuning pass.
2. Build a true serpentine primitive with documented arc width, drop depth, and exit side rather than parameter-tweaking the current path.
3. Add high-bonus readability scoring so serpentine complexity stays playable.
4. Compare Aurora object tracks against target-video object tracks at group level, not only stage average.
5. Keep this out of runtime promotion until target-video and human-visible scores both improve.

### Challenge 5 / Internal Stage Marker 19

Current score: `4.4/10`

| Axis | Current |
| --- | ---: |
| Movement | `4.6/10` |
| Graphics | `4.7/10` |
| Novelty | `3.9/10` |
| Shot opportunity | `5.2/10` |
| Target contract fit | `3.9/10` |
| Target-video object-track fit | `2.7/10` |
| Best reference | `challenge-5-pink-green-cascade-group-2` |

Target state:

- This should distinguish itself with pink/green cascade motion, alternating group identity, and a more memorable lower-field pass.

Current Aurora state:

- Movement and graphics are slightly higher than the average, but target contract and target-video fit are poor.
- Earlier candidate evidence suggested human-perfect potential could improve, but human-visible readability got worse.

Differences and conformance gap:

- This is the clearest example of the "wrong metric can improve" problem: scoreability can rise while visible conformance falls.
- The current target-video fit of `2.7/10` is too low for gameplay promotion.

Most specific work to improve:

1. Separate scoreability optimization from conformance promotion in the sweep output.
2. Add exact cascade group labels from the target video: group order, alternating family, entry side, exit side, and lower-field band.
3. Add spacing-aware candidate generation so improvements do not become clumped visual noise.
4. Add specialty alien crop and motion targets for the pink/green family.
5. Do not tune runtime until the scorer can explain why target-video fit is so low.

### Challenge 6 / Internal Stage Marker 23

Current score: `4.2/10`

| Axis | Current |
| --- | ---: |
| Movement | `4.3/10` |
| Graphics | `4.5/10` |
| Novelty | `3.9/10` |
| Shot opportunity | `5.5/10` |
| Target contract fit | `4.6/10` |
| Target-video object-track fit | `3.6/10` |
| Best reference | `challenge-6-green-ladder-split-group-1` |

Target state:

- This should emphasize green ladder rhythm and split exits with staggered group timing that a player can read.

Current Aurora state:

- The stage lands on the expected broad reference family, but target contract fit and target-video fit are still low.
- Human-perfect and human-visible sweep scoring are not yet available for the late stages, making this hard to promote safely.

Differences and conformance gap:

- The broad family is present, but ladder rung timing, split exits, and group separation are not precise enough.
- Late-stage evidence is less complete than the first five.

Most specific work to improve:

1. Add human-perfect and human-visible probes for Challenge 6.
2. Label target ladder rungs and split-exit sides at group level.
3. Add a reusable ladder/split primitive for future Aurora variants and other games.
4. Produce synchronized target/current video for the full challenge window.
5. Only then run candidate sweeps with a promotion gate that includes staggered spacing and split-route readability.

### Challenge 7 / Internal Stage Marker 27

Current score: `4.3/10`

| Axis | Current |
| --- | ---: |
| Movement | `4.5/10` |
| Graphics | `4.7/10` |
| Novelty | `3.9/10` |
| Shot opportunity | `5.1/10` |
| Target contract fit | `4.2/10` |
| Target-video object-track fit | `3.2/10` |
| Best reference | `challenge-7-yellow-diagonal-fan-group-5` |

Target state:

- This should be a yellow diagonal fan with an obvious diagonal scoring lane and a distinct late-stage identity.

Current Aurora state:

- Movement and graphics are moderate, but the target contract fit is weak.
- The best reference is a later group in the right family, which suggests partial identity but not full group-order fidelity.

Differences and conformance gap:

- The target shape is only partially recognized; current scoring opportunities are not clearly aligned to the diagonal fan.
- The shot-opportunity score is the lowest of the eight at `5.1/10`.

Most specific work to improve:

1. Add a diagonal-lane shot-opportunity probe instead of treating center-lane waiting as sufficient.
2. Label all five target groups and require group-order match, not just broad family match.
3. Add a diagonal fan primitive with explicit lane angle, group spacing, and exit timing.
4. Add human-visible scoring for late stages before accepting runtime changes.
5. Raise target contract fit before optimizing local gameplay feel.

### Challenge 8 / Internal Stage Marker 31

Current score: `4.4/10`

| Axis | Current |
| --- | ---: |
| Movement | `4.5/10` |
| Graphics | `4.7/10` |
| Novelty | `3.9/10` |
| Shot opportunity | `5.5/10` |
| Target contract fit | `4.2/10` |
| Target-video object-track fit | `3.1/10` |
| Best reference | `challenge-8-blue-purple-finale-group-4` |

Target state:

- This should act as a compact late-loop capstone with blue/purple identity, stronger spectacle, and no return to early-stage vocabulary.

Current Aurora state:

- The runtime has a named blue/purple finale contract, but the target contract fit is low.
- Candidate search found expected-score lifts, but target-video fit could regress, so the current scorer is not safe enough for promotion.

Differences and conformance gap:

- The broad late-loop idea exists, but target-video fit is only `3.1/10`.
- This stage needs both better target labels and a stronger path-shape candidate strategy.

Most specific work to improve:

1. Resolve the expected-score versus target-video-fit conflict in the candidate scorer.
2. Add direct target object labels for all five groups before another runtime sweep.
3. Broaden candidate strategy with new path-shape constants instead of only arc/drop retuning.
4. Add active blue/purple specialty sprite-motion evidence.
5. Keep this as a later-stage capstone work item until the first five challenges have visible wins.

## Recommended Order Of Work

1. Regenerate and preserve challenge-stage conformance artifacts after every runtime challenge change.
2. Fix public naming to distinguish regular stages from challenge windows while preserving internal markers.
3. Promote Challenge 1 five-group labels and synchronized target/current video.
4. Use the improved Challenge 2 identity as the first near-term gameplay target: tighten cross-sweep path precision and active graphics.
5. Promote Challenge 3 boss-led active-motion labels and score them as animation, not labels.
6. Add human-perfect and human-visible gates to Challenges 6-8 before tuning those late stages.
7. Split candidate scores into player-scoreability, target-video fit, and human-visible readability so the optimizer cannot hide regressions.
8. Add spacing/bunching and magic-appearance penalties into strict conformance.
9. Build reusable path primitives: peel, cross-sweep, boss-led hook, serpentine, cascade, ladder/split, diagonal fan, and finale loop.
10. Use the first five challenges as the quality proving ground; generalize the movement grammar to later challenges only after at least one early challenge reaches a visible `5.0+` strict score without safety regression.

## Success Criteria For The Next Major Lift

- Raise strict challenge-stage conformance from `4.3/10` to at least `5.0/10` by making one early challenge visibly target-like.
- Raise target-video object-track fit from `3.6/10` to at least `4.5/10` without lowering safety.
- Raise alien/stage novelty from `3.9/10` by scoring actual active sprite motion and specialty alien phases.
- Preserve `10/10` safety: no enemy shots, no attack starts, no ship losses.
- Produce target/current synchronized clips and contact sheets for every promoted gameplay change.
- Promote no candidate unless it passes target-video, human-visible, human-perfect, spacing, and identity gates together.
