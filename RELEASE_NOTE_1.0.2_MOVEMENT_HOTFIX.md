# Release Note: 1.0.2 Movement Regression Hotfix

Date: April 2, 2026

Release track: production-failure hotfix

## Summary

`1.0.2` fixed the `1.0.1` production regression that repeatedly reset active
lateral input during play.

The effect in the live game was severe: normal ship movement no longer felt
stable. This was exactly the kind of release that justifies immediate public
repair work.

## What Changed

- restored normal lateral ship movement in production
- added stronger hotfix smoke coverage
- added hosted-lane input probes so obvious control failures are easier to
  catch before promotion

## Why It Mattered

This was a production-repair release in the clearest sense.

It did not broaden the product story. It repaired a live failure in the most
important part of the arcade contract: moving the ship when the player asks it
to move.

## What Came Next

Once input reliability was restored, the release path could widen again toward:

- platform framing
- trust fixes
- runtime hardening
- larger public milestone packaging
