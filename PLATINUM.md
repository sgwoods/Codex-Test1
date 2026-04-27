# Platinum Platform Guide

`Platinum` is the shared browser-arcade platform that now hosts `Aurora
Galactica` and is being prepared to host future sibling games such as
`Galaxy Guardians`.

This is the canonical platform document.

Use it when the question is about:

- what Platinum is for
- what Platinum owns
- how games plug into it
- what still belongs to applications rather than the platform
- where the current seams are still imperfect
- what should improve as the second game firms up

## Purpose

Platinum exists to separate the reusable arcade host from the specific games it
runs.

That means Platinum should own the things that ought to be consistent across
multiple games:

- shell framing and cabinet presentation
- hosted lane model and release identity
- pack selection and boot path
- common runtime, input, and session surfaces
- shared services such as auth, leaderboard transport, and feedback transport
- shared documentation and release discipline
- platform-only harnesses and publish checks
- a stable control contract that lets players move between hosted games with
  the same core input model

At the same time, Platinum should stay out of application-specific rules.

It should not own:

- Aurora scoring rules
- Aurora capture and rescue behavior
- Aurora challenge-stage structure
- Aurora-specific copy, stage identity, or boss personality

## Architectural Invariant: No Direct Game-To-Game Sharing

Games on Platinum should not share game-specific code, rule tables, state,
assets, mechanics, or capabilities directly with each other.

If a behavior is common to more than one game, that commonality belongs in
Platinum as a named API, interface, service, capability flag, harness substrate,
or versioned contract. Applications may depend on Platinum contracts; they
should not depend on another application's implementation.

In practical terms:

- Aurora changes must not affect Galaxy Guardians except through intentional
  Platinum contract changes
- Galaxy Guardians changes must not affect Aurora except through intentional
  Platinum contract changes
- future games must receive reusable behavior through Platinum extension points,
  not sideways imports from Aurora or Galaxy Guardians
- game-owned mechanics such as capture/rescue, dual-fighter mode, challenge
  stages, flagship escorts, alien movement, scoring, visual identity, sound
  cues, and event vocabulary stay inside the owning game pack

The current audit for this boundary is:

- `/Users/steven/Documents/Codex-Test1/PLATINUM_GAME_BOUNDARY_AUDIT.md`

## What Platinum Is Today

Today Platinum is a real shipped platform, not a speculative refactor.

Current proof points:

- `Aurora Galactica` ships as the first playable Platinum application on hosted `/production`
- hosted lanes now exist for:
  - local `localhost`
  - hosted `/dev`
  - hosted `/beta`
  - hosted `/production`
- the shell supports pack selection and pack-owned framing accents
- `Galaxy Guardians` exists as a preview-only second-game sneak peek on top of the same platform
- the second-game preview content is now pack-owned instead of hardcoded into
  the shell surface
- platform-only harnesses exist alongside Aurora gameplay harnesses
- the build pipeline now generates hosted documentation pages as first-class release artifacts

## Platform Structure

### Shell and presentation

Platinum owns the outer cabinet treatment:

- marquee housing
- left and right rails
- lower status band
- popup framing
- shell frame themes
- platform identity marks
- platform-owned startup and wait-mode shell copy
- release-cycle shell messaging that can span more than one application

This is implemented primarily through:

- `/Users/steven/Documents/Codex-Test1/src/index.template.html`
- `/Users/steven/Documents/Codex-Test1/src/styles.css`
- `/Users/steven/Documents/Codex-Test1/src/js/19-render-shell.js`
- `/Users/steven/Documents/Codex-Test1/src/js/00-boot.js`

### Runtime and pack hosting

Platinum owns the pack selection and boot contract:

- active pack selection
- preview-only pack behavior
- start behavior from the shell
- wait-mode hosting rules
- fullscreen and scaling shell behavior

This is implemented primarily through:

- `/Users/steven/Documents/Codex-Test1/src/js/00-boot.js`
- `/Users/steven/Documents/Codex-Test1/src/js/01-runtime-shell.js`
- `/Users/steven/Documents/Codex-Test1/src/js/15-game-picker.js`

### Shared services

Platinum owns shared service boundaries that should not be rewritten for each
pack:

- auth and pilot-session adapters
- leaderboard fetch and submit policy
- feedback transport policy
- replay/session plumbing

This is implemented primarily through:

- `/Users/steven/Documents/Codex-Test1/src/js/03-platform-services.js`
- `/Users/steven/Documents/Codex-Test1/src/js/04-leaderboard-ui.js`
- `/Users/steven/Documents/Codex-Test1/src/js/11-leaderboard-service.js`
- `/Users/steven/Documents/Codex-Test1/src/js/12-auth-session.js`
- `/Users/steven/Documents/Codex-Test1/src/js/02-replay-telemetry.js`

### Shared contracts

Platinum currently depends on a shared application contract that is real in
practice even though it still needs further formalization.

The main contract areas are:

- game-pack identity
- shell theme selection
- supported capabilities
- entity model compatibility
- stage and scoring hooks
- application-owned front-door identity surfaces shown by the shell
- platform-owned startup, wait-mode, and release-cycle shell copy

See also:

- `/Users/steven/Documents/Codex-Test1/src/js/13-aurora-game-pack.js`
- `/Users/steven/Documents/Codex-Test1/src/js/14-entity-model.js`
- `/Users/steven/Documents/Codex-Test1/PLATINUM_INTERFACE_REVIEW.md`

## Applications On Platinum

Platinum should be thought of as the host layer.

Applications on Platinum are the games.

Current application set:

- `Aurora Galactica`
  - first shipped playable application
  - owns game rules, scoring, challenge cadence, capture and rescue, stage flow, and Aurora-branded content
