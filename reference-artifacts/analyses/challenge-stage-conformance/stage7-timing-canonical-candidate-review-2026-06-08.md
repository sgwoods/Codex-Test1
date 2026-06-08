# Stage 7 Timing/Canonical Candidate Review - 2026-06-08

Release family: `1.4.1`

Branch: `codex/macbook-pro-1.4.1-stage7-object-track-keeper`

## Decision

Rejected. No Stage 7 runtime keeper was promoted from this cycle.

The candidate tried to make the restored Stage 7 runtime conform to the new
reference execution gate by adding per-reference playback timing for groups 1,
4, and 5 and aligning Stage 7 groups 2, 4, and 5 to the canonical path-family
labels. After rebuilding and measuring the actual runtime, the candidate
improved shot opportunity but made the strict object-track result worse.

## Measured Runs

All material runs were logged through `npm run harness:measure`.

| Run | Wall | CPU | Stage 7 read |
| --- | ---: | ---: | --- |
| Baseline after precision gate | `23.456s` | `45.93s` | strict `4.2/10`, object-track `4.7/10`, coverage `0.503`, shot opportunity `5.5/10` |
| Candidate after rebuild | `26.587s` | `60.50s` | strict `4.2/10`, object-track `4.6/10`, coverage `0.482`, shot opportunity `5.7/10` |
| Restored baseline after rejection | `25.497s` | `57.00s` | strict `4.2/10`, object-track `4.7/10`, coverage `0.503`, shot opportunity `5.5/10` |
| Restored reference-execution read | `0.265s` | `0.23s` | candidate-ready `true`, promotion-ready `false`, promotion blockers `9` |

One prebuild candidate run was also logged, but it measured the old built
runtime against the edited contract artifact. Treat that run as a procedural
finding only: candidate measurement must rebuild or prove build freshness
before browser-backed analysis.

## Candidate Outcome

Baseline group object-track scores were:

| Group | Baseline |
| ---: | ---: |
| 1 | `3.5/10` |
| 2 | `5.2/10` |
| 3 | `5.0/10` |
| 4 | `5.0/10` |
| 5 | `4.9/10` |

Built candidate group object-track scores were:

| Group | Candidate |
| ---: | ---: |
| 1 | `4.2/10` |
| 2 | `5.2/10` |
| 3 | `5.0/10` |
| 4 | `3.8/10` |
| 5 | `4.8/10` |

The group 1 lift and shot-opportunity lift were not enough to justify the
regressions. Group 4 is the hard blocker: the timing change pushed its visible
window later, dropped the group from `5.0/10` to `3.8/10`, and lowered total
target-video object-track coverage. Group 5 also moved down from `4.9/10` to
`4.8/10`.

Safety stayed clean: no enemy shots, no attack starts, and no ship losses.

## Mechanism Assessment

The reference execution description did its job: it made candidate readiness
separate from runtime promotion and exposed why the current runtime is not yet
promotable. It also made the path-family label conflict inspectable instead of
letting it hide inside broad target-contract scores.

The missing mechanism is a cheaper non-overwriting runtime trial path for
reference playback timing and canonical path-family experiments. Source-first
edits are too blunt here: a candidate can look plausible in the constants, but
the browser-visible object track can drift outside the scoring window.

## Next Gap

Before another source runtime edit, add or reuse a candidate-trial layout path
that can override `groupReferencePaths`, including `playbackScale`, and emit a
non-overwriting Stage 7 trial report. The next candidate should be rejected
early unless it predicts:

- Stage 7 object-track fit stays at or above `4.7/10`;
- group 4 does not fall below `5.0/10`;
- group 5 does not fall below `4.9/10`;
- shot opportunity, spacing, no-shot/no-loss safety, and sprite/render guards
stay green.
