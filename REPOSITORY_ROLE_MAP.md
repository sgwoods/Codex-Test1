# Repository Role Map

Aurora currently uses two public GitHub repos. They are both live, but they do
not have the same role.

## Canonical Split

- authoritative source repo for code, planning, issues, and release control:
  - [sgwoods/Codex-Test1](https://github.com/sgwoods/Codex-Test1)
- public release host and GitHub Pages deployment repo:
  - [sgwoods/Aurora-Galactica](https://github.com/sgwoods/Aurora-Galactica)

## `sgwoods/Codex-Test1`

This is the engineering source of truth.

Use it for:

- active issues
- roadmap and planning docs
- harnesses, quality scoring, and correspondence work
- release authority and multi-machine workflow
- all new code changes and release decisions

If something is actively being debugged, designed, tested, or reviewed, it
belongs here.

## `sgwoods/Aurora-Galactica`

This repo is still needed because it is the public release host.

Use it for:

- hosted `/dev`, `/beta`, and `/production`
- GitHub Pages deployment
- public-facing mirrored release assets
- release-host landing context

Do not use it as the primary home for:

- active engineering issues
- long-form planning
- source-of-truth workflow decisions

## Issue Tracking Rule

Active Aurora issues live in:

- [sgwoods/Codex-Test1/issues](https://github.com/sgwoods/Codex-Test1/issues)

The absence of active issues in `sgwoods/Aurora-Galactica` is expected under
the current workflow. That repo is not deprecated yet, but it is no longer the
active engineering tracker.

## Cleanup Policy

To reduce confusion:

1. keep `sgwoods/Codex-Test1` as the authoritative source repo
2. keep `sgwoods/Aurora-Galactica` as the release host while it still deploys live lanes
3. make the role split explicit in both READMEs
4. keep public project pages and release docs aligned with this split
5. consider disabling issues on `sgwoods/Aurora-Galactica` later if that fits the release-host workflow

## Long-Term Option

If Aurora eventually moves to a different deployment model, `sgwoods/Aurora-Galactica`
could become a future archive candidate. Today it is still a live release-hosting
artifact, so it should be clarified, not removed.
