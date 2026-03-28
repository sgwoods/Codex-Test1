---
name: aurora-dev-refresh
description: Use when refreshing an Aurora Galactica development machine back to a clean working state, syncing the Codex-Test1 repo, rebuilding dist outputs, checking dependencies, and confirming local play/viewer readiness.
---

# Aurora Dev Refresh

Use this skill when we want Codex to bring the current machine back to a ready Aurora Galactica development state.

## Source Of Truth

Read these files first when they exist in the local clone:

- `HOME_MACHINE_SETUP.md`
- `HOME_CODEX_PROMPT.md`
- `README.md`
- `RELEASE_POLICY.md`
- `CONTRIBUTING.md`
- `ARCHITECTURE.md`
- `SOURCE_MAP.md`

Treat them as the workflow source of truth.

## Repo Expectations

- Development repo:
  - `Codex-Test1`
- Public release repo:
  - `Aurora-Galactica`
- Do development work only in `Codex-Test1`.
- Do not hand-edit generated files under:
  - `dist/dev/`
  - `dist/production/`
  - `dist/beta/`

## Default Workflow

1. Confirm the local repo path.
   - Prefer the current working directory if it is the `Codex-Test1` clone.
   - Otherwise look for a likely clone such as `~/Documents/Codex-Test1`.
2. Read the source-of-truth docs listed above.
3. Check whether the repo is clean.
4. Sync from remote:
   - `git pull --rebase origin main`
5. Ensure dependencies are installed:
   - `npm install`
6. Rebuild the generated local dev output:
   - `npm run build`
7. Bring local debugging services back up:
   - `npm run local:resume`
8. If the user wants beta readiness too, promote beta:
   - `npm run promote:beta`
9. Report clearly:
   - repo path
   - whether the repo is clean
   - whether dependencies are installed
   - whether `dist/dev/` is current
   - whether local play is ready
   - whether the log viewer is ready
10. If the user wants the local game only, the lower-level command is:
   - `python3 -m http.server 8000 --directory dist/dev`
11. If the user wants the viewer only, the lower-level command is:
   - `npm run log-viewer`

## Output Pattern

Keep the response concise and practical.

Include:
- `Repo:`
- `Status:`
- `Ran:`
- `Next:`

## Safety Rules

- Never edit `dist/` by hand.
- Never use `Aurora-Galactica` as the normal dev repo.
- If the repo has local changes, call that out before pulling.
- If build or install fails, say exactly which command failed.
- If the machine is missing a prerequisite such as Chrome, `gh`, or `npm`, call it out explicitly.

## Common Ready-State Commands

Basic refresh:

```bash
cd /path/to/Codex-Test1
git pull --rebase origin main
npm install
npm run build
```

Ready for local play:

```bash
cd /path/to/Codex-Test1
git pull --rebase origin main
npm install
npm run build
npm run local:resume
```

Ready for beta publish:

```bash
cd /path/to/Codex-Test1
git pull --rebase origin main
npm install
npm run build
npm run promote:beta
npm run publish:check:beta
```
