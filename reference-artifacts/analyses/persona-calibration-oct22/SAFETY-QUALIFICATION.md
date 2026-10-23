# Safety Qualification: Approved Separation

October 22, 2026. User decision: "Approve as recommended. Consider we separate
as also mentioned." This approves prospective qualification of a bounded safety
repair against the retained pilot, separately from persona ranking. It does not
approve release, weaken historical measurements, or label a failed test passed.

## Three Separate Decisions

| Track | Question | Required evidence |
| --- | --- | --- |
| Safety repair | Does this change prevent the measured failure without harming the retained pilot? | Exact fixtures, scope/lifecycle checks, matched nonregression, fresh validation, mode parity and review |
| Persona calibration | Do the tiers deliver their intended score and skill distributions? | Full-game tier distributions, survival/capture accounting and explicit remaining gaps |
| Release readiness | Is the final package ready for players? | Live account acceptance, release gates, exact-package checks and lane approval |

The old three-seed Expert comparison remains failed and visible as calibration
evidence. It no longer prevents *running safety qualification* under this
approved protocol. It is not retrospectively rewritten as a pass.

## Frozen Protocol

Candidate `0623392493c81d9670496eed71b3393947a7b2dc8e507ed70ec90fb842d2eb62`.
Retained `a27c906faec56611e3295e3cc06edff59d869de70c8cf4c5cb6f6c709c0e6dfd`.
Baseline HEAD `bacb0c58`, existing dirty local work preserved.
Protocol and both inputs were frozen before new runs at
`private-artifacts/safety-qualification-oct22/protocol.json`.

First run both policies on seeds 89001-89010, Professional Watch, Stage 1,
three ships, 900 seconds. Preserve the approved matched floors:
median >=326720; minimum >=189800; all ten >=150k; at least nine >=200k;
at most one destruction in Stages 1-2; no increase in Stage 2 destructions
against the baseline. Inspect every new destruction, not only aggregate totals.

If this fails, stop before fresh seeds or integration. Do not adjust the
thresholds after seeing results. If it passes, compare complete Stage 2 on the
known 93001-93010 diagnostic panel, then use two reserved fresh panels:
92001-92010 and 94001-94010. Frozen criteria include >=8/10 at150k on each,
no median-score or aggregate Stage2-destruction regression against paired
retained runs, and review of new losses. Those panels are not population proof.
Stage scores must remain separate from full-game score charts.

## Result

Candidate REJECTED. All 20 matched runs completed. The retained control
reproduced the prior scores. The candidate median is316660 versus326720
(-10060, -3.08%). It fails the frozen floor. Fresh panels were not run.

| Metric | Retained | Candidate |
| --- | ---: | ---: |
| Median | 326720 | 316660 |
| Minimum | 189800 | 189800 |
| Runs >=150k | 10/10 | 10/10 |
| Runs >=200k | 9/10 | 9/10 |
| Stage1-2 destructions | 1 | 1 |
| Total destructions | 3 | 3 |
| Captures | 11 | 12 |

All three destruction event records are identical. Eight scores are identical.
Independent read-only review by Nash confirms rejection and the identical
destruction records. Seed89007 has one additional capture; this is associated
with the score regression, but causation has not been established.
Seed89004 drops390670->376780;89007 drops345480->310410 (Stage50->45).
All runs end at the time limit; these are not final career scores.
The original93008 collision repair remains a local diagnostic success, not
full-game acceptance. No gameplay change was integrated.

An initial collector assumed the first exported JSON was a session. Long runs
also export system status. Schema-based selection fixed the collector and
recovered the first three completed runs without changing inputs or rerunning
gameplay. The failed collector packet is preserved separately.

Portable evidence: `safety-qualification/results.json`, `protocol.json`, and
`provenance.json`. Forty-seven primary files have gzip recovery/hash checks.
Score history adds retainedA6d and rejectedA7; no untested tiers are inferred.

Next action: inspect the first changed gameplay event for89007, then decide
whether one narrower repair has evidence. Do not weaken the median floor or
start the fresh panels for this rejected candidate. Player goal: avoid a
specific collision without reducing sustained scoring and progression.

## Prior Status

Recorded/mirrored/boundary collision fixtures and350scope checks passed in the
prior packet. Matched full-game qualification is in progress. No candidate
integration or publication has occurred. Localhost retains the accepted pilot.

Broader persona calibration and live final-package account checks remain open.
The account session requested in the prior turn has not yet been confirmed.
Do not substitute mocked scoring tests for live persistence acceptance.
