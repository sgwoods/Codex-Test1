# Code Review Packet

Generated: `2026-06-11T17:10:06.355Z`

Branch: `main`
Base: `origin/main` / `494b4b291bfc55d40e95d2b6c19662e9551b3fba`
Head: `b3c13cdd`

## Summary

- changed files: `30`
- automatic findings: P0 `0`, P1 `0`, P2 `0`, P3 `0`
- dirty at packet time: `false`

## Architecture Skill Read

- installed architect skill found: `false`
- repo-owned review skill: `codex-skills/platinum-code-review/SKILL.md`
- model doc: `CODE_REVIEW_MODEL.md`

## Recommended Checks

- `npm run build`
- `npm run harness:check:supabase-data-api-contract`
- `npm run harness:check:remote-score-submit`
- `npm run harness:check:signed-in-game-over-lock`
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

- No automatic findings.

## Changed Files

- `CHALLENGE_SETPIECE_CONTRACTS.md` (M; docs-artifact; no-risk-tags)
- `CONFORMANCE_ECONOMICS.md` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/application-artifact-conformance/latest.json` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/challenge-motion-primitives/2026-06-11T17-08-22-494b4b29/README.md` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/challenge-motion-primitives/2026-06-11T17-08-22-494b4b29/report.json` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/challenge-motion-primitives/latest.json` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/challenge-movement-grammar/2026-06-11T17-08-22-494b4b29/README.md` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/challenge-movement-grammar/2026-06-11T17-08-22-494b4b29/report.json` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/challenge-movement-grammar/latest.json` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/challenge-setpiece-contracts/2026-06-11T17-08-22-494b4b29/README.md` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/challenge-setpiece-contracts/2026-06-11T17-08-22-494b4b29/report.json` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/challenge-setpiece-contracts/latest.json` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/challenge-trajectory-controls/2026-06-11T17-08-22-494b4b29/README.md` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/challenge-trajectory-controls/2026-06-11T17-08-22-494b4b29/report.json` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/challenge-trajectory-controls/latest.json` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/2026-06-11-494b4b29/compute-minutes-by-resource.svg` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/2026-06-11-494b4b29/cost-per-positive-score-point.svg` (A; docs-artifact; score-trust)
- `reference-artifacts/analyses/conformance-economics/2026-06-11-494b4b29/cpu-use-by-purpose.svg` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/2026-06-11-494b4b29/gameplay-improvement-by-project-part.svg` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/2026-06-11-494b4b29/gpu-equivalent-use-by-purpose.svg` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/2026-06-11-494b4b29/largest-score-deltas.svg` (A; docs-artifact; score-trust)
- `reference-artifacts/analyses/conformance-economics/2026-06-11-494b4b29/README.md` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/2026-06-11-494b4b29/report.json` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/2026-06-11-494b4b29/score-trends.svg` (A; docs-artifact; score-trust)
- `reference-artifacts/analyses/conformance-economics/latest.json` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/release-conformance-dashboard/2026-06-11-494b4b29-dirty/report.json` (A; release-tooling; release-lane)
- `reference-artifacts/analyses/release-conformance-dashboard/latest.json` (M; release-tooling; release-lane)
- `reference-artifacts/ingestion/challenge-motion-primitives/aurora-0.1.json` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/ingestion/challenge-stage-movement-grammar/aurora-first-five-0.1.json` (M; docs-artifact; no-risk-tags)
- `RELEASE_CONFORMANCE_DASHBOARD.md` (M; docs-artifact; no-risk-tags)
