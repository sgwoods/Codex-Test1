# Aurora Galactica Plan

## Current State

Verified June 7, 2026:

- hosted `/dev`
  - active `1.4.0.1` forward-review line; exact current build label is
    authoritative in hosted `build-info.json`
- hosted `/beta`
  - active `1.4.0-beta.1` reviewed candidate lane
- hosted `/production`
  - stable `1.4.0` public line
- `main`
  - authoritative integration branch for the live `1.4.0` follow-through line,
    including the consolidated Aurora challenge grammar and Guardians
    ingestion/conformance cleanup work

This means:

- the `1.4.0` multi-game release is now the public production family
- hosted `/dev` and hosted `/beta` remain the next deliberate review lanes
  rather than shadow production mirrors
- the active source-planning question is now "what is the cleanest next
  follow-through bundle after `1.4.0`?" rather than "is `1.4.0` ready to ship?"
- the post-`1.4.0` work should be treated as intentional carry-forward and
  release-quality tightening, not as rediscovery of the shipped baseline
- the white paper and preserved-source recovery work are now part of the
  maintained release/documentation posture, but they are not yet fully
  published on every hosted lane

Top-level program framing is now maintained in
[PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md](PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md).
Use it as the first read for how Platinum, Aurora, Galaxy Guardians, ingestion,
harnesses, dashboards, release lanes, Codex/model assistance, and local
resource economics fit together.

For the fastest quick current-state reopen, start with
[CURRENT_PROJECT_STATE.md](CURRENT_PROJECT_STATE.md). Older reopen notes such
as [DEVELOPMENT_STATUS_UPDATE.md](DEVELOPMENT_STATUS_UPDATE.md) are historical
snapshots unless explicitly refreshed.

The current cross-thread work ordering is maintained in
[PROJECT_WIDE_WORKSTREAM_ALIGNMENT_2026-06-07.md](PROJECT_WIDE_WORKSTREAM_ALIGNMENT_2026-06-07.md).
Use that note before choosing new work so Aurora challenge-stage improvement,
Galaxy Guardians v1, shared personas/Watch/Rival, ingestion grammar, platform
boundaries, and release documentation stay aligned.

The current release-family and issue-tracking spine is maintained in
[RELEASE_SCHEDULE_AND_ISSUE_SPINE_2026-06-07.md](RELEASE_SCHEDULE_AND_ISSUE_SPINE_2026-06-07.md).
Use it to decide whether a branch belongs to `1.4.1`, `1.4.2`, `1.5.0`,
`1.6.0`, `1.7.0`, or `2.0.0`, and to keep GitHub issues from drifting away
from the roadmap.

## Active Workstreams

### 1. `1.4.0` Production Stabilization

- keep the shipped `1.4.0` production line trustworthy
- keep release docs, scorecards, and committed evidence current
- keep the public project surfaces in sync with the real shipped state
- use [CONFORMANCE_METRICS_OVERVIEW.md](CONFORMANCE_METRICS_OVERVIEW.md) as the
  readable current quality map before choosing beta-shaping work

### 2. Multi-Machine Release Discipline

- make new-machine bring-up one practical bootstrap command
- keep a committed one-authority release model
- keep beta and production promotion blocked unless the authority contract is
  satisfied
- keep public project-page and rendered-homepage verification inside the
  release workflow

### 3. Post-`1.4.0` Follow-Through Improvement

- improve ship movement feel against real Galaga footage
- continue audio identity polish beyond cue timing
- keep reference-video extraction and correspondence work growing in a durable
  way

### 3a. Level-By-Level Arcade Depth

- expand Aurora stage progression beyond the current early-stage emphasis
- make challenging stages richer with new alien types, movement families, and
  challenge patterns
- use original Galaga reference evidence to shape later-level entry styles,
  attack pacing, and movement variation

### 3b. Conformance Program And Ingestion System

- keep conformance as its own project layer, not only as Aurora polish
- use ingestion packages as the evidence front-end for both Aurora refinements
  and future games
- keep metrics, confidence, resolution, dashboards, and economics current after
  each meaningful work cycle
- convert Codex/model-assisted analysis into durable local harnesses, scorers,
  reports, and platform capabilities whenever possible
