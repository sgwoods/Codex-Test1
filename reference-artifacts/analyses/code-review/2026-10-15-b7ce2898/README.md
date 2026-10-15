# Code Review Packet

Generated: `2026-10-15T04:30:29.999Z`

Branch: `main`
Base: `origin/main` / `8e93394bbc290d374d005cf13206e42e8c099b78`
Head: `b7ce2898`

## Summary

- changed files: `15`
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

- `ACTIVE_WORK.md` (M; docs-artifact; no-risk-tags)
- `BETA_READINESS_OCT06.md` (M; docs-artifact; no-risk-tags)
- `package.json` (M; release-tooling; release-lane)
- `reference-artifacts/analyses/beta-acceptance-oct15/REVIEW.md` (??; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/beta-acceptance-oct15/summary.json` (??; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/dev-beta-oct14/REVIEW.md` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/dev-beta-oct14/summary.json` (A; docs-artifact; no-risk-tags)
- `RELEASE_POLICY.md` (M; docs-artifact; no-risk-tags)
- `tools/build/check-publish-ready.js` (M; release-tooling; browser-safety, release-lane)
- `tools/build/frozen-beta-contract.js` (??; release-tooling; browser-safety, release-lane)
- `tools/build/publish-frozen-beta.js` (??; release-tooling; browser-safety, release-lane)
- `tools/build/publish-lane.js` (M; release-tooling; browser-safety, release-lane)
- `tools/harness/check-beta-account-boundary.js` (M; harness-tooling; browser-safety, harness)
- `tools/harness/check-frozen-beta-contract.js` (??; harness-tooling; browser-safety, harness)
- `tools/harness/check-frozen-beta-publisher.js` (??; release-tooling; browser-safety, harness, release-lane)
