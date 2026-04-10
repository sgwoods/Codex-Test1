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

For a maintained first-session prompt you can paste into the home Codex instance, use:

- `/Users/stevenwoods/Documents/Codex-Test1/HOME_CODEX_PROMPT.md`

## Prerequisites

Install on the home machine:

- `git`
- `node` and `npm`
- Google Chrome
- GitHub CLI `gh`

Optional but useful:

- Python 3 for a simple local static server

## First-Time Setup

1. Clone the development repo:
   ```bash
   git clone https://github.com/sgwoods/Codex-Test1.git
   cd Codex-Test1
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Authenticate GitHub CLI if you plan to publish beta or production from this machine:
   ```bash
   gh auth login
   ```

## Local Development Loop

1. Start each session by syncing:
   ```bash
   git pull --rebase origin main
   npm install
   ```
2. Build the current local dev output:
   ```bash
   npm run build
   ```
3. Bring the local game and viewer back up:
   ```bash
   npm run local:resume
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

### Log Viewer

Start by itself:

```bash
npm run log-viewer
```

Open:

- `http://127.0.0.1:4311/`

The viewer expects artifacts under:

- `/Users/stevenwoods/Documents/Codex-Test1/harness-artifacts/`

Player-triggered exported logs and videos are different:

- they download through the browser first
- on macOS that is usually the user’s `Downloads` folder
- import them into `harness-artifacts/` when you want them in the developer review archive:
  ```bash
  npm run harness:import-latest
  ```

See:

- `~/Documents/Codex-Test1/ARTIFACT_POLICY.md`

On the home machine that means the same repo-relative folder inside your local clone.

## Staying In Sync Across Machines

The simplest rule is:

- do not leave meaningful unpushed work on both machines at the same time

Recommended pattern:

1. Pull before starting work:
   ```bash
   git pull --rebase origin main
   ```
2. Make a small unit of change
3. Build and test
4. Commit and push:
   ```bash
   git add ...
   git commit -m "..."
   git push origin main
   ```
5. On the other machine, pull again before continuing

## Branching

For larger changes:

```bash
git checkout -b codex/my-feature
git push -u origin codex/my-feature
```

Recommended use:

- small safe changes:
  - `main`
- bigger or riskier changes:
  - `codex/...`

## Publishing Beta

When a build is ready for the hosted beta lane:

```bash
npm run build
npm run promote:beta
npm run publish:check:beta
npm run publish:beta
```

This publishes:

- `/Users/stevenwoods/Documents/Codex-Test1/dist/beta/`

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

- `/Users/stevenwoods/Documents/Codex-Test1/dist/production/`

into the public Aurora production surface, then syncs the top-level `sgwoods/public` Aurora project page and verifies that public sync.

Important:

- production promotion should begin from a clean source tree
- if the approved beta candidate was built/promoted from a dirty source state, re-run the beta path from a clean tree before promoting production

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
