# Adoption Phase Review

October 30, 2026. Baseline `5b1395647a9d604709f552c41c0cd33f18a02045`.
This packet records local follow-through, not merged or deployed acceptance.
Lead implementation; Socrates reviewed content boundaries, Bohr reviewed
reference provenance, and Jason independently reviewed process cleanup.

## Four-Step Outcome

1. **G1.2 bounded supervision:** nonzero exits initiate observed-descendant
   cleanup; missing `close` cannot hold settlement indefinitely after cleanup.
   Pending output receives the remainder of the 1.5-second cleanup budget before
   forced teardown. The result is explicitly incomplete when close is missing.
   Review caught premature pipe destruction; a delayed-close regression covers it.
   This is not OS containment: unobserved detached/reparented children remain
   unverifiable. Retain supervised cap2 for measured short jobs and serial careers.
2. **G5.1/G6.1:** refusal rules below and three-claim crosswalk are now recorded.
3. **G5.2:** executable proof applies three formation fields through actual pack,
   registry, entity construction and `spawnFormation` source. No game data changes.
   Forty enemies retain every other field; stages4/5 change as specified and
   sampled stages1/2/6/8/12 do not. This is runtime-consumption evidence, not a
   visual playability or motion-fidelity pass. G5.2 remains partial on that criterion.
4. **G3/G4/G6.3 decision review:** keep Expert private, preserve the regressing
   reserved seed and capped outcomes, and do not migrate controllers or add Wizard.
   Local recovery restored156 artifacts, verified compressed/raw/readback hashes,
   and parsed138 JSON files. No replay execution or off-machine restore occurred.

## Content Refusal Contract

The proof tool is `tools/testing/content-slice.js`, not an application importer.
It accepts JSON text containing only finite numeric `gx`, `gy`, `oy` fields for
the existing `fromStage:4` formation record. The proof envelopes are gx18-22,
gy16-20 and oy28-32; they are not measured playability limits.

| Request | Disposition |
| --- | --- |
| Formation spacing/vertical origin within envelope | Validate whole patch, return frozen copies; do not mutate source |
| Unknown, misspelled, nested, coercible or prototype-related fields | Reject entire patch; never silently drop fields |
| Enemy count/type, entry timing, path family, damage or scoring | Refuse this slice; separate runtime/reference task |
| Engine/capability changes | Separate reviewed implementation, never hidden in content data |
| New game or variant | Require capability definition, identity and score eligibility first |
| Timing/audio/fidelity adjustment | Preserve and measure references before tuning |

The tests demonstrate that unknown `spacingX` is actually ignored by the runtime,
then require the validator to reject it, including mixed valid/invalid patches.
VM boot/UI metadata and deterministic randomness are stubbed; gameplay consumers
are executed, not recreated. No browser playability claim follows from this test.

## Three-Claim Crosswalk

Preserved Star Swarm revision `cc463a0be578aee2131976b3556c633a2d5181b5`:
`private-artifacts/star-swarm-assessment-2026-10-28/star-swarm-cc463a0-source.tar.gz`.
SHA-256 `ee782b0fd34da81d53e8f2f3ed261e92109e74cc1195d6285afc546817701cb8`.
All upstream line references below are its `docs/reference/arcade-reference.md`.

| Claim | Preserved source | Aurora evidence | Assessment |
| --- | --- | --- | --- |
| Challenge stages3,7,11,15 | Lines244-247/674; gg1-3.s:c_2896/f_2916 | `13-aurora-game-pack.js` stageCadence and registry cadence consumer | High-confidence source agreement; not path fidelity |
| Challenge enemies do not fire | Line676 cites original manual1922 | Retained challenge-stage-reference observations; boot shot/attack caps0 and gameplay normal-firing exclusion | Source agreement; retained video notes not remeasured, collision safety not established |
| Perfect settlement10000, otherwise100 per hit | Lines678-679; game_ctrl.s:gctl_chllng_stg_end | `08-score-awards.js` gives10000 for perfect, zero non-perfect settlement | Concrete discrepancy; investigate intent and canonical measurement before changing scoring |

Impact/group points are distinct from end settlement. Star Swarm itself leaves
first-challenge boss impact points unresolved. Its upstream ASM/MAME immutable
revisions are not preserved here, so this is not independent hardware verification.
No score constants were imported or modified.

## Recovery Evidence

Source manifest: `private-artifacts/persistent/expert-body-veto-oct29/manifest.json`.
SHA-256 `5cd7b1c61a87e748bc6650bb3fd905c362c0291d376c960e9327666dc6ceb1d6`.
Fresh local restore and receipt: `private-artifacts/recovery-oct30-DeiWOs/`.
All156 files passed compressed hash, decompressed hash and disk readback checks;
138 JSON files parsed. No private data was uploaded. An approved destination and
independent restore remain necessary for G6.3; local restoration is not backup.

## Phase Exit And Next Phases

Local validation:17 managed-child tests pass with OS process inspection available;
`test:sim` and `test:docs` pass. Simulation receipt:
`harness-artifacts/test-runs/simulation-2026-10-30T20-16-06-770Z-6qsnQU/`;
documentation receipt: `harness-artifacts/test-runs/docs-2026-10-30T20-16-07-804Z-borWpy/`.
Sandbox-only supervision run failed four OS-inspection checks; rerun outside that
restriction passed, without weakening assertions. Localhost remains build1251,
source2e33ef4d, verified via build-info; these tooling changes are not in that build.

The adoption foundations are integrated through PR262. This local packet advances
the remaining steps, but **the full phase is not yet accepted complete**: reviewed
integration of these changes, G5.2 visual playability evidence and G6.3 off-machine
recovery remain. General containment, full-state replay and natural late-stage
qualification remain explicitly partial; they must not become retrospective passes.

Recommended next order, with no beta or production promotion:

1. Close this bounded packet through review/tests/CI; perform a visual formation
   probe and approved private recovery. Do not extend into a general scheduler.
2. **Player-quality phase:** reproduce guest movement issue249, then resolve the
   challenge-settlement discrepancy against canonical evidence. Address measured
   audio/transition defects. Scoring changes require explicit product acceptance.
3. **Persona qualification phase:** natural late-stage Watch/Rival checks on the
   current runtime, then a separate Expert decision. Retain seed regressions and
   censored distributions; choose common human-input migration only after evidence.
4. **Guardians core-loop phase:** agree one bounded lifecycle/controls/audio/score
   milestone before expansion. Keep preview status until that contract passes.
5. **Release phase later:** collect meaningful player-visible changes for dev;
   reopen beta only when that batch warrants it and the user authorizes the lane.

Use one lead and up to two independent specialists. Parallelize references and
review; isolate concurrent writers. Keep heavy careers sequential until capacity
is separately measured. Judge this operating model by player outcomes and delivery
cycles, not worker count. No new score distribution was measured in this packet.
