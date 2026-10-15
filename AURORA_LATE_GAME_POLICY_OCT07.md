# Aurora Late-Game Policy

October 7, 2026. Source baseline cf0e7a66. Planning decision, not an
implemented change or release authorization.

## Intent

Normal play remains endless. Do not author a unique level for every stage.
Preserve accepted early-stage behavior. After a provisional Stage 30 boundary,
reuse validated patterns and vary difficulty through bounded configuration.
This is Aurora progression policy, not a claim of exact original Galaga behavior.

## Constraints

- Scale enemy motion and pattern selection, not the global simulation clock.
- Keep canonical audio, result cadence and transition timing independent.
- Require full target entry, smooth exits and usable firing opportunities.
- Preserve challenge no-combat behavior and the Stage 3 keepers.
- Use a capped difficulty tier; do not increase speed or firing pressure forever.
- Choose numeric limits from representative tests, not arbitrary percentages.
- Reuse accepted patterns before adding new path families or combinations.
- Perfect clears must remain feasible; do not infer feasibility from one pilot run.

## Current Source Observations

- Normal stage clear increments stage without a victory cap:
  src/js/10-gameplay.js, stepAuroraRuntime.
- Ship exhaustion invokes gameOver: src/js/05-player-flow.js.
- stageBandIndex selects its final profile from Stage 16 onward:
  src/js/13-game-pack-registry.js.
- Challenge motion has a capped stage contribution and bounded playback scale:
  src/js/06-enemy-behavior.js, updateChallengeEnemy.
- Some formation, escort and dive shot velocities still depend on raw stage;
  a dive cooldown also subtracts stage * .02. These are audit findings, not
  measured late-game failures. Inspect their surrounding policy before repair.

## Work Order

October8 local integration: bounded effective-stage30 applied to combat terms,
not paths, actual stage, audio or global dt. Lead reran180 VM comparisons and
full seeded runtime stages30/32/62/126 plus challenge3/31/35/39 successfully.
Runtime reports in reference-artifacts/analyses/bounded-late-combat-runtime/
2026-10-08T20-23-11-938Z/. Full-runtime Stage30 and challenge traces match the
uncapped comparison; later velocities274-301 and new attack cooldowns1.9-4.2s.
Comparison uses the same bundle with the ceiling helper reversed. One controlled
seed per stage is not long-run/perceptual fairness acceptance. Uncommitted local
source only; no release. The ceiling is implemented provisionally, not claimed
as original Galaga's numeric policy.

Independent read-only audit by Nash at cf0e7a66 confirms static unbounded
combat terms: formation bullet velocity 154+stage*4; escort/dive velocity
181+stage*4 under endless tuning; dive cooldown subtracts stage*.02; dive
selection rate .9+stage*.035. Concurrency remains capped, but velocity and
cooldown are not. Calculated formation/dive speeds at Stage30 are 274/301,
versus 662/689 at Stage127. Endless cooldown can become negative at Stage127
and is entirely negative beyond Stage240. These are source calculations, not
measured fairness failures. See src/js/10-gameplay.js:218,
src/js/06-enemy-behavior.js:751,806,845 and src/js/00-boot.js:1724.

Smallest candidate: a combat-only capped effective stage for these terms,
while preserving real stage progression/telemetry and all <=30 behavior.
Stage30 freeze is an experimental ceiling, not accepted tuning. Test normal
30/32/34/36/62/126 (not challenge31/35/39), all <=30 equivalence including
RNG consumption, and challenge no-combat controls3/31/35/39/63/127.
Do not alter global dt or audio. No implementation has been made.

1. Finish the bounded Stage 31 missed-target exit measurement and repair.
   Player outcome: natural exits without sacrificing shooting opportunities.
2. Audit all late-game stage-dependent calculations. Define a single bounded
   difficulty policy using existing pack configuration where possible.
   Player outcome: predictable difficulty in long runs.
3. Test the boundary, representative cycles and a far-late stage, provisionally
   30, 31, 35, 39, 63 and 127. Compare full entry, motion continuity, firing
   opportunities and cadence. Add a long-run check for state stability.
   Player outcome: challenging but fair repeated patterns.
4. Implement only the smallest justified scaling correction. Keep optional new
   complexity outside the beta blocker unless required for correctness.
5. Complete the existing beta gates and obtain explicit publication approval.

## Beta Boundary

Unique endless content is not a beta requirement. The known exit defect remains
an acceptance blocker. A demonstrated unbounded late-game fairness failure is
also a correctness issue; optional extra complexity can follow beta.
No Guardians expansion, Stage 7 restart, push or deployment is authorized here.
