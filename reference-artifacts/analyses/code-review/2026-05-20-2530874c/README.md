# Code Review Packet

Generated: `2026-05-20T15:02:24.563Z`

Branch: `main`
Base: `origin/main` / `2530874c2828ba2b9c01a6bf41751366dc67e9ae`
Head: `2530874c`

## Summary

- changed files: `4`
- automatic findings: P0 `0`, P1 `0`, P2 `1`, P3 `0`
- dirty at packet time: `true`

## Architecture Skill Read

- installed architect skill found: `false`
- repo-owned review skill: `codex-skills/platinum-code-review/SKILL.md`
- model doc: `CODE_REVIEW_MODEL.md`

## Recommended Checks

- `npm run build`
- `npm run publish:check:dev`
- `npm run review:code:check`

## Automatic Findings

- **P2 release-tooling-review** package.json: Release or npm script surface changed; verify lane authority and publish behavior.

## Changed Files

- `tools/build/build-index.js` (M; release-tooling; browser-safety, release-lane)
- `tools/build/check-publish-ready.js` (M; release-tooling; browser-safety, release-lane)
- `tools/build/release-note-selection.js` (??; release-tooling; browser-safety, release-lane)
- `tools/build/sync-public-pages.js` (M; release-tooling; browser-safety, release-lane)
