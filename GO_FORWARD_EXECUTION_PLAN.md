# Aurora And Platinum Go-Forward Execution Plan

This document turns the development principles into a concrete operating plan.

Use it when deciding:

- what to work on next
- how bugs move from report to fix
- how reference fidelity work should be structured
- how release candidates should be assembled and promoted

## Current Release Posture

As of May 12, 2026:

- hosted `/dev` points at:
  - the active `1.3.0.1` forward-review line
- hosted `/beta` now points at:
  - the refreshed `1.3.0` reviewed lane sourced from the accepted `1.3.0.1`
    bundle
- hosted `/production` now points at:
  - the refreshed `1.3.0` public line

This means:

- the `1.3.0` quality-and-second-cabinet release remains the public baseline
  on hosted `/production`, now refreshed through the accepted `1.3.0.1` bundle
- hosted `/dev` remains the forward review lane while hosted `/beta` and
  hosted `/production` now preserve the refreshed public family
- the active source release family has moved on to the deliberate `1.4.0`
  pickup
- the immediate execution question is now what the first coherent `1.4.0`
  review bundle should be and what should remain queued behind it

The forward line and the current shipped family now include:

- dedicated audio cue correspondence is green at `9/9`
- challenge entry and post-challenge cue timing are effectively on target
- the reference-audio session reset fix is part of the current `/dev` line
- the follow-on stage-1 convoy-pulse refinement has now brought the broader
  stage-1 opening correspondence report to `4/4`
- the refreshed audio theme comparison harness now captures each cue in a fresh
  harness session, which gives us current branch-local audio identity evidence
  again on this machine

## Current Working Reality

We are operating in a post-`1.3.0` stewardship phase.

That means:

- the live `1.3.0` line should remain trustworthy
- stable `beta` / `production` artifacts are preserved and should not be
  rewritten casually
- current `main` should now contain deliberate `1.4.0` pickup work, not
  accidental spillover from the shipped family
- recovered local work exists and should be integrated intentionally
- release gates are important, but individual harnesses may need repair before
  they can be trusted again

The project is therefore not in a "ship fast from wherever we are" mode.

It is in a "continue deliberately without losing agility" mode.

## Multi-Machine Operating Rule

Aurora now has a standard multi-machine workflow.

Default:

- `main` is the only integration branch
- either machine may develop and push topic branches
- one machine holds release authority at a time
- hosted `/beta` and hosted `/production` may only be published from that
  authority machine

For startup and daily work:

- `npm run machine:bootstrap`
- `npm run machine:doctor`
- `npm run machine:status`

See:

- [MULTI_MACHINE_WORKFLOW.md](MULTI_MACHINE_WORKFLOW.md)
- [release-authority.json](release-authority.json)

## Go-Forward Branching And Lane Plan

### Active Code Line

For the next cycle, the active working line should be:

- branch: `main`

Use `main` as the current integration branch because:

- it now contains the shipped `1.3.0` production line and the first
  post-release layered-versioning contract
- it includes the current release policy, scorecard, correspondence framework,
  committed analysis artifacts, and production-ready defaults
- it is now the cleanest base for the next narrow gameplay/fidelity branches

### Day-To-Day Development Branching

For new work, branch from the current integration line into short-lived topic
branches, then merge back into `main`.

Recommended branch families:

- `codex/<machine-id>-timing-*`
- `codex/<machine-id>-audio-*`
- `codex/<machine-id>-fidelity-*`
- `codex/<machine-id>-bugfix-*`
- `codex/<machine-id>-pilot-*`
- `codex/<machine-id>-platform-*`
- `codex/<machine-id>-galaxian-*`
- `codex/platform-high-score-video-publishing`
- `codex/platform-arcade-music-mode`
- `codex/platform-player-two-persona-mode`

Default rule:

- work in topic branches
- merge back into `main`
- republish hosted `/dev` only when the integrated branch is again coherent and
  worth sharing

For the current high-visibility platform feature set, keep the branches
separate. High-score video publishing, Arcade Music, and Player Two persona
mode touch different risk surfaces and should not be reviewed as one mixed
bundle unless their shared contract has already landed.

### When To Republish Hosted `/dev`

Republish hosted `/dev` when one of these is true:

