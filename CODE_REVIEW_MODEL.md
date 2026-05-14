# Platinum Code Review Model

This is the standing review model for code moving from local development toward
hosted `/dev`. It is intentionally stricter than a readability pass and lighter
than a heavyweight enterprise architecture board.

## Goal

Review every meaningful local-to-dev bundle as a strong senior browser-product
engineer would:

- protect consumer safety, privacy, authentication, scoring trust, and hosted
  lane integrity
- preserve the Platinum platform / game-pack boundary
- keep browser performance, animation smoothness, and media behavior practical
- require clear code, but avoid over-engineering small game/application changes
- make release risk explicit before publishing hosted `/dev`

## Existing Architecture Basis

There is not currently a separate installed Codex "architect" skill for
Platinum. The architecture standard already lives in repo-owned docs and
harnesses:

- `ARCHITECTURE.md`
- `PLATINUM_ARCHITECTURE_OVERVIEW.md`
- `APPLICATIONS_ON_PLATINUM.md`
- `PLATINUM_GAME_BOUNDARY_AUDIT.md`
- `tools/harness/check-gameplay-adapter-boundaries.js`
- `tools/harness/check-pack-registry-boundaries.js`
- `tools/harness/check-platinum-renderer-boundaries.js`
- `tools/harness/check-platinum-pack-boot.js`

The repo-owned skill `codex-skills/platinum-code-review/SKILL.md` now points a
reviewer at those sources when platform/game separation matters.

## Review Lanes

| Lane | Blocking Standard | Purpose |
| --- | --- | --- |
| Local iteration | advisory | Help shape code before it hardens. |
| Local -> hosted `/dev` | blocks automatic P0/P1 only | Prevent obvious safety, security, boundary, and release-lane mistakes. |
| Hosted `/dev` -> `/beta` | human review required | Confirm user-facing value, conformance evidence, docs, and release notes. |
| `/beta` -> `/production` | release authority only | Confirm approved lane lineage and public release readiness. |

## Severity

| Severity | Meaning | Gate Behavior |
| --- | --- | --- |
| P0 | likely exploit, data loss, public lane corruption, or broken production authority | block |
| P1 | high-risk auth, score trust, privacy, XSS, unsafe external posting, or platform/game boundary violation | block |
| P2 | meaningful maintainability, release, performance, or UX risk | allow local `/dev`, require explicit review note |
| P3 | polish, naming, local clarity, or future cleanup | allow |

## Mandatory Review Questions

1. **Correctness:** Does the change preserve state transitions, deterministic
   harness behavior, score/life rules, and release-lane assumptions?
2. **Security and privacy:** Does it touch auth, Supabase, score submission,
   YouTube/external posting, browser storage, tokens, user IDs, or embedded
   third-party content?
3. **Browser safety:** Does it introduce unsafe HTML injection, autoplay/media
   regressions, window/popup behavior, cross-origin fetches, or permission
   assumptions?
4. **Performance:** Does it affect animation loops, canvas drawing, timers,
   audio/video capture, long-cycle harnesses, or event-listener lifecycle?
5. **Platform/game boundary:** Is shared behavior in Platinum and game-specific
   behavior in the owning pack/application? Did a future game inherit Aurora
   rules, scoring, assets, timing, or event vocabulary by accident?
6. **Release readiness:** Are docs, dashboards, conformance artifacts, release
   notes, and lane authority consistent with the intended publish target?
7. **Simplicity:** Is the implementation appropriate for a fast browser arcade
   application, or did it add abstraction without a real boundary or repeated
   need?

## Automatic Packet And Gate

Use:

```bash
npm run review:code
```

This writes:

- `reference-artifacts/analyses/code-review/latest.json`
- `reference-artifacts/analyses/code-review/<date>-<commit>/report.json`
- `reference-artifacts/analyses/code-review/<date>-<commit>/README.md`

The packet is deterministic. It does not replace a human/Codex review, but it
does make the reviewer start from the same change set, risk tags, architecture
surface, and recommended harnesses.

The hosted-dev publish path runs:

```bash
npm run review:code:check
```

That check is intentionally narrow. It fails if the packet is missing, stale for
the current changed source set, or contains automatic P0/P1 findings. P2/P3
findings remain visible but do not block hosted `/dev`.

## Review Learning Ledger

Use:

```bash
npm run review:ledger
```

This writes:

- `REVIEW_LEARNING_LEDGER.md`
- `reference-artifacts/analyses/review-learning/latest.json`
- `reference-artifacts/analyses/review-learning/<date>-<commit>/report.json`
- `reference-artifacts/analyses/review-learning/<date>-<commit>/README.md`

The ledger is the separate durable location for architecture-review and
code-review notes over time. It tracks issue categories, proposed changes,
accepted changes, and repeated learning patterns so we can see what kinds of
problems recur and decide whether they should become a harness, release
preflight, platform/game boundary rule, documentation rule, or explicit
non-goal.

Generated review-learning artifact directories are excluded from code-review
packet freshness checks. The human-facing `REVIEW_LEARNING_LEDGER.md` remains in
normal review scope.

When a review cycle needs both a fresh code-review packet and an updated
ledger, use:

```bash
npm run review:cycle
```

That command refreshes the packet, generates the ledger from that packet, then
refreshes the packet again so the human-facing ledger document is included in
the final reviewed source set.

## Required Output Shape For Codex Reviews

When Codex performs the review, it should report:

1. findings first, ordered by severity, with file/line references where
   possible
2. security/privacy and platform/game boundary read even when no issue is found
3. recommended targeted harnesses
4. release impact: safe for local only, safe for hosted `/dev`, beta candidate
   after fixes, or not release-ready
5. effort/value note: whether the fix is worth doing before the next publish
6. ledger impact: whether a finding, accepted change, or repeated pattern should
   update `REVIEW_LEARNING_LEDGER.md` through `npm run review:ledger`

If there are no findings, say that clearly and name any residual risk or checks
that were not run.
