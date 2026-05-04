# Aurora Galactica Plan

## Current State

Verified May 4, 2026:

- hosted `/dev`
  - `1.3.0+build.567.sha.d0d3bd6`
- hosted `/beta`
  - `1.3.0-beta.1+build.568.sha.e270d85.beta`
- hosted `/production`
  - `1.2.3+build.532.sha.b959491`
- `main`
  - authoritative integration branch for the active `1.3.0` candidate family

This means:

- Aurora has completed the `1.2.3` trust-and-pilot production refresh
- hosted `/dev` now carries the live `1.3.0` candidate line
- hosted `/beta` now carries the live `1.3.0` beta lane
- hosted `/production` remains on the stable `1.2.3` public baseline
- the active source candidate is now the `1.3.0` family
- the current question is no longer "should this be a `1.2.4` fast follow?"
- the current question is "what must land for `1.3.0`, and what should be
  deliberately picked up immediately after that release?"

## Active Workstreams

### 1. Post-Production Stabilization

- keep the refreshed `1.2.3+build.532.sha.b959491` production line trustworthy
- keep release docs, scorecards, and committed evidence current
- keep the public project surfaces in sync with the real shipped state
- use [CONFORMANCE_METRIC_OVERVIEW.md](CONFORMANCE_METRIC_OVERVIEW.md) as the
  readable current quality map before choosing beta-shaping work

### 2. Multi-Machine Release Discipline

- make new-machine bring-up one practical bootstrap command
- keep a committed one-authority release model
- keep beta and production promotion blocked unless the authority contract is
  satisfied
- keep public project-page and rendered-homepage verification inside the
  release workflow

### 3. Fidelity And Feel Improvement

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

### 7. Second-Application Proof

- keep `Galaxy Guardians` preview-only until a minimal playable slice is real
- actively advance the longer-range `Galaxian`-style ingestion path through
  durable reference analysis, platform extension planning, and the other
  machine's parallel work
- bring a preliminary second-game Platinum sneak peek forward before the full
  multi-game release so the platform layer is tested by real product pressure

### 8. Personas And Simulated Opponents

- deepen action/event annotation so personas can become richer
- prepare for future player-versus-persona experiences
- keep "learn by playing" persona ideas tied to simulation and durable logs,
  not just aspiration

## Immediate Priorities

1. treat `main` as the authoritative post-production integration line
2. keep the multi-machine bootstrap and release-authority workflow healthy
3. prioritize movement fidelity, audio identity polish, and boundary cleanup
4. incorporate the other machine's Galaxians-style second-game, harness, and
   analysis progress into the main roadmap
5. prioritize level-by-level arcade depth as the next major product pillar
6. make shared gameplay-video publishing an early evidence/product capability
7. continue narrow trust fixes from the open issue stream

Current conformance read:

- overall Aurora quality is `8.8/10`
- audio identity and cue alignment is the weakest category at `6.1/10`
- player movement is the next visible feel gap at `8.0/10`
- Galaxy Guardians 0.1 preview gates are green but pass/fail only, not part of
  the Aurora numeric roll-up yet

## Release Direction

- hosted `/dev`, hosted `/beta`, and hosted `/production` now reflect the same
  shipped `b959491` family
- the active source line should now present itself as the `1.3.0` candidate
  family
- `1.3.0` is the intentional bundle for fidelity, trust, and the first
  significant second-game Platinum story
- the shipped `1.2.3` family remains the stable public baseline until a formal
  `1.3.0` promotion path is completed
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
- same-control compliance across those experiences
- richer reference-video ingestion and analysis
- stronger personas, replay annotation, and future simulated-opponent support

That is the route to the next genuinely major era, not just incrementing a
major version number early.