- a topic bundle materially improves one of the weak scorecard categories
- a bug fix changes the shared integration experience enough that reviewers
  should use the hosted lane
- the current integration branch has changed enough that local-only review is
  becoming a liability

For the immediate next cycle, that means:

- do not republish `/dev` for every single small change
- group the next meaningful fidelity work into a small bundle
- refresh the scorecard and lane metadata when that bundle is ready
- use the `1.3.0.1` hosted-dev increment as the visible forward-review posture
  until the next coherent review bundle supersedes it

### When To Shape The Next Hosted `/beta`

Do not move current hosted `/dev` to hosted `/beta` as an automatic mirror
operation. The accepted `1.3.0.1` lane has already refreshed the public
family; the next hosted `/beta` should wait for a real `1.4.0`-shaped
candidate.

The next hosted `/beta` should wait until we have:

- at least one real improvement bundle beyond simple `/dev` parity
- clearer progress on the weakest scorecard categories
  - audio identity and cue alignment
  - player movement conformance
  - challenge-stage timing/content depth
- a refreshed scorecard that shows a more defensible quality step over the
  current stable beta/prod line
- release notes and docs that can honestly explain why this is the next serious
  candidate
- release authority on the machine that performs the beta publish

Practical standard:

- current hosted `/dev` is the visible `1.3.0.1` forward-review line
- the next hosted `/beta` should only be cut once the docs, dashboards,
  release note, and current conformance read describe a real `1.4.0`-scale
  improvement bundle
- beta and production publish still must happen from `imacm1 / iMacM1` unless
  release authority is explicitly transferred
- the next larger beta family remains `1.4.0` arcade depth
- after refreshing the audio process with cue contracts, promotion prechecks,
  layered cue support, composite analysis windows, and calibrated
  browser-reference gates, audio identity remains the weakest runtime category
  at `7.3/10`, while the process is now better instrumented: semantic event
  score is `9.78/10`, acoustic event score is `6.31/10`, cue-contract readiness
  is `9.09/10`, and the highest measured gap is the smaller residual
  `playerHit` tail. The latest accepted runtime lift is a layered `playerHit`
  ship-loss phrase that improved full-theme cue gap by `2.65/10`. The next
  audio pass should refine the remaining tail gap and then return to
  `stagePulse` pressure-bed strategy.
- level arc and encounter shape is now a first-class quality category at
  `8.8/10`; this should be treated as a high-priority `1.4` workstream because
  it measures whether the run develops Galaga-like stage shape instead of
  repeating a strong early loop
- the six-window stage-signature read is now `6.4/10` after adding attack-role
  features, a stage-14 late escort variation, stage-8 flank-dive grammar, and
  calibrated event-family presence scoring. This is a useful conformance gain,
  but the next higher-return target is the remaining Stage 4 pressure precision
  gap, especially the butterfly lane-2 source window, plus richer
  challenge/reward texture
- movement now scores `10/10` after repairing the movement conformance harness
  recenter path; the prior `8.0/10` read was measurement suppression, not a
  gameplay-control regression
- next movement work should be manual/browser review plus richer reference
  trace extraction, not blind constant tuning
- next implementation value is now highest in level-arc shape: pressure replay
  precision, challenge-stage reward texture, gameplay-scale graphics, and audio
  identity
- next-cycle work should be grouped deliberately into:
  - movement and control fidelity
  - gameplay complexity and challenge-stage depth
  - graphical quality at gameplay scale
  - audio identity, cue contracts, and theme latitude
  - gameplay trust and edge-case correctness
  - shell, overlay, and dock polish
  - pilot, leaderboard, replay, and admin operations
  - non-production versus production environment separation
  - Platinum multi-game and pack-contract maturation
- after `1.3.0`, the pickup order should stay explicit:
  - short term: keep the refreshed public line stable while assembling the next
    hosted `/dev` review bundle
  - medium term: `1.4.0` arcade depth and platform-contract follow-through
- longer term: `1.5.0` shared-video evidence and `1.6.0` pilot-facing
  cabinet polish, leading toward `2.0` multi-game Platinum
- high-visibility platform work should follow the dedicated plan in [PLATFORM_FLASHY_FEATURES_ROADMAP.md](PLATFORM_FLASHY_FEATURES_ROADMAP.md): start with opt-in Arcade Music, then backend-safe high-score video publishing, then signed-in Player Two persona mode once the persona adapter contract is stronger

