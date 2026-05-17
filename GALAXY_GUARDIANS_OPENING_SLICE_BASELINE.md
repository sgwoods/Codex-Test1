# Galaxy Guardians Opening-Slice Baseline

Updated: May 17, 2026

## Purpose

This document narrows the current `Galaxy Guardians` conformance discussion to
the first visible slice a player sees on hosted `dev` and `beta`.

That slice still decides whether the game feels like a real Galaxian-family
cabinet or like a generic preview. Before deeper-stage claims matter, the
opening needs to read correctly.

This is the human-readable companion to:

- `reference-artifacts/analyses/galaxy-guardians-identity/opening-slice-source-baseline-0.1.json`
- `reference-artifacts/analyses/galaxy-guardians-identity/opening-slice-render-surface-0.1.json`
- `reference-artifacts/analyses/galaxy-guardians-identity/score-progression-0.1.json`
- [GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md](GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md)
- [GALAXY_GUARDIANS_STAGE_ARC_AND_HOMAGE_PLAN.md](GALAXY_GUARDIANS_STAGE_ARC_AND_HOMAGE_PLAN.md)

## Current Visible Truth

Hosted `dev` currently exposes a one-level playable slice.

The strongest immediate fidelity questions are not deep later-band questions.
They are opening-slice questions:

- does the `WAIT` / attract surface read like the source family
- does the score table feel like a real cabinet scoring surface
- do reserve ships, stage flags, and ready-to-fire cues feel native
- does the starfield move
- does the rack march
- do bottom exits continue into visible top re-entry

Those are the first seconds where trust is either earned or lost.

## Source Anchors

### 1. Matt Hawkins arcade intro

Use `matt-hawkins-arcade-intro` for the pre-play identity layer:

- red title and mission language
- canonical headline: `WE ARE THE GALAXIANS`
- canonical mission line: `MISSION: DESTROY ALIENS`
- `SCORE ADVANCE TABLE`
- `CONVOY` / `CHARGER` score framing
- reserve ships and early cabinet HUD read
- first visible rack and player-ready state

The promoted windows already in the repo are:

- attract mission text: `0-10s`
- score advance table: `10-35s`
- formation entry start: `40-45s`
- formation settle / stable rack: `45-55s`

### 2. Nenriki 15-wave session

Use `nenriki-15-wave-session` for the live feel of the opening and early rack:

- moving starfield
- rack cadence once the board is alive
- visible player ship readiness near the bottom
- bottom-exit / top-reentry continuity
- longer-session proof that these cues are not only decorative attract elements

The promoted windows already in the repo are:

- stable rack read: `60-75s`
- flagship / escort pressure: `90-135s`
- enemy wrap or return: `105-150s`

## What The Opening Should Read Like

### Attract / ready surface

The opening should feel like an arcade invitation, not a modern tutorial panel.

The source-family read is:

- strong red title / mission language
- a visible score-advance surface before the first real rack matters
- sparse but legible HUD elements
- reserve ships and flags that read as cabinet state, not decorative UI
- a dark board already alive with motion

### First playable rack

Once play begins, the player should read:

- a marching rack rather than a lazy drift
- a live starfield behind it
- a vulnerable single fighter with a visible ready-to-fire state
- a board that remains readable even before harder dives begin

### Early threat continuity

Even in the current public slice, lower-field motion should imply a continuous
threat model:

- ships can exit the bottom
- that threat continues rather than disappearing
- top re-entry is visible and part of the same pressure loop

## Current Repo Read

### Already present

- moving starfield is now visible in the Guardians preview board
- reserve ships and stage flags are visible
- a ready-to-fire missile cue is visible
- top re-entry exists as an explicit runtime path
- the hosted docs now expose a stage assessment, a top-10 queue, and the full
  deeper Guardians planning stack

### Still partial

- `WAIT` / attract copy is still more adapted than source-faithful
- score-table structure is still an application-owned approximation rather than
  a true four-row `CONVOY` / `CHARGER` cabinet match
- rack march cadence is closer, but still runtime-tuned rather than tightly
  measured against the source windows
- explosions and hit states still need stronger baseline authority

### Still next

- frame-extracted intro crops for title, mission, and score-table layout
- stronger measured opening-rack motion windows
- tighter palette progression and readiness-surface comparison

## Why This Matters Before Deeper Stages

The deeper stage-band and persona work is still important, but the user is
right to question it if the visible first level does not yet look convincingly
Galaxian-family.

This opening baseline exists to keep the work honest:

- opening-slice authority first
- deeper stage-band claims second
- homage variants only after the base game is readable and trustworthy

## Immediate Work Order

1. Preserve the opening-source baseline as a committed artifact and hosted
   readable doc, not only as raw source manifests.
2. Tighten `WAIT` / mission and score-table fidelity against the Matt Hawkins
   intro.
3. Tighten rack march cadence, starfield motion, and top re-entry against the
   Nenriki session.
4. Only after those land, spend heavier effort on stage `3-5` and `6-9`
   pressure tuning.

## Practical Conformance Meaning

If the opening slice becomes source-faithful enough, then later work on motion,
midrun fairness, platform-frame parity, and homage variants has a believable
foundation.

If the opening slice stays weak, later-stage scoring can look precise while the
actual public game still feels obviously off in its first ten seconds.
