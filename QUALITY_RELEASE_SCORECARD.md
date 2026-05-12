# Quality Release Scorecard

This scorecard compares the active Aurora lines against the current quality
conformance model.

Purpose:

- keep the current line, hosted `/dev`, hosted `/beta`, and hosted
  `/production` in one readable chart
- show where the biggest quality gaps are right now
- make the quality score part of release discussion, not a side note

As of May 12, 2026:

- current shipped family:
  - `1.3.0`
  - refreshed bundled quality score `9.2/10`
- hosted `/dev`:
  - `1.3.0.1` hosted-dev forward-review increment
  - current development quality score `9.2/10`
- hosted `/beta`:
  - refreshed `1.3.0 beta`
- hosted `/production`:
  - refreshed `1.3.0`

Branch-local refresh on May 11, 2026:

- branch:
  - `main`
- generated artifact:
  - `reference-artifacts/analyses/quality-conformance/2026-05-11-b83393cd/report.json`
- overall quality score:
  - `9.2/10`
- weakest category:
  - audio identity and cue alignment, `7.3/10`
- notes:
  - the accepted review line now includes conformance dashboard, public docs,
    economics reporting, application artifact conformance, runtime static sprite
    scoring, and a calibrated layered ship-loss audio cue
  - audio cue alignment remains green at `9/9`
  - semantic audio score remains high at `9.78/10`; acoustic event score is
    `6.31/10`
  - this branch-local refresh is now the live public baseline on hosted `/beta`
    and hosted `/production`, while hosted `/dev` remains the forward-review
    lane for the next coherent bundle

Readable project-level overview:

- [CONFORMANCE_METRIC_OVERVIEW.md](CONFORMANCE_METRIC_OVERVIEW.md)

## Legend

- plain number:
  - directly measured from a current harness/report
- `~number`:
  - inferred from preserved baseline report sections or from comparison to a
    nearby current line

## Branch-Local Conformance Table

This is the current local development read from the May 4, 2026 artifact above.
It is the best table to use when discussing what to improve next.

| Category | Branch-local score | Status | Next read |
| --- | ---: | --- | --- |
| Overall quality score | `9.2` | Strong | Good base, not a fidelity finish line. |
| Player movement conformance | `10.0` | Guardrail pass | Maxed at current scorer resolution; keep trace-backed before further tuning. |
| Shot and hit responsiveness | `10.0` | Strong | Preserve while changing movement and pacing. |
| Stage-1 opening timing fidelity | `8.5` | Good | Healthy but still measurable room remains. |
| Stage-1 opening geometry fidelity | `10.0` | Strong | Preserve during level expansion. |
| Dive fairness and safety | `9.1` | Strong | Keep watching collision pressure. |
| Capture and rescue rule fidelity | `10.0` | Strong | Preserve during platform/game separation work. |
| Challenge-stage timing fidelity | `9.2` | Strong timing | Variation and novelty are the gap, not baseline timing. |
| Level arc and encounter shape | `8.8` | Good | Improve long-run non-repetition and stage/reward texture. |
| Alien entry and challenge novelty | `7.8` | Needs work | Direct reference path labels, arrival style, and specialty-alien introduction. |
| Boss entry and formation grammar | `9.2` | Strong broad score | Improve direct path/slot reference precision. |
| Audio identity and cue alignment | `7.3` | Weakest | Move toward `7.5+` with calibrated event-gap work. |
| UI, shell, and graphics integrity | `9.2` | Strong | Surface gates are green again. |

## Hosted Lane Comparison Table

This table describes the current hosted shipped family, not the branch-local
Guardians/conformance work.

| Category | Refreshed `1.3.0` public family | Hosted `/dev` `1.3.0.1` review | Hosted `/beta` | Hosted `/production` | Reference gameplay |
| --- | ---: | ---: | ---: | ---: | ---: |
| Overall quality score | `9.2` | `9.2` | `9.2` | `9.2` | `10` |
| Player movement conformance | `10.0` | `10.0` | `10.0` | `10.0` | `10` |
| Shot and hit responsiveness | `10.0` | `10.0` | `10.0` | `10.0` | `10` |
| Stage-1 opening timing fidelity | `8.5` | `8.5` | `8.5` | `8.5` | `10` |
| Stage-1 opening geometry fidelity | `10.0` | `10.0` | `10.0` | `10.0` | `10` |
| Dive fairness and safety | `9.1` | `9.1` | `9.1` | `9.1` | `10` |
| Capture and rescue rule fidelity | `10.0` | `10.0` | `10.0` | `10.0` | `10` |
| Challenge-stage timing fidelity | `9.2` | `9.2` | `9.2` | `9.2` | `10` |
| Level arc and encounter shape | `8.8` | `8.8` | `8.8` | `8.8` | `10` |
| Alien entry and challenge novelty | `7.8` | `7.8` | `7.8` | `7.8` | `10` |
| Boss entry and formation grammar | `9.2` | `9.2` | `9.2` | `9.2` | `10` |
| Audio identity and cue alignment | `7.3` | `7.3` | `7.3` | `7.3` | `10` |
| UI, shell, and graphics integrity | `9.2` | `9.2` | `9.2` | `9.2` | `10` |

## Read

Current shipped-family strengths:

- combat responsiveness
- geometry and spacing fidelity
- capture/rescue correctness
- shell and panel integrity
- early dive safety
- stage and challenge timing compared with the older public line

Current biggest public-family gaps:

- audio identity remains the weakest high-value category, now at `7.3/10`
- alien entry, challenge-stage arrival/novelty, and level arc are the strongest
  gameplay-authenticity targets for the next arcade-depth cycle
- static sprite/runtime visual scoring is useful but incomplete until temporal
  motion windows cover flapping, pulsing, dive rotation, capture/rescue, and
  dual-fighter transitions
- the next major gains should combine player-visible polish with reusable
  scoring and ingestion improvements

## Release Use

Going forward:

- every serious `/dev` or `/beta` candidate should refresh this scorecard
- every serious release candidate should refresh
  `RELEASE_CONFORMANCE_DASHBOARD.md` alongside the scorecard so the release
  record includes conformance analysis, score tables, economics charts,
  resource/time usage, past-goal movement, and next-goal estimates
- `/beta` release notes should include the latest quality score and the top
  remaining gaps
- `/production` release notes should include the approved-beta quality score and
  what was intentionally accepted for ship
- the scorecard itself should be committed whenever it materially changes

## Current Interpretation

Current conclusion:

- the shipped `1.3.0` family reads like a meaningful quality-and-platform
  release, not a patch-sized follow-up
- the refreshed public `1.3.0` family now carries the accepted `1.3.0.1`
  conformance/docs bundle
- hosted `/dev` remains intentionally ahead only as the visible forward-review
  line for the next cycle
- the next cycle should focus on audio identity, alien/challenge-stage novelty,
  level arc, visual artifact motion scoring, second-game/platform maturity, and
  stronger analysis/harness depth rather than broad emergency repair
