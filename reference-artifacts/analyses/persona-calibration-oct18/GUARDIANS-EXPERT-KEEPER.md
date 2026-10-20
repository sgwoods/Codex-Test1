# Guardians Expert Opening Repair

2026-10-18. Local keeper, baseline02166971 plus previously retained changes.
No commit, push, publication or frozen-beta replacement in this step.

## Change

Replaced only Expert's existing early-stage safe-lane decision function with
short-horizon left/stay/right risk and pursuit scoring. Motion estimates come
from previous/current observations; no future RNG or simulated enemy advances.
The controller uses actual runtime speed and bounds and returns ordinary inputs.
It preserves enemy motion, firing, scoring and lives. Other personas retain their
current policies. Expert's predictive safety is still limited to its existing
Stage1-2configuration. That scope is deliberate, not full skill calibration.

## Frozen Criteria And Results

Before candidate measurement:at least7/10reachStage2, at most2/10gameovers in
Stage1, median score at least2340, plus remote-hazard and input-integrity checks.
Stage1/three ships/900seconds/maxPlayableStage99 throughout.

| Panel | Reach Stage2 | Reach Stage3 | Stage1 gameovers | Median score | Timeouts |
| --- | ---: | ---: | ---: | ---: | ---: |
| Baseline72001-72010 | 2/10 | 0/10 | 2/10 | 2,340 | 8/10 |
| Candidate72001-72010 | 10/10 | 8/10 | 0/10 | 5,250 | 0/10 |
| Fresh83001-83010 | 10/10 | 10/10 | 0/10 | 6,260 | 0/10 |

Both candidate panels pass the predeclared criteria. These are actual-controller
VM runs; baselineVM behavior had matched40browser runs in the diagnosis. One
candidate browser Watch run,seed83001, matches Stage3/7040points/gameover at
360.633seconds. This is not a claim of20candidate browser runs.
Nine checks of other personas on original seeds51101/51201/51301 retain their
previous stage/score results. All fresh Expert runs still die inStage3. Longer
survival time alone is not the acceptance measure:the old eight900s stalls are
replaced with meaningful progression and eventual ordinary gameovers.

## Verification

- Build and JavaScript syntax pass; diff whitespace check passes.
- New harness:check:guardians-expert-pursuit passes10executable cases, including
  distant hazard pursuit, immediate-shot avoidance, both edges, aligned holding,
  velocity continuity/reset, no state advance or RNG consumption, and policy scope.
- Shared persona mode parity passes66/66.
- Existing Guardians runtime-slice and Stage5runtime-policy checks pass.
- Existing Guardians Watch browser check passes (Intermediate, score120,
  automated score not recorded). Expert full browser run is separate above.
- Independent read-only review recommends keep; requested mirrored-edge and
  teleport fixtures were added and pass. Reviewer did not independently rerun
  performance matrices. No full no-mistakes push/PR pipeline was run; this is an
  uncommitted local candidate and release authorization remains separate.

The predictor is approximate:50ms samples over650ms, linear observed velocity,
and predicted stopping at target x. It is not continuous collision avoidance,
perfect foresight, a Wizard pilot, or proof of human feasibility. Saved fixture
results and baseline diagnosis retain the original failure evidence.

## Inspection And Next Work

Localhost8000serves the rebuilt DEVELOPMENT artifact, verified byte-equal to
dist/dev/index.html. IndexSHA256:
b87b0cdb1bc13b633f0f1bd59cfdd97f3adb556b89e30620e309baad548a3bb0.
The user's localhost8002frozen beta remains unchanged.

Next Guardians decision:measure the Stage3handoff out of this safety policy,
then validate an explicitly scoped extension before changing Intermediate or
Professional. Expert now outperforming Professional is not a calibrated ladder.
In parallel, prepare AuroraStage4-6collision fixtures for its own bounded safety
repair. Do not copy Guardians scoring or physics into Aurora.

The accepted Aurora targets remain Expert75k-100k and Professional150k+with
repeated200k+upside. None is claimed achieved by this Guardians repair. Beta
remains held; the existing Aurora short-window score gate is still unresolved.

## Evidence

private-artifacts/persona-diagnosis-oct18/ contains evaluate.js, candidate-
diagnostic.json, candidate-heldout.json, candidate-three.json and browser-keeper/.
keeper-receipt.json binds source/method hashes, criteria, matrices,10fixture cases
and66mode-parity cases. A reviewable copy is guardians-expert-keeper.json beside
this report. Source:safe-lane function in
src/js/13-galaxy-guardians-gameplay-adapter.js. Executable regressions:
tools/harness/check-guardians-expert-pursuit.js.
