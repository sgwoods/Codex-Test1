# Developer Machine Baseline

This guide captures the persistent machine setup Aurora needs so a new machine
can become a real developer workstation without rediscovering local conventions.

## Goal

A valid Aurora developer machine should be able to:

- clone and run `Codex-Test1`
- build `dist/dev`, `dist/beta`, and `dist/production`
- run harnesses and correspondence checks
- run the local game and log viewer together
- inspect and preserve harness/reference artifacts
- authenticate GitHub for branch work and, when intended, lane publishing

## Preferred Local Shape

- keep the working Aurora repo in an iCloud-backed `Documents` location when possible
- use `Codex-Test1` as the development repo
- treat `Aurora-Galactica` as the public release host, not the main dev repo
- preserve local-only runtime state under the repo:
  - `.local-services/`
  - `harness-artifacts/`
  - `reference-artifacts/`

## Required Tools

Verified on this machine on `2026-04-19`:

- `node`: `v25.8.2`
- `npm`: `11.11.1`
- `python3`: `3.12.1`
- `gh`: `2.37.0`
- `Google Chrome`: `147.0.7727.56`

The exact versions do not need to match perfectly, but a new machine should
record its actual versions in a setup note when first verified.

## Required Capabilities

The machine should verify all of the following:

```bash
node -v
npm -v
python3 --version
gh --version | head -n 1
'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' --version
```

## Repo Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/sgwoods/Codex-Test1.git
   cd Codex-Test1
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Verify remotes:
   ```bash
   git remote -v
   ```

Expected day-to-day:

- `origin` should point at `sgwoods/Codex-Test1`

If this machine will publish live Aurora lanes directly, also confirm the
public host remote strategy used by the repo at that time.

## GitHub Auth

For branch work and GitHub visibility:

```bash
gh auth status
```

For publish-capable machines, `gh` auth should be present before attempting
beta or production workflows.

## Local Runtime Verification

The machine should be able to run:

```bash
npm run build
npm run local:resume
```

Then confirm:

- game: `http://127.0.0.1:8000/`
- viewer: `http://127.0.0.1:4311/`

Stop cleanly with:

```bash
npm run local:stop
```

## Harness Verification

The machine should be able to run at least one representative check from each family:

```bash
npm run harness:check:close-shot-hit
npm run harness:check:stage1-opening-correspondence
npm run harness:check:stage1-opening-spacing
npm run harness:check:capture-rescue-correspondence
npm run harness:check:challenge-stage-correspondence
```

If a check is known to depend on a newer harness hook than the shipped local
baseline supports, document that explicitly rather than silently treating the
machine as broken.

## Artifact Practices

Preserve these repo-local folders:

- `harness-artifacts/`
- `reference-artifacts/`
- `.local-services/`

Do not commit generated artifact trees by default unless the work explicitly
calls for a preserved checked-in artifact.

## Local-Only Files

Some machines may also require local-only files such as:

- `.env.local`
- browser download/import conventions for exported artifacts

Do not commit secrets. Instead, document the requirement and the source of
truth needed to recreate the file on a new machine.

## First-Day Verification Checklist

Use this as a practical bring-up list:

1. `npm install`
2. `npm run build`
3. `npm run local:resume`
4. open local game and viewer
5. run one small harness check
6. run one correspondence check
7. confirm `gh auth status`
8. confirm `git remote -v`
9. record the actual tool versions for this machine

## Relationship To Other Docs

- machine bring-up workflow:
  - `HOME_MACHINE_SETUP.md`
- cross-machine recovery and branch hygiene:
  - `RECOVERY_SAFE_COLLABORATION.md`
- release-state orientation:
  - `RELEASE_STATE_MAP.md`
- long-term execution plan:
  - `GO_FORWARD_EXECUTION_PLAN.md`
