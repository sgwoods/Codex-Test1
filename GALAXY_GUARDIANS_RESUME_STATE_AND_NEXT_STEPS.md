# Galaxy Guardians Resume State And Next Steps

Updated: May 17, 2026

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

- Hosted `/dev` currently carries the checked build
  `1.4.0.1+build.780.sha.6d76050d`.
- That lane includes the updated Guardians docs plus the new rack-motion pass.

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

## What Is Still Obviously Missing

These are the most important remaining misses in the visible public slice.

### 1. Starfield motion still needs its own tighter evidence pass

The starfield is now present and alive, but it does not yet have the same level
of measured authority as the rack motion.

### 2. Top-reentry continuity still needs a stronger visible timing target

The runtime does re-enter from the top now, and the harness proves that path is
real, but the visible timing and continuity still need to be tightened against
the long-session source.

### 3. `WAIT` and score-table layout still need frame-extracted tightening

The copy and structure are closer than they were, but they are still adapted
runtime surfaces rather than a fully frame-matched cabinet read.

### 4. Explosion and hit states are still under-authoritative

Combat now reads better than before, but hit/destruction states still lag the
source in clarity and feel.

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

1. Tighten moving starfield motion and top-reentry timing against the committed
   intro and long-session windows.
2. Tighten `WAIT`, headline, and score-table layout/copy against frame-extracted
   intro evidence.
3. Improve explosion, hit, and destruction-state readability.
4. Tighten opening palette progression and swarm color-family authority.
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
