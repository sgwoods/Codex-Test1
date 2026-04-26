# Aurora Level Expansion Evidence Cycle

Status: `seed-plan-only`

This directory is the artifact home for Aurora's first level-by-level expansion
evidence cycle. It intentionally starts as a plan so the next long run can
generate artifacts into a stable location.

## Planned Windows

1. `stage-1-baseline`
2. `challenge-stage-candidate`
3. `mid-run-pressure`
4. `late-run-cleanup-or-failure`

## Expected Outputs

Each promoted window should eventually contain:

- source manifest
- contact sheet
- still frames
- waveform if audio timing matters
- movement / pressure trace
- semantic event scaffold
- reviewed observed-event log
- stage-slice note

## Command Shape

The intended reusable entry point is:

```sh
npm run harness:cycle:classic-arcade-reference -- --plan reference-artifacts/analyses/aurora-level-expansion-cycle/aurora-four-window-cycle.plan.json
```

The first generated run should keep the resulting files under this directory,
then link promoted windows back to `AURORA_LEVEL_EXPANSION_EVIDENCE_CYCLE_PLAN.md`.
