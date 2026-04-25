# Beta Candidate Plan

## Current State

The `1.2.3` beta candidate has already been promoted and shipped.

Verified April 25, 2026:

- hosted `/beta`
  - `1.2.3-beta.1+build.489.sha.f6ba6c2.beta`
- hosted `/production`
  - `1.2.3+build.489.sha.f6ba6c2`

This document now records:

- what the shipped `1.2.3` beta family represented
- what the next beta family should be about

## What The Shipped `1.2.3` Beta Proved

The shipped beta family established that Aurora could ship with:

- stronger stage and challenge timing fidelity
- green audio cue alignment
- stronger movement evidence and trace-backed conformance
- stronger release documentation and committed release artifacts
- production-safe settings defaults and developer-surface restrictions
- a disciplined beta-to-production release path

## Current Quality Position

Current committed bundled quality read for the shipped family:

- overall score:
  - `8.8/10`
- strongest categories:
  - combat responsiveness
  - geometry fidelity
  - capture/rescue correctness
- weakest bundled category:
  - audio identity beyond cue timing

## What The Next Beta Should Be About

The next hosted `/beta` should not be another `1.2.3` refresh.

It should most likely belong to:

- `1.3.0`

## Expected `1.3.0` Beta Themes

### Movement fidelity

- calmer acceleration and reversal feel
- trace-backed tuning against preserved footage

### Audio identity

- stronger cue character and scene-level atmosphere

### Gameplay trust fixes

- boss/capture/carry edge correctness
- replay-flow polish
- runtime-hardening follow-through

### Shell and pilot-surface polish

- overlay containment
- dock and panel polish
- clearer pilot, leaderboard, and replay surfaces

### Platform maturity

- cleaner Platinum/application seam
- stronger release and environment separation

## Required Gate Set For The Next Beta Family

- `npm run build`
- targeted gameplay and platform harnesses for changed areas
- `npm run harness:score:quality-conformance`
- refreshed committed scorecard
- live beta verification
- current docs and release surfaces
- explicit beta approval before any production move

## Decision Rule

Do not refresh hosted `/beta` again until the next candidate can honestly
claim:

- it is more than a documentation-only or tooling-only change
- it is meaningfully better than the current shipped `1.2.3` family
- its weakest remaining gaps are understood and documented