- prefer local CPU/browser sweeps for repeated measurement and use
  GPU-equivalent model effort where it increases leverage

### 4. Gameplay Trust And Edge-Case Correctness

- continue addressing boss/capture/carry edge cases
- continue runtime-hardening follow-up where exact root causes are still being
  narrowed
- keep replay and late-run trust issues visible until closed

### 5. Shell, Overlay, And Pilot-Surface Polish

- keep popup, dock, and panel presentation unified and contained
- improve pilot, leaderboard, and replay surfaces where they are still rough
- keep production-safe defaults and developer restrictions disciplined

### 5a. Immersive Full-Window Gameplay Mode

- plan an optional hidden/developer display mode that lets the active game board
  use the full available browser window for a stronger cabinet-like play
  experience
- keep the first prototype behind an `F` keyboard shortcut and/or Developer
  Tools toggle, with `Escape`/`F` as the clear exit path
- preserve logical gameplay coordinates, input mapping, replay determinism,
  scoring, and game-pack boundaries while scaling the board
- treat this as Platinum-owned display/cabinet capability, not Aurora-specific
  gameplay logic
- track the detailed plan in
  [IMMERSIVE_FULL_WINDOW_GAMEPLAY_MODE_PLAN.md](IMMERSIVE_FULL_WINDOW_GAMEPLAY_MODE_PLAN.md)

### 5b. Shared Video Evidence

- make exported gameplay videos publishable to a shared catalog or repository
- connect videos to issues, score records, release review, and player-facing
  history
- use shared videos as durable reference material between users and machines

### 6. Platform Boundary Cleanup

- keep pack contract thinking explicit
- reduce remaining Aurora-shaped platform residue
- improve the storage and schema seam before a second real playable game
- keep shared-service access contracts explicit, including Supabase Data API
  grants/RLS for profile and leaderboard tables
- separate overall, platform, and per-game version tracking so release identity
  does not collapse into one number
- keep platform, application, and integrated-bundle candidate paths distinct so
  unrelated work does not cause avoidable regressions

### 7. Second-Application Proof

- promote `Galaxy Guardians` from preview-only framing into a minimally
  complete one-level playable game on the dedicated post-production branch
  [GALAXY_GUARDIANS_PLAYABLE_0_1_BRANCH_PLAN.md](GALAXY_GUARDIANS_PLAYABLE_0_1_BRANCH_PLAN.md)
- keep the broader Galaxy first-class conformance target readable through
  [GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md](GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md),
  so ingestion, gameplay completeness, and release review do not drift apart
- keep the new longer-surface and persona review model readable through
  [GALAXY_GUARDIANS_LONG_SURFACE_AND_PERSONA_PLAN.md](GALAXY_GUARDIANS_LONG_SURFACE_AND_PERSONA_PLAN.md),
  so Guardians can be judged internally by real repeated-rack stage bands
  while live dev/beta stay honestly framed as a one-level public slice until
  that deeper surface is actually productized
- keep the maintained game-arc and homage-variant grammar readable through
  [GALAXY_GUARDIANS_STAGE_ARC_AND_HOMAGE_PLAN.md](GALAXY_GUARDIANS_STAGE_ARC_AND_HOMAGE_PLAN.md),
  so stage-by-stage conformance work and later homage variants grow from one
  preserved source-grounded shape instead of ad hoc tuning
- keep the opening-slice baseline readable through
  [GALAXY_GUARDIANS_OPENING_SLICE_BASELINE.md](GALAXY_GUARDIANS_OPENING_SLICE_BASELINE.md),
  so the visible `WAIT` / score-table / ready-state work is readable in hosted
  docs and not only as raw manifests, contact sheets, or runtime notes
- keep the short restart note readable through
  [GALAXY_GUARDIANS_RESUME_STATE_AND_NEXT_STEPS.md](GALAXY_GUARDIANS_RESUME_STATE_AND_NEXT_STEPS.md),
  so the current checked state and next work order are easy to reopen without
  reconstructing context from the longer strategy stack
- treat the obvious current one-level baseline misses as first-class work:
  `WAIT`/headline treatment, score-advance table, rack march cadence,
  explosion states, swarm palettes, moving starfield motion, missile-ready
  ship state, reserve ships, stage-flag graphics, and bottom-pass-through
  re-entry from the top instead of simple pop-in return
