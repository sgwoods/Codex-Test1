# Galaxy Guardians 8-Hour Visual Audio Motion Pass Plan

Updated: May 13, 2026

## Purpose

This document frames the next long `Galaxy Guardians` working block as an
eight-hour evidence-backed pass with a deliberate order:

1. visual evidence and readability first
2. audio character and cue fit second
3. motion-pressure tuning after the visual/audio baseline is cleaner

The point is not to claim full parity with Aurora in one sitting.

The point is to use one serious branch pass to improve the parts a player
feels immediately while also tightening the harness evidence that justifies the
runtime changes.

## Measured Baseline At Start

The maintained Galaxy branch baseline at the start of this pass is:

- reference conformance: `7.7/10`
- playtest-weighted conformance: `6.9/10`
- public release readiness: `3.9/10`
- platform boundary integrity: `10/10`
- audio conformance lab overall: `8.3/10`
- weakest audio lab cue: `enemyShot` at `7.1/10`

The current measured category gaps most worth this pass are:

- motion pressure: `6.2/10`
- audio character: `6.4/10`
- visual identity: `6.7-6.8/10`

The baseline checks run at the start of this pass confirmed:

- `harness:check:galaxy-guardians-visual-readability` is green
- `harness:check:galaxy-guardians-sprite-grid-targets` is green
- `harness:check:galaxy-guardians-sprite-component-targets` is green, but the
  player component-target artifact had drifted behind the reviewed runtime
  interceptor silhouette
- `harness:check:galaxy-guardians-audio-character` is green
- `harness:check:galaxy-guardians-audio-cue-targets` is green
- `harness:check:galaxy-guardians-audio-conformance-lab` is green, with
  `enemyShot` still the weakest promoted runtime cue

## Current Progress Snapshot

After the first visual/audio tranche and the first motion retune on May 13,
2026, the branch now reflects:

- player component-target evidence aligned with the reviewed live interceptor
  silhouette instead of the older block-like contaminated crop
- audio conformance lab overall score improved from `8.3/10` to `8.5/10`
- `enemyShot` improved from `7.1/10` to `8.6/10`
- weakest promoted audio cue shifted to `scoutHit`, which is the next likely
  cue for a follow-up audio pass
- runtime-reference movement improved from `8.0/10` to `8.1/10`
- lower-field runtime track duration ratio improved from `0.439` to `0.482`
- lower-field runtime x-span ratio improved from `0.833` to `0.898`

The remaining motion gap is still clear:

- the runtime dives are now slightly longer and wider, but they are still much
  shorter than the promoted reference duration band and still need browser-led
  review before any stronger motion claim

## Session Goals

### Hard goals

- preserve reference conformance at `>=7.7/10`
- preserve platform boundary integrity at `10/10`
- keep the Galaxy first-class conformance spine green
- improve the weakest measured visual/audio evidence before touching motion
- leave behind committed artifacts and docs for each accepted change

### Strong goals

- raise the audio conformance lab from `8.3/10` to `>=8.5/10`
- move `enemyShot` from `7.1/10` into the `8.3+` band
- eliminate visual-artifact drift between the reviewed player silhouette and
  the maintained sprite-component targets
- prepare a cleaner motion-pressure starting point for the second half of the
  pass

### Stretch goals

- move playtest-weighted conformance from `6.9/10` to `>=7.0/10`
- move visual identity closer to `7.0/10`
- move audio character closer to `6.8-7.0/10`

## Evidence-First Priorities

### Visual priority

Start by making sure the maintained target artifacts still describe the live
runtime honestly.

The most concrete current drift is not a failing runtime sprite. It is that the
player interceptor has a reviewed ship silhouette in the pack and in the grid
targets, while the component-target artifact still carries the older block-like
player extraction from a contaminated `player-and-shot` crop.

That means the first visual action is:

- promote a manual reviewed component-target override for
  `player-interceptor`
- keep the source crop lineage and PNG crop for provenance
- stop allowing the artifact stack to imply that the overfilled block is still
  the preferred authoring target

Only after the evidence stack is honest should we spend more time on runtime
sprite adjustments.

### Audio priority

The first audio move should target the weakest measured cue, not broad
subjective retuning.

The current `enemyShot` read is:

- score: `7.1/10`
- duration: already inside the target band
- frequency proxy: too high for the promoted target band
- decay shape: too short and front-loaded compared with the reference window

That makes `enemyShot` the right first audio patch:

- lower the square/noise frequency proxy into the promoted band
- keep the descending identity intact
- lengthen the tail enough to improve the measured decay shape without turning
  the cue into a long synth effect

### Motion-pressure priority

Motion waits until the visual/audio tranche lands cleanly.

Once the runtime and evidence are cleaner, the next motion tranche should begin
with:

