# Next Hosted Dev Candidate Proposal

This document proposes the smallest credible next hosted `/dev` candidate that
would improve on the current live hosted `/dev` lane at `main@9d7b2a8`.

It is intentionally narrower than the full branch history.

The goal is to move hosted `/dev` forward only when we can explain:

- what is better
- why it is better
- what evidence supports it
- what remains deferred

## Current Live Comparison Point

Current hosted `/dev`:

- commit `9d7b2a8`
- label `1.2.3+build.432.sha.9d7b2a8`
- published `Apr 12 2026, 10:36 AM EDT`

This is the bar the next hosted `/dev` must exceed.

## Proposed Candidate Scope

### Include

#### 1. Recovered combat hit resolution improvement

Files:

- `/Users/steven/Documents/Codex-Test1/src/js/05-player-combat.js`

Why include it:

- this is a real runtime-visible gameplay improvement
- it resolves player bullet hits immediately at spawn/update boundaries rather
  than waiting for the next broad step
- it reduces missed close-range conversions and makes combat response more
  trustworthy

Why it beats current hosted `/dev`:

- current hosted `/dev` does not include the recovered immediate hit-resolution
  logic
- this is a direct gameplay quality improvement, not just internal tooling

#### 2. Recovered stage-1 dive hitbox tuning

Files:

- `/Users/steven/Documents/Codex-Test1/src/js/21-render-board.js`

Why include it:

- this is a narrow runtime-visible tuning change
- it adjusts stage-1 dive hitbox scaling for certain enemy dive states

Why it beats current hosted `/dev`:

- current hosted `/dev` does not include this recovered tuning
- it is a contained feel/correctness improvement rather than a broad retune

#### 3. Expert stage-2 safety refinement

Files:

- `/Users/steven/Documents/Codex-Test1/src/js/05-player-flow.js`

Why include it:

- this fixes a previously measured progression problem where `advanced`
  outperformed `expert`
- it adds early-stage lower-field dive avoidance and emergency spacing logic
  for the `expert` harness persona

Why it beats current hosted `/dev`:

- current hosted `/dev` predates that repair
- this is supported by explicit harness evidence and improves the skill ladder

### Include As Supporting Infrastructure

These items should travel with the candidate branch and release process, but
they are not themselves the user-facing reason to replace hosted `/dev`.

- deterministic `close-shot-hit` repair
- correspondence framework and correspondence harnesses
- persona progression reporting improvements
- focused expert/professional diagnostics
- developer-machine and release-process docs

### Defer

Do not make these part of the hosted `/dev` justification:

- the remaining `expert -> professional` marginal seed-`51101` issue
- any further narrow professional tuning until it becomes less marginal
- purely documentary/process work by itself

## Candidate Value Statement

The proposed next hosted `/dev` should be described as:

- a gameplay-correctness and confidence-improvement candidate
- not a broad milestone or release-family reset

Its core value is:

1. better close-range shot resolution
2. better stage-1 dive hitbox behavior
3. repaired expert progression safety in stage 2
4. much stronger confidence and diagnostic infrastructure behind the lane

## Required Trusted Gate Set Before Replacing Hosted `/dev`

### Build And Basic Runtime

- `npm run build`
- local candidate boot and manual smoke on `localhost`

### Gameplay / Application Gates

- targeted validation for recovered combat behavior
- targeted validation for stage-1 dive hitbox feel
- `npm run harness:check:persona-stage2-safety`
- `npm run harness:check:persona-progression-correspondence`

### Boundary / Containment

- at least one boundary smoke such as:
  - `node tools/harness/check-platinum-pack-boot.js`
  - or the current preferred equivalent used by the team

### Release / Lane Hygiene

- publish preflight
- metadata verification
- live verify after publish

### Manual Review

Manual comparison against current hosted `/dev` should explicitly review:

- close-range shot feel
- stage-1 dive collision feel
- whether the candidate still feels clearly stable as an integration lane

See also:

- `/Users/steven/Documents/Codex-Test1/DEV_CANDIDATE_REVIEW_CHECKLIST.md`

## Promotion Decision Rule

Publish a new hosted `/dev` only if:

1. the candidate passes the gate set above
2. the manual comparison says it is meaningfully better than current hosted
   `/dev`
3. no new issue appears serious enough that we would immediately hesitate to
   shape it toward hosted `/beta`

If those conditions are not met:

- do not replace hosted `/dev`
- continue iterating locally

## Next Step After Candidate Confirmation

If this candidate proves itself locally, the next sequence should be:

1. publish hosted `/dev`
2. verify live hosted `/dev`
3. re-assess whether the lane is stable enough to begin shaping a new hosted
   `/beta`

That keeps release movement aligned with the new professionalized lane model
instead of letting `/dev` drift by accident.
