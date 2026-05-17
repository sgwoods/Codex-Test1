# Historical Neo-Galaga Accession Plan

Reviewed: `2026-05-17`

Source root:

- `/Volumes/LaCie1/2026 MacBook Files from iCloud /Downloads-old-all`

## Purpose

This plan narrows the broader `Downloads-old-all` intake ledger into a first
promotion strategy for the historical Neo-Galaga runtime archive.

It is intentionally reviewer-oriented:

- correct the first-pass count drift before promoting anything
- preserve a representative, explainable subset first
- keep the full external archive in place until we decide what belongs in
  canonical repo-owned evidence paths

## Corrected Archive Picture

The corrected numbers for the historical Neo-Galaga export family are:

| Metric | Value |
| --- | --- |
| Session JSON files excluding `-system-status.json` sidecars | `171` |
| `-system-status.json` sidecars | `13` |
| Unique session ids | `167` |
| Duplicate session-id groups | `4` |
| Session JSON bytes | `44,625,382` |
| Video files | `1364` |
| Video bytes | `9,930,453,641` |
| Paired session ids | `147` |
| Session ids without matching video | `20` |
| Video ids without matching session JSON | `1217` |
| Earliest session timestamp | `2026-03-15T15:27:10.496Z` |
| Latest session timestamp | `2026-04-12T14:19:59.808Z` |

Why the correction matters:

- the first intake pass counted `13` `-system-status.json` sidecars as session
  exports
- that drift would have made later accession math look cleaner than it really
  is
- this corrected baseline is the one future promotion work should use

## Promotion Model

Use a tiered promotion strategy instead of bulk import.

### Tier A: Representative paired accession subset

Promote a small paired subset first so the repo gains a durable historical run
spine without immediately absorbing the entire `9.9 GB` video archive.

Recommended first subset size:

- `22` representative session/video pairs

Selection rule:

- cover the major release families from `0.5.0-alpha` through `1.2.3`
- include the concentrated `1.0.0-modem` period
- prefer earliest paired examples for each milestone family so the historical
  sequence reads clearly

### Tier B: Deferred paired remainder

Keep the remaining paired sessions external for now:

- `125` paired session ids not in the first representative subset

### Tier C: Session-only backlog

Keep the no-video session ids tracked but unpromoted for now:

- `20` session ids without a matching preserved video

These are useful for chronology and gap analysis, but not ideal first evidence
promotion targets.

### Tier D: Orphan video backlog

Keep the unmatched videos external with manifest coverage:

- `1217` video ids without a matching session JSON export

This slice is the largest risk for accidental bulk intake with limited review
value.

## Recommended Tier A Candidates

