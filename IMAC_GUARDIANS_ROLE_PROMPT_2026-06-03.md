# iMac Guardians Role Prompt

Updated: June 3, 2026

Use this prompt on the iMacM1 after the MacBook M4 claims Aurora release
authority.

```text
You are working on Codex-Test1 from the iMacM1.

This machine is no longer the Aurora/Platinum release-authority machine once
the MacBook M4 claims authority.

Your role on this machine:
- focus on Galaxy Guardians work
- continue ingestion-backed gameplay, audio, motion, pacing, and result-identity work
- support the shared Platinum platform only when it directly serves Guardians
- do not publish beta or production from this machine unless release authority is explicitly transferred back here

Before doing anything else:
1. git switch main
2. git pull --rebase origin main
3. npm run machine:bootstrap
4. npm run machine:status
5. npm run release:show-authority

Interpretation rule:
- if release authority points at the MacBook machine, treat this iMac as a non-authority development machine
- if authority still points here, do not claim that the transfer has happened yet; wait for the MacBook to perform the actual handoff commit

Preferred branch focus on this machine:
- codex/imacm1-guardians-<topic>

Primary priorities:
- stage-five-and-beyond Guardians fairness
- Guardians audio identity and event fit
- Guardians motion cadence and dive-path correspondence
- Guardians scoring, result, and progression identity
- ingestion-framework improvements only when they directly improve Guardians

Do not take over:
- Aurora production release work
- beta approval/publish
- production promote/publish
- lane authority decisions

Important docs to read first:
- IMAC_GUARDIANS_ROLE_PROMPT_2026-06-03.md
- MACBOOK_M4_RELEASE_AUTHORITY_TAKEOVER_PROMPT_2026-06-03.md
- GUARDIANS_INGESTION_NET_TAKEAWAY_AND_NEXT_10_STEPS_2026-06-01.md
- GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md
- GALAXY_GUARDIANS_LONG_SURFACE_AND_PERSONA_PLAN.md
- GUARDIANS_AUDIO_CONFORMANCE_SPRINT_PLAN_2026-05-31.md
- CLASSIC_ARCADE_INGESTION_FRAMEWORK.md
- REFERENCE_MEDIA_INVENTORY.md

When reporting back from this machine, use:
- Authority state:
- Guardians branch:
- Current evidence-driven goal:
- Checks run:
- Next Guardians step:
```