- make Guardians sit in the full Platinum frame with parity to Aurora for
  sign-in, high scores, pilot card, replay/video capture, bug reports, and
  music/sound-control surfaces so platform capability work is validated against
  two games, not one
- after the incoming ship-sizing merge, treat Aurora's upgraded
  graphics/audio/reference machinery as shared infrastructure for Guardians;
  reuse the existing target-promotion, contamination-guard, temporal-sequence,
  cue-window, waveform/spectrogram, dashboard, and review flows unless
  Guardians truly requires a different contract
- actively advance the longer-range `Galaxian`-style ingestion path through
  durable reference analysis, platform extension planning, and the other
  machine's parallel work
- bring a preliminary second-game Platinum sneak peek forward before the full
  multi-game release so the platform layer is tested by real product pressure
- treat the long-term target as a game-owned ingestible package built from
  gameplay-video and reference-artifact analysis, not a Platinum-only special
  case or a human-first tuning exercise
- keep a standing aggregate Galaxy process gate so the evidence stack, docs,
  and harness family stay in sync:
  `npm run harness:check:galaxy-guardians-first-class-conformance`

### 8. Personas And Simulated Opponents

- deepen action/event annotation so personas can become richer
- prepare for future player-versus-persona experiences
- keep "learn by playing" persona ideas tied to simulation and durable logs,
  not just aspiration

## Immediate Priorities

1. treat `main` as the authoritative post-production integration line
2. use
   [PROJECT_WIDE_WORKSTREAM_ALIGNMENT_2026-06-07.md](PROJECT_WIDE_WORKSTREAM_ALIGNMENT_2026-06-07.md)
   as the first work-selection read after the hosted `/dev` publish
3. use
   [RELEASE_SCHEDULE_AND_ISSUE_SPINE_2026-06-07.md](RELEASE_SCHEDULE_AND_ISSUE_SPINE_2026-06-07.md)
   to assign each active branch and issue family to the right release lane
4. keep the multi-machine bootstrap, release-authority workflow, and
   machine-allocation model healthy: MacBook M4 for high-feedback gameplay,
   platform, and integration work; iMac M1 for always-on separable ingestion,
   persona/watch, Guardians evidence, portability, and issue-hygiene branches
5. keep hosted `/dev` available for the next coherent review bundle instead of
   using it as a casual mirror of `main`
