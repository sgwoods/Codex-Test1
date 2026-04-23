# Quality Release Scorecard

This scorecard compares the active Aurora lines against the current quality
conformance model.

Purpose:

- keep the current local line, hosted `/dev`, hosted `/beta`, and hosted
  `/production` in one readable chart
- show where the biggest quality gaps are right now
- make the quality score part of release discussion, not a side note

As of April 23, 2026:

- local current line:
  - branch `codex/document-project-principles`
  - quality score `7.5/10`
  - source:
    - `reference-artifacts/analyses/quality-conformance/2026-04-23-e4732eb`
- hosted `/dev`:
  - `1.2.3+build.470.sha.e4732eb`
  - built `Apr 23 2026, 3:15 PM EDT`
- hosted `/beta`:
  - `1.2.3-beta.1+build.388.sha.13c8421.beta`
  - built `Apr 10 2026, 8:56 AM EDT`
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
| Overall quality score | `7.5` | `~7.5` | stable baseline line | stable baseline line | `10` |
| Player movement conformance | `5.9` | `~5.9` | `4.6` | `4.6` | `10` |
| Shot and hit responsiveness | `10.0` | `~10.0` | not yet lane-rescored | not yet lane-rescored | `10` |
| Stage-1 opening timing fidelity | `2.1` | `~2.1` | `~1.0` | `~1.0` | `10` |
| Stage-1 opening geometry fidelity | `10.0` | `~10.0` | `10.0` | `10.0` | `10` |
| Dive fairness and safety | `9.1` | `~9.1` | pre-expert-safety fix | pre-expert-safety fix | `10` |
| Capture and rescue rule fidelity | `10.0` | `~10.0` | `10.0` | `10.0` | `10` |
| Challenge-stage timing fidelity | `4.2` | `~4.2` | `~1.0` | `~1.0` | `10` |
| Progression and persona depth | `8.8` | `~8.8` | `10.0` | `10.0` | `10` |
| Audio identity and cue alignment | `5.6` | `~5.6` | shared gap, not lane-rescored | shared gap, not lane-rescored | `10` |
| UI, shell, and graphics integrity | `9.2` | `~9.2` | stable live line | stable live line | `10` |

## Read

Current local line strengths:

- combat responsiveness
- opening geometry
- capture/rescue behavior
- shell and panel integrity
- early dive safety

Current local line biggest gaps:

- stage-1 timing fidelity
- challenge-stage timing fidelity
- audio identity and cue alignment
- movement is only mid-pack and still worth smoothing, even after modest improvement over the shipped local baseline

## Release Use

Going forward:

- every serious `/dev` candidate should refresh this scorecard
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
  refreshed `5.6/10` audio category score
