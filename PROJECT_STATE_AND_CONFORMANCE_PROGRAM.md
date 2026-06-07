# Project State And Conformance Program

Updated: June 7, 2026

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

Aurora / Platinum is in a post-`1.4.0` production development posture.

- hosted `/production` is the stable public `1.4.0` family
- hosted `/beta` remains the authority-gated review lane for the next deliberate
  candidate cycle
- hosted `/dev` is the forward-review lane for the next coherent improvement
  bundle and currently tracks `1.4.0.1+build.1063.sha.bb997d057`
- local `localhost` is the active engineering lane
- `main` is the authoritative integration line and currently includes the
  consolidated Aurora challenge movement grammar, Galaxy Guardians ingestion
  cleanup, refreshed conformance economics, public project guide, white paper,
  slides, dashboards, release-schedule spine, and review packet
- release authority is currently on this MacBook profile

Current release-family ownership is maintained in
[RELEASE_SCHEDULE_AND_ISSUE_SPINE_2026-06-07.md](RELEASE_SCHEDULE_AND_ISSUE_SPINE_2026-06-07.md).
Use that schedule to keep docs, GitHub issues, workstreams, and lane gates
aligned.

The active direction is no longer "can Platinum host Aurora?" It can. The active
direction is:

- raise Aurora's Galaga-like conformance in the areas that most affect player
  experience, especially audio feedback and challenge-stage set-piece quality
- make conformance measurement more precise and more automated
- keep local CPU/browser harnesses doing as much assessment work as possible
- use Codex and model calls to design, implement, analyze, and explain better
  local systems rather than replacing measurement with opinion
- make Galaxy Guardians and later games arrive through ingestion-backed,
  game-owned conformance packages
- keep the current workstream ordering explicit through
  [PROJECT_WIDE_WORKSTREAM_ALIGNMENT_2026-06-07.md](PROJECT_WIDE_WORKSTREAM_ALIGNMENT_2026-06-07.md)

## Current Path.Plan

The current path after the June 7 hosted `/dev` publish is:

1. Aurora challenge-stage runtime quality first: the grammar and first-five
   reference contracts are ready enough to drive implementation, but runtime
   set-piece quality remains weak.
2. Galaxy Guardians v1 slice completeness second: opening presentation,
   score/result identity, replay/video readiness, Watch/Rival/persona reuse,
   and Platinum frame parity.
3. Safety and release gates third: auth lanes, score integrity, replay/storage
   boundaries, Supabase RLS posture, logging/privacy limits, and public/private
   dashboard separation.
4. Generated documentation and dashboards throughout: every serious score,
   cost, artifact, and recommendation should remain visible in the public
   project/Application Guide surfaces, not only hidden in repo artifacts.
5. Low-risk delight after the guardrails stay green: Arcade Music, Watch Mode,
   Player Two UX clarity, Commentator callouts, and optional immersive
   full-window gameplay may continue when they remain safely scoped, reversible,
   measured, and do not pollute production scores.
6. High-risk delight last: YouTube high-score posting and externally hosted
   replay publishing must wait behind explicit auth, consent, storage,
   moderation, token, and revoke/failure-mode review.

The immediate work priority is to turn the new analysis and evidence into real
runtime quality. The current consolidation was valuable, but beta should wait
for a visible gameplay/platform lift beyond documentation and evidence
maintenance.

## May 19 Sprite And Formation Learning

The latest local work made one important process correction: sprite conformance
cannot be represented by a single static crop score.

The project now needs to keep these reads separate:

