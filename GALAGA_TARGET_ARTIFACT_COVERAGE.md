# Galaga Target Artifact Coverage

Generated: `2026-05-18T16:43:40.476Z`

This is the project-facing inventory of online and local artifacts that best
illustrate Aurora's Galaga-like target. It records what is already ingested,
what is only a candidate, and what still blocks stronger challenge-stage
conformance work.

## Summary

- Overall target-artifact ingestion coverage: `5.1/10`
- Challenge-stage target readiness: `4.5/10`
- Critical sources: `5`
- Critical sources not fully ingested: `5`
- Existing local evidence anchors: `42`
- Missing local evidence anchors: `0`

## Interpretation

Aurora now has media-backed windows for all tracked Galaga challenge stages, including Challenges 4-8. The bottleneck has moved from source acquisition to precision: each window needs five-group frame labels for entry side, path family, scoreable band, exit side, alien family, and perfect-bonus opportunity before direct trajectory scoring should rise.

## Source Coverage

| Source | Status | Coverage | Priority | Evidence | Next Work |
| --- | --- | ---: | --- | ---: | --- |
| arcade-game-series-late-perfect-guides | not-ingested | 0/10 | critical | 0/0 | Acquire lawful gameplay windows for the late challenge stages and promote per-group labels. Use the guides only to prioritize stage windows and expected novelty, not as pixel/motion ground truth. |
| controlled-emulation-capture | planned | 1.8/10 | critical | 0/0 | Set up an approved capture source, record source manifest, capture challenges 1-8, and extract trajectories/contact sheets with the same harness shape used for existing media. |
| snake-latino-galaga-gameplay-video | partial | 5.1/10 | critical | 13/13 | It is only a 360p early-window corpus. Add complete challenge-stage windows and later challenge stages beyond Challenge 3 before using it as the sole movement target. |
| user-supplied-galaga-alien-closeups | partial | 5.1/10 | critical | 7/7 | Review the generated crop previews, promote per-role and per-pose target crops, and update runtime sprite scoring so challenge aliens, projectiles, tractor beam, and explosion visuals can be scored against richer Galaga visual vocabulary. |
| user-supplied-galaga-challenge-compilations | partial | 4.2/10 | critical | 8/8 | Promote five-group labels for each challenge window: first visible time, entry side, path family, scoreable upper-band interval, exit side, alien family, and perfect-bonus opportunity. |
| bandai-namco-official-galaga-history | ingested | 10/10 | high | 2/2 | Promote selected assertions into rule-specific checks where they can reduce prose-only documentation debt. |
| galaga-1981-namco-manual | ingested | 10/10 | high | 2/2 | Promote richer manual-derived assertions into structured per-rule artifacts so checks can cite rule IDs instead of prose notes. |
| galaga-reference-audio-cues | ingested | 8.2/10 | high | 3/3 | Improve scoring stability and segment-boundary strategy before promoting more runtime audio changes. |
| galaga-reference-sprite-models | ingested | 8.2/10 | high | 3/3 | Add active sprite motion windows for flapping, pulsing, dive/rotation, capture/rescue, and carried-fighter transitions. |
| world-of-longplays-galaga-longplay | candidate | 1.9/10 | high | 0/0 | Find the exact source URL, record provenance, extract later challenge-stage windows, and label at least Challenges 4-8. |
| gamesdatabase-galaga-screens-and-rules | partial | 4.2/10 | medium-high | 2/2 | Add approved screenshot/contact-sheet provenance before using this source for fine pixel/layout scoring. |
| strategywiki-galaga-walkthrough | partial | 4.2/10 | medium | 2/2 | Use the notes to define player/designer meaning rows, then use measured media windows for actual path scoring. |
| galaga-fandom-challenging-stage | not-ingested | 0/10 | low-medium | 0/0 | Use only as a secondary consistency check against manual and captured gameplay. |

## Challenge-Stage Priority Windows

| Challenge | Stage Marker | Status | Coverage | Evidence Count | Next Need |
| ---: | ---: | --- | ---: | ---: | --- |
| 1 | 3 | partially-ingested | 4.5/10 | 3 | Convert existing windows into fuller five-group trajectory labels and build Aurora Stage 3 against those exact group contracts. |
| 2 | 7 | partially-ingested | 4.5/10 | 2 | Add late-wave/results windows and group 2-5 labels. |
| 3 | 11 | partially-ingested | 4.5/10 | 2 | Add late-wave/results windows and map specialty alien novelty explicitly. |
| 4 | 15 | partially-ingested | 4.5/10 | 1 | Promote five-group labels for the pink serpentine reference and rebuild Aurora Stage 15 around a distinct late-stage specialty arc. |
| 5 | 19 | partially-ingested | 4.5/10 | 1 | Promote five-group labels for the pink/green cascade reference and align Aurora's mosquito/specialty-family novelty to the visible target. |
| 6 | 23 | partially-ingested | 4.5/10 | 1 | Promote five-group labels for the green ladder/split reference and add runtime probes for staggered group spacing. |
| 7 | 27 | partially-ingested | 4.5/10 | 1 | Promote five-group labels for the yellow diagonal fan reference and use it as the strongest late-stage visual novelty target. |
| 8 | 31 | partially-ingested | 4.5/10 | 1 | Promote five-group labels for the blue/purple finale reference and use it as the late-loop capstone contract. |

## Next Best Steps

1. Promote the user-supplied all-perfect challenge video windows into five-group labels for Challenges 1-8, prioritizing Challenges 4, 7, and 8 for late-stage visual novelty.
2. Promote five-group labels for each challenge: first visible frame, entry side, path family, scoreable band, exit side, alien family, and perfect-bonus opportunity.
3. Split the existing early challenge reference windows into complete group-by-group target contracts before further Aurora runtime tuning.
4. Add active sprite-motion evidence for challenge aliens so graphics conformance is not static-pose-only.
5. Use official/manual sources for rule and scoring grounding, and measured video/contact-sheet sources for path and visual timing scoring.
