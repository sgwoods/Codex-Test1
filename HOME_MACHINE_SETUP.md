# Home Machine Setup

This guide is the recommended way to work on Aurora Galactica from a second
machine while staying in sync cleanly with the main workstation.

## Goal

Use `Codex-Test1` as the only development repo on both machines.

- `Codex-Test1`
  - source of truth for gameplay, docs, harnesses, and release tooling
- `Aurora-Galactica`
  - public release host only
  - do not use it as the normal day-to-day development repo

For a maintained first-session prompt you can paste into the home Codex
instance, use:

- [HOME_CODEX_PROMPT.md](HOME_CODEX_PROMPT.md)

For the new canonical cross-machine workflow, use:

- [MULTI_MACHINE_WORKFLOW.md](MULTI_MACHINE_WORKFLOW.md)

For the special case where another machine holds uncommitted work that may be
ahead of GitHub or ahead of `hosted-dev`, also use:

- `RECOVERY_SAFE_COLLABORATION.md`

For the persistent machine capability checklist and current verified tool
baseline, also use:

- `DEVELOPER_MACHINE_BASELINE.md`

## Prerequisites

Install on the home machine:

- `git`
- `node` and `npm`
- Google Chrome
- GitHub CLI `gh`

Optional but useful:

- Python 3 for a simple local static server

Record the actual installed versions during bring-up:

```bash
node -v
npm -v
python3 --version
gh --version | head -n 1
'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' --version
```

## First-Time Setup

Preferred one-command installer:

```bash
mkdir -p "$HOME/Development"
cd "$HOME/Development"
curl -fsSL https://raw.githubusercontent.com/sgwoods/Codex-Test1/main/tools/dev/setup-machine.sh | bash
```

That creates or reuses `./Codex-Test1` in the folder where you run it.
If it succeeds cleanly, localhost should be ready immediately afterward:

- game:
  - `http://127.0.0.1:8000/`
- viewer:
  - `http://127.0.0.1:4311/`

If you want to use a unique iCloud-backed location instead, `cd` into that
parent folder first and run the same command there.

On a fresh Mac, the installer will try to help with missing prerequisites:

- it can trigger Apple Command Line Tools installation if needed
- it can install Homebrew if needed
- it can install missing Aurora dependencies like `git`, `node`, `python3`,
  `gh`, and Google Chrome through Homebrew/Homebrew Cask
- those steps may request administrator approval on the machine

If Apple Command Line Tools need a manual confirmation dialog, complete that
step and then rerun the same installer command.

Important:

- use a machine-specific clone path
- do not use the same git working tree on two machines, even through iCloud

Manual equivalent if you want to see the lower-level steps:

1. Clone the development repo:
   ```bash
   git clone https://github.com/sgwoods/Codex-Test1.git
   cd Codex-Test1
   ```
2. Preferred bring-up:
   ```bash
   npm run machine:bootstrap
   ```
3. If bootstrap reports blockers, inspect them with:
   ```bash
   npm run machine:doctor
   ```
4. Authenticate GitHub CLI if you plan to publish beta or production from this machine:
   ```bash
   gh auth login
   ```
5. Verify remotes and auth:
   ```bash
   git remote -v
   gh auth status
   ```

The startup commands now also write a local-only machine profile:

- `.machine-profile.json`

Do not commit that file.

## Local Development Loop

1. Start each session with:
   ```bash
   cd Codex-Test1
   npm run machine:bootstrap
   ```
2. If you only want a read-only readiness check:
   ```bash
   npm run machine:doctor
   ```
3. For a compact status summary:
   ```bash
   npm run machine:status
   ```
4. Open:
   - `http://localhost:8000`
   - `http://127.0.0.1:4311/`

If you only want the game without the viewer, the lower-level command is:

```bash
python3 -m http.server 8000 --directory dist/dev
```

When you want to stop the locally tracked services cleanly:

```bash
npm run local:stop
```

## Local Tools

### Harness

Run a scenario:

```bash
npm run harness -- --scenario stage1-opening
```

Run a batch:

