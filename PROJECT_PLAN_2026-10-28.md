# Aurora and Platinum Project Plan

Created October 28, 2026; phase status refreshed October 30 after PR262.
Plan of record from Aurora Project Lead. The user has directed that adopting
Star Swarm lessons, not progressing toward another beta, is the current focus.
Original implementation baseline: 3c7d2667; build-details PR #256 merged at e80af082 (submission 65883aad).
Current integrated baseline: `5b139564` (PR262). PR260 integrated lifecycle
diagnostics and compact memory; PR261 integrated controlled-clock repairs and
historical evidence; PR262 integrated targeted/batch cancellation and measured
concurrency reporting. The Expert policy candidate remains private, not integrated.
Supersedes October 4 planning priorities, not preserved experimental results.

Delivery receipt, October 28: PR256 and PR257 merged; dev-only publication
completed from source 2e33ef4d as 1.4.2.1/build1251. Hosted identity, 13 assets,
browser smoke and offline desktop/mobile build details passed. All 1280 public
non-dev blobs and 600 frozen beta files are unchanged. Receipts are retained in
private-artifacts/dev-release-2026-10-28/. Production/beta hold remains in force.
This is a historical delivery receipt, not the objective of the adoption program.

Adoption cycle, October 28: the user authorized the recommended first packet.
Focused test commands, executable documentation claims, isolated copied-bundle
experiments and PR workflow updates were implemented on
`codex/adopt-test-contracts` and subsequently integrated in PR258. Retained Expert telemetry reproduced exactly within
the documented exclusions; the automated/human actuator difference is measured,
not repaired. See [cycle evidence and next packet](ADOPTION_CYCLE_2026-10-28.md).
October29 continuation: PR258 passed no-mistakes and hosted Release Contracts
CI and merged at0977fef4. No new publication; beta remains on hold. The retained
Expert collision is reproduced and explained by a bullet/body priority conflict.
One private safety-veto candidate passed paired historical qualification:
matched Expert median81,275 ->102,020; reserved median97,780 unchanged, with
fewer destructions in both panels. It is not integrated or shipped. See
[the measured result and remaining gates](reference-artifacts/analyses/persona-calibration-oct29/EXPERT-BODY-VETO.md).
Current status: ACTIVE_WORK.md.

## Recommendation

Cross-project follow-up: [Star Swarm assessment](STAR_SWARM_ASSESSMENT_2026-10-28.md)
supports the quality-first pilot, with a smaller test-command surface, executable
documentation claims and checkpointed failure replay. It identifies a real
automated/manual actuator difference to measure before persona tuning. The
comparison does not establish model/harness superiority and does not authorize a
runtime rewrite, new orchestration service or beta promotion.

Keep production 1.4.2 stable and make incremental adoption the main program.
Use Aurora quality work as a concrete proving case for better tests, diagnostic
replay, input contracts and agent execution, not as a reason to return to a beta
checklist. Preserve the quality-first product direction and the bounded Guardians
milestone; do not start a third game or platform rewrite. A meaningful dev batch
is a later delivery option, not the completion criterion for these goals.
No new publication or beta progression is authorized by this plan update.

The strategic goal remains one Platinum host with multiple credible arcade
games. A faster process is useful only if it delivers better play, dependable
records and evidence that humans can inspect.

## Major Goals And Minor Goals

