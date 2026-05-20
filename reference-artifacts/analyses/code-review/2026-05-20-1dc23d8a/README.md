# Code Review Packet

Generated: `2026-05-20T16:12:35.964Z`

Branch: `main`
Base: `origin/main` / `1dc23d8ab4f01769928f73ad40b619eb01f718ae`
Head: `1dc23d8a`

## Summary

- changed files: `1`
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

- `tools/build/promote-production.js` (M; release-tooling; browser-safety, release-lane)
