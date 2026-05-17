# Conformance Economics

Generated: `2026-05-17T13:11:49.922Z`

## Problem

Conformance work should not only ask whether a score improved. It should also ask how much local compute, model/API help, GPU/video work, artifact volume, and retry cost were spent to create that improvement.

## Strategy

This artifact joins historical conformance reports with an optional measured-run ledger. Existing reports provide score trends and artifact-volume proxies; future measured runs add wall time, CPU time, memory, resource classes, and declared model/API/GPU usage.

## Current Read

- Metric points scanned: 1694
- Score deltas found: 153
- Measured runs in ledger: 786
- Tracked wall time: 48513.31s
- Tracked CPU time: 52464.6s
- GPU-equivalent model/Codex runs: 15
- Declared model calls: 0
- Declared model tokens: 0 input / 0 output

## Charts

- `score-trends.svg`: conformance trends by score axis.
- `largest-score-deltas.svg`: largest positive and negative score changes in the artifact history.
- `compute-minutes-by-resource.svg`: measured future run time by resource class.
- `cost-per-positive-score-point.svg`: approximate tracked wall minutes spent per +1 positive score point by investment axis.
- `gpu-equivalent-use-by-purpose.svg`: declared Codex/OpenAI/model/API/GPU work grouped by what it accomplished.
- `cpu-use-by-purpose.svg`: measured local CPU/browser work grouped by what it accomplished.
- `gameplay-improvement-by-project-part.svg`: best-effort grouping of positive score movement by player-facing project area.

## Interpretation Rules

- Treat artifact volume and run count as compute proxies until a command has a measured ledger entry.
- Separate gameplay-quality gains from measurement-precision gains. A harness that explains a failure better has value even when player-facing conformance has not moved yet.
- Track model/API/GPU work explicitly when Codex or OpenAI APIs design or execute a long-cycle assessment. Use the `gpu-equivalent` resource rollup for Codex/model/API work and do not log secrets or raw prompts in the ledger.
- Prefer high-ROI next steps: large gap, clear measurable target, modest local compute, and reusable harness/platform logic.

## Highest-Value Recent Deltas

- quality:challenge-timing: 4.2 -> 8.4 (+4.2)
- quality:stage1-timing: 2.1 -> 5.6 (+3.5)
- stage4-pressure-collision-diagnostic-coverage: 3.333 -> 6.667 (+3.334)
- stage4-pressure-exact-replay-coverage: 3.333 -> 0 (-3.333)
- stage4-pressure-exact-replay-coverage: 0 -> 3.333 (+3.333)
- stage4-pressure-exact-replay-coverage: 3.333 -> 0 (-3.333)
- stage4-pressure-collision-diagnostic-coverage: 0 -> 3.333 (+3.333)
- stage-signature-distance: 6.7 -> 10 (+3.3)

## Relative Cost To Move Metrics

| Axis | Runs | Wall min | Positive score gain | Wall min / +1 score | Attribution |
| --- | ---: | ---: | ---: | ---: | --- |
| formation-boss-grammar | 4 | 0.139 | 2.5 | 0.06 | tracked-spend-and-score-movement |
| overall-quality | 2 | 2.178 | 2.8 | 0.78 | tracked-spend-and-score-movement |
| stage4-pressure | 28 | 12.824 | 10 | 1.28 | tracked-spend-and-score-movement |
| level-arc | 96 | 8.742 | 3.6 | 2.43 | tracked-spend-and-score-movement |
| audio | 309 | 253.734 | 6.2 | 40.92 | tracked-spend-and-score-movement |
| movement | 0 | 0 | 8.2 | n/a | historical-score-movement-without-tracked-spend |
| challenge-timing | 0 | 0 | 6.5 | n/a | historical-score-movement-without-tracked-spend |
| stage1-timing | 0 | 0 | 6.4 | n/a | historical-score-movement-without-tracked-spend |
| stage-signature-distance | 0 | 0 | 4.3 | n/a | historical-score-movement-without-tracked-spend |
| movement-grammar-expansion | 0 | 0 | 3.4 | n/a | historical-score-movement-without-tracked-spend |

## Next Instrumentation Step

- Run expensive harnesses through `npm run harness:measure -- --axis <axis> --resource cpu --resource browser -- <command>` so future economics charts can compute cost per score delta instead of relying on artifact-size proxies.
- Log Codex/model/API-only planning or review work with `npm run harness:measure -- --manual --axis <axis> --resource codex --model-provider openai --model <model> --model-minutes <minutes> --notes "<short note>"`. Optional quota snapshots from the app usage screen can be stored with `--codex-usage-5h-left-percent`, `--codex-usage-week-left-percent`, `--codex-model-5h-left-percent`, and `--codex-model-week-left-percent`.