The six major goals below map directly to the six Highest Value Lessons in the
[Star Swarm assessment](STAR_SWARM_ASSESSMENT_2026-10-28.md#highest-value-lessons).
They are the authoritative adoption backlog. Minor goals are bounded deliverables
within each major goal, not separate competing roadmaps. Completed means the
stated scope has evidence; it never implies a broader capability or release.
The existing P1-P4 work packets remain the implementation detail, mapped below.
The lead owns integration and status; independent specialists review bounded
research and acceptance evidence. Unapproved thresholds remain proposals.

| Major goal | Outcome | Current status | Supporting packets |
| --- | --- | --- | --- |
| G1. Small, trustworthy tests and effective parallel execution | Agents can select checks, isolate work and demonstrate useful delivery efficiency | Foundations/cancellation merged; bounded two-worker pilot measures1.66x throughput; general containment incomplete | P2, agent operating model |
| G2. Executable documentation and compact project memory | Current claims fail visibly when stale; current priorities are distinct from history | Twelve claims, compact packet and checked archive/index integrated; ongoing upkeep | P2, P4 |
| G3. Explicit persona/input contracts and credible capabilities | Testing, Watch and Rival share defined behavior; human-control differences and skill limits remain explicit | Historical100-run panel retained; clean build1257 lifecycle qualified; Expert candidate private and human boundary open | P1 |
| G4. Reproducible failures and first-divergence diagnostics | Replay real runtime behavior with sufficient identity and checkpoints to explain failures | Collision explained; clock/restart/transition repairs merged; reusable full-state replay incomplete | P1, P2 |
| G5. Bounded data-only content authoring | Agents change supported content safely and refuse unsupported behavior | Local refusal validator and runtime formation proof pass; visual playability pending | P3, P2 |
| G6. Shared reference evidence with provenance | Cross-project findings improve measured fidelity without importing unverified constants | Three-claim crosswalk recorded;156-artifact local restore verified; remote restore pending | P4, reference/conformance workflow |

### G1: Trustworthy Tests And Parallel Execution

| Minor goal | Status and next action | Acceptance evidence |
| --- | --- | --- |
| G1.1 Focused test entry points | Complete for the initial scope in PR258; extend coverage only as needed | Test map, fast/docs/sim/browser commands, negative fixtures and retained CI receipts |
| G1.2 Safe worker lifecycle and isolation | Partial: PR260 diagnostics and PR262 cancellation integrated;13 supervisor tests pass | Caller cancellation preserved, siblings cancelled/awaited; unkillable/open-pipe settlement, failed-worker descendants and unobserved detached containment remain open |
| G1.3 Measured agent/harness efficiency | Bounded pilot complete, broader goal partial: two supervised workers only for measured lifecycle workload | Six monitored paired rounds:135.062s serial/81.248s parallel;1.662x throughput, peak sampled RSS1551/2987MiB; not three end-to-end delivery packets or full-career capacity |
| G1.4 Evidence validity and reviewed integration | Adoption packets integrated through PR258/260/261/262; dependency-based validity still planned | Review/CI passed; retain existing freshness gates until fail-closed dependency tests qualify a replacement; no publication implied |

### G2: Executable Documentation And Project Memory

| Minor goal | Status and next action | Acceptance evidence |
| --- | --- | --- |
| G2.1 Initial semantic documentation contracts | Complete for twelve explicit claims; extend high-value current-state claims incrementally | Positive and deliberately failing fixtures; retain release hashes and PDF/diagram visual checks |
| G2.2 Compact active packet and goal reporting | Merged in PR260 October30: 2,768-line working copy preserved byte-for-byte; compact active packet and history index implemented | SHA-256/size/line checks, negative fixtures, reachable file links and a 150-line startup budget; see WORK_HISTORY.md |
| G2.3 Documentation follows accepted outcomes | Ongoing: update goal status, limitations, test map and score-history graphics together | Reports distinguish measured, proposed, integrated and shipped; untested personas are never carried forward as new measurements |

### G3: Persona And Input Contracts

| Minor goal | Status and next action | Acceptance evidence |
| --- | --- | --- |
| G3.1 Characterize automated versus human control | Initial probe complete; extend shadow trajectories before deciding a common input boundary | Same timestep/input history with acceleration, reversal, bounds and ownership differences recorded; no human-equivalence claim from automated parity |
| G3.2 Qualify the narrow Expert safety candidate | Snapshot build1256 / `16baa705` matched/reserved gates pass October30; private candidate not integrated | Frozen criteria, all per-run outcomes and hashes; preserve the regressing seed and three censored results; no concurrent actuator/clock change |
| G3.3 Full-persona and real-mode nonregression | Historical100-run matrix passes; PR261 clean build1257 passes19 lifecycle cases/eight comparisons | Natural late-stage qualification and common human input boundary remain open; bounded checks are not full-career browser equivalence |
| G3.4 Decide input migration and skill-ladder scope | Decision pending after G3.1-G3.3; keep migration separate from policy tuning | Approved capability criteria and any migration's matched movement/collision/score/audio/human-feel acceptance; Wizard remains a later unranked stress-test option |

### G4: Reproducible Failures And Diagnostics

| Minor goal | Status and next action | Acceptance evidence |
| --- | --- | --- |
| G4.1 Explain one preserved collision | Complete for the retained Expert failure and documented telemetry projection | Archived control equality, unrounded trace, independently replayed decisions and first-divergence evidence; not full-state/audio determinism |
| G4.2 Generalize the diagnostic replay contract | Partial: controlled motion clock, initialSimT ordering and timestep transition correction integrated in PR261 | Pause/restart, three timesteps and rounded board clocks tested; reusable full-state capture/restore and natural transition pacing remain open |
| G4.3 Runtime-backed first-divergence inspection | Deferred until G4.2 is demonstrated | Reconstruct with the actual adapter/runtime, compare against archived checkpoints and retain visual video evidence; no second approximate simulation |

### G5: Bounded Content Authoring

| Minor goal | Status and next action | Acceptance evidence |
| --- | --- | --- |
| G5.1 Explicit task boundaries and refusal rules | Local implementation complete; reviewed integration pending | Formation allowlist, atomic unsupported-field rejection and refusal matrix in October30 phase review |
| G5.2 Validate one existing configuration slice | Partial: real formation consumers prove gx/gy/oy effects for stages4/5 |40 entities, unchanged other fields and sampled unaffected stages; visual playability evidence remains required |
| G5.3 Prove the contracts with Guardians' core loop | Queued: define the bounded stage/lifecycle slice with the human before expanding features | Start/handoff/loss/restart, controls/audio, per-game scores and replay isolation; personas use Guardians' own score scale; preview status retained until accepted |

Named player variants remain a later option, not a current marketplace goal.
Any rule-changing variant needs distinct identity and scoring eligibility first.

### G6: Reference Evidence And Recovery

| Minor goal | Status and next action | Acceptance evidence |
| --- | --- | --- |
| G6.1 Cross-project reference crosswalk | Complete for three source-level claims in October30 phase review | Preserved revision/hash; cadence and no-fire agreement; non-perfect settlement discrepancy recorded without changing scoring |
| G6.2 Measurement-led fidelity and defect work | Ongoing method; next select a reproduced high-impact issue, including game-over audio #247 if still current | Saved clip/cue timeline, waveform/contact-sheet or timing analysis before tuning; preserve full canonical phrases when feasible |
| G6.3 Recoverable private evidence |156 artifacts restored locally, hashes/readback verified and138 JSON files parsed; off-machine restore pending | Private receipt in recovery-oct30-DeiWOs; no remote transfer or replay-execution claim |

## Current Recommended Order

Latest [four-step phase review](ADOPTION_PHASE_REVIEW_2026-10-30.md) advances the
checkpoint below: local bounded-settlement repair, refusal/runtime proof,
three-claim crosswalk and local recovery are implemented. Integrate through gates,
finish visual playability and approved off-machine recovery before declaring the
whole phase complete. Then prioritize player-quality defects, natural persona
qualification, and a bounded Guardians core loop, in that order. The sequence
below is the retained pre-follow-through checkpoint, not a claim those steps are
still untouched. No beta or deployment is authorized.

October30 phase checkpoint: foundations are integrated; the adoption phase is
still in progress. Do not collapse partial G1/G3/G4 results into an overall pass.

1. Bound the next G1.2 containment packet: reproduce open-pipe/failed-worker
   descendant cases, define a fail-closed settlement contract, and assess a real
   containment boundary. Until qualified, retain supervised cap2 for short
   lifecycle jobs and sequential full-career jobs. Do not build a new scheduler.
2. In parallel, begin G5.1 refusal rules and G6.1 three-claim reference crosswalk
   as independent bounded work. These need no expansion of browser concurrency.
3. Use those contracts for one existing G5.2 configuration slice with measured
   runtime effect. This is the next concrete player-value demonstration, not a
   general authoring platform or third game.
4. Return to G3/G4 natural late-stage and input-boundary qualification; decide
   Expert integration separately, retaining the regressing seed and censored
   outcomes. Keep Wizard and controller migration out of this packet.
5. Close the phase only after evidence recovery is tested, the content slice
   passes, and remaining limitations have explicit dispositions. Consider a
   meaningful dev batch then; no beta date or deployment is authorized now.

Planning estimate, not a commitment: containment decision1-2 bounded cycles;
G5.1/G6.1 one parallel cycle; G5.2 and runtime validation1-2 cycles; recovery and
phase review one cycle once an approved backup destination is available. Failed
acceptance checks may add cycles. Do not wait for perfect OS containment to do
safe read-only reference work or serial content validation.

### Earlier Sequence (Historical)

1. G1.2 diagnostic hardening and G2.2 archive/index are merged through PR260
   with hosted CI on October30. Scope and original receipts are in
   [the hardening report](ADOPTION_HARDENING_2026-10-29.md). Broader worker isolation
   and OS containment are not established by the diagnostic fix.
2. G3.2 current-build gates pass; [October30 evidence](reference-artifacts/analyses/persona-calibration-oct30/CURRENT-BUILD.md)
   retains the full100-run panel. [Controlled clock follow-through](reference-artifacts/analyses/persona-calibration-oct30/P2-CLOCK.md)
   resolves the measured P2 confound locally. [Lifecycle follow-through](reference-artifacts/analyses/persona-calibration-oct30/LIFECYCLE.md)
   covers pause/restart and alternate steps on a fresh dirty build. Next review
   and integrate the packet, then qualify its exact committed package. Use one heavy
   browser workload until G1.3 demonstrates that more is safe and useful.
3. Measure G1.3 across comparable packets and use the results to choose the next
   increment. Begin the small G5.1/G5.2 content slice and G6.1 reference crosswalk
   without taking on a general authoring platform or controller rewrite.
4. Review major-goal outcomes and remaining decisions. Consider dev delivery
   only when there is a meaningful accepted batch and explicit authorization;
   beta planning is not the current program's next milestone.

Each cycle reports major/minor goal IDs advanced, evidence, limitations and the
next recommended minor goals. Release state is a short constraint note unless
the user explicitly reopens release planning. Dates below remain estimates for
the original pilot, not beta targets or authorization for every proposed task.

## Verified Position

| Area | Position | Remaining uncertainty |
| --- | --- | --- |
| Production | 1.4.2/build1218/ea779a76 shipped October 26; hosted smoke and documentation checks passed | This plan is not a new full production audit |
| Accounts and scores | Per-game signed-in storage shipped; human confirmed reload/new-tab persistence | Account-linked does not mean cheat-proof or replay-validated |
| Build details | 1.4.2.1/build1251 live on dev; review, tests, CI and hosted checks passed | Human inspection remains useful; no beta promotion |
| Aurora personas | October 20 integrated panel: Beginner median 7,235; Intermediate 21,995; Expert 81,275; Professional 240,785 | Ten seeds each, 900-second cap; Expert only 6/10 at 75k; not final career distributions |
| Professional | Across three distinct repaired panels, 30/30 reached 150k and 28/30 reached 200k | All survived the time cap; no population or world-record guarantee |
| Fidelity | Accepted safety, capture/rescue and transition improvements | Exact original-game fidelity, all-level perfect feasibility and human actuator equivalence not established |
| Guardians | Playable preview with persistent game-specific scores | Not accepted v1; its score scale and incomplete persona evidence cannot be treated as Aurora's ladder |
| Infrastructure | PR258/260/261/262 integrated focused tests, checked memory, clock fixes and cancellation; bounded concurrency pilot measures1.66x throughput | Legacy harnesses not automatically isolated; no general unattended or full-career capacity claim; issue259 containment remains partial |

October 26 conformance figures (8.7 overall, 7.46 application average, 4.3 strict
challenge) reanalyze older inputs. They are not new October 28 gameplay results
and should not become one overall product-readiness score. Historical movement
issues #248/#249 did not reproduce in a short current-production guest probe;
retain the limitation that raw probe output was not archived.

![Historical October 20 Aurora persona score distributions](reference-artifacts/analyses/persona-score-history/aurora-current-ladder.png)

The chart is retained evidence, not an October 28 rerun. It shows matched seeds,
the repaired Professional panel and its old-policy control. Time-capped runs
are marked; do not interpret their observed scores as final lifetime scores.

## Development Options

| Path | Suggested allocation | Benefit | Cost and risk |
| --- | --- | --- | --- |
| A. Aurora quality first, recommended | About 60% player quality, 25% test/release efficiency, 15% Guardians definition | Clear value for current users; builds on accepted Professional work | Guardians depth arrives later; Expert tuning may yield a justified rejection rather than a fix |
| B. Multi-game breadth first | About 30% Aurora, 25% infrastructure, 45% Guardians | Tests the Platinum proposition sooner | Two incomplete quality ladders; more UI/service compatibility work; larger acceptance surface |
| C. Harness/platform first | About 20% player fixes, 60% infrastructure, 20% measurement | Can reduce repeat work across future games | Greatest risk of building machinery while users see little improvement |

These remain product-direction options, not competing task backlogs. The G1-G6
goal register owns current work. Allocations are planning choices, not measured
resource consumption. Retain A's quality-first direction during the adoption
pilot, then compare accepted capabilities, player improvements and elapsed
delivery cost. Do not commit the whole project to an infrastructure rewrite.

## Planning Windows

Dates assume a start October 29, one lead and up to two specialists, regular
review availability, one workstation and existing account/reference access.
Ranges are planning estimates, not unattended work commitments or release dates.
A cycle is one bounded diagnosis/change/validation packet, not a fixed day.

| Window | Work and dependencies | Exit decision |
| --- | --- | --- |
| Completed dev cycle | Build details integrated and dev-only publication verified | 1.4.2.1/build1251; production/beta unchanged |
| Completed adoption integration, Oct 29 | Test map, executable claims, private runner and retained Expert replay checked; PR258 merged after review/CI | Tooling and diagnostic evidence, not a player-quality gain or release |
| Days 1-3, Oct 29-Nov 2 | G4.1 collision diagnosis complete; next G1.2 lifecycle hardening, G2.2 compact status and G6.3 recovery preparation | Trustworthy inputs/outputs and readable current project state; no unmeasured parallel-capacity claim |
| Days 4-10, Nov 3-11 | G3.2/G3.3 current-build quality case, G4.2 replay contract, then G1.3 efficiency comparison | Accepted adoption capabilities and measured cost/rework, not a required dev or beta release |
| Weeks 3-4, Nov 12-25 | If the pilot succeeds, G5.1/G5.2 content slice, G6.1 crosswalk and G5.3 Guardians definition/qualification | Reusable content/evidence contracts and an agreed Guardians capability milestone, not automatic v1 |
| Weeks 5-8, Nov 26-Dec 23 | Choose G4.3 inspection tooling, deeper Aurora fidelity or Guardians depth from measured benefit | Scope the next product increment; third game only after two-game contracts prove reusable |

The next beta is explicitly paused. Revisit it only when the human chooses a
coherent batch with a substantial player outcome, not because a date arrives
or a count of small features has accumulated. A serious safety/security fix
can justify a separate urgent release decision.

## Supporting Work Packets

P1-P4 retain the original plan's product scope and detailed constraints. The
G1-G6 register above owns current priorities and statuses; these packets do not
form a second ordered task list. P1 supports G3/G4, P2 supports G1/G2/G4/G5,
P3 supports G5, and P4 supports G2/G6.

### P1: Expert reliability and honest persona ranking

Freeze a controller/bundle hash and the measurement method before testing.
Read failure replays and traces from the weak tail; compare selected actions
with available safe alternatives. Do not begin with a blind parameter sweep.
Preserve current scoring, lives, enemy rules and Professional improvements.

Use fast safety/lifecycle fixtures first, then matched 10-seed panels, then
fresh held-out seeds. Show every run, median, range, target attainment, deaths,
stage, elapsed simulated time and censoring. Append the existing versioned
score-history graphic; never mix 16-second Stage 2 trials with 900-second runs.
Record implementation SHA and bundle/controller/method hashes, not just labels.

Prospective criteria for discussion: Expert should reach 75k on at least 8/10
diagnostic seeds, with a median in the intended 75k-100k range; Professional
should retain its agreed 150k reliability and 200k upside without safety loss.
Final acceptance uses a held-out panel and reports uncertainty, not a precise
success-rate claim from ten seeds. Proposed criteria must be approved before
experiments. Do not retrospectively relabel failures as passes.

The old Stage 2 per-seed Professional-over-Expert requirement remains a recorded
throughput diagnostic, separate from safety acceptance. Decide its future role
explicitly. Occasional short-window score inversion is not automatically a bad
skill ladder. Test behavior through simulation, visual Watch and P2 ownership
on the same controller; test normal key input separately from direct actuation.
Wizard remains an optional unranked stress-test tier after the ladder is sound.
It must not post human scores or claim world-record competence without evidence.

Stopping rule: after two failed bounded candidates for the same diagnosis,
return to evidence and alternatives. No endless tuning to satisfy one seed.

### P2: Faster trustworthy tests and releases

The first local packet now provides the [test map](TEST_MAP.md), focused commands,
negative fixtures, executable claims and a copied-bundle experiment wrapper.
PR258 integrated it on October29. Extend subsystem coverage incrementally, not by replacing 400
scripts at once. Retain Mac/audio/live-service acceptance where necessary.
Hosted CI acceptance passed. Short-workload throughput is measured; end-to-end
delivery efficiency across three comparable work packets remains unmeasured.

Build once for a candidate and record immutable artifact hashes. Each worker
gets a unique output directory and port. Disable implicit rebuilds and canonical
latest-file writes in worker mode; the lead alone aggregates accepted outputs.
The copied-bundle path implements an initial contract; extending it to other
worker paths still requires concurrency regression tests and lifecycle hardening.
Do not claim current helpers are already safe for arbitrary parallelism.

Propose content/dependency-based evidence validity as a later improvement to
the current four-commit freshness window. It must reject changed runtime,
method, fixtures and relevant assets while accepting documentation-only changes.
Only replace the current gate after fail-closed regression coverage and review;
do not bypass it during this release. Keep new gameplay measurement distinct
from regenerating an old report under a recent commit.

Pilot acceptance across three comparable packets: complete provenance, zero
shared-output collisions, no higher flake/rework rate, and a suggested 20% median
elapsed-time reduction. That target is not a measured speedup. Count lead
integration/review time, retries, token usage where available and wall-clock
critical path; do not sum overlapping durations as elapsed time or infer dollars.

### P3: Guardians completion definition

Define a vertical slice before expanding features: ordinary start, complete
stage handoffs, loss/game over/restart, per-game records, replay isolation,
controls and audio behavior. Decide stage range and conformance tolerances with
the human. Measure its personas on its own scoring scale. Do not add Rival
until its lifecycle/ownership and score exclusions pass the same host contracts.
No Aurora constants copied to force equivalent scores. Remain preview until
the agreed slice passes package, browser and human inspection.

### P4: Backlog, evidence and player trust

Deduplicate historical movement/input issues against current reproductions.
Triage #247 game-over audio with a saved clip/cue timeline before tuning; select
player feedback defects by current impact, not issue age. Maintain one compact
active packet and one authoritative milestone table; mark old plans historical.
Verify off-machine private-reference backup and restoration before relying on
more parallel environments. Keep account identifiers, tokens and licensed
reference media out of public artifacts and cloud tasks by default.

Keep shared replay catalog/video export, richer pilot summaries and broad level
expansion as medium-term options. Public competitive anti-cheat scoring is a
separate server-authority project, not a property of signed-in persistence.

## Agent Operating Model

Use native Codex subagents for bounded exploration, independent diagnosis and
review now. Keep one lead integrating, building, refreshing canonical evidence
and publishing. Start with two specialists, not a standing organization of many
role chats. Use independent implementation worktrees only for disjoint files
and contracts. A worktree isolates tracked files, not shared services, databases,
ports, private artifacts or every runner's default output.

| Work | Best execution | Do not parallelize |
| --- | --- | --- |
| Reference analysis and bug diagnosis | Two read-only specialists with different hypotheses | Multiple writers tuning one controller |
| Feature and independent tests | Disjoint worktrees, common frozen interface and baseline | Shared boot/template/build files without a single owner |
| Seed/scenario matrix | Deterministic job runner, immutable bundle, unique outputs, one aggregator | Every seed managed by a separate conversational agent |
| Review | Independent reviewer sees diff, intent and counterexamples | Author alone certifying its own result |
| Release/docs | Lead serializes integration and full release gates | Concurrent builds or canonical latest/ledger writers |

Each assignment names baseline SHA, permitted paths, hypothesis, expected
deliverable, commands, success criteria, budget, stop condition and no-deploy
boundary. Return concise findings with artifacts and limitations. Accepted
evidence persists in repo/private storage with recovery hashes. Chat is a working
conversation, not the only source of truth. Keep run-specific scratch state out
of growing top-level status prose; index dated completed packets instead.

Two supervised short lifecycle workers are provisionally supported by the October30
pilot; full-career jobs remain sequential. Preserve responsive localhost for human play. Agent concurrency
and CPU/browser concurrency are independent controls. Escalate only real product
choices, permission barriers and failed gates; continue routine bounded work.

### Harness choices

| Mechanism | Use now | Tradeoff |
| --- | --- | --- |
| Native Codex subagents/worktrees | Default for this repository | Lowest setup cost; still needs ownership and output isolation |
| Existing deterministic game harnesses | Shard repeatable scenarios after isolation contract | Reproducible and cheap relative to conversational orchestration; must preserve exact method and mode |
| no-mistakes and GitHub CI | Independent integration checks and PR feedback | Valuable review boundary; provider failures, user decisions and CI latency remain real |
| Custom Codex SDK/App Server or Agents API coordinator | Consider only after pilot demonstrates scheduling/recovery need | Adds lifecycle, credential, tracing, retry and budget maintenance; not necessary just to use subagents |
| Remote/cloud workers or another model/provider | Later portable static checks or independent review with approved data scope | May add capacity/diverse review; setup, model cost, privacy and environment parity risks |

No new automation, remote account, provider subscription or model configuration
is enabled by this plan. A second provider is useful only if it catches useful
independent defects more reliably than it adds delay; measure that claim.

## Release and Rollback Discipline

Local work -> reviewed integration -> `/dev` accumulation -> human batch decision
-> exact packaged beta -> approval -> production. The arrows after dev are
blocked until explicitly authorized. Dev labels are iteration counters over
the production family; package SemVer, platform/game versions, build sequence
and source SHA are distinct fields. The displayed artifact is authoritative.

For each authorized dev publish: clean source, mandatory checks, exact hosted
identity, details-panel smoke, and protected beta/production inventory comparison.
Retain the previous dev artifact and public commit for rollback. Do not change
production scores or schema during feature validation. Before any future
data migration, require a separate additive migration/rollback review.

## Decisions for Discussion

1. Retain the quality-first direction while evaluating adoption outcomes through
   G1-G6; revisit the Path A/B/C allocation after measured pilot results.
2. Approve prospective Expert consistency criteria and decide the role of
   the Stage 2 throughput diagnostic before new persona tuning.
3. Prioritize Guardians core-loop completeness before Rival, or require Rival
   in the first accepted milestone and accept a longer timeline?

The runner/test-map packet is integrated; the collision trace and historical
Expert candidate qualification are complete within their stated limits.
The Current Recommended Order above replaces those completed next actions.
Input migration, prospective ladder thresholds and Guardians scope remain
separate decisions. No next beta date or version is assigned.

## Evidence and Sources

- ACTIVE_WORK.md; AGENT_WORKFLOW.md; release-manifest.json.
- reference-artifacts/analyses/persona-calibration-oct20/CAPTURE-RESCUE-KEEPER.md.
- reference-artifacts/analyses/persona-calibration-oct22/STAGE2-ASSESSMENT.md.
- reference-artifacts/analyses/persona-score-history/README.md and charts.
- tools/harness/run-gameplay.js; tools/harness/browser-check-util.js;
  tools/harness/check-documentation-freshness.js; tools/build/release-preflight-dev.js.
- .github/workflows/release-contracts.yml; package.json.
- Read-only product and execution reviews by Nash and Hypatia, October 28.
- Official OpenAI guidance, checked October 28:
  https://learn.chatgpt.com/docs/agent-configuration/subagents
  (parallel independent work, focused context, token/coordination cost).
- https://learn.chatgpt.com/docs/environments/git-worktrees
  (separate checkouts; ignored assets require explicit setup).
- https://developers.openai.com/api/docs/guides/agents-api/multi-agent
  (custom orchestration option; agents can share an environment filesystem).

The staffing, time ranges, criteria and prioritization above are project-specific
recommendations, not promises or claims supplied by those external sources.
