# Aurora Galactica: 10-Day V1 Execution Plan

Date: March 26, 2026
Project: Aurora Galactica
Working repo: `/Users/stevenwoods/Documents/Codex-Test1`

## Purpose

This plan defines a realistic way to:

1. finish the `v1` launch push for Aurora Galactica
2. reduce launch risk materially
3. add enough architectural seams to keep the codebase evolvable
4. avoid stopping for a full platform refactor before release

This is not a plan to finish a complete cross-game platform in 10 days. It is a
plan to ship `v1` while landing the highest-value architectural work that makes
post-`v1` platformization straightforward.

## Executive Summary

The correct 10-day target is:

- ship Aurora Galactica `v1`
- close or explicitly disposition the current launch blockers
- harden the regression and release pipeline
- add thin architectural seams:
  - `gameDef`
  - stage tuning data tables
  - optional-system boundaries
  - stable event and harness vocabulary

The wrong 10-day target is:

- ship `v1`
- fully generalize the runtime into a reusable arcade engine
- also stand up Galaxian as a second supported game

That larger goal should follow `v1`, not block it.

## Scope

### In scope for the next 10 days

- launch blockers and beta-review closure
- Stage 2 and Stage 4 fairness tuning
- release-readiness work:
  - security review
  - code documentation pass
  - product/docs consistency refresh
  - players guide
- production vs non-production data-path decision and implementation
- thin-seam refactor work that improves evolvability without destabilizing the game

### Explicitly out of scope for this 10-day plan

- full arcade-platform extraction
- implementing Galaxian as a second game
- generalized multi-game menu/runtime
- major theme/template expansion work
- broad speculative framework work

## Success Definition

Day-10 success means all of the following are true:

1. Aurora Galactica is ready to promote as `v1` or is one very small, explicit
   decision away from promotion.
2. The launch blocker list is short, stable, and justified.
3. The beta-review cluster is largely closed or downgraded to low-risk polish.
4. Stage 2 and Stage 4 pressure have better evidence, better automation, and
   better tuned outcomes than today.
5. The release/readiness materials are coherent:
   - security review
   - code docs
   - consistent public docs
   - players guide
6. The codebase has thin seams that reduce future refactor risk:
   - a `gameDef` concept exists
   - stage tuning is more data-driven
   - optional systems are explicit
   - harness checks are mechanic-based, not just bug-based

## Team Model

This plan assumes multiple agents working in parallel.

### Track A: Gameplay Strike Team

Owners: 2 agents

Focus:

- `#18` Stage 4 fairness
- `#32` Stage 2 fairness
- `#38` ship-loss feel
- `#74` / `#47` squadron readability
- manual-beta feedback integration

Output:

- tuned gameplay changes
- passing guardrails
- beta-ready builds

### Track B: Rules / Capture / Challenge Team

Owners: 1 agent

Focus:

- `#40`
- `#73`
- `#77`
- `#78`
- `#80`
- `#88`

Output:

- close remaining capture/challenge correctness issues
- keep these paths guarded by automation

### Track C: Architecture / Thin-Seam Team

Owners: 2 agents

Focus:

- introduce `gameDef`
- move more stage tuning into data
- make optional systems explicit:
  - capture
  - challenge
  - squadron/special attacks
  - dual fighter
- keep behavior stable while reducing coupling

Output:

- cleaner runtime boundaries
- less hard-coded game-specific logic in the engine path

### Track D: Harness / Regression Team

Owners: 1 to 2 agents

Focus:

- pressure guards
- flaky scenario cleanup
- scenario abstractions by mechanic
- persona recalibration after difficulty changes
- acceptance suite for launch

Output:

- reliable regression signal
- less time wasted on ambiguous failures

### Track E: Release / Docs / Product Team

Owners: 1 agent

Focus:

- `#76` data-path separation
- `#85` release-readiness pass
- `#86` UI/guide/sign-in/settings polish
- players guide
- documentation refresh
- security review

Output:

- launch-ready product surface
- release support materials

## Core Principles

1. No broad refactor without a regression guard.
2. No speculative platform work that does not help Aurora today.
3. Every gameplay change must have:
   - manual reason
   - harness acceptance signal
   - rollback path
4. Refactor work must be seam-oriented, not aesthetic.
5. If the plan slips, cut platform ambition before cutting launch integrity.

## Day-by-Day Plan

## Day 1: Stabilize The Review Cluster

Goals:

- close or sharply re-scope the remaining beta-review items
- remove ambiguity from capture/challenge/squadron presentation

Primary work:

- review latest beta findings
- fix any remaining capture/carry presentation gaps
- finalize current squadron pass or explicitly reopen it
- ensure all existing automated checks are green and trustworthy

Exit criteria:

- beta-review cluster is materially smaller
- open items are explicit and specific, not vague

## Day 2: Finish The Mechanic-Level Guards

Goals:

- make launch-critical mechanics less dependent on manual-only review

Primary work:

- extend mechanic-based harness checks where they still pay off
- fix harness flakiness that blocks trust
- confirm persona and stage-pressure reporting still reflect current behavior

Exit criteria:

- launch-critical mechanics have reliable pass/fail checks where appropriate
- flaky harness paths are either fixed or quarantined with timeouts and notes

## Day 3: Stage 2 Fairness Pass

Goals:

- improve Stage 2 survival/readability without over-softening the game

Primary work:

- tune dive geometry and lane convergence
- use pressure metrics to avoid guessing about bullet density
- rerun personas after changes

Acceptance bar:

