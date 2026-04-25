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

## One-Command Startup

After cloning the repo and installing the required system tools, the preferred
startup path is:

```bash
npm run machine:bootstrap
```

This command:

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
