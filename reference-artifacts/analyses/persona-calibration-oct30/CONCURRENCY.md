# Bounded Browser Concurrency

October 30, 2026. G1.3 exploratory capacity measurement, not a release gate.

Frozen clean build: `1.4.2.1+build.1257.sha.cb70121e`.
Source: `cb70121e9c5f29c483eec54f17b44e115a87c55f`.
Chromium: `145.0.7632.6`. No gameplay or persona changes.

## Method And Results

Three rounds each execute two identical lifecycle jobs sequentially and then
with two workers, reversing mode order in round two. Each job has an independent
browser, ephemeral loopback server, browser contexts and write-once output path.
The frozen input is shared read-only by convention and its inventory is checked
before/after every job. External requests and account writes are blocked.

| Round | Sequential pair | Two-worker pair | Speedup |
| --- | ---: | ---: | ---: |
| 1 | 22.824s | 14.826s | 1.54x |
| 2 | 22.939s | 13.838s | 1.66x |
| 3 | 24.705s | 14.296s | 1.73x |

Median pair times: 22.939s versus 14.296s, 1.60x throughput and 37.7% less
wall time. Individual jobs slow under contention; throughput, not latency, wins.
All12 jobs pass: 228 lifecycle cases, 96 within-job comparisons and 24 audio
decodes per job. All jobs report successful browser/server teardown. Bundle hashes
and the recorded mechanical projection across16 persona/mode/input cases match
across all12 jobs. Equality covers two mechanical checkpoints per gameplay case,
not lifecycle traces, later restoration/manual-input checkpoints or all runtime
state. Lifecycle assertions pass individually. Expected console errors from
blocked external video resources remain recorded.

Private method: `private-artifacts/p2-clock-oct30/benchmark-concurrency.js`.
Receipts and logs: `private-artifacts/p2-clock-oct30/concurrency-v1/`.
Input/method hashes and timings are retained in its `summary.json`; the delegated
lifecycle method is SHA256 `646af21ef0b78adbce3ab42b689fa84ca3a582cbb86adf72c31e5c264724699e`.
Bundle inventory digest: `9165cba139426461dc77ae8317169e6474dc5db9c6b59d6aaf6abbfe6ab9a6e2`.

## Scope Of Recommendation

Independent read-only review by Kepler verified aggregate receipts, hashes and
these limitations. Total serial batch time70.467s versus parallel42.960s gives
1.640x aggregate throughput; the median-pair metric above is intentionally separate.

Provisionally allow at most two supervised concurrent jobs for this bounded lifecycle
workload on this machine, with isolated outputs and no concurrent rebuilds.
Keep full-career simulations sequential until separately measured. Do not infer
multi-machine capacity, four-worker safety, human-play latency or audio quality.
Three local rounds are a pilot, not statistical confidence or a sustained soak.
CPU/RSS and process-tree leak monitoring were not measured. Normal cleanup passed,
but the benchmark launcher has no outer child deadline or failure-path sibling
cancellation; production orchestration must use managed-child containment before
generalizing this private success-path experiment. No permanent scheduler changed.

## Managed Follow-Through

Six additional paired rounds (24 jobs) using local managed cancellation passed:
456 cases, 192 comparisons and 576 audio decodes. Aggregate times were135.062s
serial versus81.248s parallel: 1.662x throughput,39.8% less batch wall time.
Sampled peak ancestry-tree RSS was1550.7MiB serial versus2986.5MiB parallel.
There were267 serial and159 parallel samples at nominal500ms intervals.
Receipts: `private-artifacts/p2-clock-oct30/concurrency-managed-v1/`.
Measured supervisor/method copies are retained in that directory.

Resource figures include supervisor/sampler overhead, miss transient or reparented
processes and are not physical-memory pressure measurements. ps CPU percentages
are lifetime estimates, not interval utilization. Read-only review and brief
simulation/docs checks overlapped early measurements; this was not an idle host.

Local source adds targeted cancellation to managedNode and managedBatch, which
cancels siblings after a failure and waits for every result. Independent review
found a caller-signal override; it was repaired by composing caller/internal
signals. Thirteen supervisor tests pass, including real hanging-sibling shutdown,
pre-abort, rejected runner, listener cleanup and inherited timeout tests.
The six-round measurements precede that caller-signal repair; no caller signal
was supplied there. A separate v2 confirmation records the new supervisor hash
and detailed supervision receipts before attempting to read worker output.
That v2 confirmation passed all four jobs (76 cases/32 comparisons):21.999s
serial versus13.210s parallel. It is a confirmation, not another six-round soak.

General unattended acceptance remains open: an unkillable child or inherited
open pipe may prevent close even after the cleanup deadline. Normally exiting
failed workers are not guaranteed to leave no descendants. Snapshot supervision
cannot establish containment of unobserved detached descendants. Keep cap2
supervised for the measured workload; no full-career capacity claim or deployment.
