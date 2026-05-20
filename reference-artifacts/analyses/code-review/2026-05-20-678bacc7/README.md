# Code Review Packet

Generated: `2026-05-20T15:38:01.423Z`

Branch: `main`
Base: `origin/main` / `678bacc7c192c475ae6ee306f6f21a1c76bd8a8f`
Head: `678bacc7`

## Summary

- changed files: `6`
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

- `project-guide.json` (M; docs-artifact; no-risk-tags)
- `tools/build/build-index.js` (M; release-tooling; browser-safety, release-lane)
- `tools/build/check-publish-ready.js` (M; release-tooling; browser-safety, release-lane)
- `tools/build/lane-files.js` (M; release-tooling; browser-safety, release-lane)
- `tools/build/sync-public-pages.js` (M; release-tooling; browser-safety, release-lane)
- `tools/build/verify-live-lane.js` (M; release-tooling; browser-safety, release-lane)
