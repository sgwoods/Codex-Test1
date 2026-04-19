# Aurora And Platinum Development Principles

This document records the working principles for `Aurora Galactica`,
`Platinum`, and future hosted games.

Use it when deciding:

- how bugs should be fixed
- how fast iteration should stay disciplined
- how original arcade references should be studied
- how tribute, variation, and platform separation should be balanced
- how progression and persona evidence should shape tuning work

## Core Intent

The project has two linked goals:

- build and ship arcade games that feel worthy as tributes to their original
  inspirations
- build and maintain `Platinum` as a reusable host platform that does not
  absorb game-specific rules by accident

`Aurora Galactica` is the first proof of that model.

Future games such as the `Galaxian`-inspired second game should deepen that
proof rather than blur the boundary again.

## Bug-Fix Rule

We should not address a bug without also deciding how the bug is protected in
the appropriate staging harness.

That means:

1. describe the bug clearly
2. identify the right harness family:
   - platform
   - application
   - boundary
   - release / pipeline
3. add or update a targeted automated check whenever the behavior is stable
   enough to measure
4. only rely on manual review alone when the behavior is still too subjective
   or too early to automate well

The principle is simple:

- no silent bug fixes
- no trust in memory alone
- no regression exposure without a deliberate reason

## Agility With Discipline

We want to stay agile in early development and fast when closing bugs.

We also want to be disciplined enough that speed does not quietly introduce:

- regressions
- release-lane confusion
- platform/application leakage
- undocumented behavior drift

The intended balance is:

- fast local iteration
- small isolated branches
- commit-first work
- targeted harness coverage
- increasingly strict release discipline as work approaches hosted `/beta` and
  hosted `/production`

## Platform And Application Separation

`Platinum` should own:

- shell framing and hosted lane behavior
- shared docs and release discipline
- pack selection and shared boot path
- shared auth, leaderboard, replay, and feedback service boundaries

Applications such as `Aurora` should own:

- rules
- scoring
- stage flow
- enemy behavior
- audiovisual identity that belongs to the game itself
- gameplay harnesses

Crossing that seam is allowed only when intentional and explicit.

We should treat accidental leakage as a defect, not as harmless convenience.

## Reference-Driven Fidelity Program

We want to ingest and analyze original games such as `Galaga` and `Galaxian`
as real reference material, not just as vague inspiration.

Reference work should study:

- source and rules where available
- pacing
- progression structure
- control feel
- challenge shape
- visuals and sprite readability
- graphics cadence and motion
- sound and cue timing
- overall player experience

Where possible, these assessments should become durable reference artifacts
rather than one-off impressions.

Preferred outputs include:

- timing analyses
- event-family libraries
- contact sheets
- captured clips
- audio cue matrices
- waveforms
- scenario logs
- harness metrics
- written baselines that map reference behavior to candidate work

Manual judgment still matters, but measured artifacts should be the default
starting point.

## Tribute With Room For Variation

The goal is not perfect museum reconstruction at every moment.

The goal is to create games that feel true as tributes to the original arcade
experience while still allowing inspired variations where they improve the
hosted game or clarify its identity.

The working rule is:

- preserve the original game's core feel, pacing, rules logic, and expressive
  identity whenever those are central to the tribute
- allow variation when it is intentional, documented, and still respectful of
  the original experience
- prefer game-owned variation over platform-owned special cases

If a change moves away from the original inspiration, we should be able to say:

- why it diverges
- what it improves
- how we know it still feels true enough

## Persona And Progression Principle

The games should support different personas and show that deeper progression is
possible with increasing skill and experience.

That means tuning should demonstrate:

- novice play can understand and enter the game
- intermediate play can progress farther with learned control and pattern
  recognition
- advanced play can survive and score deeper into the run
- later stages become meaningfully more demanding rather than merely noisier

This should be supported through:

- persona-aware harnesses where useful
- repeatable input and progression traces
- difficulty evidence drawn from stage metrics, losses, score flow, and pacing
- manual validation of feel after the evidence is collected

## Reference Program For Future Games

The reference-artifact pattern used for `Galaga` should later be reused for the
`Galaxian`-inspired second game and future packs.

That means we should favor reference work that can scale:

- durable event families
- reusable timing analysis patterns
- game-owned cue/state mappings
- comparable visual and pacing reports

The point is not just to tune one game well.

It is to build a repeatable way to create respectful, well-measured arcade
tributes on top of `Platinum`.

## Release Implication

As work approaches release lanes, these principles should become stricter, not
looser.

In practice:

- bug fixes should bring harness coverage or an explicit automation plan
- fidelity changes should reference measured artifacts where possible
- platform/application changes should state the seam they touch
- release candidates should not rely on undocumented intent

These principles are meant to keep the project both creative and trustworthy.