- better Stage 2 outcomes
- no major regression in Stage 1 or Stage 4 guardrails

Exit criteria:

- `#32` is either improved and kept, or reverted with a clearer diagnosis

## Day 4: Stage 4 Fairness Pass

Goals:

- reduce unfair collapse and escort-chain pressure

Primary work:

- tune Stage 4 escort/convergence pressure
- use the pressure guard to prevent accidental worsening
- compare advanced/expert/professional outcomes

Exit criteria:

- `#18` is improved or sharply narrowed
- no new regression in capture/challenge/squadron behavior

## Day 5: Thin-Seam Refactor Part 1

Goals:

- create architectural leverage without destabilizing launch

Primary work:

- introduce `gameDef`
- move obvious stage/rules constants behind data/config
- centralize optional-system flags

Exit criteria:

- runtime still behaves the same
- harness still passes
- the code is more evolvable than before

## Day 6: Thin-Seam Refactor Part 2

Goals:

- deepen the seams enough that post-`v1` platformization becomes practical

Primary work:

- continue stage tuning table extraction
- make optional systems more explicit in code flow
- improve telemetry/event stability as an API

Exit criteria:

- `gameDef` and data-driven tuning are real, not aspirational
- the refactor remains behavior-preserving

## Day 7: Release Integrity And Security

Goals:

- remove launch-risk around environment/data handling
- complete security and integrity review

Primary work:

- `#76` production vs non-production data path
- release-surface sanity review
- security review of runtime, public integrations, and score flow

Exit criteria:

- environment strategy is implemented or locked
- security review produces explicit outcomes, not open-ended concern

## Day 8: Documentation And Product Surface

Goals:

- make the project understandable and presentable to users

Primary work:

- code documentation cycle
- consistency refresh across docs/materials
- short players guide
- UI improvements from `#86`

Exit criteria:

- docs are coherent
- players guide exists and is linkable
- product surface feels intentionally organized

## Day 9: Final Beta Sweep

Goals:

- run the near-final launch review with all major work landed

Primary work:

- rerun critical harness suite
- beta smoke pass
- manual feel checks
- confirm public surfaces and labels

Exit criteria:

- blocker list is short and decision-ready
- no hidden release-surface surprises remain

## Day 10: Launch Decision Day

Goals:

- make the release decision cleanly

Primary work:

- final blocker review
- final issue disposition
- release notes and final documentation touch-ups
- production promotion if the bar is met

Exit criteria:

- launch
- or a very small final punch list with explicit owners and dates

## Work Breakdown By Deliverable

### Gameplay deliverables

- Stage 2 fairness pass
- Stage 4 fairness pass
- final squadron readability pass
- ship-loss feel decision

### Architecture deliverables

- `gameDef` seam
- stage-tuning data tables
- optional-system boundaries
- stable telemetry vocabulary

### Harness deliverables

- reliable mechanic guards
- stable pressure check
- less flaky scenario behavior
- persona recalibration after difficulty changes

### Release deliverables

- environment split decision and implementation
- security review
- code documentation pass
- players guide
- consistent public materials

## Risks

## Risk 1: Stage 2 And Stage 4 Still Take Longer Than Expected

Why it matters:

- these remain the most meaningful gameplay blockers

Mitigation:

- assign dedicated gameplay owners
- use pressure guards and personas for faster iteration
- revert quickly when a pass clearly regresses

## Risk 2: Thin-Seam Refactor Creates Late Regressions

Why it matters:

- refactor churn can silently change the game

Mitigation:

- limit refactor to seams, not broad rewrites
- require harness coverage before landing structural changes
- keep refactor and gameplay workstream ownership separate

## Risk 3: Harness Flakiness Corrupts Decision-Making

Why it matters:

- a flaky guard wastes time and blocks good changes

Mitigation:

- dedicate a harness owner
- add timeouts and cleaner failure modes
- quarantine known-flaky paths until fixed

## Risk 4: Documentation And Release Work Gets Squeezed Late

Why it matters:

- this is common and creates sloppy launches

Mitigation:

- dedicate a release/docs track
- do not leave all release materials for Day 10

## Risk 5: Scope Creep Toward “Full Platformization”

Why it matters:

- this is the fastest way to miss both the launch and the architectural goal

Mitigation:

- keep the 10-day architectural scope to thin seams only
- defer full engine extraction and second-game implementation

## Decision Rules If We Slip

If we fall behind, cut in this order:

1. broad architectural ambition
2. non-essential UI polish
3. lower-priority post-`v1` documentation polish

Do not cut:

1. launch integrity
2. Stage 2 / Stage 4 fairness work
3. regression coverage on critical mechanics
4. security/release-readiness review

## Thin-Seam Work We Should Absolutely Keep

These are the highest-value incremental investments:

1. `gameDef`
2. stage-tuning data tables
3. explicit optional systems
4. mechanic-level harness abstractions
5. stable telemetry vocabulary

These are the investments that buy long-term evolvability without forcing a
full platform stop right now.

## Post-V1 Follow-Through

Immediately after `v1`, the next major architecture move should be:

1. complete the Aurora-only platform extraction
2. move shared runtime into a clearer engine layer
3. prove the model by adding a second game pack, likely Galaxian

That post-`v1` effort should start from the seams landed here, not from
scratch.

## Final Recommendation

The best achievable 10-day plan is:

- launch Aurora Galactica `v1`
- strengthen the harness and release workflow
- land thin seams that make the project evolvable
- defer full platformization until immediately after release

That gets the product out the door without trapping the codebase in a
non-evolvable state.
