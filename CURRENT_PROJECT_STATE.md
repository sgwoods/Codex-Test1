# Current Project State Index

Updated: June 8, 2026

This file is a map, not another competing plan. Use it to decide which document
answers which question before starting work. If an older planning note conflicts
with this map, prefer the June 7 source-of-truth stack linked below unless a
newer committed artifact clearly supersedes it.

## First Read For New Work

1. [AGENTS.md](AGENTS.md) for repo-specific operating instructions.
2. This file for the current documentation hierarchy.
3. [PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md](PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md)
   for the canonical project/conformance overview.
4. [PROJECT_WIDE_WORKSTREAM_ALIGNMENT_2026-06-07.md](PROJECT_WIDE_WORKSTREAM_ALIGNMENT_2026-06-07.md)
   for current cross-workstream priority order.
5. [RELEASE_SCHEDULE_AND_ISSUE_SPINE_2026-06-07.md](RELEASE_SCHEDULE_AND_ISSUE_SPINE_2026-06-07.md)
   for release-family ownership and issue mapping.
6. [LONG_CYCLE_KEEPER_PROCESS.md](LONG_CYCLE_KEEPER_PROCESS.md) before any
   measured reference-analysis, candidate sweep, or runtime-keeper cycle.

## Source-Of-Truth Map

| Question | Primary source | Supporting source | How to use it |
| --- | --- | --- | --- |
| What is the canonical project state? | [PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md](PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md) | [PLAN.md](PLAN.md) | Treat this as the narrative source for Platinum, Aurora, Guardians, ingestion, harnesses, lanes, and economics. |
| What should the next worker do? | [PROJECT_WIDE_WORKSTREAM_ALIGNMENT_2026-06-07.md](PROJECT_WIDE_WORKSTREAM_ALIGNMENT_2026-06-07.md) | [PLAN.md](PLAN.md) | Use it to choose the next work block and keep Aurora, Guardians, Platinum, personas, ingestion, and release gates aligned. |
| Which release family does the work advance? | [RELEASE_SCHEDULE_AND_ISSUE_SPINE_2026-06-07.md](RELEASE_SCHEDULE_AND_ISSUE_SPINE_2026-06-07.md) | [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md) | Every branch should declare a release family. The release spine decides current ownership; roadmap docs explain longer strategy. |
| What do the measurements currently say? | [CONFORMANCE_METRICS_OVERVIEW.md](CONFORMANCE_METRICS_OVERVIEW.md) | [RELEASE_CONFORMANCE_DASHBOARD.md](RELEASE_CONFORMANCE_DASHBOARD.md) | Treat generated score docs as evidence snapshots. Do not let broad scores hide strict weak rows. |
| What did the work cost? | [CONFORMANCE_ECONOMICS.md](CONFORMANCE_ECONOMICS.md) | `reference-artifacts/analyses/conformance-economics/` | Use `npm run harness:measure` for meaningful long-cycle runs and record CPU/browser/model effort. |
| What gates protect release movement? | [TESTING_AND_RELEASE_GATES.md](TESTING_AND_RELEASE_GATES.md) | [RELEASE_LANE_MODEL.md](RELEASE_LANE_MODEL.md), [MULTI_MACHINE_WORKFLOW.md](MULTI_MACHINE_WORKFLOW.md), [release-authority.json](release-authority.json) | Use the smallest relevant checks per branch. Beta and production require explicit release authority. |
| How does a measured idea become a runtime change? | [LONG_CYCLE_KEEPER_PROCESS.md](LONG_CYCLE_KEEPER_PROCESS.md) | Workstream-specific analysis docs | A candidate is not a keeper until it has strict evidence, guardrails, before/after review material, and economics/doc updates. |
| What is the release policy? | [RELEASE_POLICY.md](RELEASE_POLICY.md) | [TESTING_AND_RELEASE_GATES.md](TESTING_AND_RELEASE_GATES.md) | Use the policy rules, but treat its explicitly marked May 2026 lane examples as historical context. |

## Current Lane Read

The current lane posture is maintained in the June 7 release schedule and
workstream alignment docs:

- `main` is the authoritative engineering integration branch.
- hosted `/dev` is the `1.4.0.1` forward-review line; the exact deployed build
  label is authoritative in hosted `build-info.json`.
