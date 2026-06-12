# Galaxy Guardians Game Spec Language

Generated: 2026-06-12
Status: planning-contract-active-not-runtime-promotion

## Purpose

This contract expands the existing shared motion grammar into a broader
Guardians-specific game specification language. The goal is to make future
adjustments readable before runtime constants change.

This is also the small proving ground for a broader Platinum direction: games
should become more specification-like and less hard-coded over time. Guardians
is the right first target because its current playable loop is simpler than
Aurora, but the language must be able to grow toward Aurora and later games.

Future Guardians changes should describe:

- which stage band they affect
- which role families they touch
- which motion primitive and grammar axes they change
- whether scoring, result flow, audio hooks, or visual hooks change
- what routeability and collision-safety result is expected
- what evidence must be generated before promotion

## Current Scope

This is not a public-depth claim. The current public slice may still end at the
one-level `mission_complete` surface while deeper stage-five and later-band
metrics remain internal conformance evidence.

## Platform Direction

The long-term direction is that Platinum increasingly executes games through a
game definition language rather than scattered game-specific control paths. That
means pack identity, stage arcs, role families, movement primitives, scoring,
audio/visual hooks, result states, and promotion gates should become explicit
enough for shared platform systems to load, validate, run, and inspect them.

Expected platform changes include:

- loading and validating game-spec artifacts as first-class pack contracts
- mapping declarative stage-band and role-family definitions into runtime state
  machines
- routing scoring, replay, pilot records, and high-score ownership through spec
  identity
- binding movement primitives to reusable runtime executors where evidence
  supports promotion
- letting ingestion outputs propose spec deltas before runtime constants change

This should not force all games into the same behavior. Aurora, Guardians, and
future games still need lineage-specific rules. The spec language should make
those differences explicit instead of hiding them in one-off code.

## Ingestion Direction

The same language, or a closely related ingestion dialect, should eventually be
populated from gameplay video analysis. Source manifests, frame windows, event
logs, object tracks, sprite crops, audio windows, routeability reads, and
correspondence scores should produce candidate spec deltas.

Video-derived ingestion should propose changes such as:

- a new movement primitive or stage-band pressure candidate
- a role-family timing adjustment
- a scoreable-window or routeability expectation
- a visual or audio hook that needs runtime support
- a promotion gate and rollback signal

Ingestion should not silently mutate runtime behavior. It should produce
reviewable spec candidates that the platform and harnesses can validate.

## Spec Layers

| Layer | What It Owns |
| --- | --- |
| Application identity | Game key, title, score/replay/pilot attribution, result framing |
| Stage-band arc | Attract, opening establish, early escalation, sustained pressure, bounded late loop |
| Role-family model | Signal scout, signal escort, signal flagship, player interceptor |
| Movement language | Shared motion primitives, routeability, collision safety, shot windows |
| Scoring/progression/results | Score table, one-level mission completion, full-run loss identity |
| Audio/visual hooks | Dive, shot, hit, loss, wrap, score-table, rack, explosion, result hooks |
| Promotion gates | Focused evidence plus aggregate first-class conformance |
| Platform execution contract | Spec loading, validation, runtime mapping, and ingestion-to-spec flow |

## Adjustment Template

Every future gameplay adjustment should be expressible as a spec delta with:

- `candidateId`
- `intent`
- `affectedSpecLayers`
- `stageBand`
- `roleFamilies`
- `movementPrimitives`
- `axesTouched`
- `scoringOrResultImpact`
- `audioHookImpact`
- `visualHookImpact`
- `routeabilityExpectation`
- `collisionSafetyExpectation`
- `evidenceToGenerate`
- `promotionGates`
- `rollbackSignal`

Ingestion-derived candidates should additionally identify source manifests,
reference windows, detected events, object tracks, sprite or cue targets,
confidence, human-review needs, and runtime promotion gates.

## Promotion Rule

A change cannot promote because one proxy metric improves. It must preserve or
improve player routeability, collision safety, shot windows, visual readability,
and player meaning. If movement changes alter interpretation, audio and visual
hook impact must be declared as unchanged, required, or intentionally deferred.

## Near-Term Use

The next useful candidate is the stage-five lower-field readability and alien
ship pace pass. It should be proposed as a spec delta before runtime constants
change, then checked against stage-five closeness, routeability, and the
aggregate first-class Guardians gate.

If this works for Guardians, the next strategic step is to extract the shared
schema and plan the first Platinum platform change that treats a game-spec
artifact as a loaded pack contract rather than only documentation.
