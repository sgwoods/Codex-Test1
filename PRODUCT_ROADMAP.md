# Product Roadmap

## Current Release Train

- Current line:
  - `0.5.x-alpha`
- Current phase:
  - `alpha`
- Goal of this phase:
  - turn the project from a strong tribute prototype into a more faithful, stable arcade experience

## Milestone A: Core Fidelity Alpha

Target outcome:

- Strong Stage 1 through Stage 5 feel
- Stable challenge stages
- Capture/rescue behavior feels useful and understandable
- Manual-backed scoring and results flow are largely in place

Key issue groups:

- Gameplay tuning
  - `#4` Stage 1 fidelity
  - `#15` dual-fighter shot usefulness
  - `#16` alien descent speed validation
- Manual-backed arcade rules
  - `#20` captured-fighter destruction scoring
  - `#21` special attack squadron bonuses
  - `#22` challenge-stage bonus scoring
  - `#23` results screen before initials
- Capture/rescue rules
  - `#14` second captured-fighter behavior research

Suggested versioning:

- stay on `0.5.x-alpha`

Execution model:

- Use the autonomous reference-baseline track to decide what "closer to Galaga"
  means
- Use the collaborator-readiness track to make sure new contributors can help
  without re-learning the whole project

## Milestone B: Later-Stage Depth Alpha

Target outcome:

- Later stages are not just “same enemies, more pressure”
- Better stage-to-stage variety and progression
- Stage 4+ survivability is stable under harness and real play
- Stage-banded enemy-family progression is visible and measurable

Key issue groups:

- Later-stage survivability
  - collision-heavy Stage 4/5 pressure tuning
- Later-stage variety
  - initial stage-band family progression has landed
  - remaining work is deeper transform / behavior fidelity beyond the first banded pass
- Visual/gameplay comparison baseline
  - `#17` stronger baseline against original Galaga

Suggested versioning:

- move to `0.6.0-alpha.1` once this milestone is clearly underway

## Milestone C: Beta Readiness

Target outcome:

- Core rules and scoring feel settled
- Hosted build is reliable enough for broader playtesting
- Capture, challenge, and later-stage content are coherent as a product

Key issue groups:

- Feedback and submission workflow
  - `#7` FormSubmit / Modem viability
  - `#8` structured run submission
- Replay and testing infrastructure
  - `#5` replay / watch mode
  - harness coverage and analysis expansion
- Presentation polish
  - UI/readability/fidelity items that remain after core rule work

Suggested versioning:

- `0.7.x-alpha` to finish readiness work
- `0.8.0-beta.1` when we intentionally open broader testing

## Milestone D: 1.0 Candidate

Target outcome:

- Rules are stable
- Core arcade feel is consistent
- Main fidelity gaps are either closed or consciously accepted
- Hosted build is trustworthy as the canonical public version

Suggested versioning:

- `0.9.x-rc`
- `1.0.0`

## How We Should Use This Roadmap

- Use it to decide when a `PATCH` bump is enough versus when a `MINOR` bump is justified
- Use it to group open issues into meaningful release targets instead of treating the backlog as a flat list
- Use it as the default basis for Codex release recommendations after each meaningful pass
