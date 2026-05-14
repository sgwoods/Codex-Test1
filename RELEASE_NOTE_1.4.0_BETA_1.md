# Release Note: 1.4.0 Beta 1

Date: May 14, 2026

Release track: first deliberate `1.4.0` beta candidate

Source promotion path: merged `main` -> hosted `/dev` `1.4.0.1` ->
hosted `/beta` `1.4.0-beta.1`

## Summary

`1.4.0-beta.1` is the first deliberate post-`1.3.0` minor-family candidate.
It keeps hosted `/production` stable on the refreshed public `1.3.0` line
while moving hosted `/dev` and hosted `/beta` onto a coherent next-family
review line.

This candidate matters because it stops stretching the `1.3.0` story past its
natural boundary. The bundle now being reviewed is no longer just a same-family
refresh. It carries a fuller Galaxy Guardians playable/conformance tranche,
side-by-side game conformance entry points, broader release-note and dashboard
history, and a clearer multi-game product story for Platinum.

## What This Beta Candidate Carries

- The first deliberate `1.4.0` lane identity:
  - hosted `/dev`: `1.4.0.1`
  - hosted `/beta`: `1.4.0-beta.1`
  - hosted `/production`: remains `1.3.0`
- A cleaner release story that preserves the distinction between the public
  shipped line and the next candidate family.
- The merged Galaxy Guardians work that makes the second cabinet more useful as
  a real platform-validation target instead of only a shell proof.
- Hosted conformance entry points that make Aurora, Galaxy Guardians, and the
  compare view directly shareable from the documentation surfaces.
- Backfilled release history and readable hosted release-note navigation so the
  dashboard timeline can link to maintained detailed notes.

## Galaxy Guardians In This Candidate

The most important product-level change in this family is the stronger Galaxy
Guardians posture.

The candidate now includes:

- game-owned score, replay, and pilot-history identity instead of silently
  borrowing Aurora surfaces
- one-level completion and loss-result framing so the game behaves more like a
  minimally complete playable experience
- longer-surface and persona-oriented conformance planning rather than a
  one-wave-only preview posture
- the recent visual, audio, motion-pressure, and stage-surface passes now
  merged into the candidate line
- direct documentation and dashboard compare links so Guardians can be judged
  beside Aurora instead of hidden behind a generic shared dashboard

This still does not claim that Galaxy Guardians is a finished second shipped
game. It does mean the candidate family now treats it as a serious playable
preview and conformance program rather than a thin cabinet placeholder.

## Release And Documentation Improvements

- The release dashboard now frames the active family honestly as `1.4.0`
  candidate work while keeping `1.3.0` as the stable public baseline.
- Hosted release-note navigation now has broader history coverage and a
  maintained source-doc path for milestone links.
- The hosted project guide and public project page now surface direct Aurora
  and Guardians conformance links plus a compare entry point.
- Layered version domains remain explicit across the integrated bundle, the
  Platinum platform, Aurora, and Galaxy Guardians.

## Review Intent

This beta candidate should be reviewed for:

- whether the `1.4.0` story is cleaner and more honest than continuing to
  stretch `1.3.0`
- whether Galaxy Guardians is now materially more useful as a second real game
  surface for platform validation
- whether the current documentation and dashboard set explains the multi-game
  product story clearly enough for the next public move
- whether the remaining gaps are now production blockers or simply the next
  deliberate investment queue

## Known Remaining Questions

- Galaxy Guardians still needs deeper level-by-level feel, fairness, and late
  stage survivability tuning before it should be described as fully mature.
- Aurora still has high-value authenticity work in audio/event feedback, visual
  grounding, and later-stage arcade depth.
- Production remains intentionally on `1.3.0` until the `1.4.0` candidate is
  accepted strongly enough to justify a real public move.

## Next Decision

If `1.4.0-beta.1` is accepted, the next production conversation should be about
whether this family deserves a real `1.4.0` public promotion, not whether it
can be squeezed back into a same-story `1.3.x` label.
