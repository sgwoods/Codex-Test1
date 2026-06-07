# Aurora Urgent Gameplay Planning Handoff

Generated: 2026-06-07

Use this file as the human-readable handoff for the next Codex session. The
next session should begin with a long planning cycle before more implementation.
The goal is to urgently improve Aurora Galactica gameplay characteristics while
preserving the strong measurement and release discipline built so far.

## Current Repo State

- Repo: `/Users/sgwoods/Development/Codex/Codex-test1`
- Branch: `codex/aurora-challenge-movement-grammar`
- HEAD: `889fc7e5c` `Measure reference-spline spacing tradeoff`
- Upstream: `origin/codex/aurora-challenge-movement-grammar`
- Worktree at checkpoint time: clean before checkpoint files were written
- Machine: `macbook-pro` / `MacBook-Pro`
- Release authority: claimed on this MacBook, but do not publish from a topic
  branch without an explicit release step
- Local game: `http://localhost:8000/`
- Local viewer: `http://localhost:4311/api/runs`

## Published Lane Snapshot

From `npm run machine:status` on 2026-06-07:

- Hosted dev: `1.4.0.1+build.1013.sha.3cb0d08b`
- Hosted beta: `1.4.0-beta.1+build.1013.sha.3cb0d08b.beta`
- Hosted production: `1.4.0+build.894.sha.1dc23d8a`

This branch is not a hosted release. Treat it as an active quality and
measurement branch unless explicitly merged and prepared through the release
path.

## Overall Project Assessment

Platinum and Aurora have made a major shift from hand-tuned browser game work
into a measured conformance project:

- The ingestion and reference-artifact system now has media-backed challenge
  labels, movement grammar artifacts, application artifact conformance, sprite
  and motion target evidence, audio evidence, dashboards, and release-visible
  documentation.
- The platform has meaningful game-selection, personas, watch modes, score and
  replay surfaces, arcade music, docs surfaces, and release-lane tooling.
- The harness is now strong enough to stop bad promotions. That is important:
  several candidates looked better on one axis but were correctly blocked
  because they damaged expected stage identity, visual presence, or perfect
  scoreability.
- The project is not yet getting enough user-visible gameplay quality from each
  compute cycle. The next urgent improvement is strategic: design better
  movement grammar and stage-construction primitives before another broad sweep.

## Current Gameplay Quality Read

The weakest active gameplay area remains Aurora's challenging stages and
challenge set pieces. Current challenge-stage conformance from
`reference-artifacts/analyses/challenge-stage-conformance/latest.json`:

- Overall challenge score: `4.3/10`
- Interesting factor: `4.3/10`
- Movement conformance: `4.4/10`
- Graphical conformance: `4.5/10`
- Alien novelty: `3.9/10`
- Progression conformance: `3.0/10`
- Player shot opportunity: `5.5/10`
- Target contract fit: `5.2/10`
- Target-video object-track fit: `3.6/10`
- Target-track readiness: `8.6/10`
- Sprite motion correspondence: `6.18/10`
- Safety rule score: `10/10`

Interpretation:

- Safety is good: challenge stages preserve the no-shot/no-ship-loss rule.
- Spectacle is not good enough: movement, graphical identity, novelty, and
  target-video fit are still weak.
- The stage experiences are not yet credible enough as Galaga-like bonus
  exhibitions, even when they are technically safe.

## Current Artifact Quality Read

From `reference-artifacts/analyses/application-artifact-conformance/latest.json`:

- Application artifact average: `7.75/10`
- Sprite catalog proxy: `6.22/10`
- Runtime canvas sprite score: `6.21/10`
- Runtime vs promoted target crops: `5.97/10`
- Sprite motion correspondence: `6.18/10`
- Impact/explosion visual feedback: `5.85/10`
- Audio cue assets: about `7.3/10`
- Visual/background/starfield: about `8.62/10`
- Frame/popups/icons: about `9.2/10`

Interpretation:

- The shell and platform presentation are stronger than the core arcade
  gameplay fidelity.
- Sprites, explosions, and challenge-stage motion remain major user-visible
  gaps.
- A future beta push should not be justified by process improvements alone. It
  should include a clear, playable improvement in challenge motion or another
  high-impact user-facing area.

## Latest Branch Work

Recent commits on `codex/aurora-challenge-movement-grammar`:

