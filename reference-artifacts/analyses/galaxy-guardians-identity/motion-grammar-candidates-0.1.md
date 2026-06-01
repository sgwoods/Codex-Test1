# Galaxy Guardians Motion Grammar Candidate Queue

Generated: 2026-06-01T16:32:14.660Z
Status: candidate-queue-analysis-only-no-runtime-change

## Summary

Guardians now has 6 grammar-backed movement candidate rows. The first priority is Stage-five stress routeability relief because routeability is 5.4/10 overall and 4.5/10 in the weakest stage-five stress group.

| Priority | Candidate | Primitive | Score | Risk | Status | Next Measurement |
| ---: | --- | --- | ---: | --- | --- | --- |
| 1 | Stage-five stress routeability relief | `scoring-routeability-window` | 5.5/10 | high | planned-no-runtime-change | Browser-backed persona before/after run at stage five with score, survival, collision-loss share, and object-track summary. |
| 2 | Scout dive duration and shape fit | `dive-attack` | 6.2/10 | medium | planned-no-runtime-change | Runtime-vs-reference movement comparison plus routeability review for baseline and candidate profiles. |
| 3 | Flagship escort readable pressure | `escort-linked-dive` | 6.9/10 | medium | planned-analysis-before-runtime | Contact-sheet and runtime tracklet before/after focused on linked flagship/escort path overlap. |
| 4 | Bottom wrap and return readability | `bottom-wrap-return` | 7.5/10 | medium | planned-analysis-before-runtime | Before/after visual sheet with wrap path overlays and persona collision-loss deltas. |
| 5 | Rack drift and opening cadence | `rack-drift` | 7.7/10 | watch | guardrail-not-change-target | Run frame-motion/object-track checks after any theme or sprite-scale change. |
| 6 | Movement-linked audio cue hooks | `dive-attack` | 6/10 | medium | planned-process-candidate | Add cue-hook fields to the next before/after candidate artifact and rerun audio-scene review where hooks change. |

## Candidate Details

### 1. Stage-five stress routeability relief

- Candidate id: `guardians-stage-five-routeability-relief`
- Primitive: `scoring-routeability-window`
- Axes: `player-routeability`, `collision-safety`, `shot-window`, `visual-readability`
- Problem: The weakest player-facing movement problem is not missing pressure; it is that stage-five stress is collision-dominated and does not convert into clean-clear routeability.
- Proposed candidate: Create a bounded stage-five movement candidate that slightly widens lower-field escape/read lanes and preserves shot pressure while reducing collision-loss share.
- Player meaning: A strong player should feel pressure and still see a route, rather than feeling that lower-field movement simply crowds them out.
- Promotion gate: Accept only if midrun-stage-five-stress routeability improves and object-track/pressure scores do not materially regress.

### 2. Scout dive duration and shape fit

- Candidate id: `guardians-scout-dive-duration-shape`
- Primitive: `dive-attack`
- Axes: `temporal-cadence`, `path-topology`, `collision-safety`, `shot-window`
- Problem: Runtime dives are much shorter than the reference proxy median (2.65s vs 5.5s), even though x/y span and event coverage are strong.
- Proposed candidate: Try a slower, longer scout-dive profile in a controlled candidate while preserving current first-dive timing and stage-one readability.
- Player meaning: Dives should read as graceful arcade pressure with time to aim, not as abrupt short hops.
- Promotion gate: Accept only if duration fit improves and routeability does not fall below the current baseline.

### 3. Flagship escort readable pressure

- Candidate id: `guardians-flagship-escort-readable-pressure`
- Primitive: `escort-linked-dive`
- Axes: `object-grouping`, `role-family`, `path-topology`, `player-routeability`, `audio-cue-hooks`
- Problem: Guardians has reference-backed escort pressure evidence, but the candidate loop has not yet isolated whether escort-linked dives are readable scoring opportunities or only extra density.
- Proposed candidate: Create a named escort-linked-dive candidate with explicit escort spacing/lag variants and before/after routeability deltas.
- Player meaning: The flagship should feel like a special coordinated threat, not just another object in the lower-field crowd.
- Promotion gate: Accept only if escort grouping remains visible and persona routeability is preserved or improved.

### 4. Bottom wrap and return readability

- Candidate id: `guardians-bottom-wrap-return-readability`
- Primitive: `bottom-wrap-return`
- Axes: `path-topology`, `temporal-cadence`, `collision-safety`, `visual-readability`
- Problem: Runtime wrap coverage exists, but the next quality question is whether wrap/return behavior is visually readable and fair when pressure increases.
- Proposed candidate: Instrument wrap/return path variants with explicit lower-field routeability and visual-overlap checks before changing runtime constants.
- Player meaning: The player should understand where a returning enemy will go and why a collision happened.
- Promotion gate: Accept only if wrap count/coverage remains healthy and collision-loss share does not rise.

### 5. Rack drift and opening cadence

- Candidate id: `guardians-rack-drift-and-opening-cadence`
- Primitive: `rack-drift`
- Axes: `temporal-cadence`, `path-topology`, `visual-readability`, `player-routeability`
- Problem: Opening/rack motion is useful enough to guard, but future theming and variant work could accidentally break the stable rack read.
- Proposed candidate: Keep rack drift as a guardrail row and require future visual/theme variants to preserve rack stability and opening cadence before promotion.
- Player meaning: The first screen should read like a coherent arcade formation before individual threats peel away.
- Promotion gate: Accept only if rack stability, opening cadence, and visual-role separation remain above current floors.

### 6. Movement-linked audio cue hooks

- Candidate id: `guardians-movement-audio-cue-hooks`
- Primitive: `dive-attack`
- Axes: `audio-cue-hooks`, `temporal-cadence`, `player-routeability`
- Problem: Movement candidates currently track visual/routeability risk better than audio meaning; dive and escort changes should also say when audio needs to warn, reward, or clarify.
- Proposed candidate: Add audio cue-hook fields to movement candidate reports before tuning dive/escort/wrap behavior further.
- Player meaning: Sound should help the player understand threat and reward timing rather than simply decorating the scene.
- Promotion gate: Accept only if movement candidates declare whether audio hooks are unchanged, required, or intentionally deferred.
