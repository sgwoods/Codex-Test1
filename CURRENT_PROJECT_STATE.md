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
- Next Stage 7 work should make semantic phase-duration intent compile to
  explicit runtime-expressible controls before another source attempt.

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
