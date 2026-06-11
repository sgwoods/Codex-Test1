# Code Review Packet

Generated: `2026-06-11T11:20:43.528Z`

Branch: `main`
Base: `origin/main` / `1c8fb71467347e1af3787e44df8d1c7ebd80c54d`
Head: `1c8fb714`

## Summary

- changed files: `7`
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
- latest review: `reference-artifacts/analyses/security-release-review/latest.json` (production, 2026-06-11T11:18:07.664Z)
- open issues by priority: P0 `0`, P1 `0`, P2 `0`, P3 `0`
- production blockers in latest/structured read: `0`

### Top Open Security Issues

- No tracked open security issues.

## Automatic Findings

- **P2 release-tooling-review** package.json: Release or npm script surface changed; verify lane authority and publish behavior.

## Changed Files

- `reference-artifacts/analyses/security-release-review/2026-06-11-1c8fb714-beta/` (??; release-tooling; release-lane, security-release)
- `reference-artifacts/analyses/security-release-review/2026-06-11-1c8fb714-production/` (??; release-tooling; release-lane, security-release)
- `reference-artifacts/analyses/security-release-review/latest-beta.json` (M; release-tooling; release-lane, security-release)
- `reference-artifacts/analyses/security-release-review/latest-production.json` (M; release-tooling; release-lane, security-release)
- `reference-artifacts/analyses/security-release-review/latest.json` (M; release-tooling; release-lane, security-release)
- `SECURITY_ISSUES_RESOLUTION_PLAN.md` (M; release-tooling; security-release)
- `tools/build/check-publish-ready.js` (M; release-tooling; browser-safety, release-lane)