| Lane | Build | Created at | Session id | Source file | Why keep first |
| --- | --- | --- | --- | --- | --- |
| `alpha_early` | `0.5.0-alpha.1+build.54.sha.2f12123` | `2026-03-18T23:13:40.910Z` | `ngt-1773875620910-2` | `neo-galaga-session-ngt-1773875620910-2.json` | earliest paired alpha-era example in the recovered archive |
| `alpha_mature_a` | `0.5.0-alpha.1+build.264.sha.3d9dc54.dirty` | `2026-03-29T17:34:04.334Z` | `ngt-1774805644334-8` | `neo-galaga-session-ngt-1774805644334-8.json` | later alpha-era run from a denser pre-beta cluster |
| `alpha_mature_b` | `0.5.0-alpha.1+build.264.sha.3d9dc54.dirty` | `2026-03-29T17:42:36.605Z` | `ngt-1774806156605-3` | `neo-galaga-session-ngt-1774806156605-3.json` | second mature-alpha sample from the same cluster for repeatability |
| `beta_early_a` | `0.5.0-beta.1+build.167.sha.9cae671.beta` | `2026-03-24T12:22:03.333Z` | `ngt-1774354923333-3` | `neo-galaga-session-ngt-1774354923333-3.json` | early beta-era anchor before later tuning passes |
| `beta_early_b` | `0.5.0-beta.1+build.167.sha.9cae671.beta` | `2026-03-24T12:22:43.833Z` | `ngt-1774354963833-4` | `neo-galaga-session-ngt-1774354963833-4.json` | adjacent beta sample that helps show early-run variability |
| `beta_late_a` | `0.5.0-beta.1+build.238.sha.e0e1160.beta` | `2026-03-28T11:35:23.435Z` | `ngt-1774697723435-3` | `neo-galaga-session-ngt-1774697723435-3.json` | late beta milestone close to stable `0.5.0` |
| `beta_late_b` | `0.5.0-beta.1+build.238.sha.e0e1160.beta` | `2026-03-28T11:50:15.905Z` | `ngt-1774698615905-4` | `neo-galaga-session-ngt-1774698615905-4.json` | second late-beta sample for immediate comparison against the first |
| `stable_050` | `0.5.0+build.20.sha.86a5da9` | `2026-03-24T11:50:57.804Z` | `ngt-1774353057804-3` | `neo-galaga-session-ngt-1774353057804-3.json` | first stable `0.5.0` representative in the recovered set |
| `modem_a` | `1.0.0-modem` | `2026-03-15T17:19:10.703Z` | `ngt-1773595150703-2` | `neo-galaga-session-ngt-1773595150703-2.json` | earliest paired modem-era sample after the unpaired opening runs |
| `modem_b` | `1.0.0-modem` | `2026-03-15T17:37:02.064Z` | `ngt-1773596222064-2` | `neo-galaga-session-ngt-1773596222064-2.json` | second modem-era anchor from the densest historical cluster |
| `beta_100` | `1.0.0-beta.1+build.276.sha.a59c5ad.beta` | `2026-03-31T14:48:22.512Z` | `ngt-1774968502512-3` | `neo-galaga-session-ngt-1774968502512-3.json` | first paired pre-launch `1.0.0` beta sample |
| `launch_100` | `1.0.0+build.276.sha.a59c5ad` | `2026-03-31T14:52:34.191Z` | `ngt-1774968754191-3` | `neo-galaga-session-ngt-1774968754191-3.json` | first paired stable `1.0.0` launch-era sample |
| `stable_101` | `1.0.1+build.288.sha.14398e9` | `2026-04-02T01:31:56.321Z` | `ngt-1775093516321-3` | `neo-galaga-session-ngt-1775093516321-3.json` | first `1.0.1` post-launch checkpoint |
| `beta_102` | `1.0.2-beta.1+build.289.sha.2d6ceb2.beta` | `2026-04-02T14:07:53.552Z` | `ngt-1775138873552-3` | `neo-galaga-session-ngt-1775138873552-3.json` | pre-stable `1.0.2` comparison point |
| `stable_102` | `1.0.2+build.290.sha.831a2c6` | `2026-04-02T15:13:29.542Z` | `ngt-1775142809542-3` | `neo-galaga-session-ngt-1775142809542-3.json` | first stable `1.0.2` sample |
| `dirty_102_peak` | `1.0.2+build.334.sha.a2dcfee.dirty` | `2026-04-04T20:12:37.968Z` | `ngt-1775333557968-3` | `neo-galaga-session-ngt-1775333557968-3.json` | representative of the densest paired dirty-build cluster |
| `beta_120` | `1.2.0-beta.1+build.364.sha.106adfd.beta` | `2026-04-07T12:35:36.963Z` | `ngt-1775565336963-3` | `neo-galaga-session-ngt-1775565336963-3.json` | first `1.2.x` beta-era step in the recovered archive |
| `stable_120` | `1.2.0+build.364.sha.106adfd` | `2026-04-07T12:26:28.715Z` | `ngt-1775564788715-3` | `neo-galaga-session-ngt-1775564788715-3.json` | first stable `1.2.0` checkpoint |
| `stable_121` | `1.2.1+build.376.sha.25a3e0f` | `2026-04-08T17:58:50.148Z` | `ngt-1775671130148-3` | `neo-galaga-session-ngt-1775671130148-3.json` | first `1.2.1` checkpoint |
| `stable_122` | `1.2.2+build.380.sha.87f6b6f` | `2026-04-09T23:28:39.479Z` | `ngt-1775777319479-3` | `neo-galaga-session-ngt-1775777319479-3.json` | first `1.2.2` checkpoint |
| `stable_123_early` | `1.2.3+build.395.sha.1d6be65` | `2026-04-10T20:08:45.645Z` | `ngt-1775851725645-5` | `neo-galaga-session-ngt-1775851725645-5.json` | early `1.2.3` milestone before the later paired cluster |
| `stable_123_mature` | `1.2.3+build.426.sha.512a6ed` | `2026-04-12T12:57:51.562Z` | `ngt-1775998671562-3` | `neo-galaga-session-ngt-1775998671562-3.json` | mature `1.2.3` checkpoint near the end of the recovered range |

## Session-Only Backlog Notes

The `20` unpaired session ids are still useful evidence, but they should remain
backlog material until we decide whether missing matching videos can be
recovered or whether session-only promotion is worth the overhead.

The most important early no-video examples are the first modem-era runs:

- `ngt-1773588430496-2` at `2026-03-15T15:27:10.496Z`
- `ngt-1773588702851-3` at `2026-03-15T15:31:42.851Z`
- `ngt-1773589578399-4` at `2026-03-15T15:46:18.399Z`
- `ngt-1773590521647-2` at `2026-03-15T16:02:01.647Z`
- `ngt-1773591154383-2` at `2026-03-15T16:12:34.383Z`

These likely deserve special attention because they are the earliest known
recovered `1.0.0-modem` session exports, even though they do not currently have
matching video.

## What This Enables

With this plan in place we can now do the next step cleanly:

1. create a canonical preserved-source location for the Tier A subset
2. copy only the selected session/video pairs with provenance notes
3. leave the rest of the external archive under manifest control until a later
   promotion decision

That keeps the repo historically richer without turning the first accession
move into a bulk-ingest mistake.
