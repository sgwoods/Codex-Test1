# Star Swarm Lessons for Aurora and Platinum

October 28, 2026. Assessment and proposals, not implementation authorization.

## Conclusion

Star Swarm is a useful engineering comparison, especially its simulation/input boundary, data-driven content, small test command surface, and executable documentation claims. Adopt those patterns incrementally. Do not replace Aurora, merge the products, migrate orchestration platforms, or relax release gates on this evidence.

The strongest explanation supported by the repositories is architectural and procedural: Star Swarm started with a small, deterministic, content-oriented core and explicit boundaries. The repositories do not establish whether Claude or Firstmate is faster, cheaper, or more reliable than Codex. That would require comparable assignments and execution traces, including human intervention, retries, cost and accepted outcomes.

## Evidence and Verification

| Item | Verified observation |
| --- | --- |
| Star Swarm source | `cc463a0be578aee2131976b3556c633a2d5181b5`; cloned read-only for review |
| Published Star Swarm | `build.json` reports `cc463a0`, clean release, built October 24 at 17:15:42 UTC; matches main |
| Portfolio overview | Reports the same build and distinguishes Firstmate tooling from the product |
| Aurora source | `2e33ef4d4bad3465d67238e4c6825270e39ad913`; existing local documentation edits preserved |
| Aurora localhost | Port 8000, this checkout's `dist/dev`, `1.4.2.1+build.1251.sha.2e33ef4d`; serving process checked |
| Star Swarm local checks | `npm test -- --maxWorkers=2`: 2,493 tests in 87 files passed, 70.21 seconds reported; typecheck, lint and build passed |
| Toolchain limitation | Local Node 25.9.0 worked but produced a Vitest engine warning. Root engines admit it; locked Vitest admits Node 22/24/>=26. CI uses Node 24. Local success is not a supported-version guarantee |
| Hosted CI | Run [40114955074](https://github.com/sgwoods/star-swarm/actions/runs/40114955074): check, deploy and hub notification all succeeded |
| Browser inspection | Published game selector, starting play, pause and shelf rendered. This was a bounded functional/visual inspection, not full-game or audible acceptance. A console resource 404 was observed |
| Independent reviews | Two read-only specialists reviewed CI/docs contracts and simulation/content boundaries; lead verified key findings and ran the local checks |

No account or remote score writes, public comments, source changes to Star Swarm, or deployment occurred. The full Playwright suite was not rerun locally; its successful hosted CI run was inspected. Local dependency installation used `npm ci --ignore-scripts` in the temporary clone. No new Aurora persona distribution was measured.

Preserved evidence: `private-artifacts/star-swarm-assessment-2026-10-28/`. The selected-source archive excludes large media and has SHA-256 `ee782b0fd34da81d53e8f2f3ed261e92109e74cc1195d6285afc546817701cb8`. It retains the exact source, tests, configuration, content and documentation examined. The public overview, hosted build identity, observations and shelf screenshot are retained beside it. Review surface: `.lavish/star-swarm-comparison/index.html`.

The review surface passed isolated Chrome checks at 1440x1000 light/dark and 390x844 light: no horizontal overflow or page exceptions, screenshot loaded, and selecting a choice did not queue a prompt until submission. Screenshots and `review-qa.json` are retained with the evidence. Lavish returned HTTP 500; the local HTML remains available, but no collaborative review session or feedback monitoring was established.

## Different Product Bets

| Dimension | Star Swarm | Aurora and Platinum | Implication |
| --- | --- | --- | --- |
| Primary expansion path | Six shipped variant declarations, including overlays and a distinct Convoy rules pack; curated variations shelf | Released Aurora plus Guardians preview, shared services and release lanes | Six variants do not equal six independently complete games; compare capabilities, not counts |
| Content | Typed schemas for rules, aliens, paths, stages, sprites, synth sounds and personas | Pack and adapter registries already exist, alongside substantial game-specific runtime code | Validate existing pack data first; no rewrite needed to gain useful contracts |
| Player services | Per-variant browser-local scores and variations; accounts out of scope | Signed-in per-game persistence and shared leaderboards | Star Swarm's simplicity partly reflects a smaller service surface |
| Personas | Copied observation view, ordinary button outputs, separate pilot RNG, 32-seed capped ordering test | Accepted safety work and retained score distributions; Watch/P2/testing share automated controller behavior | Preserve Aurora's lower-tail and attainment goals while strengthening input equivalence |
| Replays | Compact seed/input logs and headless replay, with developer-only recording/rendering pages | In-game local video replays, session/event telemetry and game/build metadata | Add deterministic diagnostic replay; do not remove player-facing video |
| Documentation | Vision/state/roadmap/ideas layers and selected claim assertions | Rich provenance, release documents, visual/PDF gates and long accumulated work packets | Combine semantic assertions with Aurora's artifact identity and visual checks |
| Publishing | Passing main pushes publish directly to one site | Local -> dev -> explicitly approved beta -> production | Keep Aurora's authorized lanes; automatic production delivery is not a transferable default |

Sources: [architecture](https://github.com/sgwoods/star-swarm/blob/cc463a0be578aee2131976b3556c633a2d5181b5/docs/ARCHITECTURE.md), [roadmap](https://github.com/sgwoods/star-swarm/blob/cc463a0be578aee2131976b3556c633a2d5181b5/docs/ROADMAP.md), Aurora `README.md`, `AGENT_WORKFLOW.md`, `src/js/02-replay-telemetry.js` and `src/js/13-gameplay-adapter-registry.js`.

## Highest Value Lessons

### 1. A small test interface over the existing evidence

Star Swarm exposes unit, simulation, browser, content-validation, typecheck and lint commands. Aurora has 414 `harness:` scripts among 479 npm scripts, while `npm test` still intentionally exits with "no test specified". This is a discoverability and selection problem, not proof of insufficient coverage.

Add a few documented entry points that select existing tests by purpose: fast contracts, simulation, browser and full release. Do not run every expensive scenario on every edit or replace specialized fidelity checks. Each run must name its source/bundle, method, seeds, outputs and terminal status; workers get immutable inputs and isolated outputs, and one lead aggregates canonical evidence.

This is the most useful immediate process improvement for parallel agents: a worker can know what it must prove without rediscovering hundreds of commands. Measure elapsed time, collisions, flakes and lead review effort across comparable packets before claiming a speedup.

### 2. Documentation claims that fail when they become false

Star Swarm's `docs-accuracy` suite checks recognized paths, anchors, commands, derived counts and declared absences. It also deliberately feeds bad examples to the checker. An absent-feature claim can fail as soon as the relevant implementation appears. This directly addresses Aurora's earlier stale TODO and documentation drift problems.

Start with a handful of high-value current-state claims and negative tests. Retain Aurora's source/artifact hashes, release-note checks and rendered PDF/diagram inspection. A claim parser cannot establish arbitrary prose truth: Star Swarm itself overstates its exact-artifact browser coverage, despite passing these tests.

Separate current state from historical work and proposed direction. Aurora's `ACTIVE_WORK.md` spanned 2,592 lines before this assessment packet; archive closed packets behind an index rather than expanding the required startup read indefinitely. Star Swarm is not immune to growth either: its architecture document is 2,344 lines and agent instructions 668. Prefer modular reading, not a single giant replacement document.

Sources: [documentation tests](https://github.com/sgwoods/star-swarm/blob/cc463a0be578aee2131976b3556c633a2d5181b5/tests/unit/docs-accuracy.test.ts#L56), [claim parser](https://github.com/sgwoods/star-swarm/blob/cc463a0be578aee2131976b3556c633a2d5181b5/tests/unit/helpers/docs.ts), Aurora `tools/build/release-documentation-contract.js`.

### 3. Persona parity needs a common input boundary

This is the most important technical finding for the next persona cycle.

Star Swarm's autopilot receives copied observations and returns the same input bits that the keyboard supplies. Tests check nonmutation and permitted actions. Its independent pilot RNG also avoids consuming the simulation's random stream merely because a persona makes more decisions.

Aurora's `runHarnessPlayer` directly advances `p.x` using its policy multiplier. Human control instead uses acceleration, deceleration, tap precision and reversal windows. Watch/P2/test agreement therefore does not establish human-control equivalence. This is a boundary difference, not evidence that accepted Professional results are fabricated or that their shared automated-path parity has regressed.

First instrument a shadow comparison: preserve a weak Expert run, consumed timestep sequence, observations, decisions and resulting movement. Compare the automated action with movement through the ordinary control path. Do not switch the clock or actuator while tuning the persona; that would confound changes and invalidate the baseline. Any later actuator migration needs its own matched trajectories, collisions, scores, audio timing and human-feel acceptance.

Sources: [Star Swarm autopilot contract](https://github.com/sgwoods/star-swarm/blob/cc463a0be578aee2131976b3556c633a2d5181b5/src/ui/autoplay.ts#L15), Aurora `src/js/05-player-flow.js:1328` and `:1404`, `src/js/10-gameplay.js:43`, `src/js/90-harness.js:2362`.

### 4. Reproduce a failure, then inspect its first divergence

Star Swarm's headless simulation and input goldens make failures cheap to replay. Its lab previews real game content using the actual simulation and renderer; backward seeking reconstructs the same run rather than implementing a second approximate simulation.

For Aurora, start with one preserved collision and one transition through its existing adapter. Capture build, game/content/rules identity, controller version, seed/RNG state, input and timestep stream, and periodic state/event checkpoints. Display the first divergence alongside the retained reference track. Keep video as visual evidence, with a replay log as the reproducible experiment.

Do not copy Star Swarm's replay envelope literally: it lacks game/content/build identity and rank/start-state fields. Its roadmap explicitly acknowledges the multi-game gap. Its goldens compare final fingerprints; a current-code-versus-current-code intermediate comparison is not an archived intermediate oracle.

Sources: [replay envelope](https://github.com/sgwoods/star-swarm/blob/cc463a0be578aee2131976b3556c633a2d5181b5/src/engine/replay.ts#L23), [lab parity tests](https://github.com/sgwoods/star-swarm/blob/cc463a0be578aee2131976b3556c633a2d5181b5/tests/sim/lab-stages.test.ts), [lab PR 63](https://github.com/sgwoods/star-swarm/pull/63).

### 5. Data-only content tasks with explicit refusal rules

The Forge skill first asks whether the engine can express the request. It must refuse unsupported behavior rather than quietly implement something nearby, and its content-only task may not edit the engine to make the request appear supported. Successful authoring requires schema/reference checks, playability and recorded persona outcomes.

This is a good pattern for bounded Aurora skills: reference measurement, content/configuration edits and runtime repair should be distinct task types with permitted paths and acceptance evidence. Validate one existing timing/path configuration before considering a broader content forge. A feature's schema acceptance alone is insufficient: Star Swarm even documents accepted fields that currently do nothing.

Its curated shelf is an attractive later product direction: immutable shipped games, named player variants, separate scores and review before publication. For Aurora, any rule-changing mode must have distinct scoring eligibility and identity before shared leaderboards accept it. Do not expand into a content marketplace before Guardians' core loop is qualified.

Sources: [Forge procedure](https://github.com/sgwoods/star-swarm/blob/cc463a0be578aee2131976b3556c633a2d5181b5/.claude/skills/forge/SKILL.md#L35), [Forge guards](https://github.com/sgwoods/star-swarm/blob/cc463a0be578aee2131976b3556c633a2d5181b5/tests/unit/forge-guard.test.ts), [shelf PR 65](https://github.com/sgwoods/star-swarm/pull/65).

### 6. Share reference findings, not unexamined gameplay constants

Star Swarm has a useful claim/source/confidence record for arcade behavior, including unresolved questions and source disagreements. Aurora has richer retained measurement and conformance artifacts. A small cross-project evidence crosswalk could combine them: compare three high-impact claims, preserve source revisions and measurements, and record agreement, disagreement or intentional product differences.

Do not accept Star Swarm's claimed fidelity as independently established by this assessment, or silently overwrite Aurora's accepted timing/audio with its constants. Internal consistency tests establish the implementation's behavior, not agreement with original hardware. Keep asset provenance and private/public reference boundaries explicit.

Source: [arcade reference record](https://github.com/sgwoods/star-swarm/blob/cc463a0be578aee2131976b3556c633a2d5181b5/docs/reference/arcade-reference.md).

## Limits We Should Not Copy

1. **Do not equate a playability pass with fair survival.** Star Swarm's stage protocol replenishes fighters, uses 16 seeds and a three-minute limit, permits two strong-pilot stalls and requires eight mid-tier clears. It tests each stage document at its first occurrence, with stated geometry exclusions. Useful structural/liveness checks, not complete fairness or later-stage fidelity proof. Add negative fixtures to Aurora without replacing normal-life score panels. [Protocol](https://github.com/sgwoods/star-swarm/blob/cc463a0be578aee2131976b3556c633a2d5181b5/scripts/playability.ts#L109).
2. **Do not rank models from test totals or PR totals.** Star Swarm's 2,493 passing assertions are meaningful but do not measure test quality, cost, or causal model advantage. Firstmate backend scheduling, isolation, retry traces and economics were not available in the supplied repository. The sampled PRs had no GitHub review submissions; that does not exclude review elsewhere.
3. **Do not import its persona threshold unchanged.** Its 32 fixed Classic seeds test ordered means, medians and average survival over 180-second capped runs. The sample size was selected after a smaller panel failed ordering. Keep independent reserved seeds, per-run terminal status and Aurora's explicit 75k/150k/200k attainment goals. Scores across these games are not directly comparable. [Persona test](https://github.com/sgwoods/star-swarm/blob/cc463a0be578aee2131976b3556c633a2d5181b5/tests/sim/autoplay-personas.test.ts#L26).
4. **Do not remove release gates to imitate delivery speed.** Star Swarm publishes every green main push. Aurora's production accounts, frozen beta, protected public assets and accepted gameplay require explicit lanes. Retain packaged-artifact and hosted validation.

## Feedback Worth Returning to Star Swarm

These are findings for a later authorized handoff, not edits or issues posted by this cycle.

| Finding | Evidence and focused repair |
| --- | --- |
| Browser tests mostly exercise dev, not the uploaded build | CI builds `dist`, but Playwright starts Vite dev and its identity test expects dev. Add a separate smoke against existing `dist`, verify release identity/subpath assets, upload the unchanged artifact; narrow documentation wording meanwhile |
| Multiple keys for one action can release it too early | Reproduced with the real keyboard adapter: press ArrowLeft and A, sample, release A while ArrowLeft remains held; left becomes false. Track physical keys or per-action reference counts, then test both release orders |
| Replay parser is not a complete import validator | Reproduced acceptance of run lengths -1 and +1 with total 0. Add integer/nonnegative limits, action-mask and total-size validation before broader replay exchange; extend versioned game/content identity separately |
| Declared Node support exceeds locked dependency support | Node 25 is admitted by root engines but excluded by locked Vitest; align the declaration/docs or test a supported runtime matrix |

Sources: [CI](https://github.com/sgwoods/star-swarm/blob/cc463a0be578aee2131976b3556c633a2d5181b5/.github/workflows/ci.yml#L80), [Playwright configuration](https://github.com/sgwoods/star-swarm/blob/cc463a0be578aee2131976b3556c633a2d5181b5/playwright.config.ts#L23), [keyboard adapter](https://github.com/sgwoods/star-swarm/blob/cc463a0be578aee2131976b3556c633a2d5181b5/src/engine/input.ts#L155), [replay validation](https://github.com/sgwoods/star-swarm/blob/cc463a0be578aee2131976b3556c633a2d5181b5/src/engine/replay.ts#L175), locked package metadata in the source archive.

## Effect on the Aurora Plan

Keep the Aurora-quality-first recommendation, but make its first packet more concrete:

| Proposed order | Deliverable and acceptance | Estimated effort, not a commitment |
| --- | --- | --- |
| 1. Test/document contracts | A short test map, a small executable-claim suite with deliberately failing fixtures, immutable-run identity/output contract; no gameplay changes | 1-2 focused working days |
| 2. Expert diagnosis and control-parity probe | One weak run replayed with checkpoints, measured automated-versus-normal-control divergence, explicit decision on which behavior the persona is meant to assess | 2-4 working days; deterministic gaps may enlarge scope |
| 3. One bounded Expert candidate | Matched and reserved-seed panels with terminal reasons, Watch/P2 checks and retained score-distribution graphic; no simultaneous clock/actuator rewrite | Remainder of the two-week pilot if diagnosis is tractable |
| Later | Runtime-backed visual lab, one schema-validated configuration slice, Guardians core-loop qualification and reference crosswalk | Schedule after pilot evidence, not automatically |

One lead and two specialists remain sufficient initially. Split independent hypotheses and review in parallel; isolate editing worktrees, input bundles, output paths and browser capacity. Deterministic workers handle seed shards; agents interpret evidence. Record Firstmate and Codex traces on comparable future packets if orchestration comparison is desired, with accepted outcome, elapsed time, human review/rework and cost where actually available.

No next beta date or promotion is authorized. Production remains 1.4.2; dev remains 1.4.2.1/build1251. This assessment changes recommendations and preserves evidence, not shipped behavior.
