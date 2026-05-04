# Aurora Galactica Plan

## Current State

Verified April 26, 2026:

- hosted `/dev`
  - `1.2.3+build.532.sha.b959491`
- hosted `/beta`
  - `1.2.3-beta.1+build.532.sha.b959491.beta`
- hosted `/production`
  - `1.2.3+build.532.sha.b959491`
- `main`
  - authoritative integration branch for the next cycle

This means:

- Aurora has completed the `1.2.3` trust-and-pilot production refresh
- dev, beta, and production are now aligned on the same shipped release family
- the next question is no longer "how do we push beta to production?"
- the next question is "what belongs in the next `1.3.0` fidelity cycle, and
  how do we use the parallel second-game and harness work well?"

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
- the next serious candidate should be assembled from `main` as a real
  `1.3.0` fidelity-and-depth step, not another immediate fast-follow patch
- the next meaningful public milestone should likely be a `MINOR` release in
  the `1.3.0` family
- the longer release-family phasing plan is tracked in
  [LONG_TERM_RELEASE_ROADMAP.md](LONG_TERM_RELEASE_ROADMAP.md)
- the concrete first level-expansion execution plan is tracked in
  [LEVEL_BY_LEVEL_EXPANSION_PLAN.md](LEVEL_BY_LEVEL_EXPANSION_PLAN.md)

## Long-Term Direction

The long-term platform goal is:

- a durable Platinum host for multiple arcade experiences
- same-control compliance across those experiences
- richer reference-video ingestion and analysis
- stronger personas, replay annotation, and future simulated-opponent support

That is the route to the next genuinely major era, not just incrementing a
major version number early.
