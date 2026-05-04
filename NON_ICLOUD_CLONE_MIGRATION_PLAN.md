# Non-iCloud Clone Migration Plan

Aurora's active git working trees should not live inside iCloud-managed folders.

This plan exists because the iMac Aurora repo showed concrete git-metadata
damage consistent with filesystem interference:

- zero-byte `.git/index`
- malformed ref files with unexpected names
- `.DS_Store` inside `.git/refs`
- release blocking caused by duplicate ` * 2` files

Those are not normal repo-content problems. Treat them as a workstation-layout
risk.

## Policy

- keep active Aurora development clones in machine-local folders outside iCloud
- use GitHub as the sync mechanism between machines
- do not use one shared working tree across machines
- do not use iCloud to mirror `.git`, `node_modules`, build outputs, or active
  harness/runtime state

Recommended parent folder on each machine:

```bash
$HOME/Development
```

Recommended clone path on each machine:

```bash
$HOME/Development/Codex-Test1
```

## Machine Roles

- release-authority iMac:
  - `imacm1`
  - should keep the authoritative Aurora clone in a non-iCloud local path
- MacBook Pro developer machine:
  - should also use its own non-iCloud local path
  - may develop, test, and push without holding release authority

## Migration Sequence

### 1. Freeze on GitHub First

On the current authority machine:

1. ensure important work is committed and pushed
2. confirm `main` matches `origin/main`
3. confirm the current release authority with:

```bash
npm run release:show-authority
```

### 2. Create A Fresh Local Clone

On each machine, from a non-iCloud folder:

```bash
mkdir -p "$HOME/Development"
cd "$HOME/Development"
curl -fsSL https://raw.githubusercontent.com/sgwoods/Codex-Test1/main/tools/dev/setup-machine.sh | bash
```

That should create or reuse:

```bash
$HOME/Development/Codex-Test1
```

### 3. Verify The Fresh Clone

Run:

```bash
cd "$HOME/Development/Codex-Test1"
npm run machine:bootstrap
npm run machine:status
npm run machine:doctor
npm run release:show-authority
```

Confirm:

- the repo is on `main`
- the repo tracks `origin/main`
- localhost game and viewer work
- the machine role is what you expect

### 4. Move Runtime And Evidence Material Deliberately

Do not blindly copy the entire old working tree.

Only migrate what is still needed and not already in git:

- local exports from `Downloads`
- wanted `harness-artifacts/` review material
- wanted local notes
- any local-only `.env`-style files if they exist

Do not copy these from the old iCloud-backed clone unless there is a specific
reason:

- `.git/`
- `node_modules/`
- `.local-services/`
- `dist/`

Let the new clone recreate those safely.

### 5. Retire The Old Clone

After the new local clone is verified:

- keep the old iCloud-backed clone only as a temporary read-only reference
- rename it clearly so it is not used accidentally
- stop using it for development, harnesses, or release work

Suggested rename pattern:

```bash
Codex-Test1-OLD-ICLOUD-DO-NOT-USE
```

## Daily Rule Going Forward

- start every session from the non-iCloud clone
- run `npm run machine:bootstrap`
- do release work only from the release-authority machine
- treat any new duplicate ` * 2` files or git metadata oddities as a warning to
  stop and inspect the machine layout immediately
