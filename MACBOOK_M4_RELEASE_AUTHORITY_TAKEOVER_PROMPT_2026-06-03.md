# MacBook M4 Release-Authority Takeover Prompt

Updated: June 3, 2026

Use this prompt on the MacBook M4 Codex session to take over Aurora, Platinum,
and release-authority work from the iMacM1 while the iMac pivots to
Galaxy Guardians-only development.

```text
You are taking over Aurora Galactica / Platinum release work from the iMacM1.

Repo and role:
- engineering source repo: sgwoods/Codex-Test1
- local workspace: use the current local Codex-Test1 checkout already open on this MacBook M4
- public release host: sgwoods/Aurora-Galactica
- your job on this machine:
  - become the release-authority machine
  - continue Aurora and Platinum platform work
  - carry the current review line forward toward production
- the iMacM1 is no longer the Aurora/platform authority machine after this handoff
  - it should pivot to Galaxy Guardians-focused work only

Current known source state from the iMac handoff:
- source repo head on origin/main: 29c59bc0
- latest repo-only cleanup commit: 29c59bc0 `Align top-score sign-in harness copy`
- hosted /dev currently live on: 1.4.0.1+build.1013.sha.3cb0d08b
- hosted /beta currently live on: 1.4.0-beta.1+build.1013.sha.3cb0d08b.beta
- hosted /production currently live on: 1.4.0+build.894.sha.1dc23d8a
- important implication:
  - main is ahead of the currently hosted dev/beta lanes by one repo-only harness/review cleanup commit
  - no hosted republish is required just for 29c59bc0 unless a later runtime/platform bundle justifies it

Your first goal is to take over release authority correctly and safely.

Do this first, in order:
1. git switch main
2. git pull --rebase origin main
3. npm run machine:bootstrap
4. npm run machine:status
5. npm run machine:doctor
6. npm run release:show-authority

Then, if the repo is clean, claim release authority on this MacBook using this machine's own identity:
7. npm run release:claim-authority -- --notes "Authority transferred from iMacM1 to MacBook M4 for Aurora/Platinum release continuation and production path."
8. git push origin main
9. npm run release:show-authority

Important:
- Do not pass a guessed machine_id unless the repo tooling clearly requires it.
- Let the command use this machine's local identity by default.
- After the claim succeeds, this MacBook becomes the only machine allowed to approve beta, publish beta, promote production, and publish production.

After authority transfer, re-ground on the release path:
10. npm run publish:check:dev
11. npm run publish:check:beta
12. review live /dev and /beta build-info plus current local main state

Primary work after takeover:
- Aurora gameplay quality and challenge-set-piece improvement
- Platinum platform/release hardening
- final pre-production documentation consistency cleanup
- clear production-readiness review for whether the next production release should be 1.4.1

Known current quality/product posture:
- current measured quality score is 8.7/10
- weakest category remains challenge-set-piece
- production should still be treated as deferred until a new explicit go decision is made

Important current docs to read first:
- MACBOOK_M4_RELEASE_AUTHORITY_TAKEOVER_PROMPT_2026-06-03.md
- IMAC_GUARDIANS_ROLE_PROMPT_2026-06-03.md
- NEXT_CODEX_ACCOUNT_HANDOFF.md
- OTHER_MACHINE_CONTINUATION_HANDOFF_2026-06-03.md
- RELEASE_LANE_MODEL.md
- RELEASE_POLICY.md
- RELEASE_SPINE_AND_1_4_1_ASSESSMENT_2026-06-03.md
- PLATFORM_APP_SEPARATION_ARCHITECTURE_REVIEW_2026-06-03.md
- BETA_QUALITY_CODE_REVIEW_2026-06-03.md
- PRE_PRODUCTION_DOCUMENTATION_CONSISTENCY_REVIEW_2026-06-03.md

Operational rules after takeover:
- Treat Codex-Test1/main as the authority line.
- Treat Aurora-Galactica as release-host only.
- Keep release authority on this MacBook until explicitly handed off again.
- Do not let beta outrun hosted dev; the new guardrails are supposed to prevent that.
- Persist important decisions in repo docs, not just chat.

When reporting back after takeover, use this structure:
- Authority transfer:
- Repo head:
- Live /dev:
- Live /beta:
- Production state:
- Next Aurora/platform step:
```
