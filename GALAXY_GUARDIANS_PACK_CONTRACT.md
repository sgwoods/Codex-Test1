# Galaxy Guardians Pack Contract

Status: `first-playable-preview-contract`

This is the pack-facing contract for the first playable `Galaxy Guardians`
preview. It is intentionally narrow so Platinum can prove a second game without
pretending the full Galaxian-like design is finished.

Preview release target:

- [GALAXY_GUARDIANS_PREVIEW_RELEASE_PLAN.md](GALAXY_GUARDIANS_PREVIEW_RELEASE_PLAN.md)

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
- `npm run harness:check:galaxy-guardians-event-log`
- `npm run harness:check:platinum-pack-rule-adapters`
- `npm run harness:check:galaxian-preview-evidence`
- `npm run harness:check:evidence-cycle-dashboard`

## Next Contract Step

Make the first preview release feel intentional before adding flagship / escort
scoring or deeper progression. The next branch should focus on preview copy,
picker polish, a small game-specific identity cue, and a harness that proves
the preview remains separate from Aurora-only mechanics.
