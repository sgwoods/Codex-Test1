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
- reference-video alignment scaffolding for trace-backed movement work

The audio work is especially important:

- the dedicated audio cue correspondence check is now green at `9/9`
- challenge entry timing is effectively on target
- challenge result and next-stage cue timing is effectively on target
- stage-1 pulse is now scored from `formationArrival`, which is the better
  runtime anchor for current Aurora reference-audio behavior
- the broader stage-1 opening correspondence report is now `4/4` green after
  the convoy-pulse anchor refinement
- the refreshed audio theme comparison on the current branch lifts the audio
  category to a working `7.8/10`, which means audio identity is no longer one
  of the weakest release-shaping areas

## What Still Needs Work Before Hosted `/beta`

We should not cut hosted `/beta` immediately after the `/dev` refresh.

The branch is now closer to `/beta` than it was at the last `/dev` refresh.

The new movement-analysis work matters here:

- the repo now includes a first committed stage-opening reference alignment
  window
- movement targets are no longer purely provisional; they are now tied to
  that opening-window artifact set
- the direct movement rerun on the current line now scores `9.7/10` against
  those trace-backed targets, versus `8.6/10` for the shipped local baseline

That means movement is no longer the clearest reason to delay `/beta`.

The main remaining improvement area before or immediately after the next
`/beta` candidate is:

1. audio identity polish beyond cue alignment

The quality score and scorecard are now refreshed on the current forward line:

- overall quality score: `8.8/10`
- strongest category: combat responsiveness
- weakest category in the bundled report: audio

These are still the release-shaping gaps:

- broader audio identity polish should continue, but it no longer blocks a
  serious public candidate by itself
- the bundled quality report still reads audio as the weakest current category
  at `6.1/10`
- movement now reads as `8.4/10` in the refreshed bundled score, which is a
  material improvement over the older provisional movement read
- the refreshed quality score now shows challenge timing as a strength rather
  than one of the main blocking gaps
- stage-1 opening timing is no longer one of the main blockers after the
  convoy-pulse refinement

## Proposed Beta Candidate Scope

The next hosted `/beta` candidate should include:

- the current hosted `/dev` runtime line
- the merged audio cue alignment improvements
- the merged challenge timing cadence improvements
- the committed reference-video alignment pass and trace-backed movement
  evidence
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

1. refresh the release-facing candidate delta using the current movement and
   quality artifacts
2. do a final manual compare of the local candidate against hosted `/dev`
3. refresh release notes and candidate summary docs
4. promote hosted `/beta` when that package is staged and the trusted gates are
   still green
5. continue audio identity polish on top of the new `/beta` line if needed

## Decision Rule

We should promote hosted `/beta` when all of the following are true:

- current hosted `/dev` feels stable
- cue timing and shell integrity remain green
- the refreshed quality score supports the release story
- the next candidate is clearly ahead of hosted `/beta` / `/production`
- we can explain in a short paragraph what makes this candidate the right next
  public release
