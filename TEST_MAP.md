# Development Test Map

This is the small entry point over Aurora's existing specialized harnesses.
It does not replace [release gates](TESTING_AND_RELEASE_GATES.md), fidelity
measurements, normal-life persona panels, or human acceptance.

## Start Here

| Command | Scope | Side effects and limitations |
| --- | --- | --- |
| `npm test` | Documentation/runner regressions and the seven existing release-contract fixture checks | Node built-ins plus POSIX process inspection for cleanup tests. No build, browser, accounts or deployment. Not full release acceptance. |
| `npm run test:docs` | Executable claims, work-history integrity/navigation and negative fixtures | Checks explicit facts and artifact contracts, not arbitrary prose truth or rendered readability. |
| `npm run test:sim` | Controlled-motion clock regressions and actual-source Aurora/Guardians controller parity fixtures | Watch/P2/test policy and action parity, not full careers, human-physics equivalence, or skill attainment. Guardians P2 remains unsupported. |
| `npm run test:browser -- --bundle /absolute/private/build` | Ten-second seeded offline harness smoke over a copied existing bundle | Requires repo-managed Chromium and a private build exposing the harness. No automatic rebuild. Public hosted bundles intentionally lack this API. |
| `npm run harness:check:release-contracts:ci` | Existing focused release-contract checks | Still available individually; included by `npm test`. |
| `npm run release:preflight:dev` | Full existing dev preflight | May rebuild and refresh tracked evidence. Lead-only; do not put it in parallel workers. It does not publish. |

Use the existing targeted `harness:check:*` commands when a change affects their
subsystem. The small simulation suite is intentionally not every simulation in
the repository. Browser prerequisites and macOS sandbox requirements remain in
`TESTING_AND_RELEASE_GATES.md`; do not substitute a different Playwright runtime.

On restricted macOS sessions, the process-cleanup regressions require approved
`ps` access. Inspection denial is an explicit test failure, not evidence that
processes were cleaned up. Windows skips these POSIX tests and the browser
supervisor refuses to launch; a green Windows fast run is not cleanup acceptance.

## Isolated Experiments

An existing scenario can be replayed without editing it:

```sh
npm run test:browser -- --bundle /absolute/private/build --scenario /absolute/scenario.json --persona expert --seed 91001
```

Optional `--out-base /absolute/evidence-parent` selects the parent; every run
still reserves a new unique directory. `--timeout-ms` defaults to 180000 and is
bounded at one hour. Browser-worker supervision currently supports macOS/Linux;
Windows fails explicitly before launching a worker. A timeout terminates the
worker and its observed descendants, including separately grouped browser
processes, refreshing discovery during shutdown and verifying termination.
Inspection/cleanup failures remain explicit failed receipts. Every timeout or
interruption also reports that unobserved detached descendants cannot be verified:
a benign worker can detach a child between snapshots and exit before discovery.
Receipts retain `cleanup.scope: observed-descendants`, its `status`
(`not-attempted`, `verified`, `incomplete`) and
`detachedDescendants: not-verifiable`. Verified means only the observed set;
timeout/interruption still fails. The 1,500ms budget bounds inspection/cleanup
attempts, not settlement if child close or inherited pipes never complete.
This supervises trusted workers, not OS containment.
The wrapper always disables video, enables deterministic
replay, and blocks requests outside its local server. It does not use an existing
signed-in browser. Use another approved harness for real-time/video/audio work.

The wrapper fingerprints every bundle file, copies the bundle and scenario,
checks copy/source hashes, runs `run-gameplay.js` against the copy, then checks
input and runner-method hashes again. Symlinks and overlapping input/output
roots are rejected. A mutation or unsuccessful child is a failed receipt, not a
repair or a pass. This detects observed changes; it is not an OS security sandbox
or a proof against transient change-and-restore by another process.

Receipts and logs live under `harness-artifacts/isolated-runs/`. Existing harness
`latest` files stay inside that run's private `results/` folder. Only the lead
promotes accepted evidence to canonical reference artifacts. Keep the source
bundle fixed while copying/running; separate worktrees alone do not isolate
browser ports, shared build directories or output paths.

Fast/docs/simulation receipts live under `harness-artifacts/test-runs/`, with
source identity, input hashes, elapsed times, exit/signal status and per-command
logs. They stop after the first failure. A killed parent may leave an unfinished
receipt with `ok: false`; never count it as completed. Test inputs must remain
unchanged for a passing receipt. CI retains these receipts without deploy rights.

Fast/docs also validate [work-history integrity](WORK_HISTORY.json): immutable
archive hashes/bytes/lines, indexed navigation, existing linked files and the
150-line active-packet limit. Negative fixtures exercise each failure class.
These document contracts supplement the twelve executable claims; they do not
validate every historical statement. Archive and current-packet inputs are
included in suite fingerprints so concurrent edits cannot yield a passing receipt.

## Executable Claims

These explicit, machine-readable documentation blocks are checked by
`npm run test:docs` and `npm test`. Command claims check declared command meaning,
not that the command's implementation is correct; behavioral tests supply that
separate evidence. Path claims resolve within the repository, including symlinks.
JSON pointers bind the documented values directly to maintained configuration.
Update a claim deliberately when its underlying contract changes. Historical
reports are not scanned as current-state claims.

```aurora-claims
[
  { "id": "default-fast-tests", "kind": "command", "name": "test", "equals": "node tools/testing/run-suite.js fast" },
  { "id": "docs-tests", "kind": "command", "name": "test:docs", "equals": "node tools/testing/run-suite.js docs" },
  { "id": "simulation-tests", "kind": "command", "name": "test:sim", "equals": "node tools/testing/run-suite.js simulation" },
  { "id": "isolated-browser-tests", "kind": "command", "name": "test:browser", "equals": "node tools/testing/isolated-gameplay.js" },
  { "id": "preflight-entry", "kind": "command", "name": "release:preflight:dev", "equals": "node tools/build/release-preflight-dev.js" },
  { "id": "release-gates-doc", "kind": "file", "file": "TESTING_AND_RELEASE_GATES.md" },
  { "id": "agent-workflow-doc", "kind": "file", "file": "AGENT_WORKFLOW.md" },
  { "id": "distribution-evidence-index", "kind": "file", "file": "reference-artifacts/analyses/persona-score-history/README.md" },
  { "id": "registered-game-count", "kind": "json-length", "file": "release-manifest.json", "pointer": "/applications", "equals": 2 },
  { "id": "aurora-game-identity", "kind": "json-value", "file": "release-manifest.json", "pointer": "/applications/0/gameKey", "equals": "aurora-galactica" },
  { "id": "guardians-preview-identity", "kind": "json-value", "file": "release-manifest.json", "pointer": "/applications/1/gameKey", "equals": "galaxy-guardians-preview" },
  { "id": "guardians-preview-posture", "kind": "json-value", "file": "release-manifest.json", "pointer": "/applications/1/launchPolicy", "equals": "production-preview-playable" }
]
```

Current registered applications: two, Aurora Galactica and Galaxy Guardians
preview. Shared player services and production availability do not make Guardians
a fully qualified v1 or establish Aurora's human/automated actuator equivalence.
