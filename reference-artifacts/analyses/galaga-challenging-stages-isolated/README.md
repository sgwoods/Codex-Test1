# Galaga challenging-stages isolated motion source

Status: `source-manifested-first-pass`

Role: `stage_isolated_challenge_motion_source`

## Measured Media

- duration: `249.429s`
- video: `h264`, `640x360`, `30000/1001`
- audio present: `yes`

## Generated Artifacts

- source manifest:
  `reference-artifacts/analyses/galaga-challenging-stages-isolated/source-manifest.json`
- contact sheets:
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/galaga-challenging-stages-isolated/frames/contact-sheet-reference-window-0-125.jpg`
  - `private-artifacts/repo-mirror/reference-artifacts/analyses/galaga-challenging-stages-isolated/frames/contact-sheet-reference-window-125-250.jpg`

## Current Use

This source is now the best repo-owned raw Galaga challenge-stage motion source
for Aurora when the goal is to inspect how each stage reads without active
normal-stage play cluttering the frame.

Its strongest current uses are:

- cutting named challenge-family subclips
- promoting frame-accurate novelty and route-motion windows
- reviewing late challenge visual-family novelty
- checking formation readability before player-shot timing is layered in

## Confidence and Limits

Use it confidently for:

- stage-by-stage motion review
- visible route-family comparison
- challenge-family novelty review
- contact-sheet driven extraction planning

Use it carefully for:

- exact player-shot timing under active play
- result-banner cadence compared against full perfect-play loops
- final challenge scoring policy claims by itself

## Relationship To Other Challenge Sources

This source complements, rather than replaces, the existing challenge-video
reference lane.

- It is stronger than the earlier lower-resolution compilation as a raw
  stage-isolated motion source because it is `640x360` and visually cleaner.
- It complements the all-perfect single-ship challenge source, which is still
  stronger for repeated result/perfect-surface review and stage-by-stage
  contract labeling already captured in `GALAGA_CHALLENGE_VIDEO_REFERENCE_ANALYSIS.md`.

The practical effect is that Aurora no longer needs to say "we have challenge
videos somewhere." We now have a repo-owned raw source that is specifically
good for motion-window extraction.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/galaga-challenging-stages-isolated/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/galaga-challenging-stages-isolated/`