### `1.3.0.1` Beta And Production Promotion Record

The accepted `1.3.0.1` hosted-dev review bundle was promoted using this
authority-machine path:

1. sync the authoritative source repo from `origin/main`
2. run machine bootstrap/status/doctor and confirm release authority still
   points at `imacm1 / iMacM1`
3. run `npm run build`
4. run `npm run harness:check:documentation-freshness`
5. run `npm run publish:check:dev`
6. inspect the hosted `/dev` lane and release note
7. publish hosted `/beta` only from the authority machine
8. approve the refreshed beta candidate
9. publish hosted `/production`
10. verify hosted beta, hosted production, public sync, and post-publish
    machine health

The MacBook may continue source, branch, commit, push, merge, and hosted-dev
work, but it should not approve beta or publish beta while release authority
remains on `imacm1`.

See also:

- [AURORA_GALAGA_LONG_CYCLE_REVIEW.md](AURORA_GALAGA_LONG_CYCLE_REVIEW.md)
- [BETA_CANDIDATE_PLAN.md](BETA_CANDIDATE_PLAN.md)
- [LONG_TERM_RELEASE_ROADMAP.md](LONG_TERM_RELEASE_ROADMAP.md)
- [LEVEL_BY_LEVEL_EXPANSION_PLAN.md](LEVEL_BY_LEVEL_EXPANSION_PLAN.md)

## Operating Priorities

### 1. Keep The Live Line Trustworthy

Always preserve:

- hosted `/production`
- hosted `/beta`
- checked-in local `dist/beta`
- checked-in local `dist/production`
- release metadata and approval lineage

No work should overwrite those baselines unless we are intentionally performing
a new promotion cycle.

Current interpretation:

- hosted `/beta` and hosted `/production` now share the same refreshed public
  base
- hosted `/dev` remains the forward-review lane for the next intentional
  improvement cycle

### 2. Require Harness Thinking For Bug Fixes

Default workflow for any bug:

1. reproduce the issue
2. classify it:
   - platform
   - application
   - boundary
   - release / pipeline
3. identify the right staging harness family
4. decide whether:
   - an existing check should be updated
   - a new targeted check should be added
   - a temporary manual gate is needed before automation is practical
5. implement the fix
6. run the targeted check plus one nearby regression check
7. record any remaining automation gap explicitly

The rule is:

- no bug fix should disappear into code history without a corresponding test or
  a documented reason it is still manual
- movement tuning now follows the same principle:
  - start from [MOVEMENT_REFERENCE_TRACE_PLAN.md](MOVEMENT_REFERENCE_TRACE_PLAN.md)
  - use `tools/harness/reference-profiles/player-movement-reference-traces.json`
  - avoid further blind movement-constant tuning before trace-backed evidence exists

### 3. Keep Change Scope Small

Default branch and commit behavior:

- one topic per branch
- one concern per commit
- small changes over mixed bundles
- preserve reviewability for later laptop or release integration

Preferred branch families:

- `codex/safe-*`
- `codex/recovery-*`
- `codex/pre-beta-*`
- `codex/reference-*`

### 4. Use The Smallest Relevant Gate Set

For each change, choose the smallest useful gate profile that covers the risk.

Examples:

- gameplay bug:
  - targeted application harness
  - one nearby gameplay regression check
  - one boundary smoke if relevant
- platform shell change:
  - platform check
  - one pack-boot or reset smoke
- release-tooling change:
  - publish preflight
  - metadata verification
  - live-lane verification where relevant

Avoid running every check for every change unless the candidate truly warrants
that cost.

## Reference Fidelity Program

### Aurora / Galaga Track

Continue treating `Galaga` as the main fidelity reference for Aurora.

For each fidelity topic:

1. identify the source
2. capture reference artifacts
3. describe current Aurora behavior
4. define the gap
5. connect the gap to:
   - an issue
   - a harness or metric
   - a release or milestone

Preferred artifact outputs:

- timing reports
- event-family libraries
- reference video event logs
- scenario logs
- contact sheets
- labeled image crops
- captured clips
- cue matrices
- waveforms
- reference README summaries

See also:

