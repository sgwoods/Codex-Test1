# Quality Release Scorecard

This scorecard compares the active Aurora lines against the current quality
conformance model.

Purpose:

- keep the current local line, hosted `/dev`, hosted `/beta`, and hosted
  `/production` in one readable chart
- show where the biggest quality gaps are right now
- make the quality score part of release discussion, not a side note

As of April 24, 2026:

- local current line:
  - branch `codex/document-project-principles`
  - quality score `8.8/10`
  - source:
    - `reference-artifacts/analyses/quality-conformance/2026-04-24-e1c2c65`
    - `reference-artifacts/analyses/correspondence/player-movement/2026-04-24-e1c2c65`
    - `reference-artifacts/analyses/aurora-audio-theme-comparison/2026-04-24-main-ca481f2`
- hosted `/dev`:
  - `1.2.3+build.470.sha.e4732eb`
  - built `Apr 23 2026, 3:15 PM EDT`
- hosted `/beta`:
  - `1.2.3-beta.1+build.484.sha.baa1726.beta`
  - built `Apr 24 2026`
- hosted `/production`:
  - `1.2.3+build.388.sha.13c8421`
  - built `Apr 10 2026, 8:56 AM EDT`

## Legend

- plain number:
  - directly measured from a current harness/report
- `~number`:
  - inferred from preserved baseline report sections or from a manual
    current-line-vs-hosted-`/dev` comparison
- text note:
  - not directly lane-scored yet; included as an honest status marker

## Current Comparison Table

| Category | Current local line | Hosted `/dev` | Hosted `/beta` | Hosted `/production` | Reference gameplay |
| --- | ---: | ---: | ---: | ---: | ---: |
| Overall quality score | `8.8` | `~8.3` | `8.8` | stable baseline line | `10` |
| Player movement conformance | `8.4` | `~5.9` | `8.4` | `4.6` | `10` |
| Shot and hit responsiveness | `10.0` | `~10.0` | not yet lane-rescored | not yet lane-rescored | `10` |
| Stage-1 opening timing fidelity | `8.5` | `~5.6` | `8.5` | `~1.0` | `10` |
| Stage-1 opening geometry fidelity | `10.0` | `~10.0` | `10.0` | `10.0` | `10` |
| Dive fairness and safety | `9.1` | `~9.1` | `9.1` | pre-expert-safety fix | `10` |
| Capture and rescue rule fidelity | `10.0` | `~10.0` | `10.0` | `10.0` | `10` |
| Challenge-stage timing fidelity | `8.4` | `~8.4` | `8.4` | `~1.0` | `10` |
| Progression and persona depth | `8.8` | `~8.8` | `8.8` | `10.0` | `10` |
| Audio identity and cue alignment | `6.1` | `~5.6` | `6.1` | shared gap, not lane-rescored | `10` |
| UI, shell, and graphics integrity | `9.2` | `~9.2` | `9.2` | stable live line | `10` |

## Read

Current current-line and hosted-beta strengths:

- combat responsiveness
- opening geometry
- opening timing cadence
- capture/rescue behavior
- shell and panel integrity
- early dive safety

Current local line biggest gaps:

- audio identity remains the weakest category in the bundled quality report
- movement is materially stronger than before after the trace-backed opening-window pass
- the line now reads like a real production candidate rather than a dev-recovery line

Most meaningful recent step forward:

- the stage-1 convoy-pulse refinement aligned the stage-1 correspondence report
  with the reference-audio timing anchor at `formationArrival`
- the dedicated stage-1 correspondence report is now `4/4` passing with worst
  current delta `0.18`
- taken together with the already-merged challenge timing cadence pass, that
  lifts the rolled-up score from `8.3/10` to `8.5/10`
- the refreshed audio theme comparison on the current branch also shows a much
  healthier cue-identity picture, which lifts the roll-up again to `8.8/10`
- the new stage-opening reference-video alignment window now gives movement
  conformance a durable trace-backed source rather than a purely provisional
  control-principles target set
- the refreshed bundled quality report now captures that movement improvement
  at `8.4/10`, which is enough to move movement out of the release-blocking
  tier

## Release Use

Going forward:

- every serious `/dev` or `/beta` candidate should refresh this scorecard
- `/beta` release notes should include the latest quality score and the top
  three remaining gaps
- `/production` release notes should include the approved-beta quality score and
  what was intentionally accepted for ship
- the scorecard itself should be committed whenever it materially changes
- the score should be treated as a release artifact, not just a local report

This scorecard should evolve as more direct live-lane scoring becomes available.

Current note:

- the dedicated `audio-cue-alignment` correspondence check is now part of the
  active fidelity program on the forward line
- it now passes `9/9` on the current `/dev` line and is reflected in the
  refreshed `7.8/10` audio category score on the current branch
- the merged timing pass lifted challenge-stage timing to `8.4/10`
- the latest stage-1 convoy-pulse refinement lifted stage-1 timing to an
  `8.5/10` on the current local line
- the latest bundled quality runner now scores the local line at `8.8/10`,
  with `audio` the weakest category at `6.1/10`
- hosted `/beta` now reflects that same `baa1726` candidate line, so the beta
  lane should be treated as the active production candidate until superseded
- the dedicated audio comparison harness was hardened to capture each cue in a
  fresh harness session, which resolved a `MediaRecorder` lifecycle failure on
  this machine and produced the new `2026-04-24-main-ca481f2` comparison set
- the new `reference-video-alignment/stage1-opening-window-2026-04-24-e1c2c65`
  artifact set is now the durable anchor for future movement smoothing and
  player-action annotation work
