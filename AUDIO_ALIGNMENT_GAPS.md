# Audio Alignment Gaps

This note turns the current audio correspondence findings into a quick visual
reference for review and release planning.

Use it when asking:

- what the intended timing is
- what Aurora is currently doing
- which gaps are biggest enough to shape the next `/dev` and `/beta` cycles

## Current Read

As of May 10, 2026 on the current Aurora conformance branch:

- current forward line: local development, preparing a future hosted `/dev`
  candidate
- release-quality roll-up: `9.2/10`
- audio identity and cue alignment: `6.7/10`
- dedicated audio cue correspondence result: `9/9` metrics passed
- latest acoustic event gap: semantic event score `9.78/10`, acoustic event
  score `5.93/10`, highest risk cue `playerHit` body

The biggest current audio gaps are now:

- acoustic fit and event-body matching remain weak even though cue semantics are
  strong
- player loss / game-over needs continued listening review because it is both an
  emotional moment and the latest highest-risk segment family
- stage/inter-level phrases should preserve full reference intent whenever the
  runtime window can fit them

## Stage 1 Opening Pulse

Target from the preserved Galaga-aligned Aurora timing library:

- stage spawn: `0.000`
- first stage pulse: `0.817`

Current Aurora:

- stage spawn: `0.000`
- first stage pulse is now scored from formation-arrival context in the cue
  alignment harness, not just raw stage spawn

```text
Ideal / target
0.000                    0.817
|------------------------|
spawn                first pulse

Current
0.000                         formation arrival        first pulse
|-----------------------------|------------------------|
spawn                     rack established         pressure cue
```

## Challenge Entry

Target from the preserved challenge timing family:

- probe: `0.000`
- `challengeTransition` cue: `2.219`
- challenge spawn: `2.802`

Current Aurora:

- probe: `0.000`
- `challengeTransition` cue: `2.216`
- challenge spawn: `2.800`

```text
Ideal / target
0.000                    2.219      2.802
|------------------------|----------|
probe                cue starts    challenge spawns

Current
0.000                    2.216      2.800
|------------------------|----------|
probe                cue starts    challenge spawns
```

The challenge lead-in is no longer collapsing. It is now almost exactly on the
target spacing, but the full transition clip still extends about `0.466s`
past spawn.

## Inter-Level And Game-Over Continuity

The latest local gameplay capture exposed two player-facing audio problems:

- `stageTransition` was too abbreviated and made the inter-level beat feel cut
  off. Aurora now uses a 2.8s reference-backed window from
  `galaga-level-flag-v1.m4a` so the transition carries more of the intended
  phrase.
- final ship loss reached `gameOver`, but the recorder/export sequence stopped
  before the end cue was logged and captured. Runtime now plays/logs `gameOver`
  before session export, trims the silent lead-in in
  `galaga-last-ship-destroyed-ambience.m4a`, and delays recording stop to keep
  the tail.

The new `harness:check:audio-gameover-tail` guardrail checks these requirements
directly.

## Challenge Result To Next Stage

Target from the preserved challenge timing family:

- challenge clear: `0.000`
- result cue: `0.342`
- next-stage cue: `2.850`

Current Aurora:

- challenge clear: `0.000`
- result cue: `0.333`
- next-stage cue: `2.866`

```text
Ideal / target
0.000 0.342                         2.850
|-----|-----------------------------|
clear result cue                next-stage cue

Current
0.000 0.333                         2.866
|-----|-----------------------------|
clear result cue                next-stage cue
```

## Interpretation

These are not cosmetic differences.

They affect:

- how ceremonial the challenge-stage handoff feels
- whether the player gets the intended beat between challenge clear and the
  next stage
- whether gameplay audio behaves like a reference-aligned cue system or simply
  fires as soon as possible

## Release Implication

The branch now has the challenge-entry and post-challenge timing family in a
healthy state. The remaining gaps are more specific:

1. preserve and listen-check player-loss and game-over cue tails
2. continue improving acoustic event-body fit, especially `playerHit`
3. use an explicit overlap budget for the challenge-transition clip instead of
   forcing a zero-overlap rule

The next strong release bundle should keep improving:

1. player-loss/game-over cue continuity
2. challenge-transition clip-tail handling within an explicit overlap budget
3. broader challenge/audio polish and final scorecard refresh

Then:

- refresh hosted `/dev`
- rerun the quality score
- shape the next hosted `/beta`
