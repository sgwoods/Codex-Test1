# Release Schedule And Issue Spine - 2026-06-07

This is the current future-looking release schedule for Aurora Galactica,
Galaxy Guardians, Platinum, ingestion, personas, and conformance work.

Use this document as the release-family spine before opening a branch, accepting
a beta candidate, or deciding where an issue belongs. Version numbers can be
re-ordered when the actual bundle changes, but every active workstream should
still map to one of these release families or be explicitly deferred.

## Current Lane State

Verified June 7, 2026:

| Lane | Current Build | Role |
| --- | --- | --- |
| `/dev` | Current `1.4.0.1` forward-review build; exact label is authoritative in hosted `build-info.json` | Forward-review lane for consolidated docs, dashboards, Aurora challenge grammar, Guardians cleanup, and the next coherent improvement bundle. |
| `/beta` | `1.4.0-beta.1+build.1013.sha.3cb0d08b.beta` | Authority-gated candidate lane; should not move for documentation-only churn. |
| `/production` | `1.4.0+build.894.sha.1dc23d8a` | Stable public line. |

Current branch state:

- `main` is the authoritative engineering integration branch.
- release authority is currently held by `macbook-pro`.
- hosted `/dev` is expected to track the latest reviewed `main` dev publish.
- no beta or production publish is implied by this schedule.

## Multi-Machine Allocation Model

The project can use multiple machines, but the release schedule remains the
coordination layer. A branch should say both which release family it advances
and which machine is expected to do the work.

| Machine | Default Role | Best Current Work |
| --- | --- | --- |
| MacBook M4 / `macbook-pro` | High-throughput interactive development and current release-authority host. | Aurora challenge-stage runtime quality, browser-visible polish, fast conformance sweeps, integration, hosted `/dev` publish from clean `main`. |
| iMac M1 / `imacm1` | Always-online background worker and separable topic-branch producer. | Guardians ingestion/v1 evidence, long persona/watch runs, gameplay-export ingestion cycles, artifact portability checks, docs consistency sweeps, issue hygiene proposals. |
| Future worker machines | Narrow scoped artifact or analysis workers. | Video segmentation, labeling, contact sheets, audio/window analysis, game-specific evidence packets, no direct lane publish unless authority is transferred. |

Parallel-work rules:

- do not assign two machines to edit the same runtime surface without a named
  integration branch and handoff note
- use iMac M1 for work that can run unattended or produce durable evidence
- use MacBook M4 for work that needs fast feedback, visual review, or release
  integration
- push worker branches before switching machines or archiving sessions
- keep beta and production gated by `release-authority.json`, not by informal
  machine habit

## Release Family Schedule

| Family | Working Title | Primary Goal | Required Proof Before Beta / Production |
| --- | --- | --- | --- |
| `1.4.0` | Multi-game public baseline | Keep the current production family trustworthy while the next work is assembled on `/dev`. | Production remains stable; only hotfixes or explicitly reviewed follow-through should move production. |
| `1.4.1` | Quality And Integration Follow-Through | Turn current evidence into visible quality: Aurora challenge-stage runtime lift, impact/explosion feedback, Guardians v1 slice, and shared Watch/Rival/persona foundations. | `/dev` must show at least one real user-visible gameplay/platform lift beyond docs, with build/review/publish gates green and known gaps documented. |
| `1.4.2` | Safety, Auth, Storage, And Issue Hygiene | Tighten auth lanes, score integrity, replay/storage rules, dashboard visibility, duplicate issue cleanup, and public/private boundaries. | Remote score, signed-in game-over, Supabase/API, privacy/logging, and dashboard-access gates must be explicit and green or consciously deferred. |
| `1.5.0` | Flight Recorder And Evidence Media | Make gameplay export, video snippets, replay evidence, and source/run ingestion first-class release assets. | Gameplay-export ingestion cycle, playable video review artifacts, and issue/score/release linkage are usable across at least Aurora and one second-game slice. |
| `1.6.0` | Cabinet, Pilot, And Presentation Polish | Improve the shell and player-facing cabinet experience: immersive full-window mode, message-to-pilot/commentator, music/SFX controls, pilot cards, score surfaces, and popup/frame polish. | Platinum-owned shell changes are harnessed across game packs and do not leak Aurora-specific assumptions into platform code. |
| `1.7.0` | Ingestion-To-Runtime Grammar | Make movement, audio-event, sprite, persona, and stage-shape grammars reusable game-owned packages rather than one-off Aurora tuning. | A candidate can move from reference media to runtime comparison using a repeatable package flow, with local CPU/browser measurement carrying most repeated assessment. |
| `2.0.0` | Multi-game Platinum | Platinum can honestly host multiple real games, not just one mature game and previews. | Aurora is substantially improved, Guardians reaches a credible v1 playable state, shared personas/Watch/Rival/replay work across games, and third-game ingestion has a disciplined first-slice plan. |

## Active Workstream Mapping

