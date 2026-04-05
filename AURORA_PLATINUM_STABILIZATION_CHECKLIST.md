# Aurora On Platinum Stabilization Checklist

This checklist defines what “stable enough to rerelease Aurora on Platinum”
means.

The goal is not to invent a new game during the platform release. The goal is:

- keep `Aurora Galactica` equivalent to the current trusted production
  experience
- make `Platinum` visible as the host platform
- keep `Galaxy Guardians` clearly preview-only in production

## Release Intent

Target public state:

- `Aurora Galactica`
  - fully playable
  - equivalent in trust and feel to the current production line
- `Platinum`
  - visible host platform identity
  - visible shell framing
  - visible platform splash
- `Galaxy Guardians`
  - `Coming Soon`
  - preview only
  - not playable in production

## Definition Of Equivalent To Production

Aurora should match the current shipped production contract on:

- control mapping and movement feel
- stage flow and transition timing
- challenge-stage feel
- capture / rescue / dual-fighter behavior
- score submit and pilot/account flows
- replay and feedback flows
- shell trust and no obvious HUD interference

This does not mean every pixel or timing value must be identical.

It does mean:

- no obvious player-visible regressions
- no trust regressions in account, score, replay, or feedback flows
- no shell/platform features that make the game feel less finished than the
  current production lane

## Blockers For The Platinum Aurora Rerelease

These should be treated as rerelease blockers if they are still broken:

### Gameplay / trust blockers

- movement or input drift from the current production contract
- challenge-stage drift that materially changes success/failure feel
- capture/rescue regressions
- score-submit regressions
- pilot/account panel regressions
- feedback path regressions
- replay launch/open regressions

### Shell / platform blockers

- Platinum button not working
- Platinum splash not opening/closing correctly
- game picker not working
- `Galaxy Guardians` preview launching as if it were playable
- popup surfaces clipping or escaping the frame
- HUD/shell overlays interfering with core play readability

## Follow-Up Work, Not Required To Ship The Platform Framing

These remain important, but should not block the Platinum-framed Aurora
rerelease unless they regress further:

- `#140`
  - challenge stages should behave like bonus stages rather than counting in
    numbered stage progression
- extra-ship visibility/audio polish
- dual-ship final-life edge case
- deeper Aurora Game Designer extraction work

## Required Evidence Before Promotion

### Core automated checks

- `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/check-input-mapping.js`
- `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/check-new-game-reset.js`
- `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/check-capture-lifecycle.js`
- `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/check-challenge-motion-profile.js`
- `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/check-remote-score-submit.js`
- `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/check-pilot-records-panel.js`
- `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/check-feedback-submit-path.js`
- `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/check-platinum-pack-boot.js`
- `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/check-game-picker-shell.js`
- `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/check-popup-surfaces.js`
- `/Users/stevenwoods/Documents/Codex-Test1/tools/harness/check-dock-button-actions.js`

### Manual checks

- verify the Platinum shell surfaces once in live local dev
- verify Aurora still feels production-equivalent in a short real play pass
- verify `Galaxy Guardians` clearly reads as `Coming Soon`

## Minimal Second-Game Slice After The Rerelease

The next useful dev-only platform proof should be a minimal playable
`Galaxy Guardians` slice.

It should include:

- formation rack
- enemy dives
- flagship + escort behavior
- single-shot constraint
- scoring model
- wrap-around threat
- life loss / game over / results flow

It should explicitly not include yet:

- capture / rescue
- dual fighter
- challenge stages
- rich boss personalities
- production polish

That gives us a second ruleset that is different enough to prove the platform,
without pretending the second game is ready to ship.

## Decision Rule

If a change helps `Platinum` host games better in general:

- it belongs in the platform conversation

If a change mostly affects Aurora’s own rules, content, stage logic, boss
identity, or scoring:

- it should stay in the Aurora/game-pack lane
