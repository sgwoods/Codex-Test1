# Project State And Conformance Program

Updated: May 12, 2026

This is the maintained top-level explanation of the broader Aurora / Platinum
effort. It is meant to answer four questions at once:

- what the project is trying to prove
- how Platinum, game applications, ingestion, harnesses, and release lanes fit
  together
- how the conformance program is improving Aurora and future games
- how Codex, OpenAI models, local CPU/browser compute, and persistent artifacts
  are being used to build more conformant software over time

## Top-Level Goal

The goal is to build a repeatable system for creating polished, inspired,
reference-conformant arcade software with modern LLM-supported engineering.

For Aurora, that means making a game that is not merely playable, but that
continues to move closer to the gameplay pressure, stage choreography, sound
feedback, visual discipline, and long-run mastery shape of Galaga-style arcade
play.

For Platinum, that means proving a reusable platform that can host more than
one serious game without absorbing game-specific truth.

For the conformance project, that means turning external artifacts into
measurable evidence, turning measurements into game and platform changes, and
tracking the resource cost of each improvement so future work is increasingly
automated, local-compute-driven, and evidence-backed.

## The Five Separated Layers

The project should be understood as five related but separate layers.

| Layer | Owns | Should not own | Current state |
| --- | --- | --- | --- |
| Platinum platform | Shell, hosted lanes, pack selection, shared docs, shared services, release tooling, dashboards, common harness substrate | Aurora rules, Galaga truth, Guardians rules, game-specific scoring, game-specific event semantics | Shipped with Aurora as the first application; now being hardened for multi-game work |
| Game applications | Gameplay rules, scoring, stages, enemy behavior, visual/audio identity, game-owned conformance evidence | Shared release authority, lane publishing policy, shell ownership, another game's mechanics | Aurora is shipped; Galaxy Guardians is a preview/ingestion-backed second-game proof |
| Ingestion framework | Source manifests, reference clips, event logs, contact sheets, waveforms, trace extraction, semantic annotation, metric targets | Arbitrary design decisions unsupported by evidence | Formal first-class part of the conformance project |
| Harness and conformance system | Runtime checks, correspondence reports, scorecards, dashboards, confidence/resolution, regression gates | Subjective release claims without rerunnable evidence | Aurora has a 12-category scorecard plus investment/economics dashboards |
| Release and resource economics | Dev/beta/production gates, documentation refresh rules, local CPU/browser spend, GPU-equivalent Codex/API accounting, cost-per-score movement | Hidden manual decisions that cannot be reviewed later | Local-first economics are now tracked and documented |

The main discipline is that reusable capability moves down into Platinum, while
game truth stays with the game and reference truth stays in ingestion artifacts.

## Current Project State

Aurora / Platinum is in a post-`1.3.0` shipped posture.

- hosted `/production` carries the refreshed public `1.3.0` family
- hosted `/beta` is the reviewed lane aligned with that refreshed public family
- hosted `/dev` carries the active `1.3.0.1` integrated hosted forward-review
  line
- local `localhost` is the active engineering lane
- `main` is the authoritative integration line for the deliberate `1.4.0`
  pickup

The active direction is no longer "can Platinum host Aurora?" It can. The active
direction is:

- raise Aurora's Galaga-like conformance in the areas that most affect player
  experience
- make conformance measurement more precise and more automated
- keep local CPU/browser harnesses doing as much assessment work as possible
- use Codex and model calls to design, implement, analyze, and explain better
  local systems rather than replacing measurement with opinion
- make Galaxy Guardians and later games arrive through ingestion-backed,
  game-owned conformance packages

## Current Conformance Read

The latest maintained score roll-up is in
[CONFORMANCE_METRICS_OVERVIEW.md](CONFORMANCE_METRICS_OVERVIEW.md) and the
release planning dashboard is in
[RELEASE_CONFORMANCE_DASHBOARD.md](RELEASE_CONFORMANCE_DASHBOARD.md).

Current Aurora read:

- overall release-quality score: `9.2/10`
- weakest high-value category: audio identity and cue alignment, currently
  `7.3/10`
- audio cue-contract readiness: `9.09/10`; semantic event scoring is strong at
  `9.78/10`, but acoustic event fit remains the active gap at `6.31/10`
- level arc and encounter shape: `8.8/10`
- boss entry and formation grammar: `9.2/10`
- alien entry and challenge-stage novelty: `7.8/10`
- player movement, shot/hit responsiveness, stage-1 geometry, and
  capture/rescue rules are current guardrail passes at `10/10` under current
  scorer resolution

Important interpretation:

- a `10/10` score means "maxed at current scorer resolution," not arcade-perfect
  imitation
- confidence and resolution are part of the metric, because a broad or young
  scorer can hide meaningful feel gaps
- a better scorer may temporarily lower a score while improving the project
  because it exposes a truer gap
- the latest audio and challenge-stage work is a good example: stabilizing
  browser audio capture, adding composite analysis windows, and then adding
  calibrated browser-reference gates first exposed `playerHit` tail/body fit
  and then enabled a measured ship-loss runtime promotion. The remaining
  `playerHit` tail gap is now smaller and better explained, while the stricter
  challenge scorer lowered confidence in "arrival versus appearance" and
  exposed a truer stage-variation gap

## Per-Game Status

| Game | Role | Current conformance posture | Next conformance need |
| --- | --- | --- | --- |
| Aurora Galactica | First shipped Platinum application and current active investment target | Strong release-quality baseline with focused gaps in audio identity, level arc precision, boss/formation stage variation, visual reference grounding, and pressure replay precision | Move toward the `1.4.0` arcade-depth gate with better measured audio feedback, stage-by-stage shape, visual/reference comparison, and long-play pressure/reward evidence |
| Galaxy Guardians | Second-game preview, branch-level playable-game push, and Galaxian-style ingestion proof | Preview metrics exist, public readiness is intentionally low, live dev/beta still expose a one-level public slice, and the branch now treats the deeper repeated-rack/persona work as an internal first-class conformance target with its own plan and aggregate process gate | Promote source-derived rack timing, dive paths, sprite/cue evidence, score/result identity, later-band fairness, and playtest-weighted scoring through [GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md](GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md) and [GALAXY_GUARDIANS_LONG_SURFACE_AND_PERSONA_PLAN.md](GALAXY_GUARDIANS_LONG_SURFACE_AND_PERSONA_PLAN.md), but keep public claims tied to the one-level playable slice until deeper stage-band depth is actually surfaced |
| Future games | Long-term repeatable ingestion target | Not yet active as playable work | Arrive through source manifests, reference windows, event logs, semantic profiles, score targets, and game-owned harnesses before design claims are made |

## How The Platform Helps The Conformance Effort

Platinum is not just a web shell around Aurora. It is becoming the reusable
infrastructure that makes measured game conformance practical.

Platinum helps by providing:

- local, dev, beta, and production lanes with explicit release identity
- a stable shell and pack-selection path for comparing games without rewriting
  the host
- shared browser harness utilities and controlled-clock execution
- a developer conformance dashboard that can be shipped read-only with release
  lanes
- release documentation gates that force score, evidence, and resource updates
  before serious candidates
- platform-owned services for score transport, replay surfaces, feedback,
  docs, and future evidence viewing
- explicit external-service access contracts, starting with the Supabase Data
  API grants/RLS contract for profile and leaderboard tables
- common boundaries so each game can own its own mechanics and conformance
  truth

The platform's value grows when conformance work discovers a reusable need and
that need becomes a clean Platinum extension point instead of being buried in
Aurora-specific code.

## Where Ingestion Fits

Ingestion is the front half of conformance.

The ingestion framework turns external evidence into structured game knowledge:

1. source discovery and provenance
2. clip/window selection
3. frame, motion, waveform, and spectrogram extraction
4. semantic event logging
5. confidence and uncertainty notes
6. metric/scorer definitions
7. runtime correspondence targets
8. game-owned implementation and harness plans

