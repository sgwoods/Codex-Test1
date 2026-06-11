# Product Roadmap

## Current Shipped State

Verified June 11, 2026:

- hosted `/dev`
  - active `1.4.1.1` patch follow-through line; exact current build label is
    authoritative in hosted `build-info.json`
- hosted `/beta`
  - accepted `1.4.1-beta.1` reviewed patch lane
- hosted `/production`
  - live `1.4.1` public patch line

Aurora is in a `1.4.1` patch-release posture:

- production carries the current `1.4.1` public patch
- beta carried the accepted deliberate `1.4.1-beta.1` patch candidate
- dev carries the aligned `1.4.1.1` forward-review line with the consolidated
  Aurora challenge grammar, Guardians ingestion/conformance cleanup, refreshed
  conformance economics, public project guide, white paper, slides, dashboards,
  and review packet
- `main` is the forward line for the deliberate `1.4.1` patch and now matches
  the hosted `/dev` source commit
- future production promotions of similar scope should move a real public
  SemVer version rather than repeat the May 12 same-family exception

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
The current cross-workstream execution ordering is maintained in
[PROJECT_WIDE_WORKSTREAM_ALIGNMENT_2026-06-07.md](PROJECT_WIDE_WORKSTREAM_ALIGNMENT_2026-06-07.md).
The current release-family and issue-tracking schedule is maintained in
[RELEASE_SCHEDULE_AND_ISSUE_SPINE_2026-06-07.md](RELEASE_SCHEDULE_AND_ISSUE_SPINE_2026-06-07.md).
Use the roadmap for strategy and the schedule spine for current release
ownership.

## Near-Term Release Direction

### Stabilize `1.4.1`

Goals:

- keep hosted `/production`, hosted `/beta`, and hosted `/dev` aligned and
  trustworthy after the focused production patch
- keep release docs, scorecards, and committed evidence current
- make new-machine and two-machine development simple and safe

### `1.4.1` Patch Is The Production Packet

The current practical artifacts are:

- hosted `/dev`: `1.4.1.1`
- hosted `/beta`: `1.4.1-beta.1`

This family collects the accepted Stage 3 challenge-stage keepers, beta sign-in
repair, audio/theme lane clarity, security review refreshes, release-preflight
hardening, and current documentation refresh for the production patch packet.

Recommended gate:

- keep source, hosted `/dev`, and hosted `/beta` aligned around the next
  candidate after the patch publishes
- require at least one measurable user-facing improvement or a clearly
  documented negative result that changes the next investment decision
- keep hosted `/production` stable on the patch once published

### Pick Up `1.4.1`

The active source and pickup family is now:

- `1.4.1`

Reason:

- `1.4.0` already carried the first multi-game public Platinum story into the
  public product
- the next release should now deepen arcade play and platform clarity rather
  than simply repeating the same pitch

That pickup should focus on:

- Aurora challenge-stage runtime quality first: movement grammar and
  reference-backed target contracts are now strong enough to drive runtime
  implementation, while challenge-stage set-piece conformance remains around
  `4.3/10`
- Galaxy Guardians v1 slice completeness: opening presentation, score/result
  identity, platform-frame parity, Watch/Rival/persona reuse, and evidence
  gates before public-depth expansion
- shared personas, Watch, and Rival as Platinum/game-adapter capabilities that
  apply to every game rather than Aurora-only UI behaviors
- ingestion-to-runtime grammar so future games benefit from the Aurora and
  Guardians analysis work instead of starting again from subjective tuning
- audio identity, event feedback, and cue-contract runtime promotion only when
  measured guards pass
- alien entry, challenge-stage novelty, and level-arc progression
- movement fidelity as a guardrail plus targeted browser/manual review
- gameplay trust fixes
- platform-contract follow-through after the first layered release/version pass
- optional immersive full-window gameplay mode as a Platinum cabinet/display
  capability once input mapping, overlays, replay capture, and pack boundaries
  are harnessed
- level-by-level expansion planning
- challenging-stage and later-level depth
- shared-video evidence and publishing foundations
- the branch-level `Galaxy Guardians` cleanup that turns the current preview
  slice into a minimally complete one-level playable game with its own scores,
  endings, and platform-validation value