| Read | Question | Current use |
| --- | --- | --- |
| Target sprite model | What does the reference alien or ship look like in extracted/source evidence? | Galaga alien source images, crop manifests, and promoted pixel targets. |
| Runtime sprite crop | What does Aurora actually draw in the browser? | Runtime capture and Reference Pixel Lab scoring. |
| Relative gameplay scale | Are player, reserve ships, bosses, bees, butterflies, and challenge aliens proportional on the board? | Recently corrected after the oversized sprite regression. |
| Formation readability | Does a 40-enemy rack still have enough visual air between rows and columns once more authentic pixel silhouettes are used? | New `formation-readability` artifact and guard. |
| Entry choreography | Do aliens arrive through readable, target-like paths instead of appearing, bunching, or crossing incoherently? | Later-stage burst entry improved; stage-1 opening overlap remains an advisory warning. |
| Temporal sprite motion | Do flaps, pulses, dives, capture/rescue, carried-fighter, dual-fighter, and damage phases read correctly over time? | Still a high-priority harness gap. |

The current formation-readability pass produced a useful split result:

- settled rack spacing now passes in normal rendering and Reference Pixel Lab
  mode
- later-stage entry bursts were reduced by staggering non-stage-1 arrivals
- stage-1 opening crossing still produces warning-level overlap, so the next
  true conformance step is a reference-timed opening path scorer rather than
  more ad hoc constant tuning

This is the kind of learning that must carry into Galaxy Guardians and later
games. New games should not enter the pipeline with only a nice-looking static
sprite sheet. They should bring a target crop, runtime crop, gameplay-scale
read, formation/rack readability check, temporal motion plan, and entry-path
grammar before the game is called conformant.

## Cross-Game Ingestion Automation Direction

The project is moving toward a repeatable ingestion loop where the model helps
design and interpret local harnesses, but the durable evidence is produced by
local CPU/browser/video/audio work whenever possible.

For Aurora, the current sprite/readability cycle proved that source definitions,
runtime canvas output, gameplay-scale proportions, and motion choreography can
diverge. For Galaxy Guardians and later games, the first-class ingestion package
therefore needs this maturity ladder:

| Maturity | Required proof | Why it matters |
| --- | --- | --- |
| Source inventory | Named media, clips, screenshots, manuals, sprite sheets, and provenance. | Prevents future work from depending on vague memory or one-off prompts. |
| Target extraction | Promoted target crops, cue windows, stage windows, motion windows, and event labels. | Gives the harness something stable to compare against. |
| Runtime capture | Browser-rendered sprite crops, audio captures, event logs, stage traces, and persona runs. | Shows what the player actually experiences. |
| Metric separation | Independent scores for likeness, scale, readability, motion, audio meaning, stage shape, and safety. | Avoids hiding a bad live experience behind one good static proxy. |
| Dashboard/release visibility | Scores, confidence, cost, evidence, and next gaps visible in generated docs and dashboards. | Makes release decisions reviewable by humans and reusable for the next game. |
| Shared harness promotion | Game-neutral capture/scoring helpers moved into reusable Platinum/harness code. | Lets the second and third games get better faster without copying Aurora-specific rules. |

The next conformance-program improvement should make this ladder visible as a
cross-game dashboard row so Aurora, Galaxy Guardians, and future game packs can
be compared by ingestion maturity as well as by current gameplay score.

## Current Conformance Read

The latest maintained score roll-up is in
[CONFORMANCE_METRICS_OVERVIEW.md](CONFORMANCE_METRICS_OVERVIEW.md) and the
release planning dashboard is in
[RELEASE_CONFORMANCE_DASHBOARD.md](RELEASE_CONFORMANCE_DASHBOARD.md).

Current read:

- conformance economics roll-up: `8.7/10`
- measured resource ledger: `904` runs, about `58,277s` wall time, about
  `58,392s` CPU time, and about `1.48GB` current artifact accounting
- application artifact conformance: `7.46/10`
- weakest application artifact row: `impact-explosion-visual-feedback`
- Aurora challenge-stage set-piece conformance: `4.3/10` current average,
  with movement `4.4/10`, graphics `4.5/10`, novelty `3.9/10`,
  target-video object fit `3.6/10`, challenge-specialty authority `3.2/10`,
  and zero release-ready challenge contracts
