# Aurora Galaga Long-Cycle Review

This is the operating plan for a longer Aurora quality cycle focused on a
meaningful step up in Galaga conformance.

The cycle is not a single tuning pass. It is a measured review-and-build loop
for gameplay quality, gameplay complexity, and graphical quality.

## Current Baseline

Baseline generated on May 5, 2026 from commit `478329a`:

- quality report:
  `reference-artifacts/analyses/quality-conformance/2026-05-05-478329a/report.json`
- long-cycle baseline artifact:
  `reference-artifacts/analyses/aurora-galaga-long-cycle/baseline-2026-05-05.json`
- Aurora evidence windows:
  `reference-artifacts/analyses/aurora-level-expansion-cycle/aurora-evidence-window-cycle-summary.json`
- evidence dashboard:
  `reference-artifacts/analyses/evidence-cycle-dashboard/evidence-cycle-dashboard.json`

Setup baseline quality read:

| Area | Score / read |
| --- | ---: |
| Overall Aurora quality | `8.8/10` |
| Player movement conformance | `8.0/10` |
| Shot and hit responsiveness | `10.0/10` |
| Stage-1 opening timing fidelity | `8.5/10` |
| Stage-1 opening geometry fidelity | `10.0/10` |
| Dive fairness and safety | `9.1/10` |
| Capture and rescue rule fidelity | `10.0/10` |
| Challenge-stage timing fidelity | `8.4/10` |
| Progression and persona depth | `8.8/10` |
| Audio identity and cue alignment | `6.1/10` |
| UI, shell, and graphics integrity | `9.2/10` |

## Track 1 Update

Measured on May 6, 2026 from branch
`codex/macbook-pro-aurora-movement-shot-feel`:

- artifact:
  `reference-artifacts/analyses/aurora-galaga-long-cycle/movement-shot-feel-2026-05-06.json`
- player movement report:
  `reference-artifacts/analyses/correspondence/player-movement/2026-05-06-72fe7b0/report.json`
- quality report:
  `reference-artifacts/analyses/quality-conformance/2026-05-06-72fe7b0/report.json`

The Track 1 movement gap was primarily a measurement problem. The movement
conformance harness reset input with a movement-specific recenter reason, which
caused the runtime input-reset guard to suppress tap and early hold samples.
After preserving recenter resets as no-hold harness actions, movement now
scores `10/10`, close-shot trust remains `10/10`, persona stage-2 safety still
passes, and overall Aurora quality reads `9.0/10`.

No player movement constants were changed in this Track 1 pass. That is the
right value/effort trade: preserve the measurement repair, avoid blind control
tuning, and spend the next gameplay implementation effort on challenge-stage
depth and later-stage pressure.

The next product target is not just a higher average. The cycle should make
Aurora more convincing moment-to-moment beside Galaga reference play:

- calmer and more authentic player control feel
- richer stage and challenge-stage behavior
- more interesting enemy motion and lower-field pressure
- stronger sprite, explosion, formation, HUD, and presentation review
- no regression in shot trust, capture/rescue rules, persona safety, or shell
  stability

## Conformance Gap Evolution Plan

Boundary checkpoint on May 6, 2026:

- official current Aurora score: `9.0/10`
- official score report:
  `reference-artifacts/analyses/quality-conformance/2026-05-07-cf7b7d2/report.json`
- level arc and encounter shape is now a first-class high-priority category at
  `7.4/10`
- level arc report:
  `reference-artifacts/analyses/level-arc-conformance/2026-05-07-cf7b7d2/report.json`
- detailed metric-gap and automation agenda:
  `reference-artifacts/analyses/aurora-galaga-long-cycle/conformance-gap-evolution-plan-2026-05-06.json`

Current score gaps to a truly convincing Galaga-family conformance target:

