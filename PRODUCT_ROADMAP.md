# Product Roadmap

## Current Release Train

- Current line:
  - `0.5.x-alpha`
- Current phase:
  - `alpha`
- Goal of this phase:
  - turn the project from a strong tribute prototype into a polished, shippable
    four-stage arcade slice

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

## Post-1.0 Architecture Themes

These are the architectural themes we should keep capturing incrementally during
the `v1` push so they can become the basis of a focused post-`v1` platform
plan.

- move game rules and tuning further into data-driven `gameDef` structures
- isolate optional systems so capture, challenge stages, special squadrons, and
  dual-fighter behavior are less entangled with the core update loop
- keep mechanic-level harnesses and telemetry stable enough to survive larger
  runtime refactors
- separate engine-like concerns from game-specific rules only when the seam is
  real and already helping Aurora
- use Aurora's ongoing work to reduce the eventual cost of supporting Galaxian
  and other future variants without pausing product progress now

## How We Should Use This Roadmap

- Use it to decide when a `PATCH` bump is enough versus when a `MINOR` bump is justified
- Use it to group open issues into meaningful release targets instead of treating the backlog as a flat list
- Use it as the default basis for Codex release recommendations after each meaningful pass
