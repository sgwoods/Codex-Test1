# Private Artifact Storage Policy

Date: `2026-06-01`

## Purpose

`sgwoods/Codex-Test1` is a public repository.

That means copied source material and derived reference bytes should not be
committed here when they would expose preserved media that we only need for
local conformance work.

This policy creates a clear split:

- the public repo keeps durable metadata and decision surfaces
- the companion private artifact store keeps copied and derived bytes
- large in-use review media may also live in an iCloud-protected artifact
  library when that is the safer practical choice than overloading GitHub with
  heavyweight transient video

## Public Repo: What Stays Here

The public repo may keep:

- repo-owned planning and status notes
- README files that explain why an artifact matters
- source manifests and provenance notes
- checksums and inventories
- source URLs and bibliographic references
- analysis summaries in text or JSON form
- dashboard data that points to public-safe metadata

These files are public-safe because they describe the evidence without
republishing the evidence bytes themselves.

## Private Store: What Moves Out Of The Public Repo

The companion private artifact store should hold:

- copied PDFs and HTML snapshots
- copied gameplay videos
- copied audio files
- copied sprite sheets or still-image bundles
- extracted clips
- contact sheets
- waveform renders
- preview images
- any other split or derived media bytes made from preserved source material

In short:

- if it is a copied source byte, keep it private
- if it is a derived media byte, keep it private
- if it is a manifest, checksum, README, or summary, it may stay public

Important transient/generated tuning artifacts should be treated the same way:

- if a generated run payload, review capture, contact sheet, comparison bundle,
  or session log becomes part of an ongoing tuning loop, promote it to the
  companion private store instead of leaving it only in `/tmp`, ignored working
  folders, or local chat context
- do this in the same session when practical, or immediately after validating
  that the artifact is worth keeping
- keep only the public-safe summary, manifest, and pointer surface in the
  public repo

For large active review video, use a tiered retention rule:

- if the artifact is modest in size and clearly canonical, the companion
  private Git repo is still the preferred durable store
- if the artifact is large, video-heavy, actively in use across MacBooks, and
  likely to churn during tuning, it may live in an iCloud-protected artifact
  library instead of GitHub
- in that case, keep a public-safe pointer, summary, run id, and checksum trail
  in the repo so the artifact remains discoverable and auditable
- do not rely on chat history or only one local machine for any artifact that
  future Guardians work is likely to reuse

## Repository Layout

The public repo ignores the local companion store at:

- `private-artifacts/`

The companion private GitHub repository is now:

- `https://github.com/sgwoods/Codex-Test1-private-artifacts`

That companion store mirrors the public artifact paths under:

- `private-artifacts/repo-mirror/`

For very large active review media, a separate iCloud-protected library is also
an approved destination. The intended use is:

- cross-machine availability for MacBook-based review work
- protection against losing expensive-to-recreate video captures
- avoiding unnecessary GitHub weight for transient but still important review
  media

The default shared root for this library should be:

- `~/Library/Mobile Documents/com~apple~CloudDocs/Projects/Codex-Test1 Artifact Library/`

Recommended top-level buckets in that iCloud library:

- `00-temporary-throwaway/`
- `01-transient-in-use/`
- `02-documentation/`
- `03-production/`

The important distinction is behavioral, not just naming:

- `temporary-throwaway`: safe to delete after the immediate task
- `transient-in-use`: still actively supporting tuning or review and should not
  be discarded casually
- `documentation`: evidence retained mainly to explain decisions or preserve
  history
- `production`: outputs tied to release, shipping, or public-facing deliverables

Example:

- public metadata:
  `reference-artifacts/preserved-sources/galaxian-khinsider-flac-cues-2026-06-01/source-manifest.json`
- private bytes:
  `private-artifacts/repo-mirror/reference-artifacts/preserved-sources/galaxian-khinsider-flac-cues-2026-06-01/audio/01-credit-sound.flac`

Each migrated public artifact directory should also keep a public-safe pointer
file:

- `private-storage.json`

That file records what moved and where the companion store expects it.

## Dashboard Rule

The ingestion dashboard should only expose public-safe metadata from the public
repo:

- readmes
- manifests
- checksums
- summary JSON

It should not expose private copied or derived media from the public lane.

## Public Build Rule

The public build must also respect this boundary.

That means:

