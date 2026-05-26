# Galaxy Guardians Other-Machine Beta Integration Plan

Updated: May 26, 2026

## Purpose

This note captures the next deliberate advancement path after the current
opening-slice frame-reference pass is committed.

It exists to keep the next merge with the other machine evidence-backed and to
make the `/dev` to `/beta` path explicit instead of reconstructing it from
multiple Galaxy and release-planning documents.

Use this together with:

- [GALAXY_GUARDIANS_RESUME_STATE_AND_NEXT_STEPS.md](GALAXY_GUARDIANS_RESUME_STATE_AND_NEXT_STEPS.md)
- [GALAXY_GUARDIANS_OPENING_SLICE_BASELINE.md](GALAXY_GUARDIANS_OPENING_SLICE_BASELINE.md)
- [GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md](GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md)
- [GALAXY_GUARDIANS_PLAYABLE_0_1_BRANCH_PLAN.md](GALAXY_GUARDIANS_PLAYABLE_0_1_BRANCH_PLAN.md)

## Current Checked Base

This repo-side pass now gives `main` a cleaner opening authority layer for
`Galaxy Guardians`:

- promoted opening frame-window authority in
  `opening-slice-frame-reference-0.1.json`
- a dedicated harness for that promoted opening frame-reference artifact
- updated opening baseline, resume note, stage-arc plan, and project-guide copy
  that now treat the opening mission, score-table, and wrap-return review as
  concrete promoted windows rather than only broad source manifests
- an updated first-class-conformance gate that now requires the opening
  frame-reference check as part of the maintained Guardians spine

That means the local repo is now better prepared to absorb the other machine's
Galaxian-family work without losing the opening-slice evidence structure that
already landed here.

## What We Expect From The Other Machine

Do not assume exact file contents before inspection.

The likely incoming value is in one or more of these buckets:

- deeper Galaxian-family conformance and pacing work
- additional evidence, crops, frame windows, or motion analysis
- stronger opening/runtime tuning for `WAIT`, score-table, starfield, or
  top-reentry behavior
- playable-0.1/game-owned identity/platform-separation work
- non-overlapping Galaxy harnesses or review docs

The rule is still the same:

- inspect first
- preserve provenance
- merge by evidence, not memory

## Integration Principles

1. Preserve the current opening frame-reference authority.
   The other machine should extend or sharpen it, not silently replace it with
   untracked judgement.
2. Land non-overlapping evidence and harness work before retuning runtime copy
   or visuals.
3. Keep docs, artifacts, and harnesses together when merging a concept.
   If a new surface becomes important, it should not live only in code.
4. Prefer the stronger evidence source when two branches disagree.
   If one side is source-backed and the other is only tuned-by-feel, keep the
   source-backed spine.
5. Keep `Galaxy Guardians` honest in public framing.
   `/beta` should carry a coherent second-game review bundle, not a half-merged
   stack of promising fragments.

## Recommended Merge Order

1. Commit and push the current repo-side opening frame-reference work so it
   becomes the stable merge base.
2. Inventory the other machine before editing:
   - active branch name
   - changed files
   - related harnesses
   - whether the work is evidence-first, runtime-only, or mixed
3. Import non-overlapping Galaxy evidence, harness, and doc additions first.
4. Reconcile overlaps in this order:
   - source artifacts and manifests
   - harnesses and scoring contracts
   - runtime tuning and visuals
   - human-readable docs and release framing
5. Re-run the focused Guardians spine after every meaningful merge tranche.
6. Refresh the normal build and hosted doc surfaces once the merged Galaxy
   story is coherent.
7. Push the combined result to hosted `/dev` before asking for `/beta`.
8. Only after the `/dev` slice is reviewed and readable should the next beta
   candidate be promoted.

## Required Check Spine After Merge

The minimum confidence spine for the next other-machine merge is:

```bash
npm run harness:check:galaxy-guardians-opening-slice-source-baseline
npm run harness:check:galaxy-guardians-opening-slice-frame-reference
npm run harness:check:galaxy-guardians-opening-slice-baseline
npm run harness:check:galaxy-guardians-first-class-conformance
npm run build
```

If the other machine also changes gameplay/runtime identity or platform-owned
second-game behavior, add:

```bash
npm run harness:check:galaxy-guardians-game-owned-identity
npm run harness:check:galaxy-guardians-one-level-completion
npm run harness:check:galaxy-guardians-playable-preview
npm run harness:check:gameplay-adapter-boundaries
```

If motion/pacing work lands, add:

```bash
npm run harness:check:galaxy-guardians-movement-pacing
npm run harness:check:galaxy-guardians-stage-rank-pressure
npm run harness:check:galaxy-guardians-runtime-reference-movement
```

## `/dev` Then `/beta`

The next honest hosted path should be:

1. merge the other-machine Guardians tranche into `main`
2. rerun the relevant Guardians spine and `npm run build`
3. run `npm run publish:check:dev`
4. publish `/dev`
5. review the hosted Guardians slice as a whole:
   - opening mission and `WAIT` read
   - score-table authority
   - starfield/top-reentry continuity
   - hit/explosion readability
   - game-owned identity and platform-frame fit if touched
6. only then run `npm run publish:check:beta`
7. promote/publish the next `/beta` candidate

The beta question should be:

- does the second-game story now hang together as one coherent review bundle?

It should not be:

- did we accumulate enough isolated improvements to justify pushing anyway?

## The Best Next Beta Bundle

The strongest next `Galaxy Guardians`-driven beta bundle would combine:

- the already-landed opening frame-reference authority from this machine
- stronger measured starfield-motion and top-reentry targets
- tighter runtime `WAIT` and score-table layout against the promoted Matt
  Hawkins windows
- better frame-backed hit/explosion authority
- any other-machine playable-0.1 or game-owned identity improvements that make
  Platinum feel more honestly multi-game

That bundle would be meaningfully stronger than promoting either the current
repo-side opening work alone or the other machine's work alone.

## What Not To Do

- do not publish `/beta` directly from partially reviewed merge conflict
  resolution
- do not let stronger source-backed work get flattened back into plan prose
- do not overclaim multi-stage/public depth if the hosted slice is still a
  one-level review surface
- do not replace a game-owned evidence path with a generic second-game story
  that is easier to narrate but harder to verify

## Short Reopen Order

When the other machine work is ready to integrate, reopen in this order:

1. this note
2. [GALAXY_GUARDIANS_RESUME_STATE_AND_NEXT_STEPS.md](GALAXY_GUARDIANS_RESUME_STATE_AND_NEXT_STEPS.md)
3. the other machine branch/file inventory
4. [GALAXY_GUARDIANS_OPENING_SLICE_BASELINE.md](GALAXY_GUARDIANS_OPENING_SLICE_BASELINE.md)
5. [GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md](GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md)

That keeps the merge grounded in the current opening authority and the actual
beta path instead of jumping straight into file conflicts.
