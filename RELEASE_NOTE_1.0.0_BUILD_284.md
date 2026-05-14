# Release Note: 1.0.0+build.284 Post-Launch Hotfix

Date: March 31, 2026

Release track: post-launch production hotfix

## Summary

This hotfix repaired an early production issue where signed-in runs could
appear to save locally without inserting into the shared leaderboard.

It also added a hosted refresh reminder so players on stale browser tabs had a
clear path to pick up live fixes instead of silently staying on an older build.

## What Changed

- remote score submission moved into the main game-over path
- diagnostics were added around score-submit failures
- a refresh reminder and one-click action were added for stale hosted sessions

## Why It Mattered

This was a trust repair release.

The first production line only worked if shared scores actually represented
what players had just earned. Fixing submit reliability and stale-tab behavior
protected the legitimacy of the live leaderboard during the earliest public
days of the game.

## What Came Next

After score-submit reliability was repaired, the next hotfix focus moved to:

- input clarity
- control reliability
- visible feedback polish
