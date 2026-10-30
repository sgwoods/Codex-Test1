# Adoption Hardening: G1.2 And G2.2

October 29, 2026. Local implementation on baseline `0977fef4`.
User authorized advancing the adoption plan, not deployment or gameplay tuning.
Lead is the sole writer; Raman provides independent read-only review.

## G1.2: Honest Cleanup Evidence

The deterministic fake-process regression reproduces snapshot -> detached child
creation -> parent exit -> orphan reparenting. Before the fix it failed because
the result only said `Browser run timed out after 1ms`, despite an unobserved
fixture child remaining alive. No real orphan is launched by that fixture.

The result now records `cleanup.scope: observed-descendants`, a status of
`not-attempted`, `verified` or `incomplete`, and
`detachedDescendants: not-verifiable`. Verified applies only to observed processes.
Every timeout/interruption retains its original failure reason and explicitly
states that unobserved detached descendants cannot be verified. The isolated
runner persists the cleanup object in its receipt. It never converts a timeout
or interrupted run into success.

This implements issue259's diagnostic acceptance path, not its physical containment
gap. Snapshot supervision cannot reliably identify already-reparented detached
processes. No unrelated PID or supervisor group is targeted to hide that gap.
The existing 1,500ms inspection/cleanup budget is retained; it does not guarantee
promise settlement when a child never closes or inherited pipes remain open.
Stronger OS containment and arbitrary multi-browser capacity remain unqualified.

The readiness regression now interrupts and awaits its managed run in `finally`,
including assertion failure, before test-owned PID/filesystem teardown.
Independent review found a late child `error` could overwrite the diagnostic.
A new fake-backend regression reproduced the loss before repair; the handler
now retains timeout/interruption, uncertainty and the child failure together,
and keeps the observed cleanup status incomplete. The regression passes.

## G2.2: Compact Current State, Preserved History

`ACTIVE_WORK_HISTORY_2026-10-29.md` preserves the complete pre-compaction working
copy: 2,768 lines, 192,854 bytes, SHA-256
`cacefe06e26f7172fb987589f3c83cc4954011029ae4da863af42f17805423a2`.
This includes earlier local planning/experiment changes, not just committed HEAD.
It remains at the repository root so relative file references keep their context.

`WORK_HISTORY.md` indexes current and historical evidence; `WORK_HISTORY.json`
records immutable snapshot identity. The new active packet has a 150-line limit
and links the authoritative major/minor goals, current cycle and evidence.
Fast/docs tests check hashes, size, line count, required navigation and missing
linked files. Negative fixtures reject tampering, unindexed archives, broken
links and packet growth. These are document/artifact contracts, not proof that
every historical statement is true. Suite receipts fingerprint these inputs.

## Validation And Next Work

Final focused suite passed: 26 tooling tests, twelve claims and seven release
contract fixtures. Receipt:
`harness-artifacts/test-runs/fast-2026-10-29T20-19-39-727Z-BMDIzo/`.
Source-backed simulation passed (79 existing cases), with receipt
`harness-artifacts/test-runs/simulation-2026-10-29T20-17-28-469Z-Wbx4AX/`.
The docs suite passed after the final status update:
`harness-artifacts/test-runs/docs-2026-10-29T20-21-13-697Z-kz8yQT/`.
The final active packet is 86 lines, below its 150-line budget.
The restricted initial
process-test run could not verify cleanup; it is not accepted as a pass.
Process-table tests are rerun with approved inspection access.
The review independently checked the archive hash, counts and its indexed heading
targets. General fragment-anchor checking is not implemented by the file-link
checker. No new browser workload or gameplay distribution was required here.
Raman's final re-review found no remaining actionable finding in the focused
diff. These are local checks, not no-mistakes/hosted CI or full release preflight.
Changes remain uncommitted alongside the preserved earlier experiment packet;
no PR was opened and issue259 has not been closed remotely.

Next adoption work remains G3.2/G3.3 current-build persona/mode qualification and
G4.2 transition replay contracts, with G1.3 efficiency measurement before scaling
heavy-browser concurrency. General isolation, off-machine recovery and input
migration remain separate goals. No source runtime, score, schema or hosted lane
changes are made by this cycle. Localhost remains build1251 for human inspection.