| Metric | Current | Score gap | Primary next assessment move |
| --- | ---: | ---: | --- |
| Player movement conformance | `10.0` | `0.0` | Promote frame-derived player x/y traces so movement stays evidence-led before more tuning. |
| Shot and hit responsiveness | `10.0` | `0.0` | Add video-frame shot/hit/explosion ordering and randomized edge-case fuzzing. |
| Stage-1 opening timing fidelity | `8.5` | `1.5` | Compare full opening timelines with promoted reference events and dynamic trace distance. |
| Stage-1 opening geometry fidelity | `10.0` | `0.0` | Keep target geometry as a hard gate and add sprite/pixel contact-sheet scoring. |
| Dive fairness and safety | `9.1` | `0.9` | Run adversarial seed search and collision-risk heatmaps across later stages. |
| Capture and rescue rule fidelity | `10.0` | `0.0` | Expand from covered scenarios into event-grammar and state-space checks. |
| Challenge-stage timing fidelity | `9.9` | `0.1` | Add challenge path, hit-opportunity, non-lethal, and result-surface measurements beyond timing. |
| Progression and persona depth | `8.8` | `1.2` | Use long-run distributional persona batches and stage-band variety reports. |
| Level arc and encounter shape | `7.4` | `2.6` | Build a stage-signature distance harness, then implement one challenge-stage movement/reward slice and one later-level entry/escort variation. |
| Audio identity and cue alignment | `6.3` | `3.7` | Promote candidate reference subwindows, then build cue-level waveform/spectral comparison and parameter-sweep optimization. |
| UI, shell, and graphics integrity | `9.2` | `0.8` | Split gameplay visual conformance from shell integrity before Track 3. |

The highest-value automation theme is to make Codex improve the assessment
system first: classify reference windows, generate sharper metrics, inspect
outliers, and create targeted harnesses. Runtime/gameplay changes should then
come from measured gaps, parameter sweeps, and preserved regression scenarios
instead of direct subjective requests for gameplay edits.

## Evidence Rule

Every gameplay or graphics change in this cycle should preserve this chain:

`reference or harness window -> extracted artifact -> current Aurora comparison -> target gap -> implementation -> targeted gate -> dashboard or scorecard update`

Subjective play review is still required, but it should sit beside preserved
measurements, not replace them.

## Review Windows

The current local Aurora evidence cycle has four windows:

| Window | Scenario | Seed | Current read |
| --- | --- | ---: | --- |
| `stage-1-baseline` | `stage1-descent` | `2003` | Trusted opening and early dive baseline; max attackers `2`, max enemy bullets `1`. |
| `challenge-stage-candidate` | `stage3-challenge` | `3003` | First challenge-stage expansion anchor; `40` challenge enemies, final score `5870`, final stage `4`. |
| `mid-run-pressure` | `stage6-regular` | `6006` | Mid-run pressure anchor; max attackers `4`, max enemy bullets `2`, final lives `2`. |
| `late-run-cleanup-or-failure` | `stage12-variety` | `12003` | Late-run pressure/cleanup anchor; max attackers `5`, max enemy bullets `3`, final lives `5`. |

These windows are local Aurora evidence. The next reference pass should add
Galaga-side promoted windows for the same review questions:

- player movement and firing
- challenge-stage motion and scoreable windows
- boss/escort dive pressure
- later-stage entry and lower-field pressure
- explosions, sprite silhouettes, HUD, lives, score, and results presentation

## Work Tracks

### Track 1: Gameplay Quality

Goal:

- make player control, firing, and survival feel closer to Galaga without
  breaking shot trust or persona guardrails

Primary questions:

- Does tap correction feel calmer and less jerky?
- Does hold travel match the reference-like lane crossing rhythm?
- Does reversal feel responsive without snapping?
- Does firing while moving preserve visible shot trust?
- Are early deaths still fair and learnable?

Required gates:

- `npm run harness:check:player-movement-conformance`
- `npm run harness:check:close-shot-hit`
- `npm run harness:check:persona-stage2-safety`
- one browser/manual review against the movement reference windows

First implementation branch:

- `codex/macbook-pro-aurora-movement-shot-feel`

Exit standard:

- movement score rises above `8.0/10`
- close-shot responsiveness stays at `10/10`
- no added stage-2 persona safety failures

Track 1 May 6 status:

