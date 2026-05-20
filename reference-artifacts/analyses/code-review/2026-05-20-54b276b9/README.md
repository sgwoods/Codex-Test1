# Code Review Packet

Generated: `2026-05-20T16:02:17.073Z`

Branch: `main`
Base: `origin/main` / `54b276b99ab03ced312e7314d303d8ea9152d5e1`
Head: `54b276b9`

## Summary

- changed files: `5`
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

- `src/public/aurora-galactica.template.html` (M; docs-artifact; browser-safety)
- `tools/build/build-index.js` (M; release-tooling; browser-safety, release-lane)
- `tools/build/check-publish-ready.js` (M; release-tooling; browser-safety, release-lane)
- `tools/build/sync-public-pages.js` (M; release-tooling; browser-safety, release-lane)
- `tools/build/verify-live-lane.js` (M; release-tooling; browser-safety, release-lane)
