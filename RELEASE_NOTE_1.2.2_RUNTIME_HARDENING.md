# Release Note: 1.2.2 Runtime Hardening And Bonus-Ship Patch

Date: April 9, 2026

Release track: production patch

## Summary

`1.2.2` hardened Aurora against silent late-run runtime failures while also
shipping Aurora-scoped configurable bonus-ship awards.

This was a stability-and-operations patch with a direct gameplay reward
improvement layered on top.

## What Changed

- trapped runtime loop exceptions instead of failing silently
- surfaced export guidance when a frame fault occurs
- fixed a restart-time async score-submit crash
- added a targeted late-run ship-loss soak gate to the release path
- shipped configurable first and recurring score-based bonus-ship awards for
  Aurora

## Why It Mattered

This patch made late-run failures more visible and more survivable both for
players and for release review.

That mattered because the deeper the game went, the more expensive silent
runtime faults became. Hardening the runtime also set a cleaner base for later
fidelity and conformance work.

## What Came Next

Once runtime stability improved, the next quality step moved to:

- clearer score and attract surfaces
- more trustworthy leaderboard framing
- better player-facing context around current builds
