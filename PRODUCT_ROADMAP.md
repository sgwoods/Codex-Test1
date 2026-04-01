# Product Roadmap

## Current Release Train

- Current line:
  - `1.1.x` planning
- Current phase:
  - `post-launch stabilization and platform planning`
- Goal of this phase:
  - keep the shipped four-stage arcade slice stable while turning the broader
    identity, admin, and media work into a staged `1.1.x` / `1.2.x` platform
    program

## Immediate Target: 1.0 Four-Stage Slice

Definition:

- Stage `1`
- Stage `2`
- Stage `3` challenging stage
- Stage `4`

Quality bar:

- feels coherent and fair as one complete loop
- challenge stage is readable and rewarding
- capture / rescue is useful and understandable
- high scores / initials / game-over flow feel finished
- hosted build and public project pages feel reliable

This is the current product target. Expansion beyond Stage `4` is intentionally
secondary until this slice is polished.

## Milestone A: Four-Stage 1.0 Alpha

Target outcome:

- Strong Stage 1 through Stage 4 feel
- Stable Stage 3 challenge stage
- Capture/rescue behavior feels useful and understandable
- High-score/results/release flow feels shippable

Key issue groups:

- Gameplay tuning
  - `#4` Stage 1 fidelity
  - `#9` challenge-stage fidelity
  - `#18` Stage 4 survivability
  - `#32` Stage 2 opening pressure / spacing feel
- Current Modem-driven follow-up work inside the same milestone
  - `#35` capture-driven life-loss accounting in self-play summaries
  - `#38` ship-hit explosion / sound / post-hit pause feel
  - `#39` repeated fighter capture behavior within a stage
- Manual-backed arcade rules
  - `#14` second captured-fighter behavior research
- Capture/rescue rules
  - remaining rescue usefulness / clarity polish
  - make the released-fighter / rescue target read more prominently in live play
- Manual-backed visible arcade moments
  - ensure the Stage 4+ three-ship boss squadron appears naturally in regular
    gameplay and shows its bonus clearly during the four-stage slice
- Product polish
  - `#31` release date display refinement
  - high-score/results/initials polish as needed
  - move the temporary settings/account panel toward a more centered overlay or otherwise reposition it so long forms are not obscured at the bottom of the playfield
  - add a clearer visible playfield frame and tighten the integrated status / score-view HUD treatment

Suggested versioning:

- stay on `0.5.x-alpha`

Execution model:

- Use the autonomous reference-baseline track to decide what "closer to Galaga"
  means
- Use the collaborator-readiness track to make sure new contributors can help
  without re-learning the whole project

## Milestone B: Deployment And Playtest Readiness

Target outcome:

- Hosted build and companion public pages are trustworthy
- Feedback, replay, and artifact workflows are good enough for broader testing
- The four-stage slice is easy to share and evaluate externally

Key issue groups:

- Feedback and submission workflow
  - `#7` FormSubmit / Modem viability
  - `#8` structured run submission
- Replay and testing infrastructure
  - `#5` replay / watch mode
  - `#3` synthetic user agent / session replay work
- Operational polish
  - `#25` daily status automation
  - `#31` release display refinements if still open

Suggested versioning:

- `0.6.x-alpha`

## Milestone C: Post-1.0 Expansion Alpha

Target outcome:

- Later stages are not just “same enemies, more pressure”
- Better stage-to-stage variety and progression
- Theme/template work can happen without destabilizing the core shipped slice

Key issue groups:

- Later-stage survivability beyond Stage 4
  - `#19` Stage 2/late-run collision chain regressions
- Visual/gameplay comparison baseline
  - `#17` stronger baseline against original Galaga
- Replay, telemetry, and commentary-ready artifacts
  - `#69` remote gameplay logs and optional video artifacts
  - `#70` homepage recent plays and linked run viewing
  - `#81` commentary-ready gameplay telemetry for narrated replays
- Original-scoring / special-pattern research
  - deeper validation of Galaga's bonus-yielding three-fighter attack clusters,
    including exact timing, composition, and scoring triggers
- Theme/template work
  - `#26` through `#30`

Suggested versioning:

- `0.7.x-alpha` and beyond

## Milestone D: Broader External Playtest / Beta

Target outcome:

- The four-stage slice is polished and stable enough that broader outside
  testing is worth the overhead
- Operational tooling is good enough to collect useful feedback at scale

Suggested versioning:

- `0.8.0-beta.1`
- `0.9.x-rc`

## Milestone E: 1.0 Release

Target outcome:

- A polished, consciously scoped four-stage Galaga tribute
- Core rules and presentation feel stable
- The hosted build is trustworthy as the canonical public version

Suggested versioning:

- `1.0.0`

## Milestone F: Post-1.0 Environment Separation

Target outcome:

