# Code Review Packet

Generated: `2026-05-18T12:21:05.338Z`

Branch: `main`
Base: `origin/main` / `03eb338d815fc5aee106d0926f75f9852ccfe048`
Head: `03eb338d`

## Summary

- changed files: `27`
- automatic findings: P0 `0`, P1 `0`, P2 `1`, P3 `0`
- dirty at packet time: `true`

## Architecture Skill Read

- installed architect skill found: `false`
- repo-owned review skill: `codex-skills/platinum-code-review/SKILL.md`
- model doc: `CODE_REVIEW_MODEL.md`

## Recommended Checks

- `npm run build`
- `npm run harness:check:audio-runtime-recovery`
- `npm run harness:check:trophy-replay-surface`
- `npm run publish:check:dev`
- `npm run white-paper:review`
- `npm run review:code:check`

## Automatic Findings

- **P2 release-tooling-review** package.json: Release or npm script surface changed; verify lane authority and publish behavior.

## Changed Files

- `AUDIO_PLAN.md` (M; docs-artifact; no-risk-tags)
- `package.json` (M; release-tooling; release-lane)
- `REFERENCE_MEDIA_INVENTORY.md` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/challenge-stage-reference/README.md` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/galaga-audio-reference-video-2/README.md` (M; docs-artifact; media-external)
- `reference-artifacts/analyses/galaga-audio-reference-video-3/README.md` (M; docs-artifact; media-external)
- `reference-artifacts/analyses/galaga-audio-reference-video/README.md` (M; docs-artifact; media-external)
- `reference-artifacts/analyses/galaga-stage-opening-timing/2026-04-12-main-a777fba/README.md` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/galaga-stage-reference-video/README.md` (M; docs-artifact; media-external)
- `reference-artifacts/analyses/galaga-timing-alignment/2026-04-11-main-0549c6f/README.md` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/galaga-timing-alignment/2026-05-17-main-03eb338d/` (??; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/galaga-timing-alignment/2026-05-18-main-03eb338d/` (??; docs-artifact; no-risk-tags)
- `reference-artifacts/ingestion/downloads-old-all-2026-05-17/historical-neo-galaga-accession-plan.md` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/ingestion/downloads-old-all-2026-05-17/historical-neo-galaga-curated-manifest.json` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/ingestion/downloads-old-all-2026-05-17/README.md` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/ingestion/downloads-old-all-2026-05-17/source-manifest.json` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/preserved-sources/` (??; docs-artifact; no-risk-tags)
- `reference-artifacts/README.md` (M; docs-artifact; no-risk-tags)
- `tools/harness/analyze-galaga-timing-alignment.js` (M; harness-tooling; browser-safety, harness)
- `tools/review/check-reference-source-integrity.js` (??; harness-tooling; browser-safety, harness)
- `WHITE_PAPER.md` (M; docs-artifact; no-risk-tags)
- `white-paper.json` (M; docs-artifact; no-risk-tags)
- `white-paper/CITATION_LEDGER.md` (M; docs-artifact; no-risk-tags)
- `white-paper/README.md` (M; docs-artifact; no-risk-tags)
- `white-paper/RELATED_WORK.md` (M; docs-artifact; no-risk-tags)
- `white-paper/REVIEW_CADENCE.md` (??; docs-artifact; no-risk-tags)
- `white-paper/REVIEWER_CHECKLIST.md` (M; docs-artifact; no-risk-tags)
