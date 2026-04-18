# Aurora Galactica Release State Map

This note captures the current release picture on this machine so Aurora work can
resume without relying on chat history or memory.

## Naming Used Here

- `stable-beta-baseline`
  - the shipped beta/prod line at commit `13c8421`
- `forward-main`
  - current GitHub `main`, which also matches the published `hosted-dev` lane
- `recovered-local`
  - the recovery branch created from preserved local work on this machine
- `untrusted-gates`
  - checks that currently exist but should not be treated as release blockers
    until repaired

## Release Buckets

| Bucket | Commit / Branch | Release State | What Is In It | Confidence |
| --- | --- | --- | --- | --- |
| Stable production | `13c8421` / release-time `main` | Live production | Shipped `1.2.3` release | High |
| Stable beta | `13c8421` / release-time `beta` | Live beta | Shipped `1.2.3-beta.1` candidate that was approved and promoted | High |
| Checked-in release artifacts | local `dist/beta`, `dist/beta/approved-build-info.json`, `dist/production` | Local reference only | Exact metadata and lineage for the shipped beta/prod line | High |
| Forward dev line | `9d7b2a8` on current GitHub `main` | Reflected in `hosted-dev` | Post-release work after `13c8421`; newer than beta/prod | High |
| Recovered local work | `codex/recover-documents-local-2026-04-18` | Not released | Recovered combat and hitbox tuning plus local-support docs | High |
| Additional laptop-only work beyond recovered files | unknown | Not released | No further unique source changes are currently visible on this machine | Medium |
| Harness validation state | current `main` and recovery branch | Not a release lane | `close-shot-hit` is not trustworthy as a release gate right now | High |

## Work Area Map

| Work Area | In Stable Beta? | In `forward-main` / `hosted-dev`? | In `recovered-local`? | Notes |
| --- | --- | --- | --- | --- |
| `1.2.3` score-surface polish patch | Yes | Yes, as ancestor | Yes, as ancestor | Known stable shipped line |
| Release promotion metadata and approved-beta chain | Yes | Yes | Yes | Preserved locally and considered trustworthy |
| Post-`1.2.3` mainline work up to `9d7b2a8` | No | Yes | Present through branch ancestry only | Floating forward work not yet pushed to stable beta |
| Recovered combat change in `src/js/05-player-combat.js` | No | No | Yes | Recovered from preserved local state |
| Recovered hitbox tuning in `src/js/21-render-board.js` | No | No | Yes | Recovered from preserved local state |
| Local-support workflow docs | No | No | Yes | Operational only; not gameplay or release content |
| Additional unpublished laptop-local source | Unknown | Unknown | Unknown | No current evidence on this machine beyond recovered files |

## Stable Baseline Artifacts

The following checked-in files represent the current stable beta/prod baseline
and should be preserved unless a new release candidate is intentionally being
created:

- [dist/beta/build-info.json](/Users/steven/Documents/Codex-Test1/dist/beta/build-info.json)
- [dist/beta/approved-build-info.json](/Users/steven/Documents/Codex-Test1/dist/beta/approved-build-info.json)
- [dist/production/build-info.json](/Users/steven/Documents/Codex-Test1/dist/production/build-info.json)

## Validation Caveat

`tools/harness/check-close-shot-hit.js` currently fails on clean `main` as well
as on `recovered-local`.

Current understanding:

- this is not evidence that the recovered gameplay changes caused a regression
- the check has shown at least two failure modes:
  - brittle scenario timing relative to current dive/collision behavior
  - real-time harness runs where the page loads and key input is injected but
    simulation time never advances

Until repaired, treat `close-shot-hit` as an `untrusted-gate`, not as a release
decision point.

## Recommended Operating Model

- use `stable-beta-baseline` as the known-good release reference
- treat `forward-main` as the integrated forward line, but not yet a trusted
  beta candidate
- treat `recovered-local` as preserved optional work that still needs conscious
  integration
- keep checked-in beta/prod artifacts unchanged until a deliberate promotion
  cycle starts
- repair or replace `untrusted-gates` before using them to block release

## Immediate Next Steps

1. preserve `stable-beta-baseline` artifacts as-is
2. repair `close-shot-hit` on a separate branch
3. re-run repaired checks on clean `main` and on `recovered-local`
4. decide whether to build a controlled `pre-beta` candidate from `13c8421`
5. integrate later work onto that candidate intentionally rather than by memory
