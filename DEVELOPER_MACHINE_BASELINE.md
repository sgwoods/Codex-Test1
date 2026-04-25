# Developer Machine Baseline

This guide captures the persistent machine setup Aurora needs so a new machine
can become a real developer workstation without rediscovering local conventions.
The practical startup path now runs through `npm run machine:bootstrap` and
`npm run machine:doctor`.

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

Verified on this machine on `2026-04-24`:

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

Preferred one-command setup:

```bash
mkdir -p "$HOME/Development"
cd "$HOME/Development"
curl -fsSL https://raw.githubusercontent.com/sgwoods/Codex-Test1/main/tools/dev/setup-machine.sh | bash
```

This command:

- clones `sgwoods/Codex-Test1` into `./Codex-Test1` if needed
- reuses the clone if it already exists
- runs `npm run machine:bootstrap`

If you choose an iCloud-backed target path, `cd` into that machine-specific
parent folder first, then run the same command there. Do not use one shared
working tree across two machines.

1. Clone the repo:
   ```bash
   git clone https://github.com/sgwoods/Codex-Test1.git
   cd Codex-Test1
   ```
2. Preferred bring-up:
   ```bash
   npm run machine:bootstrap
   ```
3. If that reports blockers, inspect them with:
   ```bash
   npm run machine:doctor
   ```
4. Verify remotes manually if needed:
   ```bash
   git remote -v
   ```

Expected day-to-day:

- `origin` should point at `sgwoods/Codex-Test1`
- daily development should start from `main` after the `1.2.3+build.489.sha.f6ba6c2`
  production refresh unless a release-specific hotfix branch is explicitly in
  use

If this machine will publish live Aurora lanes directly, also confirm the
public host remote strategy used by the repo at that time.

## Release Authority

Aurora now uses a committed release-authority contract.

Source of truth:

- [release-authority.json](release-authority.json)

Useful commands:

```bash
npm run release:show-authority
npm run release:claim-authority -- --machine-id <id> --label "<label>"
```

Only the current authority machine may publish hosted `/beta` or hosted
`/production`.

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

Current Aurora exception:

- the reference-video alignment pack
- current quality-conformance rollups
- current correspondence bundles used for release decisions
- refreshed audio identity comparison artifacts

have all been committed in this repo because they now serve as durable release
evidence and restart context.

## Local-Only Files

Some machines may also require local-only files such as:

- `.env.local`
- browser download/import conventions for exported artifacts

Do not commit secrets. Instead, document the requirement and the source of
truth needed to recreate the file on a new machine.

## First-Day Verification Checklist

Use this as a practical bring-up list:

1. `npm run machine:bootstrap`
2. if blocked, run `npm run machine:doctor`
3. open local game and viewer
4. run one small harness check
5. run one correspondence check
6. confirm `gh auth status`
7. confirm `git remote -v`
8. confirm `npm run release:show-authority`
9. record the actual tool versions for this machine

## Relationship To Other Docs

- machine bring-up workflow:
  - `HOME_MACHINE_SETUP.md`
- multi-machine day-to-day workflow:
  - `MULTI_MACHINE_WORKFLOW.md`
- cross-machine recovery and branch hygiene:
  - `RECOVERY_SAFE_COLLABORATION.md`
- release-state orientation:
  - `RELEASE_STATE_MAP.md`
- long-term execution plan:
  - `GO_FORWARD_EXECUTION_PLAN.md`
- restart checkpoint after the April 24, 2026 production push:
  - `RESTART_FROM_HERE.md`
