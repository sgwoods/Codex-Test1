# MacBook Codex Prompt

Use this prompt when you first start a Codex session on the MacBook Pro and
want it to follow the current Aurora Galactica multi-machine workflow.

```text
You are working on Aurora Galactica / Platinum in the authoritative source repo:

- Repo: sgwoods/Codex-Test1
- Local clone: use the current local workspace open in Codex
- Integration branch: main

Important repo roles:
- Codex-Test1 = source of truth for code, docs, issues, planning, harnesses, release control
- Aurora-Galactica = public release-host repo only
- Do not treat Aurora-Galactica as the engineering source repo
- Active issues and planning belong in Codex-Test1

Multi-machine workflow:
- This machine is fully set up for development and testing
- Release authority is intentionally NOT on this machine right now
- Release authority remains on:
  - machine_id: imacm1
  - machine_label: iMacM1
- So this machine MAY:
  - develop
  - run harnesses
  - create topic branches
  - commit and push
  - merge normal development work back toward main when appropriate
- This machine MUST NOT:
  - approve beta
  - publish beta
  - promote production
  - publish production
  unless release authority is explicitly transferred here

Current expected startup routine:
1. Start every session from the Aurora repo root
2. Run:
   npm run machine:bootstrap
3. If needed, inspect:
   npm run machine:status
   npm run machine:doctor
   npm run release:show-authority

Branching rules:
- Start from main
- Use short-lived topic branches
- Branch naming pattern:
  codex/<machine-id>-<topic>
- On this machine, prefer:
  codex/macbook-pro-<topic>

Examples:
- codex/macbook-pro-movement-polish
- codex/macbook-pro-audio-pass
- codex/macbook-pro-platform-cleanup

Normal development workflow:
1. git switch main
2. npm run machine:bootstrap
3. git switch -c codex/macbook-pro-<topic>
4. Make changes
5. Run relevant checks
6. Commit and push
7. Merge back intentionally

Key local services:
- Game: http://127.0.0.1:8000/
- Viewer: http://127.0.0.1:4311/

Browser harness rule:
- Run `npm run machine:ensure-browser` through bootstrap before browser checks.
- Browser-backed harnesses use Playwright-managed Chromium, not the user's
  installed Google Chrome.
- In Codex Desktop on macOS, run browser-backed harness commands with escalated
  sandbox permissions; sandboxed browser starts can trigger Chromium/Chrome
  SIGABRT crash dialogs.

Important docs to read first before major work:
- NEXT_CODEX_ACCOUNT_HANDOFF.md
- RESTART_FROM_HERE.md
- MULTI_MACHINE_WORKFLOW.md
- DEVELOPER_MACHINE_BASELINE.md
- RELEASE_POLICY.md
- PLAN.md
- PRODUCT_ROADMAP.md
- LONG_TERM_RELEASE_ROADMAP.md
- LEVEL_BY_LEVEL_EXPANSION_PLAN.md
- GO_FORWARD_EXECUTION_PLAN.md
- QUALITY_RELEASE_SCORECARD.md
- BETA_TO_PRODUCTION_PLAN.md
- PLATINUM_INTERFACE_REVIEW.md
- VIDEO_ALIGNMENT_PROGRAM.md
- REFERENCE_MEDIA_INVENTORY.md
- REPOSITORY_ROLE_MAP.md

Current live lane state to keep in mind:
- /dev: 1.2.3+build.532.sha.b959491
- /beta: 1.2.3-beta.1+build.532.sha.b959491.beta
- /production: 1.2.3+build.532.sha.b959491

Current product/release posture:
- dev, beta, and production are aligned to the same current release family
- the other machine is already advancing a Galaxians-style sibling and stronger harness/reference-analysis work
- public verification matters and includes:
  - raw project page
  - manifest JSON
  - rendered Aurora public page
  - rendered sgwoods/public homepage card

Current priority themes for future work:
1. Restore the audio phase / quality-conformance gate so measurement is trustworthy
2. Build the first level-by-level Aurora expansion blueprint
3. Expand challenge stages with richer alien types, movement patterns, scoring pressure, and presentation states
4. Add later-level entry and movement variation against original Galaga reference evidence
5. Make gameplay videos publishable and shareable as durable run/reference evidence
6. Advance the Galaxians-style sibling proof and merge its platform implications back cleanly
7. Continue player-ship movement fidelity, audio identity polish, gameplay trust fixes, and Platinum/application boundary cleanup

Operational rules:
- Prefer repo-grounded verification before conclusions
- Persist important plans and decisions in repo docs, not just chat
- Keep docs current when workflows or release state changes
- All meaningful work should end up committed to GitHub
- Do not use sudo or su for normal Aurora development
- Do not share one live git working tree across machines
- Use GitHub, not iCloud syncing of the same working tree, as the sync mechanism

If asked to do release work:
- First run:
  npm run release:show-authority
- If authority does not match this machine, stop before any beta/production publish steps and say so clearly

If asked to orient or restart:
- Begin with:
  npm run machine:bootstrap
  npm run machine:status
  npm run machine:doctor

When in doubt:
- Treat Codex-Test1/main as the authoritative line
- Treat Aurora-Galactica as the public mirror/release host
- Treat this machine as dev/test/push capable, but not release-authority capable
```
