# Conformance Economics

Generated: `2026-05-08T17:14:31.280Z`

## Problem

Conformance work should not only ask whether a score improved. It should also ask how much local compute, model/API help, GPU/video work, artifact volume, and retry cost were spent to create that improvement.

## Strategy

This artifact joins historical conformance reports with an optional measured-run ledger. Existing reports provide score trends and artifact-volume proxies; future measured runs add wall time, CPU time, memory, resource classes, and declared model/API/GPU usage.

## Current Read

- Metric points scanned: 589
- Score deltas found: 80
- Measured runs in ledger: 96
- Tracked wall time: 2276.983s
- Tracked CPU time: 3543.71s
- GPU-equivalent model/Codex runs: 2
- Declared model calls: 0
- Declared model tokens: 0 input / 0 output

## Charts

- `score-trends.svg`: conformance trends by score axis.
- `largest-score-deltas.svg`: largest positive and negative score changes in the artifact history.
- `compute-minutes-by-resource.svg`: measured future run time by resource class.

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

## Next Instrumentation Step

- Run expensive harnesses through `npm run harness:measure -- --axis <axis> --resource cpu --resource browser -- <command>` so future economics charts can compute cost per score delta instead of relying on artifact-size proxies.
- Log Codex/model/API-only planning or review work with `npm run harness:measure -- --manual --axis <axis> --resource codex --model-provider openai --model <model> --model-minutes <minutes> --notes "<short note>"`. Optional quota snapshots from the app usage screen can be stored with `--codex-usage-5h-left-percent`, `--codex-usage-week-left-percent`, `--codex-model-5h-left-percent`, and `--codex-model-week-left-percent`.

