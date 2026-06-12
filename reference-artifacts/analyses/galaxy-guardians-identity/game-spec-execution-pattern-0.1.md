# Game Spec Execution Pattern 0.1

Generated: 2026-06-12
Status: planning-contract-platform-extraction

## Purpose

The Guardians stage-five readability pass shows the next reusable pattern for
Platinum: declare the game-spec delta, generate harness-only candidate
profiles, measure them without changing runtime behavior, require visual
evidence, and only then consider bounded promotion.

The first profile-set extraction is now represented by
`stage-five-readability-candidate-profiles-0.1.json`, which lets the analyzer
load candidate profiles instead of embedding tuning literals in the harness.

## Reusable Pattern

- declare affected game-spec layers and runtime axes before tuning
- generate candidate profiles from the spec delta
- compare baseline and candidate behavior in harness-only mode
- require contact-sheet or browser-visible evidence before promotion
- promote only bounded runtime deltas with rollback signals and refreshed gates

## Platform Extraction Plan

- add a shared validator for game-spec and candidate-profile artifacts
- let harnesses load candidate profiles by id
- expose declarative stage-band/rank rule maps behind current runtime functions
- keep shipped behavior unchanged unless a promoted profile is selected
- add Aurora as the second consumer after Guardians completes one full cycle
- route video-ingestion output into proposed candidate profiles

## Aurora Readiness

Aurora can share stage bands, role families, movement language, scoring/result
contracts, audio/visual hooks, and promotion gates. Aurora-specific capture,
dual-fighter, and challenge-stage mechanics should remain declared as Aurora
layers instead of leaking back into Guardians.

## Next Step

Build a shared candidate-profile loader and validator, then convert the
Guardians readability candidate analyzer to consume the profile contract instead
of local candidate literals.
