# Release Note: 1.2.3 Score-Surface Polish Patch

Date: April 9, 2026

Release track: production patch

## Summary

This `1.2.3` patch polished Aurora's score and attract surfaces without
reopening broad gameplay rules or shell ownership.

The goal was to make the score story easier to read and easier to trust across
recent builds.

## What Changed

- wait-mode high-score boards now rotate in a clearer
  validated-local-all sequence
- leaderboard rows gained build/date context
- a lightweight after-date filter was added so results are easier to inspect
  against recent builds

## Why It Mattered

This patch improved the credibility of the visible score surfaces.

That might look smaller than gameplay tuning work, but score presentation is a
core part of the arcade contract. If players cannot read or trust the board
cleanly, the release line feels less real no matter how good the game logic is.

## What Came Next

The next `1.2.3` work widened from score-surface polish toward:

- pilot-surface trust fixes
- login and panel polish
- stronger release-lane discipline
