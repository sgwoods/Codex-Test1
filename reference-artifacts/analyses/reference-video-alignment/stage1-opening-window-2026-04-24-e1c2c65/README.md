# Stage 1 Opening Reference Alignment Window

This artifact is the first durable bridge between preserved gameplay footage and Aurora-style runtime analysis.

It turns the preserved stage-opening reference into three reusable pieces:

1. a reference event log
2. a first-pass movement trace target set
3. a labeled visual artifact catalog

It is intentionally conservative. The timings are derived from the existing Galaga timing library and stage-opening analysis, while the movement traces are first-pass targets for the next movement refinement cycle.

## Source Anchors

- stage reference video:
  - `/Users/steven/Documents/Codex-Test1/reference-artifacts/analyses/galaga-stage-reference-video/README.md`
- timing library:
  - `/Users/steven/Documents/Codex-Test1/reference-artifacts/analyses/galaga-reference-timing-library/event-families.json`
- stage-opening timing pack:
  - `/Users/steven/Documents/Codex-Test1/reference-artifacts/analyses/galaga-stage-opening-timing/2026-04-12-main-a777fba/README.md`

## What This Window Covers

Primary focus:

- game-start phrase
- formation arrival
- first visible alien arrival
- first convoy pulse
- first dive commitment
- early movement-response window for tap / hold / reversal / move-fire analysis

## Movement Read

This first-pass window is not yet a full automatic trace extraction from raw video frames.

It does establish a committed target family for the next movement cycle:

- tap correction should read as a moderate lane correction, not a tiny nudge and not a full sweep
- sustained hold should cover meaningful lane travel without looking like a teleporting digital step
- reversal should visibly cross center quickly enough for evasive play, but still feel joystick-like
- firing while moving should not visibly stall the ship

These targets are now committed in:

- `movement-traces.json`

and should be treated as the current first-pass reference until we automate deeper frame-level extraction.

## Visual Artifact Set

The first-pass visual catalog ties the opening-window reference back to reusable frame anchors:

- early score/title-state board
- sparse live gameplay board
- fuller active board state
- later score/results framing

These are not yet isolated sprite crops, but they give us a durable starting catalog for:

- player ship movement state comparison
- core alien identity extraction
- board density and readability checks

## Use

For the next movement pass:

1. use `event-log.json` as the opening-window event anchor
2. use `movement-traces.json` as the current trace-backed target set
3. use `visual-artifacts.json` when labeling extracted ship/enemy/board comparison artifacts
