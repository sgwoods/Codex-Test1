# Stage 12 late reward opportunity

This artifact records a bounded conformance-candidate loop: fixed problem, fixed evaluator set, measured cost, target metrics, guardrails, and a keep/discard decision.

- Candidate: stage12-natural-reward-window
- Decision: candidate-rejected
- Keep candidate: no
- Reason: One or more target metrics did not improve enough to justify keeping the candidate.
- Branch: codex/macbook-pro-level-arc-long-cycle
- Commit: d8240f0

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
| opportunity.meanRewardIndex | 2.1 | 2.1 | 0 | 0.2 | no |
| outcome.rewardWindows | 1 | 1 | 0 | 1 | no |

## Guardrails

| Metric | Before | After | Delta | Required | Pass |
| --- | ---: | ---: | ---: | ---: | --- |
| levelArc.score10 | 8.4 | 8.4 | 0 | 0 | yes |
| outcome.endpointWindows | 4 | 3 | -1 | 0 | no |
| outcome.collisionLossWindows | 3 | 2 | -1 | 0 | no |

## Evaluators

- outcome-probes: exit 0
- opportunity-windows: exit 0
- level-arc: exit 0

## Next Step

Use this metric read to make a narrow Stage 12 natural reward candidate, then rerun this same frozen loop.

