# Guardians Watch And Rival Enablement Plan

Date: 2026-06-07

## Goal

Make `1 PLAYER`, `2 PLAYER / Rival`, and `WATCH` behave like a true
platform-standard modality set instead of an Aurora-only maturity advantage.

The intent is not to force all games to support all three modes immediately.
The intent is to make the shell, capability model, runtime contracts, and user
facing behavior pack-neutral, while each game pack can explicitly enable or
disable the modes it actually supports.

## Current Read

### Aurora

- `1 PLAYER`: first-class
- `2 PLAYER / Rival`: first-class
- `WATCH`: first-class
- `WATCH / CHALLENGE TOUR`: first-class

Aurora is the completed reference implementation.

### Galaxy Guardians

- `1 PLAYER`: playable-preview only
- `WATCH`: operational in harness/runtime terms, but not first-class front-door
  parity
- `2 PLAYER / Rival`: unsupported

## What Is Already Working

1. Shared shell/watch state already exists.
   - `src/js/05-player-flow.js`
   - `src/js/90-harness.js`

2. Guardians already understands watch semantics in its adapter.
   - `src/js/13-galaxy-guardians-gameplay-adapter.js`

3. Guardians now has a canonical whole-run watch/persona lane.
   - `tools/harness/scenarios/guardians-full-run-persona.json`
   - `reference-artifacts/analyses/correspondence/guardians-persona-fullrun/`

4. The platform already knows how to express rival/watch semantics cleanly.
   - Aurora proves the runtime and shell language is good enough.

## What Is Still Blocking Real Platform Standardization

1. `2UP / Rival` support is still hard-gated to Aurora.
   - `currentGameSupportsPlayerTwo()` in `src/js/05-player-flow.js`

2. The front-door player-mode block still hides `WATCH` when `2UP` is not
   supported.
   - `buildPlayerTwoStartHtml()` early returns in `src/js/05-player-flow.js`

3. Guardians is still registered only as a preview adapter, not a first-class
   gameplay adapter.
   - `src/js/13-gameplay-adapter-registry.js`
   - `src/js/13-galaxy-guardians-game-pack.js`

4. Guardians does not yet have validated rival semantics.
   - no proven turn alternation
   - no proven score isolation across human/rival turns
   - no proven game-over/results path parity under rival mode

## Ordered Plan

### 1. Introduce explicit modality capabilities in pack metadata

Add pack-neutral capability fields such as:

- `supportsSolo`
- `supportsWatch`
- `supportsPlayerTwoRival`
- `supportsChallengeTourWatch`

Desired outcome:
- shell logic stops inferring modality support from Aurora-specific game keys

### 2. Decouple Watch from the Aurora-only `2UP` gate

Refactor the front-door player-mode markup so:

- `WATCH` can appear when a pack supports watch even if it does not support
  rival
- `2UP / Rival` can remain disabled or hidden independently

Desired outcome:
- Guardians can expose first-class Watch without pretending it supports Rival

### 3. Add platform-owned capability helpers

Introduce helpers such as:

- `currentGameSupportsWatch()`
- `currentGameSupportsPlayerTwoRival()`
- `currentGameSupportsChallengeTourWatch()`

Desired outcome:
- one capability vocabulary across the shell, harnesses, docs, and tests

### 4. Promote Guardians Watch to a normal front-door flow

Keep the existing whole-run harness lane, but make sure a human can start
Guardians Watch from the normal front door with:

- Intermediate default persona
- full-game scope
- clear score-not-recorded language

Desired outcome:
- Watch becomes a real product surface, not just a harness capability

### 5. Add Guardians Watch acceptance checks

Required proof:

- front-door Watch visibility
- Watch start state
- stage progression beyond stage `1`
- score-not-recorded behavior
- game-over/results behavior under Watch

Desired outcome:
- Guardians Watch becomes stable enough to use as the main review loop

### 6. Keep Guardians Rival explicitly disabled until runtime parity exists

Do not soft-enable Rival early.

Desired outcome:
- honest product behavior
- no fake platform parity

### 7. Define the exact Guardians Rival contract before implementation

Before enabling Rival, specify:

- turn alternation model
- score isolation model
- results and posting policy
- sign-in requirements
- rival persona policy

Desired outcome:
- Rival becomes a deliberate feature, not a shell toggle accident

### 8. Implement Guardians Rival only after Watch is first-class

Desired outcome:
- the next session starts with the right priority:
  first-class Watch parity first, Rival second

## Success Criteria

This plan succeeds when:

1. `WATCH` is platform-standard and first-class for both Aurora and Guardians.
2. `2 PLAYER / Rival` is platform-standard in capability modeling, even if only
   Aurora enables it initially.
3. Guardians no longer relies on Aurora-specific gating for modality surfaces.
4. The next Codex session can start directly on Watch/Rival work instead of
   rediscovering the architecture state.
