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
- Sprite-motion correspondence: `8.0/10`
- Sprite-motion target timing status: `frame-labeled-segmented-reference-windows`
- Frame-labeled cadence target rows: `3/3`
- Cadence evidence: `72` labeled Boss/Bee/Butterfly reference frames at `4 fps`

## Progress This Cycle

- Promoted Boss, Bee, and Butterfly frame-labeled cadence windows from the preserved segmented Galaga alien motion reference.
- Added a reusable frame cadence target artifact and checker:
  - `reference-artifacts/analyses/galaga-alien-frame-cadence-targets/latest.json`
  - `GALAGA_ALIEN_FRAME_CADENCE_TARGETS.md`
- Wired the cadence target rows into temporal targets and runtime correspondence scoring.
- Lifted the sprite-motion correspondence read from `6.03/10` to `8.0/10` without pretending this is final arcade-perfect timing.
- Confirmed the larger challenge-stage score barely moved (`4.2/10` to `4.3/10`), which reinforces that the main player-facing gap is now choreography, stage contract, and alien/path variety rather than basic flap/pulse measurement.

## Success Criteria

- Raise challenge-stage conformance by improving measured choreography, not by weakening the scorer.
- Promote frame-labeled target cadence windows for Boss, Bee, and Butterfly.
- Replace provisional Bee and Butterfly flap targets with true target-video or source-frame evidence.
- Make challenge-stage rows explain what a player sees: target motion, current motion, graphics, aliens, scoring opportunity, and next gap.
- Keep the public application guide and dashboard generated from durable artifacts rather than hand-edited prose.

## Next Best Steps

1. Confirm segmented-reference Boss/Bee/Butterfly cadence against raw gameplay or ROM-derived timing where possible.
2. Add runtime-vs-target sequence scoring that compares actual Aurora cadence frame order against target phase labels, not only component readiness.
3. Update Stage 3 challenge choreography against the first Galaga challenge target contract.
4. Expand the same treatment to Stage 7 and Stage 11 after Stage 3 proves the loop.
5. Add challenge-only alien cadence rows for Dragonfly, Satellite, Starship, Scorpion, Bosconian, and Galaxian families.
6. Keep conformance-economics measurement around every long run so CPU/GPU/time value is visible.
