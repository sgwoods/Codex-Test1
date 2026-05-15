# Galaga Path Reference Label Plan

Alien-entry and challenge-stage runtime variety now exposes a deeper conformance bottleneck: direct Galaga path precision requires frame-labeled reference windows.

- Score: 10/10
- Status: source-anchored-frame-evidence-ready
- Current alien-entry/challenge score: 8.1/10

## Source Anchors

| Source | Role | Present | Artifacts | Media Evidence | Frame Ready |
| --- | --- | ---: | ---: | ---: | ---: |
| reference-artifacts/analyses/galaga-path-reference-media/latest.json | media-backed-regular-and-challenge-path-label-source | yes | 1146 | 1124 | yes |
| reference-artifacts/analyses/galaga-stage-reference-video/README.md | regular-stage-entry-and-formation-reference | yes | 5 | 4 | yes |
| reference-artifacts/analyses/challenge-stage-reference/README.md | challenge-stage-arrival-and-results-reference | yes | 2 | 1 | yes |
| reference-artifacts/analyses/first-challenge-stage/README.md | first-challenge-motion-and-scoreability-reference | yes | 2 | 1 | yes |
| reference-artifacts/analyses/release-reference-pack/README.md | release-window-capture-transition-and-pressure-reference | yes | 4 | 3 | yes |

## Work Queue

| Priority | Work | Acceptance Gate |
| ---: | --- | --- |
| 1 | regular-entry-reference-labels | At least six regular reference windows have first-visible, entry-side, rack-target, settle-frame, and trajectory-vector labels. |
| 2 | challenge-arrival-reference-labels | At least four challenge reference windows have first-visible, path-commit, upper-band scoreability, exit, and bonus-opportunity labels. |
| 3 | dashboard-and-quality-scorer-link | Quality conformance and release dashboard rows link to this label plan, latest direct-reference label artifact, and measured run-ledger cost. |

## Next Harness Integration

- Create a label ingestion script that validates regularEntry and challengeEntry JSON files against this schema.
- Extend formation-boss-path-family comparison to read accepted labels and replace the current heuristic cap only when label coverage gates pass.
- Attach label artifact paths to release dashboard and public project documentation so the evidence is visible, not hidden in repo internals.
