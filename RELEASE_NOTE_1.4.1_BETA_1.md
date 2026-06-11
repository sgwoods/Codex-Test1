# Release Note: 1.4.1 Beta 1

Date: June 11, 2026

Release track: first deliberate `1.4.1` patch candidate

Source promotion path: merged `main` -> hosted `/dev` `1.4.1.1` ->
hosted `/beta` `1.4.1-beta.1`

## Summary

`1.4.1-beta.1` names the accumulated post-`1.4.0` follow-through as a real
patch candidate instead of a build-only refresh of the shipped public family.
Hosted `/production` remains stable on `1.4.0` until this candidate is reviewed
and explicitly promoted.

This patch line is intentionally focused: it carries player-visible Aurora
quality improvements, beta sign-in repair, audio/theme clarity, security-review
refreshes, and stronger release gates without claiming a new minor product
family.

## What This Beta Candidate Carries

- The accepted Stage 3 / Challenge 1 fast-lane runtime keepers for groups 2, 3,
  4, and 5, with group 1 preserved as blocked under current group-level
  controls.
- Aurora audio/event-feedback lane repair and foreground-vs-pulse balance
  guardrails, with private reference clips still blocked from public-safe
  artifacts.
- Theme-set clarity across Aurora and Galaxy Guardians so audio, graphics,
  sprite rendering, starfield, and Arcade Music playlist choices move together.
- Normal beta pilot sign-in controls while test-pilot metadata remains stripped
  and public score writes remain disabled pending server-side validation.
- Refreshed security-release evidence, currently showing zero tracked beta and
  production issues in the structured security review.
- Stronger publish preflights for audio/theme defaults, beta account behavior,
  security/auth/replay storage, documentation freshness, and code-review packet
  consistency.

## Review Intent

Review this beta candidate for:

- whether the Stage 3 challenge-stage changes read as a real player-facing
  improvement without disturbing accepted keepers
- whether beta sign-in, theme selection, audio balance, and public-safe audio
  boundaries are clear in the hosted build
- whether the release/security gates are strict enough to protect a later
  production promotion
- whether this should become the next production patch as `1.4.1`

## Known Boundaries

- This is not a production push. Hosted `/production` remains on `1.4.0`.
- Public score writes remain disabled until the server-validated score path is
  implemented and reviewed.
- Stage 7 runtime candidate generation remains paused.
- Stage 3 group 1 remains blocked until lane/type-specific phrase controls or
  reference-path backing are available.

## Next Decision

If `1.4.1-beta.1` is accepted, the next production conversation should be about
promoting a real `1.4.1` patch release, not republishing `1.4.0` with a newer
build number.
