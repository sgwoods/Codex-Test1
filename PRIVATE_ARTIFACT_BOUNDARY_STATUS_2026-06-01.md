# Private Artifact Boundary Status

Date: `2026-06-01`

## Current Decision

The project now treats copied source material and derived media as private
artifact-store content rather than public-repo content.

This means:

- public repo:
  manifests, checksums, readmes, provenance, summaries, dashboard data, and
  plans
- private companion store:
  copied PDFs, HTML snapshots, videos, audio, still-image bundles, contact
  sheets, waveforms, extracted clips, and similar derivative media

The companion private GitHub repository is now:

- `https://github.com/sgwoods/Codex-Test1-private-artifacts`

## Immediate Goal

Stop the current June 1 ingestion wave from becoming a new public-media layer.

## What This Pass Will Do

- add a public policy for artifact privacy
- add an ignored companion private artifact store
- migrate the current June 1 intake bytes into that store
- leave only public-safe metadata in the public repo
- keep the dashboard useful by linking to readmes/manifests instead of copied
  media

## What This Pass Has Now Completed

- initialized a nested companion Git repo at `private-artifacts/`
- created and pushed the private remote
  `sgwoods/Codex-Test1-private-artifacts`
- migrated the June 1 intake bytes into that private repo
- migrated the first older Guardians-focused legacy tranche:
  - `reference-artifacts/analyses/galaxian-frame-reference`
  - `reference-artifacts/analyses/audio-conformance-lab`
- migrated the first large Aurora audio-fitting tranche:
  - `reference-artifacts/analyses/aurora-audio-cue-candidates`
  - `reference-artifacts/analyses/aurora-audio-theme-comparison`

That legacy tranche moved `1421` tracked media files out of the public working
tree and into the private companion repo while leaving metadata and pointers in
place.

The Aurora tranche moved `4917` additional tracked media files out of the
public working tree and into the private companion repo, again leaving
metadata and pointers in place.

## What This Pass Does Not Do

This pass does not rewrite existing public Git history.

If older pushed artifact bytes also need to be removed from the public GitHub
history, that should be treated as a later deliberate remediation task with its
own safety review.

## Next Decision

The next step is no longer "should we have a private lane?" That is resolved.

The next step is to migrate the remaining older public artifact families by
priority, starting with the most source-derived gameplay, audio, and frame
reference lanes that still affect active conformance work.

The current recommended next tranche is:

- `reference-artifacts/analyses/galaga-path-reference-media`
- `reference-artifacts/analyses/galaga-alien-frame-cadence-targets`
- `reference-artifacts/analyses/galaga-challenge-video-reference`
- `reference-artifacts/analyses/galaga-audio-reference-video-3`

That tranche is the best next move because it is still:

- clearly reference-derived under the new policy
- smaller and more focused than the Aurora audio tranche
- directly useful to Aurora challenge-stage and motion-fidelity work
