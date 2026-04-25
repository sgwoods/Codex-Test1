# Restart From Here

This is the durable handoff point for restarting Aurora and Platinum work from
a new machine or a new Codex thread after the April 24-25, 2026 release and
multi-machine workflow refresh.

## Authoritative Repo

- repo:
  - current authority-machine clone: `/Users/steven/Documents/Codex-Test1`
  - on a new machine: use your own local clone path after `git clone`
- primary Git remote:
  - `origin -> https://github.com/sgwoods/Codex-Test1.git`
- public release host remote:
  - `public -> https://github.com/sgwoods/Aurora-Galactica.git`
- active integration branch going forward:
  - `main`
- repo role clarification:
  - [REPOSITORY_ROLE_MAP.md](REPOSITORY_ROLE_MAP.md)

## Live Lane State

Verified on April 25, 2026:

- hosted `/dev`
  - `1.2.3+build.470.sha.e4732eb`
  - [dev build-info](https://sgwoods.github.io/Aurora-Galactica/dev/build-info.json)
- hosted `/beta`
  - `1.2.3-beta.1+build.489.sha.f6ba6c2.beta`
  - [beta build-info](https://sgwoods.github.io/Aurora-Galactica/beta/build-info.json)
- hosted `/production`
  - `1.2.3+build.489.sha.f6ba6c2`
  - [production build-info](https://sgwoods.github.io/Aurora-Galactica/build-info.json)

This means hosted `/beta` and hosted `/production` are aligned to the same
release commit family, while hosted `/dev` remains the older integration lane
that can move again during the next polish cycle.

## Canonical Startup Path

On any machine that already has `git`, `node`, `npm`, `python3`, Chrome, and
`gh` installed:

```bash
curl -fsSL https://raw.githubusercontent.com/sgwoods/Codex-Test1/main/tools/dev/setup-machine.sh | bash -s -- "$HOME/Development/Codex-Test1"
```

That one command will:

- clone `sgwoods/Codex-Test1` into the target folder if it is not there yet
- reuse the clone if it already exists
- run `npm run machine:bootstrap` inside it

If you prefer a unique iCloud-backed path on a second machine, pass that target
path instead. Just make sure it is a machine-specific clone path, not the same
working tree used on another machine.

For a read-only startup check:

```bash
npm run machine:doctor
```

For a compact current-state summary:

```bash
npm run machine:status
```

These commands are now the primary machine bring-up path. They replace the
older manual sequence as the recommended way to restart work.

## Public Project Page State

The `sgwoods/public` Aurora project page and the rendered root homepage card are
part of the formal release verification path now.

First follow-up check on a fresh machine/thread:

```bash
npm run verify:public
```

This check now covers:

- the raw Aurora project page
- the raw manifest JSON
- the rendered Aurora project page
- the rendered root [sgwoods.github.io/public](https://sgwoods.github.io/public/)
  homepage card

## What Is Persisted

The important project state is committed and pushed:

- release and planning docs
- quality scorecard
- beta-to-production plan
- Platinum/application boundary review
- developer machine baseline
- correspondence framework and harnesses
- committed release-decision artifacts
- reference-video alignment pack
- refreshed audio identity comparison evidence

Important docs to read first:

- [PLAN.md](PLAN.md)
- [MULTI_MACHINE_WORKFLOW.md](MULTI_MACHINE_WORKFLOW.md)
- [GO_FORWARD_EXECUTION_PLAN.md](GO_FORWARD_EXECUTION_PLAN.md)
- [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md)
- [QUALITY_RELEASE_SCORECARD.md](QUALITY_RELEASE_SCORECARD.md)
- [BETA_TO_PRODUCTION_PLAN.md](BETA_TO_PRODUCTION_PLAN.md)
- [PLATINUM_INTERFACE_REVIEW.md](PLATINUM_INTERFACE_REVIEW.md)
- [VIDEO_ALIGNMENT_PROGRAM.md](VIDEO_ALIGNMENT_PROGRAM.md)
- [REFERENCE_MEDIA_INVENTORY.md](REFERENCE_MEDIA_INVENTORY.md)
- [DEVELOPER_MACHINE_BASELINE.md](DEVELOPER_MACHINE_BASELINE.md)

## What Was Just Shipped

The `1.2.3+build.489.sha.f6ba6c2` production refresh includes:

- stage timing and challenge timing improvements
- audio cue alignment improvements
- refreshed audio identity evidence
- trace-backed movement analysis improvements
- production-safe defaults in the developer/settings surfaces:
  - `Galaga Reference Audio`
  - `Aurora Borealis`
  - `Reference` starfield speed
  - `Bright` starfield intensity
- production-only lock on developer start-state controls
- `Root` backdoor with code `n00b`
- corresponding harness coverage for those settings/lock behaviors

## What Is Not Yet Done

The next polish cycle should prioritize:

1. player-ship movement fidelity against real Galaga footage
2. richer audio identity polish beyond cue timing
3. Platinum/application boundary cleanup
4. expanded reference-video event logging and visual artifact extraction
5. future-game ingestion planning for a second game such as `Galaxian`

## How To Restart On A New Machine

1. Run the installer:

```bash
curl -fsSL https://raw.githubusercontent.com/sgwoods/Codex-Test1/main/tools/dev/setup-machine.sh | bash -s -- "$HOME/Development/Codex-Test1"
```

2. If bootstrap is blocked, use:

```bash
npm run machine:doctor
```

and resolve the missing prerequisites it reports.

3. Run the representative checks:

```bash
npm run harness:check:close-shot-hit
npm run harness:check:persona-stage2-safety
npm run harness:check:production-developer-lock
npm run harness:check:player-movement-conformance
npm run harness:score:quality-conformance
```

4. Verify live/public state if release work is continuing:

```bash
npm run publish:verify:beta
npm run publish:verify:production
npm run verify:public
```

## Branching From Here

For new work:

- branch from `main`
- use short-lived `codex/<machine-id>-<topic>` topic branches
- merge back into `main` intentionally

Recommended branch families:

- `codex/movement-*`
- `codex/audio-*`
- `codex/fidelity-*`
- `codex/platform-*`
- `codex/galaxian-*`

## Release Authority Reminder

Only one machine should hold Aurora release authority at a time.

Inspect authority with:

```bash
npm run release:show-authority
```

Hand it off intentionally with:

```bash
npm run release:claim-authority -- --machine-id <id> --label "<label>"
```

Hosted `/beta` and `/production` promotion flows are now guarded by this
authority contract.

## Release Process Reminder

Keep this rule:

- if an artifact is relied on to justify a release, it must either be committed
  directly or its conclusions must be captured in committed docs

That rule now applies to:

- quality scores
- correspondence evidence
- reference-video alignment packs
- audio identity comparisons
- beta/production readiness records
