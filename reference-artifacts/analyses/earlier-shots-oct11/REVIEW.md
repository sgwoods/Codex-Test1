# Approach 1: Earlier Shots

October11,2026. Baseline cf0e7a666067ede385865ba02e73d1454eb132d1.
Result: earlier real interceptions of target372665405 FOUND. No path repair.
This qualifies prior9-12s sampled absence, not acceptance of the rejected exit.

## Execution

Retained green-only rejected candidate dist was not rebuilt. Its complete
artifact was preserved privately before testing. Separate baseline checkout
/private/tmp/aurora-earlier-shots-baseline-oct11 was built from the exact baseline.
Both used identical copied shot method, with only right30/right40 added to the
allowed normal key-hold options. No player/target positions assigned.
Seed9131,60Hz, fresh natural Stage31 launch per trial, exactly one real Space
shot, stationary single ship at firing. Actual player/shotX and vx are recorded.

Initial candidate screening: two columns,5.5-6.5s,11 trials each.
Bounded follow-up: both columns,5-9s at0.1s steps,41 trials per column per variant.
186 independent one-shot trials total, including22 initial screening trials.

| Artifact / Move | Target first hits | Other-enemy first hits | Misses |
| --- | ---: | ---: | ---: |
| Candidate right30 | 14/41 | 27 | 0 |
| Baseline right30 | 14/41 | 27 | 0 |
| Candidate right40 | 20/41 | 21 | 0 |
| Baseline right40 | 20/41 | 21 | 0 |

right30 actual shipX256.73 or259.93, vx0:
target shot-launch witnesses5.6-6.3 and8.5-9.0s inclusive at0.1s samples.
right40 actual shipX267, vx0:
target shot-launch witnesses5.5-6.3 and8.0-9.0s inclusive at0.1s samples.
These are sampled witnesses, not continuous firing-window guarantees.

Other first-hit IDs/counts in both41-trial variants:
right30:551507219=1,783339713=21,809515661=5;
right40:783339713=16,809515661=5.
Other enemies were not removed to manufacture access to the target.

## Identity And Limits

Candidate bundle98ee41bbc9f798a82efa0a67a0b2339d2f7e269f6701b2691e892c66b68dd6ba.
Separate baseline bundle58cc0c3436c8b4a30500eefb91850a80cb862f8e263a5715f96cee0470188f83.
Method8a56549a637a55d22736eb773ec87f5e8f10f62a2095167c625728fef95eac55.
Candidate tested enemy source9472948c0959952d1f79d2a3f6998f94081a29054f7b7a06ed3f4739f7301c88,
bound through previous diagnosis and preserved bundle. Current candidate-checkout
enemy source is restored baseline1456799e1fadd17e9fc65ce387abd64811a67231ed1bdc866b914ac40f2d8815;
do not use current source HEAD to identify rejected artifact bytes.

summary.json contains all six original/private raw paths and SHA256 hashes,
per-witness real shot/kill times, shipX/vx, first-hit counts and tested identities.
Raw reports and both built artifacts are privately archived under
private-artifacts/repo-mirror/reference-artifacts/analyses/earlier-shots-oct11.
Lead should copy this public summary plus private raw/archive, not publish builds.

Some entry/late-middle witnesses are near clipping boundaries. Summary includes
nearest matched no-fire poses/full-view flags; these are diagnostic samples,
not direct shot-run sprite measurements. Movement release partly depends on
wall clock. Two columns/one seed do not establish human readability, reaction
time, all-target perfect feasibility, a continuous route or an exit repair.
The candidate still has its completion defect and remains rejected.
No gameplay-source edits, commit, push, publication or lead-checkout changes.