- Aurora challenge grammar readiness: `25/25` first-five group contracts are
  reference-backed and average control readiness is `8.6/10`
- challenge motion primitives: `10` primitives, `4` high priority, release
  readiness still `planning-only`
- Galaxy Guardians long-surface/persona review: `7.0/10`, with stage-arc
  pressure `7.9/10`, stage presentation `7.4/10`, persona review utility
  `6.5/10`, midrun survivability `6.0/10`, and stage-band authority `6.7/10`
- overall Aurora quality remains strong in broad release reads, but the
  project should not let broad scores hide the challenge-stage, event-feedback,
  and second-game completeness gaps

Important interpretation:

- a `10/10` score means "maxed at current scorer resolution," not arcade-perfect
  imitation
- confidence and resolution are part of the metric, because a broad or young
  scorer can hide meaningful feel gaps
- a better scorer may temporarily lower a score while improving the project
  because it exposes a truer gap
- the latest audio and challenge-stage work is a good example: stabilizing
  browser audio capture, adding composite analysis windows, and then adding
  calibrated browser-reference gates exposed the remaining cue-fit problem,
  while the stricter challenge-stage scorer lowered the apparent score because
  it now asks a better question about stage-by-stage arrival, alien novelty,
  choreography, and bonus-opportunity readability
- recent challenge-stage passes improved the dedicated score from `4.5/10` to
  `5.1/10`, then to `5.8/10` after adding measured wave/group identity. The
  latest no-fire reference-motion extraction pass intentionally tightened the
  read to `5.7/10` conformance and `5.6/10` interesting factor by measuring
  authored challenge motion without bullet-truncated paths. The current gap is
  no longer only "do challenge stages exist safely"; it is now stronger
  trajectory/reference matching, the stage-11 challenge-3 reference miss, active
  sprite-motion novelty, late Galaga reference labels, and bonus-readability
  probes.

## Per-Game Status

| Game | Role | Current conformance posture | Next conformance need |
| --- | --- | --- | --- |
| Aurora Galactica | First shipped Platinum application and current active investment target | Strong broad release-quality baseline, but challenge-stage runtime quality is the clearest player-facing conformance gap; impact/explosion feedback and temporal sprite/event feedback also remain weak | Build the first runtime-safe reference-spline challenge candidate, preserve visual presence and scoreable routes, and use before/after video evidence before claiming lift |
| Galaxy Guardians | Second-game preview, v1 playable-slice candidate, and Galaxian-style ingestion proof | Ingestion, reference, long-surface, audio, routeability, and persona evidence now exist; public readiness remains intentionally low and the current hosted slice should stay honestly preview-framed until v1 surfaces are stronger | Tighten the opening visible slice, score/result/replay identity, platform-frame parity, Watch/Rival/persona behavior, and stage-band fairness through [GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md](GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md) and [GALAXY_GUARDIANS_LONG_SURFACE_AND_PERSONA_PLAN.md](GALAXY_GUARDIANS_LONG_SURFACE_AND_PERSONA_PLAN.md) |
| Future games | Long-term repeatable ingestion target | Not yet active as playable work | Arrive through source manifests, reference windows, event logs, semantic profiles, score targets, and game-owned harnesses before design claims are made |

## How The Platform Helps The Conformance Effort

Platinum is not just a web shell around Aurora. It is becoming the reusable
infrastructure that makes measured game conformance practical.

Platinum helps by providing:

- local, dev, beta, and production lanes with explicit release identity
- a stable shell and pack-selection path for comparing games without rewriting
  the host
- a future sprite-mode surface that can compare reference-conformance lanes,
  Aurora production themes, and future-game variants without mixing target
  measurement with shipped creative art
- an optional full-window/cabinet display mode that can enlarge the active board
  for play and review while preserving game-owned mechanics, input mapping, and
  replay evidence
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

