# 1.4.0.1 Hosted-Dev Conformance Process Review

Date: 2026-05-19

This is the forward-review release note for the current post-1.4.0 hosted-dev
candidate work. It is not a production-promotion note. Release authority for
beta and production remains on `imacm1 / iMacM1`.

## What Changed

- Corrected the Reference Pixel Lab sprite-scale regression that made the
  player ship and alien sprites visibly wrong at gameplay scale.
- Added a formation-readability harness that measures settled rack spacing and
  active entry overlap in both normal Aurora rendering and Reference Pixel Lab
  mode.
- Widened Aurora's regular 40-enemy rack spacing so larger, more authentic
  pixel silhouettes have positive visual air between rows and columns.
- Staggered later-stage formation arrivals so higher-stage racks no longer
  release nearly the full squadron into the same early window.
- Preserved stage-1 opening overlap as an explicit warning rather than hiding
  it. The current rack passes, but stage-1 opening choreography still needs a
  reference-timed path scorer before it should be called conformant.
- Updated the project documentation to explain the measured distinction between
  static sprite likeness, live runtime sprite scale, formation readability,
  temporal sprite motion, and stage-entry choreography.

## Conformance Process Learning

The important learning is that sprite conformance is not one number. A game can
have a better-looking isolated sprite and still fail the player if scale,
formation density, animation cadence, or entry choreography are wrong in motion.
The current process now treats these as separate evidence surfaces:

| Surface | What it answers | Current posture |
| --- | --- | --- |
| Target sprite model | What the extracted/reference alien appears to be | Improving through explicit Galaga alien source images and crop manifests |
| Live runtime sprite crop | What Aurora actually draws in the browser | Guarded by runtime sprite capture and Reference Pixel Lab checks |
| Relative gameplay scale | Whether player, reserve ships, bosses, bees, and butterflies read in proportion | Recently corrected and guarded |
| Formation readability | Whether the 40-enemy rack has enough visual air to be readable | New measured guard passes for settled rack and later-stage entry windows |
| Stage-1 opening choreography | Whether the opening wave crosses and arrives like the target game | Still warning-level debt; needs reference path windows |
| Active sprite motion | Whether flaps, pulses, dives, captures, rescues, and damage phases match the target | Still a high-priority temporal harness gap |

## Impact

The user-visible goal is less bunching and fewer "sprites shifting in and out of
existence" moments after the move toward more authentic pixel sprites. The
engineering goal is stronger regression protection so future visual work cannot
accidentally improve a crop while hurting the live board.

This also directly improves future-game ingestion. Galaxy Guardians and later
games should start with the same separation: target crop, runtime crop, gameplay
scale, formation/rack readability, temporal animation, and entry-path grammar.
That keeps the first playable version from becoming only a subjective visual
approximation.

## Carry-Forward For Ingestion Automation

This pass upgrades the ingestion process, not only Aurora's current visuals.
The repeatable pattern for the second game and later games is now:

1. Ingest reference media into named target objects, poses, cue families, and
   stage windows.
2. Capture what the browser actually renders or plays through harnesses instead
   of relying on source definitions alone.
3. Compare target evidence, runtime evidence, scale/readability, temporal
   motion, and event meaning as separate scores.
4. Preserve warning-level debt when a metric exposes a real gap but a safe
   automatic fix is not yet known.
5. Promote the shared harness pattern only when it can help another game
   without moving game-specific truth into Platinum.

For Galaxy Guardians, the immediate reuse is concrete: apply the same
target/runtime/scale/readability/motion split to flagship, escort, scout,
player-interceptor, rack entry, dive/escort paths, and single-shot audio before
the next public claim says the game is more than a preview.

## Known Gaps

- Stage-1 opening entry overlap is still recorded as advisory choreography debt.
- Active sprite motion remains incompletely scored until temporal harness
  windows exist for flap cadence, dive rotation, capture/rescue, carried-fighter
  and dual-fighter transitions.
- Challenge-stage movement and alien novelty remain the larger human-visible
  Galaga conformance gap after the sprite scale/readability regression is
  contained.
- Audio cue improvement is still a separate high-value bundle; the process work
  here reinforces that cue matching must be measured at full event-contract
  level, not only by isolated clip similarity.

## Verification

- `npm run build`
- `npm run harness:check:formation-readability`

The formation-readability artifact is persisted at:

- `reference-artifacts/analyses/formation-readability/latest.json`

## Next Recommendations

1. Build a reference-timed stage-1 opening path scorer from target video windows.
2. Add temporal sprite-motion windows for flap, dive, capture, rescue, and
   boss-damage states.
3. Promote formation-readability into the release conformance dashboard once it
   has two or three stable historical runs.
4. Apply the same target/runtime/scale/readability/motion split to Galaxy
   Guardians before calling its next playable slice first-class.
5. Add a cross-game ingestion maturity row that shows which evidence families
   are source-only, runtime-captured, scored, dashboard-visible, and release-gated.
6. Keep documentation and release notes generated from durable artifacts rather
   than editing public HTML directly.
