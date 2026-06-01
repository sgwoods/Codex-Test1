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
4. The follow-on Aurora challenge/reference wave was migrated into the
   companion private repo:
   - `reference-artifacts/analyses/galaga-path-reference-media`
   - `reference-artifacts/analyses/galaga-alien-frame-cadence-targets`
   - `reference-artifacts/analyses/galaga-challenge-video-reference`
   - `reference-artifacts/analyses/galaga-audio-reference-video-3`
5. The smaller direct-reference residue and visual crop/timing waves were
   migrated into the companion private repo:
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
6. The former app-bundled reference-audio lane was also migrated into the
   companion private repo:
   - `src/assets/reference-audio`
7. The public build was tightened so it no longer republishes private-derived
   bytes through `dist/`, `assets/catalog-media/`, or the old shipped
   `assets/reference-audio/` lane.

That first legacy tranche moved `1421` tracked media files into the private
repo while leaving public-safe metadata and pointer files in the public repo.
The Aurora tranche moved `4917` additional tracked media files there under the
same metadata-plus-pointer rule.
The follow-on Aurora/direct-reference waves moved `1461` additional tracked
media files there under the same metadata-plus-pointer rule.
The app-bundled reference-audio move added `50` more tracked audio files to
the private repo under the same metadata-plus-pointer rule.

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

## Remaining High-attention Public Media Families

After the latest migrations, the main remaining public media lanes fall into
two buckets:

- likely public-safe runtime/conformance evidence:
  - `reference-artifacts/analyses/aurora-level-expansion-cycle`
  - `reference-artifacts/analyses/gameplay-segment-captures`
  - `reference-artifacts/analyses/aurora-runtime-sprite-conformance`
- mixed lanes that probably combine runtime-safe outputs with source-derived
  comparison sheets:
  - `reference-artifacts/analyses/challenge-stage-conformance`
  - `reference-artifacts/analyses/level-visual-conformance-index`
  - `reference-artifacts/analyses/level-visual-timing-alignment`
  - `reference-artifacts/analyses/aurora-impact-explosion-conformance`
  - `reference-artifacts/analyses/galaxy-guardians-identity`
  - `reference-artifacts/analyses/formation-boss-path-slot-extraction`

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

Status: `done in working tree`

- `reference-artifacts/analyses/galaga-path-reference-media`
- `reference-artifacts/analyses/galaga-alien-frame-cadence-targets`
- `reference-artifacts/analyses/galaga-challenge-video-reference`
- `reference-artifacts/analyses/galaga-audio-reference-video-3`

Why:
- still strongly reference-derived
- important to preserve privately
- less urgent than the audio-candidate bulk lanes once the new policy is in
  place

### Tranche 4: Direct-reference residue packs

Status: `done in working tree`

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

Why next:

- still clearly source-derived under the new policy
- smaller residue packs that were easy to finish once the main Aurora tranche
  landed
- removes the need to keep a long tail of older direct-reference bytes public

### Tranche 5: Small visual crop/timing packs

Status: `done in working tree`

- `reference-artifacts/analyses/galaga-alien-target-crops`
- `reference-artifacts/analyses/stage7-reference-path-before-after`
- `reference-artifacts/analyses/galaga-alien-cadence-validation`
- `reference-artifacts/analyses/galaga-alien-visual-crop-previews`
- `reference-artifacts/analyses/galaga-stage-opening-timing`

Why next:

- obvious external-derived crop/timing media
- small enough to batch safely once the direct-reference residue was cleared
- moves the public repo closer to a true metadata-and-runtime boundary

### Tranche 6: App-bundled reference-audio lane

Status: `done in working tree`

- `src/assets/reference-audio`

Why:

- even though it lived under `src/`, it was still a shipped source-derived cue
  pack
- the public build needed to stop republishing it into `dist/`
- moving it private closes the last obvious bundled-source-audio exception

### Tranche 7: Mixed conformance lanes requiring review

Review before migration:

- `reference-artifacts/analyses/challenge-stage-conformance`
- `reference-artifacts/analyses/level-visual-conformance-index`
- `reference-artifacts/analyses/level-visual-timing-alignment`
- `reference-artifacts/analyses/aurora-impact-explosion-conformance`
- `reference-artifacts/analyses/galaxy-guardians-identity`
- `reference-artifacts/analyses/formation-boss-path-slot-extraction`

Why review:
- some files are likely public-safe runtime or abstract analysis
- some files are likely still derivative comparison media
- these should be split into "stay public" vs "move private" at the file level
  instead of moved wholesale

### Tranche 8: Explicit public-safe lanes that can likely remain public

Likely keep public if confirmed media is purely repo-owned and abstract:

- `reference-artifacts/analyses/aurora-level-expansion-cycle`
- `reference-artifacts/analyses/gameplay-segment-captures`
- `reference-artifacts/analyses/aurora-runtime-sprite-conformance`
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

The current recommended next review is `Tranche 7`.

That means:

- review `reference-artifacts/analyses/challenge-stage-conformance`
- review `reference-artifacts/analyses/level-visual-conformance-index`
- review `reference-artifacts/analyses/level-visual-timing-alignment`
- review `reference-artifacts/analyses/aurora-impact-explosion-conformance`
- review `reference-artifacts/analyses/galaxy-guardians-identity`
- review `reference-artifacts/analyses/formation-boss-path-slot-extraction`

The clear external-derived residue is now gone. The remaining question is which
mixed conformance files should stay public as runtime-safe evidence versus move
private as source-derived comparison media.

## Guardians-Driven Outcome

This migration order is intentionally driven by `Galaxy Guardians`.

It protects the most active source-derived Guardians evidence first, proves the
companion-store workflow on real tracked media, and then applies the same
pattern to Aurora and future-game lanes without blocking the gameplay-quality
work now underway.
