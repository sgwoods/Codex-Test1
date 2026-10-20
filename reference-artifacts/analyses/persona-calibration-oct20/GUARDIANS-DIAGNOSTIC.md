# Guardians ladder diagnostic, October20

Source baseline02166971 plus dirty keeper, exact hashes in summary.json. No tracked edits, builds, browser, release or remote actions. Only in-memory effective-config override.

## One tested proposal

Replace the entire stage-dependent effective-config transformation with base config plus safeLane:1 for all four personas. This removes Intermediate's Stage1 Expert/Professional hybrid explicitly. The shared foundation is the existing observed-motion left/stay/right650ms planner, unchanged. All base aiming, target priority, shot cadence and opening fields remain their own tier's values. Expert's unused safeLane* fields/early reactive overrides disappear; exact Expert trajectory outcome parity is separately checked. Professional's holdFireDuringUrgentThreat remains enabled, using its declared base thresholds rather than silent early overrides. No target filters, enemy, score, speed, RNG, lives or runtime-step changes.

Beginner=novice; Intermediate=advanced. Existing live actuator speed108px/s is identical across tiers; moveMul is unused and is not a skill knob. The planner uses observed velocities, approximate50ms samples and target-directed stopping; it is not continuous collision avoidance or a perfect predictor.

## Executed results

All80runs: Stage1, three ships, seed83001-83010 matched per tier,60Hz, maxPlayableStage99, maximum900simulated seconds. Alive900s sessions are censored. No fresh86001-86010 seeds used.

| Policy | Internal tier | Median score | Range | Median stage | Stage4+ | Censored |
|---|---|---:|---|---:|---:|---:|
| baseline | novice | 2775 | 760-5660 | 1.5 | 0/10 | 0/10 |
| baseline | advanced | 2220 | 410-6600 | 1 | 0/10 | 0/10 |
| baseline | expert | 14720 | 8720-18000 | 6 | 10/10 | 8/10 |
| baseline | professional | 2165 | 430-2980 | 1 | 0/10 | 0/10 |
| shared-safety | novice | 13485 | 4130-15320 | 6 | 9/10 | 8/10 |
| shared-safety | advanced | 15005 | 11340-16730 | 6.5 | 10/10 | 10/10 |
| shared-safety | expert | 14720 | 8720-18000 | 6 | 10/10 | 8/10 |
| shared-safety | professional | 12980 | 8700-15020 | 6 | 10/10 | 8/10 |

Strictly increasing candidate median scores: false. Expert all10 outcome/event-summary equivalence: false. Config fixtures: 20/20; all80runs had valid ordinary input objects. This does not prove browser event routing or complete runtime-state identity. Raw input traces were not recorded.

## Disposition and next acceptance

Do not declare the four-tier ladder calibrated. This tests a shared safety foundation and honest base-config differentiation, not guaranteed performance ordering. Preserve the current source until lead review. The hidden Intermediate hybrid should be removed through a named explicit policy, not replaced by another silent persona borrowing. Diagnose target choice and single-shot-slot utilization before any further competence change; larger pursuit/flagship weights or faster cadence are not inherently stronger. Do not weaken safety to manufacture lower-tier losses.

Before retaining a full ladder: freeze explicit per-game criteria using median, lower tail, progression and early gameovers; run the reserved86001-86010 panel once; browser-check representative Watch outcomes and the shared mode-parity suite. Guardians P2 remains unsupported. No Aurora score targets apply to Guardians.900s censoring means these scores are neither eventual maxima nor equivalent completed-game comparisons. No new enemy-fairness or release conclusion follows.

## Provenance

run.js is the executable method; execution.log logs every run; results.json contains80per-run outcomes, shots/hits, loss/progression events and effective-config matrices; summary.json binds method/source hashes and constants; comparison.json supplies paired deltas/per-seed ordering. source-snapshot contains exact measured files. Source hashes were checked unchanged at run end and archive time. finalize.js generates this report.

Focused synthetic safety/input fixtures: 32/32 pass; fixtures.js consumes the exact override recorded in results.json. Synthetic world setup is used only in fixtures, not in any of the80performance sessions.

## Important rejection details

Expert is NOT exactly preserved: nine scores match, but83010 changes15920->15500 (-420), with different shot/hit counts and Stage2+progression. Its unchanged14720median must not conceal this regression. The current planner movement branch can fall through to reactive handling when its returned axis is rejected near an edge; early reactive fields are therefore not globally dead. This is a source-grounded explanation candidate, not a traced first-divergence proof. Keep the accepted Expert effective configuration intact in any subsequent implementation proposal; do not apply this simplified override universally without disposition.

Intermediate improves in all10paired scores/stages and has10/10censored survivors; Beginner and Professional also improve all10paired scores/stages. This supports further review of the safety foundation, not a completed tier ladder. Candidate Professional median12980 is below both Expert14720 and Intermediate15005. A smaller shot count is observed (median473.5 versus Expert499.5), but is not causal proof of bad ammunition scheduling: survival, target choice and different live trajectories all confound it.

The raw maxOrdinaryMovementStep diagnostic excludes large jumps heuristically but can still include runtime-owned wave/reset recentering (for example12.6pixels in Expert83010). It is NOT a verified speed bound or proof of a controller teleport. Only the actual runtime updates player positions during these runs; the diagnostic controller returns ordinary left/right/fire inputs. Future actuator-bound checks must distinguish reset/advance branches rather than use this heuristic.
