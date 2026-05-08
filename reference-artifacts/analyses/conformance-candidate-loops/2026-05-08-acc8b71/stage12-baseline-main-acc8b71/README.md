# Stage 12 late reward opportunity

This artifact records a bounded conformance-candidate loop: fixed problem, fixed evaluator set, measured cost, target metrics, guardrails, and a keep/discard decision.

- Candidate: stage12-baseline-main-acc8b71
- Decision: baseline-recorded
- Keep candidate: no
- Reason: No candidate mutation was supplied, so the loop recorded current metric position and evaluator cost without promoting a gameplay change.
- Branch: codex/macbook-pro-stage12-level-arc-conformance
- Commit: acc8b71

## Problem

Stage 12 has measurable late-run pressure, but normal play does not yet surface enough boss/escort reward opportunity to feel like a Galaga-style late-stage learning and scoring window.

## Strategy

Freeze the evaluator, constrain candidate edits to late-stage scheduling and reward surfacing, then keep only candidates that improve reward/opportunity evidence without weakening level-arc or endpoint guardrails.

## Success Measure

A candidate should raise opportunity readiness and reward evidence while preserving level-arc score and deterministic endpoint coverage. Natural late-run play should eventually produce reward opportunity without harness-only setup.

## Target Metrics

| Metric | Before | After | Delta | Required | Pass |
| --- | ---: | ---: | ---: | ---: | --- |
| opportunity.score10 | 4.5 | 4.5 | 0 | 0.2 | no |
| opportunity.meanRewardIndex | 2 | 2 | 0 | 0.2 | no |
| outcome.rewardWindows | 1 | 1 | 0 | 1 | no |

## Guardrails

| Metric | Before | After | Delta | Required | Pass |
| --- | ---: | ---: | ---: | ---: | --- |
| levelArc.score10 | 8.4 | 8.4 | 0 | 0 | yes |
| outcome.endpointWindows | 4 | 4 | 0 | 0 | yes |
| outcome.collisionLossWindows | 3 | 3 | 0 | 0 | yes |

## Evaluators

- evidence-windows: exit 0
- outcome-probes: exit 0
- opportunity-windows: exit 0
- level-arc: exit 0

## Next Step

Use this metric read to make a narrow Stage 12 natural reward candidate, then rerun this same frozen loop.

