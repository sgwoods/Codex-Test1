# Recurring Project Roles

This document is the durable source for recurring human, agent, machine, and
build-process roles used by Aurora / Platinum. Update it when a role gains or
loses authority, becomes automated, moves to a different tool, or stops being
part of the active operating model.

Automation means the role has build, harness, or documentation support. It does
not remove human release authority or human review responsibility.

| Role | Definition | Invoked or utilized when | Automation and build status | Detailed definition or source |
| --- | --- | --- | --- | --- |
| Manager / consultant | Prioritizes work, interprets evidence, sets stop/go constraints, and asks for cycle handoffs. | Before and after long cycles, when choosing the next quality/security target, and when avoiding rabbit-hole tuning. | Human/session role; outputs are preserved through handoff prompts and plan updates. | `CURRENT_PROJECT_STATE.md`, `LONG_CYCLE_KEEPER_PROCESS.md`, `GO_FORWARD_EXECUTION_PLAN.md` |
| Developer / execution agent | Implements scoped repo changes, runs checks, preserves unrelated work, commits intentionally, and reports evidence. | Every coding, docs, proof, review, or publish cycle after user or manager direction. | Human/Codex role supported by git, harness checks, build checks, and code-review packet generation. | `AGENTS.md`, `LONG_CYCLE_KEEPER_PROCESS.md`, `MULTI_MACHINE_WORKFLOW.md` |
| Architect / platform strategist | Converts repeated project pain into reusable mechanisms, schemas, compiler/runtime boundaries, and platform rules. | When a stage-specific fix exposes a systemic gap, or when the project needs reusable game-addition/platform mechanisms. | Mostly human/agent role; architecture outcomes are made checkable through docs, schemas, analyzers, and gates. | `PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md`, `PLATINUM_ARCHITECTURE_OVERVIEW.md`, `CODE_REVIEW_MODEL.md` |
| Release authority | Controls release-family discipline, hosted `/dev` publish, beta/production authority, and clean-state expectations. | Before branch/release-family decisions, `/dev` publishes, beta/production promotion, and hosted-lane claims. | Partly automated by release checks, publish gates, authority checks, and live verification; beta/production still require explicit user intent. | `MULTI_MACHINE_WORKFLOW.md`, `RELEASE_SCHEDULE_AND_ISSUE_SPINE_2026-06-07.md`, `TESTING_AND_RELEASE_GATES.md` |
| Parallel worker / iMac M1 | Runs separable background work such as Guardians evidence, long persona/watch runs, ingestion cycles, portability checks, docs sweeps, and issue hygiene. | When work can proceed independently without implying release authority. | Machine/human role; artifacts can feed the same build and conformance checks once integrated. | `MULTI_MACHINE_WORKFLOW.md`, `CURRENT_PROJECT_STATE.md`, `PROJECT_WIDE_WORKSTREAM_ALIGNMENT_2026-06-07.md` |
| Security reviewer | Tracks security findings, severity, release-gate posture, and resolution plans. | Before beta/production, after security-relevant code/data changes, and when a review packet identifies new risk. | Automated by security review and release-gate scripts; generated artifacts feed the human-readable review surface. | `SECURITY_ISSUES_RESOLUTION_PLAN.md`, `security-issues.json`, `tools/build/check-security-release-gate.js` |
| Code-review gate | Turns changed files, known risks, and security state into a durable review packet with prioritized findings. | Before publish and after material source, docs, harness, or release-surface changes. | Automated by code-review packet and gate scripts, including build/publish review integration. | `CODE_REVIEW_MODEL.md`, `REVIEW_LEARNING_LEDGER.md`, `tools/review/build-code-review-packet.js`, `tools/review/check-code-review-gate.js` |
| Conformance evaluator | Measures gameplay, audio, visual, release, confidence, resource economics, and weak-row evidence. | Before accepting keepers, after evidence runs, and before release docs or hosted-lane claims. | Automated by harness analyzers, `npm run harness:measure`, and release conformance dashboard refreshes. | `RELEASE_CONFORMANCE_DASHBOARD.md`, `CONFORMANCE_ECONOMICS.md`, `CONFORMANCE_METRICS_OVERVIEW.md` |
| Audio review lane | Separates localhost/private reference audio, hosted `/dev` review, public-safe lanes, and foreground-vs-pulse gates. | Before and after audio cue, asset-boundary, or perceived audio-regression work. | Automated by machine audio status, foreground-balance checks, cue-alignment checks, and public artifact boundary tests. | `AUDIO_CONFORMANCE_LAB.md`, `PLATINUM_AUDIO_CONFORMANCE_FRAMEWORK.md`, `tools/dev/private-reference-audio.js` |
| Player-visible quality reviewer | Decides whether measured movement, audio, visual, or interaction changes actually improve the game for a human player. | During keeper/rejection decisions, proof-to-source lanes, manual review, and beta-relevance discussions. | Part human judgment, part artifact-backed process through before/after captures, contact sheets, scorecards, and strict guardrails. | `LONG_CYCLE_KEEPER_PROCESS.md`, `PLAN.md`, `CHALLENGE_STAGE_CONFORMANCE_ANALYSIS.md` |
| Documentation generator | Builds hosted guides, white paper pages, slide metadata, PDF metadata, release dashboards, and review surfaces from repo-owned sources. | On normal builds, white-paper review runs, publish preflights, and documentation freshness checks. | Automated by `npm run build`, white-paper review scripts, publish checks, and documentation-freshness gates. | `white-paper/README.md`, `white-paper.json`, `project-guide.json`, `tools/build/build-index.js` |

## Maintenance Notes

- Keep role authority separate from role automation. A generated check can warn
  or block, but it does not create beta/production authority by itself.
- Keep machine roles explicit. The iMac M1 can produce evidence and background
  work, but it is not implicit release authority.
- When a new recurring role emerges, add it here first, then link it from the
  white paper, project guide, or release docs only if it becomes durable.
- When a build process starts generating or checking a role artifact, update
  the automation column and add the script or artifact path.
