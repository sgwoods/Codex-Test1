# Later Exit Candidate Independent Rejection

2026-10-12. REJECT integration of this candidate. Zero centered contacts does not compensate for lost demonstrated baseline shots or inherited reachable-column crossings. No new experiments, builds, source edits or release actions performed.

Retained root: /private/tmp/aurora-blue-group5-exit-oct12/private-artifacts/later-exit-oct12/.
Independently verified SHA-256:
- candidate-source.js:226b49fc631960f9f8fc6f35821bb93c5aee421659071590c2ecb3e0e9697638
- report.json:035b061204c3a938dc1ebd3010ef20417314c8f5bbadfadb2d2ff7360dc97a9d
- summary.json:8f341dc44a4907004e9d2040f6cc3b6e49c64a21adbe058dfa6f336fc45cd41e
- candidate-columns.json:5010e16779a1b7de015265f4500bc559b059b9e4bea18d1f14a503aeaa63f74c

Report baseline bundle9c320d50301a46f93f8f27bcc2f28af412b88043ba00e411f4a329c8585ef4fa; candidate d57a44f591667ccc85dd27ecd6a0164c61f8da7da1e42a94bf7a17be4f148e85. Source baseline/restored1b442dfae869fe3f8a7cc39edaaa2d05860b3a7cdf33c5e796ebae13167ce532. Method00439e1ba527df16f5bb46402e09c30c4f7d3c75cc686a26e273565ea7f89923; dependency7d2ed679da11bf1c4c669a1f18a00bffdd0f71f66cb22bc0422af710fa6a2db2. Working source was restored when earlier inspected; retained candidate, not working06, is the review target.

## Source Scope

Lines651-668 select generic stage>=35 blue-purple-finale/green-ladder-split, cache final composed pre9.7 pose, then continue with nearest-side +/-100 and rise-100, easing0.08. Motion-spec/reference precedence is protected by genericChallengePath. The finite-span fallback avoids division by zero but resets tangent on repeated pre-exit clock; no all-clock continuity claim. Nearest-side policy and rise rate are novel provisional behavior, not later-stage canonical reference. stage>=35 extends indefinitely; tests at35/39/63/127 are samples, not all later levels. Pre-exit paths remain intact, including inherited green/yellow risk.

## Independently Confirmed Regression

Parsed baseline/candidate enemy_killed event sets directly, rather than trusting summary lost arrays. Recorded input traces ({frame,keys}) are byte-equivalent within each paired run.

- Stage35:33->32 kills, no gained IDs; lost709952769, baseline killed7.517s. Retained candidate last state shows hp0/miss1 atx-56.25,y34.69: departure removed the target rather than preserving this demonstrated shot outcome.
- Stage39:37->35 kills, no gained IDs; lost674838603 (baseline7.367s) and401784013 (baseline8.383s). Retained candidate last states hp0/miss1 atx336.53,y86.13 andx336.48,y250.59. These lost witnesses justify rejection without claiming the targets are impossible under different keys.

Method tools/harness/check-later-exit-trial.js obtains one general baseline controller trace and candidate replay of those exact keys, using replay-blue-group5-pilot-lib.js. Dependency freezes performance.now/keyHeldMs and steps17/17/16ms plus1/60 game ticks, dispatching ordinary Arrow/Space events. This controls physical-input timing, not human perception/reactability. No future-trace policy input is used during baseline controller selection; candidate receives recorded input only.

Important limit: replay length equals baseline recorded length and stops when that trace ends, not necessarily candidate clear. Stage39 candidate clear=null therefore is NOT a timeout/hang or natural-completion failure. Candidate shots48 versus baseline50 likewise partly reflect changed occupancy/cooldown and bounded duration, not necessarily malformed keys. Removed hp0/miss1 lost targets and direct killed-ID comparison remain sufficient demonstrated-outcome regression. No candidate/baseline full-state equality is claimed; they intentionally diverge. Audits report no input-rule errors, but that is not preservation acceptance.

## Geometry And Remaining Risk

Summary records zero center contacts at35/39/63/127,40/40 full entry and approximately4.433s clear-relative cadence. Max scoped joins3.94/3.75/4.33/4.26px; maximum full-view reductions1.417/1.367/1.317/1.150s. None proves late shootability. Green retains0.1833s pre-exit and0.1333s post-exit vertical row exposure for two targets per tested later stage. Candidate-column report retains green/yellow middle contacts (left counts2/right1 at35/39); Stage31left3/right1 unchanged. Stage35 candidate actual leftx53.10 differs from baseline52.17, so do not assert exact spatial matching there; right256.73 and Stage39left52.17 remain recorded. Controlled wallclock column method is not deterministic exact replay.

Prior Stage31 accepted zero contacts remains CENTER-only. This candidate cannot close beta contact acceptance while preserving those reachable middle crossings. No rendered pixel-mask or exact original-fidelity acceptance is asserted here.

## Recommendation

Keep restored baseline; preserve rejected trial evidence. Stop blind departure endpoint/rate sweeps as a beta closure strategy. Lead/product must choose explicit scoped nonlethal-contact waiver or authorize a measured middle-phase repair: green risk begins before9.5645 and yellow much earlier around5.82725. Establish exact first-risk intervals, original group route/body relationship and relevant normal-input shooting witnesses before one small family/phase candidate. Relax pre9.7 invariance only in the explicitly authorized repair interval, retain entry/other paths and all demonstrated baseline kills. Use same-key shot preservation plus remaining center/column/row-risk reports; do not require or infer perfect feasibility. The current no-fire gain is useful diagnostic evidence, not an accepted gameplay fix.
