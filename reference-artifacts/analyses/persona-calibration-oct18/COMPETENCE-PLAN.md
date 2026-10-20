# Persona Diagnosis And Competence Plan

2026-10-18. Baseline02166971 plus retained local repairs. Diagnosis only in this
packet; no new gameplay tuning, commit, push, build replacement or publication.
Beta remains held. User requests Guardians diagnosis before further calibration,
and materially stronger personas, with a possible Wizard diagnostic tier.

## Guardians Diagnosis

Instrumented40VM replays use the actual adapter and runtime, seeds72001-72010,
Stage1,three ships,900seconds,maxPlayableStage99. All40match the preceding real
browser runs in stage, score, terminal outcome and simulation time within.02s.
Metrics below are frame-weighted percentages of actionable time; overlapping
categories are not additive. Long-lived stalled runs contribute more time.

| Persona | Stationary | Target below player | Target offscreen | Longest scoreless interval |
| --- | ---: | ---: | ---: | ---: |
| Beginner | 19.87% | 21.33% | 15.84% | 32.47s |
| Intermediate | 13.52% | 22.75% | 13.87% | 34.08s |
| Expert | 92.66% | 31.39% | 39.02% | 699.60s |
| Professional | 8.56% | 23.79% | 15.51% | 69.85s |

Expert's safe-lane branch holds while misaligned with its target90.70%of
actionable time;87.00%has neither a locally detected urgent shot nor dive.
This does not establish that every alternate movement is collision-free.
It does establish that the safety override dominates pursuit.

Controlled fixture:playerx100,y335,formation targetx150,y90,distant shotx250,y200.
The actual Expert controller emits stay/no-fire. Removing only the distant shot
restores rightward pursuit. The safe-lane candidate step34 yields at most
34*.006+.15=.354 target/idle cost improvement, below the.45 stay threshold when
both candidate lanes have zero hazard cost. A remote hazard therefore activates
a safety branch which suppresses useful movement. This is a reproduced causal
rule defect, not merely a correlation with low scores.

Other confirmed structural issues:
- Target selection filters only hp>0. Height and dive bonuses can favor targets
  below the upward-firing player or outside the horizontal firing area. The
  observed percentages quantify selection, not necessarily wasted shots.
- Intermediate Stage1silently substitutes Expert movement/aim settings plus
  Professional target/cadence settings. Its label does not describe one stable
  skill configuration. This is not proof that removing the override alone helps.
- Declared moveMul values are not consumed by Guardians input/runtime. All
  personas use left/right/fire and the same runtime playerSpeed. Keep equal legal
  movement capability; distinguish skill through decision quality, not by
  implementing hidden speed advantages to match an unused field.
- Professional's urgent-threat firing veto occurs on only.63%of actionable
  frames where aligned and shot-ready; it is not supported as the dominant
  explanation of poor performance. Intermediate's equivalent count is.25%.
- Nearest-threat movement is reactive; stronger target/dive priority is not a
  substitute for a safe route to the target. The ranking reversal has multiple
  contributing mechanisms; only the Expert hold defect is isolated causally.

Previous target filtering, risk-free fallback and deadband-only experiments
were rejected for survival/progression tradeoffs. Do not repeat them as an
unmeasured universal fix. No such experimental change is retained here.

## More Effective Repair Strategy

1. Guardians:separate hazard cost from shooting opportunity. Evaluate legal
   left/stay/right movement over a short horizon. Prefer a safe useful firing
   lane instead of treating any distant hazard as a reason to stay. Use observed
   positions/velocities and body bounds, not hidden future state. Add regression
   cases for distant hazards, blocked escape, edge movement and reachable shots.
2. Keep the first candidate narrow:Expert's safety/pursuit arbitration only.
   Preserve runtime physics, enemy timing, scoring, lives, and other personas.
   Compare the current diagnostic panel; reject improvements bought by broad
   survival regressions. Review prior-to-loss traces, not aggregate score alone.
