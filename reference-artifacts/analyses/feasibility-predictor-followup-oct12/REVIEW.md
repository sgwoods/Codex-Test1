# One observation-based interception predictor: rejected

Baseline source cf0e7a66; frozen development artifact d86e64702c5174e791409385c81901817af4e750d56a68e7a39c3eb311ff24b5. Only isolated harness/model/tests/evidence changed. No engine/gameplay, dt, ammo, damage, pose, score or cull modifications; no build/shared writes/commit/push/publication.

## Prior measurement and single policy

Before runtime testing, measured archived aligned-fire trace predictions against later alive target positions.513 uncensored paired samples: old mean horizontal error49.46px, selected history model35.27px.78 fire-enabled decision samples (not necessarily real shots):73.38 to56.63px. Original missed218173522:55.03 to29.70px across26 samples;352310587:85.60 to33.80px across11.353909248 has no uncensored sample after its successful gate-route kill. Full raw prediction pairs/horizons in prediction-measurement.json.

Each model uses its own vertical-velocity-derived arrival horizon, rounded to the nearest60Hz observation. Later killed/removed targets are censored. This is route-conditioned center-error measurement, not a shot-success/full-path/collision proof; successful trajectories are especially censored. Future saved positions are accessed by the OFFLINE measurement scripts only, never runtime controller.

One fixed model: seven past positions over at most0.1s; quadratic least-squares fit estimates present velocity/acceleration. Horizontal acceleration exponentially decays over0.15s into the lookahead. Observational derivative bounds900px/s and6000px/s^2; gaps/discontinuities reset history. Horizon remains capped0.6s with the existing vertical-arrival approximation. These are experimental estimator constants, not canonical physics or optimized thresholds. No alternate model/threshold/seed sweep.

Original ranking/pursuit coefficients, manual key transitions, engine acceleration, controlled17/17/16ms input clock and exact1/60 dt are unchanged. Previous12px aligned-fire gate is unchanged. Model uses only past/current observed poses; target IDs only associate histories, never select a hardcoded route. Family/local-u telemetry is recorded but not predictor policy input. No future engine simulation. Read-only perception remains stronger than human perception.

## Actual attempt plus fresh replay

Stage31 seed9131,25s cap; actual engine clear18.933s.36 distinct kills/40,4 misses,54 shots,0life losses,3lives retained. Rule audits pass, max retained bullets2, minimum shot gap0.100s, max rounded movement7.31px/tick; actual raw x/vx recorded. Fresh replay has zero recorded-projection differences and identical ordered shot/kill/clear/loss events. Cosmetic effect counts differ235ticks, retained/excluded; no full-runtime equivalence claim.

Replay executes the recorded key trace in a fresh context; it does not independently recompute controller decisions. Thus recorded-input reproducibility is verified, controller-decision determinism is NOT separately established. Both executed-tool.js and executed-predictor.js are archived; raw report toolHash/predictorHash independently match their exact bytes.

| Controller | Hits | Shots | Clear seconds |
| --- | --- | --- | --- |
| Approved continuous fire |37/40|80|19.533|
| Archived12px gate |37/40|53|18.217|
| One history model + same gate |36/40|54|18.933|

All target differences: versus approved, no gains and lost72239387; versus gate, no gains and lost353909248. Remaining misses218173522,72239387,352310587,353909248. Perfect feasibility remains inconclusive, never impossible.

The model on its changed runtime route has549 uncensored prediction samples with48.12px mean error. This differs from the offline513-sample gate-route dataset, so35.27 versus48.12 is not a matched-route improvement/regression metric. Offline aggregate error reduction did not translate into more actual kills. Predictor/pursuit/slot interactions still require evidence, not another immediate threshold adjustment.

## Disposition, source and checks

REJECT as controller replacement. Preserve diagnostic model/candidate/report; approved tool and tests restored exactly. Working tool SHA256 bc520d6708f68b049ed424971c384dce042b91e0ab108e7c9f1fc99c24c3dd6b.

Candidate tool SHA256 ae2e3d719deb296448e5ac0e3ae9a1e9ffccbce20399fef5b082b069e5c451c3. Predictor SHA25623f698672778b2422ef5a2a8ba40f8833a8f342d6a607111d5efd089f87154eb. Review source in private-artifacts/feasibility-pilot/predictor-followup/{candidate-tool.js,observed-interception.js,candidate-tests.js,predictor-tests.js}. Actual report/executed bytes in private-artifacts/feasibility-pilot/2026-10-12T17-09-53-696Z. Exact paths and hashes, both37/40 comparisons and raw predicted/actual samples in summary.json. Candidate-vs-gate.patch records main tool changes; standalone model source preserved separately. Archives are review sources, not standalone browser entrypoints.

Focused tests pass: known linear/quadratic derivative fits, fixed7-sample history, finite cold start, future-observation exclusion, gap/discontinuity reset, unchanged12px fire boundary, existing movement/ammo/cooldown/real-shot/forced-clear rejection. Candidate executed method/dependency bound separately. Restored audit/options tests, model tests, syntax/diff checks pass. No browser sessions remain; no optional seed/control run.
