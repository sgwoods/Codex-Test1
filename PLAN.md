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

For the fastest quick current-state reopen, pair it with
[DEVELOPMENT_STATUS_UPDATE.md](DEVELOPMENT_STATUS_UPDATE.md).

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
4. keep the multi-machine bootstrap and release-authority workflow healthy
5. keep hosted `/dev` available for the next coherent review bundle instead of
   using it as a casual mirror of `main`
6. attack Aurora challenge-stage runtime quality first: the grammar and
   reference-backed contracts are ready enough, but the runtime challenge
   stages still score around `4.3/10` and need visible movement/readability
   lift
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
   before broad gameplay, complexity, or graphical tuning
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
  `4.5/10` graphics, `3.9/10` novelty, and no release-ready challenge
  contracts
- challenge-stage grammar is now materially ahead of runtime implementation:
  the first-five challenge work has `25/25` reference-backed group contracts
  and `8.6/10` control readiness, but runtime promotion is still blocked by
  visual-presence, phase/order, and scoreable-window constraints
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
