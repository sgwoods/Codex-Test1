# Guardians Watch/Rival Restart Prompt

Paste this into the next Codex session on the iMac Guardians machine.

```text
You are resuming Guardians-only work on the non-authority iMac machine.

Repo:
/Users/steven/Projects-All/Codex-Test1

Branch:
codex/imacm1-guardians-ingestion-conformance

Do this first:
1. git switch codex/imacm1-guardians-ingestion-conformance
2. git pull --rebase origin codex/imacm1-guardians-ingestion-conformance
3. npm run machine:status
4. npm run release:show-authority

Expected machine posture:
- this machine is not release authority
- do not publish /dev, /beta, or /production
- do not touch release-authority.json

Read these first:
- GUARDIANS_WATCH_AND_RIVAL_ENABLEMENT_PLAN_2026-06-07.md
- GUARDIANS_NEXT_20_PRIORITY_PLAN_2026-06-07.md
- reference-artifacts/analyses/correspondence/guardians-persona-fullrun/README.md
- reference-artifacts/analyses/correspondence/guardians-persona-fullrun/latest.md
- reference-artifacts/analyses/correspondence/guardians-persona-fullrun/stage2-failure-diagnosis-0.1.md

Current factual baseline:
- Aurora has first-class 1P / 2UP Rival / Watch
- Guardians has:
  - 1P preview play
  - working harness/runtime Watch semantics
  - canonical Intermediate full-run Watch baseline
  - no first-class front-door Watch parity yet
  - no Rival support yet
- the shell currently hard-gates 2UP support to Aurora
- the front-door Watch UI is still hidden behind the same 2UP gate
- Guardians remains preview-only in the gameplay adapter registry

Current canonical whole-run baseline:
- persona: Intermediate
- stage reached: 2
- score: 2920
- stage clears: 1
- top loss cause: alien_scout_collision

Primary goal for this session:
Make Watch a first-class pack-neutral platform modality for Guardians without
pretending Rival already works.

Ordered work:
1. Introduce explicit pack capability helpers for Watch versus Rival.
2. Decouple Watch UI from the Aurora-only 2UP gate.
3. Surface Guardians Watch on the normal front door.
4. Keep Guardians Rival explicitly disabled but honestly modeled.
5. Add/refresh acceptance checks for Guardians Watch.
6. Only after Watch is first-class, define the exact Guardians Rival runtime contract.

Constraints:
- use measured/runtime-backed validation, not just UI inspection
- do not broaden Guardians into fake parity with Aurora
- preserve the existing whole-run persona lane as the main review loop
- keep generated video/session artifacts out of the public repo

Useful files:
- src/js/05-player-flow.js
- src/js/90-harness.js
- src/js/13-gameplay-adapter-registry.js
- src/js/13-galaxy-guardians-gameplay-adapter.js
- tools/harness/run-gameplay.js
- tools/harness/scenarios/guardians-full-run-persona.json

Before wrapping:
- assess what changed
- assess whether the step achieved the goal
- update the Next 20 accordingly
- keep working tree and artifact boundaries tidy
```
