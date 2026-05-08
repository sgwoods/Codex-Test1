# Conformance Economics

Generated: `2026-05-08T14:15:27.026Z`

## Problem

Conformance work should not only ask whether a score improved. It should also ask how much local compute, model/API help, GPU/video work, artifact volume, and retry cost were spent to create that improvement.

## Strategy

This artifact joins historical conformance reports with an optional measured-run ledger. Existing reports provide score trends and artifact-volume proxies; future measured runs add wall time, CPU time, memory, resource classes, and declared model/API/GPU usage.

## Current Read

- Metric points scanned: 537
- Score deltas found: 73
- Measured runs in ledger: 87
- Tracked wall time: 2045.248s
- Tracked CPU time: 3181.81s

## Charts

- `score-trends.svg`: conformance trends by score axis.
- `largest-score-deltas.svg`: largest positive and negative score changes in the artifact history.
- `compute-minutes-by-resource.svg`: measured future run time by resource class.

## Interpretation Rules

- Treat artifact volume and run count as compute proxies until a command has a measured ledger entry.
- Separate gameplay-quality gains from measurement-precision gains. A harness that explains a failure better has value even when player-facing conformance has not moved yet.
- Track model/API/GPU work explicitly when Codex or OpenAI APIs design or execute a long-cycle assessment. Do not log secrets or raw prompts in the ledger.
- Prefer high-ROI next steps: large gap, clear measurable target, modest local compute, and reusable harness/platform logic.

## Highest-Value Recent Deltas

- quality:challenge-timing: 4.2 -> 8.4 (+4.2)
- quality:stage1-timing: 2.1 -> 5.6 (+3.5)
- stage4-pressure-collision-diagnostic-coverage: 3.333 -> 6.667 (+3.334)
- stage4-pressure-exact-replay-coverage: 3.333 -> 0 (-3.333)
- stage4-pressure-exact-replay-coverage: 0 -> 3.333 (+3.333)
- stage4-pressure-exact-replay-coverage: 3.333 -> 0 (-3.333)
- stage4-pressure-collision-diagnostic-coverage: 0 -> 3.333 (+3.333)
- quality:stage1-timing: 5.6 -> 8.5 (+2.9)

## Next Instrumentation Step

- Run expensive harnesses through `npm run harness:measure -- --axis <axis> --resource cpu --resource browser -- <command>` so future economics charts can compute cost per score delta instead of relying on artifact-size proxies.