6. attack Aurora challenge-stage runtime quality first, but keep Stage 7 source
   edits behind the stricter semantic gate. Stage 7 and Stage 11 now expose
   runtime contract groups, and Stage 7's live wave path-family order matches
   its restored declared target contract, but the reference execution
   description/setpiece measured-intent order does not yet match the live
   promotion gates. The remaining `4.3/10` challenge-stage score gap is visible
   movement/readability, especially Stage 7 object-track fit: lower path-length
   mismatch, reduce lower-field overstay on the first groups, and sharpen the
   late boss-led loop while preserving contract-order and spacing guards. The
   first semantic runtime projection, `stage7-semantic-phase-align-protect-0.1`,
   was tried and rejected: actual browser runtime stayed at object-track
   `4.7/10` and coverage `0.503` while
   `harness:check:challenge-motion-profile` caught target-order drift during
   the applied candidate. No further Stage 7 runtime candidate is currently
   source-ready. The current path-family authority decision keeps live
   promotion gates/restored runtime source as source-ready authority, with
   RED/setpiece retained as measured-reference intent and explicit authority
   debt. `phase-duration-rebalance` now emits consumed
   `compiledRuntimeControls` under live authority and has browser-visible
   proof. The protected compiler declares intended groups, excludes groups 4
   and 5 unless explicitly opted in, and the candidate-specific proof preserves
   protected group 4/5 timing. It is still not source-ready: the constrained
   proof fails the focused motion/profile proxy on spacing/readability
   (`spacingScore` `0.64` below the `0.72` floor and `bunchingRisk` `0.387`
   above the `0.38` cap). Lower-field overstay reduction now has its single
   allowed browser transfer proof; the generated `lowerFieldBias` / `yOffset`
   controls are consumed, but group 2 lower-field share held at `0.6667`
   instead of moving toward `0.4522`, and the proof failed the motion/profile
   plus spacing/readability guards. Group 1 path-length compression remains
   analysis-only with no browser transfer proof. Do not keep grinding Stage 7
   candidates; pause Stage 7 candidate work and apply the RED pipeline
   front-first to Stage 3 / Challenge 1. Stage 3 now has a RED language pilot:
   `aurora-stage3-challenge1-0.1.json` plus
   `harness:check:stage3-reference-execution-description`. It captures the
   top-right bee line, late top-left butterfly line, upper-band score windows,
   peel-off exits, no-combat grammar, path-family ordering, object-track
   targets, field-occupancy tension, and field-level provenance. The adequacy
   report scores `0.704`. The next non-overwriting Stage 3 candidate-trial
   gate now exists at
   `reference-artifacts/analyses/reference-execution-candidate-trials/stage3-challenge1/latest.json`:
   it accepts the baseline-control candidate as a process keeper, preserves
   no-combat/scoreable-route/spacing guardrails, reports semantic score
   `0.918`, object-track `3.2/10`, `5/5` strict weak rows, `4` human-vs-CPU
   field-occupancy conflicts, and `4` target-vs-runtime authority conflicts.
   The next Stage 3 step is a non-overwriting semantic candidate batch against
   this gate, not a runtime source candidate. That first semantic batch now
   exists and generated `10` named candidates. The ranking calibration now
   separates strict object-track, path shape, path-length sanity, peel
   readability, semantic roles, scoreability, route learnability, no-combat
   grammar, spacing/readability, authority conflicts, and human-vs-CPU field
   tension. The old geometry-heavy
   `stage3-semantic-direct-lines-red-target-probe-0.1` is now a
   `metric-only-probe`, while
   `stage3-semantic-direct-lines-shape-peel-0.1` is the top
   `player-visible-semantic-lift`. The fresh out-of-sample batch then
   generated `10` new named candidates, preserved the geometry-only
   `metric-only-probe` classification, increased player-visible semantic lifts
   from `3` to `7`, and selected
   `stage3-semantic-fresh-g4-score-window-shape-peel-0.1` as the smallest
   later browser transfer-proof target. That one browser transfer proof now
   exists at
   `reference-artifacts/analyses/reference-execution-runtime-expressibility/stage3-challenge1/latest-transfer-proof.json`.
   It confirms consumed, visible group 4 movement through
   `motionSpecGroups[3].controls.pathPlaybackScale`,
   `motionSpecGroups[3].controls.routeCurveY`, and
   `motionSpecGroups[3].controls.routeOffsetX`: the group 4 exit read moves
   from `center` to `right`, path length drops from `1.5589` to `1.1897`,
   upper-band share improves from `0.775` to `0.9474`, protected groups pass,
   and motion/profile, spacing, scoreable-route, no-combat, and
   no-shot/no-attack/no-loss guardrails pass. The proof is now
   `runtime-source-attempt-ready` only, not a runtime keeper or beta
   justification. That exact minimal runtime source attempt is now complete and
   accepted as a `dev-visible-gameplay-keeper`, with evidence at
   `reference-artifacts/analyses/reference-execution-source-attempts/stage3-challenge1/latest-source-attempt.json`.
   The kept source controls are `pathPlaybackScale: 0.5`, `routeCurveY: 17.464`,
   and `routeOffsetX: 60` on Stage 3 group 4 only. Source evidence reproduced
   the proof read: group 4 exit `center` -> `right`, path length `1.5589` ->
   `1.1897`, upper-band share `0.775` -> `0.9474`, protected groups preserved,
   and motion/profile, spacing, scoreable-route, no-combat, zero-shot,
   zero-attack, zero-ship-loss, and zero-challenge-contact guardrails passed.
   The next group 1 fast-lane probe was blocked rather than kept: group-level
   controls could improve a top-right read or preserve the group 4 keeper, but
   not both with clean semantic/spacing evidence. The next successful fast-lane
   source attempt targeted Stage 3 group 5 late line / peel readability and is
   accepted as another `dev-visible-gameplay-keeper`, with evidence at
   `reference-artifacts/analyses/reference-execution-source-attempts/stage3-challenge1/group5-fast-lane/latest-group5-fast-lane.json`.
   The kept group 5 controls are `pathPlaybackScale: 1.18`, `routeCurveY: 12`,
   and `routeOffsetX: 48` on Stage 3 group 5 only. Source evidence reproduced
   the proof read: group 5 exit `center` -> `right`, path length `0.0407` ->
   `0.7949`, upper-band share stayed `1.0`, protected groups 1-4 preserved,
   and motion/profile, spacing, scoreable-route proxy, no-combat, zero-shot,
   zero-attack, zero-ship-loss, and focused zero-challenge-contact guardrails
   passed. These keepers are not beta justification by themselves.
   A follow-up Stage 3 group 2 fast-lane proof was also attempted and blocked
   before source edit, with evidence at
   `reference-artifacts/analyses/reference-execution-source-attempts/stage3-challenge1/group2-fast-lane/latest-group2-fast-lane.json`.
   The best proof, `stage3-g2-column-tighten-0.1`, produced visible group 2
   improvements: x-range `1.0626` -> `1.009`, upper-band share `0.6` ->
   `0.6418`, and lower-field share `0.384` -> `0.3507`. It was rejected as a
   source candidate because group 2 timing drifted by `+0.75s` and protected
   group 4 keeper preservation failed. Blocker classification:
   `guardrail-regression`. Reference-path backing, lane/type-specific phrase
   authoring, and better per-group isolation remain architecture debt; next
   Stage 3 quality work should target a focused player-visible gap with
   before/after source evidence only when protected keepers can remain green.
