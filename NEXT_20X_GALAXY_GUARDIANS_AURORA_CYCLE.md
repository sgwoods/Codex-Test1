# Next 20x Galaxy Guardians And Aurora Cycle

Status: `in-progress`

This is the next long unattended work plan after the first Galaxy Guardians
playable preview foundation. It assumes this MacBook remains a development and
test machine only, while release authority remains on `imacm1` / `iMacM1`.

Current 100x direction: make the evidence process inspectable and repeatable by
generating a local dashboard that combines the Aurora four-window expansion
plan, Galaxy Guardians preview contract, Galaxian promoted windows, waveforms,
contact sheets, pressure traces, and next harness targets.

## Working Goal

Turn the current scout-wave preview and analysis tooling into a reusable
multi-game ingestion loop that helps both:

- Galaxy Guardians become a real Platinum second-game preview
- Aurora gain deeper, measured level-by-level arcade behavior

## 20x Work Blocks

### 1. Runtime Boundary Split

- identify shared fixed-screen engine hooks currently carrying Aurora
  assumptions
- list pack-owned rule modules needed for scoring, enemy families, progression,
  capture/rescue, and challenge stages
- create a small refactor plan before moving runtime code

### 2. Galaxy Guardians Event Logging

- add runtime event emissions for the first event families:
  `game_start`, `wave_setup`, `player_move`, `player_shot`,
  `regular_dive_start`, `enemy_projectile`, `enemy_hit`, `player_hit`,
  `wave_clear`
- export a compact JSON event log from harness runs
- compare runtime event names against promoted reference scaffolds

First implementation note:

- runtime aliases now map shared events to Galaxy Guardians semantic events
- `npm run harness:check:galaxy-guardians-event-log` verifies the first event
  family set

### 2a. Pack Rule Adapter

- pack-owned combat, progression, enemy-family, scoring, and event-schema
  adapters now sit in front of the shared runtime
- `npm run harness:check:platinum-pack-rule-adapters` proves Aurora and Galaxy
  Guardians resolve different rules through the same adapter surface

### 3. Galaxy Guardians Gameplay Slice

- replace more Aurora-flavored enemy behavior with pack-owned pressure values
- keep explicit exclusions for capture/rescue, dual fighter, and challenge
  stages
- add one scoring harness for formation and dive kills
- add one projectile-pressure harness

### 4. Reference Artifact Promotion

- promote one or more generated event scaffolds into reviewed observed events
- add confidence labels and timestamp notes
- link promoted event logs from the pack contract

### 5. Aurora Evidence Cycle

- generate or ingest the first Aurora four-window cycle:
  Stage 1 baseline, challenge-stage candidate, mid-run pressure, late-run
  cleanup/failure
- produce contact sheets, stills, traces, and waveform where relevant
- write the first Aurora stage-slice spec from those artifacts
- keep the local evidence dashboard current with
  `npm run harness:build:evidence-cycle-dashboard`

### 6. Aurora First Expansion Candidate

- choose one implementation target from the evidence cycle
- likely first target: richer challenge-stage movement and presentation
- define one harness that must pass before the branch is done

### 7. Shared Video Catalog Path

- define the minimum metadata schema for gameplay/reference videos
- keep paths portable across machines and users
- decide which artifacts belong in Git, release artifacts, or an external store

### 8. Coordination Check

- fetch/rebase from `main` before implementation branches
- inspect current work from the other workstation before merging
- keep each branch narrow enough to review and replay

## Exit Standard

The next long cycle is successful when it leaves behind:

- a documented runtime boundary split plan
- a working pack-rule adapter layer with harness coverage
- Galaxy Guardians runtime event logging or a ready-to-implement event hook map
- at least one new Galaxy Guardians gameplay harness beyond boot/picker
- an Aurora four-window evidence cycle plan or generated artifact set
- a selected Aurora challenge-stage or later-level expansion slice
- no beta or production release actions from this MacBook

Current documents:

- `PLATINUM_RUNTIME_BOUNDARY_SPLIT_PLAN.md`
- `GALAXY_GUARDIANS_EVENT_SCHEMA_PLAN.md`
- `AURORA_LEVEL_EXPANSION_EVIDENCE_CYCLE_PLAN.md`
- `reference-artifacts/analyses/aurora-level-expansion-cycle/aurora-four-window-cycle.plan.json`
- `reference-artifacts/analyses/evidence-cycle-dashboard/README.md`

## Suggested Validation

Run at minimum:

```sh
npm run build
npm run harness:build:evidence-cycle-dashboard
npm run harness:check:evidence-cycle-dashboard
npm run harness:check:platinum-pack-boot
npm run harness:check:game-picker-shell
npm run harness:check:galaxy-guardians-playable-preview
npm run harness:check:galaxian-preview-evidence
npm run harness:check:classic-arcade-ingestion
git diff --check
```

If the cycle edits runtime behavior, also run the relevant Aurora movement,
challenge, and quality gates.
