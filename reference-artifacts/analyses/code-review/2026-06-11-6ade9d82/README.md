# Code Review Packet

Generated: `2026-06-11T14:28:14.914Z`

Branch: `main`
Base: `origin/main` / `6ade9d828f1d75f8571eddd20410b8be4d54931c`
Head: `6ade9d82`

## Summary

- changed files: `11`
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
- latest review: `reference-artifacts/analyses/security-release-review/latest.json` (beta, 2026-06-11T14:28:08.560Z)
- open issues by priority: P0 `0`, P1 `0`, P2 `0`, P3 `0`
- production blockers in latest/structured read: `0`

### Top Open Security Issues

- No tracked open security issues.

## Automatic Findings

- **P2 release-tooling-review** package.json: Release or npm script surface changed; verify lane authority and publish behavior.

## Changed Files

- `package.json` (M; release-tooling; release-lane)
- `reference-artifacts/analyses/security-release-review/2026-06-11-6ade9d82-beta/README.md` (??; release-tooling; release-lane, security-release)
- `reference-artifacts/analyses/security-release-review/2026-06-11-6ade9d82-beta/report.json` (??; release-tooling; release-lane, security-release)
- `reference-artifacts/analyses/security-release-review/2026-06-11-6ade9d82-dev/README.md` (??; release-tooling; release-lane, security-release)
- `reference-artifacts/analyses/security-release-review/2026-06-11-6ade9d82-dev/report.json` (??; release-tooling; release-lane, security-release)
- `reference-artifacts/analyses/security-release-review/latest-beta.json` (M; release-tooling; release-lane, security-release)
- `reference-artifacts/analyses/security-release-review/latest-dev.json` (M; release-tooling; release-lane, security-release)
- `reference-artifacts/analyses/security-release-review/latest.json` (M; release-tooling; release-lane, security-release)
- `SECURITY_ISSUES_RESOLUTION_PLAN.md` (M; release-tooling; security-release)
- `TESTING_AND_RELEASE_GATES.md` (M; docs-artifact; no-risk-tags)
- `tools/harness/check-live-lane-account-input.js` (??; harness-tooling; browser-safety, harness)