7. advance Galaxy Guardians toward a real v1 playable slice by tightening the
   opening public slice, score/result/replay identity, and full Platinum frame
   parity before expanding public depth
8. make personas, Watch, and Rival behavior game-generic so Aurora improvements
   can be reused by Guardians and later games
9. prioritize audio/event feedback and stage-shape conformance over more broad
   planning; the planning scaffolding is strong enough, while runtime feel still
   needs a measurable lift
10. incorporate the other machine's Galaxians-style second-game, harness, and
   analysis progress into the main roadmap
11. use the new Guardians playable branch to force score, replay, result, and
   platform validation across two games rather than one
11. keep
   [GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md](GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md)
   and `harness:check:galaxy-guardians-first-class-conformance` healthy so
   Galaxy review discipline approaches Aurora's
12. prioritize level-by-level arcade depth as the next major product pillar,
   using
   [GALAXY_GUARDIANS_STAGE_ARC_AND_HOMAGE_PLAN.md](GALAXY_GUARDIANS_STAGE_ARC_AND_HOMAGE_PLAN.md)
   as the maintained map from opening slice to deeper repeated-rack play and
   future homage variants
13. make shared gameplay-video publishing an early evidence/product capability
14. continue narrow trust fixes from the open issue stream
15. execute the measured Galaga long-cycle quality plan in
   [AURORA_GALAGA_LONG_CYCLE_REVIEW.md](AURORA_GALAGA_LONG_CYCLE_REVIEW.md)
   and the keeper loop in
   [LONG_CYCLE_KEEPER_PROCESS.md](LONG_CYCLE_KEEPER_PROCESS.md) before broad
   gameplay, complexity, or graphical tuning
16. carry
   [IMMERSIVE_FULL_WINDOW_GAMEPLAY_MODE_PLAN.md](IMMERSIVE_FULL_WINDOW_GAMEPLAY_MODE_PLAN.md)
   as a `1.6.0` cabinet-surface feature, allowing an earlier hidden prototype
   only if it preserves input mapping, replay determinism, shell escape paths,
   and game-pack boundaries

Current conformance read:

- hosted `/dev` now includes the consolidated Aurora challenge grammar,
  Guardians ingestion cleanup, refreshed conformance economics, public project
  guide, white paper, slides, dashboards, release-schedule spine, and review
  packet on the `1.4.0.1` forward-review line
- the latest conformance economics roll-up reads `8.7/10` overall with
  `904` measured runs, about `58,277s` wall time, and about `58,392s` CPU time
- application artifact conformance is `7.46/10`; the weakest row is
  `impact-explosion-visual-feedback`, so hit/damage/explosion clarity remains
  a top user-experience target
