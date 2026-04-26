# Galaxy Guardians Pack Contract

Status: `first-playable-preview-contract`

This is the pack-facing contract for the first playable `Galaxy Guardians`
preview. It is intentionally narrow so Platinum can prove a second game without
pretending the full Galaxian-like design is finished.

## Pack Identity

- pack key: `galaxy-guardians-preview`
- product title: `Galaxy Guardians`
- version line: `playable preview`
- shell theme: `guardians-preview`
- frame accent: `signal-crimson`

## Owned By Platinum

- game picker and pack registry
- shell chrome, marquee, settings/runtime labels, dock controls
- shared keyboard input routing
- shared audio cue engine
- shared replay/session/event capture substrate
- pack boot and pack-selection persistence rules

## Owned By Galaxy Guardians

- pack metadata and front-door copy
- playable/non-playable status
- feature capability flags
- scoring table
- player bullet cap / shot model
- formation layout bands
- stage pressure bands
- enemy family semantics
- first playable preview model
- game-specific event vocabulary

## First Playable Slice

The preview is a scout-wave slice:

- horizontal-only Galaxip movement
- one active player shot
- settled formation rack
- regular dive pressure
- enemy projectile pressure
- wave-clear/reset path through the shared fixed-screen engine

## Explicit Exclusions

The preview must not use:

- Aurora capture / rescue
- dual-fighter mode
- challenge stages
- full 15-wave progression
- exact flagship / escort score reproduction

## Evidence Anchors

- `reference-artifacts/analyses/galaxian-reference/GALAXY_GUARDIANS_FIRST_PLAYABLE_PREVIEW_SPEC.md`
- `reference-artifacts/analyses/galaxian-reference/FIRST_GALAXIAN_PREVIEW_EVIDENCE_MAP.md`
- `reference-artifacts/analyses/galaxian-reference/GALAXIAN_PROGRESSION_PRESSURE_CURVE.md`
- `reference-artifacts/analyses/galaxian-reference/nenriki-15-wave-session/promoted-windows/reference-windows.json`

## Required Harnesses

- `npm run harness:check:platinum-pack-boot`
- `npm run harness:check:game-picker-shell`
- `npm run harness:check:galaxy-guardians-playable-preview`
- `npm run harness:check:galaxian-preview-evidence`

## Next Contract Step

Split the shared fixed-screen runtime into clearer host hooks and pack-owned
rule modules before adding flagship / escort scoring or deeper progression.
