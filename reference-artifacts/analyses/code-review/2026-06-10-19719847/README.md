# Code Review Packet

Generated: `2026-06-10T22:06:46.419Z`

Branch: `main`
Base: `origin/main` / `56420d02de20364c097d841edd926a053fb5904c`
Head: `19719847`

## Summary

- changed files: `9`
- automatic findings: P0 `0`, P1 `0`, P2 `2`, P3 `0`
- dirty at packet time: `false`

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

- **P2 html-injection-surface** reference-artifacts/analyses/security-release-review/2026-06-10-56420d02-beta/README.md: HTML injection surface changed; verify content is static or sanitized.
- **P2 html-injection-surface** reference-artifacts/analyses/security-release-review/2026-06-10-56420d02-dev/README.md: HTML injection surface changed; verify content is static or sanitized.

## Changed Files

- `reference-artifacts/analyses/security-release-review/2026-06-10-56420d02-beta/README.md` (A; release-tooling; release-lane, security-release)
- `reference-artifacts/analyses/security-release-review/2026-06-10-56420d02-beta/report.json` (A; release-tooling; release-lane, security-release)
- `reference-artifacts/analyses/security-release-review/2026-06-10-56420d02-dev/README.md` (A; release-tooling; release-lane, security-release)
- `reference-artifacts/analyses/security-release-review/2026-06-10-56420d02-dev/report.json` (A; release-tooling; release-lane, security-release)
- `reference-artifacts/analyses/security-release-review/latest-beta.json` (M; release-tooling; release-lane, security-release)
- `reference-artifacts/analyses/security-release-review/latest-dev.json` (M; release-tooling; release-lane, security-release)
- `reference-artifacts/analyses/security-release-review/latest.json` (M; release-tooling; release-lane, security-release)
- `SECURITY_ISSUES_RESOLUTION_PLAN.md` (M; release-tooling; security-release)
- `security-issues.json` (M; release-tooling; security-release)
