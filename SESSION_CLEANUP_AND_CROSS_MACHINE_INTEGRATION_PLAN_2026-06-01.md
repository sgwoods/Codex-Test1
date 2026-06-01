# Session Cleanup And Cross-Machine Integration Plan

Date: `2026-06-01`

This note captures the best next cleanup steps now that the public/private
artifact boundary is closed and both repos are pushed.

## Current Good State

- public repo `sgwoods/Codex-Test1` is clean on `main` at `bfa895ae`
- private companion repo `sgwoods/Codex-Test1-private-artifacts` is clean on
  `main` at `bc2cb97`
- copied and derived reference bytes from the obvious intake and reference
  lanes are now private
- the old shipped `src/assets/reference-audio` lane is now private
- public builds no longer republish private-derived catalog media or shipped
  reference-audio files
- dashboard, policy, inventory, and migration docs reflect that boundary

This means the repo is now in a safe stop state for this machine.

## What Not To Do Right Now

Before integrating work from the other machine, do **not** start another broad
artifact migration tranche.

The remaining cleanup is more surgical and should be done either:

- as a narrow pre-merge preparation pass, or
- immediately after the other-machine integration lands

That reduces the chance of reworking the same files twice.

## Best Next Cleanup Steps

### 1. Freeze the current integration baseline

Record the public and private HEAD SHAs that define the current safe stop:

- public: `bfa895ae`
- private: `bc2cb97`

Use these as the fallback comparison anchors during cross-machine integration.

### 2. Integrate the other machine on a dedicated branch

Do not merge directly onto `main` first.

Create a short-lived integration branch and land the other machine there so we
can inspect:

- conflicts in dashboard data
- conflicts in policy/migration notes
- conflicts in `reference-artifacts/analyses/*`
- conflicts in build/runtime files such as `tools/build/build-index.js` and
  `src/js/00-boot.js`

### 3. Re-run the public-boundary smoke checks after integration

After the other machine lands, re-run:

1. `npm run build`
2. `git diff --check`
3. `find dist \\( -path '*reference-audio*' -o -path '*catalog-media*' \\) -print`

Expected result:

- no shipped files under `dist/**/assets/reference-audio`
- only intentional public-safe survivors under `dist/**/assets/catalog-media`

### 4. Re-check the dashboard surfaces after integration

Open the ingestion dashboard and confirm:

- top-level last-updated read is still accurate
- per-game updated timestamps still make sense
- private-media items still degrade to metadata/pointer behavior
- global docs still point to the right current notes

### 5. Review mixed conformance lanes file by file

Only after the other-machine integration is in place, start the next deliberate
cleanup review:

- `reference-artifacts/analyses/galaxy-guardians-identity`
- `reference-artifacts/analyses/challenge-stage-conformance`
- `reference-artifacts/analyses/level-visual-conformance-index`
- `reference-artifacts/analyses/level-visual-timing-alignment`
- `reference-artifacts/analyses/aurora-impact-explosion-conformance`
- `reference-artifacts/analyses/formation-boss-path-slot-extraction`

For each lane, split files into:

- public-safe runtime evidence that can stay public
- source-derived comparison media that should move private

### 6. Keep Guardians first when choosing the first mixed lane

Start with:

- `reference-artifacts/analyses/galaxy-guardians-identity`

This is the best next lane because it is:

- directly tied to the active quality goal on this machine
- likely to contain both public-safe runtime evidence and reference-derived
  comparison material
- useful as the template for the rest of the mixed-lane review

### 7. Refresh the repo-owned notes after the first mixed-lane decision

After the first post-integration mixed-lane review, update:

- `PRIVATE_ARTIFACT_BOUNDARY_STATUS_2026-06-01.md`
- `PRIVATE_ARTIFACT_LEGACY_MIGRATION_PLAN_2026-06-01.md`
- `REFERENCE_MEDIA_INVENTORY.md`
- `ingestion-dashboard.json`

That keeps the session state durable and makes the next cross-machine handoff
smaller.

### 8. Keep the session ending on a clean pushed state

Do not leave the integration half-landed locally.

The target end state for this session remains:

- public repo clean and pushed
- private repo clean and pushed
- dashboard build verified
- next mixed-lane review explicitly captured

## Recommended Order For This Session

If the goal is to get in the best possible state before integrating the other
machine shortly, the right order is:

1. treat the current boundary work as complete
2. integrate the other machine on a dedicated branch
3. re-run build and boundary smoke checks
4. only then do the first mixed-lane review, starting with
   `galaxy-guardians-identity`

That gives the cleanest path to a stable merged state without reopening
finished migration work.
