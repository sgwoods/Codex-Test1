# Galaga KHInsider MP3 cue pack

Status: `source-manifested-first-pass`

Role: `named_ceremony_capture_result_cue_pack`

## Measured Media

- file count: `13`
- codec family: `MP3`
- sample rate: `44100`
- channels: `2`
- duration range: `2.142s -> 60.082s`

## Generated Artifacts

- source manifest:
  `reference-artifacts/analyses/galaga-audio-reference-khinsider-cues/source-manifest.json`
- waveform contact sheet:
  `private-artifacts/repo-mirror/reference-artifacts/preserved-sources/galaga-khinsider-mp3-cues-2026-06-01/preview/waveform-contact-sheet.jpg`
- per-cue waveforms:
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/galaga-audio-reference-khinsider-cues/waveforms/01-stage-intro.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/galaga-audio-reference-khinsider-cues/waveforms/02-fighter-captured.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/galaga-audio-reference-khinsider-cues/waveforms/03-fighter-rescued.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/galaga-audio-reference-khinsider-cues/waveforms/04-captured-fighter-destroyed.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/galaga-audio-reference-khinsider-cues/waveforms/05-challenging-stage.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/galaga-audio-reference-khinsider-cues/waveforms/06-challenging-stage-over.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/galaga-audio-reference-khinsider-cues/waveforms/07-challenging-stage-perfect.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/galaga-audio-reference-khinsider-cues/waveforms/08-1-up.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/galaga-audio-reference-khinsider-cues/waveforms/09-die-start-up-sound.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/galaga-audio-reference-khinsider-cues/waveforms/10-coin.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/galaga-audio-reference-khinsider-cues/waveforms/11-name-entry.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/galaga-audio-reference-khinsider-cues/waveforms/12-2nd-5th-name-entry.png`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/galaga-audio-reference-khinsider-cues/waveforms/13-sound-effects.png`

## Current Use

This pack is now the strongest repo-owned named Galaga cue source for:

- challenge-stage entry / over / perfect-score phrase review
- fighter captured / rescued / captured-fighter-destroyed cue fitting
- stage intro, coin, extra-life, death/start-up, and name-entry ceremony review

Its biggest value for Aurora is preserving full canonical phrases where the
runtime should widen to fit the original instead of truncating to a shorter
proxy by default.

## Confidence and Limits

Use it confidently for:

- cue naming
- isolated phrase comparison
- canonical full-length challenge-result / perfect-score phrase review
- capture/rescue family fitting
- score-entry / ceremony family fitting

Use it carefully for:

- exact in-game timing
- live gameplay mix balance
- claims about overlap or sequencing between multiple cues during active play
- challenge-stage visual novelty or motion conformance

## Relationship To Other Galaga Audio Sources

This pack improves on the earlier compact indexed Galaga sound video by giving
explicit named files for longer ceremony and capture/result phrases, not just a
short title-card overview.

It does not replace:

- `reference-artifacts/analyses/galaga-audio-reference-video-4/README.md`
  for compact corroborating micro-cues
- the earlier gameplay-context reference videos
- direct measured gameplay windows where overlap, mix, or exact entry timing
  matter

It strengthens the Aurora audio lane, but it does not change Aurora's highest-
priority artifact gaps, which remain challenge-stage spectacle / motion and
explosion-lifecycle truth.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/galaga-audio-reference-khinsider-cues/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/galaga-audio-reference-khinsider-cues/`