- hosted `/beta` is `1.4.0-beta.1+build.1013.sha.3cb0d08b.beta`.
- hosted `/production` is `1.4.0+build.894.sha.1dc23d8a`.
- release authority is currently on `macbook-pro`.
- iMac M1 is an always-online parallel worker for separable evidence,
  ingestion, persona/watch, portability, docs, and issue-hygiene branches.

Do not publish hosted `/beta` or hosted `/production` unless release authority
and user intent are explicit.

## Near-Term Priority Read

Current release-family priority:

- `1.4.1`: visible Aurora challenge/runtime lift, audio/event feedback,
  Guardians v1 slice, and shared Watch/Rival/persona foundations.
- `1.4.2`: auth, score, replay/storage, dashboard-access, and issue hygiene.
- `1.5.0`: gameplay export, video evidence, replay catalog, and source/run
  ingestion.
- `1.6.0`: cabinet, pilot, music/SFX, commentator, full-window, and popup
  polish.
- `1.7.0` / `2.0.0`: generalized ingestion-to-runtime grammar and mature
  multi-game Platinum.

For `1.4.1`, do not claim beta readiness for documentation or evidence cleanup
alone. Beta needs a player-visible runtime/platform lift, a safety fix, or
release-critical platform hardening with explicit review.

Latest Stage 7 calibration:

- The `stage7-semantic-phase-align-protect-0.1` runtime projection was tried on
  June 8, 2026 and rejected. It produced no actual browser-runtime object-track
  lift over the `4.7/10`, `0.503` coverage baseline and tripped the
  challenge-motion-profile target-order guard while applied.
- Runtime source was restored. The Stage 7 reference execution description,
  non-overwriting trial gate, and semantic batch mechanism remain useful
  measurement/process keepers, but no Stage 7 player-facing runtime keeper is
  accepted from that candidate.
- The semantic batch gate is now stricter than the older description-level
  readiness read. Current `latest-batch` recommendation is
  `no-runtime-source-candidate`; do not try another Stage 7 runtime source
  candidate until the batch/calibration gate passes.
- Stage 7 path-family truth is not fully aligned across artifacts. The
  reference execution description and setpiece contract agree on measured
  intent (`cross-sweep`, `hook-arc`, `hook-arc`, `cross-sweep`, `hook-arc`),
  while live promotion gates and restored runtime source agree on the current
  gate order (`cross-sweep`, `cross-sweep`, `hook-arc`, `hook-arc`,
  `boss-led-loop`). Use the live promotion gates and restored runtime source as
  candidate gate authority until the project explicitly migrates them.
- The June 8 authority decision keeps live promotion gates/restored runtime
  source as source-ready authority for now:
  `reference-artifacts/analyses/reference-execution-authority/stage7-challenge2/latest-path-family-authority.json`.
  RED/setpiece remain measured-reference intent, not source-promotion truth by
  themselves. The authority report now records this as explicit debt: live
  gates are today's promotion authority, while RED/setpiece remain target
  conformance authority to migrate toward only after direct migration proof.
- `phase-duration-rebalance` now has a runtime-consumed control contract and
  browser proof for `groupSpawnOffsets` / `motionSpecGroup.spawnOffsetS`,
  `phaseDurations.trackS`, and `referencePath.playbackScale`; `exitS` is
  explicitly not consumed. The protected compiler now declares
  `intendedTouchedGroups`, keeps groups 4 and 5 protected unless explicitly
  opted in, emits per-group timing deltas, and preserves protected group 4/5
  timing in the candidate-specific proof. The transform is still not
  source-ready: the constrained proof fails the focused motion/profile proxy on
  spacing/readability (`spacingScore` `0.64` below the `0.72` floor and
  `bunchingRisk` `0.387` above the `0.38` cap):
  `reference-artifacts/analyses/reference-execution-runtime-expressibility/stage7-challenge2/latest-phase-duration-proof.json`.
- The semantic generator now emits `compiledRuntimeControls` for
  `phase-duration-rebalance` under live path-family authority. It also records
  an analysis-only compiler mapping for `group1-path-length-compression`,
  which remains blocked until a browser transfer proof exists.
