# Galaga Path Reference Labels

This artifact validates accepted Galaga path labels before they are allowed to lift Aurora alien-entry/challenge metrics from heuristic runtime comparison into direct reference comparison.

- Status: awaiting-reference-labels
- Score: 0/10
- Accepted labels: 0
- Regular labels: 0/6
- Challenge labels: 0/4

## Meaning

These labels let the harness compare Aurora alien arrivals, rack settling, challenge paths, and bonus windows against actual Galaga reference windows instead of broad heuristic path families.

## Next Action

Add accepted regularEntry and challengeEntry label JSON files under reference-artifacts/ingestion/galaga-path-reference-labels, then rerun this analyzer.

## Work Queue

| Priority | Work | Acceptance Gate |
| ---: | --- | --- |
| 1 | regular-entry-reference-labels | At least six regular reference windows have first-visible, entry-side, rack-target, settle-frame, and trajectory-vector labels. |
| 2 | challenge-arrival-reference-labels | At least four challenge reference windows have first-visible, path-commit, upper-band scoreability, exit, and bonus-opportunity labels. |
| 3 | dashboard-and-quality-scorer-link | Quality conformance and release dashboard rows link to this label plan, latest direct-reference label artifact, and measured run-ledger cost. |