- first scout dive delay
- flagship plus escort pressure timing
- enemy-shot cadence under live threat
- wrap and return cadence

## 8-Hour Structure

### Phase 1. Baseline lock and drift ledger

Time budget: `30-45 min`

Actions:

- rerun the current visual/audio Galaxy harnesses
- record any artifact drift between runtime, reviewed targets, and docs
- identify the first concrete runtime cue to retune

Outputs:

- this plan
- an explicit visual drift note for the player component target
- a measured audio priority queue led by `enemyShot`

### Phase 2. Visual evidence parity

Time budget: `60-90 min`

Actions:

- add a manual reviewed player-component override
- regenerate the sprite-component target artifact
- rerun visual target and readability checks

Success criteria:

- the player interceptor target stack no longer carries the old block
- the component and grid target artifacts tell the same reviewed story
- the visual harness spine stays green

Primary commands:

- `npm run harness:promote:galaxy-guardians-sprite-component-targets`
- `npm run harness:check:galaxy-guardians-visual-readability`
- `npm run harness:check:galaxy-guardians-sprite-grid-targets`
- `npm run harness:check:galaxy-guardians-sprite-component-targets`

### Phase 3. Audio cue lab tranche

Time budget: `90-120 min`

Actions:

- retune the weakest runtime cue first
- rerun the reusable audio lab and cue-target checks
- only broaden to a second cue if the first fix lands cleanly

Success criteria:

- `enemyShot` is no longer the obvious weakest promoted cue
- the audio lab overall score improves
- the cue keeps a compact hardware-square identity rather than drifting toward
  Aurora-like flavor

Primary commands:

- `npm run harness:check:galaxy-guardians-audio-cue-targets`
- `npm run harness:check:galaxy-guardians-audio-character`
- `npm run harness:check:galaxy-guardians-audio-conformance-lab`

### Phase 4. Browser-backed visual and audio review

Time budget: `45-60 min`

Actions:

- review sprite density at gameplay scale
- review the revised cue set against the promoted windows
- note any additional visual or audio changes that should wait until after
  motion work

Success criteria:

- no accepted change relies only on numbers
- the runtime still reads as Galaxian-family rather than generic retro space

### Phase 5. Motion-pressure tranche

Time budget: `120-150 min`

Actions:

- retune scout-dive timing and escort pressure
- test shot pressure and return cadence
- rerun pacing, rank-pressure, and runtime/reference movement checks after each
  accepted timing family

Success criteria:

- motion-pressure improves without breaking the visual/audio gains
- the browser review feels tighter and more coherent than the current
  `6.2/10` pressure band

Primary commands:

- `npm run harness:check:galaxy-guardians-movement-pacing`
- `npm run harness:check:galaxy-guardians-stage-rank-pressure`
- `npm run harness:check:galaxy-guardians-runtime-reference-movement`

### Phase 6. Rerun, rescore, and document

Time budget: `45-60 min`

Actions:

- rerun the first-class Galaxy spine
- compare before and after numbers
- update the first-class plan, roadmap notes, and branch plan as needed

Primary commands:

- `npm run harness:check:galaxy-guardians-first-class-conformance`
- `npm run harness:check:galaxy-guardians-reference-conformance`
- `npm run harness:check:galaxy-guardians-playtest-conformance-review`
- `npm run harness:build:conformance-metrics-overview`
- `npm run harness:check:documentation-freshness`

## Metrics To Watch During This Pass

### Visual metrics

- sprite-component target integrity remains green
- sprite-grid target integrity remains green
- player interceptor reviewed silhouette remains the maintained target

### Audio metrics

- audio conformance lab overall: `8.3 -> >=8.5`
- `enemyShot`: `7.1 -> >=8.3`
- no cue falls below the current floor as a side effect

### Motion metrics

- motion-pressure: `6.2 -> >=6.6`
- playtest-weighted conformance: `6.9 -> >=7.0`

## Decision Rules

- do not accept a visual target change that is only convenient for the harness
  if it weakens runtime readability
- do not accept an audio retune that improves proxy math but sounds less like a
  compact Galaxian-family cabinet cue
- do not start broad motion tuning until the first visual/audio tranche has a
  committed evidence trail
- keep all accepted decisions in repo docs or artifacts, not only in chat

## Relationship To Other Plans

- this is the active long working-block plan for the current branch
- the broader Galaxy parity program remains in
  [GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md](GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md)
- one-level gameplay-completeness work remains in
  [GALAXY_GUARDIANS_PLAYABLE_0_1_BRANCH_PLAN.md](GALAXY_GUARDIANS_PLAYABLE_0_1_BRANCH_PLAN.md)
- shared release sequencing remains in [PLAN.md](PLAN.md) and
  [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md)
