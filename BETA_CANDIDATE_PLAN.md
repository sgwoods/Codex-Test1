# Beta Candidate Plan

This document now records the beta candidate that has been promoted and the
remaining work before that beta becomes production.

## Current Release Position

- hosted `/production`
  - `1.2.3+build.388.sha.13c8421`
- hosted `/beta`
  - `1.2.3-beta.1+build.484.sha.baa1726.beta`
- hosted `/dev`
  - `1.2.3+build.470.sha.e4732eb`
  - still the active forward integration lane

This means:

- hosted `/beta` is now materially ahead of hosted `/production`
- the promoted beta came from the current forward line rather than the older
  shipped beta/prod line
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

## What Still Needs Work Before Hosted `/production`

We have now cut hosted `/beta`.

The remaining question is whether this beta should move to hosted
`/production` soon.

The new movement-analysis work matters here:

- the repo now includes a first committed stage-opening reference alignment
  window
- movement targets are no longer purely provisional; they are now tied to
  that opening-window artifact set
- the direct movement rerun on the current line now scores `9.7/10` against
  those trace-backed targets, versus `8.6/10` for the shipped local baseline

That means movement is no longer the clearest reason to delay production.

The main remaining improvement area before or immediately after production is:

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

## Shipped Beta Candidate Scope

The live hosted `/beta` candidate includes:

- the current hosted `/dev` runtime line
- the merged audio cue alignment improvements
- the merged challenge timing cadence improvements
- the committed reference-video alignment pass and trace-backed movement
  evidence
- the session-timing fix for deterministic/harness runs
- the reference-audio cooldown reset fix
- refreshed release notes and quality scorecard

The live hosted `/beta` candidate should not be blocked by:

- the already-documented marginal `expert -> professional` ordering edge case
- unrelated exploratory diagnostics that are not player-facing

## Required Gate Set Before Hosted `/production`

Before promoting hosted `/production`, the candidate should still be able to
point back to:

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
- production publish preflight from the approved beta artifact set

## Immediate Next Steps

1. approve the current hosted `/beta`
2. stage `dist/production` from that approved beta candidate
3. rerun production preflight
4. publish hosted `/production`
5. continue audio identity polish on top of the new production baseline if
   needed

## Decision Rule

We should promote hosted `/production` when all of the following are true:

- current hosted `/beta` still matches the approved candidate
- cue timing and shell integrity remain green
- the refreshed quality score supports the release story
- the current beta is clearly ahead of the still-live hosted `/production`
- we can explain in a short paragraph why the current beta is ready to become
  the live public release
