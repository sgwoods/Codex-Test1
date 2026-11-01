# November 1 Score-History Export

Qualification baseline: `b17c5d63`. Clean input: build1257,
`cb70121e9c5f29c483eec54f17b44e115a87c55f`; identical baseline runtime.
Both arms are derived inputs retaining original build metadata, not new release
builds. The candidate policy SHA256 is
`737862f389315c0763c2c978fe55c955e7bc4413cc3f8515f2ccb92ec683c3a5`.

## Commands

Run from the integrating checkout, only after the private panel writes its final
`results.json`. The exporter performs no browser work or source edits. It reads
the private evidence in place and writes only a new, sanitized destination.

```sh
node --test tools/harness/export-persona-current-build.test.js
node tools/harness/export-persona-current-build.js --results /absolute/main-repo/private-artifacts/expert-current-nov01/results.json --out /absolute/integrating-checkout/reference-artifacts/analyses/persona-calibration-nov01/current-build.json
node tools/harness/build-persona-score-history.js
```

The destination is write-once (`wx`). A missing final result, incomplete or
duplicate matrix, changed artifact, inconsistent outcome, pair mismatch, or
invalid cleanup receipt fails closed. A valid completed panel with a failing
score gate is exported as failed, never silently omitted or promoted.

## Verification Boundary

- Exactly 100 observations: matched seeds91001-91010, control/candidate for
  Beginner, Intermediate, Expert and Professional; reserved seeds93001-93010,
  control/candidate for Expert only. No natural lifecycle repeats are counted.
- Final-results/provenance binding, policy/scenario and archived method hashes,
  all100 session/trace/receipt/stdout hashes, receipt input/runner invariance,
  source-arm binding, terminal/censored classification and destruction counters
  are checked again before export. All24 source audio hashes are rechecked.
- Non-audio events and mechanical snapshots (visual effects excluded) must
  agree for other personas. Expert non-audio prefixes must agree before the
  first intervention; the unchanged first-pair score/stage/first-loss floor
  is reapplied. Gate summaries are recomputed from the rows.
- Public output is an allowlist: scores, outcomes, counters, censor bounds and
  hash attestations. No raw session, trace, local path, account information,
  full build metadata or private policy source is copied.
- Runner dependency hashes are retained as the qualification's attestations;
  this exporter does not execute or independently requalify those dependencies.
  Cleanup receipts cover observed descendants, not physical containment.
- The generator appends A10a-d and checks27 panels/510 observations, including
  an exact hash of the prior23 panel objects (410 observations). A9 remains.
  The current comparison switches to A10a/b. Time-limit points remain triangles
  and observed scores remain lower bounds, not eventual career scores.

Update measured README claims only after successful export and regeneration.
PNG presentation copies may be regenerated from the canonical SVG with Sharp.
No release, integration, human-actuator feasibility, audio-fidelity, or live
Watch/Rival mode-parity conclusion follows from this score panel alone.
