# Galaxian KHInsider FLAC cue pack

Status: `source-manifested-first-pass`

Role: `named_isolated_core_cue_pack`

## Measured Media

- file count: `8`
- codec family: `FLAC`
- sample rate: `44100`
- channels: `2`
- duration range: `0.650s -> 6.780s`

## Generated Artifacts

- source manifest:
  `reference-artifacts/analyses/galaxian-reference/galaxian-khinsider-flac-cues/source-manifest.json`
- waveform contact sheet:
  `private-artifacts/repo-mirror/reference-artifacts/preserved-sources/galaxian-khinsider-flac-cues-2026-06-01/preview/waveform-contact-sheet.jpg`
- per-cue waveforms:
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/galaxian-reference/galaxian-khinsider-flac-cues/waveforms/01-credit-sound.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/galaxian-reference/galaxian-khinsider-flac-cues/waveforms/02-start-game.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/galaxian-reference/galaxian-khinsider-flac-cues/waveforms/03-shoot.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/galaxian-reference/galaxian-khinsider-flac-cues/waveforms/04-fighter-loss.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/galaxian-reference/galaxian-khinsider-flac-cues/waveforms/05-extra-life.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/galaxian-reference/galaxian-khinsider-flac-cues/waveforms/06-flying-sound.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/galaxian-reference/galaxian-khinsider-flac-cues/waveforms/07-hit-enemy.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/galaxian-reference/galaxian-khinsider-flac-cues/waveforms/08-hit-boss.png`

## Current Use

This pack is now the best repo-owned source for explicit isolated Galaxian core
cue names.

Its strongest immediate uses are:

- exact cue-family naming for `Credit`, `Start`, `Shoot`, `Loss`, `Extra Life`,
  `Flying`, `Hit Enemy`, and `Hit Boss`
- isolated waveform comparison while fitting Guardians cue families
- narrowing the residual role of the older static-card Galaxians reel

## Important Limit

This pack is stronger than the older static-card reel for named core cues, but
it is still not gameplay-context truth on its own.

Use it confidently for:

- cue naming
- isolated cue-family comparison
- checking whether Guardians is missing or over-distorting a specific short
  sound family

Use it carefully for:

- live-mix balance
- cue overlap
- exact in-game timing
- recurring pressure / ambience fitting
- any claim that a cue only occurs in one gameplay context

## Relationship To Other Galaxian Audio Sources

This pack partially supersedes:

- `reference-artifacts/analyses/galaxian-reference/galaxians-sounds-indexed/README.md`

Specifically, it is now the preferred source for the eight named isolated core
cues in this pack.

It does not replace:

- `reference-artifacts/analyses/galaxian-reference/galaxians-arcade-no-voiceover/README.md`
  for exact early-session timing
- `reference-artifacts/analyses/galaxian-reference/galaxian-ambience-background/README.md`
  for sustained recurring-pressure fitting
- `reference-artifacts/analyses/galaxian-reference/galaxian-15wave-full-start-end/README.md`
  for stage-five-and-beyond gameplay context

The older static-card reel still matters only where it contains missing or
ambiguous non-FLAC families that this pack does not cover.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/galaxian-reference/galaxian-khinsider-flac-cues/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/galaxian-reference/galaxian-khinsider-flac-cues`
