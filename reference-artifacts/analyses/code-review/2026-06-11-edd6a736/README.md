# Code Review Packet

Generated: `2026-06-11T17:42:10.222Z`

Branch: `main`
Base: `origin/main` / `edd6a73600a9b035b80d023475b9d976039b132b`
Head: `edd6a736`

## Summary

- changed files: `3`
- automatic findings: P0 `0`, P1 `0`, P2 `1`, P3 `0`
- dirty at packet time: `true`

## Architecture Skill Read

- installed architect skill found: `false`
- repo-owned review skill: `codex-skills/platinum-code-review/SKILL.md`
- model doc: `CODE_REVIEW_MODEL.md`

## Recommended Checks

- `npm run build`
- `npm run publish:check:dev`
- `npm run security:review:dev`
- `npm run review:code:check`

## Security Best-Practices Read

- source: `security-issues.json`
- latest review: `reference-artifacts/analyses/security-release-review/latest.json` (production, 2026-06-11T15:32:04.730Z)
- open issues by priority: P0 `0`, P1 `0`, P2 `0`, P3 `0`
- production blockers in latest/structured read: `0`

### Top Open Security Issues

- No tracked open security issues.

## Automatic Findings

- **P2 release-tooling-review** package.json: Release or npm script surface changed; verify lane authority and publish behavior.

## Changed Files

- `package.json` (M; release-tooling; release-lane)
- `TESTING_AND_RELEASE_GATES.md` (M; docs-artifact; no-risk-tags)
- `tools/build/release-preflight-dev.js` (??; release-tooling; browser-safety, release-lane)
