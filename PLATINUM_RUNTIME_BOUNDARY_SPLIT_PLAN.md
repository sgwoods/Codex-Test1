# Platinum Runtime Boundary Split Plan

Status: `first-pass-map`

This plan records the current fixed-screen runtime seams before a larger
refactor. The intent is to let Aurora and Galaxy Guardians share Platinum's
engine services while moving game-specific behavior into pack-owned rules.

## Current Shape

Platinum already owns:

- game pack registry and picker
- shell chrome, front-door copy, and modal surfaces
- shared keyboard routing
- replay/session logging
- browser harness bootstrapping
- local replay/video substrate

Aurora and Galaxy Guardians currently still share the same fixed-screen runtime
modules for player combat, stage flow, enemy behavior, scoring, and lifecycle.
That is useful for the first preview, but it leaves Aurora assumptions close to
the second-game path.

## First Boundary To Split

Do not split the render loop first. Split rule lookup first.

The next refactor should keep the loop stable and make these rule families
pack-owned:

| Rule Family | Current Home | Desired Owner |
| --- | --- | --- |
| player bullet caps | `src/js/05-player-combat.js` plus pack combat config | pack combat rules |
| formation layout | `src/js/09-stage-flow.js` via pack config | pack formation rules |
| stage cadence | `src/js/13-aurora-game-pack.js` | pack progression rules |
| scoring | `src/js/08-score-awards.js` via pack scoring config | pack scoring rules |
| capture/rescue availability | runtime checks plus pack capabilities | pack capabilities plus rule guards |
| challenge-stage availability | runtime checks plus pack cadence | pack progression rules |
| reference timings | pack timing tables | pack timing rules |
| semantic event names | shared logging plus pack aliases | pack event schema |

## Immediate Rules

For Galaxy Guardians:

- one active player shot
- no capture/rescue
- no dual fighter
- no challenge stages
- scout-wave formation rack
- regular dive pressure and enemy projectile pressure
- semantic events alias the shared runtime event stream

For Aurora:

- keep the existing capture/rescue and dual-fighter behavior
- keep existing challenge stages until the Aurora evidence cycle chooses the
  first expansion target
- use the same semantic-event grammar only when adding new stage-depth harnesses

## Next Code Step

Create a small pack-rule adapter before moving full modules:

```js
currentGamePackCombatRules()
currentGamePackProgressionRules()
currentGamePackEnemyFamilyRules()
currentGamePackEventSchema()
```

The adapter should return frozen data from `src/js/13-aurora-game-pack.js` at
first. Only after harness coverage proves the rule lookups should runtime code
move into separate application modules.

## Harness Expectations

Boundary cleanup should keep these checks green:

- `npm run harness:check:platinum-pack-boot`
- `npm run harness:check:game-picker-shell`
- `npm run harness:check:galaxy-guardians-playable-preview`
- `npm run harness:check:galaxy-guardians-event-log`
- `npm run harness:check:player-movement-conformance`
- `npm run harness:check:challenge-stage-correspondence`

## Coordination Note

Because another workstation may be editing runtime behavior, boundary-split
branches should stay small and should fetch/rebase from `main` before merge.
Avoid moving whole files until the adapter layer is proven.