For Aurora, ingestion keeps improving the reference basis for Galaga-like
quality: audio clips, stage openings, challenge timing, boss formation grammar,
pressure windows, contact sheets, and visual look checks.

For Galaxy Guardians, ingestion is even more central because the game should
not become "Aurora with different labels." Its first credible playable phases
should come from Galaxian-style source windows, event logs, sprite/cue targets,
and runtime correspondence checks.

The maintained Galaxy-specific bridge between ingestion and release review is:

- [GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md](GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md)
- `npm run harness:check:galaxy-guardians-first-class-conformance`

For future games, ingestion should become the repeatable starting point rather
than a manual design phase.

## The Working Loop

The conformance process should keep cycling through this loop:

1. choose the highest-value conformance gap using score, confidence, user impact,
   and resource economics
2. gather or refine reference evidence before subjective tuning
3. build or improve a local harness/scorer that can rerun the question
4. run local CPU/browser assessment long enough to get stable evidence
5. use Codex/model calls to design algorithms, review evidence, write code, and
   summarize tradeoffs where that increases leverage
6. convert model-assisted insight into persisted repo logic whenever possible
7. change game or platform behavior only where the evidence supports it
8. rerun scorecards and dashboards
9. document score movement, confidence, cost, and next investment

This loop is deliberately "Karpathy-loop-like" in spirit: inspect concrete
examples, improve the dataset and evaluator, make a small candidate change, run
it, study failures, and fold the learning back into the system.

## Resource Economics

The standing resource documentation is
[CONFORMANCE_ECONOMICS.md](CONFORMANCE_ECONOMICS.md).

The project currently reads as heavily local-first:

- local CPU/browser harnesses are doing the overwhelming majority of measured
  conformance work
- Codex/OpenAI/model usage is essential for planning, implementation, synthesis,
  and analysis, but is under-instrumented unless we log it manually
- any serious long-cycle work should be wrapped with `npm run harness:measure`
  so we can compare resource cost against score movement

The desired pattern is:

- spend model/GPU-equivalent effort on strategy, harness design, code
  generation, algorithm selection, and expert review
- push repeated measurement into local CPU/browser processes
- preserve every durable learning as code, metrics, reports, dashboards, or
  artifacts
- prefer investments that improve both the game and the measuring system

## Current Highest-Value Investment Areas

The dashboard currently keeps the detailed investment queue. At the strategic
level, the important areas are:

1. audio identity, event feedback, and cue alignment
2. alien entry, challenge-stage arrival, and challenge-stage novelty
3. level arc and encounter shape
4. boss entry and formation grammar
5. visual look and feel, including start/attract typography and gameplay
   readability
6. arcade cabinet frame, popup, help, scoring, leaderboard, and result surfaces
7. pressure curve precision and exact replay of known source windows
8. Guardians ingestion promotion from preview metrics into stronger
   frame/audio/playtest evidence
9. Guardians score/progression/result identity so Platinum changes are
   validated against two real games instead of one game plus one preview shell

The next major release gate should be judged not only by a higher overall score,
but by whether the improved categories are the ones players actually feel.

## Release Recommendation

Current recommendation:

- treat the refreshed public `1.3.0` family as the stable current line
- treat hosted `/dev` as the current forward-review increment rather than as an
  automatic release candidate
- use the next coherent hosted `/dev` bundle to justify the next beta request
- keep the larger `1.4.0` family focused on arcade depth: alien entry,
  challenge-stage novelty, stage progression, boss/formation grammar, visual
  reference grounding, and measured audio feedback

Short term:

- keep the refreshed `1.3.0` release note and readiness docs aligned with the
  live public line
- keep all candidate work wrapped in `harness:measure`
- keep dashboard, scorecard, public project page, project guide, release notes,
  and strategic review aligned with the same current score read before the next
  beta candidate is cut

Latest local playtest response:

- `stageTransition` now uses a longer reference-backed window so the inter-level
  moment is less abrupt.
