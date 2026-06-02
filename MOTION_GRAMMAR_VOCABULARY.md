# Motion Grammar Vocabulary

This document is the human-readable companion to:

- `reference-artifacts/analyses/shared-motion-grammar/vocabulary-0.1.json`

The goal is to make arcade movement ingestion reusable across Aurora Galactica,
Galaxy Guardians, and future games without turning every game into the same
game. We need a common language for movement, then each game can map that
language to its own lineage, rules, theme, and scoring goals.

## Why This Exists

Recent Aurora challenge-stage work showed that a candidate can look tempting in
one metric while making the game worse for a strong player. In particular, a
candidate can improve an expected label score while reducing human-perfect
routeability. That is not a shippable improvement.

The shared grammar makes this explicit:

- a movement has a visual shape
- a movement has timing and grouping
- a movement has a player meaning
- a movement has a routeability result
- a movement may need audio support
- a movement should not promote until all of those are accounted for

This matters just as much for main-stage entry and attack behavior as it does
for bonus or challenge stages.

## Naming Standard

Use ordinary stages for normal progression:

- `Stage 1`
- `Stage 2`
- `Stage 3`

Use between-stage naming for challenge stages:

- `Challenging Stage 2-3`
- `Challenging Stage 6-7`

This avoids treating a bonus stage as if it were the next ordinary combat stage.

## Core Axes

| Axis | Meaning |
| --- | --- |
| temporal-cadence | When groups appear, pause, accelerate, resolve, and hand control back. |
| path-topology | The movement shape: loop, hook, column drop, escort dive, bottom wrap, rack drift, or authored set piece. |
| object-grouping | How many enemies move together and whether they are paired, escorted, or swarm-like. |
| role-family | Which gameplay identity appears: bee, butterfly, boss, flagship, bonus alien, player ship, projectile, or a future role. |
| player-routeability | Whether a strong player can read the route and convert the opportunity into score or survival. |
| collision-safety | Whether the movement creates fair risk and avoids unintended unavoidable collisions or challenge-stage kills. |
| shot-window | Whether the player can fire at meaningful times and the game resolves those shots consistently. |
| visual-readability | Whether the motion can be parsed: scale, spacing, overlap, persistence, and silhouette clarity. |
| audio-cue-hooks | Where movement needs warning, impact, reward, transition, or status sound. |

## Primitive Set

The current shared primitives are:

- `formation-entry`
- `rack-drift`
- `dive-attack`
- `escort-linked-dive`
- `bottom-wrap-return`
- `challenge-setpiece-group`
- `pulse-flap-cadence`
- `capture-tractor`
- `scoring-routeability-window`

These are intentionally not Galaga-only. Aurora maps them to Galaga-like
challenge groups, boss capture, sprite pulse, and main-rack entry. Guardians
maps them to Galaxian-style dives, flagship escorts, and stage-five pressure.
Future Space-Invaders-style work can map them to rack march, descent pressure,
bunker lanes, UFO passes, and shot lanes.

## Promotion Rule

No movement candidate should ship because visual object-track score improves in
isolation.

Before runtime promotion, a movement candidate should preserve or improve:

- player routeability
- collision safety
- shot windows
- visual readability
- semantic identity for the target stage or scenario
- audio cue hooks when movement changes player interpretation

This is why the Aurora candidate sweep now blocks candidates that reduce
human-perfect routeability, even when another score looks slightly better.

## Visualization Bridge

For Aurora challenge-stage and main-entry work, a motion grammar row should be
reviewable by a human before it becomes a tuning candidate. The preferred visual
bundle is:

- target reference contact sheet or video snippet
- current runtime contact sheet or video snippet
- object-track or trajectory overlay
- phase/cadence summary
- persona routeability read
- promotion decision and reason

The Watch Mode `CHALLENGE TOUR` path is now the default runtime source for
challenge-stage evidence because it keeps the persona, scope, scoring
eligibility, and challenge-only progression explicit. The same visual bridge
should be reused for main-stage formation entry and attack behavior so
challenging-stage movement does not become a special-case system.

## Current Project Use

Aurora Galactica:

- challenge-stage candidate sweeps
- before/after contact sheets
- human-perfect routeability guard
- challenge-tour watch clips as runtime grammar evidence
- main-stage entry and attack paths as grammar candidates
- main-stage and boss choreography planning

Galaxy Guardians:

- new routeability review artifact
- motion grammar candidate queue
- stage-five stress read
- future movement candidate loop guard

Current candidate queue:

- `reference-artifacts/analyses/galaxy-guardians-identity/motion-grammar-candidates-0.1.json`
- `reference-artifacts/analyses/galaxy-guardians-identity/motion-grammar-candidates-0.1.md`
- `reference-artifacts/analyses/galaxy-guardians-identity/routeability-before-after-0.1.json`
- `reference-artifacts/analyses/galaxy-guardians-identity/routeability-before-after-0.1.md`
- `reference-artifacts/analyses/galaxy-guardians-identity/routeability-before-after-0.1.svg`

The top row is intentionally player-centered: stage-five stress routeability
relief. The goal is not to make the game easier in the abstract. The goal is to
keep later pressure learnable, scoreable, and visibly fair before any dive,
escort, or wrap constants are promoted.

The first measured planning pass found a balanced stage-five relief candidate
that lifts routeability from `4.5/10` to `5.8/10` and lowers collision-loss
share from `80%` to `47%` in the fixed review window. This is not a runtime
promotion; it is the current best evidence-backed candidate for the next
Guardians gameplay pass.

Windigo Invaders / future third game:

- first test that the grammar can describe another arcade lineage without
  copying Aurora-specific assumptions

## Next Step

The next valuable improvement is a candidate loop that emits the same grammar
fields for both Aurora and Guardians: primitive id, axes touched, expected
player meaning, visual evidence, routeability delta, and promotion decision.
