# Challenge Stage Routeability Review

Generated: 2026-06-01T14:19:38.526Z

This report measures whether Aurora's challenging-stage targets are visible, scoreable, and plausibly routeable by a human player using a simple deterministic firing-route probe. It complements the stricter conformance analyzer: routeability can improve the user experience even when target-video choreography and visual novelty remain low.

## How To Read This Beside Human-Perfect

Routeability is a permissive guardrail: it asks whether each target gets at least one plausible score window and whether a simple strong-player route can theoretically cover the stage. It is intentionally generous because its job is to prevent us from shipping impossible or frustrating challenge stages.

Human-perfect potential is stricter. It also penalizes one-frame-only opportunities, weak repeated aim windows, unreadable altitude, crowded top-band timing, and difficult player-lane transitions. A stage can therefore score 10/10 routeability while still reading lower on human-perfect potential and much lower on target-video movement conformance.

Candidate promotion should preserve both reads: routeability must stay high, and the stricter human-perfect score must not regress while target-video object-track fit, alien novelty, and movement quality improve.

| Challenging Stage | Layout | Tracked | Scoreable | Greedy Route | Route Score | Main Blocker |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Challenging Stage 2-3 (#1) | first-challenge-peel | 40/40 | 40/40 | 40/40 | 10/10 | No routeability blocker isolated. |
| Challenging Stage 6-7 (#2) | scorpion-cross-sweep | 40/40 | 40/40 | 40/40 | 10/10 | No routeability blocker isolated. |
| Challenging Stage 10-11 (#3) | stingray-crown-hook-hybrid | 40/40 | 40/40 | 40/40 | 10/10 | No routeability blocker isolated. |
| Challenging Stage 14-15 (#4) | pink-serpentine-late | 40/40 | 40/40 | 40/40 | 10/10 | No routeability blocker isolated. |
| Challenging Stage 18-19 (#5) | pink-green-cascade | 40/40 | 40/40 | 40/40 | 10/10 | No routeability blocker isolated. |


## Challenging Stage 2-3 (#1)
- Layout: first-challenge-peel
- Visibility: 40/40 targets enter the readable playfield; 40/40 have readable altitude samples.
- Scoreability: 40/40 targets expose at least one measured score window.
- Greedy route: 40/40 targets, 10/10, first shot window 0.2s, last shot window 12.8s.
- Weakest rows: None in this probe.


## Challenging Stage 6-7 (#2)
- Layout: scorpion-cross-sweep
- Visibility: 40/40 targets enter the readable playfield; 40/40 have readable altitude samples.
- Scoreability: 40/40 targets expose at least one measured score window.
- Greedy route: 40/40 targets, 10/10, first shot window 0.2s, last shot window 13.8s.
- Weakest rows: None in this probe.


## Challenging Stage 10-11 (#3)
- Layout: stingray-crown-hook-hybrid
- Visibility: 40/40 targets enter the readable playfield; 40/40 have readable altitude samples.
- Scoreability: 40/40 targets expose at least one measured score window.
- Greedy route: 40/40 targets, 10/10, first shot window 0.2s, last shot window 13.4s.
- Weakest rows: None in this probe.


## Challenging Stage 14-15 (#4)
- Layout: pink-serpentine-late
- Visibility: 40/40 targets enter the readable playfield; 40/40 have readable altitude samples.
- Scoreability: 40/40 targets expose at least one measured score window.
- Greedy route: 40/40 targets, 10/10, first shot window 0.2s, last shot window 13.8s.
- Weakest rows: None in this probe.


## Challenging Stage 18-19 (#5)
- Layout: pink-green-cascade
- Visibility: 40/40 targets enter the readable playfield; 40/40 have readable altitude samples.
- Scoreability: 40/40 targets expose at least one measured score window.
- Greedy route: 40/40 targets, 10/10, first shot window 2.2s, last shot window 8s.
- Weakest rows: None in this probe.


## Use In The Conformance Loop
1. Keep routeability high before accepting more spectacular movement.
2. Treat this as a player-experience guardrail, not as proof of Galaga visual conformance.
3. Pair this artifact with target-video object-track fit before promoting any challenge-stage rewrite.