- do not copy private-source or private-derived artifact bytes into `dist/`
- do not republish source-derived media through `assets/catalog-media/`
- do not ship reference-only cue packs from `src/assets/reference-audio/`
- prefer public-safe placeholders, readmes, manifests, and pointer files
- default public runtime audio/theme controls to repo-owned application mixes
  rather than private reference-audio packs

## Historical Caveat

This policy stops new public exposure and lets us migrate current local intake
work immediately.

It does **not** automatically remove artifacts that were already pushed into the
public Git history before this policy existed. Removing those bytes from public
history is a separate explicit cleanup task that would require history rewrite
and force-push coordination.

## Current Migration Posture

As of `2026-06-01`, four things are already true:

1. the June 1 ingestion wave has been moved into the companion private store
2. the first legacy Guardians-focused tranche has also been moved there
3. the first large Aurora audio-fitting tranche has also been moved there
4. the follow-on Aurora and cross-game direct-reference waves have also been
   moved there
5. the old app-bundled reference-audio lane at `src/assets/reference-audio/`
   has also been moved there
6. the public build now blocks private artifact bytes from being recopied into
   `dist/` through `assets/catalog-media/` or shipped reference-audio bundles

That first legacy tranche includes:

- `reference-artifacts/analyses/galaxian-frame-reference`
- `reference-artifacts/analyses/audio-conformance-lab`

That first Aurora tranche includes:

- `reference-artifacts/analyses/aurora-audio-cue-candidates`
- `reference-artifacts/analyses/aurora-audio-theme-comparison`

The follow-on Aurora challenge/reference wave includes:

- `reference-artifacts/analyses/galaga-path-reference-media`
- `reference-artifacts/analyses/galaga-alien-frame-cadence-targets`
- `reference-artifacts/analyses/galaga-challenge-video-reference`
- `reference-artifacts/analyses/galaga-audio-reference-video-3`

The direct-reference residue and visual crop/timing waves include:

- `reference-artifacts/analyses/galaga-audio-reference-video`
- `reference-artifacts/analyses/galaga-audio-reference-video-2`
- `reference-artifacts/analyses/galaga-reference-sprites`
- `reference-artifacts/analyses/galaxian-reference`
- `reference-artifacts/analyses/space-invaders-reference`
- `reference-artifacts/analyses/challenge-stage-reference`
- `reference-artifacts/analyses/first-challenge-stage`
- `reference-artifacts/analyses/galaga-stage-reference-video`
- `reference-artifacts/analyses/galaga-alien-motion-reference`
- `reference-artifacts/analyses/galaga-timing-alignment`
- `reference-artifacts/analyses/galaga-alien-target-crops`
- `reference-artifacts/analyses/stage7-reference-path-before-after`
- `reference-artifacts/analyses/galaga-alien-cadence-validation`
- `reference-artifacts/analyses/galaga-alien-visual-crop-previews`
- `reference-artifacts/analyses/galaga-stage-opening-timing`

The next migration decisions should now be made deliberately by family, using
the companion repo as the destination rather than letting older public artifact
lanes accumulate further.

## Operating Rule Going Forward

When ingesting new external source material:

1. keep manifests, checksums, summaries, and source URLs in the public repo
2. place copied or derived media bytes in the companion private store
3. let public dashboard/report surfaces point to the public-safe metadata, not
   to the private bytes

When generating new local review artifacts during tuning:

1. decide whether the output is canonical, comparative, or otherwise expensive
   enough to recreate that future work would depend on it
2. if yes, store the generated bytes in either the companion private Git repo
   or the iCloud-protected artifact library, depending on size and churn
3. prefer the private Git repo for smaller canonical bundles; prefer the
   iCloud library for large in-use video artifacts that would otherwise bloat
   GitHub
4. add or update a nearby `private-storage.json` pointer in the public repo
5. keep the public lane limited to summaries, latest aliases, and decision
   surfaces rather than the private review bytes themselves

When cleaning up local artifact residue:

1. do not treat `temporary` and `throw-away` as synonyms
2. move large active review residue out of the workspace into the correct
   iCloud bucket before deleting anything
3. preserve documentation and production artifacts under their own buckets even
   when they are no longer active tuning inputs
4. only delete artifacts once they are clearly redundant, superseded, or truly
   disposable
