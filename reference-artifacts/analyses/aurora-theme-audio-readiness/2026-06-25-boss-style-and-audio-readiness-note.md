# Boss Style and Theme Audio Readiness Note

## Observation

- Local playtest feedback says the Aurora boss alien in the Galaga-style presentation now reads like a hybrid between the boss and bee alien styles.
- Treat this as a possible visual conformance regression until measured against the Galaga reference sprite targets and runtime theme settings.
- Do not tune the boss sprite subjectively. First compare runtime boss-line, boss-open, dive, and carry states against the preserved Galaga boss sprite model and crop evidence.

## Immediate Guard Added

- Add `npm run harness:check:local-theme-audio` as the local readiness check before Galaga-style or local-reference theme inspection.
- The guard verifies the `dist/dev/assets/reference-audio` private clip lane is present, readable, hash-valid, and still blocked from public-safe hosts.
- The guard then runs the existing audio theme phases, cue slots, and development graphics/theme checks so Aurora public, Galaga-style synth, and local reference routing stay covered together.

## Recommended Boss Follow-Up

1. Refresh existing sprite evidence:
   - `npm run harness:check:galaga-reference-sprite-model`
   - `npm run harness:check:aurora-runtime-sprite-conformance`
   - `npm run harness:check:sprite-render-mode-guard`
2. Capture the boss in the Galaga-style/classic presentation and compare it to `boss-line`, `boss-line-flap-open`, `boss-line-dive-left`, and `boss-carrying-fighter` target crops.
3. If the hybrid look is confirmed, constrain the Galaga-style boss render path to the boss target sprite rows and boss palette, and add/extend a harness assertion that boss states do not use bee rows or bee palette under the Galaga-style theme.

## Current Sprite Check Status

- `npm run harness:check:sprite-render-mode-guard` passes at `698ce101`.
- `npm run harness:check:galaga-reference-sprite-model` currently stops on missing image lineage for `galaga-player-fighter-model`. That is not a boss-style finding by itself, but it should be cleared or accounted for before using the sprite model check as the boss repair gate.

## Non-Goals For This Note

- No beta or production publish.
- No Guardians work.
- No Stage 7 work.
- No challenge routeability or target visibility repair.
