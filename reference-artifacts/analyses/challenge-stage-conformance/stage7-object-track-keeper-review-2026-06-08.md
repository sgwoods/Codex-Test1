# Stage 7 Object-Track Keeper Review - 2026-06-08

Release family: `1.4.1`

Branch: `codex/macbook-pro-1.4.1-stage7-object-track-keeper`

## Decision

Rejected. No Stage 7 runtime keeper was promoted from this cycle.

The cycle used measured reference analysis first and tested two narrow runtime
candidates against the strict challenge-stage analyzer. Both candidates left
Stage 7 direct Galaga target-video object-track fit at `4.7/10`. Candidate two
improved group 4 from `5.0` to `5.2`, but regressed group 5 from `4.9` to
`4.4`, lowered direct object-track coverage from `0.503` to `0.496`, and did
not reduce the core path-length mismatch enough to justify a player-visible
promotion.

The runtime edits were reverted. The current source remains at the restored
baseline: Stage 7 conformance `4.2/10`, challenge-stage aggregate `4.3/10`,
movement `4.4/10`, target-contract fit `7.2/10`, direct object-track fit
`4.7/10`, and object-track coverage `0.503`.

## Measured Runs

All runs were logged through `npm run harness:measure` with axis
`challenge-stage` and resources `cpu,browser`.

| Run | Wall | CPU | Artifact delta | Read |
| --- | ---: | ---: | ---: | --- |
| Baseline before candidate | `28.482s` | `64.98s` | `+2360366` bytes | Stage 7 object-track `4.7/10`, coverage `0.503` |
| Candidate one strict analyzer | `25.503s` | `56.36s` | `-4317` bytes | Object-track stayed `4.7/10`; group 1 y-range moved slightly but path length worsened |
| Candidate two strict analyzer | `26.020s` | `59.19s` | `+8128` bytes | Object-track stayed `4.7/10`; group 4 improved, group 5 regressed |
| Restored-baseline strict analyzer | `27.173s` | `63.12s` | `-7715` bytes | Source restored to baseline object-track `4.7/10`, coverage `0.503` |

Total measured spend for the cycle: `107.178s` wall and `243.65s` CPU.

## Targeted Findings

- Group 1 baseline is already close on horizontal range (`0.628` runtime vs
  `0.6166` target) and lower-field share (`1.0` vs `0.9815`), but the path
  length row is structurally weak (`0.508` runtime vs `0.1176` target) and
  turn/reversal counts are under target.
- Group 2 remains the early lower-field overstay row: lower-field share is
  `0.667` runtime vs `0.3122` target after restoration.
- Group 4 candidate two demonstrated that offsets can improve the group score
  locally (`5.0` to `5.2`), but it still left path length at zero fit and did
  not create a broad keeper.
- Group 5 is fragile: candidate two reduced its score from `4.9` to `4.4`,
  which blocks promotion even though the change was intended to sharpen the
  late boss-led loop.

## Mechanism Assessment

The current long-cycle process worked: it forced baseline measurement,
economics logging, small candidate review, and rejection instead of accepting
a subjective tuning change.

The current Stage 7 target mechanism is good enough to expose the gap and
prevent bad keepers, but not yet good enough to make simple numeric runtime
tuning easy. The strict direct target-video row compares one runtime
object-track candidate to group-level target summaries that combine broad
group x-range with short per-object path length. That is useful as a conservative
release gate, but it can make the requested "wide range plus much shorter path"
target internally hard to satisfy through offsets alone.

## Next Gap

The next Stage 7 quality pass should not start with another broad retune.
It should first improve the candidate mechanism:

1. derive or select per-object target tracks for groups 1, 4, and 5 instead of
   relying only on group-level aggregate object-track summaries;
2. add a focused Stage 7 before/after artifact that compares baseline and
   candidate group vectors without overwriting the committed `latest` report;
3. test one timing-aware runtime candidate that limits late exit travel and
   preserves scoreable route spacing before touching visual novelty or global
   challenge timing.

Promotion remains blocked until a candidate improves the targeted Stage 7
object-track rows without regressing group 5, spacing, no-shot/no-loss safety,
or sprite/render guardrails.
