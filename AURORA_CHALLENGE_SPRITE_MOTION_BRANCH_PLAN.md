# Aurora Challenge Sprite-Motion Branch Plan

Status: active on `codex/macbook-challenge-sprite-motion-conformance`

Base: `0538fb9d` after the beta review packet was refreshed and pushed by release authority.

## Problem

Aurora challenging stages are safe, but still under-conformant as Galaga-like bonus exhibitions. The main player-facing gaps are movement variety, authored set-piece progression, alien novelty, and active sprite-motion credibility. Static sprite scores alone are not enough: a still crop can look tolerable while live play still feels wrong because flapping, pulsing, dive poses, capture/rescue transitions, and group choreography are not matched to target evidence.

## Strategy

Use measured reference-first work before subjective tuning:

- Keep challenge-stage scoring strict, starting at 1/10 for interesting factor, movement, and graphics until the runtime earns credit.
- Add a sprite-motion correspondence layer that joins Galaga temporal target rows to Aurora runtime motion captures.
- Let the correspondence score influence challenge graphical conformance modestly, but cap it until Galaga target windows are frame-labeled.
- Preserve every cycle as reusable ingestion framework logic so Galaxy Guardians and later games can reuse the same target-versus-runtime motion path.

## Current Baseline

- Challenge-stage conformance: `4.3/10`
- Challenge interesting factor: `4.3/10`
- Movement conformance: `4.3/10`
- Graphical conformance: `4.6/10`
- Alien/stage novelty: `3.9/10`
- Player shot opportunity: `5.6/10`
- Sprite-motion correspondence: `7.83/10`
- Runtime phase-order correspondence: `5.64/10`
- Sprite-motion target timing status: `frame-labeled-segmented-reference-windows`
- Frame-labeled cadence target rows: `6/6`
- Cadence evidence: `144` labeled reference frames at `4 fps`
- Raw gameplay cadence validation: `8.04/10`, corroborated from low-resolution gameplay, not ROM-confirmed

## Progress This Cycle

- Promoted Boss, Bee, and Butterfly frame-labeled cadence windows from the preserved segmented Galaga alien motion reference.
- Added challenge-only Dragonfly, Satellite, and Starship cadence windows so later bonus-stage aliens enter the same target model rather than remaining undocumented specialty sprites.
- Added a reusable frame cadence target artifact and checker:
  - `reference-artifacts/analyses/galaga-alien-frame-cadence-targets/latest.json`
  - `GALAGA_ALIEN_FRAME_CADENCE_TARGETS.md`
- Added low-resolution raw-gameplay cadence corroboration:
  - `reference-artifacts/analyses/galaga-alien-cadence-validation/latest.json`
  - `GALAGA_ALIEN_CADENCE_VALIDATION.md`
- Wired the cadence target rows into temporal targets and runtime correspondence scoring.
- Added runtime-vs-target phase-order scoring so Aurora is now measured on compact/extended sequence order, not only whether animation exists.
- Stage 3 challenge readability improved by widening first-challenge wave spacing: max active challenge enemies dropped from `40` to `32`, and mean active enemies dropped from about `24.9` to `18.5`.
- Confirmed the larger challenge-stage score is still stuck at `4.3/10`; this reinforces that the main player-facing gap is now choreography, target-video track fit, reversal-heavy paths, stage contract, and alien/path variety rather than basic flap/pulse measurement.
- Ran a Stage 3 target-track timing pass using explicit group spawn offsets. The offset-only candidate kept overall challenge conformance at `4.3/10` and Stage 3 at `4.2/10`, nudged Stage 3 target-video object-track coverage from about `0.261` to `0.265`, and shifted later groups from an overly compressed sequence toward a more readable stagger. A more literal target-timing candidate improved Stage 3 object-track fit to about `3.3/10`, but reduced movement/readability because late waves were under-sampled inside the current scoring window; a speed-scale follow-up also failed to improve the score. Conclusion: timing offsets alone are not enough. The next score-moving work needs path-shape re-authoring against entry/exit side, path length, and turn/reversal targets.

## Success Criteria

- Raise challenge-stage conformance by improving measured choreography, not by weakening the scorer.
- Promote frame-labeled target cadence windows for Boss, Bee, and Butterfly.
- Replace provisional Bee and Butterfly flap targets with true target-video or source-frame evidence.
- Make challenge-stage rows explain what a player sees: target motion, current motion, graphics, aliens, scoring opportunity, and next gap.
- Keep the public application guide and dashboard generated from durable artifacts rather than hand-edited prose.

## Next Best Steps

1. Replace low-resolution cadence corroboration with high-resolution frame-stepped gameplay, emulator capture, or ROM-derived animation timing.
2. Tune Aurora runtime cadence toward the target phase-order rows; current phase-order is only `5.64/10`.
3. Re-author Stage 3 challenge paths against the first Galaga challenge contract, focusing on path-shape rather than timing alone: fewer accidental reversals, closer entry side/exit side, shorter first-wave hang time, and stronger object-track fit.
4. Expand the same path-shape treatment to Stage 7 and Stage 11 once Stage 3 proves a score-moving loop.
5. Add remaining challenge-only alien cadence rows for Scorpion, Bosconian, and Galaxian families, then connect those rows to challenge-stage visual novelty scoring.
6. Keep conformance-economics measurement around every long run so CPU/GPU/time value is visible.
