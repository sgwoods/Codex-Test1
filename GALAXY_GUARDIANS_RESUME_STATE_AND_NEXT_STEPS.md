# Galaxy Guardians Resume State And Next Steps

Updated: May 23, 2026

## Purpose

This note is the quick human-readable restart point for the current `Galaxy
Guardians` conformance program.

It exists so we do not have to reconstruct the current status from multiple
longer planning documents before resuming work.

Use this together with:

- [GALAXY_GUARDIANS_OPENING_SLICE_BASELINE.md](GALAXY_GUARDIANS_OPENING_SLICE_BASELINE.md)
- [GALAXY_GUARDIANS_STAGE_ARC_AND_HOMAGE_PLAN.md](GALAXY_GUARDIANS_STAGE_ARC_AND_HOMAGE_PLAN.md)
- [GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md](GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md)
- [GALAXY_GUARDIANS_LONG_SURFACE_AND_PERSONA_PLAN.md](GALAXY_GUARDIANS_LONG_SURFACE_AND_PERSONA_PLAN.md)

## Current Checked State

### Source state

- Authoritative source `main` now includes the opening-slice baseline work and
  the measured opening-rack motion pass.
- The opening rack is no longer treated only as a generic movement artifact.
  It now has its own committed source-backed contract in
  `opening-rack-motion-0.1.json`.

### Hosted dev state

- Hosted `/dev` may still lag the latest local opening-slice source changes if
  this note is being read before the next dev publish.
- Treat this note and the repo artifacts as the durable current state for the
  Guardians conformance program rather than assuming every local pass has
  already been pushed to the lane.

### What the public game truth still is

- Hosted `dev` still exposes a one-level visible public slice.
- That slice still ends in `mission_complete`.
- It is more believable now than it was before the opening baseline and rack
  pass, but it is still not yet a fully convincing Galaxian-family cabinet in
  the first seconds of play.

## What Just Landed

### 1. Opening-slice documentation is now easier to reopen

The hosted docs already carry:

- the Guardians stage assessment
- the opening-slice baseline
- the top-10 improvement queue
- the full stage-arc plan

This note adds a shorter “resume here” layer on top of those.

### 2. The rack now moves like a shared sweep

The biggest gameplay-facing change from this pass is that the opening rack now
uses a broad stepped shared sweep instead of a small per-alien wobble.

That matters because the source-family read is a marching rack, not a drifting
screen saver.

### 3. The motion pass is now grounded

The opening rack now has a dedicated measured contract:

- source anchor: `matt-hawkins-arcade-intro/opening-rack-entry`
- median rack-track x-span target: about `0.298`
- runtime achieved x-span: about `0.307`
- direction changes: `3`
- cohesion spread: `0px`

The practical meaning is: the runtime is now broad and unified enough to read
much more like a real opening sweep.

### 4. Starfield and top-reentry motion are stronger now

The current source now also carries:

- a denser `104`-star opening field with directional drift instead of the older
  lighter scatter
- a stronger render contract that requires visible star travel between samples
- a top-reentry path that now begins at `y <= -20` and settles back in more
  gradually instead of reading like a shallow snap-back

The practical meaning is: the opening board feels more alive, and wrap return
is easier to read as a continuous threat loop.

### 5. The opening mission, score table, hit feedback, and palettes are tighter

The current source now also carries:

- a tighter `WAIT` / preview mission layout that preserves the canonical
  `MISSION: DESTROY ALIENS` phrase
- a compact `CONVOY` / `CHARGER` score-table layout on both the wait showcase
  and the preview modal
- sprite-like pixel-burst hit and destruction feedback instead of only the
  earlier line-burst flashes
- theme-owned preview palettes so the opening swarm no longer depends on one
  mostly static green-heavy family

The practical meaning is: the first visible slice now reads more like a real
cabinet adaptation and less like a placeholder preview shell.

## What Is Still Obviously Missing

These are the most important remaining misses in the visible public slice.

### 1. `WAIT` and score-table layout still need frame-extracted authority

The copy, structure, and compact layout are closer than they were, but they are
still adapted runtime surfaces rather than a fully frame-matched cabinet read.

### 2. Starfield motion and top-reentry still need stronger measured targets

The runtime now has visibly better motion in both areas, but they still do not
have the same evidence weight as the rack-motion contract.

### 3. Explosion and hit states are still under-authoritative

Combat now reads better than before, but hit/destruction states still need
frame-backed source authority.

### 4. Palette progression and swarm color authority are still partial

The opening palette family is closer than before, but it still needs a more
deliberate stage-owned color read instead of a mostly runtime-tuned
approximation.

### 5. Platform-frame parity is still incomplete

Guardians still needs to sit in Platinum as naturally as Aurora across:

- sign-in
- scores
- pilot card
- replay and video capture
- bug reports
- music and sound controls

## Immediate Next Work Order

This is the best next sequence if we want the highest conformance return for
time and compute.

1. Promote frame-extracted `WAIT`, headline, and score-table layout/copy
   evidence.
2. Promote stronger measured starfield-motion and top-reentry windows so those
   surfaces have evidence parity with the rack-motion contract.
3. Promote frame-backed explosion, hit, and destruction-state reference crops.
4. Tighten opening palette progression and swarm color-family authority beyond
   the first improved slice.
5. Add real Aurora-versus-Guardians platform-frame parity scoring and finish the
   shared frame work.
6. After the visible opening slice is credible, continue into stage `3-5`
   pressure traces and stage `6-9` survivability/fairness.

## What We Should Not Re-Litigate First

The following points are already settled enough to move on:

- the current visible public truth is still one level
- the deeper repeated-rack/stage-band model belongs to internal conformance and
  future public growth, not to exaggerated current public claims
- artifact-first conformance remains the rule; human review is fallback, not the
  main strategy
- the rack-motion pass was worth doing and should be treated as landed progress,
  not reopened as an open design question

## Resume Advice

If resuming after a pause, reopen work in this order:

1. this note
2. the hosted opening baseline
3. the hosted top-10 queue
4. the hosted stage assessment
5. only then the longer first-class and long-surface plan docs

That order gives the fastest path back to the real current state without having
to reread the whole repo strategy stack first.
