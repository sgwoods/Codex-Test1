# Windigo Invaders Platinum Instantiation Plan

Date: 2026-05-31

## Purpose

Turn the incoming Space Invaders lineage into a deliberate Platinum sibling
game rather than a memory-driven derivative.

The immediate goal is not runtime breadth. It is to collect enough trustworthy
source evidence that the first playable slice can be:

- game-owned in rules and feel
- explicit about what Platinum hosts versus what the game owns
- measurable against preserved timing, visual, and audio artifacts

## Current Intake State

Current seed source:

- `reference-artifacts/preserved-sources/space-invaders-23mins-2026-05-31/`

Current rules/service source package:

- `reference-artifacts/preserved-sources/space-invaders-rules-techdocs-2026-05-31/`

Current first-pass analysis:

- `reference-artifacts/analyses/space-invaders-reference/README.md`
- `reference-artifacts/analyses/space-invaders-reference/spaceinvaders-23mins/README.md`

Current hosted cockpit:

- `ingestion-dashboard.html`

## First Working Assumption

Windigo Invaders should enter Platinum through evidence first, then plan, then
the smallest runtime slice. It should not borrow Aurora's challenge structure
or Galaxy Guardians' formation model unless later evidence explicitly points in
that direction.

## Platinum Versus Game Ownership

### Platinum should own

- host shell, session, and release-lane surfaces
- reusable artifact dashboards and intake/status views
- generic capture, replay, persona, and audio-scene/live-mix infrastructure
- generic documentation and ingestion workflow rules

### Windigo Invaders should own

- march cadence and row-speed truth
- invader-row identities and score values
- cannon, bunker, and projectile semantics
- descent rules and player-pressure timing
- audio event vocabulary and cue timing
- stage/wave acceleration and end-state behavior

## Phase 0: Artifact Expansion Before Runtime

The next most valuable artifact families are:

1. Stronger original score-table and bonus/life still references.
2. Higher-resolution gameplay with cleaner audio.
3. Attract/title/cabinet/bezel stills.
4. Bunker, cannon, and invader-row close references.
5. Event-labeled timing windows for march, fire, hit, descent, loss, and
   game-over.

Exit condition:

- the repo has at least one strong source in each of the first three families
- the first event-labeled timing set exists for core gameplay scenes

## Phase 1: Build The Initial Game-Owned Catalog

Before implementation, Windigo Invaders should receive first-pass rows in
`GAME_CONFORMANCE_CATALOG.md` for:

- invader family index
- cannon / bunker / shot index
- audio cue index
- stage/wave index
- persona test assumptions

Exit condition:

- the game can be described in repo-owned rows instead of only in narrative
  memory

## Phase 2: Create The First Runtime Slice Plan

The first runtime slice should be intentionally narrow:

- one early-stage playable wave
- cannon movement and single-shot player fire
- bunker presence and first erosion behavior
- invader march and one descent/threat grammar
- score and life handling for the smallest real loop
- game-over and restart close

This slice should be chosen only after the source windows show which part of
the game yields the clearest high-confidence contract.

Likely first slice candidates:

- early march-and-fire loop
- first descent-pressure loop
- bunker-pressure opening

Exit condition:

- one slice is chosen with explicit source windows, artifact anchors, and a
  game-owned rule list

## Phase 3: Conformance Harness Design

When the first slice is chosen, add the smallest measured harness set needed
to keep the game evidence-backed:

- stage timing correspondence
- shot cadence/event timing
- march cadence and acceleration profile
- bunker-state or erosion correspondence
- audio scene review and live-mix review using the generic Platinum framework
- persona-led capture review once the rules are stable enough

Exit condition:

- the first slice can be reviewed through preserved artifacts, not only through
  subjective play

## Immediate Next Decisions

1. Add one more preserved Space Invaders gameplay source with cleaner audio.
2. Find stronger original score-table or manual-page imagery.
3. Promote the first labeled timing windows from the current 23-minute source.
4. Draft the first Windigo enemy/row/cannon/bunker inventory.
5. Only then choose the first runtime slice to build on Platinum.

## Success Read

This plan is succeeding when:

- new artifacts go first into the preserved-source and reference-lineage lanes
- the dashboard becomes the obvious place to see missing evidence
- runtime work starts from a chosen, measured slice instead of broad imitation
- a future third game can reuse the same intake, plan, and audio-review
  process with minimal platform reinvention
