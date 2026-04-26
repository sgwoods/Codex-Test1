# First Galaxian Preview Evidence Map

Status: `first-pass-evidence-map`

Target pack: `galaxy-guardians-preview`

Generated from the local long-cycle reference pass on `2026-04-26`.

## Purpose

This map explains how the current `Galaxian` reference artifacts should drive a
small first playable Platinum preview without pretending that the full game is
understood yet. The goal is a repeatable path: source video, local extraction,
trace artifacts, semantic notes, then implementation.

## Source Roles

| Source | Best Current Use | Not Yet Authority For |
| --- | --- | --- |
| Matt Hawkins intro | title / mission presentation, score table, rack visibility, attract-state reference | active gameplay audio, player strategy, pressure scaling |
| ARCADE'S LOUNGE Level 5 | active player movement, projectile pressure, dive density, later-wave cleanup | opening-wave progression, full long-session cadence |
| Nenriki 15-wave session | long-session progression scouting, opening / mid / late candidate windows, player strategy bands | exact wave boundaries, exact transition timing, tuning metrics |
| Hamster / Nintendo official summaries | naming, core rules, score-doubling and escort behavior descriptions | frame timing, motion envelopes, audio shape |

## First Playable Preview Scope

The first `Galaxy Guardians` preview should stay intentionally narrow:

- a settled alien rack with Galaxian-family naming and scoring semantics
- player Galaxip horizontal movement and single-shot pressure informed by
  active-play traces
- regular alien dives and projectile pressure from ARCADE'S LOUNGE Level 5
- hooks for flagship / escort attacks, even if the first preview implements only
  a small behavior slice
- progression placeholders for opening, mid-session, and late-session pressure
  bands identified from the Nenriki source

## Active-Play Trace Evidence

ARCADE'S LOUNGE Level 5 is currently the strongest active-gameplay reference.

| Subwindow | Time | Detection | X Range | Mean Abs Delta | Max Lower Pressure | Max Projectiles |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `opening-rack-pressure` | `0.000-8.000s` | `201/201` | `0.4323` | `0.0105` | `14` | `14` |
| `early-attacks` | `8.000-20.000s` | `300/300` | `0.431` | `0.0083` | `20` | `14` |
| `mid-pressure` | `20.000-40.000s` | `487/501` | `0.5104` | `0.0104` | `18` | `68` |
| `late-cleanup` | `40.000-58.240s` | `456/456` | `0.5472` | `0.0082` | `17` | `9` |

These metrics are first-pass heuristic traces. They should select and constrain
the next implementation experiment, not close the subject.

## Long-Session Evidence

The Nenriki 15-wave session now has these coarse anchors:

- opening progression scout: `0.000-60.000s`
- mid-session candidate: `180.000-240.000s`
- late-session candidate: `660.866-720.866s`

Use the overview sheets and stills to promote exact wave-transition windows
before adding traces. This keeps the process CPU-reproducible and avoids
producing large trace folders for unclear segments.

## Next Implementation Decisions

1. Promote one Nenriki opening or transition subwindow after visual review.
2. Pick one ARCADE'S LOUNGE trace window as the first movement / pressure tuning
   authority.
3. Add a `Galaxy Guardians` preview spec that names the exact mechanics in the
   first playable slice.
4. Implement the preview only after the spec points back to specific artifacts
   in this evidence map.
5. Reuse this same ingestion shape for future Platinum game candidates.

## Open Questions

- Should the first playable slice prioritize opening-wave feel or the later
  active pressure already visible in the Level 5 trace?
- Which Nenriki transition is cleanest enough to become a canonical progression
  event?
- What minimum artifact set should be required before adding a second classic
  arcade game to Platinum?
