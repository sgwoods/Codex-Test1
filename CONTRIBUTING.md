# Contributing

This project is still in prerelease. We are optimizing for fast iteration,
reference-backed fidelity work, and safe collaboration.

## Core Rules

- Edit source files under:
  - `/Users/stevenwoods/Documents/Codex-Test1/src/`
- Do not hand-edit the served artifact:
  - `/Users/stevenwoods/Documents/Codex-Test1/index.html`
- Rebuild after source changes:
  ```bash
  cd /Users/stevenwoods/Documents/Codex-Test1
  npm run build
  ```
- Prefer evidence-backed gameplay changes:
  - manual
  - reference videos
  - harness scenarios
  - real playtest captures

## Useful Orientation

- Project overview:
  - `/Users/stevenwoods/Documents/Codex-Test1/README.md`
- Source orientation:
  - `/Users/stevenwoods/Documents/Codex-Test1/SOURCE_MAP.md`
- Architecture:
  - `/Users/stevenwoods/Documents/Codex-Test1/ARCHITECTURE.md`
- Reference-to-behavior baseline:
  - `/Users/stevenwoods/Documents/Codex-Test1/REFERENCE_BASELINE.md`
- Roadmap:
  - `/Users/stevenwoods/Documents/Codex-Test1/PLAN.md`
  - `/Users/stevenwoods/Documents/Codex-Test1/PRODUCT_ROADMAP.md`

## Branching

- Use the `codex/` prefix for working branches
- Suggested examples:
  - `codex/challenge-fidelity-pass`
  - `codex/stage4-collision-tuning`
  - `codex/reference-baseline-docs`

## Building And Running

- Build the game:
  ```bash
  npm run build
  ```
- Replay a saved gameplay session:
  ```bash
  npm run harness -- --session /absolute/path/to/neo-galaga-session.json
  ```
- Run a built-in scenario:
  ```bash
  npm run harness -- --scenario stage3-challenge
  ```
- Run a batch:
  ```bash
  npm run harness:batch -- --profile quick
  ```

## Gameplay Change Expectations

If a change touches gameplay, include at least one of:

- a matching harness run
- a batch report
- a real playtest note
- a reference artifact comparison

If a change is fidelity-driven, tie it back to:

- `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/`
- an open GitHub issue
- a measurable harness target where possible

## Release / Build Identity

- Versioning policy:
  - `/Users/stevenwoods/Documents/Codex-Test1/RELEASE_POLICY.md`
- Every build carries:
  - version
  - build number
  - commit
  - branch
  - dirty/clean state
  - Eastern timestamp

## Good Collaboration Defaults

- Keep comments targeted and high-value
- Prefer small, reviewable steps
- Preserve reference-backed rules once they land
- Call out uncertainty instead of guessing when original Galaga behavior is not yet settled

## Current Working Priorities

1. Build a stronger autonomous baseline against original Galaga
2. Keep later-stage survivability and challenge-stage fidelity moving
3. Make collaboration safer with clearer docs, issue hygiene, and repeatable harness evidence
