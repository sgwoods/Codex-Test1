# Product Roadmap

## Current Shipped State

Verified May 12, 2026:

- hosted `/dev`
  - active `1.3.0.1` forward-review line
- hosted `/beta`
  - refreshed `1.3.0` reviewed lane sourced from the accepted `1.3.0.1`
    bundle
- hosted `/production`
  - refreshed `1.3.0` public line

Aurora is in a post-`1.3.0` ship posture:

- production now carries the current `1.3.0` public family
- beta remains the proving lane for the next release step
- dev carries the current forward review bundle
- `main` is the forward line for the deliberate `1.4.0` pickup

## Roadmap Frame

The roadmap is no longer centered on whether Platinum can host Aurora at all.

It is centered on:

- keeping the refreshed public line trustworthy
- improving fidelity where the game still feels less authentic than the arcade
  reference
- treating conformance as a standing project layer with its own ingestion,
  harnessing, dashboard, and resource-economics loop
- maturing Aurora as a product with durable pilot, replay, and release
  operations
- growing Platinum into a host for more than one serious game experience
- making release identity, testing, and tracking separable across the
  integrated bundle, the platform, and each game

The maintained top-level explanation of this program is
[PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md](PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md).

## Near-Term Release Direction

### Stabilize `1.3.0`

Goals:

- keep hosted `/production`, hosted `/beta`, and hosted `/dev` aligned and
  trustworthy after the fidelity-and-second-cabinet release
- keep release docs, scorecards, and committed evidence current
- make new-machine and two-machine development simple and safe

### `1.3.0.1` Review Bundle Is Now Publicly Carried

The current practical artifact is a fourth-segment hosted-dev increment:

- `1.3.0.1`

That bundle collected the documentation/dashboard/conformance process work,
application artifact conformance scoring, resource economics, and the measured
audio/event-feedback lift that have now been refreshed into the public `1.3.0`
family through hosted `/beta` and hosted `/production`.

Recommended gate:

- keep source and hosted `/dev` aligned for the next coherent review bundle
- require at least one measurable user-facing improvement or a clearly
  documented negative result that changes the next investment decision
- keep hosted `/beta` and hosted `/production` stable until a real `1.4.0`
  candidate exists

### Pick Up `1.4.0`

The active source and pickup family is now:

- `1.4.0`

Reason:

- `1.3.0` already carried the first second-cabinet Platinum story into the
  public product
- the next release should now deepen arcade play and platform clarity rather
  than simply repeating the same pitch

That pickup should focus on:

- audio identity, event feedback, and cue-contract runtime promotion only when
  measured guards pass
- alien entry, challenge-stage novelty, and level-arc progression
- movement fidelity as a guardrail plus targeted browser/manual review
- gameplay trust fixes
- platform-contract follow-through after the first layered release/version pass
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
- treat `1.4` as the first post-ship arcade-depth and platform-boundary family
- make conformance-program maturity a release asset: every major pickup should
  improve either the game, the ingestion/scoring system, the platform substrate,
  or the resource-economics loop
- promote level-by-level arcade depth to the next major product pillar after
  the `1.3.0` release
- make shared gameplay-video publishing an early roadmap capability
- bring a preliminary second-game Platinum sneak peek forward before the full
  `2.0` multi-game release

### Pick Up After `1.3.0`

Once `1.3.0` is out, the roadmap pickup should be:

- Short term: keep the refreshed `1.3.0` public family stable while using
  hosted `/dev` for the next real review bundle.
- Medium term: `1.4.0` for level-by-level arcade depth plus
  platform-contract cleanup.
- Longer term: `1.5.0` for shared-video evidence and flight-recorder
  publishing, `1.6.0` for pilot-facing shell/message/cabinet-surface polish,
  and `2.0` for a genuinely multi-game Platinum candidate.

That sequencing should be treated as intentional carry-forward planning, not
something to rediscover after the release is already shipped.

Specific deferred shell/UI cleanup to hold for that `1.6.0` family:

- separate Platinum-owned developer tools from game-owned settings
- keep a first-class platform developer-tools entry in the quick-tools cluster
- add a first-class game-settings entry beside the game-selection/rocket area
  so active-game controls visually live with cabinet choice, not platform tools

