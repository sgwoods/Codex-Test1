# Ten-Run Persona Distribution

Measured 2026-10-18, 19:08:51 to 19:16:26 UTC. No gameplay tuning in this packet.
Baseline 02166971875b19b7f0c41c035efab30868c179a0 plus the retained local persona
repairs described in REPAIR.md. This is DEVELOPMENT, not frozen beta.4.

## Method

80 real-browser runs: four personas, ten matched seeds, two games. Seeds72001
through72010 were selected before execution and were not used in the preceding
three-seed calibration. Each run starts atStage1 with three ships, Watch game
scope, controlled60Hz clock, and a900-second simulation limit. No live score
submission or account mutation. Four isolated browsers execute concurrently.
Guardians uses maxPlayableStage99 to avoid an artificial early completion cap;
no run reaches that cap. This is a long-surface test, not proof that the default
Guardians launch configuration has the same stage limit.

Input is copied from dist/dev before testing. Its index matches localhost8000:
SHA256 93b30d5603fc866f752bad6bbc25ce88074c942e289aec2132d3c14f7a96b6f2.
Build label:1.4.1.5+build.1209.sha.02166971.dirty.
Frozen beta atlocalhost8002 is unchanged and does not contain these repairs.

Verification passes80unique combinations, observed game/persona/Watch scope,
seed, Guardians cap, finite simulation time, maximum/final stage equality,
terminal events, unchanged runner/source hashes and copied index identity.
No harness errors or unexpected stops. Independent review identified capture
life decrements as distinct from destruction losses; both are reported below.

## Aurora

Stage distribution notation:stage:number of runs. Stage means reached, not cleared.
All40runs ended in game over before900seconds.

| Persona | Stage distribution | Median stage | Mean stage | Mean score |
| --- | --- | ---: | ---: | ---: |
| Beginner | 2:6, 4:1, 5:3 | 2 | 3.1 | 16,782 |
| Intermediate | 2:2, 4:2, 5:3, 6:2, 8:1 | 5 | 4.7 | 31,707 |
| Expert | 5:6, 6:3, 8:1 | 5 | 5.6 | 38,417 |
| Professional | 5:1, 6:8, 8:1 | 6 | 6.1 | 40,956 |

Stage1-2 destruction events:Beginner25, Intermediate19, Expert0, Professional0.
Stage1-2 captures:Beginner0, Intermediate1, Expert0, Professional1.
Professional seed72006 has a capture atStage2,t41.350s. Do not describe this as
zero early life loss. No Professional run ends beforeStage5. Expert and
Professional each clear the first challenging stage40/40 in all ten runs.
Professional mean score is6.6%above Expert; this is a modest sampled advantage,
not proof of human professional skill. All ten Professional runs end byStage8.
Professional destruction causes:34enemy collisions and2enemy bullets. Collisions
occur atStages4(12),5(8),6(14). Four capture events occur across the ten runs.

## Guardians

| Persona | Stage distribution | Median stage | Mean stage | Mean score | Time-limit runs |
| --- | --- | ---: | ---: | ---: | ---: |
| Beginner | 1:4, 2:4, 3:2 | 2 | 1.8 | 3,401 | 0 |
| Intermediate | 1:5, 2:4, 3:1 | 1.5 | 1.6 | 2,816 | 0 |
| Expert | 1:8, 2:2 | 1 | 1.2 | 2,632 | 8 |
| Professional | 1:5, 2:4, 3:1 | 1.5 | 1.6 | 2,980 | 0 |

Eight Expert runs remain unfinished at900seconds:six atStage1,two atStage2.
The other two Expert runs end atStage1. All other Guardians runs end in game
over. Time-limit results are censored; they do not establish the eventual
maximum stage or eventual survival time. They do establish poor progress during
the tested15minutes. Intermediate and Professional mean scores are below
Beginner. The declared skill ordering is not supported by this panel.
Do not use the shared shell's Guardians lives field:it can report1after game
over. Terminal event evidence, not that field, determines the outcomes here.

## Interpretation And Next Action

Aurora has an ordered sampled skill ladder and no repeated early Professional
wipeout. It still needs a bounded investigation of Stage4-6 collisions and
capture/rescue decisions. Player benefit:a stronger, credible top-level Watch
pilot and rival, without weaker enemies or extra lives.

Guardians is the clearer calibration failure. First trace the Expert runs that
make little progress, and compare Intermediate/Professional movement and firing
with Beginner on the same seeds. Player benefit:higher skill labels should
produce effective play, not prolonged stalling or worse scores.

Do not tune directly against this panel and then call it held-out validation.
It is now a diagnostic/regression panel. Freeze acceptance criteria and select
fresh seeds before testing a subsequent candidate. Ten runs per persona provide
useful diagnostics, not a precise population success rate or human skill model.
These are controlled-clock Watch tests, not80real-time rendered playthroughs.
Prior mode-parity checks remain separate; this does not add80P2run validations,
and Guardians still has no supported P2mode. No perfect-pilot persona is added.

Beta remains held. The existing Professional Stage2short-window score gate is
still failed and was not changed or bypassed. No publish, push, or new gameplay
repair occurred in this measurement step.

## Artifacts

Primary packet:private-artifacts/persona-distribution-oct18/.
run.js preserves the execution method; manifest.json records hashes and build;
input/ preserves the tested build; per-run directories retain sessions and
summaries. matrix.json has raw extracted outcomes; enriched-matrix.json adds
capture/rescue/extend events. summarize.js and verify.js regenerate statistics
and method checks. completion.json and verification.json record completion.
Reviewable distribution, per-run measurements, and sanitized provenance are
also persisted beside this report as distribution.json, runs.json, and
provenance.json. Private sessions are not copied into a public release artifact.
