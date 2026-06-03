# Other Machine Continuation Handoff

Updated: June 3, 2026

This note now captures the state of the iMacM1 authority checkout at the moment
we intend to hand Aurora/Platinum release authority to the MacBook M4 while the
iMac pivots to Guardians-focused work.

## Authority Snapshot

- repo: `/Users/steven/Projects-All/Codex-Test1`
- branch: `main`
- head: `29c59bc0`
- working tree: clean
- currently committed release authority:
  - `machine_id`: `imacm1`
  - `machine_label`: `iMacM1`
  - `current_machine_matches`: `true`

Interpretation:

- Authority has not yet been transferred in git history.
- The next intended move is for the MacBook M4 to claim authority from its own
  clean checkout using the repo-supported claim command.
- Do not edit `release-authority.json` by hand on the MacBook; claim it there.

## Live Lane Snapshot

- hosted `/dev`
  - label `1.4.0.1+build.1013.sha.3cb0d08b`
  - commit `3cb0d08b`
- hosted `/beta`
  - label `1.4.0-beta.1+build.1013.sha.3cb0d08b.beta`
  - commit `3cb0d08b`
- hosted `/production`
  - label `1.4.0+build.894.sha.1dc23d8a`
  - commit `1dc23d8a`

Interpretation:

- `/dev` and `/beta` are intentionally aligned.
- `/production` is the last stable public release and is `112` commits behind
  `main`.
- the newest source-only repo cleanup is `29c59bc0`
- that newest cleanup was not republished because it only aligned a harness
  expectation with already-correct runtime copy
- this session did not promote production

## What Was Integrated Here

MacBook guardrail tranche already merged on authority `main`:

- merge commit:
  - `595f59c9` `Merge remote-tracking branch 'origin/codex/macbook-ingestion-grammar-sync'`
- carried MacBook head:
  - `249117d2` `Strengthen 2UP and challenge tour guardrails`

Expected outcomes from that merge remain intact:

- `2UP` persona scoring stays lane-isolated
- Watch Mode includes `CHALLENGE TOUR / CHALLENGING STAGES ONLY`
- challenge tour begins at Challenging Stage `3-4` and advances through
  Challenging Stage `7-8` without ship loss in the checked flow
- overall quality remained about `8.6/10`
- weakest category remained `challenge-set-piece`

## What This Session Added After The MacBook Merge

Hosted Arcade Music recovery and publish pass:

- `707c4437` `Add hosted Arcade Music iframe fallback`
- `45a0f542` `Harden hosted Arcade Music fallback`
- `1bc961e8` `Strengthen hosted Arcade Music iframe recovery`
- `ddeddcef` `Loosen hosted Arcade Music iframe promotion`
- release-doc and review-packet refresh commits through:
  - `ed8d7f18` `Refresh code review packet after handoff conformance docs`

Practical result:

- localhost still reaches direct playable Arcade Music
- hosted `/dev` and `/beta` now recover into playable iframe-only fallback
  state instead of falling through to `Arcade Music unavailable`
- this is a hosted playback recovery pass, not the final release-process
  hardening pass

## Release-Authority Transfer Sequence For The MacBook M4

On the MacBook, from a clean local `main` checkout:

```bash
git switch main
git pull --rebase origin main
npm run machine:bootstrap
npm run machine:status
npm run machine:doctor
npm run release:show-authority
npm run release:claim-authority -- --notes "Authority transferred from iMacM1 to MacBook M4 for Aurora/Platinum release continuation and production path."
git push origin main
npm run release:show-authority
```

Important:

- let the claim command use the MacBook's own local machine identity by default
- do not guess or hardcode the target `machine_id` unless the MacBook tooling
  shows a clear need
- once that claim is pushed, the MacBook becomes the only machine allowed to
  publish `/beta` or `/production`

## What The Other Machine Should Not Redo

Do not reopen these as if they were still unmerged:

- `codex/macbook-ingestion-grammar-sync`
- the hosted Arcade Music recovery/publish chain
- the public/private artifact boundary baseline

The correct starting point is current `origin/main`, not any older local topic
branch that predates `29c59bc0`.

## Best Next Continuation Options

### Option 1: Aurora / Platform / Production Path

This is now the preferred MacBook role after authority transfer.

Branch:

```bash
git switch main
git pull --rebase origin main
git switch -c codex/macbook-release-authority-continuation
```

Goal:

- continue Aurora and Platinum platform work
- carry the current `1.4.0.1` / beta review line toward a real production
  decision
- own hosted lane discipline and production readiness

### Option 2: Guardians Quality

Branch:

```bash
git switch main
git pull --rebase origin main
git switch -c codex/macbook-challenge-set-piece-quality
```

Goal:

- attack the weakest remaining category directly
- use measured reference windows and evidence-first challenge-stage review
- treat this as gameplay quality work, not release-process work

### Option 3: Release/Platform Guardrails

Branch:

```bash
git switch main
git pull --rebase origin main
git switch -c codex/macbook-release-lane-guardrails
```

Goal:

- require fresh hosted `/dev` parity before `/beta` publish
- add a hosted Arcade Music verifier that expects real fallback play state
- make future lane state less confusing

## Commands To Re-Ground On The Other Machine

```bash
cd <your-local-Codex-Test1-checkout>
git switch main
git pull --rebase origin main
git status --short
git rev-parse --short HEAD
npm run machine:bootstrap
npm run machine:status
npm run machine:doctor
npm run release:show-authority
```

Expected current head after sync:

```text
29c59bc0
```

## Release Boundary Reminder

After the authority transfer, the MacBook may continue development, harness,
analysis, branch work, beta approval/publish, and production promotion/publish.

Before the authority transfer, the MacBook should not:

- approve beta
- promote production
- publish beta
- publish production

Until release authority is explicitly transferred there.
