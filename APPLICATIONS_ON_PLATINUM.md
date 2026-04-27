# Applications On Platinum

This document describes the application layer that sits on top of the
`Platinum` platform.

Use it when the question is not "what does the platform own" but instead:

- which games currently exist on Platinum
- what a game application is responsible for
- where platform and application boundaries are still imperfect
- how future applications should use the platform without re-entangling it

## Current Applications

### Aurora Galactica

`Aurora Galactica` is the first real application on Platinum.

Aurora owns:

- player rules and scoring
- stage progression and challenge cadence
- capture and rescue logic
- dual-fighter behavior
- enemy behavior and boss identity
- Aurora-specific copy, stage mood, and content
- Aurora gameplay harnesses

Aurora should remain the reference application when we ask:

- does the platform still host a real shipped game cleanly
- can application-specific rules evolve without breaking the shell or release lanes

### Galaxy Guardians

`Galaxy Guardians` is currently a preview-only application shell and second-game
sneak peek.

Right now it proves:

- application selection
- preview-only behavior inside the platform
- alternate identity and framing
- future second-game positioning
- pack-owned preview content for the picker and preview modal
- pack-owned placeholder timing, audio, visual, cadence, layout, and scoring
  tables that do not directly borrow Aurora tables
- safe fallback to `Aurora Galactica` when a player tries to launch gameplay

It does not yet prove:

- a second full gameplay ruleset
- a second complete scoring and stage-flow implementation
- a second complete application harness family
- a registered gameplay adapter

That is intentional.

## Application Responsibilities

A Platinum application should own:

- gameplay rules
- scoring and stage progression
- game-specific presentation and content
- application identity on the front door such as title and feature line
- its own harnesses for game behavior
- optional shell preferences that remain within the platform shell contract

A Platinum application should not own:

- the release ladder
- the shared hosted docs system
- shared auth or score transport policy
- shell layout regions
- lane publishing rules
- platform-only boot and pack-selection behavior
- startup and wait-mode shell copy that promotes the platform or other applications

## Game-To-Game Isolation Rule

Applications must not depend on each other's game-specific implementation.

Aurora Galactica may not be the hidden source of Galaxy Guardians mechanics,
scoring, aliens, sound cues, visual identity, event vocabulary, or gameplay
harness behavior. Galaxy Guardians should likewise never become a source of
Aurora behavior. If both applications need the same thing, we should raise that
thing into Platinum and expose it through a deliberate platform contract.

Allowed reuse:

- Platinum shell APIs
- Platinum input contracts
- Platinum audio engine capabilities
- Platinum event/replay/session substrate
- Platinum service adapters
- Platinum pack schema and capability flags
- documented platform harness helpers

Disallowed reuse:

- one game's scoring table inside another game
- one game's enemy movement model inside another game
- one game's capture, rescue, dual-fighter, challenge, flagship, escort, or
  stage progression logic inside another game
- one game's visual or sound identity catalog as another game's default
- one game's application harnesses as proof of another game's behavior

See also:

- `/Users/steven/Documents/Codex-Test1/PLATINUM_GAME_BOUNDARY_AUDIT.md`

## Current Boundary Notes

The boundary is real, but these coupling areas still deserve attention:

### Direct game-to-game sharing risk

The current second-game preview is safe because it is not playable, and its
preview pack now owns placeholder data instead of borrowing Aurora-owned tables.
It also has no gameplay adapter, so it cannot start through Aurora's gameplay
implementation by accident. A playable Galaxy Guardians slice still needs
measured, game-specific pack data and its own gameplay adapter, with any true
common behavior promoted into Platinum.

### Preview pack persistence

Preview-only applications must not become a durable trap state.

Current expected behavior:

- preview application can be opened
- shell can show its promo surface
- `Enter` should fall back to a playable application when preview-only content cannot start gameplay

### Front-door copy ownership

The shell front door now needs a firmer split than it had during the
single-game era.

The direction is:

- platform copy explains the host, hosted lanes, docs, and cross-application surfaces
- application copy explains gameplay, identity, and game-specific flavor
- preview-only applications may override platform copy only when the override is still about preview status rather than gameplay rules

### Shared naming residue

Some older names remain Aurora-shaped even when they are now functionally part
of the platform.

These should be treated as transitional, not as permission to blur the
boundary again.

The current code-review snapshot for this seam is also captured in:

- `/Users/steven/Documents/Codex-Test1/PLATINUM_INTERFACE_REVIEW.md`

## How Future Applications Should Arrive

A new Platinum application should ideally arrive in stages:

1. shell preview
- name
- framing
- coming-soon or preview status

2. minimal playable slice
- enough real rules to prove the platform seam
- not a rushed full public release

3. application-owned harnesses
- rules and scoring checks
- outcome/distribution checks if difficulty matters

4. polished public release path
- only after the application is truly ready

## Current Application Outlook

### Aurora next application work

Near-term Aurora application work should now focus on:

- movement fidelity
- audio identity polish
- gameplay trust fixes such as boss/capture/carry edge cases
- replay and pilot-surface improvements
- shell and overlay polish that remains application-owned

### Galaxy Guardians next proof

The current sneak peek is intentionally still non-playable. It should be used to
keep the Platinum pack contract honest while the second game is still being
specified.

The best next application proof is a dev-only playable slice that includes:

- formation rack
- dives
- flagship and escort behavior
- scoring
- single-shot constraint
- wrap-around threat
- life loss and game over flow

That is enough to test the platform without prematurely shipping a second game.

Before that slice starts, capture the reference evidence needed for a Galaxian-
style ruleset:

- preserved gameplay clips
- formation-entry and dive timing notes
- flagship and escort behavior notes
- scoring table and single-shot constraints
- a small harness plan for the first scout-wave slice

Use the reusable ingestion process in:

- `CLASSIC_ARCADE_INGESTION_FRAMEWORK.md`

That means the first scout-wave slice should be traceable through source
manifest, clipped window, event log, semantic model, correspondence target, and
harness evidence. The point is to learn `Galaxy Guardians` and also prove the
method we will reuse for later games.

## Related Docs

- platform overview and ownership:
  - `/Users/steven/Documents/Codex-Test1/PLATINUM.md`
- platform diagrams:
  - `/Users/steven/Documents/Codex-Test1/PLATINUM_ARCHITECTURE_OVERVIEW.md`
- repo technical map:
  - `/Users/steven/Documents/Codex-Test1/ARCHITECTURE.md`
- release and testing discipline:
  - `/Users/steven/Documents/Codex-Test1/TESTING_AND_RELEASE_GATES.md`
