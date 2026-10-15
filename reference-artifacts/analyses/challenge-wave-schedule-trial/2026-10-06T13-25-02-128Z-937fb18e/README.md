# Natural Stage 31 Scheduling Decision

Baseline source: 937fb18e98d03f36931b09ae340f4c8e38011dcf plus the
development-only fresh-state launch hook. Developer bundle SHA256:
ff8f328f0f3e16502424d5da2c633fac1092b28bdc144266adf1dddd21e4df75.
Measured data and method/source hashes are in report.json.gz. The compiled
bundle hash covers the adapter registry hook, omitted from this report's
individual source-file hash list.

Candidate offsets: [0, 3.593, 7.137, 9.997, 13.79]. Natural controlled-clock
launches, Stage31, seed9131, 60Hz; no motion-profile normalization.

| Measure | Baseline | Candidate |
| --- | --- | --- |
| Professional hits, one seed | 28/40 | 33/40 |
| Professional launch to clear | 10.333s | 18.283s |
| Professional measured blank time after first arrival | 0s | 0s |
| No-fire launch to clear | 11.750s | 22.100s |
| No-fire three-or-more-wave overlap | 6.150s | 0.900s |
| No-fire four/five-wave overlap | 4.750s | 0s |
| No-fire clear to next spawn | 4.433s | 4.433s |
| Targets fully entering | 40/40 | 40/40 |

All seven comparison checks pass. Positive local-time paths match at13,512
samples with100% minimum per-target coverage and zero position delta. Two
nonpositive-time trace-length differences are outside this claim. Full-entry
dwell is unchanged; no shots, attacks or ship losses. No contact repair claimed.
Stage3 repeat is a deterministic control, not override exclusion.

Six behavior-backed launch guards pass in sibling analysis directory
challenge-schedule-trial-launch/2026-10-06T13-28-52-800Z-937fb18e/report.json:
valid trial, ordinary baseline launch, malformed offsets, Stage3 rejection,
direct-launch rejection and non-development rejection. The latter uses a
temporary channel fixture, not a packaged-beta build.

Canonical audio evidence: sibling challenge-result-audio-continuity/
2026-10-06T13-26-59-514Z-937fb18e/report.json. Four forced cue/transition probes
in Stages3/31 complete four-second private reference buffers without explicit
stops. This is not perceptual mix acceptance or a natural perfect outcome.
Natural comparison uses public-safe audio. Private provisioning check passes.

Sampled Professional screenshots were inspected: candidate10s and baseline6s
render correctly, with visibly less concurrent crowding in the candidate.
This is sampled visual inspection, not continuous human play acceptance.
Independent read-only review found no hook blocker and recommends human
comparison before declaring a gameplay keeper.

## Recommendation

Accept the scheduling approach for a next, exact-Stage31-only local integration
packet. Player benefit: fewer simultaneous waves and more shooting opportunity,
without extending the between-stage wait. Cost: longer active challenge play.
Do not extend to later stages or claim perfect-score feasibility or original
fidelity: reference identities remain provisional and only one pilot seed ran.
Ordinary gameplay is unchanged in this checkpoint. No push or publication.
Next: implement the narrow local keeper if approved, inspect it on localhost,
then decide release inclusion. No further exploratory sweep is needed first.
