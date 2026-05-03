# Product Roadmap

## Current Shipped State

Verified April 26, 2026:

- hosted `/dev`
  - `1.2.3+build.532.sha.b959491`
- hosted `/beta`
  - `1.2.3-beta.1+build.532.sha.b959491.beta`
- hosted `/production`
  - `1.2.3+build.532.sha.b959491`

Aurora is in a post-production-refresh posture:

- production is current
- beta matches the current production family
- dev also matches the current production family
- `main` is the forward line for the next cycle

## Roadmap Frame

The roadmap is no longer centered on whether Platinum can host Aurora at all.

It is centered on:

- keeping the shipped line trustworthy
- improving fidelity where the game still feels less authentic than the arcade
  reference
- maturing Aurora as a product with durable pilot, replay, and release
  operations
- growing Platinum into a host for more than one serious game experience

## Near-Term Release Direction

### Stabilize `1.2.3`

Goals:

- keep hosted `/production`, hosted `/beta`, and hosted `/dev` aligned and
  trustworthy after the trust-and-pilot refresh
- keep release docs, scorecards, and committed evidence current
- make new-machine and two-machine development simple and safe

### Shape `1.3.0`

The next serious public step should likely be:

- `1.3.0`

That release family should focus on:

- movement fidelity
- audio identity polish
- gameplay trust fixes
- level-by-level expansion planning
- challenging-stage and later-level depth
- shared-video evidence and publishing foundations
- incorporate the other machine's Galaxians-style sibling work and stronger
  harness/reference analysis into the main line deliberately

### Long-Term Release Families

The first high-level phasing pass for the next major Aurora and Platinum
milestones is tracked in:

- [LONG_TERM_RELEASE_ROADMAP.md](LONG_TERM_RELEASE_ROADMAP.md)

The concrete first execution plan for level-by-level arcade depth is tracked in:

- [LEVEL_BY_LEVEL_EXPANSION_PLAN.md](LEVEL_BY_LEVEL_EXPANSION_PLAN.md)

Current decision:

- keep `1.x` focused on making Aurora excellent and preparing Platinum for a
  second real game
- reserve `2.0` for the first genuinely multi-game Platinum milestone
- treat `1.3` as the next measurement-backed quality release rather than a
  broad feature bundle
- promote level-by-level arcade depth to the next major product pillar after
  the `1.3` quality reset
- make shared gameplay-video publishing an early roadmap capability
- bring a preliminary second-game Platinum sneak peek forward before the full
  `2.0` multi-game release

Current conformance read:

- see [CONFORMANCE_METRIC_OVERVIEW.md](CONFORMANCE_METRIC_OVERVIEW.md)
- see the generated score/target roll-up in
  [CONFORMANCE_METRICS_OVERVIEW.md](CONFORMANCE_METRICS_OVERVIEW.md)
- overall Aurora quality is `8.8/10`
- audio identity and cue alignment is the weakest category at `6.1/10`
- player movement conformance is the next visible feel gap at `8.1/10`
- Guardians preview gates are green as pass/fail 0.1 evidence, but they are not
  yet part of the Aurora numeric roll-up
- Guardians reference conformance is now `7.4/10` after adding the
  score/progression contract, visible attract/score-table surfaces, the
  first CPU-only Galaxian frame-motion proxy pass, and a connected-component
  object-track proxy over the rack/dive/flagship/wrap evidence windows
- current cluster targets are `9.0/10` for Aurora and `7.4/10` for Guardians in
  the `1.3` Fidelity and Trust lane, rising toward `9.5/10` and `9.0/10` by
  the `2.0` multi-game Platinum candidate lane

## Main Investment Themes

### 1. Movement and control fidelity

Target:

- make player-ship motion feel smoother, calmer, and closer to real Galaga

Why:

- movement remains one of the clearest remaining feel gaps
- it directly affects player trust and cabinet authenticity

### 2. Audio and atmosphere

Target:

- improve audio identity beyond cue timing

Why:

- audio identity and cue alignment is the weakest measured category
- the remaining opportunity is personality, phrase feel, acoustic fit, and
  better reference-derived timing/evidence

### 3. Gameplay trust fixes

Target:

- continue closing player-visible correctness bugs and edge cases

Examples:

- boss/capture injury rules
- carry/captured-fighter render correctness
- replay-flow smoothness
- runtime hardening and freeze follow-up

### 4. Level-by-level arcade depth

Target:

- expand Aurora level progression with richer challenge stages, later-level
  entry variation, new alien types, movement families, and challenge patterns

Why:

- Aurora needs enough stage-by-stage detail and complexity to stand beside the
  original arcade reference, not just a strong early-stage loop
- challenging stages and later levels are highly visible proof that the game is
  maturing beyond the first release family

### 5. Shared videos and evidence

Target:

- publish selected gameplay videos into a shareable catalog or repository that
  users and developers can reference

Why:

- shared videos turn runs into durable evidence, player memory, issue context,
  and release-review material

### 6. UI, shell, and overlay polish

Target:

- unify popup, dock, and panel behavior and keep all surfaces well-contained

Why:

- cabinet presentation and panel consistency are highly visible quality signals

### 7. Pilot, leaderboard, replay, and operations

Target:

- mature Aurora’s player identity and operations surfaces

Themes:

- version-aware score history
- richer pilot scorebook and replay views
- permanent pilot identity
- account lifecycle and deletion
- replay/media and admin/control-centre growth

### 8. Environment and release separation

Target:

- keep non-production and production easier to reason about

Themes:

- cleaner identity and score-path separation
- stronger preflights
- safer production promotions

### 9. Platinum and multi-game growth

Target:

- turn Platinum into a durable multi-game arcade host

Themes:

- stronger pack contract
- cleaner storage/schema seam
- same-control compliance
- early second-game sneak peek before the full multi-game release
- second-game proof slice
- future `Galaxian` ingestion planning
- active Galaxians-style sibling proof and platform-pressure work on the other
  development machine

### 10. Personas and simulated opponents

Target:

- support richer personas and future player-versus-persona play

Themes:

- stronger action/state annotation
- richer test personas
- eventual learn-by-playing simulation work

## Platform Milestones

### Next platform milestone

- a stronger pack contract
- clearer platform/application seams
- a dev-only second-game proof slice
- stronger multi-machine and release portability

### Long-term platform milestone

- at least two meaningfully playable Platinum applications
- same-control compliance clearly documented and tested
- cleaner pack, storage, and naming boundaries
- richer persona/opponent support