- the first-class Galaxy conformance pass in
  [GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md](GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md),
  including the aggregate parity gate
  `npm run harness:check:galaxy-guardians-first-class-conformance`
- incorporate the other machine's Galaxians-style sibling work and stronger
  harness/reference analysis into the main line deliberately

### Long-Term Release Families

The maintained release-family spine for the next Aurora, Guardians, Platinum,
ingestion, and issue-hygiene milestones is tracked in:

- [RELEASE_SCHEDULE_AND_ISSUE_SPINE_2026-06-07.md](RELEASE_SCHEDULE_AND_ISSUE_SPINE_2026-06-07.md)

The older high-level phasing pass for larger Aurora and Platinum milestones is
tracked in:

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
- use the first post-`1.4.0` parallel Guardians branch, often well suited to
  the always-online iMac M1, to make that second game genuinely playable enough
  to validate platform changes against two games
- treat near-parity for `Galaxy Guardians` as process parity first:
  game-owned evidence, game-owned metrics, game-owned score/replay/result
  identity, and a readable candidate-review path before demanding Aurora-like
  maturity

### Pick Up After `1.4.0`

Once `1.4.0` is out, the roadmap pickup should be:

- Short term: keep the shipped `1.4.1` public patch stable while using hosted
  `/dev` and hosted `/beta` to review the next candidate family.
- Medium term: `1.4.1` for guardrails, hosted-lane discipline, and platform
  cleanup, followed by `1.5.0` for level-by-level arcade depth plus
  platform-contract cleanup.
- Longer term: `1.6.0` for shared-video evidence and flight-recorder
  publishing, `1.7.0` for pilot-facing shell/message/cabinet-surface polish,
  and `2.0` for a genuinely multi-game Platinum candidate.

That sequencing should be treated as intentional carry-forward planning, not
something to rediscover after the release is already shipped. If the work
bundle changes, update the release schedule spine first and then let the
roadmap narrative follow.

Specific deferred shell/UI cleanup to hold for that `1.6.0` family:

- separate Platinum-owned developer tools from game-owned settings
- keep a first-class platform developer-tools entry in the quick-tools cluster
- add a first-class game-settings entry beside the game-selection/rocket area
  so active-game controls visually live with cabinet choice, not platform tools
- add the optional immersive full-window gameplay mode described in
  [IMMERSIVE_FULL_WINDOW_GAMEPLAY_MODE_PLAN.md](IMMERSIVE_FULL_WINDOW_GAMEPLAY_MODE_PLAN.md),
  with an earlier hidden `F` shortcut prototype allowed only while it remains
  guarded and measurable

Current conformance read:

- the latest cross-workstream alignment is in
  [PROJECT_WIDE_WORKSTREAM_ALIGNMENT_2026-06-07.md](PROJECT_WIDE_WORKSTREAM_ALIGNMENT_2026-06-07.md)
- see the generated score/target roll-up in
  [CONFORMANCE_METRICS_OVERVIEW.md](CONFORMANCE_METRICS_OVERVIEW.md)
- conformance economics now show `904` measured runs, roughly `58,277s` wall
  time, roughly `58,392s` CPU time, and an overall roll-up of `8.7/10`
- application artifact conformance is `7.46/10`, with
  `impact-explosion-visual-feedback` as the weakest artifact row
- Aurora challenge set-piece conformance is the most urgent user-facing
  gameplay gap: average current score `4.3/10`, movement `4.4/10`, graphics
  `4.5/10`, novelty `3.9/10`, target-video object fit `3.6/10`, and zero
  release-ready challenge contracts
- Aurora challenge grammar is now a process win rather than a runtime win:
  `25/25` first-five group contracts are reference-backed and control
  readiness is `8.6/10`, but promotion remains blocked by visual-presence,
  phase/order, and scoreable-route constraints
- Guardians long-surface/persona review is `7.0/10`; this is enough to guide a
  v1 push, not enough to claim full public maturity