- dedicated Aurora challenge set-piece conformance remains a high-priority
  gap at `4.3/10` average current score, `4.4/10` movement,
  `4.5/10` graphics, and `3.9/10` novelty. Stage 7 now has a target-contract
  fit of `7.2/10`, with runtime and declared path-family order fit both at
  `1.0`, but its direct Galaga object-track fit is still only `4.7/10`.
- the June 8 Stage 7 object-track keeper cycles rejected all runtime
  candidates rather than promote weak player-visible changes. Earlier narrow
  runtime attempts improved isolated rows but regressed the late boss-led group
  or failed to move the object-track score. The later timing/canonical-label
  candidate improved group 1 from `3.5/10` to `4.2/10` and shot opportunity
  from `5.5/10` to `5.7/10`, but reduced total object-track fit from
  `4.7/10` to `4.6/10`, reduced coverage from `0.503` to `0.482`, dropped
  group 4 from `5.0/10` to `3.8/10`, and slipped group 5 from `4.9/10` to
  `4.8/10`. Safety stayed clean, but the runtime edit was rejected and the
  source was restored. See
  `reference-artifacts/analyses/challenge-stage-conformance/stage7-object-track-keeper-review-2026-06-08.md`
  and
  `reference-artifacts/analyses/challenge-stage-conformance/stage7-timing-canonical-candidate-review-2026-06-08.md`.
- the June 8 Reference Execution Description Pilot created a measurement and
  process keeper, not a runtime keeper: a Stage 7 / Challenge 2 schema,
  description artifact, analyzer, and check:
  `reference-artifacts/ingestion/reference-execution-descriptions/aurora-stage7-challenge2-0.1.json`,
  `reference-artifacts/analyses/reference-execution-description/stage7-challenge2/latest.json`,
  `npm run harness:analyze:reference-execution-description`, and
  `npm run harness:check:reference-execution-description`. The measurement
  keeper is accepted, but it is not beta justification. The tightened pilot
  now separates reference precision, runtime candidate readiness, and runtime
  promotion readiness; the restored baseline is candidate-ready but not
  promotion-ready, with nine promotion blockers. The follow-on non-overwriting
  Stage 7 candidate-trial path is now available:
  `reference-artifacts/ingestion/reference-execution-candidate-trials/README.md`,
  `npm run harness:analyze:stage7-reference-execution-trial`, and
  `npm run harness:check:stage7-reference-execution-trial`. The baseline
  control trial reproduced Stage 7 object-track fit at `4.7/10` and coverage
  `0.503`, then correctly rejected itself with five blockers: no score lift,
  no group 1 lift, and canonical family misses in groups 2, 4, and 5. The
  older description-level "candidate-ready" read is not source-promotion
  authority by itself; use the semantic batch and runtime-calibration gates
  below before any source edit.
- the Stage 7 trial gate now has a semantic candidate-batch compiler/evaluator:
  `reference-artifacts/ingestion/reference-execution-candidate-trials/stage7-semantic-vocabulary-0.1.json`,
  `npm run harness:analyze:stage7-reference-execution-batch`, and
  `npm run harness:check:stage7-reference-execution-batch`. The stricter
  compiler/evaluator now includes truth alignment and runtime-expressibility
  requirements. The earlier June 8 batch recommended
  `stage7-semantic-phase-align-protect-0.1`, but the actual runtime attempt
  rejected it: prediction was object-track `5.0/10`, coverage `0.541`, group 1
  `4.0`, group 4 `5.3`, and group 5 `4.9`; actual browser runtime stayed at
  object-track `4.7/10`, coverage `0.503`, group 1 `3.5`, group 4 `5.0`, and
  group 5 `4.9`. The regenerated batch now recommends
  `no-runtime-source-candidate`. The calibration report is
  `reference-artifacts/analyses/reference-execution-runtime-calibrations/stage7-challenge2/latest-semantic-runtime-calibration.json`.
  It identified two source-promotion blockers at runtime-rejection time:
  Stage 7 path-family order was split between measured reference intent and
  live promotion gates, and phase-duration controls still needed a
  motion/profile-safe proof before promotion. The follow-on
  authority/proof/compiler cycle selected live
  promotion gates/restored runtime source as source-ready authority, made that
  authority split explicit as target-conformance debt, and proved that
  `groupSpawnOffsets` / `motionSpecGroup.spawnOffsetS`,
  `phaseDurations.trackS`, and `referencePath.playbackScale` are consumed
  controls that change browser-visible timing/path behavior. The protected
  compiler now declares intended groups, excludes groups 4 and 5 unless
  explicitly opted in, and emits per-group timing deltas. The
  candidate-specific transfer proof preserves protected group 4/5 timing, but
  still rejects source readiness because the constrained phase-duration
  candidate fails the focused motion/profile proxy on spacing/readability:
  `spacingScore` `0.64` is below the `0.72` floor and `bunchingRisk` `0.387`
  is above the `0.38` cap; `exitS` is explicitly unconsumed. The lower-field
  proof confirms `lowerFieldBias` / `yOffset` controls are consumed, but they
  do not move group 2 lower-field share in the intended direction and remain
  source-ready-blocked by motion/profile and spacing/readability guardrails.
  The semantic batch now emits phase-duration `compiledRuntimeControls` under
  live authority, keeps lower-field analysis-only under current controls, and
  records path-length as analysis-only until its transfer proof exists. This is
  a measurement/process keeper, not a runtime keeper or beta justification.