- `889fc7e5c` `Measure reference-spline spacing tradeoff`
- `79c68a863` `Add measured challenge spacing-field primitive`
- `f16820840` `Add challenge lead-in primitive evidence loop`
- `ca2a74eaf` `Add challenge candidate visual presence guardrails`
- `fa1591b1e` `Calibrate challenge candidate trial rejection`
- `e43ff631a` `Add challenge movement grammar diagnostics`

This work improved the measurement framework more than the game. That is still
valuable, but it is not enough for the next user-visible quality step.

## Latest Measured Findings

From `reference-artifacts/analyses/challenge-stage-candidate-sweep/latest.json`:

- Stage tested in the latest focused sweep: stage marker `7`, wording should be
  treated as `Challenging Stage 7-8`
- Candidate count: `2565`
- Best safe candidate: `stage7-centerline-spacing-spread-left-right-lead078-flat-widefield-centered-id-sd018`
- Keeper decision: `no-runtime-keeper-yet`
- Expected-label lift: `0`
- Target-video object-fit lift: `+0.3/10`
- Human-perfect lift: `0`
- Human-visible lift: `+2.3/10`

Why it was blocked:

- Human-visible guardrails still fail due to spacing/bunching.
- It does not clear the latest rejected full-analyzer calibration.
- It lacks material expected-label or target-video lift.

From `reference-artifacts/analyses/challenge-motion-primitives/latest.json`:

- First build target: `reference-spline-fit`
- Centerline spacing process win:
  - Candidate: `stage7-centerline-spacing-spread-left-right-lead078-flat-readablefield-refwide-fan-sd014`
  - Human-visible readability: `7.9/10`
  - Bunching risk: `0.600`
  - Spacing score: `0.507`
  - Magic appearance risk: `0.072`
  - Not runtime-ready because target-video fit is only `4.0/10` and
    expected-label lift is not material.
- Reference-spline plus spacing target-fit signal:
  - Candidate: `stage7-target-reference-paths-spacing-source-direct-widefield-refwide-p0`
  - Target-video fit: `4.7/10`
  - Target-video lift: `+0.8/10`
  - Human-visible readability: `8.6/10`
  - Expected-label lift: `-0.4/10`
  - Human-perfect lift: `-0.5/10`
  - Visual-presence pass: false
  - Not runtime-ready.

Interpretation:

- We can reduce magic appearance and improve formation readability.
- We can use reference paths to improve target-video fit.
- We cannot yet combine those improvements without damaging expected identity,
  visual presence, or human-perfect scoreability.

## What Worked

- Measured reference analysis is paying off. The harness now distinguishes
  between safe-looking and actually promotable candidates.
- The primitive vocabulary is becoming reusable: lead-in continuity, group
  spacing field, reference spline fit, phase-order scheduler, lower-field
  scoreable pass, exit continuity, and persona perfect-route probe.
- The latest diagnostic split keeps centerline spacing and reference-spline
  composition separate, which prevents misleading averages.
- The project has enough artifacts to support a serious planning pass without
  relying on taste alone.

## What Failed Or Underperformed

- Broad parameter sweeps are finding process signals but not runtime keepers.
- Current challenge-stage construction is probably too indirect: too many knobs
  are trying to approximate authored group choreography after the fact.
- Visual presence, expected-label identity, and perfect-route potential are not
  being co-optimized yet.
- The game still needs a step-change in player experience, not just more
  confidence that the current weak shape is measured accurately.

## Strategic Reassessment

The next session should avoid immediately widening the candidate sweep. The
problem is likely structural:

- Aurora needs a clearer movement grammar abstraction for authored swarm
  choreography.
- Challenge stages and main-level entry behaviors should share the same
  vocabulary: group centerline, member offsets, phase schedule, scoreable
  windows, entry continuity, exit continuity, family novelty, and target pose
  cadence.
- Ingestion should produce these primitives directly from video/reference
  artifacts where possible.
- The runtime should express challenge stages as data-driven set pieces rather
  than scattered tuning constants.

The desired planning output is a concrete design for the next implementation
pass that can improve gameplay, not just scoring metadata.

## Recommended First Planning Cycle

Before editing code, the next session should answer:

1. What is the smallest movement grammar change that can combine reference
   target fit with visual presence and scoreability?
