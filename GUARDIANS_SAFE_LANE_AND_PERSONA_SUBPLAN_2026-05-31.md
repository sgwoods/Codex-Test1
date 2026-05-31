# Guardians Safe-Lane and Persona Capture Subplan

Date: 2026-05-31

## Purpose

This note captures the focused Guardians tranche that comes before the planned
audio-character pass and the later pace / motion-pressure tuning pass.

The immediate goal is to remove a live gameplay regression and strengthen the
review loop so later tuning is based on more trustworthy play evidence.

## Why This Tranche Exists

The latest localhost review exposed a concrete gameplay failure:

- a player could sit in the starting lane
- fire repeatedly without meaningful movement
- and remain effectively safe because no alien or enemy shot threatened that
  lane closely enough

That regression is more important than broad polish because it corrupts the
core read of stage-one pressure and makes later audio / pace review less
trustworthy.

## Ordered Work

### 1. Remove the stationary safe-lane regression

Target:
- the starting lane should not remain permanently safe under stationary fire

Expected user-facing outcome:
- a player who sits still and shoots from spawn must eventually face a nearby
  dive or shot threat that forces movement or risks loss

Impact update:
- implemented in `src/js/13-galaxy-guardians-runtime.js`
- the runtime now prefers player-lane pressure when the board is still open and
  only uses the anti-chaos fairness separation once lower-field threats are
  already active
- measured non-browser regression checks stayed green:
  - `npm run harness:check:galaxy-guardians-stage-rank-pressure`
  - `npm run harness:check:galaxy-guardians-first-class-conformance`

### 2. Add a dedicated safe-lane regression harness

Target:
- make the stationary-fire exploit measurable and keep it from slipping back

Expected user-facing outcome:
- future fairness work should not silently reintroduce a fake-safe opening lane

Impact update:
- added `tools/harness/check-galaxy-guardians-stationary-safe-lane.js`
- added `npm run harness:check:galaxy-guardians-stationary-safe-lane`
- browser-backed verification now proves a stationary center player faces a
  nearby threat by about `4.6s`
- the dedicated safe-lane check is now a durable guard against reintroducing a
  fake-safe spawn lane

### 3. Add Guardians persona capture presets for logged review

Target:
- make it easy to generate repeatable Guardians persona-led logged gameplay
  runs for review, similar to the evidence loop already used elsewhere

Expected user-facing outcome:
- Guardians play review becomes easier, faster, and more comparable across
  `advanced`, `expert`, and `professional` runs

Impact update:
- updated `tools/harness/capture-gameplay-segment.js` so captures can target
  `galaxy-guardians-preview` directly instead of assuming Aurora
- added repeatable review presets:
  - `npm run harness:capture:guardians-persona-advanced`
  - `npm run harness:capture:guardians-persona-expert`
  - `npm run harness:capture:guardians-persona-professional`
  - `npm run harness:capture:guardians-persona-review`
- verified a real logged `professional` run with audio capture under
  `reference-artifacts/analyses/gameplay-segment-captures/`
- Guardians now has a practical persona-led logged review loop for opening-play
  evaluation, not just ad hoc manual browser runs

### 4. Revisit Watch Mode and 2UP scope after the above

Target:
- decide what should become first-class for Guardians next and what should stay
  Aurora-only for now

Expected user-facing outcome:
- clearer product behavior and a cleaner next implementation choice

Impact update:
- no gameplay runtime change made in this step; this was a scope and product-fit
  decision
- current Guardians capability is now:
  - persona-selected logged review capture: yes
  - first-class manual Watch Mode parity with Aurora: partial, still a likely
    future platform-fit pass
  - first-class `2UP` rival mode: still Aurora-only
- next product recommendation:
  - keep `2UP` Aurora-only for now
  - treat stronger first-class Guardians Watch Mode as the next meaningful
    platform-fit candidate after the current audio / motion work, not before

## After This Tranche

If this tranche succeeds, return to the previously queued Guardians work in
this order:

1. headed audio-character pass
2. motion-pressure and pace tuning

## Follow-on Progress

### Audio-character pass

Impact update:
- the live Guardians capture path was still resolving the effective gameplay
  audio theme through the old reference-assets default instead of cleanly using
  the pack-owned `guardians-signal` theme
- `src/js/00-boot.js` and `src/js/90-harness.js` now treat that old reference
  selection as an implicit developer default rather than an authoritative
  Guardians choice, unless a run explicitly pins a different audio theme
- the Guardians persona capture presets now force `--audio-theme auto` so the
  review loop stays on the game-owned cue family
- verified with a fresh professional capture:
  `reference-artifacts/analyses/gameplay-segment-captures/guardians-opening-professional-review-2026-05-31T18-08-00-634Z.json`
- the live capture now reports:
  - runtime atmosphere audio theme: `guardians-signal`
  - visual atmosphere audio theme: `guardians-signal`
  - developer selection: `auto`

### Motion-pressure and pace follow-on

Impact update:
- kept the stage-one measured dive/flagship timing contract intact
- strengthened recurring live-presence by tightening the base rack-pulse
  interval
- widened later-band movement shape with slightly larger formation drift,
  dive sway, side drift, and top-reentry sway at higher stage ranks
- verified:
  - `npm run harness:check:galaxy-guardians-movement-pacing`
  - `npm run harness:check:galaxy-guardians-stage-rank-pressure`
  - `npm run harness:check:galaxy-guardians-stationary-safe-lane`
- important honest read:
  - the refreshed long-surface artifact is slightly harsher now
  - `overallLongSurfaceScore10` moved to `6.9`
  - `personaReviewUtilityScore10` moved to `6.6`
  - `midrunSurvivabilityScore10` moved to `5.7`
- that drop is still worth keeping for now because the safe-lane exploit is
  gone and the longer-surface review is no longer being flattered by a fake-safe
  opening lane
