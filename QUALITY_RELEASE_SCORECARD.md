# Quality Release Scorecard

This scorecard compares the active Aurora lines against the current quality
conformance model.

Purpose:

- keep the current line, hosted `/dev`, hosted `/beta`, and hosted
  `/production` in one readable chart
- show where the biggest quality gaps are right now
- make the quality score part of release discussion, not a side note

As of April 25, 2026:

- current shipped family:
  - `1.2.3+build.489.sha.f6ba6c2`
  - bundled quality score `8.8/10`
- hosted `/dev`:
  - `1.2.3+build.470.sha.e4732eb`
  - built `Apr 23 2026, 3:15 PM EDT`
- hosted `/beta`:
  - `1.2.3-beta.1+build.489.sha.f6ba6c2.beta`
  - built `Apr 24 2026, 7:03 PM EDT`
- hosted `/production`:
  - `1.2.3+build.489.sha.f6ba6c2`
  - built `Apr 24 2026, 7:03 PM EDT`

## Legend

- plain number:
  - directly measured from a current harness/report
- `~number`:
  - inferred from preserved baseline report sections or from comparison to a
    nearby current line

## Current Comparison Table

| Category | Current shipped line | Hosted `/dev` | Hosted `/beta` | Hosted `/production` | Reference gameplay |
| --- | ---: | ---: | ---: | ---: | ---: |
| Overall quality score | `8.8` | `~8.3` | `8.8` | `8.8` | `10` |
| Player movement conformance | `8.4` | `~5.9` | `8.4` | `8.4` | `10` |
| Shot and hit responsiveness | `10.0` | `~10.0` | `10.0` | `10.0` | `10` |
| Stage-1 opening timing fidelity | `8.5` | `~5.6` | `8.5` | `8.5` | `10` |
| Stage-1 opening geometry fidelity | `10.0` | `~10.0` | `10.0` | `10.0` | `10` |
| Dive fairness and safety | `9.1` | `~9.1` | `9.1` | `9.1` | `10` |
| Capture and rescue rule fidelity | `10.0` | `~10.0` | `10.0` | `10.0` | `10` |
| Challenge-stage timing fidelity | `8.4` | `~8.4` | `8.4` | `8.4` | `10` |
| Progression and persona depth | `8.8` | `~8.8` | `8.8` | `8.8` | `10` |
| Audio identity and cue alignment | `6.1` | `~5.6` | `6.1` | `6.1` | `10` |
| UI, shell, and graphics integrity | `9.2` | `~9.2` | `9.2` | `9.2` | `10` |

## Read

Current shipped-family strengths:

- combat responsiveness
- geometry and spacing fidelity
- capture/rescue correctness
- shell and panel integrity
- early dive safety
- stage and challenge timing compared with the older public line

Current biggest gaps:

- audio identity remains the weakest bundled category
- movement is much healthier than before, but still worth refining further for
  feel
- the next major gains are more likely to come from polish than from basic
  correctness repair

## Release Use

Going forward:

- every serious `/dev` or `/beta` candidate should refresh this scorecard
- `/beta` release notes should include the latest quality score and the top
  remaining gaps
- `/production` release notes should include the approved-beta quality score and
  what was intentionally accepted for ship
- the scorecard itself should be committed whenever it materially changes

## Current Interpretation

Current conclusion:

- the shipped `1.2.3` family reads like a strong public release, not a recovery
  build
- hosted `/dev` is still meaningfully behind the shipped family
- the next cycle should focus on movement feel, audio identity, gameplay trust
  fixes, and platform maturity rather than broad emergency repair
