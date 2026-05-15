# MacBook Post-Beta 10-Hour Conformance Plan

Created: May 15, 2026

Branch: `codex/macbook-post-beta-conformance-10h`

Base: `af3f2b85` (`Record c9d9bb47 beta review cycle`)

Beta context:

- hosted `/dev` was reviewed from `c9d9bb47`
- the iMacM1 authority machine preserved review artifacts in `af3f2b85`
- hosted `/beta` was published from `af3f2b85`
- beta label: `1.4.0-beta.1+build.747.sha.af3f2b85.beta`

Release authority remains on `imacm1 / iMacM1`. This MacBook may develop,
test, branch, commit, push, merge normal development work, and publish hosted
`/dev` when appropriate. It must not approve or publish beta or production
unless release authority is explicitly transferred.

## Top-Level Goal

Use a 10-hour MacBook work block to make measurable progress toward the next
post-beta `1.4.0` quality bundle while keeping every improvement tied to
persistent evidence. The work should improve Aurora player experience, improve
the reusable ingestion/conformance harness, and keep the public project docs
and dashboard aligned with what we learn.

The strongest near-term value is expected from audio UX conformance, challenge
stage arrival/variation, boss and formation choreography, persona distribution
evidence, and conformance economics reporting.

## Work Plan

| Time | Focus | Goal | Expected output |
| ---: | --- | --- | --- |
| 0:00-0:30 | Sync and branch | Pull `main` through `af3f2b85`, verify machine state, and create a short-lived development branch | Clean branch from the beta-published source head |
| 0:30-1:30 | Beta/dev review pass | Compare local/dev/beta behavior for the new bundle | Notes or issues for Player Two, Watch Mode, music/SFX, scoreboard, dashboards, docs, and Galaxy Guardians preview containment |
| 1:30-3:30 | Audio UX conformance | Attack high-value audio gaps: inter-level audio length, stage transition cue clarity, runtime recovery, impact/loss/reward readability | Harness updates, candidate artifacts, and runtime fixes where measurement supports them |
| 3:30-5:30 | Challenge-stage conformance | Improve metrics and behavior around alien arrival, novelty, trajectories, and stage variation | Updated challenge-stage scoring plus at least one gameplay or harness improvement |
| 5:30-7:00 | Boss/formation choreography | Improve boss entry, first-hit feedback, missile/pass-through feel, and formation-settle timing | Better measured formation/boss behavior and regression coverage |
| 7:00-8:00 | Persona gameplay evaluation | Refresh persona distributions and inspect player-impact signals | Updated score/stage/time distributions, tables, charts, and conclusions |
| 8:00-9:00 | Dashboard/docs/economics | Keep user-visible docs and dashboard aligned with new findings | Public project/dev docs updated from persistent artifacts |
| 9:00-10:00 | Integration and review | Build, run focused checks, generate review artifacts, commit, and push | Clean pushed branch ready for dev publish or later merge |

## Prioritization Rule

Favor work that moves both the game and the measurement system:

- measurable player-experience improvement first
- reusable harness or ingestion logic second
- dashboard/documentation visibility third
- cosmetic-only changes only when they unblock review or remove confusion

If an attempted runtime change does not produce a measured improvement, preserve
the harness evidence and use it to improve the next candidate loop instead of
forcing a subjective tuning change.

## Success Criteria

By the end of the block, the branch should have:

- at least one meaningful user-facing conformance improvement
- updated harnesses, artifacts, or scorer logic that future games can reuse
- dashboard/docs reflecting the new state and cost/value interpretation
- targeted checks passing for the touched surfaces
- a clean pushed branch with a recommendation to either publish hosted `/dev`
  or keep iterating before lane movement

## First Work Block

Start with the audio UX path because it has the clearest current player impact:

- confirm baseline audio score and cue-alignment status
- inspect latest audio event-gap and candidate artifacts
- focus on inter-level/stage transition cue length and audio recovery safety
- keep semantic score and cue alignment from regressing
- only promote a runtime cue if measured evidence and harness checks support it

## Work Log

### 0:00-0:30 Sync, Branch, And Startup Baseline

Status: complete.

