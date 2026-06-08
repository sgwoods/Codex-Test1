# Stage 7 Reference Execution Description Analysis

Generated: 2026-06-08T13:32:25.046Z
Commit: 4191d0730
Branch: codex/macbook-pro-1.4.1-stage7-object-track-keeper

## Decision

Measurement keeper: accept-measurement-keeper

Runtime candidate recommendation: ready-for-one-measured-runtime-candidate

Runtime promotion ready: false

The Stage 7 execution description is precise enough for one measured runtime candidate; the current runtime is still not promotable without a player-visible improvement.

## Runtime Deviation Rows

| Group | Legacy semantic family | Canonical family | Runtime family | Aggregate score | Primary score | Path ratio | Lower-field delta | Candidate focus |
| ---: | --- | --- | --- | ---: | ---: | ---: | ---: | --- |
| 1 | cross-sweep | cross-sweep | cross-sweep | 4.3 | 2.5 | 5.36 | 0.018 | raise aggregate object-track fit to first promotion floor<br>raise primary object-track fit to first promotion floor<br>reduce aggregate path-length ratio below first promotion floor<br>reduce primary path-length ratio below first promotion floor |
| 2 | cross-sweep | hook-arc | hook-arc | 4.2 | 3 | 6.33 | 0.38 | legacy semantic label differs from canonical object-track execution family<br>runtime follows canonical object-track family rather than legacy semantic label<br>raise aggregate object-track fit to first promotion floor<br>raise primary object-track fit to first promotion floor<br>reduce lower-field overstay against aggregate target<br>reduce aggregate path-length ratio below first promotion floor<br>reduce primary path-length ratio below first promotion floor |
| 3 | hook-arc | hook-arc | hook-arc | 5 | 5.4 | 3.03 | 0 | reduce aggregate path-length ratio below first promotion floor |
| 4 | hook-arc | cross-sweep | cross-sweep | 5.1 | 1.8 | 9.5 | -0.285 | legacy semantic label differs from canonical object-track execution family<br>runtime follows canonical object-track family rather than legacy semantic label<br>raise primary object-track fit to first promotion floor<br>avoid lower-field undershoot against aggregate target<br>reduce aggregate path-length ratio below first promotion floor<br>reduce primary path-length ratio below first promotion floor |
| 5 | boss-led-loop | hook-arc | hook-arc | 4.9 | 3 | 3.84 | -0.163 | legacy semantic label differs from canonical object-track execution family<br>runtime follows canonical object-track family rather than legacy semantic label<br>raise aggregate object-track fit to first promotion floor<br>raise primary object-track fit to first promotion floor<br>reduce aggregate path-length ratio below first promotion floor |

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