3. After that keeper, consolidate Intermediate's hidden override and reachable
   target selection in separate measured changes. Preserve one game-owned policy
   per persona shared by Watch and harness; Guardians P2 remains unsupported.
4. Aurora in a separate bounded change:classify Stage4-6collision decisions,
   then test short-horizon safety arbitration for Professional. Of the latest
   panel's destruction events, Expert has36collisions; Professional has34collisions
   and2bullet losses. Preserve pursuit when no imminent hazard exists. Do not
   combine this with capture policy, firing, or actuator replacement initially.
5. Improve interception, shot-slot use, target persistence and rescue planning
   only after traces show which limits competence next. Avoid tuning dozens of
   weights simultaneously. Every candidate gets a predicted behavioral effect,
   a regression fixture, and a bounded measured comparison.

Parallel work may inspect separate games or prepare fixtures. Concurrent source
writers need isolated worktrees. The lead integrates one accepted change at a
time. This packet contains diagnosis and a plan, not an accepted new controller.

## Score Targets

Interpret the user's75k-100k Expert and150k+Professional with200k+upside as Aurora
targets pending scope confirmation. Guardians has a separate scoring economy;
do not copy Aurora point thresholds into it without a product decision.

Operational criteria accepted by the user after this plan, not yet demonstrated:
- Expert:at least8/10fresh runs reach75k;100k is a normal higher result, not a cap.
- Professional:at least8/10fresh runs reach150k, with repeated200k+results rather
  than one selected best seed. Report median, lower tail, threshold counts,
  stage distribution, captures, rescues and all time-limited runs.
- StartStage1withthree ships and normal extends. Freeze scoring, difficulty,
  observation permissions and a common run horizon before calibration. A900s
  horizon may be retained for comparison; timeouts must be reported as censored,
  not eventual ceilings. Extend the horizon equally only in a separate declared
  evaluation if duration itself limits measured high scores.
- Ten runs are a first candidate gate, not a precise success-rate estimate.
  Follow accepted candidates with a larger fresh-seed panel and real-time browser
  checks. Seeds72001-72010are now diagnostic, not future held-out validation.

These targets are outcomes for better pilot decisions, never permission to
inflate scores, add invulnerability, alter enemies or award synthetic lives.
Existing mode-parity, human P1, automated P2 ownership, challenge, capture/rescue,
and release checks remain required. The existing short-window Professional
score gate remains failed; these targets do not silently supersede it.

## Wizard Proposal

Wizard is a potential development-only test pilot, not a claim of perfection or
world-record ability. Build it on the same decision pipeline with a longer
planning horizon and smaller reaction/aim errors. Keep game-specific physics
and observation adapters; do not merge game rules merely to share a policy API.

Before calling it a human-feasibility witness, route its actions through the
same legal actuator as a human. Aurora currently moves the automated player
directly while human movement integrates velocity. Shared Watch/harness/P2
policy equality does not resolve that difference. Treat actuator migration as
its own tested change rather than bundling it into the first safety repair.

Wizard must obey movement, shot capacity, cooldown, collisions and life rules.
No reading future RNG/spawns, changing seeds after observing results, or modifying
game state. Use explicit development labels and exclude automated results from
human leaderboards. Separate it from the Professional acceptance criteria.
Its eventual benchmark is a reproducible score/survival distribution under
declared rules. 'World-record level' requires a separate validated benchmark;
it is an aspiration, not a current specification or achievement.

## Provenance

Primary packet:private-artifacts/persona-diagnosis-oct18/.
trace.js:reproducible40-run instrumentation. Per-persona/seed JSON files retain
10-second samples and3-second pre-life-loss traces. summary.json contains counts,
source hashes, method hash and browser parity results. fixtures.js/fixtures.json
contain the actual-controller causal test. Copies of summary and fixture results
are persisted beside this report as guardians-diagnosis.json and
guardians-hold-fixture.json. No online-reference or world-record claim was made.
Independent read-only Aurora assessment informed the bounded safety-first plan.