- challenge-stage grammar is now materially ahead of runtime implementation:
  the first-five challenge work has `25/25` reference-backed group contracts
  and `8.6/10` control readiness, but runtime promotion is still blocked by
  visual-presence, object-track timing/shape, and scoreable-window constraints.
  The Stage 3 RED pilot, non-overwriting candidate-trial gate, and first
  semantic candidate batch are measurement/process keepers. The batch proves
  object-track/path-length and peel-off metrics are responsive, and the
  calibrated ranking now prevents geometry-only lift from outranking
  player-visible path+peel preservation. The fresh out-of-sample batch
  preserved that rule and selected
  `stage3-semantic-fresh-g4-score-window-shape-peel-0.1` as a later
  non-overwriting browser transfer-proof target. Runtime source remains
  unauthorized.
- Galaxy Guardians longer-surface/persona review reads `7.0/10`, with
  stage-arc pressure at `7.9/10`, stage presentation at `7.4/10`, persona
  utility at `6.5/10`, midrun survivability at `6.0/10`, and stage-band
  authority at `6.7/10`
- overall Aurora quality is `9.1/10` across the current scored categories
- audio identity and cue alignment is the weakest category at `6.9/10`; the
  audio process is stronger than the rounded runtime score, with cue-contract
  readiness at `9.09/10`, semantic event score at `9.78/10`, acoustic event
  score at `6.30/10`, average worst segment risk at `3.70/10`, and
  `captureBeam` tail now the highest current audio segment gap
- level arc and encounter shape is now a first-class high-priority category at
  `8.8/10`, with remaining opportunity in long-run non-repetition, stage
  pressure precision, and higher-resolution challenge/reward evidence
- the latest audio work produced both harness value and a runtime lift:
  browser-backed audio captures now use an explicit `80ms` preroll, record
  capture metadata, support composite analysis windows for layered cues, and
  apply calibrated browser-reference gates for source-backed loss phrases. The
  accepted `enemyShot` reference-subwindow cue improved the fresh acoustic
  event rollup from `4.32/10` average worst-segment risk to `3.70/10` while
  keeping semantic scoring high and cue alignment at `9/9`. The
  `challengePerfect` pass found focused keepers but rejected runtime promotion
  after broader quality guards fell, so the next audio pass should target
  `captureBeam` tail or a stronger challenge-perfect mix model before promotion.
- player movement now scores `10/10` after repairing the movement conformance
  harness recenter path; no gameplay movement constants were changed
- the current quality score is captured in
  `reference-artifacts/analyses/quality-conformance/2026-05-11-b83393cd/report.json`
- conformance economics are now tracked in
  `CONFORMANCE_ECONOMICS.md` and the latest
  `reference-artifacts/analyses/conformance-economics/*/report.json`; this is
  now the standing documentation section for local CPU/browser spend,
  GPU-equivalent Codex/OpenAI/API usage, artifact growth, score movement, and
  cost-per-score reads. Future long-cycle runs should use
  `npm run harness:measure` so local CPU, browser/video, GPU, model/API,
  artifact-volume, and score-delta tradeoffs can be reviewed before choosing
  the next major phase
