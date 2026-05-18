# Galaga Path Reference Labels

This artifact validates accepted Galaga path labels before they are allowed to lift Aurora alien-entry/challenge metrics from heuristic runtime comparison into direct reference comparison.

- Status: direct-reference-label-gate-passed
- Score: 10/10
- Accepted labels: 15
- Regular labels: 6/6
- Challenge labels: 9/4

## Meaning

These labels let the harness compare Aurora alien arrivals, rack settling, challenge paths, and bonus windows against actual Galaga reference windows instead of broad heuristic path families.

## Next Action

Wire direct labels into path-family comparison and lift the heuristic cap in alien-entry/challenge scoring.

## Work Queue

| Priority | Work | Acceptance Gate |
| ---: | --- | --- |
| 1 | regular-entry-reference-labels | At least six regular reference windows have first-visible, entry-side, rack-target, settle-frame, and trajectory-vector labels. |
| 2 | challenge-arrival-reference-labels | At least four challenge reference windows have first-visible, path-commit, upper-band scoreability, exit, and bonus-opportunity labels. |
| 3 | dashboard-and-quality-scorer-link | Quality conformance and release dashboard rows link to this label plan, latest direct-reference label artifact, and measured run-ledger cost. |