The standing self-critical work-block review is
[CONFORMANCE_INVESTMENT_RETROSPECTIVE.md](CONFORMANCE_INVESTMENT_RETROSPECTIVE.md).
It is generated from challenge-stage history, quality score history, dashboard
cost context, candidate sweeps, audio artifacts, and application artifact
scores. Its job is to say plainly where score movement is real, where it is
mostly measurement progress, and where Aurora is still not moving toward
human-level conformance quickly enough.

The project currently reads as heavily local-first:

- local CPU/browser harnesses are doing the overwhelming majority of measured
  conformance work
- Codex/OpenAI/model usage is essential for planning, implementation, synthesis,
  and analysis, but is under-instrumented unless we log it manually
- any serious long-cycle work should be wrapped with `npm run harness:measure`
  so we can compare resource cost against score movement
- after each large work block, run
  `npm run harness:analyze:conformance-investment-retrospective` so the public
  docs and dashboard show the latest self-critical read

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
2. dedicated challenge-stage arrival, alien novelty, trajectory variation, and
   high-bonus readability
3. regular alien entry geometry separation and path-family diversity
4. level arc and encounter shape
5. boss entry and formation grammar
6. visual look and feel, including start/attract typography and gameplay
   readability
7. arcade cabinet frame, popup, help, scoring, leaderboard, and result surfaces
8. pressure curve precision and exact replay of known source windows
9. Guardians ingestion promotion from preview metrics into stronger
   frame/audio/playtest evidence
10. Guardians score/progression/result identity so Platinum changes are
   validated against two real games instead of one game plus one preview shell

The next major release gate should be judged not only by a higher overall score,
but by whether the improved categories are the ones players actually feel.

## Release Recommendation

Current recommendation:

- treat the refreshed public `1.4.0` family as the stable production line
- treat hosted `/beta` as the authority-gated review lane for the next
  deliberate `1.4.0.1` candidate, not as an automatic mirror of local work
- treat hosted `/dev` and local topic branches as the place to assemble the
  next coherent improvement bundle
- keep the larger `1.4.x` family focused on arcade depth: audio feedback,
  dedicated challenge-stage set pieces, alien entry, stage progression,
  boss/formation grammar, visual reference grounding, and measured player
  experience evidence

Short term:

- keep beta-facing release notes and readiness docs aligned with the current
  `1.4.0-beta.1` baseline and any new topic-branch improvements
- keep all candidate work wrapped in `harness:measure`
- keep dashboard, scorecard, public project page, project guide, release notes,
  and strategic review aligned with the same current score read before the next
  beta candidate is cut

Latest local conformance response:

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
- sampled challenge stages preserve the safe Galaga-like no-shot/no-ship-loss
  rule, but the dedicated set-piece score is still only `5.1/10`.
- Stage 3, Stage 7, Stage 11, and Stage 15 now better separate their best
  reference matches, while Stage 19 has a new runtime extraction path but needs
  late-reference labels before it can become a high-confidence conformance
  target.

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
| Dedicated Aurora challenge-stage analysis and next plan | [CHALLENGE_STAGE_CONFORMANCE_ANALYSIS.md](CHALLENGE_STAGE_CONFORMANCE_ANALYSIS.md) and the rendered Application Guide challenge-stage section |
| Resource usage, local CPU, GPU-equivalent model work, and cost-per-score | [CONFORMANCE_ECONOMICS.md](CONFORMANCE_ECONOMICS.md) |
| Platform ownership and architecture | [PLATINUM.md](PLATINUM.md) and [PLATINUM_ARCHITECTURE_OVERVIEW.md](PLATINUM_ARCHITECTURE_OVERVIEW.md) |
| Immersive full-window gameplay mode | [IMMERSIVE_FULL_WINDOW_GAMEPLAY_MODE_PLAN.md](IMMERSIVE_FULL_WINDOW_GAMEPLAY_MODE_PLAN.md) |
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
