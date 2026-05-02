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
- a disabled, evidence-gated gameplay adapter skeleton with its own initial
  state shape
- a dev-only visible preview board renderer that drives the Guardians-owned
  scout-wave runtime, visual catalog, and audio cue catalog without registering
  a playable adapter
- a development-only playable-preview adapter that routes keyboard movement,
  single-shot fire, life loss, reset, and game-over flow into the
  Guardians-owned runtime while keeping the public playable adapter disabled
- a source-manifested Galaxian reference profile with three local source videos,
  contact sheets, and waveforms
- safe public-pack behavior because `Galaxy Guardians` still has no public
  registered gameplay adapter

It does not yet prove:

- a second full gameplay ruleset
- a second complete scoring and stage-flow implementation
- a second complete application harness family
- a public registered gameplay adapter
- release-ready public playability

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
It also has no public gameplay adapter, so it cannot start through Aurora's
gameplay implementation by accident. Its disabled adapter skeleton now cites the
first source-manifested Galaxian profile and a promoted reviewed event log for
the future scout-wave slice, but a playable Galaxy Guardians slice still needs
frame-level timing, measured game-specific pack data, and its own registered
adapter, with any true common behavior promoted into Platinum.

### Preview pack persistence

Preview-only applications must not become a durable trap state. During
development a preview application may also expose an explicit dev-only playable
adapter so we can test the runtime slice before public playability.

Current expected behavior:

- preview application can be opened
- shell can show its promo surface
- `Enter` should fall back to a playable application when preview-only content
  cannot start gameplay
- `Enter` may start a dev-only preview only when the development build exposes
  an explicit dev-preview adapter and the pack still remains publicly
  non-playable

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

The first dev-only runtime slice is now underway as an application-owned model,
not a public adapter. It creates a Galaxian-inspired scout-wave rack, enforces
single-shot firing, emits promoted event names, scores against a Guardians-owned
alien catalog, and keeps Aurora capture, challenge, dual-fighter, and scoring
state out of the model.

Galaxy Guardians also now owns its first identity catalogs rather than borrowing
Aurora's look or sound names. The visual catalog names the `Signal Flagship`,
`Signal Escort`, `Signal Scout`, and `Guardian Interceptor` silhouettes. The
audio cue catalog names the start chirp, formation pulse, single-shot player
fire, enemy shot, scout/flagship dive pressure, escort join, hit cues,
wrap/return cue, and future player-loss cue. These are still synthesized
starting points, but they give the 0.1 slice separate application-owned
contracts before any public playability.

The runtime model now has a visible dev-only preview renderer. It draws the
Guardians scout-wave board, single player shot, alien silhouettes, and preview
HUD from Guardians-owned runtime state and catalog IDs while keeping the pack
non-playable. The compact cabinet harness verifies the renderer by checking the
preview mode, registered renderer key, visual IDs, audio cue IDs, and distinct
signal palette. The renderer is now registered through a Platinum game-board
renderer registry, so the top-level render loop no longer branches on a
specific game by name.

The next application proof is maturing the first dev-only playable slice. It
now has the initial lifecycle path, but the behavior is still intentionally
development-scoped until the measured 0.1 scout-wave evidence is stronger. The
first aggregate 0.1 candidate gate is now source-controlled so future preview
readiness claims can cite one durable artifact instead of reassembling the
visual, audio, movement, threat, and boundary evidence from memory.

- formation rack
- dives
- flagship and escort behavior
- scoring
- single-shot constraint
- wrap-around threat
- life loss and game over flow

Current development-only playable-preview coverage:

- `src/js/13-galaxy-guardians-gameplay-adapter.js` owns the dev-only start and
  update adapter for `Galaxy Guardians`
- `src/js/13-galaxy-guardians-runtime.js` owns the runtime state, events, player
  shot, life-loss, reset, and game-over mechanics
- `src/js/13-gameplay-adapter-registry.js` keeps public playable adapters and
  dev-preview adapters in separate registries
- `reference-artifacts/analyses/galaxy-guardians-identity/identity-baseline-0.1.json`
  persists the first 0.1 visual/audio identity contract so future sprite,
  movement, and cue edits have a durable artifact trail
- `reference-artifacts/analyses/galaxy-guardians-identity/formation-entry-0.1.json`
  persists the first runtime entry/settle contract for promoted Galaxian entry
  events, including start, settle, rack-complete, and first-dive-after-rack
  bands
- `tools/harness/check-galaxy-guardians-formation-entry.js` proves the runtime
  starts aliens off-rack, settles them into the scout-wave rack, and prevents
  the first dive from starting before rack completion
- `reference-artifacts/analyses/galaxy-guardians-identity/movement-pacing-0.1.json`
  persists the first movement and pressure pacing contract for solo dives,
  flagship/escort attacks, and bottom wrap/return cycles
- `reference-artifacts/analyses/galaxy-guardians-identity/threat-scoring-0.1.json`
  persists the first lower-field threat and application-owned scoring contract
  for enemy shots, player loss, and formation/dive hit values
- `reference-artifacts/analyses/galaxy-guardians-identity/candidate-0.1.json`
  persists the first aggregate 0.1 candidate gate for owned visual IDs, runtime
  cue IDs, promoted event names, public-playable boundaries, and forbidden
  Aurora capabilities
- `tools/harness/check-galaxy-guardians-0-1-candidate.js` proves the aggregate
  0.1 gate without launching a browser by deterministically forcing scout,
  escort, flagship, enemy-shot, wrap-return, player-loss, and game-over runtime
  evidence
- `tools/harness/check-galaxy-guardians-identity-baseline.js` proves the
  identity artifact matches the pack-owned sprite rows, audio cue catalog, audio
  theme cues, runtime cue map, and dev-preview audio history
- `tools/harness/check-galaxy-guardians-movement-pacing.js` proves the runtime
  rules match the persistent movement artifact and that flagship dives attach
  real escort craft in sampled runtime state
- `tools/harness/check-galaxy-guardians-threat-scoring.js` proves the runtime
  rules match the persistent threat/scoring artifact and that enemy-shot
  pressure, player loss, and owned point values are active
- `tools/harness/check-galaxy-guardians-playable-preview.js` proves keyboard
  fire, life loss, reset, game over, owned audio cue IDs, and public-adapter
  isolation

That is enough to test the platform without prematurely shipping a second game.

Before the slice becomes playable, refine the existing Galaxian evidence into
runtime-ready rules:

- frame-level formation-entry and dive timing bands
- flagship and escort behavior windows
- scoring table and single-shot constraints
- an application-owned harness plan for the first scout-wave slice
- visual/audio identity notes that are distinct from Aurora, with the current
  catalog entries refined by frame-level and waveform evidence before public
  playability

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
