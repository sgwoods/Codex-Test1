# Aurora `1.2.4` Patch Plan

This document defines the narrow patch path if Aurora needs a quick public
follow-up before the broader `1.3.0` "Fidelity and Trust" family is ready.

## Intent

Use `1.2.4` only for a small, high-confidence production patch.

It should be:

- safer
- more trustworthy
- easier to explain than a broad polish release

It should **not** become a backdoor `1.3.0`.

## Patch Theme

Working theme:

- `1.2.4` "Trust And Stability"

That means:

- player-visible correctness fixes
- input and runtime trust fixes
- no broad movement retuning
- no large audio-identity redesign
- no level-expansion bundle
- no major shell/UI rework

## Current Candidate Fixes

### Included now

1. Input reset / attached-keyboard trust fix

- blur and other non-manual input resets now clear horizontal motion **and**
  hold movement briefly so the ship does not keep drifting on the next frame
- this directly addresses the remaining "keyboard feels attached / ship keeps
  moving after blur" failure caught by the current input-mapping harness
- issue family:
  - `#149` input/keyboard side

Verification:

- `npm run harness:check:input-mapping`

2. Pilot recent-flight score refresh fix

- signed-in pilot records now merge remote rows with fresh local scoreboard rows,
  not just remote rows and replay rows
- that lets `Pilot Information` show the newest local flight score immediately
  even when replay generation or remote score refresh has not caught up yet
- issue family:
  - `#171` pilot recent flight scores not updating

Verification:

- `npm run harness:check:pilot-recent-scores-refresh`

3. Overlay screen-switch dismissal fix

- switching directly between dock surfaces now routes `Pilot Information`
  through the same overlay-closing path as the other dock panels
- that makes the previously focused overlay dismiss cleanly before the next one
  opens, instead of allowing the account panel to remain in focus while a new
  panel is selected
- issue family:
  - `#173` screen switch doesn't dismiss in-focus info

Verification:

- `npm run harness:check:overlay-screen-switching`

4. Game picker wording and Platinum dock cleanup

- the game-picker selector no longer surfaces the confusing `online • wait mode`
  wording on the dock status line
- the in-run guard text now tells the player to finish the current run instead
  of talking about wait mode
- the lower-left Platinum dock button now uses the platform mark by itself so
  the icon fits the space cleanly without extra overlapping text
- issue families:
  - `#175` remove Online Wait Mode text from game selector
  - `#177` fix Platinum icon text overlap

Verification:

- `npm run harness:check:dock-buttons`

5. Production Root-mode ship-adjustment preservation fix

- production still locks the visible start-state controls to the shipped
  defaults
- leaving Root mode now preserves the hidden custom ship-adjustment values
  instead of wiping them back to defaults
- re-entering Root mode restores those saved adjustments cleanly
- issue family:
  - `#179` developer tools Root mode defaults on ship adjustments

Verification:

- `npm run harness:check:production-developer-lock`

6. Persistent bottom build-stamp guide entry point

- the bottom-center version/build indicator no longer exposes a hide button
  that lets it disappear during normal play
- it now stays persistent on the main screen and acts as a direct entry point
  into the in-game project guide / release-notes surface
- keyboard activation is supported as well, so the stamp works as an accessible
  bottom-of-screen guide affordance rather than just passive text
- issue family:
  - `#176` keep main-screen version indicator persistent and dismissable

Verification:

- `npm run harness:check:build-stamp-persistence`

7. High-score build info simplification

- the high-score panel no longer surfaces the full verbose build metadata
- each row now shows the clean release build identifier and the score date only
- this keeps the leaderboard readable while still preserving release context
- issue family:
  - `#172` simplify high score screen build info

Verification:

- `npm run harness:check:leaderboard-build-info`

8. Password visibility toggle on pilot sign-in

- the pilot access form now includes an eye button beside the password field
- recovery mode also gets the same treatment for confirmation input
- the toggle state stays aligned with the field disabled/recovery state
- issue family:
  - `#178` add show password eye icon on Aurora Galactica login

Verification:

- `npm run harness:check:password-visibility-toggle`

9. Pilot Information reference cleanup

- the Pilot Information panel now reads as a tighter quick-reference surface
  instead of a text-heavy mini-manual
- copy is shorter, the panel spacing is tighter, and a direct player-guide
  button is available for deeper reading
- issue family:
  - `#174` refactor Pilot reference screen with excessive text

10. Local leaderboard clarity and reopen behavior

- the local leaderboard now makes its scope explicit as a local top-10 surface
  for completed runs
- if the newest completed local run does not make that top 10, the panel now
  surfaces it in a dedicated "Latest completed run" banner instead of making it
  disappear silently
- reopening the leaderboard after switching score views now resets the panel
  scroll position so the active view and controls are easier to understand
- issue family:
  - beta-local leaderboard confusion / score-view reopen regression

### Already green and likely better treated as verified closures

These do not currently need new code for `1.2.4`, but they are useful to cite
when deciding whether the patch line is trustworthy:

1. Dual-fighter final-life survivor behavior
2. Carried/captured fighter suppression during game-over/results overlays

Verification:

- `npm run harness:check:dual-final-life-survivor`
- `npm run harness:check:game-over-carry-suppression`

### Good next patch candidates if a few more true production bugs appear

Keep `1.2.4` focused on bugs like:

- boss injury / boss-hit correctness
- capture/carry rendering edge cases
- late-run runtime-hardening follow-up
- production-safe input, focus, or shell trust bugs

Avoid pulling in work that really belongs to:

- movement fidelity tuning
- audio identity redesign
- stage-depth expansion
- replay/video publishing growth

Those belong to `1.3.0` or later release families.

## Entry Rule

Use the patch path if:

- there are 2-5 small, high-confidence trust fixes
- each one is easy to explain in production notes
- they improve the shipped line without reopening feel or balance widely

If that bar is not met:

- keep `1.2.3` stable
- continue toward `1.3.0`

## Verification Set

Minimum patch verification:

- `npm run build`
- `npm run harness:check:input-mapping`
- `npm run harness:check:pilot-recent-scores-refresh`
- `npm run harness:check:leaderboard-build-info`
- `npm run harness:check:leaderboard-local-view`
- `npm run harness:check:password-visibility-toggle`
- `npm run harness:check:overlay-screen-switching`
- `npm run harness:check:dock-buttons`
- `npm run harness:check:production-developer-lock`
- `npm run harness:check:build-stamp-persistence`
- `npm run harness:check:dual-final-life-survivor`
- `npm run harness:check:game-over-carry-suppression`
- `npm run harness:check:close-shot-hit`
- `npm run harness:check:persona-stage2-safety`

If the patch changes any production-facing settings, shell behavior, or account
surfaces, also run the relevant surface checks:

- `npm run harness:check:dev-candidate-surfaces`
- `npm run harness:check:production-developer-lock`

## Release Decision

If the patch bundle stays narrow and clean:

1. refresh hosted `/dev`
2. review the patch line briefly
3. refresh hosted `/beta`
4. verify hosted `/beta`
5. approve and promote to hosted `/production`

If the work starts to become a broader polish bundle, stop calling it `1.2.4`
and roll it into the `1.3.0` track instead.