| Workstream | Current State | Release Family | Source Docs / Evidence |
| --- | --- | --- | --- |
| Aurora challenge-stage runtime quality | Analysis is ahead of runtime: set-piece conformance remains around `4.3/10`, while first-five grammar readiness is `8.6/10`. | `1.4.1` | `PROJECT_WIDE_WORKSTREAM_ALIGNMENT_2026-06-07.md`, `CHALLENGE_SETPIECE_CONTRACTS.md`, `CHALLENGE_STAGE_BASELINE_GAP_AND_WORK_PLAN.md`, `CHALLENGE_STAGE_CONFORMANCE_ANALYSIS.md` |
| Aurora impact, damage, explosion, and event feedback | Weakest artifact row is `impact-explosion-visual-feedback`; players still need clearer cause/effect in combat moments. | `1.4.1` | `GAME_CONFORMANCE_CATALOG.md`, `AUDIO_CONFORMANCE_STRATEGY_REVIEW.md`, `AUDIO_CONFORMANCE_LAB.md`, issue `#201` |
| Galaxy Guardians v1 playable slice | Ingestion and long-surface evidence are real, but the visible public slice is still not a full v1 game experience. | `1.4.1` | `GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md`, `GALAXY_GUARDIANS_LONG_SURFACE_AND_PERSONA_PLAN.md`, `GALAXY_GUARDIANS_STAGE_ARC_AND_HOMAGE_PLAN.md`, `GALAXY_GUARDIANS_PLAYABLE_0_1_BRANCH_PLAN.md` |
| Shared personas, Watch, and Rival modes | Aurora has richer UX than Guardians; Guardians has persona evidence but needs platform parity and reusable contracts. | `1.4.1` then `1.7.0` | `GUARDIANS_WATCH_AND_RIVAL_ENABLEMENT_PLAN_2026-06-07.md`, `GALAXY_GUARDIANS_LONG_SURFACE_AND_PERSONA_PLAN.md`, harness run summaries |
| Release, auth, score, replay, and storage safety | The project has release gates, but public-broader exposure still needs auth/storage/logging review before flashy publishing features expand. | `1.4.2` | `RELEASE_POLICY.md`, `TESTING_AND_RELEASE_GATES.md`, `RUN_SUBMISSION_PLAN.md`, issues `#126`, `#127`, `#129`, `#203` |
| Gameplay export and video evidence ingestion | The current triage issue is a gameplay-export ingestion cycle for hosted-dev review. | `1.5.0` | issue `#242`, `MOVEMENT_REFERENCE_TRACE_PLAN.md`, `LEVEL_VISUAL_CONFORMANCE_INDEX.md`, `CONFORMANCE_ECONOMICS.md` |
| Arcade Music, commentator, full-window, and pilot/cabinet polish | Several features exist or are planned, but they should follow conformance and safety rather than lead beta. | `1.6.0` | `IMMERSIVE_FULL_WINDOW_GAMEPLAY_MODE_PLAN.md`, issues `#202`, `#134`, `#150` |
| Third-game preparation | Planning exists for Galaxian/Space-Invaders-style work, but it should remain ingestion-first until Aurora and Guardians are stronger. | `1.7.0` then `2.0.0` | `WINDIGO_INVADERS_PLATINUM_INSTANTIATION_PLAN.md`, `CLASSIC_ARCADE_INGESTION_FRAMEWORK.md`, `REFERENCE_MEDIA_INVENTORY.md` |

## Issue Tracking Rules

GitHub issues live in `sgwoods/Codex-Test1`, not the public release host. The
release host should remain a deployment mirror.

Each active issue should be assigned, in either labels or issue text, to:

- a release family: `1.4.1`, `1.4.2`, `1.5.0`, `1.6.0`, `1.7.0`, or `2.0.0`
- an area: `aurora`, `guardians`, `platinum`, `ingestion`, `release`, `docs`,
  `auth-storage`, or `third-game`
- a proof type: `runtime change`, `harness/evidence`, `docs`, `security`,
  `manual review`, or `known deferral`

Current issue audit from June 7, 2026:

- `#242` is the latest `triage` item and should map to `1.5.0` because it is a
  gameplay-export ingestion cycle for hosted-dev review.
- `#201` maps to `1.4.1` because explosion, impact, damage, and immunity
  feedback are directly tied to the weakest current application-artifact row.
- `#202` maps to `1.6.0` unless a smaller reusable message/event-log primitive
  is needed earlier for Watch/Rival/persona analysis.
- `#203` maps to `1.4.2` because externally visible conformance dashboards need
  Root/auth visibility rules before broader exposure.
- `#140` maps to `1.4.1` because challenge stages must be treated and named as
  bonus stages, not ordinary numbered stage progression.
- repeated movement, sound, pilot-score, screen-switching, high-score, and UI
  polish issues should be deduplicated during the `1.4.2` issue hygiene pass
  before the next production promotion.
- unlabelled Google/security alert issues should be triaged separately from
  game quality so operational noise does not obscure release blockers.

## Gate Policy By Lane

| Lane | What Can Move There | Minimum Gate |
| --- | --- | --- |
| `/dev` | Coherent docs/evidence/runtime bundles, including measured negative results. | `npm run build`, `npm run review:code:check`, `npm run publish:check:dev`, plus relevant focused harnesses. |
| `/beta` | Candidate bundles with visible user-facing improvement, safety fix, or release-critical platform hardening. | Hosted `/dev` reviewed, release notes updated, known issues mapped, release-authority approval explicit. |
| `/production` | Accepted public release or hotfix family. | Beta reviewed or hotfix exception documented, production policy satisfied, release notes and public docs current. |

## Next Schedule Maintenance Actions

1. Keep this document linked from the hosted project guide, white paper, README,
   product roadmap, and go-forward execution plan.
2. Before starting a branch, choose the release family it advances.
3. After each hosted `/dev` publish, update the lane state and any measured
   score movements.
4. Before requesting beta, run an issue hygiene pass that maps or defers the
   live open issues relevant to the release family.
5. Keep broad planning docs subordinate to this schedule: they can explain
   strategy, but the schedule decides current release ownership.
