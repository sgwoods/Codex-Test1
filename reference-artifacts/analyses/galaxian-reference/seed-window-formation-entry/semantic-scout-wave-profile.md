# Semantic Scout-Wave Profile

Window id: `seed-window-formation-entry`

Status: `scaffold`

This profile translates the first `Galaxian` reference window into the smallest
useful `Galaxy Guardians` scout-wave model.

It should not be treated as implementation authority until the event log has
timestamps and confidence labels.

## Player Contract

Known from current supporting sources:

- player controls a bottom-field ship
- movement is left / right only
- firing uses one primary shot action

To verify in the selected window:

- movement acceleration or constant-speed feel
- first visible movement correction
- whether movement and firing overlap cleanly
- how screen-edge constraints feel

## Shot And Cooldown Rules

Working hypothesis:

- the first scout-wave slice should use a strict single-shot model
- the player cannot fire another shot until the previous shot hits or leaves the
  board

Evidence needed:

- first shot timestamp
- shot travel duration
- next possible shot timing
- visible player hesitation caused by shot lifetime

## Enemy Families

Working families for the first slice:

- bottom-rank alien
- mid-rank alien
- red escort alien
- flagship / Galboss-like top-rank enemy

Evidence needed:

- visible formation row count
- first diver type
- whether escorts appear in the first window
- whether flagship behavior is visible enough for the first playable slice

## Formation Rules

Working hypothesis:

- the slice begins with a visible formation rack
- formation entry and settling are meaningful timing events
- rack completion should be a harness target

Evidence needed:

- formation-entry start time
- rack-complete time
- row and column layout
- lateral oscillation cadence after settling

## Dive Rules

Working hypothesis:

- early pressure comes from one or more aliens breaking formation and diving in
  curved paths
- flagship / escort dives should remain a distinct rule family

Evidence needed:

- first dive start time
- first diver family
- path shape
- projectile behavior during dive
- return / exit / wrap behavior

## Scoring Rules

Supporting sources suggest:

- aliens during assault can score differently than formation kills
- flagship / Galboss-like enemies have special scoring when handled with escorts

Evidence needed:

- first visible score award
- whether score changes differ for formation versus dive kills
- whether this window contains enough evidence for flagship scoring

## Audiovisual Identity

To capture:

- cabinet sound density
- shot sound timing
- enemy dive sound timing if audible
- formation color and brightness notes
- player and alien readability notes

## Platinum Extension Needs

Likely needed for the first playable slice:

- pack-owned enemy family table
- pack-owned formation entry schedule
- pack-owned dive scheduler
- pack-owned single-shot player rule
- pack-owned scoring table
- harness events for formation, dive, player shot, and score award

Avoid inheriting Aurora-only systems unless the evidence explicitly calls for
them.

## First Harness Targets

Draft targets:

- `formation_entry_start` appears before `formation_rack_complete`
- `alien_dive_start` occurs after rack completion or after a documented overlap
- player shot cadence blocks a second shot while the first shot is active
- first scout-wave slice emits comparable harness events to the reference log
- launch and fallback behavior still respects the Platinum pack contract

## Open Questions

- Which source becomes the canonical first window?
- Do we need a local emulator capture for stable frame timing?
- Is the first playable slice allowed to omit flagship scoring, or should it
  include a minimal flagship / escort branch immediately?
- What is the smallest semantic unit that still feels like `Galaxian` rather
  than generic fixed-shooter behavior?