- the current long-cycle baseline is captured in
  `reference-artifacts/analyses/aurora-galaga-long-cycle/baseline-2026-05-05.json`
- the Track 1 movement/shot-feel finding is captured in
  `reference-artifacts/analyses/aurora-galaga-long-cycle/movement-shot-feel-2026-05-06.json`
- Galaxy Guardians 0.1 is now maintained through both scored artifacts and a
  first-class process plan: reference conformance `7.6/10`, playtest-weighted
  conformance `6.9/10`, longer-surface/persona review `7.0/10`, public
  readiness `4.2/10`, and a standing aggregate process gate in
  `npm run harness:check:galaxy-guardians-first-class-conformance`
- Galaxy still is not part of the Aurora numeric roll-up, and that is correct;
  the goal is first-class game-specific parity, not to blur the applications

## Release Direction

- hosted `/dev`, hosted `/beta`, and hosted `/production` now reflect the same
  release discipline, but hosted `/dev` is intentionally ahead as the
  `1.4.0.1` review increment
- the active source line now presents itself as the deliberate post-`1.4.0`
  follow-through family, not a pre-production candidate
- the latest accepted beta artifact remains `1.4.0-beta.1`, while the accepted
  production artifact is the public `1.4.0+build.748.sha.09a4c633` family
- the next hosted `/beta` decision is now about when the `1.4.0.1`-style
  follow-through work is coherent enough to become the next reviewed beta
  candidate
- `1.4.0` is the intentional shipped bundle for multi-game public identity,
  Platinum release discipline, and the first public Galaxy Guardians slice
- the shipped `1.4.0` family is now the stable public baseline while `main`
  carries the next measured documentation, evidence, and conformance follow-up
- the longer release-family phasing plan is tracked in
  [LONG_TERM_RELEASE_ROADMAP.md](LONG_TERM_RELEASE_ROADMAP.md)
- the concrete first level-expansion execution plan is tracked in
  [LEVEL_BY_LEVEL_EXPANSION_PLAN.md](LEVEL_BY_LEVEL_EXPANSION_PLAN.md)
- beta-readiness and long-horizon strategic review is tracked in
  [STRATEGIC_BETA_REVIEW.md](STRATEGIC_BETA_REVIEW.md) and should be refreshed
  after each major hosted `/beta` push

## Post-1.4.0 Pickup

After `1.4.0` ships, the plan should pick up in this order:

1. Short term: keep the live `1.4.0` public line trustworthy while publishing
   and reviewing the next `1.4.0.1` dev follow-through work cleanly.
2. Medium term: deepen post-`1.4.0` arcade depth and platform-contract
   follow-through,
   including alien entry/challenge novelty, stage shape, audio/event feedback,
   and visual reference grounding.
3. Longer term: `1.5.0` shared-video evidence and flight-recorder capabilities,
   followed by `1.6.0` pilot-facing shell/message-to-pilot polish, optional
   immersive full-window gameplay mode, and `2.0` multi-game Platinum maturity.

That keeps the next cycle from collapsing back into unprioritized polish and
preserves the release-family shape already captured in the roadmap docs.

Deferred shell bug to carry into `1.6.0`:

- split `Platform Developer Tools` from game-specific settings instead of
  widening the current release scope
- keep platform developer tools as a Platinum-owned quick-tools surface
- place game settings with game identity/selection near the rocket so the
  active game's controls feel first-class and cabinet-local
- add optional immersive full-window play as a cabinet-surface mode that
  expands the board without changing gameplay rules or hiding essential escape
  and settings paths

## Long-Term Direction

The long-term platform goal is:

- a durable Platinum host for multiple arcade experiences
- independent version and release tracking for the bundle, the platform, and
  each game
- same-control compliance across those experiences
- richer reference-video ingestion and analysis
- optional full-window/cabinet display modes that improve play and review
  without changing game-owned mechanics
- game-owned conformance packages that can support launch through Platinum now
  and thinner hosts later if we choose
- stronger personas, replay annotation, and future simulated-opponent support

That is the route to the next genuinely major era, not just incrementing a
major version number early.
