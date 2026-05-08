# Conformance Economics

Generated: `2026-05-08T17:44:50.691Z`

## Problem

Conformance work should not only ask whether a score improved. It should also ask how much local compute, model/API help, GPU/video work, artifact volume, and retry cost were spent to create that improvement.

## Strategy

This artifact joins historical conformance reports with an optional measured-run ledger. Existing reports provide score trends and artifact-volume proxies; future measured runs add wall time, CPU time, memory, resource classes, and declared model/API/GPU usage.

## Current Read

- Metric points scanned: 589
- Score deltas found: 80
- Measured runs in ledger: 103
- Tracked wall time: 2345.619s
- Tracked CPU time: 3655.7s
- GPU-equivalent model/Codex runs: 7
- Declared model calls: 0
- Declared model tokens: 0 input / 0 output

## Charts

- `score-trends.svg`: conformance trends by score axis.
- `largest-score-deltas.svg`: largest positive and negative score changes in the artifact history.
- `compute-minutes-by-resource.svg`: measured future run time by resource class.
- `cost-per-positive-score-point.svg`: approximate tracked wall minutes spent per +1 positive score point by investment axis.

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
- quality:stage1-timing: 5.6 -> 8.5 (+2.9)

## Relative Cost To Move Metrics

| Axis | Runs | Wall min | Positive score gain | Wall min / +1 score | Attribution |
| --- | ---: | ---: | ---: | ---: | --- |
| stage4-pressure | 28 | 12.824 | 10 | 1.28 | tracked-spend-and-score-movement |
| level-arc | 39 | 3.189 | 2.4 | 1.33 | tracked-spend-and-score-movement |
| audio | 31 | 19.831 | 4 | 4.96 | tracked-spend-and-score-movement |
| movement | 0 | 0 | 6.8 | n/a | historical-score-movement-without-tracked-spend |
| stage1-timing | 0 | 0 | 6.4 | n/a | historical-score-movement-without-tracked-spend |
| challenge-timing | 0 | 0 | 5.7 | n/a | historical-score-movement-without-tracked-spend |
| long-run-non-repetition | 0 | 0 | 2.5 | n/a | historical-score-movement-without-tracked-spend |
| overall-quality | 0 | 0 | 2.3 | n/a | historical-score-movement-without-tracked-spend |
| movement-grammar-expansion | 0 | 0 | 2.1 | n/a | historical-score-movement-without-tracked-spend |
| stage-distinctiveness | 0 | 0 | 1.7 | n/a | historical-score-movement-without-tracked-spend |

## Next Instrumentation Step

- Run expensive harnesses through `npm run harness:measure -- --axis <axis> --resource cpu --resource browser -- <command>` so future economics charts can compute cost per score delta instead of relying on artifact-size proxies.
- Log Codex/model/API-only planning or review work with `npm run harness:measure -- --manual --axis <axis> --resource codex --model-provider openai --model <model> --model-minutes <minutes> --notes "<short note>"`. Optional quota snapshots from the app usage screen can be stored with `--codex-usage-5h-left-percent`, `--codex-usage-week-left-percent`, `--codex-model-5h-left-percent`, and `--codex-model-week-left-percent`.

