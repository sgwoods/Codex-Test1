# Neo-Galaga Historical Representative Archive

Reviewed: `2026-05-17`

This preserved-source lane promotes the first intentional historical subset from
the old-machine `Downloads-old-all` archive.

## What Is Here

- `sessions/`
  - `22` representative Neo-Galaga session exports
- `videos/`
  - the matching `22` paired gameplay videos
- `source-manifest.json`
  - structured list of the preserved pairs, build labels, session ids, bytes,
    hashes, and the selection basis
- `checksums.sha256`
  - checksum ledger for the committed preserved files

## Why This Subset Exists

The full old-machine historical archive is much larger:

- `167` unique session ids
- `147` paired session/video ids
- `20` session-only backlog ids
- `1217` orphan videos without matching session JSON

This lane intentionally preserves the first `22` representative pairs so the
repo gains:

- a recoverable March-April historical runtime spine
- coverage across `0.5.0-alpha` through `1.2.3`
- specific evidence for the concentrated `1.0.0-modem` period

without immediately promoting the entire archive.

## Selection Source

The exact selection basis is recorded in:

- `reference-artifacts/ingestion/downloads-old-all-2026-05-17/historical-neo-galaga-curated-manifest.json`

That intake manifest remains the broader planning surface; this directory is the
first actual preserved-source promotion.
