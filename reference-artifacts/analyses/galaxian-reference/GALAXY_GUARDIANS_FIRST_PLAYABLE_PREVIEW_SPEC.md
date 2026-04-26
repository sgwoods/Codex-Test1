# Galaxy Guardians First Playable Preview Spec

Status: `first-playable-preview-online`

Target pack: `galaxy-guardians-preview`

This spec defines the first playable slice built from the current Galaxian
reference evidence. It is intentionally small: enough to pressure-test Platinum
as a second-game host without pretending the whole game has been modeled.

## Evidence Inputs

- `FIRST_GALAXIAN_PREVIEW_EVIDENCE_MAP.md`
- `GALAXIAN_PROGRESSION_PRESSURE_CURVE.md`
- `nenriki-15-wave-session/promoted-windows/reference-windows.json`
- `arcades-lounge-level-5/traces/trace-summary.json`
- Matt Hawkins intro / rack / score-table artifacts
- `GALAXY_GUARDIANS_PACK_CONTRACT.md`
- `GALAXY_GUARDIANS_EVENT_SCHEMA_PLAN.md`

## Preview Promise

The first preview should feel like a distinct Galaxian-family sibling:

- single Galaxip player ship
- settled alien rack with flagship / escort semantics visible in data
- player single-shot pressure
- alien dives and projectile pressure
- a small progression hook that can later separate opening, mid, and late waves
- no Aurora-specific capture / rescue assumptions

Runtime status:

- `galaxy-guardians-preview` is now marked playable
- it uses pack-owned scoring, pressure bands, formation layout, and capability
  flags
- the shared fixed-screen engine still supplies the first movement / rack / shot
  loop

## First Mechanics Slice

### Player

- horizontal-only movement
- one active player shot at a time
- movement envelope should initially use the ARCADE'S LOUNGE active-play range
  and the Nenriki promoted windows as review evidence
- no dual-fighter, capture, tractor-beam, or rescue behavior in this preview

### Formation

- one settled rack at game start
- top-rank flagship family should be represented in config even if the first
  slice does not fully implement escorted scoring behavior
- escort/red-alien family should be represented separately from normal ranks
- rack should be reusable for later wave-entry work

### Enemy Attacks

- implement one regular alien dive family first
- support at least one projectile stream from attacking aliens
- keep flagship / escort dives as separate behavior families in data, even if
  initially disabled or limited
- use active-play traces for pressure bands, not the raw pressure-score ranking
  alone

### Progression

- preview starts in an opening-active state
- one basic wave clear / reset hook should exist
- opening, mid-session, late-session, and cleanup pressure families should exist
  as named tuning bands
- do not implement full 15-wave progression until exact transition windows are
  promoted

### Audio

- use placeholder-safe cue slots at first
- do not clone source audio
- keep audio events aligned with shot, hit, dive, wave-clear, and game-over
  events so a later sound-identity pass has anchors

## First Harness Targets

- `npm run harness:check:platinum-pack-boot`
- `npm run harness:check:game-picker-shell`
- `npm run harness:check:galaxy-guardians-playable-preview`
- `npm run harness:check:galaxian-preview-evidence`

## Explicit Non-Goals

- no full long-session progression
- no complete score table
- no exact flagship / escort scoring reproduction
- no public release work from this machine
- no large source video blobs committed to normal git

## Next Build Step

Before code implementation, create a small pack-facing config and event-schema
plan that maps each mechanic above to a Platinum-owned capability or a
`Galaxy Guardians` pack-owned rule.
