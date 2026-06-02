# Codex Context Checkpoint

Generated: 2026-06-01T16:42:17.733Z
Label: guardians-routeability-before-after

This is the durable recovery point for long Aurora / Platinum Codex sessions.
Use it before switching machines, before starting a multi-hour run, and whenever
the conversation has become long enough that automatic compaction could drop
important working context.

## Current Repo State

- Repo path: `/Users/sgwoods/Development/Codex/Codex-test1`
- Branch: `codex/macbook-ingestion-grammar-sync`
- HEAD: `71c52ca0a` Expose routeability review in ingestion grammar
- Dirty files excluding checkpoint self-output: `14`

## Active Plan

- Advance Guardians movement quality through shared motion grammar and routeability candidate gates

## Recommended Next Steps

- Create browser-visible before-after capture or promote the candidate behind stronger gates

## Notes

- Codex Desktop does not expose a repo command that forces internal chat compaction. The safe replacement is a manual checkpoint plus a deliberate fresh session from this file.
- This checkpoint intentionally filters its own generated files out of the dirty-status read so it can be committed as the recovery point.

## Git Status

```
M MOTION_GRAMMAR_VOCABULARY.md
 M ingestion-dashboard.json
 M package.json
 M reference-artifacts/analyses/galaxy-guardians-identity/README.md
 M tools/harness/guardians-long-surface-lib.js
?? reference-artifacts/analyses/galaxy-guardians-identity/motion-grammar-candidates-0.1.json
?? reference-artifacts/analyses/galaxy-guardians-identity/motion-grammar-candidates-0.1.md
?? reference-artifacts/analyses/galaxy-guardians-identity/routeability-before-after-0.1.json
?? reference-artifacts/analyses/galaxy-guardians-identity/routeability-before-after-0.1.md
?? reference-artifacts/analyses/galaxy-guardians-identity/routeability-before-after-0.1.svg
?? tools/harness/analyze-galaxy-guardians-motion-grammar-candidates.js
?? tools/harness/analyze-galaxy-guardians-routeability-before-after.js
?? tools/harness/check-galaxy-guardians-motion-grammar-candidates.js
?? tools/harness/check-galaxy-guardians-routeability-before-after.js
```

## Diff Stat

```
MOTION_GRAMMAR_VOCABULARY.md                       | 20 +++++++++++
 ingestion-dashboard.json                           | 28 +++++++++++++--
 package.json                                       |  4 +++
 .../analyses/galaxy-guardians-identity/README.md   | 12 +++++++
 tools/harness/guardians-long-surface-lib.js        | 40 ++++++++++++++++++++++
 5 files changed, 102 insertions(+), 2 deletions(-)
```

## Recent Log

```
71c52ca0a (HEAD -> codex/macbook-ingestion-grammar-sync, origin/codex/macbook-ingestion-grammar-sync) Expose routeability review in ingestion grammar
c722fac34 Add human-perfect guard to challenge candidate sweeps
9bb463aa9 (origin/main, origin/HEAD) Refresh code review packet for release doc wording update
9878d3dce Refresh release conformance docs for artifact wording
d013c62e5 Refresh code review packet for artifact wording
c33b4689b Clarify Aurora and Guardians artifact requests
b3d186c81 Refresh code review packet for release doc update
55c147259 Refresh release conformance docs for Windigo intake
```

## Machine Status Snapshot

