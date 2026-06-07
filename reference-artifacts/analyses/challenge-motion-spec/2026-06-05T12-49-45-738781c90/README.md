# Aurora Challenge Motion Spec

Generated: 2026-06-05T12:49:45.507Z
Commit: 738781c90
Branch: codex/aurora-challenge-movement-grammar

## Scope

This is the first narrow runtime-facing movement grammar artifact. It converts Challenge 2 / internal stage marker 7 from the broader movement grammar into an explicit phase-based motion spec.

The spec is not a runtime promotion by itself. It is the contract that runtime code, candidate sweeps, and documentation should converge on.

| Group | Intent | Path Hint | Spawn | Track | Arc | Drop | Lower Bias | Reference |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | mixed-crossing-sweep | cross-sweep | 0s | 1.88s | 1.91 | 1.17 | 188 | target-track-10 |
| 2 | mixed-hook-arrival | hook-arc | 2.88s | 2.63s | 1.24 | 1.56 | 0 | target-track-66 |
| 3 | mixed-hook-arrival | hook-arc | 4.25s | 0.75s | 1.07 | 1.07 | 188 | target-track-71 |
| 4 | mixed-crossing-sweep | cross-sweep | 7.13s | 2s | 2.21 | 1.61 | 57 | target-track-110 |
| 5 | mixed-hook-arrival | hook-arc | 13.38s | 2.5s | 1.25 | 1.59 | 31 | target-track-142 |
