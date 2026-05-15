# Code Review Packet

Generated: `2026-05-15T00:01:16.429Z`

Branch: `main`
Base: `origin/main` / `7741afb2e50cb4d9f84cefa2294012b90aa78352`
Head: `7741afb2`

## Summary

- changed files: `97`
- automatic findings: P0 `0`, P1 `0`, P2 `1`, P3 `0`
- dirty at packet time: `true`

## Architecture Skill Read

- installed architect skill found: `false`
- repo-owned review skill: `codex-skills/platinum-code-review/SKILL.md`
- model doc: `CODE_REVIEW_MODEL.md`

## Recommended Checks

- `npm run build`
- `npm run harness:check:supabase-data-api-contract`
- `npm run harness:check:remote-score-submit`
- `npm run harness:check:signed-in-game-over-lock`
- `npm run harness:check:audio-runtime-recovery`
- `npm run harness:check:trophy-replay-surface`
- `npm run publish:check:dev`
- `npm run review:code:check`

## Automatic Findings

- **P2 release-tooling-review** package.json: Release or npm script surface changed; verify lane authority and publish behavior.

## Changed Files

- `application-guide.json` (M; docs-artifact; no-risk-tags)
- `AUDIO_CONFORMANCE_LAB.md` (M; docs-artifact; no-risk-tags)
- `CODE_REVIEW_MODEL.md` (A; docs-artifact; no-risk-tags)
- `codex-skills/platinum-code-review/SKILL.md` (A; docs-artifact; no-risk-tags)
- `CONFORMANCE_ECONOMICS.md` (M; docs-artifact; no-risk-tags)
- `CONFORMANCE_METRICS_OVERVIEW.md` (M; docs-artifact; no-risk-tags)
- `documentation-provenance.json` (M; docs-artifact; no-risk-tags)
- `EXTERNAL_SERVICES.md` (M; docs-artifact; no-risk-tags)
- `GAME_CONFORMANCE_CATALOG.md` (M; docs-artifact; no-risk-tags)
- `GO_FORWARD_EXECUTION_PLAN.md` (M; docs-artifact; no-risk-tags)
- `package.json` (M; release-tooling; release-lane)
- `PLAN.md` (M; docs-artifact; no-risk-tags)
- `platinum-guide.json` (M; docs-artifact; no-risk-tags)
- `PRODUCT_ROADMAP.md` (M; docs-artifact; no-risk-tags)
- `PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md` (M; docs-artifact; no-risk-tags)
- `project-guide.json` (M; docs-artifact; no-risk-tags)
- `README.md` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-audio-cue-candidates/latest-capture-success.json` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-audio-cue-candidates/latest-challenge-perfect.json` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-audio-cue-candidates/latest-challenge-results.json` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-audio-cue-candidates/latest-enemy-shot.json` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-audio-cue-candidates/latest-focus.json` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-audio-cue-candidates/latest-player-hit-focus.json` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-audio-event-gap/latest.json` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-1c788342/compute-minutes-by-resource.svg` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-1c788342/cost-per-positive-score-point.svg` (A; docs-artifact; score-trust)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-1c788342/cpu-use-by-purpose.svg` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-1c788342/gameplay-improvement-by-project-part.svg` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-1c788342/gpu-equivalent-use-by-purpose.svg` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-1c788342/largest-score-deltas.svg` (A; docs-artifact; score-trust)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-1c788342/README.md` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-1c788342/report.json` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-1c788342/score-trends.svg` (A; docs-artifact; score-trust)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-35b1b292/compute-minutes-by-resource.svg` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-35b1b292/cost-per-positive-score-point.svg` (A; docs-artifact; score-trust)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-35b1b292/cpu-use-by-purpose.svg` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-35b1b292/gameplay-improvement-by-project-part.svg` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-35b1b292/gpu-equivalent-use-by-purpose.svg` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-35b1b292/largest-score-deltas.svg` (A; docs-artifact; score-trust)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-35b1b292/README.md` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-35b1b292/report.json` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-35b1b292/score-trends.svg` (A; docs-artifact; score-trust)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-df15e918/compute-minutes-by-resource.svg` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-df15e918/cost-per-positive-score-point.svg` (A; docs-artifact; score-trust)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-df15e918/cpu-use-by-purpose.svg` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-df15e918/gameplay-improvement-by-project-part.svg` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-df15e918/gpu-equivalent-use-by-purpose.svg` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-df15e918/largest-score-deltas.svg` (A; docs-artifact; score-trust)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-df15e918/README.md` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-df15e918/report.json` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/2026-05-14-df15e918/score-trends.svg` (A; docs-artifact; score-trust)
- `reference-artifacts/analyses/conformance-economics/latest-run.json` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/run-ledger.jsonl` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/player-two-mode-ui/latest.json` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/release-conformance-dashboard/2026-05-14-1c788342-dirty/report.json` (A; release-tooling; release-lane)
- `reference-artifacts/analyses/release-conformance-dashboard/2026-05-14-35b1b292-dirty/report.json` (A; release-tooling; release-lane)
- `reference-artifacts/analyses/release-conformance-dashboard/2026-05-14-df15e918-dirty/report.json` (A; release-tooling; release-lane)
- `reference-artifacts/analyses/release-conformance-dashboard/latest.json` (M; release-tooling; release-lane)
- `RELEASE_CONFORMANCE_DASHBOARD.md` (M; docs-artifact; no-risk-tags)
- `RELEASE_POLICY.md` (M; docs-artifact; no-risk-tags)
- `RELEASE_READINESS_REVIEW.md` (M; docs-artifact; no-risk-tags)
- `RESTART_FROM_HERE.md` (M; docs-artifact; no-risk-tags)
- `REVIEW_LEARNING_LEDGER.md` (AM; docs-artifact; no-risk-tags)
- `review-dispositions.json` (A; docs-artifact; no-risk-tags)
- `src/index.template.html` (M; docs-artifact; browser-safety)
- `src/js/00-boot.js` (M; runtime; browser-runtime, browser-safety, platform-owned)
- `src/js/02-replay-telemetry.js` (M; runtime; browser-runtime, browser-safety, media-external, platform-owned)
- `src/js/04-commentator.js` (A; runtime; browser-runtime, browser-safety, platform-owned)
- `src/js/04-leaderboard-ui.js` (M; runtime; browser-runtime, browser-safety, platform-owned, score-trust)
- `src/js/05-player-combat.js` (M; runtime; browser-runtime, browser-safety, game-owned)
- `src/js/05-player-flow.js` (M; runtime; browser-runtime, browser-safety, game-owned)
- `src/js/05-supabase.js` (M; runtime; auth-privacy, browser-runtime, browser-safety, game-owned)
- `src/js/07-capture-rescue.js` (M; runtime; browser-runtime, browser-safety, game-owned)
- `src/js/08-score-awards.js` (M; runtime; browser-runtime, browser-safety, game-owned, score-trust)
- `src/js/10-gameplay.js` (M; runtime; browser-runtime, browser-safety, game-owned)
- `src/js/13-aurora-game-pack.js` (M; runtime; browser-runtime, browser-safety, game-owned)
- `src/js/19-render-shell.js` (M; runtime; browser-runtime, browser-safety, platform-boundary)
- `src/js/90-harness.js` (M; runtime; browser-runtime, browser-safety, platform-boundary)
- `src/public/aurora-galactica.template.html` (M; docs-artifact; browser-safety)
- `src/styles.css` (M; docs-artifact; browser-safety)
- `SUPABASE_DATA_API_ACCESS.md` (A; docs-artifact; auth-privacy)
- `supabase/data-api-access-contract.sql` (A; docs-artifact; auth-privacy)
- `TESTING_AND_RELEASE_GATES.md` (M; docs-artifact; no-risk-tags)
- `tools/build/check-publish-ready.js` (M; release-tooling; browser-safety, release-lane)
- `tools/build/public-project-page-sections.js` (M; release-tooling; browser-safety, release-lane)
- `tools/harness/analyze-audio-theme-comparison.js` (M; harness-tooling; browser-safety, harness)
- `tools/harness/analyze-aurora-audio-event-gap.js` (M; harness-tooling; browser-safety, harness)
- `tools/harness/analyze-aurora-audio-focus-candidates.js` (M; harness-tooling; browser-safety, harness)
- `tools/harness/audio-spec-renderer.js` (A; harness-tooling; browser-safety, harness)
- `tools/harness/check-commentator-callouts.js` (A; harness-tooling; browser-safety, harness)
- `tools/harness/check-player-two-mode.js` (A; harness-tooling; browser-safety, harness)
- `tools/harness/check-supabase-data-api-contract.js` (A; harness-tooling; auth-privacy, browser-safety, harness)
- `tools/harness/check-trophy-replay-surface.js` (A; harness-tooling; browser-safety, harness, media-external, score-trust)
- `tools/review/build-code-review-packet.js` (A; harness-tooling; browser-safety, harness)
- `tools/review/build-review-learning-ledger.js` (A; harness-tooling; browser-safety, harness)
- `tools/review/check-code-review-gate.js` (A; harness-tooling; browser-safety, harness)
- `tools/review/check-review-dispositions.js` (A; harness-tooling; browser-safety, harness)
