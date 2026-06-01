# Galaga challenging-stages isolated motion source

Status: `public-metadata-private-content`

## Preserved Artifact

- source file:
  `/Users/steven/Downloads/Challenging Stages.mp4`
- committed repo artifact:
  `private-artifacts/repo-mirror/reference-artifacts/preserved-sources/galaga-challenging-stages-isolated-2026-06-01/video/challenging-stages.mp4`
- checksum ledger:
  `reference-artifacts/preserved-sources/galaga-challenging-stages-isolated-2026-06-01/checksums.sha256`

## Measured Media

- duration: `249.429s`
- size: `12838011 bytes`
- video: `h264`, `640x360`, `30000/1001`
- audio: `aac`, `44100 Hz`, `2 channels`
- sha256:
  `2c2b679c93adb0465f0a63704e3d3676d6276e551cbf93ddaec07cb91eaf3c3a`

## Current Role

This source is currently the strongest repo-owned raw Galaga challenge-stage
motion source for Aurora because it shows the challenging stages one at a time
with full formations and route motion visible, without normal-stage gameplay
pressure obscuring the patterns.

It is especially useful for:

- named challenge-family subclip extraction
- stage-by-stage motion-window promotion
- late challenge visual novelty review
- formation readability review before player-shot timing is considered

## What It Changes

This upload closes an important repo-local gap in the Aurora challenge lane:
the challenge video analysis already had a derived "challenging-stage
compilation" source, but the raw compilation itself was still living outside
the repository.

Now the repo owns a preserved raw source that can be reopened directly when we
need to cut:

- challenge-family set-piece subclips
- flap and novelty motion windows
- later challenge motion comparisons that are easier to read without live-play
  clutter

## What It Does Not Replace

This source does not replace:

- the all-perfect challenge source used for repeated result/perfect-surface
  review
- full in-context gameplay when exact player-shot timing or result pacing under
  active play matters
- boss-hit and explosion lifecycle references

Its main value is isolated challenge-stage motion truth, not a reset of
Aurora's other remaining artifact gaps.

## Downstream Analysis

- `reference-artifacts/analyses/galaga-challenging-stages-isolated/README.md`
- `reference-artifacts/analyses/galaga-challenging-stages-isolated/source-manifest.json`
- `GALAGA_CHALLENGE_VIDEO_REFERENCE_ANALYSIS.md`

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/preserved-sources/galaga-challenging-stages-isolated-2026-06-01/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/preserved-sources/galaga-challenging-stages-isolated-2026-06-01`
