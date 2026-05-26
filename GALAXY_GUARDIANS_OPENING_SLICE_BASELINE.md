# Galaxy Guardians Opening-Slice Baseline

Updated: May 23, 2026

## Purpose

This document narrows the current `Galaxy Guardians` conformance discussion to
the first visible slice a player sees on hosted `dev` and `beta`.

That slice still decides whether the game feels like a real Galaxian-family
cabinet or like a generic preview. Before deeper-stage claims matter, the
opening needs to read correctly.

This is the human-readable companion to:

- `reference-artifacts/analyses/galaxy-guardians-identity/opening-slice-frame-reference-0.1.json`
- `reference-artifacts/analyses/galaxy-guardians-identity/opening-slice-source-baseline-0.1.json`
- `reference-artifacts/analyses/galaxy-guardians-identity/opening-slice-render-surface-0.1.json`
- `reference-artifacts/analyses/galaxy-guardians-identity/opening-rack-motion-0.1.json`
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

## Promoted Frame Windows

The opening no longer depends only on broad contact-sheet summaries.

The repo now carries a Guardians-owned promoted frame-window authority artifact:

- `reference-artifacts/analyses/galaxy-guardians-identity/opening-slice-frame-reference-0.1.json`

That artifact binds three concrete extracted windows into the current opening
review path:

- `matt-hawkins-arcade-intro/attract-mission-text`
- `matt-hawkins-arcade-intro/score-advance-table`
- `nenriki-15-wave-session/wrap-return-pressure`

Each window already has a committed frame index, contact sheet, motion
difference sheet, waveform, and spectrogram. The promoted Guardians artifact
now also records representative sample-read timestamps so runtime layout and
wrap-return work can cite specific frame windows instead of only plan prose.

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
- starfield motion is now denser and more directional instead of reading like a
  near-static decorative scatter
- the `WAIT` / preview mission block now preserves the canonical
  `MISSION: DESTROY ALIENS` phrase inside a tighter Guardians-owned cabinet
  layout instead of a looser generic copy block
- score-table framing now uses `CONVOY` / `CHARGER` inside a compact aligned
  wait-surface and preview-modal layout rather than a plain generic table
- reserve ships and stage flags are visible
- a ready-to-fire missile cue is visible
- top re-entry now begins higher above the board and sweeps back in more
  continuously instead of reading like a shallow pop-in
- hit and destruction feedback now uses a more sprite-like pixel-burst flash
  rather than only line-burst rings
- preview palette ownership is now theme-driven instead of relying almost
  entirely on one static alien color family
- promoted frame windows now explicitly anchor the opening mission text,
  score-table read, and wrap-return pressure instead of leaving those surfaces
  only at the level of broad source manifests
- the hosted docs now expose a stage assessment, a top-10 queue, and the full
  deeper Guardians planning stack

### Still partial

- the title line remains a Guardians-owned adaptation even though the primary
  mission line now preserves the canonical `MISSION: DESTROY ALIENS` phrase
- the promoted frame windows now give the `WAIT` and score-table surfaces real
  opening authority, but the current runtime still presents a three-row
  application-owned adaptation rather than a tighter four-row cabinet match
- rack march cadence now has its own object-track-derived opening contract, but
  the starfield and re-entry surfaces still need measured target windows of the
  same evidence quality before the whole opening board feels equally
  source-faithful
- explosions and hit states now read better, but they still need frame-backed
  source authority rather than only runtime improvement
- palette progression is now more source-aligned in the opening slice, but the
  stage-owned color story is still partial rather than fully measured

### Still next

- stronger measured starfield-motion and top-reentry windows so those surfaces
  have the same evidence quality as the opening-rack motion contract
- tighter runtime `WAIT`, title, mission, and score-table layout against the
  promoted Matt Hawkins frame windows
- frame-backed explosion and hit reference crops so the new runtime feedback is
  judged against committed source windows
- tighter palette progression and readiness-surface comparison beyond the
  opening family

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
2. Promote measured starfield-motion and top-reentry windows to the same
   evidence class as the rack-motion contract.
3. Tighten runtime `WAIT`, title, mission, and score-table layout against the
   now-promoted Matt Hawkins frame windows.
4. Promote frame-backed explosion and hit-state authority.
5. Only after those land, spend heavier effort on stage `3-5` and `6-9`
   pressure tuning.

## Practical Conformance Meaning

If the opening slice becomes source-faithful enough, then later work on motion,
midrun fairness, platform-frame parity, and homage variants has a believable
foundation.

If the opening slice stays weak, later-stage scoring can look precise while the
actual public game still feels obviously off in its first ten seconds.
