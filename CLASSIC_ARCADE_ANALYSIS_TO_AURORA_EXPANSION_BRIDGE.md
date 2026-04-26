# Classic Arcade Analysis To Aurora Expansion Bridge

Status: `working-bridge`

This document connects the Galaxian ingestion work to the coming Aurora
level-by-level expansion. The second-game preview is useful on its own, but the
bigger payoff is a repeatable evidence loop for adding stage depth, new alien
families, challenge-stage behavior, and later-level pressure without guessing.

## Shared Principle

Before adding a major behavior family, capture the evidence shape first:

1. choose a source or Aurora run window
2. generate contact sheets, stills, waveform if audio matters, and traces
3. create a semantic event log
4. name the behavior family and pressure band
5. implement the smallest playable slice
6. add harnesses that compare the intended behavior with the evidence

This is the same path now used by the Galaxian preview cycle.

For future branches, prefer a manifest-driven plan file so the same local CPU
cycle can run against a second game, a Galaga reference clip, or an Aurora
harness video:

```sh
npm run harness:cycle:classic-arcade-reference -- --plan <plan.json>
```

## Aurora Stage Expansion Evidence Set

For each Aurora expansion branch, collect at least four windows:

- opening baseline
  - the current trusted early-stage behavior
- challenge-stage candidate
  - the bonus-stage pattern or alien family being expanded
- mid-run pressure
  - survivability and attack-density evidence after the game is established
- late-run cleanup or failure
  - depletion, final-life, game-over, or unfair-collapse evidence

These windows can come from original reference footage, Aurora harness runs, or
both. The important rule is that the branch should know which windows it is
trying to improve before tuning begins.

## Reusable Artifact Types

- source or run manifest
- promoted window catalog
- contact-sheet overview
- per-window still frames
- per-window movement / pressure traces
- semantic event log
- generated event scaffold for each promoted window
- pressure curve summary
- playable-slice spec
- harness target list

## First Aurora Applications

### Challenge Stages

Use this framework to answer:

- what alien family or variant enters
- what motion path makes the stage distinct
- what scoring window the player is being offered
- what miss / near-perfect / perfect result should look like
- how the transition back to normal play should feel

### Later-Level Entry Variation

Use this framework to answer:

- whether entry should be staggered, mirrored, or offset
- how long a rack remains stable before pressure begins
- whether escorts or bosses appear earlier or behave differently
- how much projectile pressure is tolerable before self-play collapses

### New Alien Families

Use this framework to answer:

- which visual family is different enough to matter
- what movement grammar separates it from existing aliens
- which harness can prove the behavior appeared
- whether the new family belongs to a normal stage, challenge stage, or later
  pressure band

## Immediate Recommendation

After the Galaxian preview spec is stable, use the same promoted-window pattern
for Aurora's first `1.4` arcade-depth branch:

- one Stage 1 baseline window
- one challenge-stage window
- one Stage 2 or Stage 3 pressure window
- one later-run cleanup or collapse window

That should produce an Aurora pressure curve before any new alien or movement
family ships.
