# Galaxy Guardians Game Spec Language

Generated: 2026-06-12
Status: planning-contract-active-not-runtime-promotion

## Purpose

This contract expands the existing shared motion grammar into a broader
Guardians-specific game specification language. The goal is to make future
adjustments readable before runtime constants change.

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
