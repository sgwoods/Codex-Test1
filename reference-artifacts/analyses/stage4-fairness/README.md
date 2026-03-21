# Stage 4 Fairness Findings

Role in the project:

- baseline note for the current four-stage `1.0` slice
- reference for issue `#18`
- summary of what has and has not helped Stage `4` fairness so we do not
  repeat low-value tuning loops

Primary baseline artifacts:

- pressure scenario:
  - `/Users/stevenwoods/Documents/Codex-Test1/harness-artifacts/stage4-five-ships-2026-03-21T13-35-53-065Z`
- survival scenario:
  - `/Users/stevenwoods/Documents/Codex-Test1/harness-artifacts/stage4-survival-2026-03-21T13-35-05-800Z`

## Current kept baseline

Stage `4` is the last major gameplay blocker for the current four-stage `1.0`
slice.

Baseline read:

1. `stage4-five-ships`
   - `1` loss
   - first loss at `11.816s`
   - cause: `enemy_collision`
   - source: `but`
2. `stage4-survival`
   - `1` loss
   - first loss at `29.794s`
   - cause: `enemy_collision`
   - source: `but`

So the stage is not broadly unstable anymore, but it still has a collision
fairness problem.

## What visual review showed

Representative frame review against the kept baseline suggested:

1. The player is usually not dying to a full-screen swarm or impossible bullet
   cloud.
2. The remaining bad deaths look more like steep diagonal dive paths crossing
   directly through the player lane.
3. In the five-ships run, early capture flow can coincide with unfair follow-up
   pressure.
4. In the survival run, later deaths tend to happen under clustered dive
   pressure, but still mainly through collision rather than missile spam.

## Experiments tried and what they taught us

1. Softer escort / boss-squad pressure
   - helped one guardrail
   - often shifted failures into early formation bullets or later regressions
   - not stable enough to keep

2. Post-capture recovery spacing
   - helped `stage4-five-ships`
   - hurt `stage4-survival`
   - suggests capture follow-up is part of the problem, but not the whole one

3. Reduced Stage `4` dive weave amplitude
   - helped `stage4-five-ships` dramatically
   - regressed `stage4-survival` by creating an early loss
   - suggests path geometry matters, but cannot be changed in isolation

## Current working interpretation

Stage `4` appears to be a two-part fairness problem:

1. early opening / post-capture follow-up pressure
2. diagonal collision-path fairness during later dives

That means broad Stage `4` tuning sweeps are unlikely to help. Future passes
should stay narrow and explicitly choose which of these two sub-problems they
are addressing.

## Best next move

Before another Stage `4` change:

1. keep this note updated when a pass materially changes either guardrail
2. prefer single-variable changes only
3. validate every pass against both:
   - `stage4-five-ships`
   - `stage4-survival`

## Current recommendation

For the current four-stage `1.0` goal:

1. do not destabilize Stages `1` to `3`
2. keep Stage `4` work narrowly focused on fairness
3. accept that Stage `4` may only need to become "fair and beatable," not
   perfectly arcade-authentic, before shifting effort into release polish
