# External Reference: `hoorayimhelping/Galaga5`

Source:

- repository:
  - `https://github.com/hoorayimhelping/Galaga5/`
- inspected snapshot:
  - cloned on `2026-03-22`

Role in this project:

- external comparison point for another JavaScript/HTML5 Galaga tribute
- useful mainly for implementation patterns and presentation ideas
- not a direct fidelity source for original Galaga rules

## What it is

`Galaga5` is a small HTML5 canvas Galaga interpretation built in plain
JavaScript with no build step. It uses:

- one `index.html`
- a handful of script files loaded directly in the page
- a sprite sheet image
- two stacked canvases:
  - one for the starfield/background
  - one for gameplay rendering

The project reads like an older hobby implementation:

- handwritten engine loop
- handwritten entity classes
- no packaging/tooling
- limited stage logic

## What it does

From the code inspection:

1. It renders a player ship, enemies, bullets, particles, and a starfield.
2. It supports basic movement, shooting, enemy waves, collision detection, and
   pausing.
3. It includes a simple wave manager and a small enemy roster.
4. It appears to be more of an early playable interpretation than a
   feature-complete Galaga recreation.

Important limitation:

- the repo does **not** appear to include capture/rescue, challenge stages,
  boss damage states, authentic scoring systems, or the richer stage flow we
  already have in this project.

## Architecture summary

Main files:

- `index.html`
  - script-loader page
  - bootstraps the game directly in the browser
- `GameEngine.js`
  - central update loop
  - player/enemy/bullet/collision orchestration
- `Renderer.js`
  - canvas drawing
  - starfield background generation
- `EnemyManager.js`
  - wave setup and movement helpers
- `Enemy.js`
  - enemy classes and sprite bindings
- `Player.js`
  - player ship object

Overall style:

- object-prototype JavaScript
- single central engine
- simple rectangle collisions
- entity arrays updated each frame

## What looks reusable in spirit

These are not copy-paste recommendations, but they are useful ideas:

1. Background/render separation
   - keeping the starfield on a dedicated background canvas is a clean idea
   - we already have good performance, so this is not urgent, but the pattern
     is sound

2. Simple engine legibility
   - the repo is easy to read because update/render responsibilities are
     obvious
   - this reinforces our own investment in `SOURCE_MAP.md` and gameplay
     comments

3. Sprite-sheet based rendering workflow
   - useful as a reminder that a future art pass could use explicit source
     sprite extraction if we ever move beyond our current pixel patterns

## What is *not* a good reuse target

For our project goals, most of the actual gameplay logic should **not** be
reused:

1. Enemy behavior is much simpler than what we need.
2. Collision logic is broad rectangle-based and not tuned for arcade fidelity.
3. There is no evidence of original-Galaga capture/rescue depth.
4. Stage progression is much lighter than our current four-stage `1.0` target.
5. The repo is more of a general clone/tribute than a manual-backed fidelity
   effort.

So:

- useful as a lightweight implementation reference
- not useful as a source of truth for original Galaga behavior

## Best takeaways for our project

1. Keep our own architecture docs and source map strong
   - that is one of the real strengths of simple game repos like this

2. If we want a later art/render cleanup
   - revisit layered rendering and sprite handling

3. Do not treat this repo as fidelity evidence
   - continue using:
     - manual
     - reference footage
     - our own harness metrics

## Bottom line

`Galaga5` is a useful external artifact as:

- a compact JavaScript game-architecture example
- a reminder of how readable small canvas projects can be

It is **not** strong evidence for:

- Galaga rules
- scoring
- capture behavior
- challenge-stage authenticity
- release-target gameplay balance

For this project, it is best kept as a lightweight implementation reference,
not as a gameplay-spec source.