- `Galaxy Guardians`
  - current preview-only application shell
  - useful for proving the pack-selection path, preview-modal contract, alternate
    shell identity, and safe launch fallback without pretending gameplay exists yet

The application-side separation is documented in:

- `/Users/steven/Documents/Codex-Test1/APPLICATIONS_ON_PLATINUM.md`

## How To Use Platinum In Practice

When we work on the repo, the right question is usually:

- is this platform work
- or application work

Treat a change as Platinum work when it affects:

- more than one pack
- the hosted lane model
- shell framing
- shared services
- release tooling
- shared docs and project pages
- pack-loading or pack-contract behavior
- same-control compliance across multiple hosted games
- persona-vs-player orchestration that should work for more than one pack

Treat a change as application work when it affects:

- Aurora rules and scoring
- Aurora enemy behavior
- Aurora stage flow
- Aurora presentation that is not part of the shared shell
- future `Galaxy Guardians` rules and content

## Remaining Platform And Application Boundary Issues

The separation is real, but not perfect yet.

Current remaining seams to keep visible:

- some storage and compatibility names are still Aurora-shaped even when they are effectively platform-owned
- some debug globals and legacy naming still reflect the older single-game architecture
- the game-pack contract is practical but not yet strongly versioned
- the current second-game preview still borrows Aurora-owned rule and theme
  tables while it is non-playable; those must become Galaxy Guardians-owned or
  Platinum-owned before a playable second-game preview
- some shell copy and application copy still need stronger structural validation so release-time regressions are caught automatically
- the second application is still preview-only, so the contract is proven with one real game and one shell-only preview rather than two full implementations

These are not reasons to collapse the separation again.

They are reasons to keep the seam explicit while we strengthen it.

## Platform Future Areas Of Improvement And Notes

As the second game firms up, Platinum should improve in these areas:

### 1. Formal pack schema

We should move from an implicit pack shape to a more explicit, versionable
contract.

Desired outcome:

- clearer required fields
- clearer optional capability flags
- forward-compatible pack evolution
- earlier validation failures during boot

### 1b. Multi-game ingestion workflow

We should get better at ingesting a second classic game lineage by turning
preserved footage, manuals, timing libraries, and comparison artifacts into a
repeatable pack-construction workflow.

Desired outcome:

- a new game can be analyzed in all major aspects with minimal user
  intervention once the reference corpus exists
- Platinum can propose its own extension points where needed instead of
  forcing every new mechanic into Aurora-shaped structures
- the second game grows from a durable reference program rather than from
  ad hoc interpretation

### 2. Storage and migration policy

We should decide more intentionally what is:

- permanently aliased
- migrated once
- never migrated
- clearly platform-owned versus application-owned data

### 3. Shared control compliance

As additional games come online, Platinum should protect a common player-input
contract:

- same basic move / fire semantics
- pack-specific variation only where it is intentional and documented
- harness coverage for any platform-level input differences

This matters both for human players and for future persona-driven play.

### 4. Persona and simulated opponents

Platinum should eventually support more than passive replay personas.

Desired outcome:

- game packs can expose enough action/state annotation for richer personas
- a player can compete against curated persona styles as a `Player 2`-like
  experience
- future learn-by-playing personas can train through simulation while still
  respecting platform contracts and pack-specific rules

### 3. Platform-first documentation discipline

Every meaningful `x.y` release should have:

- refreshed release notes
- refreshed roadmap and readiness docs
- refreshed hosted project guide
- refreshed hosted Platinum guide
- clear testing and gating status
- explicit notes on any remaining platform/application coupling

### 4. Cleaner multi-application proof

The best next platform proof is not a huge second-game launch.

The current first step is a pack-owned `Galaxy Guardians` sneak peek that proves:

- the picker can expose a second application
- preview content can live in the pack contract
- the shell can show alternate identity and status without persisting a
  preview-only trap state
- launch fallback can return players to the playable Aurora cabinet

The next step is a small but playable second application slice that proves:

- the pack contract is real
- platform services stay shared
- application rules remain application-owned
- platform docs still describe reality after a second game exists

## Hosted Documentation Surfaces

The main hosted documentation surfaces are now:

- hosted `/production` project guide:
  - `https://sgwoods.github.io/Aurora-Galactica/project-guide.html`
- hosted `/production` Platinum guide:
  - `https://sgwoods.github.io/Aurora-Galactica/platinum-guide.html`
- hosted `/production` player guide:
  - `https://sgwoods.github.io/Aurora-Galactica/player-guide.html`
- hosted `/production` release dashboard:
  - `https://sgwoods.github.io/Aurora-Galactica/release-dashboard.html`

Equivalent hosted docs should exist on hosted `/dev` and hosted `/beta` as part
of the normal release flow.

## Related Docs

- maintained platform overview and diagrams:
  - `/Users/steven/Documents/Codex-Test1/PLATINUM_ARCHITECTURE_OVERVIEW.md`
- application-side separation and usage:
  - `/Users/steven/Documents/Codex-Test1/APPLICATIONS_ON_PLATINUM.md`
- game boundary audit:
  - `/Users/steven/Documents/Codex-Test1/PLATINUM_GAME_BOUNDARY_AUDIT.md`
- repo technical map:
  - `/Users/steven/Documents/Codex-Test1/ARCHITECTURE.md`
- release and testing gate discipline:
  - `/Users/steven/Documents/Codex-Test1/TESTING_AND_RELEASE_GATES.md`
- launch art direction:
  - `/Users/steven/Documents/Codex-Test1/PLATINUM_LAUNCH_ART_DIRECTION.md`
- forward-looking architecture review:
  - `/Users/steven/Documents/Codex-Test1/PLATINUM_LUECK_REVIEW.md`
