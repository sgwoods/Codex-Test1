# Private Artifact Legacy Migration Plan

Date: `2026-06-01`

## Current State

- public repo: `https://github.com/sgwoods/Codex-Test1`
- private companion repo: `https://github.com/sgwoods/Codex-Test1-private-artifacts`

The private companion repo is now real, pushed, and suitable as the canonical
destination for copied source bytes and derived media that should not remain in
the public repository.

The policy question is now resolved. The remaining work is a migration-order
question.

## Already Completed

1. The full June 1 ingestion wave was migrated into the companion private repo.
2. The first legacy Guardians-focused tranche was migrated into the companion
   private repo:
   - `reference-artifacts/analyses/galaxian-frame-reference`
   - `reference-artifacts/analyses/audio-conformance-lab`
3. The first large Aurora audio-fitting tranche was migrated into the companion
   private repo:
   - `reference-artifacts/analyses/aurora-audio-cue-candidates`
   - `reference-artifacts/analyses/aurora-audio-theme-comparison`

That first legacy tranche moved `1421` tracked media files into the private
repo while leaving public-safe metadata and pointer files in the public repo.
The Aurora tranche moved `4917` additional tracked media files there under the
same metadata-plus-pointer rule.

## Decision Rule

Migrate a lane to the private repo when it contains:

- copied source files
- derived media made from copied source material
- extracted clips or frame sequences
- waveform or spectrogram renders
- contact sheets
- still bundles or sprite bundles copied from external sources

Keep a lane public when it contains only:

- README files
- manifests
- checksums
- source URLs
- summary JSON
- repo-owned plans and reports
- abstract charts/tables that do not republish source media

Review a lane before moving it when it mixes both kinds of content.

## Largest Remaining Legacy Public Media Families

Approximate currently tracked public media counts from the public repo scan:

- `3356` `reference-artifacts/analyses/aurora-audio-cue-candidates`
- `1561` `reference-artifacts/analyses/aurora-audio-theme-comparison`
- `1389` `reference-artifacts/analyses/galaxian-frame-reference`
  Status: tranche 1 already migrated in the working tree
- `1124` `reference-artifacts/analyses/galaga-path-reference-media`
- `651` `reference-artifacts/analyses/conformance-economics`
- `472` `reference-artifacts/analyses/challenge-stage-conformance`
- `296` `reference-artifacts/analyses/aurora-level-expansion-cycle`
- `162` `reference-artifacts/analyses/level-visual-conformance-index`
- `144` `reference-artifacts/analyses/galaga-alien-frame-cadence-targets`
- `128` `reference-artifacts/analyses/formation-boss-path-slot-extraction`
- `89` `reference-artifacts/analyses/gameplay-segment-captures`
- `32` `reference-artifacts/analyses/audio-conformance-lab`
  Status: tranche 1 already migrated in the working tree

## Recommended Migration Order

### Tranche 1: Guardians source-derived media

Status: `done in working tree`

- `reference-artifacts/analyses/galaxian-frame-reference`
- `reference-artifacts/analyses/audio-conformance-lab`

Why first:
- directly tied to active Guardians gameplay/audio/fairness work
- clearly source-derived
- high value to protect immediately

### Tranche 2: Aurora source-derived audio fitting lanes

Status: `done in working tree`

- `reference-artifacts/analyses/aurora-audio-cue-candidates`
- `reference-artifacts/analyses/aurora-audio-theme-comparison`

Why next:
- very large public media footprint
- dominated by source-derived audio/media candidate outputs
- low ambiguity under the new policy

### Tranche 3: Aurora challenge/reference motion lanes

Recommended next:

- `reference-artifacts/analyses/galaga-path-reference-media`
- `reference-artifacts/analyses/galaga-alien-frame-cadence-targets`
- `reference-artifacts/analyses/galaga-challenge-video-reference`
- `reference-artifacts/analyses/galaga-audio-reference-video-3`

Why:
- still strongly reference-derived
- important to preserve privately
- less urgent than the audio-candidate bulk lanes once the new policy is in
  place

### Tranche 4: Mixed conformance lanes requiring review

Review before migration:

- `reference-artifacts/analyses/challenge-stage-conformance`
- `reference-artifacts/analyses/aurora-level-expansion-cycle`
- `reference-artifacts/analyses/level-visual-conformance-index`
- `reference-artifacts/analyses/formation-boss-path-slot-extraction`
- `reference-artifacts/analyses/gameplay-segment-captures`

Why review:
- some content may be repo-owned abstract analysis
- some content may still be derivative media
- these should be split into "stay public" vs "move private" at the file level
  if needed

### Tranche 5: Explicit public-safe lanes that can likely remain public

Likely keep public if confirmed media is purely repo-owned and abstract:

- `reference-artifacts/analyses/conformance-economics`
- JSON-only score ledgers and similar summary/report lanes

Why:
- these are closer to public reporting than copied source preservation

## How To Migrate

Use the companion-store migration tool with explicit directories:

```bash
node tools/dev/migrate-public-artifacts-to-private-store.js <dir> [<dir> ...]
```

Examples:

```bash
node tools/dev/migrate-public-artifacts-to-private-store.js \
  reference-artifacts/analyses/aurora-audio-cue-candidates \
  reference-artifacts/analyses/aurora-audio-theme-comparison
```

```bash
node tools/dev/migrate-public-artifacts-to-private-store.js \
  reference-artifacts/analyses/galaga-path-reference-media
```

After each tranche:

1. verify public directories contain metadata/pointers only
2. rebuild the dashboard
3. commit and push the private companion repo
4. review the public repo diff before deciding whether to commit the policy-side
   changes

## Decision Now

The current recommended next migration is `Tranche 3`.

That means:

- migrate `reference-artifacts/analyses/galaga-path-reference-media`
- migrate `reference-artifacts/analyses/galaga-alien-frame-cadence-targets`
- migrate `reference-artifacts/analyses/galaga-challenge-video-reference`
- migrate `reference-artifacts/analyses/galaga-audio-reference-video-3`

Hold the mixed conformance lanes until after that tranche lands, because the
Aurora challenge/reference lanes are still clearly source-derived while the
mixed conformance families need file-level review.

## Guardians-Driven Outcome

This migration order is intentionally driven by `Galaxy Guardians`.

It protects the most active source-derived Guardians evidence first, proves the
companion-store workflow on real tracked media, and then applies the same
pattern to Aurora and future-game lanes without blocking the gameplay-quality
work now underway.
