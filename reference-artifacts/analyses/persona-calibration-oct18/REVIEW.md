# Professional Calibration Investigation

Date: 2026-10-18. Baseline source: 02166971.
Input: private-artifacts/beta-candidate-scores-oct18-r2/dev-input.
Frozen beta.4 and game source are unchanged. No publication.

User observed three Professional losses in Stage2. The currently visible beta
tab was Aurora in wait mode; the original run's seed/settings were not captured.
Controlled measurements use the existing full-run-persona scenario, three ships,
natural Stage1 start, 240-second cap, deterministic harness clock, no manual
input, and no video. This is not an exact public Watch reproduction.

| Persona | Seed | Final stage | Score | Loss result |
| --- | --- | --- | --- | --- |
| Professional | 51301 | 2 | 8260 | Three Stage2 collisions at38.417,41.683,44.867s |
| Professional | 51101 | 5 | 36310 | Four collisions, including one earned extra ship |
| Expert | 51101 | 6 | 41930 | Three collisions; capture also occurred |

Primary runs, summaries, decision events and system status are persisted under
private-artifacts/persona-calibration-oct18/, named by persona and seed.
Command: node tools/harness/run-gameplay.js --root
private-artifacts/beta-candidate-scores-oct18-r2/dev-input --scenario
full-run-persona --persona PERSONA --seed SEED --auto-video 0 --out
private-artifacts/persona-calibration-oct18.

## Findings

Professional's early collapse is reproduced. One matched seed also reverses
the intended Expert/Professional ranking. Three runs do not establish rates.
Professional lacks the optional lower-dive-avoidance fields present in Expert;
all measured Professional deaths were collisions. This is a strong repair lead,
not yet causal proof. Inspect decision traces before selecting parameters.

Independent read-only review found that Watch and harness use the same Aurora
controller but differ in manual-input handoff. The controller directly changes
position with a speed multiplier rather than normal human acceleration. It is
not a rule-equivalent human feasibility witness. Existing Stage2 safety compares
against Expert, not an absolute early-stage competency threshold. Historical
May12 distribution data at855f8ec7 cannot establish current quality.

## Repair And Acceptance

1. Analyze the three Stage2 loss windows and test bounded collision avoidance.
2. Use the same seed set for every persona. Report early wipeout rate, ship
   losses, stage reached, score and challenge accuracy; do not rely on one seed.
3. Check real Watch progression and preserve Stage3 challenge/capture behavior.
4. Agree explicit early-stage competency targets before accepting calibration.
   Proposed direction: Professional reliably clears early stages, with materially
   fewer avoidable losses than Expert. Numerical thresholds remain to be set.
5. Separate skill simulation from a rule-compliant feasibility controller.
   Do not imply either is a calibrated human model without supporting evidence.

Do not change enemy difficulty, hitboxes, lives or scoring to improve the pilot.
Any accepted runtime repair requires a new local candidate and regression checks.
Keep beta publication held pending repair or an explicit product disposition.
Player benefit: Watch demonstrates competent play, while assessment distinguishes
controller mistakes from unfair game behavior.
