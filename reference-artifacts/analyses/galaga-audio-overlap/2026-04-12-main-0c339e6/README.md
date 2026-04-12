# Galaga Audio Overlap Budget

This report measures whether reference-audio clip tails fit inside Aurora timing windows.
Positive overruns mean a clip is still active when the next cue or the next state begins.

## Current worst offenders

- Stage 1 game-start tail vs first pulse: overruns by 3.167s
- Stage 1->2 pulse tail vs transition cue: overruns by 10.384s
- Stage 1->2 transition cue tail vs spawn: overruns by 3.042s
- Stage 2->3 challenge cue tail vs spawn: overruns by 2.766s
- Challenge result tail vs next-stage cue: overruns by 1.708s
- Challenge result tail vs spawn: overruns by 0.834s
- Next-stage cue tail vs spawn after challenge: overruns by 3.126s

## Stage 1 opening
- Game start after spawn: 0.719
- First pulse after spawn: 1.552
- First dive after spawn: 8.194
- Attack-charge cue after dive: 0
- Game-start tail past first pulse: 3.167
- Game-start tail past first dive: -3.475

## Stage 1 -> 2 transition probe
- Transition window: 2.848
- Pulse lead before probe: -4.274
- Transition cue after probe: 1.89
- Spawn after transition cue: 0.958
- Pulse tail past transition cue: 10.384
- Pulse tail past spawn: 9.426
- Transition cue tail past spawn: 3.042

## Stage 2 -> 3 challenge probe
- Transition window: 3.35
- Pulse lead before probe: null
- Challenge cue after probe: 2.116
- Spawn after challenge cue: 1.234
- Pulse tail past challenge cue: null
- Pulse tail past challenge spawn: null
- Challenge cue tail past spawn: 2.766

## Challenge perfect -> next stage
- Result cue after clear: 0.342
- Next-stage cue after clear: 2.634
- Spawn after clear: 3.508
- Result tail past next-stage cue: 1.708
- Result tail past spawn: 0.834
- Next-stage cue tail past spawn: 3.126

## Outputs
- Metrics JSON: `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-overlap/2026-04-12-main-0c339e6/metrics.json`
- This README: `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/galaga-audio-overlap/2026-04-12-main-0c339e6/README.md`
- Run root: `/Users/stevenwoods/Documents/Codex-Test1/harness-artifacts/audio-overlap`

