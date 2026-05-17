# Downloads-Old-All Intake Ledger

Reviewed: `2026-05-17`

Source root:

- `/Volumes/LaCie1/2026 MacBook Files from iCloud /Downloads-old-all`

## Purpose

This directory records the first repo-owned intake pass over the copied
old-machine `Downloads-old-all` drop.

The goal is to separate:

- Aurora / Platinum material that should be accessioned into the project's
  provenance and evidence program
- adjacent historical archives that deserve their own recovery lane
- clearly unrelated personal, finance, travel, or admin material that should
  stay out of this repo

This is an intake ledger, not a promotion step. The reviewed source files stay
in place on the external volume until they are intentionally accessioned,
deduplicated, and promoted.

## Working Rule

- Do not copy the full download drop into live repo paths.
- Prefer source manifests, ledgers, and curated promotions over bulk import.
- Keep unrelated historical archives separate from Aurora evidence.
- Treat recovered source paths as provenance until a canonical repo location is
  chosen.

## Triage Summary

| Family | Current read | Why it matters | Suggested next step |
| --- | --- | --- | --- |
| Historical Neo-Galaga run exports | High value, not yet accessioned | Adds an earlier March-April run lineage that is not already in the repo | Build a curated intake manifest and dedupe/pairing plan before any promotion |
| Galaga / Galaxian reference media already cited by repo docs | High value, immediately useful | Several committed docs still point at old download-path sources that now exist in this drop | Preserve these sources in a durable canonical reference location and update stale path references |
| `Galaga-master.zip` | Low-to-medium value | Useful as a comparison archive, but not primary fidelity evidence | Keep as optional comparison material only |
| `Abtweak/` and `Abtweak.zip` | Separate archive candidate | Looks like a real historical software archive, but unrelated to Aurora | Give it its own accession-first lane later |
| Personal / finance / travel / misc downloads | Out of scope for this repo | Not Aurora evidence | Leave out of repo intake |

## High-Value Aurora Material

### 1. Historical Neo-Galaga Run Export Archive

The strongest project-relevant discovery in the old-machine drop is a large
historical export set:

| Metric | Value |
| --- | --- |
| Session JSON files | `184` |
| Unique session filenames after duplicate-name cleanup | `180` |
| Unique session ids | `167` |
| Duplicate filename pairs | `4` |
| Session JSON total size | `45,152,328` bytes |
| Video files | `1364` |
| Video total size | `9,930,453,641` bytes |
| Session ids with at least one matching video | `147` |
| Session ids without a matching video | `20` |
| Video ids without a matching session JSON | `1217` |
| Earliest session timestamp | `2026-03-15T15:27:10.496Z` |
| Latest session timestamp | `2026-04-12T14:19:59.808Z` |

Why this matters:

- the archive spans an earlier part of the project's public/runtime history
- the session ids do **not** overlap with the Neo-Galaga session ids currently
  present in this repo
- the build strings cover a meaningful stretch of project evolution from
  `0.5.0-alpha` through `1.2.3`, including a concentrated `1.0.0-modem` slice

Representative build clusters observed:

- `1.0.0-modem` (`26` sessions)
- `1.0.2+build.334.sha.a2dcfee.dirty` (`7`)
- `0.5.0+build.32.sha.6717232` (`5`)
- `1.0.1+build.288.sha.14398e9` (`5`)
- `1.0.2+build.332.sha.6be6f30.dirty` (`5`)
- plus many smaller clusters across `0.5.0-alpha`, `0.5.0-beta`, `1.0.0`,
  `1.2.0`, `1.2.1`, `1.2.2`, and `1.2.3`

Interpretation:

- this is not random local debris
- it is a historical evidence archive that should be accessioned deliberately
- because the video slice is large, promotion should probably be curated rather
  than bulk committed

### 2. Recoverable Source Media Already Cited In Repo Docs

The old-machine drop also contains several source artifacts that are already
described in committed analysis docs, but those docs still point at old-machine
download paths rather than a durable preserved-source location.

| Source file in old drop | Current repo anchor |
| --- | --- |
| `90 stage 1 player galaga example.mp4` | `reference-artifacts/analyses/galaga-stage-reference-video/README.md`, `reference-artifacts/analyses/galaga-stage-opening-timing/.../README.md`, `reference-artifacts/analyses/galaga-timing-alignment/.../README.md` |
| `Galaga Sounds with labelling in video.mp4` | `reference-artifacts/analyses/galaga-audio-reference-video/README.md` |
| `Galaga sounds effects - all 2.mp4` | `reference-artifacts/analyses/galaga-audio-reference-video-2/README.md` |
| `Galaga Sounds effects all 3.mp4` | `reference-artifacts/analyses/galaga-audio-reference-video-3/README.md` |
| `challenging stage perfect scores.mp4` | `reference-artifacts/analyses/challenge-stage-reference/README.md` |
| `19330__sgtpepperarc360__galaga-remake-music-and-sound-effects/` | `AUDIO_PLAN.md` |
| `261173__portwain__galaxian-arcade-game.wav` | `AUDIO_PLAN.md` |

These should be treated as "recoverable cited sources":

- they are already part of the repo's human narrative
- they now have a verified physical location on the copied old-machine volume
- the remaining work is to preserve them canonically and update stale absolute
  path references

### 3. Secondary Comparison Material

Lower-priority but still relevant material in the drop:

- `Galaga-master.zip`
  - small third-party code/archive comparison pack
  - useful as optional implementation-pattern comparison
  - should not be treated as primary fidelity evidence

## Separate Archive Candidate

`Abtweak/` and `Abtweak.zip` appear to be a real historical software archive:

- multiple dated versions from `1990` through `1993`
- Lisp source, manuals, compiled artifacts, and directory structure
- likely merits the same accession-first style used for ported historical
  archives

It should **not** be folded into Aurora evidence intake. If pursued, it should
get its own repo or repo lane, its own manifest, and its own recovery plan.

## Explicitly Out Of Scope For Aurora Intake

The old-machine drop also includes large amounts of material that should stay
out of this repo:

- tax and investment documents
- travel and boarding-pass files
- Costa Rica photo/video exports
- consumer receipts, membership docs, and personal admin files
- Pinokio / facefusion runtime logs under `exported_logs/`
- general utility/source downloads such as Ghostscript bundles

## Recommended Next Actions

1. Create a curated accession manifest for the historical Neo-Galaga export
   archive.
2. Decide whether the video slice should be preserved fully outside git with a
   manifest, or selectively promoted as a curated subset.
3. Preserve the already-cited Galaga/Galaxian source media in a stable canonical
   reference location under the project's evidence program.
4. Update committed docs that still point to stale old download paths once the
   canonical preserved-source locations are chosen.
5. Treat `Abtweak` as a separate historical archive project, not as Aurora
   evidence.
