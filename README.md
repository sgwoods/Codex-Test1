# Aurora Galactica On Platinum

`Aurora Galactica` is the first shipped playable application on the `Platinum`
browser-arcade platform.

![Platinum Hero](reference-artifacts/diagrams/platinum/platinum-hero.svg)

## What This Repo Contains

This repo is the engineering source of truth for:

- the `Platinum` platform
- the `Aurora Galactica` application
- the hosted documentation set
- the build, promote, publish, and verification scripts for the release lanes

Think about the product in two layers:

- `Platinum`
  - shared shell, hosted lanes, pack selection, shared services, release tooling, and first-class hosted documentation
- `Aurora Galactica`
  - gameplay rules, stage flow, scoring, capture and rescue, challenge behavior, and Aurora-specific content

## Live Lanes

- local `localhost`:
  - `http://127.0.0.1:8000/`
- hosted `/dev`:
  - `https://sgwoods.github.io/Aurora-Galactica/dev/`
- hosted `/beta`:
  - `https://sgwoods.github.io/Aurora-Galactica/beta/`
- hosted `/production`:
  - `https://sgwoods.github.io/Aurora-Galactica/`
- local log viewer:
  - `http://127.0.0.1:4311/`

## First-Class Hosted Documentation

The hosted documentation set should now move with the release lanes.

Primary hosted docs on hosted `/production`:

- project guide:
  - `https://sgwoods.github.io/Aurora-Galactica/project-guide.html`
- Platinum guide:
  - `https://sgwoods.github.io/Aurora-Galactica/platinum-guide.html`
- player guide:
  - `https://sgwoods.github.io/Aurora-Galactica/player-guide.html`
- release dashboard:
  - `https://sgwoods.github.io/Aurora-Galactica/release-dashboard.html`

Equivalent docs should also exist on hosted `/dev` and hosted `/beta`.

## Canonical Source Docs

Best platform overview:

- `/Users/stevenwoods/Documents/Codex-Test1/PLATINUM.md`
- `/Users/stevenwoods/Documents/Codex-Test1/PLATINUM_ARCHITECTURE_OVERVIEW.md`

Best application-boundary doc:

- `/Users/stevenwoods/Documents/Codex-Test1/APPLICATIONS_ON_PLATINUM.md`

Best repo technical map:

- `/Users/stevenwoods/Documents/Codex-Test1/ARCHITECTURE.md`

Best release and testing gate doc:

- `/Users/stevenwoods/Documents/Codex-Test1/TESTING_AND_RELEASE_GATES.md`

Release planning and readiness docs:

- `/Users/stevenwoods/Documents/Codex-Test1/PLAN.md`
- `/Users/stevenwoods/Documents/Codex-Test1/PRODUCT_ROADMAP.md`
- `/Users/stevenwoods/Documents/Codex-Test1/RELEASE_POLICY.md`
- `/Users/stevenwoods/Documents/Codex-Test1/RELEASE_READINESS_REVIEW.md`
- `/Users/stevenwoods/Documents/Codex-Test1/release-dashboard.json`
- `/Users/stevenwoods/Documents/Codex-Test1/release-notes.json`

## Current Release State

Current public milestone:

- `1.2.2 - Runtime freeze hardening patch` candidate
- `1.2.1 - Aurora trust-fix and copy-boundary patch`

What that means:

- Aurora now ships as the first playable application on Platinum
- hosted `/dev`, hosted `/beta`, and hosted `/production` are now explicit lanes
- the shell, picker, and shared docs are part of the product rather than just engineering scaffolding

Immediate follow-through after `1.2.1`:

- keep the next Aurora polish and correctness bundle tight
- keep the documentation set aligned across source and hosted pages
- strengthen the platform versus application boundary before the second game becomes truly playable

## Run Locally

1. Build the current local candidate:

```bash
cd /Users/stevenwoods/Documents/Codex-Test1
npm run build
```

2. Start the local game and log viewer together:

```bash
npm run local:resume
```

3. Open:

- `http://127.0.0.1:8000/`
- `http://127.0.0.1:4311/`

To stop the tracked local services cleanly:

```bash
npm run local:stop
```

## Release Ladder

The expected release ladder is:

1. local `localhost`
2. hosted `/dev`
3. hosted `/beta`
4. hosted `/production`

The intention is:

- local `localhost` for active engineering
- hosted `/dev` for integrated hosted review
- hosted `/beta` for release-candidate validation
- hosted `/production` for the public stable promise

## Release Discipline

For every meaningful `x.y` release, we now want a full documentation pass to be
part of the real gate between hosted `/beta` and hosted `/production`.

That means refreshing:

- release notes
- release dashboard
- README and planning docs
- platform and application docs
- testing and release-gate docs
- hosted project, Platinum, and player guides

See:

- `/Users/stevenwoods/Documents/Codex-Test1/TESTING_AND_RELEASE_GATES.md`
- `/Users/stevenwoods/Documents/Codex-Test1/RELEASE_POLICY.md`

## Related Visuals

![Platinum Platform Stack](reference-artifacts/diagrams/platinum/platinum-platform-stack.svg)

![Platinum vs Game Packs](reference-artifacts/diagrams/platinum/platinum-pack-separation.svg)

![Aurora Pack Card](reference-artifacts/diagrams/platinum/aurora-pack-card.svg)

![Galaxy Guardians Pack Card](reference-artifacts/diagrams/platinum/galaxy-guardians-pack-card.svg)