- `lower-field-overstay-reduction` now has its single allowed Stage 7 transfer
  proof:
  `reference-artifacts/analyses/reference-execution-runtime-expressibility/stage7-challenge2/latest-lower-field-proof.json`.
  The proof confirms the generated `lowerFieldBias` / `yOffset` controls are
  consumed by runtime, but the group 2 lower-field share stayed at `0.6667`
  instead of moving toward the generated `0.4522` target, the visible movement
  read was false, and the proof failed motion/profile plus spacing/readability
  guardrails. Scoreable routes, no-shot/no-attack/no-loss safety, and group
  4/5 preservation stayed intact. This makes lower-field-overstay
  analysis-only / not runtime-expressible under the current controls.
- No Stage 7 source-ready candidate exists after the phase-duration and
  lower-field proofs. Pause Stage 7 candidate work and apply the RED pipeline
  front-first to Stage 3 / Challenge 1.
- Stage 3 / Challenge 1 now has its first Reference Execution Description:
  `reference-artifacts/ingestion/reference-execution-descriptions/aurora-stage3-challenge1-0.1.json`.
  The analyzer/check pair
  `npm run harness:analyze:stage3-reference-execution-description` and
  `npm run harness:check:stage3-reference-execution-description` writes the
  latest language adequacy report at
  `reference-artifacts/analyses/reference-execution-description/stage3-challenge1/latest.json`.
  The RED preserves Stage 7 object-track fields but adds explicit
  `semanticExecution`, `fieldOccupancyExpectation`,
  `uncertaintyAndProvenance`, and authority-layer fields for Stage 3's
  top-right bee-line, late top-left butterfly-line, upper-band score windows,
  peel-off exits, and no-combat grammar. Current language adequacy is `0.704`.
- Stage 3 / Challenge 1 now also has a non-overwriting RED candidate-trial
  gate:
  `reference-artifacts/analyses/reference-execution-candidate-trials/stage3-challenge1/latest.json`.
  Use
  `npm run harness:analyze:stage3-reference-execution-trial` and
  `npm run harness:check:stage3-reference-execution-trial`. The baseline-control
  trial is accepted as a process keeper, not a runtime keeper: semantic score
  is `0.918`, object-track remains `3.2/10`, all `5/5` groups are strict weak
  rows, `4/5` groups have human-vs-CPU field-occupancy tension, and groups 3
  and 5 carry target-vs-runtime authority conflicts. The next Stage 3 work is
  a small non-overwriting semantic candidate batch against this gate, not a
  runtime source candidate.
- The first Stage 3 semantic batch now exists:
  `reference-artifacts/analyses/reference-execution-candidate-trials/stage3-challenge1/latest-batch.json`.
  It generated `10` named candidates from the Stage 3 vocabulary and now has a
  calibrated player-visible multi-axis ranking model:
  `reference-artifacts/analyses/reference-execution-candidate-trials/stage3-challenge1/latest-ranking-calibration.json`.
  The calibration demotes the old geometry-heavy
  `stage3-semantic-direct-lines-red-target-probe-0.1` from rank `1` to rank
  `4` as a `metric-only-probe` because direct-line peel readability stays at
  `0.64`. It promotes
  `stage3-semantic-direct-lines-shape-peel-0.1` to rank `1` as a
  `player-visible-semantic-lift` (`3.5/10` object-track, `0.665` path shape,
  `0.375` path sanity, `1.0` focus peel), while keeping runtime source
  promotion disabled.
- The fresh out-of-sample Stage 3 semantic batch now supersedes the first batch
  as `latest-batch` and keeps the prior `10` candidates as a regression
  baseline:
  `reference-artifacts/analyses/reference-execution-candidate-trials/stage3-challenge1/latest-regression-baseline.json`.
  Old-vs-new yield comparison is in
  `reference-artifacts/analyses/reference-execution-candidate-trials/stage3-challenge1/latest-batch-comparison.json`.
  The fresh batch generated `10` new named candidates; all `10` were
  semantically valid and guardrail-safe, geometry-only probes stayed
  `metric-only-probe` / not trial-promising, and player-visible semantic lifts
  rose from `3` to `7`. Because multiple candidates were close rather than one
  clearly strongest, the gate selected the smallest future proof target:
  `stage3-semantic-fresh-g4-score-window-shape-peel-0.1`. Recommendation:
  later non-overwriting browser transfer proof for that candidate only; no
  runtime source edit or source candidate is authorized.