2. Should the next implementation be a phase-order scheduler, a normalized
   reference-path player, or a scoreable-window contract?
3. What must the acceptance gates be so a cleaner-looking candidate does not
   become a worse game?
4. What side-by-side visual or video artifact will let a human see the intended
   improvement?
5. How will the same primitive generalize to main-level alien entry and Galaxy
   Guardians later?

## Recommended Next 20 Steps

1. Read this file, `CODEX_CONTEXT_CHECKPOINT.md`, `CHALLENGE_STAGE_BASELINE_GAP_AND_WORK_PLAN.md`, and the latest challenge artifacts.
2. Review the current challenge-stage runtime construction in `src/js/09-stage-flow.js`, `src/js/06-enemy-behavior.js`, and `src/js/13-aurora-game-pack.js`.
3. Draw the current data flow from ingested reference video to runtime movement.
4. Identify exactly where target reference paths lose visual presence and human-perfect route potential.
5. Define a normalized reference-path player spec: path points, scale, offset, duration, easing, phase, and exit policy.
6. Define a phase-order scheduler spec: group order, group overlap, scoreable dwell, and safe exit.
7. Define scoreable-window contracts for challenge stages: player-visible shot windows, lower-field dwell, and professional persona route expectations.
8. Add or update a planning artifact that explains the movement grammar data model before implementation.
9. Implement the smallest scoreable phase-order constraint around the best Stage 7-8 reference-spline family.
10. Rerun the Stage 7-8 candidate sweep and require target-video lift >= `+0.55/10`.
11. Require expected-label regression no worse than `-0.15/10`.
12. Require no human-perfect potential regression.
13. Require visual-presence guard pass.
14. Generate side-by-side visual/video evidence for baseline, centerline-spacing, and reference-spline phase-order candidates.
15. If Stage 7-8 still has no keeper, create a smaller hand-authored candidate family instead of broadening the sweep.
16. Once Stage 7-8 has a keeper, run the full challenge-stage conformance analyzer.
17. Apply the same grammar to Challenging Stage 3-4 as the earliest player-facing bonus-stage example.
18. Update public documentation with the new evidence and a plain-language gameplay impact read.
19. Re-score quality/conformance and compare compute investment versus gameplay lift.
20. Decide whether the branch is ready to merge toward a dev/beta candidate or needs one more focused pass.

## Acceptance Standard For The Next Gameplay Improvement

A candidate is not good enough merely because it looks less cluttered.

Accept only if it:

- improves target-video object fit materially,
- preserves expected challenge identity,
- passes visual-presence guardrails,
- preserves or improves human-perfect route potential,
- preserves challenge-stage safety,
- produces a human-visible gameplay improvement in screenshots or video,
- and updates durable ingestion/harness/docs artifacts.

## Exact New Session Prompt

Use this prompt when starting the fresh Codex session:

```text
You are continuing Aurora Galactica / Platinum work in:

/Users/sgwoods/Development/Codex/Codex-test1

This is now a planning-first session. Start by running:

git branch --show-current
git status --short
git log -8 --oneline --decorate
npm run machine:status

Read first:
- CODEX_CONTEXT_CHECKPOINT.md
- AURORA_URGENT_GAMEPLAY_PLANNING_HANDOFF_2026-06-07.md
- CHALLENGE_STAGE_BASELINE_GAP_AND_WORK_PLAN.md
- reference-artifacts/analyses/challenge-motion-primitives/latest.json
- reference-artifacts/analyses/challenge-stage-candidate-sweep/latest.json
- reference-artifacts/analyses/challenge-stage-candidate-sweep-index/latest.json
- reference-artifacts/analyses/challenge-stage-conformance/latest.json

Current branch:
codex/aurora-challenge-movement-grammar

Current HEAD:
889fc7e5c Measure reference-spline spacing tradeoff

Begin with a long planning cycle to determine how to urgently improve Aurora
gameplay characteristics, especially challenge-stage swarm movement, visual
presence, scoreability, and Galaga-like challenge-stage spectacle. Do not start
by widening the sweep. First design the next movement grammar improvement that
can preserve target-video fit, expected-label identity, visual presence, and
human-perfect potential together.

After the planning pass, implement the smallest coherent next step, verify it
with the challenge-stage harnesses and build, then summarize what improved,
what failed, and the updated next plan.
```

