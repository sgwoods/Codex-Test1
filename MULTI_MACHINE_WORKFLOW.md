# Multi-Machine Workflow

This is the default Aurora workflow when development happens across more than
one machine.

## Core Model

- `main` is the only integration branch
- either machine may develop and push topic branches
- only one machine is the release authority at a time
- hosted `/beta` and hosted `/production` may only be published from the
  current release-authority machine

The source of truth for release authority is:

- [release-authority.json](release-authority.json)

## Machine Roles And Work Allocation

The project may use more than one active development machine. The default
division is based on what each machine is good at, not on ownership of a
particular game.

| Machine Class | Best Use | Avoid |
| --- | --- | --- |
| MacBook M4 / current high-throughput machine | Interactive gameplay iteration, browser-backed visual review, heavy local harness sweeps, release-authority work when claimed, source integration, and tasks that need frequent human inspection. | Long unattended branches that may be forgotten while active release work continues elsewhere. |
| iMac M1 / always-online machine | Background ingestion, long-cycle persona/watch runs, reference-media normalization, hosted-lane monitoring, issue hygiene, documentation sweeps, and independent topic branches that can be cleanly pushed for integration. | Beta or production publish unless release authority is intentionally transferred there. |
| Future additional machines | Narrowly scoped worker branches such as video segmentation, artifact labeling, screenshot/contact-sheet generation, or game-specific analysis packets. | Editing `main` directly, holding release authority implicitly, or maintaining private local-only work. |

Current practical rule:

- use the MacBook M4 for the highest-feedback gameplay and platform work
- use the iMac M1 for always-on or separable work that can produce durable
  artifacts, branch commits, or GitHub issue updates
- every parallel thread must declare its release family from
  [RELEASE_SCHEDULE_AND_ISSUE_SPINE_2026-06-07.md](RELEASE_SCHEDULE_AND_ISSUE_SPINE_2026-06-07.md)
- every parallel thread must have a short handoff note before it is merged,
  archived, or abandoned

Good iMac M1 assignments:

- Guardians ingestion and v1 evidence packets while the MacBook advances Aurora
  gameplay quality
- overnight or multi-hour persona/watch runs with summarized artifacts
- gameplay-export ingestion cycles for hosted `/dev` review
- reference artifact portability checks and path sanitation
- GitHub issue deduplication and release-family labeling proposals
- documentation consistency sweeps after MacBook runtime work lands

Good MacBook M4 assignments:

- Aurora challenge-stage movement and visual-conformance runtime changes
- browser-visible UI, fullscreen, cabinet, score, and shell reviews
- heavy local conformance sweeps that benefit from the faster machine
- release-authority checks and hosted `/dev` publish from clean `main`
- integration of pushed worker branches from iMac M1 or future machines

## One-Command Startup

After cloning the repo and installing the required system tools, the preferred
startup path is:

```bash
mkdir -p "$HOME/Development"
cd "$HOME/Development"
curl -fsSL https://raw.githubusercontent.com/sgwoods/Codex-Test1/main/tools/dev/setup-machine.sh | bash
```

That installer:

- clones the repo into `./Codex-Test1` if needed
- reuses the clone if it already exists
- then runs `npm run machine:bootstrap`

The repo bootstrap itself:

- verifies `node`, `npm`, `python3`, `gh`, and Chrome
- verifies the repo remote and branch
- pulls `origin/main` if the repo is on a clean `main`
- runs `npm install`
- runs `npm run build`
- runs `npm run local:resume`
- writes the local-only `.machine-profile.json`
- reports live lane state, release authority, and next commands

For a read-only health check, use:

```bash
npm run machine:doctor
```

For a quick current-state summary, use:

```bash
npm run machine:status
```

Important path rule:

- prefer a non-iCloud local parent folder such as `$HOME/Development`
- do not keep the active Aurora clone inside an iCloud-managed folder
- do not rely on iCloud to synchronize `.git` state between machines

## Branch Naming

Branch from `main` and use short-lived topic branches:

- `codex/<machine-id>-<topic>`

Examples:

- `codex/imacm1-audio-polish`
- `codex/macbookpro-movement-traces`

Recommended session pattern:

1. `npm run machine:bootstrap` or `npm run machine:doctor`
2. `git switch main`
3. `git switch -c codex/<machine-id>-<topic>`
4. make the smallest coherent change
5. run the smallest relevant gate set
6. commit and push the topic branch
7. merge back into `main` intentionally

## Safe Switching Between Machines

Default rule:

- do not leave meaningful unpushed work on both machines at once without
  documenting it
- do not use one shared working tree through iCloud or another sync layer
- before any multi-hour Codex run or when a chat is getting long, write a
  durable context checkpoint:

```bash
npm run codex:checkpoint -- --label <short-topic> --plan "<current goal>" --next "<next concrete step>"
```

This writes:

- `CODEX_CONTEXT_CHECKPOINT.md`
- `reference-artifacts/analyses/codex-context-checkpoint/latest.json`

Codex Desktop does not expose a repository command that forces internal chat
compaction. The recovery-safe replacement is to write this checkpoint, commit
it when it captures meaningful state, then start a fresh Codex session from the
restart prompt in `CODEX_CONTEXT_CHECKPOINT.md`.

Normal workflow:

1. start with `npm run machine:bootstrap` or `npm run machine:doctor`
2. if on `main`, pull before editing
3. if on a topic branch, rebase from updated `main` before publishing a
   candidate
4. push before switching machines

When the repo is on a dirty `main`, bootstrap will not pull automatically. That
is intentional. Clean up or branch off first.

## Release Authority

Inspect the current authority with:

```bash
npm run release:show-authority
```

Hand off release authority intentionally with:

```bash
npm run release:claim-authority -- --machine-id <id> --label "<label>"
```

That command updates and commits `release-authority.json`, which makes the
handoff visible in git history.

## What A Non-Authority Machine May Do

Allowed:

- local development
- harness work
- docs and analysis work
- topic-branch pushes
- `/dev` preparation work on `main`

Not allowed:

- `npm run approve:beta`
- `npm run publish:beta`
- `npm run promote:production`
- `npm run publish:production`

Those commands are guarded and fail if this machine does not match
`release-authority.json`.

## Release Flow From The Authority Machine

Release-capable standard:

1. `npm run machine:doctor`
2. `git switch main`
3. confirm local `main` matches `origin/main`
4. run candidate checks
5. publish or promote from `main`

Current formal flow:

```bash
npm run approve:beta
npm run promote:production
npm run publish:check:production
npm run publish:production
```

Public sync is part of the same release discipline. `verify:public` must
confirm:

- the Aurora project page
- the legacy alias
- the manifest JSON
- the rendered root `sgwoods/public` homepage card

## Exceptional Case: Recovery-Safe Collaboration

If another machine holds meaningful uncommitted work that may be ahead of git,
the normal workflow above is no longer sufficient.

That is when to use:

- [RECOVERY_SAFE_COLLABORATION.md](RECOVERY_SAFE_COLLABORATION.md)

Treat that document as the exception path, not the day-to-day default.

For the active migration away from iCloud-backed Aurora clones, also use:

- [NON_ICLOUD_CLONE_MIGRATION_PLAN.md](NON_ICLOUD_CLONE_MIGRATION_PLAN.md)
