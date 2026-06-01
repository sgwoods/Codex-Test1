# Galaxians indexed sound reel

Status: `source-manifested-first-pass`

Role: `indexed_isolated_sound_pack_with_static_title_card`

## Measured Media

- duration: `83.522s`
- dimensions: `614x360`
- frame rate: `10/1`
- audio stream: `present`

## Generated Artifacts

- source manifest: `reference-artifacts/analyses/galaxian-reference/galaxians-sounds-indexed/source-manifest.json`
- contact sheet: `private-artifacts/repo-mirror/reference-artifacts/analyses/galaxian-reference/galaxians-sounds-indexed/frames/contact-sheet-reference-window.jpg`
- sample-time sheet: `private-artifacts/repo-mirror/reference-artifacts/analyses/galaxian-reference/galaxians-sounds-indexed/frames/sample-times-contact-sheet.jpg`
- waveform: `private-artifacts/repo-mirror/reference-artifacts/analyses/galaxian-reference/galaxians-sounds-indexed/audio/waveform-reference-window.png`

## Current Use

This source appears to be a static-card Galaxians sound reel: the visuals stay
on a title card while the audio changes across the run.

Its strongest immediate uses are:

- isolated cue-family comparison for Guardians audio work
- acoustic proxy review for Galaxian-family cue character
- candidate source for later manual timestamp cue mapping

The waveform suggests several short isolated cue blocks followed by a longer
sustained region, which may represent a gameplay-sample style segment.

## Important Limit

This source is not yet self-describing enough to act as first-class conformance
truth on its own, because the first-pass visual review did not expose readable
on-screen cue labels the way the Galaga indexed packs do.

So the next promotion step is not “find another generic audio source.” It is:

- create a timestamped cue map for this reel
- name the isolated cue families explicitly
- note whether the longer sustained region is a gameplay mix sample or a longer
  single effect family

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/galaxian-reference/galaxians-sounds-indexed/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/galaxian-reference/galaxians-sounds-indexed`
