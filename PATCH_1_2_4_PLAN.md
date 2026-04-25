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