```bash
npm run harness:batch -- --profile quick
```

Representative correspondence checks:

```bash
npm run harness:check:stage1-opening-correspondence
npm run harness:check:stage1-opening-spacing
npm run harness:check:capture-rescue-correspondence
npm run harness:check:challenge-stage-correspondence
```

### Log Viewer

Start by itself:

```bash
npm run log-viewer
```

Open:

- `http://127.0.0.1:4311/`

The viewer expects artifacts under:

- `harness-artifacts/` inside your local Aurora clone

Player-triggered exported logs and videos are different:

- they download through the browser first
- on macOS that is usually the user’s `Downloads` folder
- import them into `harness-artifacts/` when you want them in the developer review archive:
  ```bash
  npm run harness:import-latest
  ```

See:

- [ARTIFACT_POLICY.md](ARTIFACT_POLICY.md)

On the home machine that means the same repo-relative folder inside your local clone.

## Staying In Sync Across Machines

The simplest rule is:

- do not leave meaningful unpushed work on both machines at the same time

Recommended pattern:

1. Start with `npm run machine:bootstrap` or `npm run machine:doctor`
2. Make a small unit of change on a topic branch
3. Build and test
4. Commit and push:
   ```bash
   git add ...
   git commit -m "..."
   git push origin codex/<machine-id>-<topic>
   ```
5. Merge back into `main` intentionally
6. On the other machine, bootstrap or doctor again before continuing

## Recovery Mode When Another Machine Is Ahead

If another machine has meaningful uncommitted work:

- treat this machine as `local-support`, not the release authority
- do not push directly to `main`
- do not promote `/beta` or `/production` from this machine
- work only on isolated `codex/recovery-*` or `codex/safe-*` branches
- let the other machine fetch and decide how to integrate those branches later

Detailed workflow:

- `RECOVERY_SAFE_COLLABORATION.md`

## Branching

For larger changes:

```bash
git switch -c codex/<machine-id>-my-feature
git push -u origin codex/<machine-id>-my-feature
```

Recommended use:

- small safe changes:
  - `codex/<machine-id>-...` then merge into `main`
- bigger or riskier changes:
  - `codex/...`

Release authority is separate from ordinary development. Inspect it with:

```bash
npm run release:show-authority
```

## Publishing Beta

When a build is ready for the hosted beta lane:

```bash
npm run build
npm run promote:beta
npm run publish:check:beta
npm run publish:beta
```

This publishes:

- `dist/beta/`

into the public Aurora beta surface.

## Publishing Production

When a build is ready for the hosted production lane:

```bash
npm run build
npm run promote:production
npm run publish:check:production
npm run publish:production
```

This publishes:

- `dist/production/`

into the public Aurora production surface, then syncs the top-level `sgwoods/public` Aurora project page and verifies that public sync.

Important:

- production promotion should begin from a clean source tree
- beta and production release work must run from the current release-authority
  machine
- production release/public sync should run from a machine whose Aurora checkout
  is on `main` and current with `origin/main`
- the production artifact and `src/public/aurora-galactica.template.html` should come from that exact clean checkout before `npm run sync:public`
- if the approved beta candidate was built/promoted from a dirty source state, re-run the beta path from a clean tree before promoting production
- if hosted lanes depend on runtime-loaded media under `assets/`, verify those
  files are present after publish instead of assuming the image-only checks are
  enough
- if the top-level Aurora project page still shows stale release/build/focus
  data after production publish, stop and treat that as a release-path failure
- if you are rerunning only `npm run sync:public` after production is already
  live, verify local `dist/production/build-info.json` still matches the live
  production lane exactly before syncing

## Important Defaults

- edit source under `src/`
- do not hand-edit `dist/`
- use `Codex-Test1` for development
- use `Aurora-Galactica` only as the release target

## Practical Recommendation

If you want the least-friction two-machine workflow:

1. keep both machines cloned to `Codex-Test1`
2. pull before every session
3. rebuild and run:
   ```bash
   npm run build
   npm run local:resume
   ```
4. push before switching machines
5. publish from either machine only after the preflight passes
