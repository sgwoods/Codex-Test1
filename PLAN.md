# Aurora Galactica Plan

## Current State

Verified April 25, 2026:

- hosted `/dev`
  - `1.2.3+build.470.sha.e4732eb`
- hosted `/beta`
  - `1.2.3-beta.1+build.489.sha.f6ba6c2.beta`
- hosted `/production`
  - `1.2.3+build.489.sha.f6ba6c2`
- `main`
  - authoritative integration branch for the next cycle

This means:

- Aurora has completed the `1.2.3` production refresh
- beta and production are aligned on the same shipped release family
- dev remains the older integration surface for comparison and future refresh
- the next question is no longer "how do we push beta to production?"
- the next question is "what belongs in the next polish cycle and next `/dev` refresh?"

## Active Workstreams

### 1. Post-Production Stabilization

- keep the refreshed `1.2.3` production line trustworthy
- keep release docs, scorecards, and committed evidence current
- keep the public project surfaces in sync with the real shipped state

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

### 4. Gameplay Trust And Edge-Case Correctness

- continue addressing boss/capture/carry edge cases
- continue runtime-hardening follow-up where exact root causes are still being
  narrowed
- keep replay and late-run trust issues visible until closed

### 5. Shell, Overlay, And Pilot-Surface Polish

- keep popup, dock, and panel presentation unified and contained
- improve pilot, leaderboard, and replay surfaces where they are still rough
- keep production-safe defaults and developer restrictions disciplined

### 6. Platform Boundary Cleanup

- keep pack contract thinking explicit
- reduce remaining Aurora-shaped platform residue
- improve the storage and schema seam before a second real playable game

### 7. Second-Application Proof

- keep `Galaxy Guardians` preview-only until a minimal playable slice is real
- prepare the longer-range `Galaxian`-style ingestion path through durable
  reference analysis and platform extension planning

### 8. Personas And Simulated Opponents

- deepen action/event annotation so personas can become richer
- prepare for future player-versus-persona experiences
- keep "learn by playing" persona ideas tied to simulation and durable logs,
  not just aspiration

## Immediate Priorities

1. treat `main` as the authoritative post-production integration line
2. keep the multi-machine bootstrap and release-authority workflow healthy
3. prioritize movement fidelity, audio identity polish, and boundary cleanup
4. continue narrow trust fixes from the open issue stream
5. decide when the next coherent polish bundle is strong enough to refresh
   hosted `/dev`

## Release Direction

- hosted `/beta` and hosted `/production` already reflect the current shipped
  `f6ba6c2` family
- the next serious candidate should be assembled from `main` and then refreshed
  into hosted `/dev` deliberately
- the next meaningful public milestone should likely be a `MINOR` release in
  the `1.3.0` family
- the longer release-family phasing plan is tracked in
  [LONG_TERM_RELEASE_ROADMAP.md](LONG_TERM_RELEASE_ROADMAP.md)

## Long-Term Direction

The long-term platform goal is:

- a durable Platinum host for multiple arcade experiences
- same-control compliance across those experiences
- richer reference-video ingestion and analysis
- stronger personas, replay annotation, and future simulated-opponent support

That is the route to the next genuinely major era, not just incrementing a
major version number early.
