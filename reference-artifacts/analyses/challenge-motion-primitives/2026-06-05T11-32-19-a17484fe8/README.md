# Challenge Motion Primitive Catalog

Generated: 2026-06-05T11:32:19.758Z
Commit: a17484fe8
Branch: codex/aurora-challenge-movement-grammar

## Purpose

This artifact turns the current no-keeper challenge-stage sweep evidence into reusable movement primitives. The intent is to stop treating each candidate sweep as a one-off tuning exercise and instead define path grammar that Aurora, Galaxy Guardians, and future games can ingest, vary, and test.

## Summary

- Primitives: 10
- First-five stage rows: 5
- High-priority primitives: 4
- First build target: lead-in-continuity

The next runtime improvement should target visible lead-in, spacing/readability, reference spline playback, and phase scheduling before another broad sweep. These primitives attack the failures that blocked every current candidate keeper.

## Primitive Backlog

| Priority | Primitive | Category | Source Stages | Evidence | Implementation Plan |
| ---: | --- | --- | --- | --- | --- |
| 10/10 | lead-in-continuity | arrival | 3, 7, 11, 15, 19 | Visible Lead-In Continuity is backed by 25 group contract(s) and 25 reference path(s); blocked stages: 3, 7, 11, 15, 19. | Add a reusable lead-in phase before challenge group path playback; keep it data-driven so main-level entry groups can reuse it. |
| 10/10 | group-spacing-field | readability | 3, 7, 11, 15, 19 | Group Spacing Field is backed by 25 group contract(s) and 25 reference path(s); blocked stages: 3, 7, 11, 15, 19. | Represent each group path as a centerline plus stable member offsets; clamp speed/path parameters that collapse the offsets. |
| 10/10 | reference-spline-fit | path-shape | 3, 7, 11, 15, 19 | Reference Spline Fit is backed by 25 group contract(s) and 25 reference path(s); blocked stages: 3, 7, 11, 15, 19. | Introduce a normalized path-player primitive that samples ingested reference points and composes scale/time/offset per group. |
| 10/10 | phase-order-scheduler | timing | 3, 7, 11, 15, 19 | Phase-Order Scheduler is backed by 25 group contract(s) and 25 reference path(s); blocked stages: 3, 7, 11, 15, 19. | Make challenge timing a first-class schedule independent of path shape so future games can vary rhythm without rewriting movement logic. |
| 7.8/10 | novelty-family-cascade | alien-novelty | 19 | Novelty Family Cascade is backed by 5 group contract(s) and 5 reference path(s); blocked stages: 19. | Tie movement groups to explicit visual-family contracts so Aurora themes can vary aliens while keeping target-era grammar. |
| 7.5/10 | serpentine-cascade | late-stage-identity | 15 | Serpentine Cascade is backed by 5 group contract(s) and 5 reference path(s); blocked stages: 15. | Add a late-stage cascade primitive with group-level phase offsets and visual-family contracts. |
| 7.3/10 | lower-field-scoreable-pass | scoreability | 3, 7, 11, 15, 19 | Lower-Field Scoreable Pass is backed by 25 group contract(s) and 25 reference path(s); blocked stages: 3, 7, 11, 15, 19. | Add a stage-contract field for scoreable lower-band dwell and teach persona scoring probes to value it. |
| 7.3/10 | hook-return-arc | path-shape | 3, 7, 11 | Hook Return Arc is backed by 15 group contract(s) and 15 reference path(s); blocked stages: 3, 7, 11. | Convert current side-hook variants into a parameterized arc primitive with spacing-aware apex handling. |
| 7.3/10 | exit-continuity | departure | 3, 7, 11, 15, 19 | Exit Continuity is backed by 25 group contract(s) and 25 reference path(s); blocked stages: 3, 7, 11, 15, 19. | Replace challenge retire-on-window behavior with data-driven path completion and explicit offscreen exits. |
| 7.3/10 | persona-perfect-route-probe | assessment | 3, 7, 11, 15, 19 | Persona Perfect-Route Probe is backed by 25 group contract(s) and 25 reference path(s); blocked stages: 3, 7, 11, 15, 19. | Add per-primitive route probes so candidate sweeps score player opportunity, not only visual similarity. |

## First-Five Stage Roadmap

| Challenge Stage | Primary Primitives | Human-Visible Lift | Bunching Risk | Next Action |
| --- | --- | ---: | ---: | --- |
| Challenging Stage 3-4 | lead-in-continuity, group-spacing-field, reference-spline-fit, phase-order-scheduler, hook-return-arc, lower-field-scoreable-pass | -0.2 | 0.963 | Prototype lead-in continuity plus group-spacing field on the first challenge before broadening runtime promotion. |
| Challenging Stage 7-8 | lead-in-continuity, group-spacing-field, reference-spline-fit, phase-order-scheduler, hook-return-arc, lower-field-scoreable-pass | 0.1 | 0.824 | Wait for the Stage 3 primitive prototype, then retune this stage using the same primitive vocabulary. |
| Challenging Stage 11-12 | lead-in-continuity, group-spacing-field, reference-spline-fit, phase-order-scheduler, hook-return-arc, lower-field-scoreable-pass | 0.1 | 0.817 | Wait for the Stage 3 primitive prototype, then retune this stage using the same primitive vocabulary. |
| Challenging Stage 15-16 | lead-in-continuity, group-spacing-field, reference-spline-fit, phase-order-scheduler, serpentine-cascade, lower-field-scoreable-pass | -0.4 | 0.45 | Wait for the Stage 3 primitive prototype, then retune this stage using the same primitive vocabulary. |
| Challenging Stage 19-20 | lead-in-continuity, group-spacing-field, reference-spline-fit, phase-order-scheduler, novelty-family-cascade, lower-field-scoreable-pass | -0.3 | 0.918 | Wait for the Stage 3 primitive prototype, then retune this stage using the same primitive vocabulary. |
