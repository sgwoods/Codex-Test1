# Review Learning Ledger

This is the durable tracking location for architecture-review and code-review
learning across Aurora Galactica, Platinum, and future game-ingestion work.

The goal is not only to catch issues before a hosted lane move. The goal is to
notice repeated review patterns, decide which proposed fixes are accepted, and
turn that learning into future harnesses, release checks, documentation rules,
or simpler platform/game boundaries.

## Current Snapshot

- generated: `2026-05-18T11:43:01.187Z`
- branch: `main`
- commit: `ca08dbb5`
- review cycles tracked: `3`
- issue notes tracked: `6`
- accepted changes tracked: `3`
- automatic packet findings tracked: `2`

## How To Use This Ledger

1. Run `npm run review:code` before hosted-dev movement or any substantial review.
2. Run `npm run review:ledger` after architecture/code-review notes are added,
   accepted, rejected, or turned into follow-up checks.
3. Prefer `npm run review:cycle` when a review needs both a fresh packet and
   an updated ledger.
4. During beta review, scan the issue-note categories for repeated patterns.
5. Promote repeated patterns into one of: harness, release preflight, platform
   boundary rule, game-pack spec, documentation rule, or explicit non-goal.
6. Before production, every issue must have a production disposition in
   `review-dispositions.json`: either `addressed` or `dismissed`, with a
   rationale and evidence.

## Issue Taxonomy

| Id | Label | Meaning |
| --- | --- | --- |
| architecture-boundary | Architecture boundary | Platform responsibilities, game-pack ownership, and shared service seams. |
| release-tooling | Release tooling | Publish commands, lane authority, build stamps, and generated release artifacts. |
| auth-privacy-score | Auth, privacy, score trust | Login, Supabase, protected score submission, replay identity, and user data handling. |
| browser-media-safety | Browser and media safety | HTML injection, windows, embeds, audio/video lifecycle, autoplay, and cross-origin behavior. |
| performance-loop | Performance loop | Animation cadence, timers, event listeners, CPU/GPU use, and long-running harness cost. |
| harness-fragility | Harness fragility | Tests that are too replay-specific, too timing-tight, or not grounded in durable contracts. |
| docs-artifact-traceability | Docs and artifact traceability | Whether human docs, generated artifacts, dashboards, and release notes tell one story. |
| conformance-evidence | Conformance evidence | Reference-backed measurement before gameplay, audio, motion, or visual tuning. |

## Review Cycles

| Date | Focus | Source | Changed Files | Findings | Outcome |
| --- | --- | --- | --- | --- | --- |
| historical | Platform architecture baseline | ARCHITECT_REVIEW_RESPONSE.md | standing | P0 0 / P1 0 / P2 4 / P3 0 | Baseline concerns are partly covered and partly continuing maturity work. |
| 2026-05-14 | Local-to-hosted-dev code review gate | CODE_REVIEW_MODEL.md | standing | P0 0 / P1 0 / P2 0 / P3 0 | Accepted as a lightweight release-safety gate for development lane movement. |
| 2026-05-18 | Current branch code review packet | reference-artifacts/analyses/code-review/latest.json | 1897 | P0 0 / P1 0 / P2 2 / P3 0 | Use automatic findings as review notes and blocking P0/P1 gates; P2/P3 remain explicit human-review items. |

## Issues And Notes

| Severity | Category | Status | Id | Note | Proposed Action | Production Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| P2 | architecture-boundary | accepted | architect-key-abstractions | Keep core runtime, shell, service adapter, game-pack, entity, scoring, stage, render, and auth concerns named and separated. | Continue moving shared behavior into Platinum-owned contracts and game-specific behavior into pack-owned data or adapters. | addressed: The platform/application architecture documents and boundary harnesses now define the core runtime, shell, service adapter, game-pack, entity, scoring, stage, render, and auth concerns. |
| P2 | architecture-boundary | in_progress | architect-magic-constants | Some movement, render spacing, animation timing, and gameplay update values still need clearer structural ownership. | Move stable game-design values into pack/spec structures; keep local math values near implementation with intent comments. | dismissed: Remaining movement, render-spacing, animation-timing, and gameplay tuning constants are a next-cycle maintainability concern, not a blocker for the current production candidate when targeted gameplay and boundary checks pass. |
| P2 | harness-fragility | in_progress | architect-harness-fragility | Recorded-path harnesses can become brittle after motion and pacing changes. | Prefer state-based assertions, coarse behavioral envelopes, and repeated-run averages where exact replay geometry is not the contract. | dismissed: Recorded-path fragility is acknowledged and retained as a harness-maturity concern. It does not block the current production candidate if the relevant release harnesses, documentation freshness check, and publish preflight pass. |
| P2 | conformance-evidence | in_progress | architect-enemy-spec | Enemy family definitions should become declarative enough to support new game ingestion and controlled experimentation. | Continue extracting enemy family, attack pattern, and stage grammar data into game-owned specs. | dismissed: Declarative enemy-family and attack-pattern specs remain important for 1.4.0 and later conformance work. This is not a production blocker for a reviewed candidate unless the release claims those specs as complete. |
| P2 | architecture-boundary | review_note | code-review-platform-game-boundary-review | src/js/13-gameplay-adapter-registry.js: Gameplay or pack registry changed; run platform/game boundary harnesses and review pack ownership. | Verify the flagged surface with the targeted review questions and recommended checks before lane movement. | missing |
| P2 | release-tooling | review_note | code-review-release-tooling-review | package.json: Release or npm script surface changed; verify lane authority and publish behavior. | Verify the flagged surface with the targeted review questions and recommended checks before lane movement. | addressed: The release-tooling changes are intentional: they add the review packet, review-learning ledger, public review documentation, and a production disposition gate. The review packet is current and publish preflight remains green for the dev lane. |

