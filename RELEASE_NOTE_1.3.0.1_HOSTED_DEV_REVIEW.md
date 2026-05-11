# Release Note: 1.3.0.1 Hosted Dev Review

Date: May 11, 2026

Release track: hosted-dev review increment

Authority posture: MacBook may prepare, commit, push, merge, and publish hosted
`/dev`; hosted `/beta` and `/production` remain authority-gated on
`imacm1 / iMacM1` unless release authority is explicitly transferred.

## Summary

`1.3.0.1` is the first post-`1.3.0` review increment. It keeps production and
beta stable on the shipped `1.3.0` family while using hosted `/dev` to review a
coherent conformance bundle: refreshed dashboards and public docs, conformance
economics, application artifact scoring, runtime sprite-capture scoring, and a
measured audio/event-feedback lift.

This is not a production promotion. It is the package to review before asking
the release-authority machine to publish the next hosted `/beta` candidate.

## Player-Visible Improvements

- Ship-loss feedback is more arcade-complete: the calibrated layered
  `playerHit` cue preserves a fuller death phrase while maintaining cue
  alignment, semantic event scoring, and overall quality guardrails.
- Inter-level and final-loss audio reliability is better protected: critical
  reference cues now have runtime-recovery coverage so transition, loss,
  game-over, and next-start cues actually begin in the browser runtime.
- Start/wait-mode and boss-first-hit presentation have been cleaned up enough
  that the current review bundle reads more coherent than the shipped baseline,
  while larger visual-authenticity work remains queued.
- The conformance dashboard and public project documentation now expose more of
  the real development story: what improved, what remains weak, what it cost,
  and what should be attacked next.

## Conformance And Evidence

Current maintained Aurora read:

| Area | Current Read | Notes |
| --- | ---: | --- |
| Overall quality | `9.2/10` | Current release-quality roll-up. |
| Audio identity and cue alignment | `7.3/10` | Weakest high-value category, but improved after calibrated ship-loss promotion. |
| Audio semantic event score | `9.78/10` | Event meanings remain strong. |
| Audio acoustic event score | `6.31/10` | Still the main audio gap; highest current segment risk is `playerHit` tail. |
| Audio cue alignment | `9/9` | Alignment guardrail preserved. |
| Level arc and encounter shape | `8.8/10` | First-class long-play/gameplay-shape category. |
| Alien entry and challenge novelty | `7.8/10` | High-priority gameplay-authenticity gap. |
| Boss entry and formation grammar | `9.2/10` | Strong broad score, but direct path/slot reference precision remains next. |
| Application artifact conformance | about `8.25/10` | Aggregates sprites, audio, frame surfaces, text, level shape, and choreography. |
| Runtime static sprite canvas score | about `6.2/10` | Static pose only; active motion is explicitly unscored/planning. |

Important interpretation: a `10/10` metric means maxed at current scorer
resolution, not perfect arcade imitation. Confidence and resolution are part of
the release story because a better scorer may lower a score while improving the
truthfulness of the project.

## Platform And Harness Improvements

- Audio candidate work now leaves behind reusable cue-contract, focused
  candidate, promotion-precheck, runtime-recapture, and event-gap artifacts.
- Composite/layered audio cue scoring can evaluate scheduled onset/body/tail
  windows instead of only the loudest active island.
- Runtime sprite conformance can capture isolated live canvas crops and score
  those visible pixels separately from documentation/catalog proxy scores.
- Application artifact conformance now aggregates game-artifact surfaces beyond
  aliens: sprites, sprite motion planning, audio cues, audio alignment,
  backgrounds, frame/popups/icons, fonts/text, level shape, and boss/formation
  choreography.
- Conformance economics tracks local CPU/browser spend, GPU-equivalent
  Codex/OpenAI/API effort, artifact growth, and cost-per-score movement.

## Documentation Refresh

The release documentation now treats the conformance project as a first-class
product effort rather than an internal note. The key maintained surfaces are:

- `PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md`
- `CONFORMANCE_METRICS_OVERVIEW.md`
- `RELEASE_CONFORMANCE_DASHBOARD.md`
- `CONFORMANCE_ECONOMICS.md`
- `GAME_CONFORMANCE_CATALOG.md`
- `AUDIO_CONFORMANCE_LAB.md`
- `STRATEGIC_BETA_REVIEW.md`
- hosted project guide, application guide, conformance dashboard, release
  dashboard, public project page, and `documentation-provenance.json`

The hosted public project page and project guide now render a documentation
provenance section from `documentation-provenance.json`, and publish preflight
checks fail if that source map or generated section disappears. Current scores,
costs, release posture, game status, and artifact claims should therefore be
changed in their persistent source artifacts first, then rebuilt into the
visible pages.

Documentation suggestions carried forward:

- Add timeline charts that show conformance score movement beside CPU,
  browser, GPU-equivalent model, and artifact-volume spend.
- Add release-story charts that separate gameplay-facing gains from
  measurement-facing gains.
- Add confidence/resolution timelines so a score drop caused by a better
  scorer is visibly different from a gameplay regression.
- Add more drill-down from the public project page into game-specific alien,
  audio, stage, persona, sprite, and artifact-conformance tables.
- Add direct beta handoff checklists to make authority-gated release movement
  easier to verify from any machine.

## Known Gaps

- Audio remains the weakest high-value category. `stagePulse` needs a better
  pressure-bed strategy, and the residual `playerHit` tail gap should be
  refined with calibrated browser-reference evidence.
- Challenging stages still need stronger Galaga-like arrival, movement,
  specialty-alien introduction, and bonus-opportunity novelty.
- Static sprite scoring is useful but incomplete; sprite identity includes
  flapping, pulsing, dive rotation, capture/rescue, carried-fighter, and
  dual-fighter transitions that need temporal harness windows.
- Visual explosion and boss damage feedback are improved but still not fully
  reference-authentic.
- GPU-equivalent accounting is now conceptually represented, but Codex/model
  effort still depends on deliberate manual ledger entries and usage snapshots.

## Beta Handoff

If this hosted-dev review is accepted, the authority machine should:

1. pull `origin/main`
2. run `npm run machine:bootstrap`
3. run `npm run machine:status`
4. run `npm run machine:doctor`
5. confirm `npm run release:show-authority`
6. run `npm run build`
7. run `npm run harness:check:documentation-freshness`
8. run `npm run publish:check:dev`
9. inspect hosted `/dev`
10. publish hosted `/beta` only from the authority machine
11. run hosted beta verification and update the strategic beta review with the
    final lane stamp and any accepted gaps

## Next Plan

Short term:

- complete hosted-dev review and beta-request handoff
- keep source docs, dashboard, release note, and public surfaces aligned

Medium term:

- move audio from `7.3/10` toward `7.5+`
- attack alien entry, challenge-stage novelty, level arc, and direct
  path/slot reference precision
- add temporal sprite-motion scoring instead of relying on static crops

Longer term:

- shape `1.4.0` as the arcade-depth family
- keep Galaxy Guardians in ingestion-backed preview until its own conformance
  package proves a real second game
- continue shifting repeatable assessment into local CPU/browser harnesses while
  using Codex/model work to design better evaluators, code, and review loops
