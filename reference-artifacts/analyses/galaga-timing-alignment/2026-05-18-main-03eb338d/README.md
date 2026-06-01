# Galaga Timing Alignment

This artifact records the first repeatable timing comparison pass between
original Galaga references and Aurora runtime behavior.

## Goal

- compare timing, not just clip choice
- keep timing alignment part of polish work
- create a reusable baseline for stage cadence, challenge entry, and loss timing

## Source references

- Stage 1 gameplay video: `reference-artifacts/preserved-sources/galaga-classic-recovery-2026-05-17/video/galaga-stage-reference-video-proxy.mp4`
- Contact sheet: `private-artifacts/repo-mirror/reference-artifacts/analyses/galaga-timing-alignment/2026-05-18-main-03eb338d/stage1-first-16s-contact.png`
- Game start clip: `src/assets/reference-audio/galaga2-game-start.m4a`
- Convoy cadence clip: `src/assets/reference-audio/galaga3-ambience-convoy.m4a`
- Challenge entry clip: `src/assets/reference-audio/galaga2-challenging-stage.m4a`
- Challenge results clip: `src/assets/reference-audio/galaga2-challenging-stage-results.m4a`
- Challenge perfect clip: `src/assets/reference-audio/galaga2-challenging-stage-perfect.m4a`
- Player hit clip: `src/assets/reference-audio/galaga3-death.m4a`

## Reference clip durations

- Game start: 4.000s
- Convoy cadence: 8.000s
- Challenge entry: 4.000s
- Challenge results: 4.000s
- Challenge perfect: 4.000s
- Player hit: 2.000s

## Aurora timing snapshot

### Stage 1
- Game start cue after spawn: 0.002
- First stage pulse after spawn: 6.301
- First attack after spawn: 8.201
- First lower-field crossing after spawn: 9.35

### Challenge entry probe
- Challenge cue after probe: 2.219
- Challenge spawn after probe: 3.336
- Challenge spawn after cue: 1.117
- First challenge pulse after spawn: null

### Challenge perfect transition
- Perfect cue after clear: 0.35
- Next-stage cue after clear: 2.883
- Next-stage spawn after clear: 4.433
- Next-stage spawn after cue: 1.55

### Ship loss
- Player-hit cue relative to ship_lost event: 0.001

## Initial read

- This is the first event-level timing pass, not the final truth table.
- Challenge entry and active-play cadence now have measurable Aurora timings instead of subjective notes only.
- The next tuning pass should focus on:
  - challenge entry audibility and placement
  - stage/convoy cadence vs first enemy descent
  - ship-loss audio/visual sync
  - boss cue timing after we add a focused boss-hit probe

## Outputs

- Metrics JSON: `reference-artifacts/analyses/galaga-timing-alignment/2026-05-18-main-03eb338d/metrics.json`
- This README: `reference-artifacts/analyses/galaga-timing-alignment/2026-05-18-main-03eb338d/README.md`
- Raw run roots: `harness-artifacts/timing-alignment`

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/galaga-timing-alignment/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/galaga-timing-alignment`
