# Stage 7 Reference Execution Description Analysis

Generated: 2026-06-08T13:22:41.210Z
Commit: 82b9d5d8d
Branch: codex/macbook-pro-1.4.1-stage7-object-track-keeper

## Decision

Measurement keeper: accept-measurement-keeper

Runtime candidate recommendation: reference-description-needs-precision-before-runtime-candidate

The Stage 7 execution description is useful and repeatable, but it exposes target precision issues that should be resolved before the next runtime candidate.

## Runtime Deviation Rows

| Group | Semantic family | Object-track family | Runtime family | Aggregate score | Primary score | Path ratio | Lower-field delta | Issues |
| ---: | --- | --- | --- | ---: | ---: | ---: | ---: | --- |
| 1 | cross-sweep | cross-sweep | cross-sweep | 4.3 | 2.5 | 5.36 | 0.018 | aggregate object-track score below 5.0<br>primary object-track score below 5.0<br>aggregate path-length ratio above 3x target |
| 2 | cross-sweep | hook-arc | hook-arc | 4.2 | 3 | 6.33 | 0.38 | reference semantics and object-track execution family disagree<br>runtime matches object-track execution family but misses semantic path-family intent<br>aggregate object-track score below 5.0<br>primary object-track score below 5.0<br>lower-field overstay against aggregate target<br>aggregate path-length ratio above 3x target |
| 3 | hook-arc | hook-arc | hook-arc | 5 | 5.4 | 3.03 | 0 | aggregate path-length ratio above 3x target |
| 4 | hook-arc | cross-sweep | cross-sweep | 5.1 | 1.8 | 9.5 | -0.285 | reference semantics and object-track execution family disagree<br>runtime matches object-track execution family but misses semantic path-family intent<br>primary object-track score below 5.0<br>lower-field undershoot against aggregate target<br>aggregate path-length ratio above 3x target |
| 5 | boss-led-loop | hook-arc | hook-arc | 4.9 | 3 | 3.84 | -0.163 | reference semantics and object-track execution family disagree<br>runtime matches object-track execution family but misses semantic path-family intent<br>aggregate object-track score below 5.0<br>primary object-track score below 5.0<br>aggregate path-length ratio above 3x target |

## Evidence

- Description: `reference-artifacts/ingestion/reference-execution-descriptions/aurora-stage7-challenge2-0.1.json`
- Source window: `challenge-02-cross-and-column`
- Contact sheet: `reference-artifacts/analyses/galaga-challenge-video-reference/challenge-all2-single-ship-all-perfects/challenge-02-cross-and-column/contact-sheet-1fps.jpg`
- Focused sheet: `reference-artifacts/analyses/galaga-challenge-video-reference/challenge-all2-single-ship-all-perfects/challenge-02-cross-and-column/motion-review-4fps.jpg`