- [CORRESPONDENCE_FRAMEWORK.md](CORRESPONDENCE_FRAMEWORK.md)

### Second-Game / Galaxian Track

Start a parallel but staged reference program for the `Galaxian`-inspired
second game.

Initial focus:

- single-shot pressure
- wrap-around threat
- flagship / escort behavior
- formation cadence
- scoring rhythm
- audiovisual identity

The goal is not immediate implementation.

The goal is to build the same kind of durable reference base we now expect for
Aurora.

Longer-term platform goal:

- ingest a second classic fixed-screen shooter reference lineage with minimal
  user intervention once the source footage, manuals, and comparative
  artifacts are in place
- use those artifacts to:
  - analyze the game in all major aspects
  - propose the Platinum extension points required to host it cleanly
  - generate and refine a playable pack iteratively rather than by starting
    from an empty design pass
- preserve same-control compliance across hosted games so the player can move
  between Platinum experiences without relearning the basic control contract

### Variation Rule

Variation is allowed when it is:

- intentional
- documented
- still true to the original arcade experience as tribute
- implemented on the game side rather than by bending the platform

Every meaningful divergence should be explainable.

## Persona And Difficulty Evidence

Treat persona evidence as part of gameplay tuning, not as optional polish.

We should maintain or expand checks that help answer:

- can novice players enter the game successfully?
- can intermediate players progress deeper by learning?
- can advanced players demonstrate that later stages are survivable with
  stronger skill?
- does difficulty rise in a meaningful curve rather than in noisy spikes?

Useful evidence sources:

- persona harnesses
- repeatability checks
- run summaries
- loss clustering
- stage metrics
- score flow
- challenge outcomes

Longer-term persona goal:

- annotate gameplay and player actions richly enough that personas can be used
  for more than passive regression testing
- support a viable `Player 2`-style experience where a human player can
  compete against curated persona play styles
- eventually support a persona that can learn by playing through simulation,
  with its behavior evaluated against the same fidelity, fairness, and
  progression evidence we already use for Aurora

Current active finding:

- the first persona/progression correspondence pass preserved all per-persona
  baseline guardrails but did not preserve a strict current progression ladder
- on the current `full-run-persona` seeds, `advanced` outperformed `expert`
- the clearest concrete difference in the current evidence is that `expert`
  loses two early stage-2 lives to boss-collision events, while `advanced`
  survives that early window and carries farther
- treat this as an active tuning and persona-definition investigation item
  before using current progression evidence as a clean signal of skill ordering
- that `advanced -> expert` issue has since been repaired with the expert
  stage-2 safety guardrail and targeted expert tuning
- the remaining progression issue is now `expert -> professional`
- current stage-2 throughput evidence says the gap is concentrated on shared
  seed `51101`, where `professional` stays alive but misses the highest-value
  dive conversions that `expert` turns into `1600`-point awards
- the focused `professional-stage2-dive-awards` harness now captures that
  difference directly on seed `51101` as `3600` high-value boss-dive points
  for `expert` versus `800` for `professional`
- the newer `professional-stage2-boss-window` harness shows the gap starts even
  earlier: on seed `51101`, `expert` produces `3` boss attack starts in the key
  window while `professional` produces only `1`
- the `professional-stage2-pre-boss-clear` harness narrows the cause again:
  before the boss window opens, `professional` matches `expert` on total
  pre-boss kill count and even exceeds it on pre-boss points, but fails to
  remove the one formation boss that `expert` clears for `150`
- the newer `professional-stage2-shot-window` diagnostic harness should be used
  to compare early shot cadence, bullet occupancy, and cooldown state around
  that missing formation-boss conversion on seed `51101`
- the `professional-stage2-shot-cadence` diagnostic harness should be used
  alongside it to compare pre-boss shot count, shot spacing, and the timing of
  first boss damage between `expert` and `professional`
- keep the improved `professional` decision logging in place and use that
  evidence to shape the next narrow tuning pass around high-value dive
  conversion and pre-boss sequencing rather than generic aggression or
  survivability

Manual play should still validate feel, but the evidence should make difficulty
claims explicit.

## Release-Candidate Assembly Plan

When unreleased work has diverged, assemble the next candidate intentionally.

Recommended order:

