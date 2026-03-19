# Release 0.5.0-alpha.1

## Scope

- release line: `0.5.0-alpha.1`
- phase: `alpha`
- focus: move the project from an early Galaga tribute into a more faithful, testable, and maintainable pre-release build

## Major Outcomes

- built a playable Galaga-inspired game for local Chrome play on macOS
- expanded the game from a small prototype into a larger multi-stage experience
- added keyboard-only gameplay, challenge stages, capture/rescue flow, dual-fighter behavior, fullscreen/ultra scale, arcade-style audio, and local score persistence
- created a local gameplay harness with replay, analysis, batch runs, fidelity scenarios, and automated run import
- moved the codebase from a single-file working style to source modules with a generated served `index.html`
- added release identity, roadmap, and policy infrastructure so future builds are easier to reason about

## Major Product / Gameplay Changes

- stage progression and challenge stages
- capture beam, ship capture, rescue, and dual-fighter mode
- multiple fidelity passes on:
  - Stage 1 timing
  - missile pacing and spread
  - challenge-stage readability
  - later-stage survivability
  - formation spacing and screen composition
  - descent timing
  - sprite look and overall presentation
- Galaga-style high score table and three-letter initials entry
- game-over results screen before initials entry
- challenge-stage group bonus structure
- settings drawer replacing the old floating tools stack

## Tooling / Workflow Changes

- GitHub repo created and Pages deploy enabled
- durable reference storage created under:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/`
- manual and walkthrough research incorporated into planning and issue creation
- local harness added for:
  - seeded scenarios
  - video/json capture
  - analysis summaries
  - batch execution
  - fidelity-specific diagnostics
- automation added for latest-run import/check workflows
- release management added:
  - prerelease SemVer
  - build stamping
  - build manifest
  - product roadmap
  - release policy

## GitHub / Planning Changes

- roadmap milestones were introduced and synced to GitHub milestones:
  - `Core Fidelity Alpha (0.5.x-alpha)`
  - `Later-Stage Depth Alpha (0.6.x-alpha)`
  - `Beta Readiness (0.8.0-beta.1)`
  - `1.0 Candidate`
- manual-backed and fidelity issues were opened for:
  - challenge-stage accuracy
  - results flow
  - attack squadron bonuses
  - capture/rescue edge cases
  - descent speed
  - later-stage variety

## Validation Themes

- repeated real playtests from the user
- repeated harness scenarios for:
  - Stage 3 challenge
  - Stage 4 five-ships
  - Stage 4 survival
  - Stage 1 descent
  - rescue dual-fire
  - second-capture behavior
- build and syntax validation on generated `index.html`
- Pages deployment validation

## Key Insights From This Release

- the harness is already high-value for measurable gameplay problems
- subjective fidelity issues still benefit from live play and reference-video comparison
- Stage 4 losses were primarily collision-driven, not just bullet-driven
- manual-backed rules are useful anchors when memory and feel diverge
- code maintainability needed to improve before fidelity work could scale comfortably
- build identity and roadmap discipline are worth doing before `1.0`, not after

## Transcript Status

- this file is a structured release journal, not a guaranteed verbatim transcript
- if a raw chat export is later captured from Codex, it should be added as:
  - `/Users/stevenwoods/Documents/Codex-Test1/release-history/0.5.0-alpha.1/CHAT_TRANSCRIPT.md`

