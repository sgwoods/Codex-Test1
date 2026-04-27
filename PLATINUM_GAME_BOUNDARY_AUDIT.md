# Platinum Game Boundary Audit

Status: `architecture-principle-and-current-main-audit`

Date: 2026-04-27

Use this document when deciding whether a change belongs in Platinum, Aurora
Galactica, Galaxy Guardians, or a future game pack.

## Architectural Principle

Games on Platinum must not share game-specific code, rule tables, state, assets,
or capabilities directly with each other.

If two or more games need the same behavior, the behavior should be promoted
into Platinum as a named platform API, interface, service, capability, contract,
or harness substrate. A game may depend on that Platinum contract, but it should
not depend on another game's implementation.

This creates three hard rules:

- Aurora changes must not alter Galaxy Guardians behavior except through an
  intentional Platinum contract change.
- Galaxy Guardians changes must not alter Aurora behavior except through an
  intentional Platinum contract change.
- A future game's reusable need should become a Platinum extension point rather
  than a sideways import from Aurora or Galaxy Guardians.

## Current Mainline Read

Current `main` is still in a transitional but understandable state.

What is safe today:

- Aurora Galactica remains the only playable application.
- Galaxy Guardians is a preview-only pack.
- `start()` blocks non-playable packs before gameplay starts.
- preview launch fallback restores the playable default pack.
- pack capability flags already distinguish Aurora-only mechanics such as
  capture/rescue, challenge stages, and dual-fighter mode.
- the shared entity helper only attaches capture state when the active pack
  declares `usesCaptureRescue`.

What is not yet ready for a playable second game:

- the pack registry and Aurora pack data still live together in
  `src/js/13-aurora-game-pack.js`
- the Galaxy Guardians preview pack currently reuses Aurora atmosphere, audio,
  stage cadence, stage band, formation, challenge, frame accent, and scoring
  tables
- core gameplay files are still Aurora application files, not a routed
  multi-game gameplay adapter layer
- `src/js/90-harness.js` is still mostly an Aurora gameplay harness surface even
  though some harness hooks are platform-facing
- some debug and docs-preview globals still carry Aurora names

That is acceptable for a shell preview. It is not acceptable for Galaxy
Guardians `0.1` gameplay.

## Coupling Inventory

### Pack Registry And Pack Data

Current file:

- `src/js/13-aurora-game-pack.js`

Current status:

- contains both `AURORA_GAME_PACK` and `GALAXY_GUARDIANS_PACK`
- exposes shared pack registry functions
- stores Aurora rule tables and theme tables
- lets the preview pack reuse Aurora tables while it is non-playable

Required direction:

- split platform registry behavior from game-owned pack definitions
- keep Aurora tables in an Aurora-owned pack module
- create Galaxy Guardians-owned rule, movement, audio, visual, and scoring
  tables before its playable preview
- reject direct reuse of another game's tables unless the reused behavior has
  first been promoted into a Platinum contract

### Gameplay Runtime

Current files:

- `src/js/05-player-flow.js`
- `src/js/05-player-combat.js`
- `src/js/06-enemy-behavior.js`
- `src/js/07-capture-rescue.js`
- `src/js/08-score-awards.js`
- `src/js/09-stage-flow.js`
- `src/js/10-gameplay.js`
- `src/js/20-render.js`
- `src/js/21-render-board.js`

Current status:

- these are still Aurora gameplay implementation files
- they can call pack metadata, scoring, timing, and capability helpers
- they are safe while Aurora is the only playable pack
- they should not become the hidden runtime for a playable Galaxy Guardians
  slice

Required direction:

- introduce a gameplay adapter boundary before a second playable ruleset ships
- let Platinum call the active game's adapter through a stable interface
- keep Aurora capture/rescue, dual fighter, challenge-stage behavior, and
  Aurora scoring in the Aurora adapter
- keep Galaxy Guardians scout-wave, flagship, escort, single-shot, dive, and
  scoring behavior in the Galaxy Guardians adapter

### Capability Flags

Current status:

- capability flags exist and are already useful in the picker and entity model
- Galaxy Guardians preview explicitly disables:
  - `usesChallengeStages`
  - `usesCaptureRescue`
  - `usesDualFighterMode`

Required direction:

- keep capability flags declarative
- make gameplay boot and gameplay adapters enforce them
- add cross-pack harnesses proving disabled capabilities cannot leak into a
  pack's runtime

### Preview Fallback

Current files:

- `src/js/05-player-flow.js`
- `src/js/00-boot.js`
- `src/js/15-game-picker.js`

Current status:

- non-playable packs cannot start gameplay
- preview selection is not persisted as the durable playable pack
- launching from a preview-only state returns to the playable default

Required direction:

- keep this as Platinum behavior
- when there is more than one playable game, replace single default fallback
  assumptions with an explicit "first playable/default playable pack" policy

### Harnesses

Current file:

- `src/js/90-harness.js`

Current status:

- contains both platform-facing hooks and Aurora-specific gameplay controls
- still uses Aurora-shaped capture, challenge, rescue, and dual-fighter setup
  helpers

Required direction:

- split platform harness hooks from application harness hooks
- require each playable game to provide its own behavior harness family
- add seam harnesses for cross-pack isolation

## Guardians 0.1 Gate

Before Galaxy Guardians can be treated as a real playable preview, the branch
must prove:

- no Aurora capture/rescue behavior can run in Guardians
- no Aurora dual-fighter state can run in Guardians
- no Aurora challenge-stage cadence can run in Guardians
- Guardians has its own alien catalog, visual identity, sound cue catalog,
  movement model, scoring table, and event vocabulary
- any shared input, shell, audio engine, event capture, replay, or service
  behavior is reached through Platinum APIs rather than Aurora code
- Aurora harnesses still pass after Guardians gameplay is added
- Guardians harnesses fail if Aurora-only mechanics appear in the Guardians
  runtime

## Recommended Next Code Slice

The next implementation slice should be a platform boundary slice, not a large
gameplay slice:

- create a platform-owned pack registry module
- split Aurora pack data out of the registry
- add a placeholder Galaxy Guardians pack-data module that does not reuse Aurora
  rule tables for future playable fields
- add a cross-pack isolation harness for disabled capabilities
- update the architecture docs after the split