## Change Decisions

## Proposed Changes

| Category | Status | Id | Proposed Change | Current Decision |
| --- | --- | --- | --- | --- |
| architecture-boundary | accepted | architect-key-abstractions-proposal | Continue moving shared behavior into Platinum-owned contracts and game-specific behavior into pack-owned data or adapters. | Architecture docs and boundary harnesses are the standing source of truth. |
| architecture-boundary | in_progress | architect-magic-constants-proposal | Move stable game-design values into pack/spec structures; keep local math values near implementation with intent comments. | Track this as continuing 1.4.0 platform maturity work. |
| harness-fragility | in_progress | architect-harness-fragility-proposal | Prefer state-based assertions, coarse behavioral envelopes, and repeated-run averages where exact replay geometry is not the contract. | Measured conformance work should leave more reusable harness logic behind than one-off replay checks. |
| conformance-evidence | in_progress | architect-enemy-spec-proposal | Continue extracting enemy family, attack pattern, and stage grammar data into game-owned specs. | Use ingestion-backed specs before considering heavier persistence infrastructure. |
| architecture-boundary | review_note | code-review-platform-game-boundary-review-proposal | Verify the flagged surface with the targeted review questions and recommended checks before lane movement. | Accepted as a visible review note that does not block hosted-dev by itself. |
| release-tooling | review_note | code-review-release-tooling-review-proposal | Verify the flagged surface with the targeted review questions and recommended checks before lane movement. | Accepted as a visible review note that does not block hosted-dev by itself. |

## Accepted Changes

| Category | Status | Id | Proposed Change | Accepted Change | Learning |
| --- | --- | --- | --- | --- | --- |
| release-tooling | accepted | local-code-review-gate | Introduce a local code review packet and hosted-dev gate before publish. | Implemented `npm run review:code:packet`, `npm run review:code:check`, and a hosted-dev publish gate that blocks stale packets and P0/P1 findings. | A lightweight deterministic gate catches obvious release, security, and boundary risk without turning every dev publish into a full architecture board. |
| release-tooling | accepted | code-review-packet-freshness | Make the gate compare the review packet against the current changed source set. | Implemented freshness checking so a stale packet fails before hosted-dev publish. | Review artifacts must stay tied to the exact changed set they describe. |
| docs-artifact-traceability | accepted | review-learning-ledger | Track architecture and code review issues, notes, proposed changes, accepted changes, and learning patterns in a separate durable location. | Created this ledger and a generated JSON artifact under `reference-artifacts/analyses/review-learning/`. | Review value compounds when repeated issue types become visible and can be turned into future harnesses, checks, and design rules. |

## Learning Patterns

| Id | Pattern | Response | Evidence |
| --- | --- | --- | --- |
| release-tooling-churn | Changes to scripts or release tooling often look small but affect lane authority and publish behavior. | Require `npm run publish:check:dev` plus the review packet before hosted-dev movement. | Latest packet recommends publish preflight. |
| generated-artifact-self-noise | Generated review artifacts can make review packets appear stale if they are treated as source inputs. | Exclude generated review artifact directories from packet freshness while keeping human-facing review docs in scope. | Code review and review-learning artifact directories are excluded from freshness checks. |
| harness-before-subjective-tuning | Motion, audio, pacing, and transition polish can drift when tuned subjectively. | Start with reference evidence, extracted clips, timing windows, or semantic logs, then promote only measured keepers. | Matches the repo AGENTS.md instruction for game polish and fidelity work. |
| review-notes-should-teach | One-off review comments lose value unless they become future prevention mechanisms. | Classify recurring findings and decide whether each should become a harness, release check, documentation rule, or code simplification. | This ledger tracks issue notes, proposed changes, accepted changes, and learning patterns. |

## Next Review Questions

- Did this change introduce platform behavior that should be owned by a game pack or game-specific adapter instead?
- Did a release, auth, score, or external-media surface change without a targeted harness or publish preflight?
- Did any review note recur often enough to deserve a new automatic check?
- Did generated artifacts and human-facing docs stay synchronized with the source change?
- Did conformance polish leave behind reusable ingestion, analysis, or scoring logic?

## Artifact Trail

The generated machine-readable ledger is written to:

- `reference-artifacts/analyses/review-learning/latest.json`
- `reference-artifacts/analyses/review-learning/<date>-<commit>/report.json`
- `reference-artifacts/analyses/review-learning/<date>-<commit>/README.md`

Generated review-learning artifact directories are excluded from code-review
packet freshness checks. This keeps the review packet focused on source,
human-facing docs, and runtime/tooling changes while preserving this ledger's
own artifact trail.
