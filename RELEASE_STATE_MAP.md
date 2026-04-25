# Aurora Galactica Release State Map

This note captures the current release picture so Aurora work can resume
without relying on chat history or stale intermediate plans.

## Current Live Lanes

Verified April 25, 2026:

| Lane | Label | Commit | Meaning |
| --- | --- | --- | --- |
| hosted `/dev` | `1.2.3+build.470.sha.e4732eb` | `e4732eb` | Older integration lane and comparison surface |
| hosted `/beta` | `1.2.3-beta.1+build.489.sha.f6ba6c2.beta` | `f6ba6c2` | Current shipped beta line |
| hosted `/production` | `1.2.3+build.489.sha.f6ba6c2` | `f6ba6c2` | Current public stable line |

## Branch Reality

- `main`
  - authoritative integration branch
  - matches the shipped `f6ba6c2` production family
- hosted `/dev`
  - intentionally older than `main`
  - should move only when the next polish bundle is coherent enough to justify
    a new shared integration surface

## Durable Reference Buckets

| Bucket | State | Role |
| --- | --- | --- |
| Shipped production family | `f6ba6c2` | Current public baseline and release reference |
| Shipped beta family | `f6ba6c2` | Current approved candidate family, matching production |
| Older hosted dev family | `e4732eb` | Comparison point for the next hosted `/dev` refresh |
| Committed analysis artifacts | current repo | Durable evidence for timing, movement, audio, and quality scoring |
| Machine and release workflow docs | current repo | Durable restart and multi-machine operating model |

## Historical Note

Older pre-refresh checkpoints such as:

- `13c8421`
- `9d7b2a8`
- `baa1726`

still matter as historical references, but they are not the current live
release picture.

## What Is Stable Right Now

Stable and intentionally preserved:

- hosted `/production`
- hosted `/beta`
- committed release docs
- committed quality and correspondence evidence
- committed multi-machine bootstrap and release-authority workflow

## What Is Intended To Move Next

The next live-lane movement should most likely be:

1. a new hosted `/dev` refresh from a coherent `main`-based polish bundle
2. later, a new hosted `/beta` family for `1.3.0`
3. then a production move from that approved beta
