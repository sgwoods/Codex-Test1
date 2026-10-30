# Aurora and Platinum Project Plan

Created October 28, 2026; priority and goal hierarchy updated October 29.
Plan of record from Aurora Project Lead. The user has directed that adopting
Star Swarm lessons, not progressing toward another beta, is the current focus.
Original implementation baseline: 3c7d2667; build-details PR #256 merged at e80af082 (submission 65883aad).
Current integrated baseline: 0977fef4 (PR258). The Expert experiment and its
documentation remain local follow-through, not an integrated runtime change.
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
| G1. Small, trustworthy tests and effective parallel execution | Agents can select checks, isolate work and demonstrate useful delivery efficiency | Foundations integrated; hardening and efficiency measurement pending | P2, agent operating model |
| G2. Executable documentation and compact project memory | Current claims fail visibly when stale; current priorities are distinct from history | Twelve claims integrated; compact packet and checked archive/index implemented locally | P2, P4 |
| G3. Explicit persona/input contracts and credible capabilities | Testing, Watch and Rival share defined behavior; human-control differences and skill limits remain explicit | Boundary measured; one historical candidate qualified, not integrated | P1 |
| G4. Reproducible failures and first-divergence diagnostics | Replay real runtime behavior with sufficient identity and checkpoints to explain failures | One collision reproduced and audited; reusable replay contract incomplete | P1, P2 |
| G5. Bounded data-only content authoring | Agents change supported content safely and refuse unsupported behavior | Queued; existing pack/adapter contracts are the starting point | P3, P2 |
| G6. Shared reference evidence with provenance | Cross-project findings improve measured fidelity without importing unverified constants | Source comparison retained; claim crosswalk and recovery test pending | P4, reference/conformance workflow |

### G1: Trustworthy Tests And Parallel Execution

| Minor goal | Status and next action | Acceptance evidence |
| --- | --- | --- |
| G1.1 Focused test entry points | Complete for the initial scope in PR258; extend coverage only as needed | Test map, fast/docs/sim/browser commands, negative fixtures and retained CI receipts |
| G1.2 Safe worker lifecycle and isolation | Partial: issue #259 diagnostic/teardown path merged in PR260 October30; broader worker-path qualification remains | Deterministic race and late-error regressions, persisted scoped cleanup results, unconditional readiness teardown; unobserved detached descendants remain unverifiable, not physically contained |
| G1.3 Measured agent/harness efficiency | Planned: benchmark one versus two heavy workers only after G1.2; retain one lead and up to two specialists | Three comparable packets with elapsed critical path, lead review, retries, flakes and output collisions; the proposed 20% target is not an observed gain |
| G1.4 Evidence validity and reviewed integration | Planned: integrate accepted adoption changes through review/CI; design dependency-based validity separately | Fail-closed runtime/method/fixture/asset-change tests before replacing any current freshness gate; integration does not authorize publication |

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
| G3.2 Qualify the narrow Expert safety candidate | Current-source matched/reserved gates pass October30; private candidate not integrated | Frozen criteria, all per-run outcomes and hashes; preserve the regressing seed and three censored results; no concurrent actuator/clock change |
| G3.3 Full-persona and real-mode nonregression | 100-run matrix passes; clock repair passes original and enhanced browser matrices plus synthetic Stage6 veto | Clean rebuild and natural late-stage qualification; no full browser-equivalence or common human boundary claim |
| G3.4 Decide input migration and skill-ladder scope | Decision pending after G3.1-G3.3; keep migration separate from policy tuning | Approved capability criteria and any migration's matched movement/collision/score/audio/human-feel acceptance; Wizard remains a later unranked stress-test option |

### G4: Reproducible Failures And Diagnostics

| Minor goal | Status and next action | Acceptance evidence |
| --- | --- | --- |
| G4.1 Explain one preserved collision | Complete for the retained Expert failure and documented telemetry projection | Archived control equality, unrounded trace, independently replayed decisions and first-divergence evidence; not full-state/audio determinism |
| G4.2 Generalize the diagnostic replay contract | Planned: cover one transition as well as the collision; identify missing restart state | Versioned build/game/content/rules/controller identity, seed/RNG, inputs/timesteps and archived checkpoints; malformed or mismatched inputs rejected |
| G4.3 Runtime-backed first-divergence inspection | Deferred until G4.2 is demonstrated | Reconstruct with the actual adapter/runtime, compare against archived checkpoints and retain visual video evidence; no second approximate simulation |

### G5: Bounded Content Authoring

| Minor goal | Status and next action | Acceptance evidence |
| --- | --- | --- |
| G5.1 Explicit task boundaries and refusal rules | Planned: distinguish reference analysis, content/config edits and runtime repair | Permitted paths, supported capability checks and unsupported-request fixtures; a content task cannot silently change the engine |
| G5.2 Validate one existing configuration slice | Planned after G5.1: choose a timing/path configuration already supported by Aurora | Schema/reference checks, runtime effect and playability evidence; reject accepted-but-ignored fields rather than treating schema success as completion |
| G5.3 Prove the contracts with Guardians' core loop | Queued: define the bounded stage/lifecycle slice with the human before expanding features | Start/handoff/loss/restart, controls/audio, per-game scores and replay isolation; personas use Guardians' own score scale; preview status retained until accepted |

Named player variants remain a later option, not a current marketplace goal.
Any rule-changing variant needs distinct identity and scoring eligibility first.

### G6: Reference Evidence And Recovery

| Minor goal | Status and next action | Acceptance evidence |
| --- | --- | --- |
| G6.1 Cross-project reference crosswalk | Planned: compare three high-impact arcade claims from the preserved assessment sources | Source revision, artifact/measurement, confidence and agreement/disagreement or intentional product difference for each claim |
| G6.2 Measurement-led fidelity and defect work | Ongoing method; next select a reproduced high-impact issue, including game-over audio #247 if still current | Saved clip/cue timeline, waveform/contact-sheet or timing analysis before tuning; preserve full canonical phrases when feasible |
| G6.3 Recoverable private evidence | Local persistence verified; off-machine restore still pending | Approved destination/access, restored artifact hashes and a repeatable recovery receipt; no account identifiers or licensed private media in public artifacts |

## Current Recommended Order

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
| Infrastructure | Focused npm test/docs/sim/browser entry points, executable claims and copied-bundle runner merged in PR258 after hosted CI; existing PDF/diagram/release gates retained | Legacy harnesses are not automatically isolated; no measured speedup or general multi-browser capacity claim; detached startup cleanup hardening queued in issue259 |

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
Hosted CI acceptance passed; measured pilot-efficiency outcomes remain pending.

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

One heavy browser workload initially; benchmark one versus two before increasing
concurrency. Preserve responsive localhost for human play. Agent concurrency
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