- Synced `main` from `c9d9bb47` to `af3f2b85`, preserving the iMacM1
  beta-review artifact commit.
- Created `codex/macbook-post-beta-conformance-10h` from `af3f2b85`.
- `machine:status` and `machine:doctor` are development-ready on this
  MacBook.
- Release remains correctly blocked here because authority is still on
  `imacm1 / iMacM1`.
- Local game and viewer services are reachable at `http://127.0.0.1:8000/`
  and `http://127.0.0.1:4311/api/runs`.

### 0:30-1:45 Audio Baseline And First Harness Improvement

Status: complete, with one reusable harness improvement kept.

Measured baseline:

| Run | Result | Wall | CPU |
| --- | --- | ---: | ---: |
| `harness:analyze-audio-theme-comparison` | fresh theme comparison artifact | `85.289s` | `165.66s` |
| `harness:analyze:aurora-audio-event-gap` | highest risk `challengePerfect` onset, `7.13/10` | `0.239s` | `0.28s` |
| `harness:check:audio-cue-alignment` | `9/9` checks passed | `9.227s` | `15.86s` |
| `harness:score:quality-conformance` | overall `9.1/10`, weakest category audio `6.9/10` | `66.408s` | `76.78s` |

Candidate-loop result:

- The segment-synthesis Challenge Perfect loop found no safe keeper.
- The broader reference-window focus loop initially found short, low-risk
  candidates, but they would have shortened the reward cue to `0.24s-0.32s`.
- That acoustic result conflicts with the player-experience goal of preserving
  reward/inter-level ceremony and with the project rule to preserve canonical
  phrases unless a short excerpt is proven necessary.
- Harness improvement: `challengePerfect` now has a `1.1s` minimum scheduled
  duration keeper gate, and the report success measure explains why ceremony
  cues must not collapse into onset-only subwindows.
- Rerunning the focus loop now correctly reports `no-keeper`; the measured-best
  short subclip is rejected with `scheduled cue duration 0.32s < 1.1s ceremony
  minimum`.

Position in plan:

- We advanced the audio conformance process without a runtime audio promotion.
- The work increased conformance safety by preventing a misleading local
  acoustic win from becoming a worse player-facing cue.
- Next audio step: either widen the Challenge Perfect candidate generator around
  full-phrase/envelope-preserving candidates, or pivot to the higher
  user-impact impact/explosion cue family now that the reward-subclip path is
  guarded.

### 1:45-2:45 Impact Feedback Runtime Lift

Status: complete, with one measured runtime cue promotion.

Problem:

- `bossHit` was the highest impact/explosion feedback gap in the fresh event-gap
  read: gap `4.62/10`, onset segment risk `5.71/10`, centroid gap `646.1 Hz`.
- This maps directly to a player-facing concern: first-hit boss damage should
  audibly confirm that damage registered without sounding like a generic shot or
  final boss death.

Strategy:

- Run the `boss-hit` focus loop to inspect candidate subwindows and confirm the
  guide mapping.
- Compare the focus-loop result against the event-gap rollup.
- Promote only the already-curated Galaga reference subwindow into the
  `galaga-reference-assets` runtime cue map.

Change:

- `bossHit` now plays the curated boss-damage window from
  `galaga3-boss-damage-flagship-fighter-shot.m4a`:
  `clipStart: 1.149`, `clipDuration: 0.29`.

Measured result:

| Metric | Before | After |
| --- | ---: | ---: |
| `bossHit` event-gap risk | `4.62/10` | `0.96/10` |
| `bossHit` worst segment risk | `5.71/10` | `0.36/10` |
| Average worst segment risk | `3.90/10` | `3.55/10` |
| Acoustic event score | `6.10/10` | `6.45/10` |
| Audio category score | `6.9/10` | `7.0/10` |
| Overall quality score | `9.1/10` | `9.1/10` |
| Audio cue alignment | `9/9` | `9/9` |

Verification:

