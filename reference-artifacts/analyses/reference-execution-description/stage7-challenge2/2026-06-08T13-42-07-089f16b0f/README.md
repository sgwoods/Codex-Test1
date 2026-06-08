# Stage 7 Reference Execution Description Analysis

Generated: 2026-06-08T13:42:07.675Z
Commit: 089f16b0f
Branch: codex/macbook-pro-1.4.1-stage7-object-track-keeper

## Decision

Measurement keeper: accept-measurement-keeper

Runtime candidate recommendation: ready-for-one-measured-runtime-candidate

Runtime promotion ready: false

The Stage 7 execution description is precise enough for one measured runtime candidate; the current runtime is still not promotable without a player-visible improvement.

## Runtime Deviation Rows

| Group | Legacy semantic family | Canonical family | Runtime family | Aggregate score | Primary score | Path ratio | Lower-field delta | Candidate focus |
| ---: | --- | --- | --- | ---: | ---: | ---: | ---: | --- |
| 1 | cross-sweep | cross-sweep | cross-sweep | 3.5 | 3.7 | 4.32 | 0.018 | raise aggregate object-track fit to first promotion floor<br>raise primary object-track fit to first promotion floor<br>reduce aggregate path-length ratio below first promotion floor |
| 2 | cross-sweep | hook-arc | cross-sweep | 5.2 | 2.6 | 5.74 | 0.354 | legacy semantic label differs from canonical object-track execution family<br>raise primary object-track fit to first promotion floor<br>reduce lower-field overstay against aggregate target<br>reduce aggregate path-length ratio below first promotion floor |
| 3 | hook-arc | hook-arc | hook-arc | 5 | 4.6 | 3.9 | 0 | raise primary object-track fit to first promotion floor<br>reduce aggregate path-length ratio below first promotion floor<br>reduce primary path-length ratio below first promotion floor |
| 4 | hook-arc | cross-sweep | hook-arc | 5 | 1.8 | 9.23 | -0.266 | legacy semantic label differs from canonical object-track execution family<br>raise primary object-track fit to first promotion floor<br>avoid lower-field undershoot against aggregate target<br>reduce aggregate path-length ratio below first promotion floor<br>reduce primary path-length ratio below first promotion floor |
| 5 | boss-led-loop | hook-arc | boss-led-loop | 4.9 | 3 | 3.83 | -0.163 | legacy semantic label differs from canonical object-track execution family<br>raise aggregate object-track fit to first promotion floor<br>raise primary object-track fit to first promotion floor<br>reduce aggregate path-length ratio below first promotion floor |

## Path-Family Resolutions

- Group 2: canonical hook-arc from object-track-and-motion-spec; legacy semantic label remains cross-sweep.
- Group 4: canonical cross-sweep from object-track-and-motion-spec; legacy semantic label remains hook-arc.
- Group 5: canonical hook-arc from object-track-and-motion-spec; legacy semantic label remains boss-led-loop.

## Primary-Track Gates

- Group 1: primary track target-track-10 is the candidate tuning gate; aggregate track remains a guardrail.
- Group 4: primary track target-track-110 is the candidate tuning gate; aggregate track remains a guardrail.
- Group 5: primary track target-track-142 is the candidate tuning gate; aggregate track remains a guardrail.

## Evidence

- Description: `reference-artifacts/ingestion/reference-execution-descriptions/aurora-stage7-challenge2-0.1.json`
- Source window: `challenge-02-cross-and-column`
- Contact sheet: `reference-artifacts/analyses/galaga-challenge-video-reference/challenge-all2-single-ship-all-perfects/challenge-02-cross-and-column/contact-sheet-1fps.jpg`
- Focused sheet: `reference-artifacts/analyses/galaga-challenge-video-reference/challenge-all2-single-ship-all-perfects/challenge-02-cross-and-column/motion-review-4fps.jpg`
