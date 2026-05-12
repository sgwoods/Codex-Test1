# Release Note: 1.2.1 Aurora Trust-Fix And Copy-Boundary Patch

Date: April 7, 2026

Release track: production patch

## Summary

`1.2.1` was the first focused fast-follow patch after Platinum Release 1.

It fixed several player-visible trust issues while also clarifying the boundary
between platform-owned shell framing and application-owned game framing.

## What Changed

- dual-fighter runs now continue correctly after a single-ship loss
- challenge stages present as bonus stages without consuming normal stage
  numbering
- end-of-run carry/capture visuals no longer leak under results
- startup and wait-mode copy follows a clearer platform-versus-application
  ownership model

## Why It Mattered

This patch made the newly framed Platinum/Aurora experience easier to trust.

It did not try to widen the product story. It cleaned up correctness and copy
discipline so the first platform milestone felt less brittle in public use.

## What Came Next

The next step after trust-fix cleanup was runtime hardening:

- protect against silent frame-loop failures
- make restart-time score-submit behavior safer
- improve release-time soak coverage
