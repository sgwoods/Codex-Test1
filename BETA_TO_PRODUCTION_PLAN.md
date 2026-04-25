# Beta To Production Plan

## Current Release State

As of April 24, 2026:

- hosted `/beta`
  - `1.2.3-beta.1+build.489.sha.f6ba6c2.beta`
- hosted `/production`
  - `1.2.3+build.489.sha.f6ba6c2`

This means the production refresh is complete and the shipped beta/production
pair now comes from the same committed source state.

## Why This Promotion Mattered

The case for performing this production push was:

- hosted `/production` is materially stale relative to the current Aurora line
- hosted `/beta` now includes the timing, audio, movement, and release-discipline
  improvements accumulated on the forward branch
- the supporting analysis is committed and durable
- the remaining known issues are now mostly follow-up polish items for the next
  minor cycle, not obvious ship blockers for Aurora

## Production Preconditions

Before production promotion, we should confirm all of the following from the
same committed source state:

1. hosted `/beta` is still the expected live label
2. the local tree is clean
3. release docs are current
4. committed analysis artifacts are present
5. beta approval happens before production promotion
6. `dist/production` is promoted from the approved beta candidate rather than
   rebuilt from a drifting source state later

## Commands Used

From the authoritative Aurora repo:

- `npm run approve:beta`
- `npm run promote:production`
- `npm run publish:check:production`
- `npm run publish:production`

And then verify:

- hosted `/production` build label
- hosted `/production` asset availability
- public project page sync

## Required Artifact Preservation

The following artifact families should remain committed as part of the release
record for this cycle:

- `reference-artifacts/analyses/quality-conformance/2026-04-24-e1c2c65`
- `reference-artifacts/analyses/correspondence/player-movement/2026-04-24-e1c2c65`
- `reference-artifacts/analyses/correspondence/audio-cue-alignment/2026-04-24-e1c2c65`
- `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-04-24-main-ca481f2`
- `reference-artifacts/analyses/reference-video-alignment/stage1-opening-window-2026-04-24-e1c2c65`

These are now part of the durable release story, not just development scratch
material.

## Beta And Production Replication Expectation

For beta and production, the release-host repo should receive the full public
release package, not just the compiled game files.

That public package includes:

- shipped runtime and assets
- hosted guides
- release dashboard and release notes
- build metadata
- release-facing public context

It does not need to duplicate the entire engineering repo.

The authoritative source for:

- issues
- planning
- harnesses
- engineering history

remains:

- [sgwoods/Codex-Test1](https://github.com/sgwoods/Codex-Test1)

The beta/production replication rule is therefore:

- mirror the full public release surface
- do not mirror the full internal engineering surface

## Current Risk View

Main acceptable risks for this production push:

- audio identity is still the weakest bundled quality category
- some platform-owned compatibility names remain Aurora-shaped internally
- the preview second-application pack still borrows Aurora data in ways that
  should be cleaned before it becomes playable

These did not block the `1.2.3+build.489.sha.f6ba6c2` production move, but they
should stay visible in the next cycle.

## Next-Cycle Release Direction

### Immediate After Production

- refresh hosted `/dev` only when the next polish bundle is coherent enough to
  justify a new shared integration lane
- keep hosted `/beta` as the proving lane for the next candidate family
- continue audio identity refinement if it remains the weakest quality category

### Next Minor Release

Current likely target:

- `1.3.0`

Focus:

- stronger audio identity
- ship-movement refinement that aligns more closely with real Galaga motion
  instead of the current sometimes-jerky, sometimes-too-fast feel
- continued Platinum/Aurora boundary cleanup
- deeper reference-video ingestion and event-log extraction
- better persona annotation and future player-versus-persona scaffolding

### Next Major Release

A major release should wait until Platinum is clearly hosting more than one real
game experience cleanly.

Current long-term major-release threshold:

- at least two meaningfully playable Platinum applications
- same-control compliance clearly documented and proven
- pack schema and boundary naming cleaner than the current transitional state
- persona-vs-player or learn-by-playing tooling materially more mature

## Current Non-Destructive Readiness Checks

Current directly observed checks for this production plan:

- `npm run build`
- `npm run harness:check:close-shot-hit`
- `npm run harness:check:persona-stage2-safety`
- `npm run harness:check:platinum-pack-boot`
- hosted `/beta` live verification

Current release-order note:

- the release chain now succeeded from approved beta to shipped production
- the remaining follow-up is public-page rendered propagation, not a missing
  source promotion step
