# Next Codex Account Handoff

Updated: June 3, 2026

Use this file when continuing `Codex-Test1` from another Codex account or from
the MacBook machine after syncing from `origin/main`.

## Start In The Right Repo

Work from your local `Codex-Test1` checkout.

Authority-machine checkout:

```text
/Users/steven/Projects-All/Codex-Test1
```

Do not assume older CloudDocs or GitPages-era paths are current just because
they appear in older handoff notes.

## First Commands

From your local repo root, run:

```bash
git switch main
git pull --rebase origin main
npm run machine:bootstrap
npm run machine:status
npm run machine:doctor
npm run release:show-authority
```

If GitHub CLI authentication is missing in the new account context, run:

```bash
gh auth status
gh auth login
gh auth setup-git
```

## Current Authority Model

- `Codex-Test1` is the authoritative engineering source repo.
- `Aurora-Galactica` is the public release-host mirror only.
- Release authority remains on:
  - `machine_id`: `imacm1`
  - `machine_label`: `iMacM1`
- Non-authority machines may develop, run harnesses, create branches, commit,
  push, and merge normal development work.
- Non-authority machines must not approve beta, promote production, publish
  beta, or publish production unless release authority is explicitly
  transferred.

## Current Published State

As of June 3, 2026:

- hosted `/dev`
  - `1.4.0.1+build.1006.sha.ed8d7f18`
  - commit `ed8d7f18`
- hosted `/beta`
  - `1.4.0-beta.1+build.1006.sha.ed8d7f18.beta`
  - commit `ed8d7f18`
- hosted `/production`
  - `1.4.0+build.894.sha.1dc23d8a`
  - commit `1dc23d8a`

Meaning:

- `/dev` and `/beta` are aligned on the current authority-machine candidate.
- `/production` is intentionally behind and still represents the last stable
  public release family.
- There are `112` commits on `main` after the current production commit.

## Work Already Integrated On Main

The other machine should treat the following work as already integrated and
already published to `/dev` and `/beta`:

- `595f59c9` merge of `origin/codex/macbook-ingestion-grammar-sync`
- carried MacBook commit:
  - `249117d2` `Strengthen 2UP and challenge tour guardrails`
- hosted Arcade Music recovery and hosted fallback deployment:
  - `707c4437`
  - `45a0f542`
  - `1bc961e8`
  - `ddeddcef`
- public/private artifact boundary enforcement already on `main`:
  - `f01d3446`
  - `bfa895ae`

Do not redo those merges or try to republish them from the other machine as if
they were still pending.

## What Remains Undeployed

Not yet promoted to hosted `/production`:

- the MacBook 2UP and challenge-tour guardrail tranche
- the private-artifact boundary and public-build cleanup tranche
- the hosted Arcade Music fallback and recovery tranche

Not yet completed as follow-up work:

- release-process hardening so `/beta` cannot get ahead of stale hosted `/dev`
- a stronger hosted Arcade Music verifier that asserts real playable fallback
  behavior instead of only iframe presence
- the final `challenge-set-piece` quality push, which remains the weakest
  gameplay category

## Best Next Work On The Other Machine

If continuing product-quality work:

```bash
git switch main
git pull --rebase origin main
git switch -c codex/macbook-challenge-set-piece-quality
```

Focus:

- challenge-stage and challenge-set-piece quality
- measured motion, pacing, and set-piece review
- use reference evidence before subjective tuning

If continuing platform/release work:

```bash
git switch main
git pull --rebase origin main
git switch -c codex/macbook-release-lane-guardrails
```

Focus:

- require fresh hosted `/dev` parity before `/beta` publish
- tighten hosted Arcade Music verification
- keep release authority on `iMacM1`

## Important Docs To Read First

- [OTHER_MACHINE_CONTINUATION_HANDOFF_2026-06-03.md](OTHER_MACHINE_CONTINUATION_HANDOFF_2026-06-03.md)
- [RELEASE_LANE_MODEL.md](RELEASE_LANE_MODEL.md)
- [RELEASE_POLICY.md](RELEASE_POLICY.md)
- [SESSION_CLEANUP_AND_CROSS_MACHINE_INTEGRATION_PLAN_2026-06-01.md](SESSION_CLEANUP_AND_CROSS_MACHINE_INTEGRATION_PLAN_2026-06-01.md)
- [PRIVATE_ARTIFACT_BOUNDARY_STATUS_2026-06-01.md](PRIVATE_ARTIFACT_BOUNDARY_STATUS_2026-06-01.md)
- [PRIVATE_ARTIFACT_LEGACY_MIGRATION_PLAN_2026-06-01.md](PRIVATE_ARTIFACT_LEGACY_MIGRATION_PLAN_2026-06-01.md)

Read as needed after that:

- [ARTIFACT_STATUS_AND_GAMEPLAY_ADVANCEMENT_PLAN_2026-06-01.md](ARTIFACT_STATUS_AND_GAMEPLAY_ADVANCEMENT_PLAN_2026-06-01.md)
- [GUARDIANS_INGESTION_NET_TAKEAWAY_AND_NEXT_10_STEPS_2026-06-01.md](GUARDIANS_INGESTION_NET_TAKEAWAY_AND_NEXT_10_STEPS_2026-06-01.md)
- [REPOSITORY_ROLE_MAP.md](REPOSITORY_ROLE_MAP.md)
- [REFERENCE_MEDIA_INVENTORY.md](REFERENCE_MEDIA_INVENTORY.md)