- overall Aurora quality is `9.1/10` across the current scored categories
- audio identity and cue alignment is the weakest category at `6.9/10`; the
  process is stronger than the rounded runtime score, with cue-contract
  readiness at `9.09/10`, semantic event score at `9.78/10`, and acoustic event
  score at `6.30/10`
- level arc and encounter shape is now a high-priority scored category at
  `8.8/10`, backed by level-arc and stage-signature evidence. Remaining
  opportunity is in long-run non-repetition, exact pressure replay, and
  challenge/reward texture
- player movement conformance now reads `10/10`; the prior `8.0/10` gap was
  traced to harness recenter input suppression, not to gameplay movement
  constants
- latest audio investment produced both runtime reliability and measured
  candidate-loop value: normal inter-level/result phrases are guarded against
  clipping, final loss clears active transition beds before game-over ambience,
  the runtime-recovery harness verifies that critical reference cues actually
  start, the calibrated layered `playerHit` ship-loss cue remains in runtime,
  and a measured `enemyShot` threat-fire subwindow was promoted after focused
  gates, recapture, alignment, and quality guardrails. `challengePerfect`
  produced focused keepers but failed full-theme quality promotion, and
  `captureBeam` tail is now the highest current segment gap.
- the next major Aurora quality cycle is tracked in
  [AURORA_GALAGA_LONG_CYCLE_REVIEW.md](AURORA_GALAGA_LONG_CYCLE_REVIEW.md),
  with a baseline artifact at
  `reference-artifacts/analyses/aurora-galaga-long-cycle/baseline-2026-05-05.json`
  and the Track 1 movement finding at
  `reference-artifacts/analyses/aurora-galaga-long-cycle/movement-shot-feel-2026-05-06.json`
- Guardians preview gates are green as pass/fail 0.1 evidence, but they are not
  yet part of the Aurora numeric roll-up
- Guardians evidence-weighted reference conformance is now `7.7/10`, while the
  stricter playtest-weighted score is `6.9/10`, and the new longer-surface
  review is `7.0/10`; cue-target gates now require labeled square/noise
  windows, mixed-source cue candidates, component sprite targets,
  waveform/spectrogram previews, the reusable Platinum audio conformance lab
  output, and a real longer-surface/persona review instead of only one-level
  preview claims
- the maintained Galaxy-first-class target and investment strategy now lives in
  [GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md](GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md),
  with the current longer-surface/persona execution layer in
  [GALAXY_GUARDIANS_LONG_SURFACE_AND_PERSONA_PLAN.md](GALAXY_GUARDIANS_LONG_SURFACE_AND_PERSONA_PLAN.md),
  and the maintained stage-arc and homage-variant grammar in
  [GALAXY_GUARDIANS_STAGE_ARC_AND_HOMAGE_PLAN.md](GALAXY_GUARDIANS_STAGE_ARC_AND_HOMAGE_PLAN.md),
  with a standing aggregate process gate in
  `npm run harness:check:galaxy-guardians-first-class-conformance`
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
- add an optional full-window play presentation that reduces nonessential frame
  overhead while preserving escape, settings, score, help, and feedback access

Why:

- cabinet presentation and panel consistency are highly visible quality signals
- a larger board improves human review of sprites, motion, and challenge paths,
  but must stay separate from strict gameplay conformance scoring

### 6a. Immersive full-window play

Target:

- provide a hidden/developer `F` toggle that lets the active game board fill
  the available browser window without changing gameplay mechanics

Themes:

- preserve logical coordinates, input mapping, replay determinism, and scoring
- keep crisp pixel rendering and stable aspect ratio
- auto-collapse nonessential rails while keeping overlays reachable
- log mode changes so production and review usage can be understood later
- validate Aurora and Galaxy Guardians through shared Platinum shell harnesses

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

- support richer personas, Watch mode, Rival mode, and future
  player-versus-persona play across every Platinum game

Themes:

- stronger action/state annotation
- richer test personas
- eventual learn-by-playing simulation work
- a game-generic adapter for start state, playable scope, score ownership,
  run summaries, event logs, Watch scope, Rival opponent selection, and
  production score safety

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