- That single non-overwriting browser transfer proof now exists:
  `reference-artifacts/analyses/reference-execution-runtime-expressibility/stage3-challenge1/latest-transfer-proof.json`,
  with contact-sheet evidence at
  `reference-artifacts/analyses/reference-execution-runtime-expressibility/stage3-challenge1/latest-transfer-proof-contact-sheet.svg`.
  The proof now adds and validates a reusable motionSpec-backed path-length
  backend, `motionSpecGroups[3].controls.pathPlaybackScale`, so the old
  `groupReferencePaths[3].playbackScale` blocker is replaced rather than hidden.
  For `stage3-semantic-fresh-g4-score-window-shape-peel-0.1`, the consumed
  controls are `pathPlaybackScale: 0.5`, `routeCurveY: 17.464`, and
  `routeOffsetX: 60`. Group 4 moves from a `center` exit read to `right`, path
  length drops from `1.5589` to `1.1897`, upper-band share improves from
  `0.775` to `0.9474`, protected groups 1, 2, 3, and 5 pass preservation, and
  motion/profile, spacing, scoreable-route, no-combat, and
  no-shot/no-attack/no-loss guardrails pass. The classification is now
  `runtime-source-attempt-ready` only: it is not a runtime keeper and not beta
  justification. Next work should attempt exactly one minimal Stage 3 source
  edit for those three consumed controls, then run strict before/after evidence
  and accept or reject the runtime keeper. Reference-path backing remains future
  architecture debt; do not generate another Stage 3 candidate batch yet.

## Historical Or Stale Current-State Docs

These docs remain useful as history, but should not be used as the live lane
state:

- [DEVELOPMENT_STATUS_UPDATE.md](DEVELOPMENT_STATUS_UPDATE.md): May 18 reopen
  note. Useful for preserved-source and white-paper context; stale for lane
  labels and current work order.
- [RELEASE_STATE_MAP.md](RELEASE_STATE_MAP.md): April 25 release snapshot for
  the old `1.2.3` lane picture.
- [BETA_CANDIDATE_PLAN.md](BETA_CANDIDATE_PLAN.md): May 2026 beta-planning
  note for the old `1.3.0` / `1.4.0` transition.
- [BETA_TO_PRODUCTION_PLAN.md](BETA_TO_PRODUCTION_PLAN.md): production
  promotion record for the shipped `1.4.0` public line, not a current
  promotion plan.
- [PATCH_1_2_4_PLAN.md](PATCH_1_2_4_PLAN.md): old `1.2.x` patch-family plan.
- [QUALITY_RELEASE_SCORECARD.md](QUALITY_RELEASE_SCORECARD.md): May 2026
  `1.3.0` quality scorecard; use current conformance dashboards instead.
- [STRATEGIC_BETA_REVIEW.md](STRATEGIC_BETA_REVIEW.md): May 12 strategic beta
  review template for the accepted `1.3.0.1` cycle.
- [RESTART_FROM_HERE.md](RESTART_FROM_HERE.md): old iMac-authority restart
  checkpoint; use current checkpoint files and this index first.
- [MACBOOK_CODEX_PROMPT.md](MACBOOK_CODEX_PROMPT.md): old MacBook
  non-authority prompt; verify current release authority before using.
- [RELEASE_LANE_MODEL.md](RELEASE_LANE_MODEL.md): lane definitions remain
  useful, but its June 3 published-state and promotion snapshots are historical
  and explicitly marked.
- [NEXT_DEV_CANDIDATE_MAP.md](NEXT_DEV_CANDIDATE_MAP.md) and
  [NEXT_DEV_CANDIDATE_PROPOSAL.md](NEXT_DEV_CANDIDATE_PROPOSAL.md): already
  marked as pre-`1.2.3` hosted-dev planning history.
- Older release notes remain historical release records by design; they should
  not be edited into current-state docs.
- Generated conformance dashboards and score docs: evidence snapshots. If their
  numbers differ from the latest canonical planning note, treat that as a
  freshness issue to resolve before release claims, not as permission to choose
  whichever number is most favorable.

## Maintenance Rule

After a meaningful `/dev` publish, beta review, or major conformance cycle:

1. update the release schedule if lane state or release-family ownership
   changed;
2. update the workstream alignment note if priority order changed;
3. refresh conformance/economics artifacts only when needed for a real release
   or quality decision;
4. leave historical notes intact, but add a short historical banner if their
   title could be mistaken for current state.