- satisfied by harness/platform measurement repair
- no gameplay movement tuning applied
- next implementation effort should move to Track 2 unless manual browser
  review finds a feel issue that the current metric family does not see

Track 2 May 6 checkpoint:

- artifact:
  `reference-artifacts/analyses/aurora-galaga-long-cycle/challenge-stage-safety-2026-05-06.json`
- challenge-stage contact is now explicitly non-lethal and logged as
  `challenge_enemy_contact`
- `npm run harness:check:challenge-collision` passes with
  `contactsDuringChallenge=1` and `shipLossesDuringChallenge=0`
- `npm run harness:check:challenge-outcomes` passes with current average
  challenge losses at `0` and current average hit rate at `0.942`
- `npm run harness:check:challenge-stage-correspondence` passes `5/5`
  timing metrics with worst current delta `0.483`
- `npm run harness:check:stage-pressure` remains not green; Stage `4`
  regular pressure is a separate measured blocker and should get a dedicated
  collision-risk/scoreable-dive analysis pass before more tuning
- a lower-field Stage `4` graze experiment was tried and backed out because it
  did not make the pressure gate green and risked muddying regular-stage
  collision semantics

Track 2 Stage `4` pressure-risk checkpoint:

- artifact:
  `reference-artifacts/analyses/aurora-stage4-pressure-risk/2026-05-06-b666814/report.json`
- analysis command:
  `npm run harness:analyze:stage4-pressure-risk -- --limit 40`
- problem shape:
  Stage `4` pressure is not primarily a bullet-spam problem; recent artifacts
  show `17` collision losses versus `2` bullet losses across `15` scanned
  pressure runs
- strongest signature:
  `stage4-survival` boss collision in player/source lane `7`, source column
  `5`, with `3` recent attack starts and a hit-before-loss pattern
- assessment advance:
  Stage `4` pressure now has a structured risk report covering artifact
  quality, loss causes, source roles, lanes, recent pressure, nearby events,
  and hit-before-collision cases
- strategy before tuning:
  promote the top signatures into loss-window scenarios and add
  path/contact-sheet extraction for boss and `but` dives around the `12s-19s`
  Stage `4` window; fresh replay reproducibility must be measured separately
  from archived source-window extraction
- success measure for the next tuning pass:
  reduce dominant Stage `4` collision signatures and make
  `npm run harness:check:stage-pressure` green without regressing challenge
  non-lethality, challenge timing, movement, or shot trust

Track 2 Stage `4` promoted loss-window checkpoint:

- artifact:
  `reference-artifacts/analyses/aurora-stage4-loss-windows/2026-05-06-6d7e05b/report.json`
- assessment command:
  `npm run harness:check:stage4-pressure-loss-windows`
- problem shape:
  the strongest pressure gap is scoreable dive pressure becoming body-contact
  loss, especially boss/butterfly paths that cross the player lane around
  shot windows
- promoted source windows:
  `stage4-survival` boss lane `7` at `13.85s` (`4` archived matches),
  `stage4-five-ships` butterfly lane `2` at `15.25s` (`2` matches), and
  `stage4-five-ships` boss lane `6` at `18.517s` (`2` matches)
- fresh replay status:
  realtime/no-video short replay reproduced `1/3` promoted windows; the
  survival boss lane `7` window reproduced exactly, while the five-ships
  butterfly and boss windows did not reproduce in the short probes
- conformance advance:
  the pressure blocker is now split into archived source evidence and replay
  reproducibility evidence; this prevents premature subjective tuning and
  identifies harness precision as the next platform gap
- recommended next step:
  add per-frame attacker path sampling for these promoted windows, then tune
  one pressure lever at a time against both the promoted windows and the
  aggregate `stage-pressure` gate

### Track 2: Gameplay Complexity

Goal:

- make the run less uniform by deepening challenge stages, boss/escort behavior,
  later-stage entries, and pressure curves

Primary questions:

- Does the first challenge stage feel like a distinct bonus-stage moment?
- Do middle and later stages introduce visible pressure variation?
- Do boss/escort dives create scoring opportunities, not only collision risk?
- Does increased pressure remain survivable?

Required gates:

