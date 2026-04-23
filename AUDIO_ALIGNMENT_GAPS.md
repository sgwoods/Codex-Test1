# Audio Alignment Gaps

This note turns the current audio correspondence findings into a quick visual
reference for review and release planning.

Use it when asking:

- what the intended timing is
- what Aurora is currently doing
- which gaps are biggest enough to shape the next `/dev` and `/beta` cycles

## Current Read

As of April 22, 2026 on `codex/audio-cue-alignment-pass`:

- current forward line: hosted `/dev`
- current shipped stable line: hosted `/beta` and hosted `/production`
- dedicated audio cue correspondence result:
  - `7/9` metrics passed

The biggest current audio-timing gaps are now:

- stage-1 first pulse is still far from the historical reference anchor
- the challenge-entry transition clip still overlaps the spawn moment
- the broad challenge and result timing families are now much closer to target

## Stage 1 Opening Pulse

Target from the preserved Galaga-aligned Aurora timing library:

- stage spawn: `0.000`
- first stage pulse: `0.817`

Current Aurora:

- stage spawn: `0.000`
- first stage pulse: `6.317`

```text
Ideal / target
0.000                    0.817
|------------------------|
spawn                first pulse

Current
0.000                                                        6.317
|------------------------------------------------------------|
spawn                                                   first pulse
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
much healthier state. The remaining gaps are more specific:

1. decide whether the stage-1 pulse should really be measured from stage spawn
   or from a later opening anchor such as formation arrival
2. decide whether the challenge-transition clip should be trimmed, delayed, or
   explicitly allowed to overlap spawn

The next strong release bundle should keep improving:

1. stage-1 opening pulse timing or its measurement anchor
2. challenge-transition clip-tail handling
3. broader challenge/audio polish and final scorecard refresh

Then:

- refresh hosted `/dev`
- rerun the quality score
- shape the next hosted `/beta`
