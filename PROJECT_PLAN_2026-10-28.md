# Aurora and Platinum Project Plan

October 28, 2026. Discussion draft from Aurora Project Lead.
Implementation baseline: 3c7d2667; build-details PR #256 merged at e80af082 (submission 65883aad).
Supersedes October 4 planning priorities, not preserved experimental results.

## Recommendation

Keep production 1.4.2 stable. Accumulate a player-facing Aurora quality batch
on `/dev`, supported by a small, measurable harness-efficiency pilot. Prioritize
Expert consistency and reliable Watch/Rival/test equivalence. In parallel,
define a bounded Galaxy Guardians completion milestone, but do not start a
third game or platform rewrite. Use outcome-based milestones before assigning
the next release number. No beta progression is authorized for this cycle.

The strategic goal remains one Platinum host with multiple credible arcade
games. A faster process is useful only if it delivers better play, dependable
records and evidence that humans can inspect.

## Verified Position

| Area | Position | Remaining uncertainty |
| --- | --- | --- |
| Production | 1.4.2/build1218/ea779a76 shipped October 26; hosted smoke and documentation checks passed | This plan is not a new full production audit |
| Accounts and scores | Per-game signed-in storage shipped; human confirmed reload/new-tab persistence | Account-linked does not mean cheat-proof or replay-validated |
| Build details | PR #256 integrated after review, tests and CI; dev delivery underway | Hosted acceptance remains required; no beta promotion |
| Aurora personas | October 20 integrated panel: Beginner median 7,235; Intermediate 21,995; Expert 81,275; Professional 240,785 | Ten seeds each, 900-second cap; Expert only 6/10 at 75k; not final career distributions |
| Professional | Across three distinct repaired panels, 30/30 reached 150k and 28/30 reached 200k | All survived the time cap; no population or world-record guarantee |
| Fidelity | Accepted safety, capture/rescue and transition improvements | Exact original-game fidelity, all-level perfect feasibility and human actuator equivalence not established |
| Guardians | Playable preview with persistent game-specific scores | Not accepted v1; its score scale and incomplete persona evidence cannot be treated as Aurora's ladder |
| Infrastructure | Release-contract CI, local browser tests, PDF/diagram and documentation gates exist | No general meaningful npm test entrypoint; over 400 named harness scripts need a navigable test map |

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

Allocations are planning choices, not measured resource consumption. Choose A
for a two-week pilot, then compare accepted player improvements and elapsed
delivery cost. Do not commit the whole project to an infrastructure rewrite.

## Proposed Sequence and Timelines

Dates assume a start October 29, one lead and up to two specialists, regular
review availability, one workstation and existing account/reference access.
Ranges are planning estimates, not unattended work commitments or release dates.
A cycle is one bounded diagnosis/change/validation packet, not a fixed day.

| Window | Work and dependencies | Exit decision |
| --- | --- | --- |
| Current cycle | Integrate build details, pass gates, deploy and verify dev only | Exact hosted identity and panel behavior; production/beta unchanged |
| Days 1-3, Oct 29-Nov 2 | Map tests by subsystem; archive reproducible input probe; freeze Expert baseline and identify lower-tail failures; verify private reference recovery | One reproducible failure mechanism and one safe parallel test pilot |
| Days 4-10, Nov 3-11 | One Expert candidate at a time; matched and fresh-seed panels; shared-controller Watch/P2 checks; fix highest-value reproduced player bug | Accepted quality gain or recorded rejection; inspect dev batch with human |
| Weeks 3-4, Nov 12-25 | If A succeeds, qualify one Guardians normal-play loop and its own persona baseline; scope replay/feedback improvements | Keep preview or accept a named capability milestone, not automatic v1 |
| Weeks 5-8, Nov 26-Dec 23 | Choose deeper Aurora levels/fidelity versus Guardians depth, using pilot evidence | Scope next product milestone; third game only after two-game contracts prove reusable |

The next beta is explicitly paused. Revisit it only when the human chooses a
coherent batch with a substantial player outcome, not because a date arrives
or a count of small features has accumulated. A serious safety/security fix
can justify a separate urgent release decision.

## Next Work Packets

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

Create a small feature-to-test map, not a replacement for 400 scripts at once.
Offer executable smoke/unit, browser-package, persona and release tiers.
Require negative cases as well as happy paths. Extend PR CI only with portable,
bounded, proven tests; retain Mac/audio/live-service acceptance where necessary.

Build once for a candidate and record immutable artifact hashes. Each worker
gets a unique output directory and port. Disable implicit rebuilds and canonical
latest-file writes in worker mode; the lead alone aggregates accepted outputs.
This requires a small runner contract change with concurrency regression tests.
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

1. Adopt Path A for a two-week pilot, or prefer Guardians breadth first?
2. Approve prospective Expert consistency criteria and decide the role of
   the Stage 2 throughput diagnostic before new persona tuning.
3. Prioritize Guardians core-loop completeness before Rival, or require Rival
   in the first accepted milestone and accept a longer timeline?

Recommended first packet after dev: a short immutable-runner/test-map pilot
alongside read-only Expert failure analysis. Then one measured Expert repair.
No next beta date or version is assigned.

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
