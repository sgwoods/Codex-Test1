# Code Review Packet

Generated: `2026-06-11T10:54:44.578Z`

Branch: `main`
Base: `origin/main` / `cc69abaa3b014aefa976eb94ca4e237767c8f6fd`
Head: `cc69abaa`

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
- latest review: `reference-artifacts/analyses/security-release-review/latest.json` (beta, 2026-06-10T22:05:38.911Z)
- open issues by priority: P0 `0`, P1 `0`, P2 `0`, P3 `0`
- production blockers in latest/structured read: `0`

### Top Open Security Issues

- No tracked open security issues.

## Automatic Findings

- **P2 release-tooling-review** package.json: Release or npm script surface changed; verify lane authority and publish behavior.

## Changed Files

- `src/js/03-platform-services.js` (M; runtime; browser-runtime, browser-safety, platform-owned)
- `tools/build/check-publish-ready.js` (M; release-tooling; browser-safety, release-lane)
- `tools/harness/check-beta-account-boundary.js` (M; harness-tooling; browser-safety, harness)