- final ship loss now plays/logs `gameOver` before session export and keeps a
  recording tail so the final audio does not disappear from captured evidence.
- wait-mode copy is simplified for the Aurora start screen while preserving the
  game-picker hint and Guardians showcase content.
- boss first-hit feedback now uses compact damage sparks/ring/flash instead of
  clunky full-destruction bursts.
- challenge-stage timing still passes, but challenge-stage arrival and pattern
  novelty are now separated as their own conformance problem.

Medium term:

- shape `1.4.0` around arcade depth: alien entry variation, challenge-stage
  novelty, stage progression, boss/formation grammar, visual reference
  grounding, and measured audio feedback

Longer term:

- use `1.5.0` for shared video evidence and flight-recorder publishing
- use `1.6.0` for message-to-pilot and cabinet-surface polish
- reserve `2.0` for a credible multi-game Platinum milestone backed by
  ingestion-driven game-owned conformance packages

## Documentation System

The documentation should remain layered so readers can choose the right depth.

| Reader need | Best entry |
| --- | --- |
| Top-level project state and why this work matters | This document |
| Current score table and metric targets | [CONFORMANCE_METRICS_OVERVIEW.md](CONFORMANCE_METRICS_OVERVIEW.md) |
| At-a-glance priority queue and dashboard logic | [RELEASE_CONFORMANCE_DASHBOARD.md](RELEASE_CONFORMANCE_DASHBOARD.md) |
| Resource usage, local CPU, GPU-equivalent model work, and cost-per-score | [CONFORMANCE_ECONOMICS.md](CONFORMANCE_ECONOMICS.md) |
| Platform ownership and architecture | [PLATINUM.md](PLATINUM.md) and [PLATINUM_ARCHITECTURE_OVERVIEW.md](PLATINUM_ARCHITECTURE_OVERVIEW.md) |
| Game/platform boundary | [APPLICATIONS_ON_PLATINUM.md](APPLICATIONS_ON_PLATINUM.md) |
| Per-game alien, audio, stage, and persona catalog | [GAME_CONFORMANCE_CATALOG.md](GAME_CONFORMANCE_CATALOG.md) |
| Guardians stage arc, stage-band plan, and homage-variant guardrails | [GALAXY_GUARDIANS_STAGE_ARC_AND_HOMAGE_PLAN.md](GALAXY_GUARDIANS_STAGE_ARC_AND_HOMAGE_PLAN.md) |
| Persona gameplay distribution evidence | [Aurora Application Guide](application-guide.html#persona-performance-distribution) and `reference-artifacts/analyses/persona-performance-distribution/latest.json` |
| Expert beta strategy review | [STRATEGIC_BETA_REVIEW.md](STRATEGIC_BETA_REVIEW.md) |
| Ingestion process | [CLASSIC_ARCADE_INGESTION_FRAMEWORK.md](CLASSIC_ARCADE_INGESTION_FRAMEWORK.md) |
| Quality scoring model | [QUALITY_CONFORMANCE_MODEL.md](QUALITY_CONFORMANCE_MODEL.md) |
| Current execution plan | [PLAN.md](PLAN.md) |
| Product roadmap | [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md) |

## Maintenance Rules

Refresh this document when any of these change:

- release family or lane posture
- primary conformance priorities
- metric categories or interpretation rules
- alien/audio/stage/persona catalog entries
- ingestion's role in the project
- platform/application boundary strategy
- resource-economics policy
- status of Aurora, Galaxy Guardians, or a future game
- major hosted `/beta` pushes or beta-readiness decisions, which should also
  refresh [STRATEGIC_BETA_REVIEW.md](STRATEGIC_BETA_REVIEW.md)

Before a serious `/dev`, `/beta`, or `/production` candidate, refresh:

```sh
npm run harness:build:conformance-metrics-overview
npm run harness:analyze:conformance-economics
npm run harness:build:release-conformance-dashboard
npm run harness:build:dev-conformance-dashboard
npm run build
```

Then update the human-readable docs if the generated artifacts changed the
project story.