- `npm run build`
- `npm run harness:check:audio-cue-slots`
- `npm run harness:check:audio-theme-phases`
- `npm run harness:analyze-audio-theme-comparison` through `harness:measure`
- `npm run harness:analyze:aurora-audio-event-gap` through `harness:measure`
- `npm run harness:check:audio-cue-alignment` through `harness:measure`
- `npm run harness:score:quality-conformance` through `harness:measure`
- `npm run harness:check:audio-runtime-recovery`

Position in plan:

- We have one real user-facing conformance improvement: boss first-hit damage
  should be more readable and more distinct in Galaga reference audio mode.
- The next exposed audio gap is `playerShot` onset, now highest risk at
  `9.37/10`; however, before chasing that number we should confirm it is not a
  scorer/reference-window artifact and that changing it would improve live play.

### 2:45-4:30 Player Shot Control-Cue Lift

Status: complete, with one reusable candidate loop and one measured runtime cue
promotion.

Problem:

- After the boss-hit fix, `playerShot` became the highest measured audio gap:
  event-gap risk `9.37/10`, onset segment risk `8.39/10`.
- Because `playerShot` is a high-repetition control-feedback cue, blindly
  maximizing waveform similarity could make every player shot too loud or too
  intrusive.

Strategy:

- Add a focused `player-shot` candidate family to
  `tools/harness/analyze-aurora-audio-focus-candidates.js`.
- Sweep reference subwindows, volumes, and synthetic control-snap alternatives
  through `harness:measure` so wall/CPU cost is tracked.
- Promote only if the candidate clears whole-cue risk, onset segment risk,
  duration, band, centroid, and minimum scheduled-duration gates.

Change:

- `playerShot` now uses the measured flagship/fighter-shot subwindow for the
  early classic gameplay cue and Galaga reference audio theme:
  `clipStart: 0.08`, `clipDuration: 0.24`, `referenceVolume: 0.92`.
- Later Aurora-themed shot variants remain synthetic so the platform can still
  support future theme variation.

Measured result:

| Metric | Before | After |
| --- | ---: | ---: |
| `playerShot` event-gap risk | `9.37/10` | `1.0/10` |
| `playerShot` worst segment risk | `8.39/10` | `2.56/10` |
| Average worst segment risk | `3.55/10` | `3.27/10` |
| Acoustic event score | `6.45/10` | `6.73/10` |
| Audio category score | `7.0/10` | `7.0/10` |
| Overall quality score | `9.1/10` | `9.1/10` |
| Audio cue alignment | `9/9` | `9/9` |

Compute and cost:

| Run | Wall | CPU | Result |
| --- | ---: | ---: | --- |
| `audio-player-shot-focus` | `567.294s` | `1397.57s` | keeper `refclip-s80-d240-v92` |
| `audio-theme-comparison-after-player-shot` | `292.899s` | `782.44s` | fresh full-theme comparison |
| `audio-event-gap-after-player-shot` | `0.231s` | `0.28s` | `challengePerfect` becomes top remaining gap |
| `audio-cue-alignment-after-player-shot` | `11.189s` | `21.79s` | `9/9` |
| `quality-conformance-after-player-shot` | `65.973s` | `76.19s` | overall `9.1/10`, weakest audio |

Verification:

- `npm run build`
- `npm run harness:check:audio-cue-slots`
- `npm run harness:check:audio-theme-phases`
- `npm run harness:analyze:aurora-audio-focus-candidates -- --cue player-shot --reference-grid-limit=64` through `harness:measure`
- `npm run harness:analyze-audio-theme-comparison` through `harness:measure`
- `npm run harness:analyze:aurora-audio-event-gap` through `harness:measure`
- `npm run harness:check:audio-cue-alignment` through `harness:measure`
- `npm run harness:score:quality-conformance` through `harness:measure`
- `npm run harness:check:audio-runtime-recovery`

Position in plan:

- The audio conformance bundle now has two player-visible post-beta wins:
  boss damage feedback and player shot identity.
- The next audio target is `challengePerfect`, but only via
  full-phrase/envelope-preserving candidates because the harness now blocks
  short ceremony-collapsing clips.
- With audio improved to a more stable `7.0/10` internal state, the next high
  value block can shift back toward challenge-stage arrival, alien novelty, and
  formation/path precision unless manual listening finds a cue regression.