Current conformance read:

- see the generated score/target roll-up in
  [CONFORMANCE_METRICS_OVERVIEW.md](CONFORMANCE_METRICS_OVERVIEW.md)
- overall Aurora quality is `9.2/10` across the current scored categories
- audio identity and cue alignment is the weakest category at `7.3/10`; the
  process is stronger than the runtime score, with cue-contract readiness at
  `9.09/10`, semantic event score at `9.78/10`, and acoustic event score at
  `6.31/10`
- level arc and encounter shape is now a high-priority scored category at
  `8.8/10`, backed by level-arc and stage-signature evidence. Remaining
  opportunity is in long-run non-repetition, exact pressure replay, and
  challenge/reward texture
- player movement conformance now reads `10/10`; the prior `8.0/10` gap was
  traced to harness recenter input suppression, not to gameplay movement
  constants
- latest audio investment produced both runtime reliability and a measured
  cue-quality lift: normal inter-level/result phrases are less clipped,
  final loss clears active transition beds before game-over ambience, the
  runtime-recovery harness verifies that critical reference cues actually
  start, and the calibrated layered `playerHit` ship-loss cue was promoted
  after focused gates, precheck, recapture, alignment, and quality guardrails.
  `stagePulse` still needs a better pressure-bed strategy, and the residual
  `playerHit` tail remains the highest current segment gap.
- the next major Aurora quality cycle is tracked in
  [AURORA_GALAGA_LONG_CYCLE_REVIEW.md](AURORA_GALAGA_LONG_CYCLE_REVIEW.md),
  with a baseline artifact at
  `reference-artifacts/analyses/aurora-galaga-long-cycle/baseline-2026-05-05.json`
  and the Track 1 movement finding at
  `reference-artifacts/analyses/aurora-galaga-long-cycle/movement-shot-feel-2026-05-06.json`
- Guardians preview gates are green as pass/fail 0.1 evidence, but they are not
  yet part of the Aurora numeric roll-up
- Guardians evidence-weighted reference conformance is now `7.7/10`, while the
  stricter playtest-weighted score is `6.9/10` after local review found audio,
  pace, and graphic likeness still just short of a compelling Galaxian-style
  preview; cue-target gates now require labeled square/noise windows,
  mixed-source cue candidates, component sprite targets, waveform/spectrogram
  previews, and the reusable Platinum audio conformance lab output, while
  stage-rank gates require denser later-wave pressure
- current cluster targets are `9.2/10` for Aurora and `7.7/10` reference /
  `6.9/10` playtest for Guardians in the `1.3` Fidelity and Trust lane, rising
  toward `9.5/10` and `9.0/10` reference / `8.8/10` playtest by the `2.0`
  multi-game Platinum candidate lane

## Main Investment Themes

### 1. Movement and control fidelity

Target:

- keep player-ship motion inside the measured Galaga-derived control bands and
  use manual/browser review to identify any remaining feel gaps

Why:

- the numeric movement gap was a harness measurement issue, so further movement
  work should be reference-trace backed rather than constant-tuning by instinct
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

### 8. Layered release and ingestible games

Target:

- treat the integrated release, the Platinum platform, and each game as
  independently tracked release surfaces
- make every serious game ingestion path produce game-owned conformance and
  version artifacts from gameplay-video analysis and other primary evidence

Why:

- this reduces inadvertent regressions when work is concentrated in one layer
- it prepares the repo for a future where a game can launch through Platinum
  without being conceptually trapped inside it
- it keeps the ingestion and conformance program focused on highly conformant
  games built from durable source evidence

### 9. Environment and release separation

Target:

- keep non-production and production easier to reason about

Themes:

- cleaner identity and score-path separation
- stronger preflights
- safer production promotions

### 10. Platinum and multi-game growth

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

### 11. Personas and simulated opponents

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
- a non-production second-game proof slice
- stronger multi-machine and release portability

### Long-term platform milestone

- at least two meaningfully playable Platinum applications
- same-control compliance clearly documented and tested
- cleaner pack, storage, and naming boundaries
- richer persona/opponent support