1. preserve stable beta/prod baselines
2. repair untrusted gates that block confidence
3. choose the candidate foundation:
   - forward `main`
   - or a controlled `pre-beta` branch from the stable shipped line
4. integrate changes in narrow groups
5. validate each group before moving to the next
6. only then publish hosted `/dev`
7. only after hosted `/dev` is trustworthy, consider `/beta`
8. only after approved `/beta`, consider `/production`

See also:

- [RELEASE_LANE_MODEL.md](RELEASE_LANE_MODEL.md)
- [NEXT_DEV_CANDIDATE_MAP.md](NEXT_DEV_CANDIDATE_MAP.md)
- [NEXT_DEV_CANDIDATE_PROPOSAL.md](NEXT_DEV_CANDIDATE_PROPOSAL.md)

## Immediate Execution Sequence

### Phase 1: Validation And Candidate Hygiene

1. keep stable beta/prod artifacts untouched
2. continue repairing any untrusted harnesses that block confidence
3. manually validate recovered Aurora gameplay changes
4. decide the next candidate foundation explicitly

### Phase 1 Status

This phase is now complete enough to change posture:

- hosted `/dev` has been refreshed and verified
- the current integration branch is aligned with the hosted lane
- the quality score is now part of the release record

The next phase should therefore shift from recovery and lane catch-up into
deliberate improvement work.

### Phase 2: Improve From The New `/dev` Baseline

Work order for the next cycle:

1. stage-1 timing fidelity
2. challenge-stage timing fidelity
3. audio identity, cue contracts, and cue alignment
4. movement smoothness, if it still remains noticeable after the timing/audio
   work

Execution rule:

- each topic should land first on a short-lived topic branch
- then merge into `codex/document-project-principles`
- then refresh hosted `/dev` only when the integrated bundle is worth sharing

### Phase 3: Assemble The Next `/beta` Candidate

Only after Phase 2 yields a stronger scorecard should we begin the next hosted
`/beta` cycle.

The next `/beta` candidate should aim to be:

- clearly ahead of current hosted `/beta` / `/production`
- more than simple parity with hosted `/dev`
- stronger in at least the current weakest fidelity categories
- accompanied by refreshed release notes, dashboard language, and scorecard
- versioned as the next intended `MINOR` family if it carries the first serious
  second-cabinet / second-game story; do not present that candidate as a
  `1.2.4` patch by default

### Phase 2: Controlled Candidate Construction

1. create a controlled candidate branch
2. bring in recovered gameplay work in isolated commits
3. bring in harness or tooling fixes separately
4. validate after each integration step

### Phase 3: Reference Expansion

1. continue Galaga timing / audiovisual / rules analysis
2. build comparable artifact patterns for the future Galaxian-inspired game
3. keep reference outputs durable and reusable
4. build correspondence reports that compare:
   - reference vs candidate
   - shipped baseline vs candidate
   - forward line vs recovered work
5. maintain:
   - [REFERENCE_MEDIA_INVENTORY.md](REFERENCE_MEDIA_INVENTORY.md)
   - [ANALYSIS_ROADMAP.md](ANALYSIS_ROADMAP.md)
   as the persistent index of what evidence already exists and what analysis should be attempted next
6. use [VIDEO_ALIGNMENT_PROGRAM.md](VIDEO_ALIGNMENT_PROGRAM.md) plus:
   - `tools/harness/reference-profiles/reference-video-event-log.json`
   - `tools/harness/reference-profiles/reference-visual-artifact-catalog.json`
   to keep waveform analysis, labeled video windows, Aurora-like reference logs, and visual artifact catalogs part of the normal fidelity workflow
7. use those preserved traces and labels to tighten player-ship movement until
   it no longer reads as noticeably too jerky or too fast relative to the real
   arcade footage

### Phase 4: Release Movement

1. refresh local candidate
2. decide whether the candidate is actually better than the current published
   hosted `/dev`
3. publish hosted `/dev`
4. verify hosted `/dev`
5. promote hosted `/beta`
6. verify hosted `/beta`
7. complete docs pass when required
8. approve hosted `/beta`
9. promote hosted `/production`

## Decision Rule

When unsure, prefer the option that:

- preserves the stable live line
- keeps the platform/application seam explicit
- leaves a measurable test or artifact behind
- makes later integration easier rather than harder
