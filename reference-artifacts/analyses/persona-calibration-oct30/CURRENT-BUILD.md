# Current-Build Persona Qualification

October 30, 2026. G3.2/G3.3 adoption experiment; no runtime integration or deployment.
Source `16baa705365d275903f7395ba0f08ed368f54f41`, private build1256.
PR260 merged separately as `277f69cff6498309fb2b6480fbb8ff55e49bbe3e`.

## Results

The unchanged private Expert body-veto candidate passes the frozen full-game
gates on current source. Browser ownership assertions pass, but exact P2
quiet/held equivalence remains open. These are separate acceptance claims.

| Persona / panel | Control median | Candidate median | Candidate range | Capped candidate runs |
| --- | ---: | ---: | --- | ---: |
| Beginner matched | 7,235 | 7,235 | 5,770-37,650 | 0/10 |
| Intermediate matched | 21,995 | 21,995 | 2,560-43,220 | 0/10 |
| Expert matched | 81,275 | 102,020 | 54,130-326,150 | 2/10 |
| Expert reserved | 97,780 | 97,780 | 53,040-324,410 | 1/10 |
| Professional matched | 240,785 | 240,785 | 197,300-356,660 | 10/10 |

![Current-build matched distributions](../persona-score-history/aurora-current-build-comparison.png)

Expert matched 75k attainment rises 6/10 to 7/10; reserved remains 8/10.
Destructions fall 32 to 29 and 34 to 29 respectively, with no new per-seed
Stage1-2 destruction. Reserved seed93007 still regresses 146,380 to 117,210
(Stage22 to20), despite fewer destructions. This is not universal improvement.
Professional reaches150k in10/10 and200k in9/10; all ten observations end at
the900-second budget, so scores are lower bounds, not eventual final scores.
Intermediate's 2,560/Stage1 weak tail remains unchanged. Wizard was not tested.

## Method And Provenance

100 sequential offline Chromium observations: four personas, matched seeds
91001-91010, both arms; Expert also reserved seeds93001-93010, both arms.
Stage1, three ships, Watch/game, deterministic1/60 updates,900-second budget.
Criteria and method hashes were frozen before panels. No physics, weapons,
enemy tuning, safety thresholds or controller parameters changed during runs.
Terminal game-over and active budget-censored outcomes are classified separately;
unexplained stops fail. Five classifier tests pass.

24 canonical private audio files (1,344,196 bytes per arm) were restored into
new inputs after hash validation. Old incomplete October29 inputs remain intact.
No private audio is included in this public report. All100 runs have zero
reference-audio load warnings. Public [measurement data](current-build.json)
contains per-run outcomes and raw hashes without absolute private paths.

Private packet: `private-artifacts/expert-current-oct30/`. PLAN.md, provenance.json,
panel.js, outcomes.js, results.json, verify.js and verified.json retain methods
and acceptance. Independent review checked all40 Expert runs against historical
non-audio events and mechanical snapshots:125,983 events and34,562 snapshots.
The lead verifier checked100 receipt/hash bindings and30 other-persona pairs.
Excluded audio events and cosmetic counts.effects are explicit; this is not
complete rendering/audio determinism. Full results hash:
`37094b31deae1e29b06656baf25eef882fbae36b278a3b939db904ac9f6d93c5`.

## Actual Browser Checks

The isolated driver exercises four personas in Watch and P2, with quiet and
held DOM keys, on each arm.32 individual gameplay cases pass: automated
ownership, Watch respawn, P1/P2 handoffs, separated fixture score ownership,
and restored manual P1 movement/fire. All24 audio assets decode on both arms.
Network writes and external connections are blocked; authentication is an
in-memory fixture. No live score or account persistence claim follows.

Exact quiet/held mechanical comparisons pass14/16, not16/16. Candidate Beginner
P2 differs in position/cooldown/shot coordinates; control Professional P2 differs
in shot coordinates. Candidate Beginner matches through the left-key checkpoint,
then diverges at the right-key checkpoint (Stage1 clock2.0s). This does not yet
establish an input leak or candidate regression; both suite summaries correctly
fail. Independent review identified a clock confound: advanceGameplayClock uses
wall time unless a global harness persona is set, while recTime honors the
controlled clock. P2 intentionally leaves the global persona empty to keep P1
manual. Enemy motion therefore varies across contexts and keyboard round trips
despite matching recorded simulation clocks. Even passing comparisons do not
remove this confound. Preserve `browser-candidate-v2/` and `browser-control-v2/`.

Candidate v1 had a fixture error: initialization accessed localStorage inside
restricted frames. V2 scopes initialization to the top same-origin document;
all page-error assertions pass. V1 method and failed receipts remain retained.
Screenshots and raw checkpoints accompany every case. Checks are bounded to
Stage1 and do not exercise the late-stage Expert veto or prove full-game
Watch/P2 equivalence. Board restoration is checked for populated state and
clock continuity, not complete checkpoint identity. No subjective audio-quality
or real-time frame-pacing claim is made.

## Next Steps

1. G3.3/G4.2: separate deterministic motion time from global autopilot selection;
   reproduce quiet/quiet versus quiet/held P2 with per-tick enemy checkpoints,
   then rerun both arms. Preserve manual P1 ownership; do not weaken equality.
2. Exercise the Expert late-stage collision across actual Watch/P2 transitions
   before proposing runtime integration. Human actuator equivalence remains open.
3. G1.3: measure one versus two isolated heavy jobs before enabling concurrency.
   G5 content contracts and G6 reference crosswalk can proceed independently.

Two specialists supplied asset/method verification and isolated browser-driver
work; the lead integrated. Heavy browser runs remained sequential. Private local
archive contains594 compressed artifacts with round-trip hashes at
`private-artifacts/persistent/expert-current-oct30/`; it is not off-machine
recovery proof. Hosted dev, beta and
production are unchanged; the private candidate is not the localhost build.
