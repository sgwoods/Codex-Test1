# Reference Artifacts

This directory stores durable reference material used to tune the game toward original Galaga behavior and presentation.

## Structure

- `manuals/`: scanned manuals, operator guides, and extracted notes
- `preserved-sources/`: canonical recovered source-media lanes promoted out of
  intake-only status, with manifests and checksums
- `clips/`: curated video clips or timing notes for direct comparison
- `images/`: screenshots or contact sheets used for composition and sprite comparison
- `analyses/release-reference-pack/`: current release-focused comparison pack
  spanning capture branches, stage transitions, Stage 4 composition, and frame
  treatment
- `analyses/challenge-stage-reference/`: reusable challenge-stage video notes
  covering non-firing bonus behavior, moving starfield, reserve-ships drawer,
  and perfect-result presentation
- `analyses/galaxian-mechanics/`: early sibling-pack mechanics archive for
  future Platinum Galaxian-family work
- `ingestion/downloads-old-all-2026-05-17/`: first intake ledger for the copied
  old-machine download drop, including the curated Neo-Galaga accession plan
  and source-manifest lane for Aurora-relevant source families, unrelated
  personal/admin material, and separate archive candidates

## Storage Policy

- Public-safe metadata can stay here:
  README files, manifests, checksums, inventories, source URLs, and summary
  JSON.
- Copied source bytes and derived media bytes should not be committed here now
  that this repo is explicitly being treated as a public lane.
- Store copied PDFs, HTML snapshots, videos, audio, still-image bundles,
  contact sheets, waveform renders, extracted clips, and similar derivative
  media in the companion private artifact store described in
  [PRIVATE_ARTIFACT_STORAGE_POLICY.md](../PRIVATE_ARTIFACT_STORAGE_POLICY.md).
- The current pushed companion private repo is:
  `https://github.com/sgwoods/Codex-Test1-private-artifacts`
- Large recovered source drops should be inventoried and triaged before any
  promotion into canonical repo-owned evidence paths.
- When adding a new artifact, include a short README nearby explaining why it matters.
