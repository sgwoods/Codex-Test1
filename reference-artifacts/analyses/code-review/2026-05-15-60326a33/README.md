# Code Review Packet

Generated: `2026-05-15T12:55:15.335Z`

Branch: `codex/macbook-post-beta-conformance-10h`
Base: `origin/main` / `09a4c633cf92d35660f1a5986a156ea9cab112f4`
Head: `60326a33`

## Summary

- changed files: `45`
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

- `ARTIFACT_POLICY.md` (M; docs-artifact; no-risk-tags)
- `AUDIO_CONFORMANCE_LAB.md` (M; docs-artifact; no-risk-tags)
- `CODE_REVIEW_MODEL.md` (M; docs-artifact; no-risk-tags)
- `CONFORMANCE_METRIC_OVERVIEW.md` (M; docs-artifact; no-risk-tags)
- `CONFORMANCE_METRICS_OVERVIEW.md` (M; docs-artifact; no-risk-tags)
- `documentation-provenance.json` (M; docs-artifact; no-risk-tags)
- `EXTERNAL_SERVICES.md` (M; docs-artifact; no-risk-tags)
- `GAME_CONFORMANCE_CATALOG.md` (M; docs-artifact; no-risk-tags)
- `GO_FORWARD_EXECUTION_PLAN.md` (M; docs-artifact; no-risk-tags)
- `MACBOOK_POST_BETA_10_HOUR_CONFORMANCE_PLAN.md` (A; docs-artifact; no-risk-tags)
- `package.json` (M; release-tooling; release-lane)
- `project-guide.json` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/alien-entry-challenge-variation/2026-05-15-60326a33/` (??; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/alien-entry-challenge-variation/latest.json` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-audio-cue-candidates/latest-boss-hit.json` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-audio-cue-candidates/latest-challenge-perfect.json` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-audio-cue-candidates/latest-focus.json` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-audio-cue-candidates/latest-player-shot.json` (A; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-audio-cue-candidates/latest.json` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/aurora-audio-event-gap/latest.json` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/latest-run.json` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/conformance-economics/run-ledger.jsonl` (M; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/formation-boss-path-family-comparison/2026-05-15-60326a33/` (??; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/formation-boss-path-slot-extraction/2026-05-15-60326a33/` (??; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/galaga-path-reference-labels/` (??; docs-artifact; no-risk-tags)
- `reference-artifacts/analyses/release-conformance-dashboard/2026-05-15-02ae3190-dirty/report.json` (A; release-tooling; release-lane)
- `reference-artifacts/analyses/release-conformance-dashboard/2026-05-15-60326a33-dirty/` (??; release-tooling; release-lane)
- `reference-artifacts/analyses/release-conformance-dashboard/2026-05-15-f32c4a0d-dirty/report.json` (A; release-tooling; release-lane)
- `reference-artifacts/analyses/release-conformance-dashboard/latest.json` (M; release-tooling; release-lane)
- `reference-artifacts/analyses/stage-signature-distance/2026-05-15-60326a33/` (??; docs-artifact; no-risk-tags)
- `reference-artifacts/ingestion/` (??; docs-artifact; no-risk-tags)
- `RELEASE_CONFORMANCE_DASHBOARD.md` (M; docs-artifact; no-risk-tags)
- `RELEASE_POLICY.md` (M; docs-artifact; no-risk-tags)
- `REVIEW_LEARNING_LEDGER.md` (M; docs-artifact; no-risk-tags)
- `SECURITY_AUTH_REPLAY_STORAGE_LOCKDOWN.md` (??; docs-artifact; auth-privacy, media-external)
- `src/js/03-platform-services.js` (M; runtime; browser-runtime, browser-safety, platform-owned)
- `src/js/06-enemy-behavior.js` (M; runtime; browser-runtime, browser-safety, game-owned)
- `src/js/09-stage-flow.js` (M; runtime; browser-runtime, browser-safety, game-owned)
- `src/js/13-aurora-game-pack.js` (M; runtime; browser-runtime, browser-safety, game-owned)
- `tools/build/check-publish-ready.js` (M; release-tooling; browser-safety, release-lane)
- `tools/harness/analyze-alien-entry-challenge-variation.js` (M; harness-tooling; browser-safety, harness)
- `tools/harness/analyze-aurora-audio-focus-candidates.js` (M; harness-tooling; browser-safety, harness)
- `tools/harness/analyze-galaga-path-reference-labels.js` (??; harness-tooling; browser-safety, harness)
- `tools/harness/check-security-auth-replay-storage-rules.js` (??; harness-tooling; auth-privacy, browser-safety, harness, media-external, platform-owned)
- `tools/review/build-code-review-packet.js` (M; harness-tooling; browser-safety, harness)
