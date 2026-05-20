# Immersive Full-Window Gameplay Mode Plan

Updated: May 20, 2026

## Goal

Add an optional hidden/developer gameplay mode that lets the active game board
use the available browser window for a more full-cabinet arcade experience.

The intent is not to change Aurora or Guardians gameplay rules. The intent is
to reduce framing overhead during play, make sprites and motion easier to see,
and give reviewers a mode that feels closer to standing at a dedicated arcade
screen.

## Product Shape

- hidden keyboard toggle: `F`
- optional Developer Tools toggle while the feature is still experimental
- use browser Fullscreen API when permitted by the browser and user gesture
- fall back to a full-window in-browser layout when native fullscreen is not
  available
- preserve an obvious exit path with `Escape`, `F`, and a compact on-screen
  control if needed
- keep dock, settings, scores, bug report, and help available as compact
  overlays rather than permanently consuming board space
- keep game pack ownership intact: Platinum owns the shell/full-window layout;
  each game owns its board aspect, logical coordinate system, and gameplay
  rules

## Design Rules

1. Preserve logical gameplay coordinates.
   - Canvas scaling must not change physics, collision, shot timing, persona
     behavior, replay determinism, or scoring.
2. Preserve crisp arcade pixels.
   - Scaling should favor integer or near-integer pixel presentation when
     possible and should not blur sprites or text.
3. Preserve input mapping.
   - Mouse, touch, keyboard, and replay input coordinates must map correctly
     after resizing.
4. Preserve same-control compliance.
   - The feature must behave consistently across Aurora, Galaxy Guardians, and
     later packs.
5. Preserve safety surfaces.
   - Sign-in, mute, pause, feedback, scores, and developer controls should not
     become unreachable.
6. Treat fullscreen as a shell mode, not a game theme.
   - Game conformance scores should not improve simply because the board is
     larger; separate "display experience" from strict gameplay conformance.

## Implementation Strategy

### Phase 1: Hidden Prototype

- add a shell state such as `immersiveFullWindowMode`
- bind `F` to toggle it when focus is not in an input field
- add a root CSS class that removes nonessential frame constraints and lets the
  game board occupy the available viewport
- keep the canvas aspect ratio stable and center the board
- auto-collapse side rails and noncritical chrome while mode is active
- record mode toggles in gameplay/session logs for later production learning

### Phase 2: Harness And Visual Gates

Add targeted checks before exposing this broadly:

- board bounds: canvas remains visible and contained at common desktop and
  laptop viewport sizes
- input mapping: left/right/fire still land in the same logical gameplay
  coordinates after scale changes
- overlay escape: settings, scores, help, feedback, and exit controls can still
  open and close
- screenshot review: board is not cropped, blurred, or overlapped by shell UI
- replay/video capture: exported evidence still identifies the active display
  mode and remains comparable to standard mode
- pack boundary: the same shell mode works for Aurora and Galaxy Guardians
  without game-specific shell hacks

### Phase 3: Developer Exposure

- add a Developer Tools toggle after the hidden shortcut is stable
- display active mode, viewport, scale factor, and board bounds in diagnostics
- let reviewers start watch/persona runs directly in the full-window mode
- keep the feature default-off until it has enough manual and harness coverage

### Phase 4: Product Decision

After testing:

- decide whether the mode stays hidden/developer-only, becomes a public
  keyboard shortcut, or becomes a first-class cabinet display option
- document whether native browser fullscreen is enabled in production or
  whether production uses only the full-window fallback
- update player guide, developer guide, release notes, and dashboard readouts
  only after the interaction is stable

## Success Criteria

- the board uses materially more of the browser window without changing game
  mechanics
- visual scale improves reviewability of sprites, formation spacing, challenge
  paths, and motion cadence
- no new horizontal or vertical overflow is introduced
- controls and replay determinism remain unchanged
- overlays remain reachable and closable
- the feature works for Aurora and Galaxy Guardians through Platinum shell
  capability, not through Aurora-only layout code
- release notes can honestly describe this as an optional display-experience
  improvement, not as a gameplay conformance shortcut

## Risks

- canvas scale could break hit testing or touch mapping
- non-integer scaling could blur pixel art and make sprite conformance look
  worse
- hiding shell chrome could make settings, pause, mute, sign-in, or feedback
  harder to find
- browser fullscreen rules require a user gesture and vary by browser
- screenshots, video capture, and replay evidence may need mode metadata so
  reviewers do not compare different display modes as if they were identical

## Placement In The Roadmap

This belongs in the `1.6.0` cabinet-surface polish family, with a hidden
prototype allowed earlier if it stays behind a developer/shortcut gate and does
not displace higher-priority conformance and safety work.

