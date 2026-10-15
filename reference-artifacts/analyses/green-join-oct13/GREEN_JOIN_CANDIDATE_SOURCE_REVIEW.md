# Initial candidate source review

2026-10-13 read-only; runtime measurements pending. Nash src/js/06-enemy-behavior.js:652-669,.6 local-u smoothstep bridge.

1. Exact-boundary continuity is not established. Anchor is last sampled u<9.7, not exact9.7. At9.7 elapsed is alreadypositive, so smoothstep weight is nonzero. It immediately blends toward the discontinuous exit branch; left and right limits differ by nonzero weight times branch difference, plus finite-difference tangent approximation. This may greatly reduce observed jump but is not analytically C0/C1 at9.7. At anchor+.6 recovery is C1 relative to original exit because smoothstep value1/derivative0, provided finite anchor/tangent. Acceleration continuity is not guaranteed.

2. Repeated pre-exit clocks overwrite cached dx/dy with0; backward spans likewise reset. No division-by-zero, but subsequent bridge depends on diagnostic call frequency. Need repeated-clock nonmutation test or documented normal-forward-clock limitation; exact continuity claim requires stronger endpoint construction.

3. New small-extent retirement is correctly delayed until bridge settles, restoring old linear-exit outward proof afterwards. However legacy x<-54/x>PLAY_W+54 culling at final removal predicate is still active DURING bridge. If bridge can cross that boundary and return, it may erase later visible opportunity. Demonstrate no return/outer-bound crossing on bridge, or appropriately scope old horizontal cull too. Do not assume disabling laterEnvelopeSideExit disables all retirement.

4. .6 is local-u, not seconds. At saved du=.028983 per60Hz it lasts about.345s of runtime. Speed must be measured in game pixels per actual tick. A smoothstep recovering~200px across this interval can still be visually abrupt. 12px gate is not reference speed or exact mathematical continuity proof.

Eligible for diagnostic testing, not source approval for exact continuity. Preserve raw caches/envelope single application and all stated controls. Review actual seam/speed, killed-ID equality, full-view opportunity and lifecycle before disposition. No edits by reviewer.
