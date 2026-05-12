# Galaxy Guardians Playable 0.1 Branch Plan

Branch: `codex/imacm1-guardians-playable-0-1`

Updated: May 12, 2026

## Purpose

This branch turns `Galaxy Guardians` from a preview-first second-cabinet slice
into a minimally complete, fully playable one-level game on Platinum.

The goal is not to over-claim polish. The goal is to make the game complete
enough that Platinum changes can be validated against two actual games instead
of one shipped game plus one preview shell.

That means this branch should prioritize:

- game-owned score identity
- proper one-level completion and ending flow
- clear game-over and restart behavior
- basic pilot/replay/scorebook separation where the platform currently assumes
  Aurora-only scores
- harnesses that prove the second game remains playable as platform work
  continues

## Current Truth

Current shipped truth on `main`:

- hosted `/production` still honestly frames `Galaxy Guardians` as a preview
  application
- the runtime already owns player movement, single-shot fire, alien scoring,
  life loss, stage advance, and game-over events
- the platform score/pilot/replay surfaces still read as shared-Aurora-first
  rather than game-separated
- the preview shell copy still says "DEV PREVIEW COMPLETE" and still treats the
  game as a guarded preview slice rather than a minimally complete game

This branch should not rewrite production history. It should change the source
and then earn a future release-story update.

## Why This Matters

Two playable games materially improve platform validation:

- platform UI changes can be checked against more than one runtime
- score, pilot, replay, settings, and shell assumptions stop hiding
  Aurora-specific coupling
- release work has to prove that the platform still hosts multiple games
  coherently
- future ingestion work benefits from a real second-game operational path, not
  only a preview card

Even a one-level game is enough to create useful product pressure if the score
path, ending, restart loop, and game identity are real.

## Branch Ownership

This branch should focus on gameplay completeness and game-owned operational
surfaces.

Primary ownership for this branch:

- `Galaxy Guardians` one-level completeness
- own score identity and leaderboard separation
- proper win/game-over/end-state flow
- branch-local docs and harnesses that define "playable 0.1"

Assumed separate work on the other machine:

- deeper ingestion, conformance, pacing, audio, and graphics refinement
- broader Galaxian-style evidence work
- other non-overlapping experimental branches

Coordination rule:

- prefer edits that make game completeness and platform separation cleaner
  without reworking measured conformance artifacts unnecessarily
- avoid reverting or broadening into the other machine's likely conformance
  lane unless a merge requires it later

## Playable 0.1 Definition

For this branch, `Galaxy Guardians` counts as a minimally complete playable
game when all of the following are true:

1. It launches as a real playable game through Platinum.
2. It has a self-contained one-level loop rather than "preview complete"
   placeholder messaging.
3. It can end cleanly in at least two ways:
   - player loses all lives
   - player completes the one-level objective
4. It records scores as `Galaxy Guardians` scores, not as generic Aurora-shaped
   or mixed-game rows.
5. Its result, replay, and pilot-facing metadata identify the game correctly.
6. It has targeted harnesses that fail if platform work breaks the second game.

## Priority Order

### 1. Own Score Identity

First priority:

- add game identity to local score rows
- add game identity to remote score submission payloads
- separate leaderboard/pilot views by active game or explicit game filter
- prevent Aurora and Guardians scores from silently mixing

Observed current gap:

- the shared score-submit payload in `src/js/11-leaderboard-service.js` sends
  initials, score, stage, and build, but not a game key
- current replay/session metadata is also still generic enough that game-owned
  scorebook separation is not guaranteed

### 2. Proper One-Level Ending

Second priority:

- replace `DEV PREVIEW COMPLETE` placeholder end-state with real
  `MISSION COMPLETE` / `GAME OVER` style flow
- define the one-level success condition explicitly
- stop looping into an ambiguous preview state after the first clear
- keep restart and game-selection behavior clean

### 3. Game-Owned Pilot And Replay Context

Third priority:

- ensure replay/session metadata carries the game key cleanly
- ensure pilot record summaries can attribute a run to `Galaxy Guardians`
- make version-aware, game-aware score inspection possible

### 4. Public/Game Framing

Fourth priority:

- once the above is true, update pack metadata, branch docs, and future release
  notes to treat Guardians as a minimally complete playable game rather than a
  shell-only preview

## Suggested First Implementation Steps

1. Add explicit `gameKey` and game label fields to score rows, replay/session
   metadata, and remote score payloads.
2. Add active-game filtering or per-game views to the shared leaderboard and
   pilot records surfaces.
3. Replace the current Guardians placeholder game-over copy with real
   loss/completion result states.
4. Define a first-wave or single-stage completion condition and make it
   user-visible.
5. Add harnesses for:
   - Guardians score isolation
   - Guardians proper completion ending
   - Guardians proper loss ending
   - Guardians replay/session metadata identity
   - Platinum two-game smoke after shell/platform changes

## Non-Goals For This Branch

- full multi-stage Galaxian depth
- full conformance closure
- full public second-game marketing push
- deep audio/visual identity perfection
- replacing the other machine's evidence/conformance branch

This branch should produce a real playable game, not a finished second release.

## Exit Standard

This branch is ready to merge when:

- `Galaxy Guardians` is honestly a minimally complete playable one-level game
- own scores and result history no longer bleed into Aurora surfaces
- basic loss/completion/end-state behavior is clear and stable
- the new harnesses pass from a clean source state
- the docs explain the new reality without pretending the game is more mature
  than it is
