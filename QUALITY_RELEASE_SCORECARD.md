# Quality Release Scorecard

This scorecard compares the active Aurora lines against the current quality
conformance model.

Purpose:

- keep the current line, hosted `/dev`, hosted `/beta`, and hosted
  `/production` in one readable chart
- show where the biggest quality gaps are right now
- make the quality score part of release discussion, not a side note

As of April 26, 2026:

- current shipped family:
  - `1.2.3+build.532.sha.b959491`
  - bundled quality score `8.8/10`
- hosted `/dev`:
  - `1.2.3+build.532.sha.b959491`
  - built `Apr 26 2026, 7:25 PM EDT`
- hosted `/beta`:
  - `1.2.3-beta.1+build.532.sha.b959491.beta`
  - built `Apr 26 2026, 7:27 PM EDT`
- hosted `/production`:
  - `1.2.3+build.532.sha.b959491`
  - built `Apr 26 2026, 7:27 PM EDT`

Branch-local refresh on May 2, 2026:

- branch:
  - `codex/macbook-pro-guardians-identity-0-1-candidate`
- commit:
  - `7ef349b`
- generated artifact:
  - `reference-artifacts/analyses/quality-conformance/2026-05-02-7ef349b/`
- overall quality score:
  - `8.8/10`
- weakest category:
  - audio identity and cue alignment, `6.1/10`
- notes:
  - the dev-candidate surface suite is green again after refreshing stale
    leaderboard, attract-score, and audio phase expectations
  - the current player movement score from the refreshed artifact is `8.0/10`
  - this branch-local refresh does not by itself approve or publish beta or
    production

Readable project-level overview:

- [CONFORMANCE_METRIC_OVERVIEW.md](CONFORMANCE_METRIC_OVERVIEW.md)

## Legend

- plain number:
  - directly measured from a current harness/report
- `~number`:
  - inferred from preserved baseline report sections or from comparison to a
    nearby current line

## Branch-Local Conformance Table

This is the current local development read from the May 2, 2026 artifact above.
It is the best table to use when discussing what to improve next.

| Category | Branch-local score | Status | Next read |
| --- | ---: | --- | --- |
| Overall quality score | `8.8` | Strong | Good base, not a fidelity finish line. |
| Player movement conformance | `8.0` | Needs work | Main feel gap after audio; use reference traces before tuning. |
| Shot and hit responsiveness | `10.0` | Strong | Preserve while changing movement and pacing. |
| Stage-1 opening timing fidelity | `8.5` | Good | Healthy but still measurable room remains. |
| Stage-1 opening geometry fidelity | `10.0` | Strong | Preserve during level expansion. |
| Dive fairness and safety | `9.1` | Strong | Keep watching collision pressure. |
| Capture and rescue rule fidelity | `10.0` | Strong | Preserve during platform/game separation work. |
| Challenge-stage timing fidelity | `8.4` | Needs work | Timing is decent; content depth still needs expansion. |
| Progression and persona depth | `8.8` | Good | One ordering edge case remains visible. |
| Audio identity and cue alignment | `6.1` | Weakest | Highest-priority conformance gap. |
| UI, shell, and graphics integrity | `9.2` | Strong | Surface gates are green again. |

## Hosted Lane Comparison Table

This table describes the current hosted shipped family, not the branch-local
Guardians/conformance work.

| Category | Current shipped line | Hosted `/dev` | Hosted `/beta` | Hosted `/production` | Reference gameplay |
| --- | ---: | ---: | ---: | ---: | ---: |
| Overall quality score | `8.8` | `8.8` | `8.8` | `8.8` | `10` |
| Player movement conformance | `8.4` | `8.4` | `8.4` | `8.4` | `10` |
| Shot and hit responsiveness | `10.0` | `~10.0` | `10.0` | `10.0` | `10` |
| Stage-1 opening timing fidelity | `8.5` | `8.5` | `8.5` | `8.5` | `10` |
| Stage-1 opening geometry fidelity | `10.0` | `10.0` | `10.0` | `10.0` | `10` |
| Dive fairness and safety | `9.1` | `9.1` | `9.1` | `9.1` | `10` |
| Capture and rescue rule fidelity | `10.0` | `10.0` | `10.0` | `10.0` | `10` |
| Challenge-stage timing fidelity | `8.4` | `8.4` | `8.4` | `8.4` | `10` |
| Progression and persona depth | `8.8` | `8.8` | `8.8` | `8.8` | `10` |
| Audio identity and cue alignment | `6.1` | `6.1` | `6.1` | `6.1` | `10` |
| UI, shell, and graphics integrity | `9.2` | `9.2` | `9.2` | `9.2` | `10` |

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
- dev, beta, and production are now aligned on the same current line
- the next cycle should focus on movement feel, audio identity, gameplay trust
  follow-up, second-game/platform maturity, and stronger analysis/harness depth
  rather than broad emergency repair
