# Galaga Path Reference Labels

This directory is the source inbox for accepted Galaga path labels. The analyzer
`npm run harness:analyze:galaga-path-reference-labels` validates these labels and
writes the durable report under
`reference-artifacts/analyses/galaga-path-reference-labels/`.

The label gate intentionally starts at zero accepted labels. Aurora's
alien-entry and challenge-stage scorer must not treat a planning row as a
direct-reference comparison until labels exist and pass validation.

## Label Families

Accepted JSON files may contain a top-level `labels` array, or separate
`regularEntry` and `challengeEntry` arrays. Every label must include a `kind`
field when using `labels`.

Regular-entry labels describe normal stage alien arrivals, rack targets, and
first attack or exit timing. Challenge-entry labels describe challenge-stage
group arrivals, scoreable upper-band windows, exit side, and bonus opportunity.

## Promotion Gate

The direct-reference path comparison gate opens only when all of these are true:

- at least 6 accepted `regularEntry` labels
- at least 4 accepted `challengeEntry` labels
- mean confidence is at least 0.72
- referenced source anchors exist in the repo and point to committed
  frame/contact-sheet/video media, not README-only provenance

Until then, the conformance dashboard should show this work as reference-label
readiness, not as a completed path-precision score.
