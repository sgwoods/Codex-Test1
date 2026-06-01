# Space Invaders ClassicGaming sound pack

Status: `source-manifested-first-pass`

Role: `named_low_level_sound_vocabulary_pack`

## Measured Media

- file count: `9`
- codec family: `pcm_u8`
- sample rate: `11025`
- channels: `1`
- duration range: `0.089s -> 2.341s`

## Generated Artifacts

- source manifest:
  `reference-artifacts/analyses/space-invaders-reference/space-invaders-classicgaming-sounds/source-manifest.json`
- waveform contact sheet:
  `private-artifacts/repo-mirror/reference-artifacts/preserved-sources/space-invaders-classicgaming-sounds-2026-06-01/preview/waveform-contact-sheet.jpg`
- per-cue waveforms:
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/space-invaders-reference/space-invaders-classicgaming-sounds/waveforms/explosion.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/space-invaders-reference/space-invaders-classicgaming-sounds/waveforms/fastinvader1.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/space-invaders-reference/space-invaders-classicgaming-sounds/waveforms/fastinvader2.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/space-invaders-reference/space-invaders-classicgaming-sounds/waveforms/fastinvader3.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/space-invaders-reference/space-invaders-classicgaming-sounds/waveforms/fastinvader4.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/space-invaders-reference/space-invaders-classicgaming-sounds/waveforms/invaderkilled.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/space-invaders-reference/space-invaders-classicgaming-sounds/waveforms/shoot.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/space-invaders-reference/space-invaders-classicgaming-sounds/waveforms/ufo_highpitch.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/space-invaders-reference/space-invaders-classicgaming-sounds/waveforms/ufo_lowpitch.png`

## Current Use

This pack is now the strongest repo-owned source for the classic Space Invaders
low-level sound vocabulary:

- four-step march cadence
- UFO pass bed
- player shot
- invader kill
- explosion

## What It Changes

This source narrows the Windigo sound hunt significantly.

We no longer need a generic request for “more Space Invaders sounds” in these
families. The remaining audio asks should be more specific:

- player-loss / death sound truth
- start / credit / insert-coin truth
- live gameplay windows where these sounds are heard in context with march and
  bunker pressure

## Confidence and Limits

Use it confidently for:

- cue naming
- isolated waveform comparison
- march-step cadence family definition
- deciding which sound families the first Windigo slice must own

Use it carefully for:

- gameplay-context timing
- layering / mix balance
- any claim about when the sounds occur during active play
- bunker-pressure or descent-pressure conformance by themselves

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/space-invaders-reference/space-invaders-classicgaming-sounds/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/space-invaders-reference/space-invaders-classicgaming-sounds`