- production and non-production are operationally distinct
- public score integrity is not blurred by day-to-day development traffic
- release labeling makes environment intent obvious

Key issue groups:

- production vs pre-production score/data separation
- environment-aware build labeling and account/status presentation
- release workflow hardening between dev, production, and beta lanes

Suggested versioning:

- `1.0.x`
- `1.1.x`

## Milestone G: `1.1.x` Aurora Runtime Stabilization

Target outcome:

- Aurora keeps shipping cleanly while its current one-off runtime is separated
  into clearer internal layers
- runtime, shell, replay/logging, and service boundaries become explicit
- future extraction work can move modules without redesigning gameplay at the
  same time

Key issue groups:

- `#111` extract a shared arcade platform for Galaga-family cabinet shooters
- shell/replay/harness/input cleanup that creates real module seams
- selective post-launch polish that supports stable extraction boundaries
- `#44` bottom-right stage indicator only if it helps the stabilized HUD seam

Suggested versioning:

- `1.1.x`

## Milestone H: `1.1.x` Early Arcade Platform Extraction

Target outcome:

- Aurora keeps shipping as the first game pack on a more stable shared runtime
- replay, shell, harness, input, build, and logging systems become less one-off
- similar cabinet shooters can reuse mature systems with less churn

Key issue groups:

- `#111` extract a shared arcade platform for Galaga-family cabinet shooters
- early `gameDef` / game-pack extraction
- shared shell / replay / harness / build systems
- shared left-right cabinet input model for sibling fixed-screen shooters
- keep Aurora-specific gameplay rules local until a second game proves the seam

Suggested versioning:

- `1.1.x`
- `1.2.x`

## Milestone I: `1.2.x` Shared Services And Operator Surfaces

Target outcome:

- pilot identity, scoreboards, feedback, and environment separation become
  platform-owned services rather than Aurora-only assumptions
- the project gains the first operator tooling needed to support a growing
  game family

Key issue groups:

- `#126` separate non-production Supabase identities and score paths
- `#127` require permanent pilot identity and support account deletion
- `#128` brand and clarify account emails
- `#129` track scores by exact version
- `#124` control-centre/admin surface
- `#133` replace third-party feedback relay with a Cloudflare-owned path and
  evaluate free fallbacks as needed

Suggested versioning:

- `1.2.x`

## Milestone J: Shared Pilot Media And Publishing

Target outcome:

- authenticated pilot runs can become canonical shared run records
- selected validated runs can be published through the Aurora-owned YouTube channel
- pilot history can show official runs plus replay/watch links where available
- local replay remains the immediate playback path and fallback

Key issue groups:

- `#121` shared authenticated pilot media and YouTube publishing
- canonical Supabase run/video metadata for authenticated runs
- pilot-safe public identity rules using pilot ID / initials / callsign instead of email
- selected-run publish workflow and publish-state tracking
- Aurora-owned YouTube mirroring for approved runs
- fuller pilot scorebook/history with replay/watch links where available

Suggested versioning:

- `1.3.x`
- `1.4.x`
- potentially `1.5.x`
- explicitly before any future `2.0.0`

## Post-1.0 Architecture Themes

These are the architectural themes we should keep capturing incrementally during
the `v1` push so they can become the basis of a focused post-`v1` platform
plan.

- move game rules and tuning further into data-driven `gameDef` structures only
  after Aurora already runs cleanly on the extracted runtime
- use `#111` as the early post-`1.0` umbrella for turning Aurora into a shared
  arcade platform that can support Galaga variants, Galaxian, and other
  similar cabinet shooters
- isolate optional systems so capture, challenge stages, special squadrons, and
  dual-fighter behavior are less entangled with the core update loop
- keep mechanic-level harnesses and telemetry stable enough to survive larger
  runtime refactors
- separate engine-like concerns from game-specific rules only when the seam is
  real and already helping Aurora
- avoid building a generic physics engine or broad multi-genre engine layer too
  early
- decouple visual/stylistic assets toward a swappable brand-package only after
  the four-stage slice is stable enough that theming work does not destabilize
  launch
- evolve the log viewer from a local artifact tree toward an optional remote
  catalog after `1.0`, while keeping the current local-first debugging flow as
  the default
- add shared authenticated pilot media as a pre-`2.0` stretch goal only after
  pilot identity, local replay, and the early post-`1.0` platform seams are
  stable enough to support it cleanly
- use Aurora's ongoing work to reduce the eventual cost of supporting Galaxian
  and other future variants without pausing product progress now

## How We Should Use This Roadmap

- Use it to decide when a `PATCH` bump is enough versus when a `MINOR` bump is justified
- Use it to group open issues into meaningful release targets instead of treating the backlog as a flat list
- Use it as the default basis for Codex release recommendations after each meaningful pass
