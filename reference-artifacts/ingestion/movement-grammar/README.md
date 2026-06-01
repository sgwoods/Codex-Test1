# Movement Grammar Ingestion Artifact

This directory defines the first shared Platinum movement grammar for turning
reference video motion into reusable game runtime patterns.

The current source artifact is:

`movement-grammar-0.1.json`

It is intentionally an ingestion-layer artifact, not an Aurora-only gameplay
change. The goal is to support regular formation entry, challenge-stage set
pieces, dives, escorts, capture/rescue motion, wrap/return, and future game
variants through one schema.

Run:

`npm run harness:check:movement-grammar`

The checker validates that the schema covers the expected movement surfaces,
defines compiler targets, includes migration steps, and keeps sample patterns in
normalized coordinate space.

Current focus: the first five Aurora challenging stages now have a separate
routeability guardrail artifact at
`reference-artifacts/analyses/challenge-stage-routeability/latest.json`. That
artifact checks whether targets are visible, scoreable, and plausibly reachable
before candidate movement rewrites are promoted for spectacle or stricter
target-video object-track conformance.
