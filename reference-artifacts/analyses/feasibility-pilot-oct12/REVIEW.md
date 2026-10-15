# Rules-obeying feasibility prototype

Baseline checkout cf0e7a666067ede385865ba02e73d1454eb132d1, isolated codex/aurora-feasibility-pilot-oct12. Game source remains baseline; it is NOT the tested gameplay source. Tests serve only a copied frozen lead development artifact, index SHA256 d86e64702c5174e791409385c81901817af4e750d56a68e7a39c3eb311ff24b5. No build, lead edits, production persona changes, commit, push or publication.

Tool: tools/harness/feasibility-pilot.js. Tests: tools/harness/check-feasibility-pilot.js. Human launch, ordinary ArrowLeft/ArrowRight/Space key transitions, actual acceleration/precision windows, finite engine ammunition and cooldown. Read-only target velocity estimates guide a greedy diagnostic controller. No player/enemy positions, hp, score, invulnerability, culling, AI policy or global dt are assigned. Professional is excluded because its direct control is not normal-input proof.

## Semantics and reproduction

--mode=challenge --stage=31 means actual challenge display marker31 (Challenge8); allowed markers3/7/.../99. --mode=normal --stage=4 means INTERNAL stage4, not displayed regular level4. Normal launch explicitly uses stageMode internal, challenge launch display. --seed is a positive32-bit integer. --seconds maximum45; default45. Each invocation records a route then replays it in a new browser context with the same copied artifact and seed. No route search, teleport, pose fixture or trajectory tuning.

Run from this isolated checkout with NODE_PATH pointing to lead node_modules and AURORA_HARNESS_BROWSER_PATH pointing to cached chromium-1243 Google Chrome for Testing:

```sh
node tools/harness/feasibility-pilot.js --stage=31 --seed=9131 --mode=challenge --seconds=25
node tools/harness/feasibility-pilot.js --stage=1 --seed=9131 --mode=normal --seconds=25
node tools/harness/check-feasibility-pilot.js
```

Clock: Playwright installs/freezes browser Date/performance/RAF clocks; wall time advances17/17/16ms cyclically while gameplay advances exactly1/60 per tick. This preserves deterministic key-held windows without changing game dt/speed. Elapsed performance time is compared; absolute browser origins are retained and can differ. RAF is controlled and does not independently advance gameplay.

## Acceptance

Challenge perfect witness requires actual engine challenge_clear40/40,40 distinct initial target IDs killed by real shots, sufficient shot events reconciled with runtime shot counters, no forced setup/clear evidence, movement/velocity/shot interval and post-push event bullet caps passing, plus matching fresh replay. Immediate-hit shots must still respect player_shot.activeBullets. Normal stage-clear witness is a separate verdict, not a perfect challenge verdict; life losses remain reported.

Replay compares the recorded projection: snapshots excluding effect count, raw player/enemy poses and hp/miss, player bullets, RNG, stats, challenge counters and elapsed clock, plus ordered shot/kill/clear/loss events. It does NOT compare complete runtime, all AI timers, enemy bullet positions, rendering or audio. Cosmetic effect-count differences remain in raw evidence. No proof of human reaction, whole-game routeability or all-level feasibility. Nonperfect outcomes are inconclusive, never impossibility.

Focused tests reject zero-shot fake40-kill fixtures, duplicate/outside target IDs, forced clears, missing engine clear, shot-counter mismatch, insufficient shots, retained/post-push bullet cap violations, excessive movement and too-short cooldown. Normal internal4 options are supported; actual runtime validation is bounded to Stage31 and normal internal1.

## Evidence

Final Stage31/seed9131:1172 ticks, engine clear19.533s,37 distinct real kills/40,3 misses,80 shots,zero life losses,3 lives remaining. Maximum retained bullets2; minimum shot gap0.100s; maximum raw movement7.32894px/tick, speed439.736px/s (engine limit440). First trial and replay match recorded projection and ordered events exactly;251 ticks have cosmetic effect-count differences. Perfect feasibility is INCONCLUSIVE.

Final normal INTERNAL Stage1/seed9131:1377 ticks, engine clear22.95s,40 distinct real kills,73 shots,2 life losses,1 life remaining. Maximum retained bullets2; minimum shot gap0.250s; maximum raw movement7.28087px/tick, speed436.852px/s. Trial/replay and ordered events match exactly. A bounded normal stage-clear witness, not no-loss/perfect gameplay or a full-game route.

Both executed tool archives hash bc520d6708f68b049ed424971c384dce042b91e0ab108e7c9f1fc99c24c3dd6b, identical to final working tool. Options/audit unit tests and syntax/diff checks pass. No browser sessions remain running.

Final raw report paths, executed tool hashes and measured summaries are in summary.json. Private artifact, archived lead enemy source, executed tool bytes, full per-tick input/state traces, events and preliminary failed-tool reports remain in private-artifacts/feasibility-pilot. Preliminary failures were tooling issues (unavailable private cap helper, cosmetic effects and absolute performance origin), not perfect-route failures; final runs use corrected audit and comparison. The tool is a feasibility instrument, not a perfect production persona or release acceptance.
