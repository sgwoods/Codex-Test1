# Beta Candidate Plan

This plan defines the next serious hosted `/beta` candidate after the hosted
`/dev` refresh to `1.2.3+build.470.sha.e4732eb`.

## Current Release Position

- hosted `/production`
  - `1.2.3+build.388.sha.13c8421`
- hosted `/beta`
  - `1.2.3-beta.1+build.388.sha.13c8421.beta`
- hosted `/dev`
  - `1.2.3+build.470.sha.e4732eb`
  - refreshed from the forward integration line on April 23, 2026

This means:

- `/dev` is now materially ahead of both hosted `/beta` and hosted
  `/production`
- the next hosted `/beta` should come from the current forward line, not from
  the older shipped beta/prod line
- the next serious milestone still looks like a `MINOR` release family, likely
  `1.3.0`

## What Is Already Strong Enough

These areas are now in much better shape on the forward line:

- close-shot responsiveness
- stage-2 expert safety guardrail
- shell/panel surface stability
- release and machine-setup documentation
- quality score model and release scorecard
- audio cue correspondence

The audio work is especially important:

- the dedicated audio cue correspondence check is now green at `9/9`
- challenge entry timing is effectively on target
- challenge result and next-stage cue timing is effectively on target
- stage-1 pulse is now scored from `formationArrival`, which is the better
  runtime anchor for current Aurora reference-audio behavior

## What Still Needs Work Before Hosted `/beta`

We should not cut hosted `/beta` immediately after the `/dev` refresh.

The next `/beta` candidate should first include at least one more focused
fidelity pass in these areas:

1. broader stage-1 timing fidelity
2. broader challenge-stage timing fidelity

The quality score and scorecard are now refreshed on the current forward line:

- overall quality score: `7.5/10`
- strongest category: combat responsiveness
- weakest category: stage-1 opening timing fidelity

These are still the release-shaping gaps:

- stage-1 opening timing fidelity remains the weakest scored category
- challenge-stage timing still needs the broader non-audio timing family
  refreshed, even though cue timing is now much better
- the refreshed quality score confirms that the biggest remaining release-shaping
  gaps are stage-1 timing, challenge timing, and broader audio identity polish

## Proposed Beta Candidate Scope

The next hosted `/beta` candidate should include:

- the current hosted `/dev` runtime line
- the merged audio cue alignment improvements
- the session-timing fix for deterministic/harness runs
- the reference-audio cooldown reset fix
- refreshed release notes and quality scorecard

The next hosted `/beta` candidate should not be blocked by:

- the already-documented marginal `expert -> professional` ordering edge case
- unrelated exploratory diagnostics that are not player-facing

## Required Gate Set Before Hosted `/beta`

Before promoting hosted `/beta`, the candidate should pass:

- `npm run build`
- `npm run harness:check:close-shot-hit`
- `npm run harness:check:dev-candidate-surfaces`
- `npm run harness:check:audio-cue-alignment`
- refreshed quality score run
- manual comparison of current `localhost` or candidate build against hosted
  `/dev`

And for the release ceremony:

- release notes refreshed
- quality scorecard refreshed
- build metadata and dashboard refreshed
- hosted `/beta` publish verification
- explicit `/beta` approval before any `/production` move

## Immediate Next Steps

1. do one focused broader timing/fidelity pass beyond cue alignment
2. rerun the trusted gate set
3. refresh the release-facing candidate delta in quality-score terms
4. write the candidate delta in release-facing terms
5. promote hosted `/beta` only when the candidate is clearly better than the
   current hosted `/beta` and defensible as the next stable public candidate

## Decision Rule

We should promote hosted `/beta` when all of the following are true:

- current hosted `/dev` feels stable
- cue timing and shell integrity remain green
- the refreshed quality score supports the release story
- the next candidate is clearly ahead of hosted `/beta` / `/production`
- we can explain in a short paragraph what makes this candidate the right next
  public release
