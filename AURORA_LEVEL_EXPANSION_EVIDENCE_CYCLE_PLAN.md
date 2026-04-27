# Aurora Level Expansion Evidence Cycle Plan

Status: `first-cycle-plan`

This plan applies the Galaxian / Galaxy Guardians ingestion workflow back to
Aurora's own level-by-level expansion. The goal is to make the coming Aurora
stage-depth work measurable before adding new aliens, challenge-stage behavior,
entry patterns, or later-level pressure.

Local inspection dashboard:

- `npm run build`
- `npm run harness:build:evidence-cycle-dashboard`
- `npm run harness:check:evidence-cycle-dashboard`
- `http://127.0.0.1:8000/dist/dev/evidence-dashboard.html` when served from
  the repo root

## Decision

The next major Aurora gameplay expansion should start with an evidence cycle,
not direct subjective tuning.

Each expansion slice should begin by naming the target gameplay window,
producing artifacts, creating a semantic trace, then implementing the smallest
playable change with harness coverage.

## First Four Aurora Windows

The first Aurora expansion cycle should promote four windows:

| Window | Purpose | Likely Source |
| --- | --- | --- |
| Stage 1 baseline | Preserve the trusted opening and early dive feel | current Aurora harness video plus Galaga reference |
| Challenge-stage candidate | Define the first richer bonus-stage movement family | Aurora challenge harness plus reference examples |
| Mid-run pressure | Measure attack density once the player is settled | self-play or harness recording |
| Late-run cleanup or failure | Catch unfair collapse, depletion, and end-of-wave behavior | self-play or long harness recording |

## Required Artifacts

Each promoted window should have:

- source or run manifest
- contact sheet
- still frames at notable moments
- waveform when audio timing matters
- motion / pressure trace
- semantic event scaffold
- promoted event log after manual review
- short playable-slice note
- harness target list

## First Aurora Event Families

Use the same event grammar being introduced for Galaxy Guardians, with
Aurora-specific families added as needed:

- `stage_start`
- `formation_entry`
- `player_move`
- `player_shot`
- `enemy_dive_start`
- `escort_dive_start`
- `challenge_wave_start`
- `challenge_enemy_path`
- `challenge_enemy_hit`
- `challenge_result`
- `capture_beam_start`
- `fighter_rescue`
- `wave_clear`
- `player_hit`

## First Implementation Candidates

Do not start with a broad level rewrite. The first implementation branch should
choose one visible stage-depth slice:

- one richer challenge-stage movement family
- one new challenge-stage alien visual family or variant
- one later-level entry variation
- one measured pressure-band adjustment
- one harness proving the new behavior appears and remains survivable

## Harness Direction

The reusable command should remain manifest-driven:

```sh
npm run harness:cycle:classic-arcade-reference -- --plan <plan.json>
```

Seed plan:

- `reference-artifacts/analyses/aurora-level-expansion-cycle/aurora-four-window-cycle.plan.json`

Dashboard and generated scaffolds:

- `reference-artifacts/analyses/evidence-cycle-dashboard/evidence-cycle-dashboard.json`
- `reference-artifacts/analyses/evidence-cycle-dashboard/README.md`
- `reference-artifacts/analyses/aurora-level-expansion-cycle/*/events/reference-events.json`

For Aurora-generated recordings, the plan file should identify:

- the source video or generated recording
- the desired promoted windows
- whether waveform extraction is required
- the event vocabulary to scaffold
- expected output directory

## Exit Standard

The evidence cycle is ready to feed implementation when:

- four windows are promoted
- each window has a contact sheet, stills, trace, waveform if needed, and event
  scaffold
- at least one challenge-stage or later-level behavior family is named
- the target implementation branch has one clear harness expectation
- the plan links to the generated artifacts

## Branch Sequence

Recommended sequence:

1. `codex/macbook-pro-aurora-expansion-evidence-cycle`
2. `codex/macbook-pro-challenge-stage-depth`
3. `codex/macbook-pro-later-level-entry-variation`

This keeps the analysis framework reusable for Aurora, Galaxy Guardians, and
future Platinum game ingestion.
