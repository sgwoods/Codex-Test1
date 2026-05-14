# Release Note: 1.2.0 Platinum Release 1

Date: April 7, 2026

Release track: minor public milestone

## Summary

`1.2.0` reframed Aurora Galactica as the first playable application on the
Platinum platform.

This was more than a patch line. It established the platform-owned shell,
picker flow, hosted lane structure, and the first meaningful separation
between the platform and the game it hosts.

## What Changed

- Platinum became the visible host identity
- Aurora became the first shipped application on Platinum
- hosted `/dev`, `/beta`, and `/production` were formalized as distinct lanes
- the hosted documentation and release ladder became part of the product model

## Why It Mattered

This release created the architectural and release framing that later made
multi-game work, second-cabinet preview work, and layered platform/application
versioning possible.

Without `1.2.0`, later release discipline would have remained much flatter and
less honest about what the platform owns versus what a game owns.

## What Came Next

After Platinum Release 1, the follow-up work focused on:

- fast trust fixes
- clearer platform/application boundaries
- runtime safety and late-run hardening
