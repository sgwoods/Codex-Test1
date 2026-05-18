# Preserved Sources

This directory holds canonical recovered source material that has been promoted
out of intake-only status and into a repo-owned preserved-source lane.

## Purpose

These source families are important enough to preserve intentionally because
they support:

- timing and audio conformance work
- historical project provenance
- rerunnable analysis on the current machine
- white-paper and release-surface claims about evidence discipline

## Working Rule

- Keep recovered sources separated from generated analysis output.
- Preserve original source files directly when they are repo-manageable.
- When a source is too large to commit comfortably, preserve a committed review
  proxy plus the original-source metadata and hash.
- Every preserved-source family should have a `README.md`, a
  `source-manifest.json`, and a `checksums.sha256` file.

## Current Preserved Families

- `neo-galaga-history-2026-03-to-2026-04/`
  - representative `22`-pair historical Neo-Galaga archive subset recovered
    from the old-machine drop
- `galaga-classic-recovery-2026-05-17/`
  - recovered Galaga/Galaxian source media already cited by active repo docs,
    including the Freesound audio pack and a full-length committed proxy of the
    long-form stage-reference video
