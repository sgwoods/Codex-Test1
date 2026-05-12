# Platinum Flashy Feature Roadmap

This document tracks three high-visibility platform features that should be
developed as separate branches because they touch different risk surfaces:
remote media publishing, shell media playback, and persona-driven gameplay.

The shared goal is to make Platinum feel more alive without weakening the
conformance program, release discipline, or game/platform boundary.

## Branch Strategy

Use separate short-lived branches from current `main`:

- `codex/platform-high-score-video-publishing`
- `codex/platform-arcade-music-mode`
- `codex/platform-player-two-persona-mode`

Do not stack these branches on each other unless a later branch explicitly
depends on a merged platform contract.

Recommended implementation order:

1. `Arcade Music` shell mode, because it is the smallest user-visible platform feature and can be kept opt-in.
2. `High-score video publishing` foundations, because the user value is high but the backend, authorization, privacy, and quota model must be correct.
3. `Player Two` persona mode, because it changes gameplay and needs the strongest persona and scoring guardrails.

## Feature 1: High-Score Video Publishing

### User Story

When a signed-in and authorized pilot reaches the beta or production top 10,
the completed game instance can be published to a shared game video channel.
The trophy high-score page should show that the score has video evidence and
allow the video to play inline, similar to the current local replay panel.

Only human player scores are eligible for leaderboard credit.

### Platform Scope

Platinum owns the shared service contract:

- pilot authentication and authorization
- beta/production lane gating
- score eligibility and top-10 verification
- replay-video capture metadata
- upload queueing and publication status
- trophy-page video display contract

Each game owns:

- game-specific replay/session metadata
- game-specific event logs and score semantics
- any application-specific consent text or display labels

### Architecture Direction

The browser should not hold YouTube upload credentials.

The intended pipeline is:

1. Browser records the completed session using the existing replay/video substrate.
2. Score submission records the human score and build/lane metadata.
3. If the score is top-10 eligible, signed-in, authorized, and on beta or production, the client submits a publish request.
4. A backend function validates the authenticated user, score row, lane, top-10 status, replay metadata, and authorization.
5. The backend stores a durable video artifact or queues a YouTube upload using server-held credentials.
6. Publication status is written back to a score-video record.
7. The trophy high-score page renders status states and, when available, an inline video player.

Prefer a separate `score_videos` table or equivalent metadata record rather
than overloading the core score row too early. The score row can link to the
published video record once the schema is stable.

Expected status values:

- `not_eligible`
- `eligible`
- `queued`
- `processing`
- `published`
- `failed`
- `revoked`

### Release And Safety Gates

This feature must not ship to beta or production until:

- signed-in-only and authorized-user gates are automated
- beta/production-only publishing is automated
- local/dev lanes cannot publish by accident
- server-side validation rejects forged score/video claims
- YouTube credentials are never present in client assets
- inline playback handles unavailable, pending, failed, and revoked videos
- score submission still works when video publishing is unavailable
- Arcade Music, if enabled, does not create unintended copyrighted audio inside posted gameplay video unless that is an intentional authorized mode

### Success Measures

- top-10 eligible signed-in score produces a durable video status record
- trophy panel can show published video inline
- non-eligible, unsigned, unauthorized, and local/dev attempts are rejected
- release preflight can prove no client-side upload secret exists
- player-visible failure state is clear and does not block normal scoring

## Feature 2: Arcade Music Mode

### User Story

Players can turn on an optional `Arcade Music` mode from the right dock. The
button sits above the game mute button, uses a music icon, and exposes the hover
label `Arcade Music`.

This is separate from Aurora's reference audio conformance work. It is a
platform ambience feature, not evidence that the game audio itself is more
conformant.

### Platform Scope

Platinum owns:

- dock control placement and state
- playlist/player configuration
- user-initiated playback policy
- persisted preference
- interaction with game mute, pause, and recording states
- shell documentation and release gates

Games may expose:

- pack-preferred playlist IDs
- whether music should be allowed, discouraged, or disabled for a mode
- game-owned copy for themed music variants

### Architecture Direction

Use a shell-owned music controller that can load a configured YouTube playlist
through an embedded player after a user gesture. Keep the mode opt-in and
separate from game audio mute.

Required states:

- `off`
- `loading`
- `playing`
- `paused`
- `unavailable`

The control should be safe when YouTube is blocked, offline, or unavailable.
The player should not silently autoplay before the player asks for it.

### Release And Safety Gates

This feature must not ship until:

- dock button exists above mute on desktop and mobile layouts
- hover/title says `Arcade Music`
- game mute still controls game audio only
- Arcade Music state is persisted without forcing playback on load
- playback failures are clear and non-blocking
- recording/high-score publishing policy is explicit
- conformance dashboards do not treat playlist music as reference game audio

### Success Measures

- player can toggle music on/off from the dock
- shell remains visually contained and keyboard accessible
- game audio conformance measurements remain isolated from platform ambience
- no replay, leaderboard, or pause-flow regression

## Feature 3: Player Two Persona Mode

### User Story

A signed-in human pilot can start a game in either one-player mode or
`Player Two` mode. In Player Two mode, the human chooses a generic testing
persona as the opponent. The persona should vary slightly run to run so it feels
alive, while still being logged and reproducible enough for evidence.

Only the human player's score can be submitted to leaderboards.

### Platform Scope

Platinum owns:

- signed-in-only mode gating
- generic persona identities
- player-versus-persona start selection
- persona jitter seed and run metadata
- score-submission exclusion for non-human players
- shared UI language and shell controls

Each game owns:

- how the generic personas drive that game's controls
- which game states/persona actions are available
- opponent scoring display rules
- game-specific fairness and difficulty expectations

### Architecture Direction

Build the feature in phases:

1. Start-mode selection and signed-in gate.
2. Generic persona selection using Beginner, Intermediate, Expert, and Professional labels.
3. Runtime persona controller adapter for the active game.
4. Logged per-run skill jitter, seeded enough to reproduce a run.
5. Human-only score submission guard.
6. Player-facing summary that clearly separates human score from persona performance.

For the first playable version, prefer a conservative opponent model that proves
selection, logging, and scoring safety before adding more complex simultaneous
collision or two-ship mechanics.

### Release And Safety Gates

This feature must not ship until:

- unsigned users cannot start Player Two mode
- persona score is never submitted as a human score
- run logs record persona identity and jitter seed
- start screen and game-over surfaces clearly identify the mode
- persona behavior remains inside game-owned adapters
- Aurora harnesses prove no single-player regression
- persona distribution evidence remains separate from human leaderboard evidence

### Success Measures

- signed-in player can choose a persona opponent
- persona variation is visible but bounded
- human score remains the only leaderboard-eligible score
- persona evidence improves the broader conformance loop
- the same platform contract can be reused by future games

## Cross-Feature Release Position

These features are flashy, but they should not bypass normal gates.

They belong to the post-`1.3.0` roadmap as follows:

- Arcade Music can be an early opt-in platform polish feature if it stays isolated from conformance audio and recording policy.
- High-score video publishing is a natural `1.5.0` shared-video evidence milestone because it turns player achievement into durable public evidence.
- Player Two persona mode is a later platform/gameplay milestone because it depends on stronger persona adapters, score separation, and game-owned behavior contracts.

The conformance program should treat all three as evidence opportunities:

- Arcade Music tests shell media boundaries.
- High-score video publishing tests replay evidence and pilot trust.
- Player Two mode tests whether personas are mature enough to become a real gameplay feature, not only an internal harness tool.
