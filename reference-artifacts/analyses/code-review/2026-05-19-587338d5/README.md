# Code Review Packet

Generated: `2026-05-19T20:32:56.280Z`

Branch: `main`
Base: `origin/main` / `c5ed9301e01cc5c39d20537c438fb254c88290e6`
Head: `587338d5`

## Summary

- changed files: `32`
- automatic findings: P0 `0`, P1 `0`, P2 `1`, P3 `0`
- dirty at packet time: `false`

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

- `CONFORMANCE_INVESTMENT_RETROSPECTIVE.md` (M; docs-artifact; no-risk-tags)
- `documentation-provenance.json` (M; docs-artifact; no-risk-tags)
- `GAME_CONFORMANCE_CATALOG.md` (M; docs-artifact; no-risk-tags)
- `GO_FORWARD_EXECUTION_PLAN.md` (M; docs-artifact; no-risk-tags)
- `package.json` (M; release-tooling; release-lane)
- `PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/application-artifact-conformance/latest.json` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line-cadence-00.png` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line-cadence-01.png` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line-cadence-02.png` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line-cadence-03.png` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line-cadence-04.png` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line-cadence-05.png` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line-cadence-06.png` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line-cadence-07.png` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line-dive-right.png` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line-flap-closed.png` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line-flap-open.png` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest-crops/but-line.png` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest.json` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-runtime-vs-galaga-target-crops/latest.json` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/formation-readability/latest.json` (A; docs-artifact; no-risk-tags)
- `RELEASE_NOTE_1.4.0.1_CONFORMANCE_PROCESS_REVIEW.md` (A; docs-artifact; no-risk-tags)
- `release-notes.json` (M; release-tooling; release-lane)
- `src/js/09-stage-flow.js` (M; runtime; browser-runtime, browser-safety, game-owned)
- `src/js/13-aurora-game-pack.js` (M; runtime; browser-runtime, browser-safety, game-owned)
- `src/js/21-render-board.js` (M; runtime; browser-runtime, browser-safety, game-owned)
- `tools/harness/check-aurora-runtime-sprite-conformance.js` (M; harness-tooling; browser-safety, harness)
- `tools/harness/check-formation-readability.js` (A; harness-tooling; browser-safety, harness)
- `tools/harness/check-opening-formation-layout.js` (M; harness-tooling; browser-safety, harness)
- `tools/harness/check-persona-stage2-safety.js` (M; harness-tooling; browser-safety, harness)
- `tools/harness/check-sprite-render-mode-guard.js` (M; harness-tooling; browser-safety, harness)
