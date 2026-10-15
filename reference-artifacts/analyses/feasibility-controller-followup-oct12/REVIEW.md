# One aligned-fire controller trial

October12,2026. Baseline source cf0e7a66; tested frozen lead development index d86e64702c5174e791409385c81901817af4e750d56a68e7a39c3eb311ff24b5. No gameplay edits, build, shared writes, commit/push/publication. One candidate, Stage31 seed9131, attempt plus fresh replay only; no optional control seed or route optimization.

## Miss diagnosis

Approved37/40 trace missed218173522,352310587,353909248. All are blue-purple-finale; recorded hp0/miss1 right-boundary removals at3.833,11.383,10.433s respectively. Center-in-viewport samples span1.783-3.6,8.367-11.133,8.683-10.2s (not continuous full-sprite visibility). These actual expiries do not prove unreachable targets.

Verified from raw trace: shot3.15 atx155.97 passes target218173522 height near3.55 but targetx260.081, horizontal error104.111px. Shot10.167 atx237.38 passes target352310587 height near10.567 but targetx176.521, error-60.859px. At10.0 target353909248 x200.156 versus shipx200.307, cooldown0, but both actual bullet slots occupy unrelated columns94.359/124.074. Thus prediction and ammunition scheduling are demonstrated controller limitations. Exact intended target selection in the old tool was not logged; occlusion attribution and physical impossibility are NOT established.

## Single general change

Kept existing greedy ranking, movement, local velocity/arrival predictor and engine rules unchanged. Only enable Space when selected predicted interception-column error is finite and within12px; no selected target means no fire. Added selected-target/cost/fire/cooldown/bullet occupancy telemetry, read-only family/local-u data. No seed-specific times/IDs in controller logic. The12px threshold is an experimental diagnostic choice, not canonical measurement. Existing single-frame velocity/clamp is still a limited curved-motion predictor.

## Real outcome

Approved baseline:37/40,80shots,clear19.533s,0losses. Candidate:37/40,53shots,clear18.217s,0losses,3lives retained. Candidate recovers353909248 with real kill9.95s but loses formerly hit72239387. New misses218173522,72239387,352310587. No net perfect-feasibility improvement.

Fresh same-artifact/seed input replay matches recorded projection and ordered shot/kill/clear/loss events exactly, zero differences. Rule audits pass: max retained bullets2, minimum shot interval0.100s, max rounded movement7.33px/tick, actual movement/velocity recorded. Cosmetic effect counts differ244ticks and are retained, excluded from projection. No full-runtime/render/audio equivalence claim.

Diagnostic telemetry:218173522 selected26ticks,352310587 selected11ticks; neither selection reaches12px fire threshold, and neither is capped during those selected ticks.353909248 selected4ticks with1 fire-enabled tick and3 capped ticks. Fire gating alone therefore does not fix remaining prediction/selection/movement timing. This is meaningful diagnostic evidence, not a perfect-route or all-level witness.

## Disposition and provenance

Do NOT replace approved controller. Retain the single candidate and its tests as diagnostic source. Approved working tool restored byte-exact to bc520d6708f68b049ed424971c384dce042b91e0ab108e7c9f1fc99c24c3dd6b; candidate archive SHA256465bc592426b7798f5d3fb1132132bd1fc9fd902c6823d1f5b64991ad5777dfb.

Candidate source for independent review: private-artifacts/feasibility-pilot/controller-followup/candidate-tool.js; focused tests candidate-tests.js there. Both were tested at their original harness paths before restoration. Review archives are not standalone browser entrypoints. Public candidate.patch and summary.json preserve exact changes, test/method hashes, measured examples and rawreport paths/hashes. Actual candidate attempt/replay: private-artifacts/feasibility-pilot/2026-10-12T16-57-08-887Z/report.json, with executed-tool.js bound by hash.

Candidate alignment boundary tests (no target/NaN/Infinity/error just outside12px suppress fire, +/-12px allow it) and existing rule audit/options cases pass. Restored approved tests, candidate syntax and final diff checks pass. No browser sessions remain. Further feasibility work requires a separately authorized prediction/selection diagnostic; do not infer physical impossibility from unchanged37/40.
