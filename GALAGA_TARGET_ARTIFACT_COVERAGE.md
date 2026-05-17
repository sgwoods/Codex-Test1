# Galaga Target Artifact Coverage

Generated: `2026-05-17T14:21:47.632Z`

This is the project-facing inventory of online and local artifacts that best
illustrate Aurora's Galaga-like target. It records what is already ingested,
what is only a candidate, and what still blocks stronger challenge-stage
conformance work.

## Summary

- Overall target-artifact ingestion coverage: `5.3/10`
- Challenge-stage target readiness: `1.7/10`
- Critical sources: `3`
- Critical sources not fully ingested: `3`
- Existing local evidence anchors: `27`
- Missing local evidence anchors: `0`

## Interpretation

Aurora has enough Galaga source material to prove the current challenge-stage gap, but not enough late-stage media-backed material to rebuild the later challenge stages with high confidence. The most valuable next ingestion work is controlled or sourced capture for Challenge Stages 4-8, followed by per-group movement and alien-novelty labels.

## Source Coverage

| Source | Status | Coverage | Priority | Evidence | Next Work |
| --- | --- | ---: | --- | ---: | --- |
| arcade-game-series-late-perfect-guides | not-ingested | 0/10 | critical | 0/0 | Acquire lawful gameplay windows for the late challenge stages and promote per-group labels. Use the guides only to prioritize stage windows and expected novelty, not as pixel/motion ground truth. |
| controlled-emulation-capture | planned | 1.8/10 | critical | 0/0 | Set up an approved capture source, record source manifest, capture challenges 1-8, and extract trajectories/contact sheets with the same harness shape used for existing media. |
| snake-latino-galaga-gameplay-video | partial | 5.1/10 | critical | 13/13 | It is only a 360p early-window corpus. Add complete challenge-stage windows and later challenge stages beyond Challenge 3 before using it as the sole movement target. |
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
| 1 | 3 | partially-ingested | 4.5/10 | 2 | Convert existing windows into fuller five-group trajectory labels and build Aurora Stage 3 against those exact group contracts. |
| 2 | 7 | partially-ingested | 4.5/10 | 1 | Add late-wave/results windows and group 2-5 labels. |
| 3 | 11 | partially-ingested | 4.5/10 | 1 | Add late-wave/results windows and map specialty alien novelty explicitly. |
| 4 | 15 | not-ingested | 0/10 | 0 | Acquire and label a full reference challenge window; do not reuse Challenge 3 as the best target except as a temporary diagnostic. |
| 5 | 19 | not-ingested | 0/10 | 0 | Acquire and label a full reference challenge window with mosquito/specialty-family novelty. |
| 6 | 23 | not-ingested | 0/10 | 0 | Acquire and label full reference challenge window for late-stage progression. |
| 7 | 27 | not-ingested | 0/10 | 0 | Acquire and label full reference challenge window for late-stage progression. |
| 8 | 31 | not-ingested | 0/10 | 0 | Acquire and label full reference challenge window and special blue-spaceship novelty. |

## Next Best Steps

1. Acquire or create a lawful controlled reference capture for Challenge Stages 4-8, prioritizing stages 15, 19, 23, 27, and 31.
2. Promote five-group labels for each challenge: first visible frame, entry side, path family, scoreable band, exit side, alien family, and perfect-bonus opportunity.
3. Split the existing early challenge reference windows into complete group-by-group target contracts before further Aurora runtime tuning.
4. Add active sprite-motion evidence for challenge aliens so graphics conformance is not static-pose-only.
5. Use official/manual sources for rule and scoring grounding, and measured video/contact-sheet sources for path and visual timing scoring.
