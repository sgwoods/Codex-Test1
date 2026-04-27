# Galaxy Guardians Preview Release Plan

Status: `preview-0.1-planning`

This document defines the first public or limited-public `Galaxy Guardians`
preview target. The goal is to prove that Platinum can host a second playable
fixed-screen arcade application without overclaiming that the full
Galaxian-style game is finished.

## Release Target

Working release name:

- `Galaxy Guardians Preview 0.1: Scout Wave`

Product promise:

- a short, honest second-game preview inside Platinum
- one playable scout-wave loop
- enough distinct rules, copy, event vocabulary, and evidence to prove this is
  not merely Aurora with renamed labels

Non-goal:

- this preview is not a full Galaxian clone, not a long-session game, and not a
  replacement for Aurora's level-by-level expansion work

## Current State

Already in place:

- `Galaxy Guardians` is registered as a Platinum pack
- the game picker can expose the second-game path
- pack-owned combat, scoring, progression, enemy-family, and event-schema
  adapters exist
- the preview has a playable scout-wave foundation
- semantic event logging exists for the first slice
- Galaxian-style reference evidence exists with promoted windows, contact
  sheets, waveforms, traces, and pressure scores
- the cross-game evidence dashboard links the preview plan to Aurora and
  Galaxian reference artifacts

Current proof commands:

```sh
npm run harness:check:platinum-pack-boot
npm run harness:check:game-picker-shell
npm run harness:check:galaxy-guardians-playable-preview
npm run harness:check:galaxy-guardians-event-log
npm run harness:check:platinum-pack-rule-adapters
npm run harness:check:galaxian-preview-evidence
npm run harness:check:evidence-cycle-dashboard
```

## Preview 0.1 Scope

The first preview should include:

- Platinum picker entry for `Galaxy Guardians`
- preview-labeled shell copy and game title
- horizontal-only Galaxip-style movement
- one active player shot
- settled formation rack
- regular dive pressure
- enemy projectile pressure
- formation and dive hit scoring
- player-hit lifecycle
- wave-clear or wave-reset path
- semantic event log with game-specific event names
- evidence links from Galaxian promoted windows and the dashboard

The first preview may use a narrow set of visuals and sounds, but it should
feel intentionally branded as a second cabinet preview.

## Explicit Exclusions

Preview 0.1 must not promise or depend on:

- Aurora capture / rescue
- dual-fighter mode
- challenge stages
- full 15-wave progression
- exact flagship / escort score reproduction
- durable production leaderboard separation
- public player records specific to the second game
- final audio identity

These exclusions should be visible in developer docs and softened into normal
preview language in any player-facing copy.

## Evidence Anchors

Primary reference artifacts:

- `GAMEPLAY_AUDIO_VISUAL_CATALOG.md`
- `reference-artifacts/analyses/galaxian-reference/GALAXY_GUARDIANS_FIRST_PLAYABLE_PREVIEW_SPEC.md`
- `reference-artifacts/analyses/galaxian-reference/FIRST_GALAXIAN_PREVIEW_EVIDENCE_MAP.md`
- `reference-artifacts/analyses/galaxian-reference/GALAXIAN_PROGRESSION_PRESSURE_CURVE.md`
- `reference-artifacts/analyses/galaxian-reference/nenriki-15-wave-session/promoted-windows/reference-windows.json`

Dashboard:

- `reference-artifacts/analyses/evidence-cycle-dashboard/evidence-cycle-dashboard.json`
- `http://127.0.0.1:8000/dist/dev/evidence-dashboard.html` when served locally

Most useful promoted Galaxian windows for this release:

- `opening-active-wave`
- `early-progression-pressure`
- `arcades-level-5-active-reference`

Those windows should guide first-wave pressure, player movement envelope,
projectile density, and the degree of visual distinction needed for a preview.

## Preview-Ready Checklist

### Product

- picker tile is clearly labeled as a preview
- front-door copy says what is playable without apologizing or overexplaining
- runtime title, shell accent, and settings labels identify `Galaxy Guardians`
- returning to Aurora remains obvious and reliable
- no player-facing text implies full progression or canonical arcade parity

### Gameplay

- player movement is responsive and bounded
- one-shot rule is enforced
- enemy rack is stable and readable
- enemy families have a documented visual baseline before deeper art polish
- at least one regular dive pressure family appears
- enemy projectiles appear without immediate unfair collapse
- one wave can clear or reset through an intentional path
- scoring feedback differs from Aurora where the pack contract says it should
- sound cue families have a documented preview baseline before final audio
  identity polish

### Platform

- pack adapters own the preview-specific rules
- no Aurora capture, rescue, dual-fighter, or challenge-stage semantics leak
  into Galaxy Guardians runtime events
- the shared shell can boot, switch, and persist the selected pack
- event logs include `gameKey: galaxy-guardians-preview`
- release docs describe the preview as a Platinum pack proof

### Evidence And Harnesses

- the required harness set passes
- `galaxy-guardians-event-log` observes all first-slice semantic events
- `galaxy-guardians-no-capture-leak` proves capture/rescue state cannot leak
  through live pressure or stale lower-level enemy state
- `galaxian-preview-evidence` remains green
- at least one local preview screenshot or contact sheet exists before public
  release review
- known browser capture limitations are documented if video/audio evidence is
  incomplete

## First Implementation Branch

Recommended next branch:

- `codex/macbook-pro-galaxy-guardians-preview-polish`

Preferred first implementation slice:

1. tighten picker/front-door preview copy and labels
2. implement the documented first visual/audio identity cue set from
   `GAMEPLAY_AUDIO_VISUAL_CATALOG.md` without disturbing Aurora
3. add or strengthen one harness proving the preview tile, pack boot, event log,
   and no-Aurora-mechanic exclusions together
4. regenerate the dashboard so the preview release target is visible locally

Keep this slice small. It should make the preview feel intentional, not expand
the mechanics into flagship/escort behavior yet.

## Release Gate

Preview 0.1 is ready for a limited public or `/dev` preview only when:

- all required harnesses pass on the integration branch
- release authority has explicitly approved any hosted publish step
- player-facing copy labels the game as a preview
- known exclusions are documented
- Aurora remains unaffected by switching into and out of the second game
- the preview has at least one committed evidence artifact beyond raw runtime
  assertions

This MacBook may develop and push the preview branch, but it must not publish
beta or production unless release authority is transferred here.

## Follow-On Preview 0.2 Candidates

After Preview 0.1:

- flagship / escort semantics
- richer Galaxian-style dive families
- stronger visual identity
- first progression pressure bands beyond a scout wave
- preview-specific score policy
- shared video artifact for the second game
- movement envelope comparison against promoted Galaxian windows