- `npm run harness:analyze:level-arc-conformance`
- `npm run harness:check:challenge-stage-correspondence`
- `npm run harness:check:challenge-outcomes`
- `npm run harness:check:stage-pressure`
- `npm run harness:cycle:aurora-evidence-windows`
- `npm run harness:check:evidence-cycle-dashboard`

First implementation branch:

- `codex/macbook-pro-aurora-challenge-stage-depth`

Exit standard:

- at least one distinct challenge-stage movement family is implemented
- the challenge window remains non-lethal and score-readable
- mid-run and late-run pressure evidence shows more variety without unfair
  collapse

### Track 3: Graphical Quality

Goal:

- make Aurora's gameplay presentation read more like a polished Galaga-family
  cabinet while staying Aurora-owned artwork

Primary questions:

- Are player/enemy silhouettes readable at gameplay scale?
- Do boss/escort/scout roles separate cleanly in formation and dives?
- Do explosions, hit flashes, shots, captured states, lives, and score surfaces
  feel crisp rather than generic?
- Does the rack density and formation spacing support reference-like play?

Required gates:

- `npm run harness:check:dev-candidate-surfaces`
- `npm run harness:check:dev-graphics-options`
- `npm run harness:check:stage1-opening-spacing`
- refreshed contact sheets in the Aurora evidence cycle
- browser/manual still review of stage-1, challenge, mid-run, and late-run
  windows

First implementation branch:

- `codex/macbook-pro-aurora-graphics-conformance-pass`

Exit standard:

- graphics/shell score stays at or above `9.2/10`
- review stills show clearer sprite and effect language in all four windows
- stage-1 spacing remains `10/10`

### Track 4: Audio As Support

Goal:

- avoid ignoring the weakest score while keeping this cycle focused on gameplay
  and graphics

Primary questions:

- Do new challenge or pressure patterns have cue timing that supports the
  gameplay moment?
- Do added graphics/effects avoid making the cue mix feel disconnected?

Required gates:

- `npm run harness:check:audio-cue-alignment`
- `npm run harness:score:quality-conformance`

Exit standard:

- no audio regression from `6.1/10`
- any new gameplay state has intentional cue ownership

## PR Sequence

1. `codex/macbook-pro-aurora-galaga-quality-cycle-setup`
   - establish this plan
   - refresh baseline quality and evidence-window artifacts
   - harden the evidence cycle if it exposes runtime capture blockers

2. `codex/macbook-pro-aurora-movement-shot-feel`
   - movement and firing feel review
   - no stage/content expansion

3. `codex/macbook-pro-aurora-challenge-stage-depth`
   - first visible challenge-stage variety slice
   - measured against challenge and evidence-window gates

4. `codex/macbook-pro-aurora-later-stage-pressure`
   - mid-run and late-run pressure variation
   - stage-pressure and persona safety gates

5. `codex/macbook-pro-aurora-graphics-conformance-pass`
   - sprite/effects/HUD/still-review pass
   - browser and contact-sheet review required

6. `codex/macbook-pro-aurora-quality-score-refresh`
   - rebuild the quality scorecard and conformance overview
   - decide whether the bundle is ready for the next `/dev` publication from an
     authority-appropriate workflow

## Current Setup Findings

- The current roll-up remains `8.8/10`.
- `audio` is still the weakest numeric category at `6.1/10`, but movement,
  challenge depth, and graphics are the best gameplay-quality levers for the
  next major perceived step.
- The four-window Aurora evidence cycle is now captured and dashboarded.
- The first cycle attempt exposed a malformed enemy-bullet slot crash during
  deterministic review capture; the runtime now discards malformed enemy bullet
  entries before advancing them.
- The evidence dashboard warning about missing Galaxian promoted windows is
  expected for this branch and should become the first reference-source task in
  the next analysis pass.

## Stop Conditions

Do not merge an implementation slice if:

- movement improves but shot trust regresses
- challenge content becomes lethal in a bonus-stage window
- later-stage pressure causes unfair collapse in persona evidence
- graphics look better in isolation but reduce role readability at gameplay
  scale
- a score moves without a committed artifact explaining why
