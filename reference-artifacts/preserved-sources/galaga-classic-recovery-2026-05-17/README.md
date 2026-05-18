# Galaga Classic Recovery

Reviewed: `2026-05-17`

This preserved-source lane promotes the recovered Galaga/Galaxian source media
that active repo docs were already citing from stale old download paths.

## What Is Here

- `video/galaga-stage-reference-video-proxy.mp4`
  - committed full-length review proxy for the long-form Galaga stage-reference
    video
- `audio-reference-videos/`
  - the three smaller cited Galaga audio-reference videos as original committed
    sources
- `challenge-stage/`
  - the cited challenge-stage reference video as an original committed source
- `galaxian-audio/`
  - the cited Galaxian cabinet/reference wav as an original committed source
- `audio-reference-pack/`
  - the cited Freesound Galaga remake music-and-effects pack as original
    committed source material
- `source-manifest.json`
  - provenance, bytes, hashes, and the proxy/original distinction for the stage
    reference video
- `checksums.sha256`
  - checksum ledger for the committed preserved files

## Important Note About The Stage Reference Video

The original long-form source file is larger than is comfortable for a normal
GitHub-tracked raw-source artifact.

This lane therefore preserves:

- the original source path, size, and hash in `source-manifest.json`
- a full-length committed review proxy that is small enough to live in the repo

That keeps the source family rerunnable on this machine while preserving
honest provenance about the external original.
