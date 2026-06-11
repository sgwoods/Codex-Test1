# Release Note: 1.4.1 Production Quality Release

Date: June 11, 2026

Release track: `1.4.1` production quality release

Source promotion path: accepted hosted `/beta` `1.4.1-beta.1` review packet ->
hosted `/production` `1.4.1`

## Summary

`1.4.1` promotes the accepted beta-review work into the production family. It
is a production quality release: player-visible Aurora challenge-stage quality,
sign-in usability, audio/theme clarity, public-safe audio balance, and
release/security hardening, without claiming a new minor product family.

## What Changed

- Accepted Stage 3 / Challenge 1 runtime keepers for groups 2, 3, 4, and 5.
  Stage 3 group 1 remains blocked under current group-level controls and is
  preserved as future architecture work rather than retuned by hand.
- Aurora foreground audio now has stronger foreground-vs-pulse balance and a
  clearer public/private audio lane contract. Private Galaga reference clips
  remain localhost/private-only and are not bundled into public artifacts.
- Theme sets now group audio, graphics, sprite rendering, starfield, and Arcade
  Music playlist choices so Aurora and Galaxy Guardians settings are easier to
  understand across release lanes.
- Public account/sign-in surfaces were repaired through beta review, including
  the text-entry interaction that had blocked beta sign-in.
- The production settings surface no longer presents ordinary settings as
  developer tooling.
- Security review evidence and release gates were refreshed for the production
  quality line, with zero tracked production issues in the structured security
  review.

## Production Boundaries

- Public score submission remains disabled/guarded until server-validated score
  writes are implemented and reviewed.
- Stage 7 runtime candidate generation remains paused. The Stage 7 RED, trial,
  batch, compiler, and proof work remains useful process infrastructure, not a
  production runtime keeper.
- Galaxy Guardians remains a production-visible preview application. Its deeper
  gameplay/conformance work remains owned by the iMac lane.
- Local/private reference audio provisioning remains a development review-lane
  requirement and must not leak into public artifacts.

## Verification Read

The production packet is backed by:

- accepted hosted `/beta` manual smoke review
- production security review with zero tracked issues
- production account/sign-in smoke expectations
- public-safe audio/theme checks
- foreground-vs-pulse audio balance gate
- release conformance, economics, and documentation readiness evidence

## Next Work

After `1.4.1` ships, the next Aurora quality path should return to targeted
player-visible work: either the Stage 3 group 1 architecture pass for
lane/type-specific phrase controls or reference-path backing, or a short manual
audio review if foreground cue masking reappears in hosted lanes.
