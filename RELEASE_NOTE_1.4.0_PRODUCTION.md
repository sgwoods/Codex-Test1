# Aurora / Platinum 1.4.0 Production Release

Date: 2026-05-14

## Summary

`1.4.0` is now live on hosted `/production`.

This is the first deliberate public `1.4.0` family for Aurora / Platinum. It
promotes the reviewed beta candidate into the public line and turns the recent
multi-game, conformance, persona, replay, and documentation work into the new
production baseline.

## What This Release Adds

- `Aurora Galactica` remains the primary shipped playable game on Platinum, now
  with the refreshed player-two persona mode, watch-mode persona behavior,
  commentator callout support, replay/trophy surface follow-through, and the
  current release/documentation discipline.
- `Galaxy Guardians` remains a preview-first sibling game, but it now carries a
  stronger first-class playable/conformance posture inside the shipped public
  family instead of living only as an experimental side path.
- The hosted conformance and project documentation surfaces now expose clearer
  per-game and side-by-side entry points so Aurora and Guardians can be reviewed
  together from one public release story.
- The release pipeline now carries the code-review packet plus review-learning
  ledger forward as durable release evidence rather than ephemeral review-only
  state.

## Production Posture

The important public contract after this release is:

- hosted `/production` now carries `1.4.0`
- hosted `/beta` remains the staging lane for the next reviewed candidate cycle
- hosted `/dev` remains the forward-review lane
- root public pages and hosted docs now match the shipped `1.4.0` posture

## What Remains Next

Shipping `1.4.0` does not mean the work is complete.

The next deliberate follow-through should focus on:

- stronger Aurora conformance lifts in audio, stage pressure, and long-surface
  feel
- continued Galaxy Guardians advancement toward a more complete first-class
  playable game
- keeping Platinum clean as the reusable multi-game host rather than letting
  application-specific behavior leak back into the shared shell
