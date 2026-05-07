# Aurora Galactica Plan

## Current State

Verified May 5, 2026:

- hosted `/dev`
  - active `1.3.0` line
- hosted `/beta`
  - approved `1.3.0` beta lane
- hosted `/production`
  - shipped `1.3.0` public line
- `main`
  - authoritative integration branch for the `1.4.0` pickup after the `1.3.0` ship

This means:

- the `1.3.0` fidelity-and-second-cabinet release is now the stable public
  family
- hosted `/dev`, hosted `/beta`, and hosted `/production` are aligned around
  the same release family
- the active source-planning question has moved from "what must land for `1.3.0`?"
  to "what is the cleanest deliberate `1.4.0` pickup?"
- the post-release work should now be treated as intentional carry-forward, not
  as rediscovery after the ship is already done

## Active Workstreams

### 1. `1.3.0` Production Stabilization

- keep the shipped `1.3.0` production line trustworthy
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

### 3. `1.4.0` Fidelity And Feel Improvement

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

### 4. Gameplay Trust And Edge-Case Correctness

- continue addressing boss/capture/carry edge cases
- continue runtime-hardening follow-up where exact root causes are still being
  narrowed
- keep replay and late-run trust issues visible until closed

### 5. Shell, Overlay, And Pilot-Surface Polish

- keep popup, dock, and panel presentation unified and contained
- improve pilot, leaderboard, and replay surfaces where they are still rough
- keep production-safe defaults and developer restrictions disciplined

### 5a. Shared Video Evidence

- make exported gameplay videos publishable to a shared catalog or repository
- connect videos to issues, score records, release review, and player-facing
  history
- use shared videos as durable reference material between users and machines

### 6. Platform Boundary Cleanup

- keep pack contract thinking explicit
- reduce remaining Aurora-shaped platform residue
- improve the storage and schema seam before a second real playable game
- separate overall, platform, and per-game version tracking so release identity
  does not collapse into one number
- keep platform, application, and integrated-bundle candidate paths distinct so
  unrelated work does not cause avoidable regressions

### 7. Second-Application Proof

- keep `Galaxy Guardians` preview-only until a minimal playable slice is real
- actively advance the longer-range `Galaxian`-style ingestion path through
  durable reference analysis, platform extension planning, and the other
  machine's parallel work
- bring a preliminary second-game Platinum sneak peek forward before the full
  multi-game release so the platform layer is tested by real product pressure
- treat the long-term target as a game-owned ingestible package built from
  gameplay-video and reference-artifact analysis, not a Platinum-only special
  case

### 8. Personas And Simulated Opponents

- deepen action/event annotation so personas can become richer
- prepare for future player-versus-persona experiences
- keep "learn by playing" persona ideas tied to simulation and durable logs,
  not just aspiration

## Immediate Priorities

1. treat `main` as the authoritative post-production integration line
2. keep the multi-machine bootstrap and release-authority workflow healthy
3. prioritize level-arc shape, movement fidelity, audio identity polish, and
   boundary cleanup
4. incorporate the other machine's Galaxians-style second-game, harness, and
   analysis progress into the main roadmap
5. prioritize level-by-level arcade depth as the next major product pillar
6. make shared gameplay-video publishing an early evidence/product capability
7. continue narrow trust fixes from the open issue stream
8. execute the measured Galaga long-cycle quality plan in
   [AURORA_GALAGA_LONG_CYCLE_REVIEW.md](AURORA_GALAGA_LONG_CYCLE_REVIEW.md)
   before broad gameplay, complexity, or graphical tuning

Current conformance read:

- overall Aurora quality is `9.1/10` across eleven scored categories
- audio identity and cue alignment is the weakest category at `6.3/10`
- level arc and encounter shape is now a first-class high-priority category at
  `8.2/10`; the expanded six-window stage-signature distance harness scores
  `5.8/10` and shows the main next gap is separating repeated regular-stage
  signatures, especially late-run and mid/late pairs
- the audio score is now stricter: it includes active reference-cue similarity
  and reference-window precision, with `7/14` Aurora audio reference windows
  still needing tighter segmentation and `22` candidate subwindows now proposed
  for review/promotion
- player movement now scores `10/10` after repairing the movement conformance
  harness recenter path; no gameplay movement constants were changed
- the current quality score is captured in
  `reference-artifacts/analyses/quality-conformance/2026-05-07-53d37a8/report.json`
- the current long-cycle baseline is captured in
  `reference-artifacts/analyses/aurora-galaga-long-cycle/baseline-2026-05-05.json`
- the Track 1 movement/shot-feel finding is captured in
  `reference-artifacts/analyses/aurora-galaga-long-cycle/movement-shot-feel-2026-05-06.json`
- Galaxy Guardians 0.1 preview gates are green but pass/fail only, not part of
  the Aurora numeric roll-up yet

## Release Direction

- hosted `/dev`, hosted `/beta`, and hosted `/production` now reflect the same
  shipped `1.3.0` family
- the active source line should now present itself as the deliberate `1.4.0`
  pickup family
- `1.3.0` was the intentional bundle for fidelity, trust, and the first
  significant second-game Platinum story
- the shipped `1.3.0` family is now the stable public baseline while `main`
  begins the next minor-cycle work
- the longer release-family phasing plan is tracked in
  [LONG_TERM_RELEASE_ROADMAP.md](LONG_TERM_RELEASE_ROADMAP.md)
- the concrete first level-expansion execution plan is tracked in
  [LEVEL_BY_LEVEL_EXPANSION_PLAN.md](LEVEL_BY_LEVEL_EXPANSION_PLAN.md)

## Post-1.3.0 Pickup

After `1.3.0` ships, the plan should pick up in this order:

1. `1.4.0` arcade depth and platform-contract follow-through
2. `1.5.0` shared-video evidence and flight-recorder capabilities
3. `1.6.0` pilot-facing shell/message-to-pilot polish

That keeps the next cycle from collapsing back into unprioritized polish and
preserves the release-family shape already captured in the roadmap docs.

Deferred shell bug to carry into `1.6.0`:

- split `Platform Developer Tools` from game-specific settings instead of
  widening the current release scope
- keep platform developer tools as a Platinum-owned quick-tools surface
- place game settings with game identity/selection near the rocket so the
  active game's controls feel first-class and cabinet-local

## Long-Term Direction

The long-term platform goal is:

- a durable Platinum host for multiple arcade experiences
- independent version and release tracking for the bundle, the platform, and
  each game
- same-control compliance across those experiences
- richer reference-video ingestion and analysis
- game-owned conformance packages that can support launch through Platinum now
  and thinner hosts later if we choose
- stronger personas, replay annotation, and future simulated-opponent support

That is the route to the next genuinely major era, not just incrementing a
major version number early.