```json
{
  "ok": true,
  "mode": "status",
  "machine": {
    "machine_id": "macbook-pro",
    "machine_label": "MacBook-Pro",
    "hostname": "MacBook-Pro",
    "repo_path": "/Users/sgwoods/Development/Codex/Codex-test1",
    "profile_exists": true,
    "profile_path": "/Users/sgwoods/Development/Codex/Codex-test1/.machine-profile.json",
    "profile_preview": {
      "machine_id": "macbook-pro",
      "machine_label": "MacBook-Pro",
      "hostname": "MacBook-Pro",
      "repo_path": "/Users/sgwoods/Development/Codex/Codex-test1",
      "tool_versions": {
        "node": "v25.9.0",
        "npm": "11.12.1",
        "python3": "Python 3.9.6",
        "gh": "gh version 2.91.0 (2026-04-22)",
        "chrome": "Google Chrome 148.0.7778.179",
        "harness_browser": "playwright-managed-chromium"
      },
      "gh_auth": true,
      "last_successful_bootstrap_at": "2026-05-20T14:59:22.155Z"
    }
  },
  "repo": {
    "branch": "codex/macbook-ingestion-grammar-sync",
    "dirty": true,
    "upstream": "origin/codex/macbook-ingestion-grammar-sync",
    "ahead": 0,
    "behind": 0,
    "remote_ok": true
  },
  "release_authority": {
    "machine_id": "imacm1",
    "machine_label": "iMacM1",
    "claimed_by": "Steven Woods",
    "claimed_at": "2026-04-25T13:16:57Z",
    "notes": "Primary Aurora release-authority machine after the 1.2.3+build.532.sha.b959491 production refresh.",
    "current_machine_matches": false
  },
  "local_services": {
    "game": {
      "ok": true,
      "reachable": true,
      "root_ok": true,
      "url": "http://localhost:8000/",
      "listeners": [
        {
          "pid": 25405,
          "cwd": "/Users/sgwoods/Development/Codex/Codex-test1",
          "root_ok": true
        }
      ]
    },
    "viewer": {
      "ok": true,
      "reachable": true,
      "root_ok": true,
      "url": "http://localhost:4311/api/runs",
      "listeners": [
        {
          "pid": 25481,
          "cwd": "/Users/sgwoods/Development/Codex/Codex-test1",
          "root_ok": true
        }
      ]
    },
    "state_dir": "/Users/sgwoods/Development/Codex/Codex-test1/.local-services"
  },
  "live_lanes": {
    "dev": {
      "ok": true,
      "version": "1.4.0",
      "label": "1.4.0.1+build.975.sha.9bb463aa",
      "commit": "9bb463aa",
      "releaseChannel": "development"
    },
    "beta": {
      "ok": true,
      "version": "1.4.0-beta.1",
      "label": "1.4.0-beta.1+build.894.sha.1dc23d8a.beta",
      "commit": "1dc23d8a",
      "releaseChannel": "production beta"
    },
    "production": {
      "ok": true,
      "version": "1.4.0",
      "label": "1.4.0+build.894.sha.1dc23d8a",
      "commit": "1dc23d8a",
      "releaseChannel": "production"
    }
  },
  "publish_permitted": false,
  "next": [
    "git switch -c codex/macbook-pro-your-topic",
    "npm run release:show-authority",
    "npm run release:claim-authority -- --machine-id macbook-pro --label \"MacBook-Pro\""
  ]
}
```

## Exact Restart Prompt

```text
You are continuing Aurora Galactica / Platinum work from a durable Codex checkpoint.

Repo path:
/Users/sgwoods/Development/Codex/Codex-test1

Start by running:
git branch --show-current
git status --short
git log -5 --oneline --decorate
npm run machine:status

Read first:
- CODEX_CONTEXT_CHECKPOINT.md
- RESTART_FROM_HERE.md
- MULTI_MACHINE_WORKFLOW.md

Current checkpoint:
- label: guardians-routeability-before-after
- generated: 2026-06-01T16:42:17.733Z
- branch: codex/macbook-ingestion-grammar-sync
- commit: 71c52ca0a Expose routeability review in ingestion grammar
- dirty files excluding checkpoint self-output: 14

Continue the active plan from the checkpoint. Preserve user work, do not publish beta/production unless this machine has release authority, and commit coherent progress before switching machines or long-running sessions.
```

## Compaction Prevention Protocol

1. At every phase boundary, run:

```bash
npm run codex:checkpoint -- --label <short-topic> --plan "<current goal>" --next "<next concrete step>"
```

2. Commit the checkpoint if it records meaningful state or handoff context.
3. Start a fresh Codex session with the restart prompt above when the chat is
   long, after a multi-hour cycle, or before switching machines.
4. Treat the fresh session as the practical way to force compaction safely:
   context is rebuilt from the repo instead of relying on a fragile chat tail.

JSON artifact: `reference-artifacts/analyses/codex-context-checkpoint/latest.json`
