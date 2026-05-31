# Movement Grammar Conformance Plan

Generated: 2026-05-31
Branch: codex/macbook-challenge-stage-gameplay-spectacle
Status: active working plan

## Problem

Aurora challenge-stage conformance is no longer blocked only by individual
path-family tuning. The deeper gap is that Platinum does not yet have one
shared movement language for:

- regular formation entry
- challenge-stage group choreography
- dives and lower-field attacks
- boss escort composition
- capture, carry, rescue, and return motion
- future game variants such as Galaxy Guardians

Today those behaviors are distributed across pack layout arrays, runtime switch
statements, stage-threshold helpers, and game-specific simulators. That lets us
patch one stage at a time, but it makes ingestion, comparison, variation, and
theme generation harder than they should be.

## Strategy

Create a platform-level movement grammar that sits between reference ingestion
and runtime gameplay. The grammar should describe authored flight in a normalized
format that can be inferred from video examples, scored against target object
tracks, varied for themes, and compiled into each game's runtime.

The grammar must cover both challenge stages and normal play. Challenge stages
are the current pressure point, but regular entry, dives, escorts, and capture
behavior need the same flexibility if Aurora, Galaxy Guardians, and later games
are going to share a repeatable ingestion process.

## Current Step

Steps 1-4 are now complete and verified enough to guide the next work cycle:

`reference-artifacts/ingestion/movement-grammar/movement-grammar-0.1.json`

The schema/checker, read-only Aurora challenge mapping, compiler bridge, and
Stage 7 / Challenging Stage 2 gameplay pilot now exist. The pilot is a real
gameplay readability win: Stage 7 now best-matches the expected Challenge 2
reference family (`challenge-2-arrival-group-1`) instead of reading like an
earlier challenge, and a challenge timing fix means all five target groups are
now visible and measured instead of later groups disappearing before they could
be read or scored.

The remaining gap is sharper and better measured: the strict challenge-stage
score is 4.3/10, Stage 7 is 4.3/10 overall, Stage 7 movement is 4.6/10, and
Stage 7 target-video object-track fit is 4.6/10 with 5/5 measured target groups.
We have improved identity, density, and visibility, but not yet trajectory
precision, active visual novelty, or stage-to-stage spectacle.

## Ten-Step Plan

1. Define the game-neutral movement grammar schema and keep it validated.
2. Map existing Aurora challenge layouts into the schema without changing
   gameplay.
3. Build a compiler that turns one schema pattern into current runtime fields.
4. Pilot the compiler on Aurora Stage 7 / Challenging Stage 2.
5. Add one regular-stage entry pilot, likely Stage 4 or Stage 8.
6. Extend ingestion so Galaga object tracks emit grammar candidates directly.
7. Add a scorer that compares grammar intent, runtime object tracks, and target
   video object tracks.
8. Add variation controls for mirror, phase, speed, scale, grouping, palette
   family, and theme identity.
9. Document the movement grammar as a platform capability in the generated
   guide and release notes.
10. Promote broader gameplay changes stage by stage only after checks show
    user-visible improvement without safety or readability regressions.

## Success Measures

- Aurora challenge-stage movement rises above the current weak strict read.
- Regular stage entry and dive behavior become measurable by the same grammar.
- Ingestion produces reusable movement candidates instead of one-off path labels.
- The platform can generate conforming-lane and themed-lane variants from the
  same semantic movement contract.
- Future games begin with source-derived movement patterns rather than
  game-specific hand-coded motion branches.

## Immediate Next Step

Use the new per-group evidence to improve path-contract precision. The next
gameplay edit should be driven by group-level evidence: which group entered
from the wrong side, appeared too late, moved too little, exited incorrectly, or
failed to create a scoreable upper-band window.

Continue the Stage 7 pilot if it still offers the best return, then apply the
same grammar loop to one normal-stage entry so main-level entry behavior gets
the same ingestion-to-runtime path as challenge stages.
