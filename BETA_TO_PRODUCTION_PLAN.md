# Beta To Production Plan

## Current Release State

As of April 24, 2026:

- hosted `/beta`
  - `1.2.3-beta.1+build.484.sha.baa1726.beta`
- hosted `/production`
  - `1.2.3+build.388.sha.13c8421`

This means the current beta is the real production candidate.

## Why Promote Soon

The case for a near-term production push is:

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

## Required Commands

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

- `/Users/steven/Documents/Codex-Test1/reference-artifacts/analyses/quality-conformance/2026-04-24-e1c2c65`
- `/Users/steven/Documents/Codex-Test1/reference-artifacts/analyses/correspondence/player-movement/2026-04-24-e1c2c65`
- `/Users/steven/Documents/Codex-Test1/reference-artifacts/analyses/correspondence/audio-cue-alignment/2026-04-24-e1c2c65`
- `/Users/steven/Documents/Codex-Test1/reference-artifacts/analyses/aurora-audio-theme-comparison/2026-04-24-main-ca481f2`
- `/Users/steven/Documents/Codex-Test1/reference-artifacts/analyses/reference-video-alignment/stage1-opening-window-2026-04-24-e1c2c65`

These are now part of the durable release story, not just development scratch
material.

## Current Risk View

Main acceptable risks for this production push:

- audio identity is still the weakest bundled quality category
- some platform-owned compatibility names remain Aurora-shaped internally
- the preview second-application pack still borrows Aurora data in ways that
  should be cleaned before it becomes playable

These should not block the current Aurora production move, but they should stay
visible in the next cycle.

## Next-Cycle Release Direction

### Immediate After Production

- keep hosted `/dev` moving for post-release polish and platform cleanup
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

Current release-order warning:

- `npm run publish:check:production` still correctly fails until
  `dist/production` is promoted from the approved beta candidate
