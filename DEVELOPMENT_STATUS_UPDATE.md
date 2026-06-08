# Aurora Galactica Development Status Update

Historical snapshot: this May 18, 2026 note is no longer the live lane-state
source. Use [CURRENT_PROJECT_STATE.md](CURRENT_PROJECT_STATE.md),
[PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md](PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md),
and [RELEASE_SCHEDULE_AND_ISSUE_SPINE_2026-06-07.md](RELEASE_SCHEDULE_AND_ISSUE_SPINE_2026-06-07.md)
for current project state, release-family ownership, and lane posture. This
file remains useful for preserved-source, white-paper, and review-cadence
context from that checkpoint.

Updated: May 18, 2026

This is the quick reopen note for the repo's current checked state and the
short list of work that still needs to happen after the latest white-paper,
preserved-source, and review-cadence pass.

Use this together with:

- [PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md](PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md)
- [PLAN.md](PLAN.md)
- [WHITE_PAPER.md](WHITE_PAPER.md)
- [reference-artifacts/preserved-sources/README.md](reference-artifacts/preserved-sources/README.md)

## Current Checked State

- hosted `/production` is live on `1.4.0+build.748.sha.09a4c633`
- hosted `/dev` is live on `1.4.0.1+build.818.sha.1b30577c`
- local `main` and `origin/main` now include newer cleanup work through
  `db847d7f`, including preserved-source promotion, white-paper tightening, and
  review-cadence hardening
- the white paper is live on hosted `/dev` at
  `https://sgwoods.github.io/Aurora-Galactica/dev/white-paper.html`
- the intended hosted `/production` white-paper URL still returns `404` as of
  May 18, 2026:
  `https://sgwoods.github.io/Aurora-Galactica/white-paper.html`
- the top-level `sgwoods` public index currently reaches the Aurora project page
  cleanly, but that public Aurora page still does not expose a white-paper
  button

## What Just Landed

- a canonical preserved-source lane for recovered Galaga/Galaxian reference
  media:
  `reference-artifacts/preserved-sources/galaga-classic-recovery-2026-05-17/`
- a first representative preserved-source lane for historical Neo-Galaga
  session/video pairs:
  `reference-artifacts/preserved-sources/neo-galaga-history-2026-03-to-2026-04/`
- active docs and one timing-alignment harness updated away from stale
  old-machine absolute paths
- a white-paper review cadence and preserved-source integrity check:
  `white-paper/REVIEW_CADENCE.md` and
  `tools/review/check-reference-source-integrity.js`
- a tighter white-paper draft with stronger provenance and related-work framing
- a refreshed Galaga timing-alignment artifact against the canonical preserved
  stage-reference proxy

## Work Yet To Be Done

1. Publish the current `main` commit to hosted `/dev` so the live dev lane
   catches up to the repo's preserved-source and white-paper cleanup work.
2. Decide whether to promote the white paper beyond `/dev`, especially whether
   `/beta` or `/production` should carry `white-paper.html` next.
3. Update the `sgwoods/public` Aurora project page so the navigation path from
   the top-level public index to the white paper is real end to end.
4. Decide whether the committed `64.76 MB` stage-reference proxy should remain
   in normal Git, move to Git LFS, or move to an external preserved-artifact
   lane with manifest-only tracking in this repo.
5. Decide whether the historical Neo-Galaga archive should remain at the
   current curated 22-pair subset or expand to a larger preserved tier.
6. Continue the next highest-value conformance work: Aurora audio identity,
   challenge-stage set-piece quality, and Galaxy Guardians opening-slice/frame
   parity.

## Practical Reopen Order

1. This note
2. [PLAN.md](PLAN.md)
3. [WHITE_PAPER.md](WHITE_PAPER.md)
4. [PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md](PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md)
5. [GALAXY_GUARDIANS_RESUME_STATE_AND_NEXT_STEPS.md](GALAXY_GUARDIANS_RESUME_STATE_AND_NEXT_STEPS.md)

That sequence gives a fast current-state read without reopening older launch-era
or pre-`1.4.0` assumptions first.
