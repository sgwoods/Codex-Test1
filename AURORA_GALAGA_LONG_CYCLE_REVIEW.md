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

Current quality read:

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

The next product target is not just a higher average. The cycle should make
Aurora more convincing moment-to-moment beside Galaga reference play:

- calmer and more authentic player control feel
- richer stage and challenge-stage behavior
- more interesting enemy motion and lower-field pressure
- stronger sprite, explosion, formation, HUD, and presentation review
- no regression in shot trust, capture/rescue rules, persona safety, or shell
  stability

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
