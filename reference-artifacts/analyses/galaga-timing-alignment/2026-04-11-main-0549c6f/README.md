# Galaga Timing Alignment

This artifact records the first repeatable timing comparison pass between
original Galaga references and Aurora runtime behavior.

## Goal

- compare timing, not just clip choice
- keep timing alignment part of polish work
- create a reusable baseline for stage cadence, challenge entry, and loss timing

## Source references

- Stage 1 gameplay video: `/Users/stevenwoods/Downloads/90 stage 1 player galaga example.mp4`
- Contact sheet: `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-timing-alignment/2026-04-11-main-0549c6f/stage1-first-16s-contact.png`
- Game start clip: `/Users/stevenwoods/Documents/Codex-Test1/src/assets/reference-audio/galaga2-game-start.m4a`
- Convoy cadence clip: `/Users/stevenwoods/Documents/Codex-Test1/src/assets/reference-audio/galaga3-ambience-convoy.m4a`
- Challenge entry clip: `/Users/stevenwoods/Documents/Codex-Test1/src/assets/reference-audio/galaga2-challenging-stage.m4a`
- Challenge results clip: `/Users/stevenwoods/Documents/Codex-Test1/src/assets/reference-audio/galaga2-challenging-stage-results.m4a`
- Challenge perfect clip: `/Users/stevenwoods/Documents/Codex-Test1/src/assets/reference-audio/galaga2-challenging-stage-perfect.m4a`
- Player hit clip: `/Users/stevenwoods/Documents/Codex-Test1/src/assets/reference-audio/galaga3-death.m4a`

## Reference clip durations

- Game start: 4.000s
- Convoy cadence: 8.000s
- Challenge entry: 4.000s
- Challenge results: 4.000s
- Challenge perfect: 4.000s
- Player hit: 2.000s

## Aurora timing snapshot

### Stage 1
- Game start cue after spawn: 0
- First stage pulse after spawn: 0.817
- First attack after spawn: 8.2
- First lower-field crossing after spawn: 9.35

### Challenge entry probe
- Challenge cue after probe: 2.219
- Challenge spawn after probe: 2.802
- Challenge spawn after cue: 0.583
- First challenge pulse after spawn: null

### Challenge perfect transition
- Perfect cue after clear: 0.225
- Next-stage cue after clear: 1.324
- Next-stage spawn after clear: 2.35
- Next-stage spawn after cue: 1.026

### Ship loss
- Player-hit cue relative to ship_lost event: 0

## Initial read

- This is the first event-level timing pass, not the final truth table.
- Challenge entry and active-play cadence now have measurable Aurora timings instead of subjective notes only.
- The next tuning pass should focus on:
  - challenge entry audibility and placement
  - stage/convoy cadence vs first enemy descent
  - ship-loss audio/visual sync
  - boss cue timing after we add a focused boss-hit probe

## Outputs

- Metrics JSON: `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-timing-alignment/2026-04-11-main-0549c6f/metrics.json`
- This README: `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-timing-alignment/2026-04-11-main-0549c6f/README.md`
- Raw run roots: `/Users/stevenwoods/Documents/Codex-Test1/harness-artifacts/timing-alignment`
