---
name: platinum-code-review
description: Use when reviewing Aurora Galactica / Platinum code before hosted dev, beta, or production movement, especially changes touching browser safety, auth, score submission, Supabase, media/replay, YouTube/external integrations, release tooling, or platform/game-pack boundaries.
---

# Platinum Code Review

Use this skill for a senior production-code review of Aurora Galactica,
Platinum, and hosted game-pack work.

## Read First

Read `CODE_REVIEW_MODEL.md`.

When the change touches platform/game separation, also read:

- `ARCHITECTURE.md`
- `PLATINUM_ARCHITECTURE_OVERVIEW.md`
- `APPLICATIONS_ON_PLATINUM.md` when present
- `PLATINUM_GAME_BOUNDARY_AUDIT.md` when present

## Baseline Commands

Start with:

```bash
git status -sb
npm run review:cycle
```

For platform/game boundaries, prefer these nearby checks:

```bash
npm run harness:check:gameplay-adapter-boundaries
npm run harness:check:pack-registry-boundaries
npm run harness:check:platinum-renderer-boundaries
npm run harness:check:platinum-pack-boot
```

Choose additional harnesses based on the changed files and the packet's
recommended checks.

## Review Posture

Review like a strong senior browser-product engineer:

- findings first, ordered by severity
- concrete file/line references where possible
- security, privacy, release-lane, and platform/game boundary risks before style
- performance and browser media behavior when animation, canvas, audio, video,
  timers, or event listeners are touched
- avoid over-engineering advice unless it reduces real risk or repeated
  complexity

## Severity

- P0: likely exploit, data loss, public lane corruption, or release-authority
  violation
- P1: high-risk auth, score trust, privacy, XSS, external posting, or boundary
  violation
- P2: meaningful correctness, maintainability, release, performance, or UX risk
- P3: polish or cleanup

## Final Shape

Report:

1. findings
2. security/privacy read
3. platform/game boundary read
4. checks run and checks still recommended
5. release posture: local only, hosted-dev safe, beta-candidate after fixes, or
   not release-ready
6. ledger impact: issues noted, proposed changes, accepted changes, and
   recurring patterns captured in `REVIEW_LEARNING_LEDGER.md`
