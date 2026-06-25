# Boss Sprite Conformance Repair

## Scope

- Branch: `codex/aurora-boss-sprite-conformance`
- Repair target: Aurora Galactica `reference-pixel-lab` boss-line sprite used by the Galaga-style theme presets.
- Non-goals: no audio changes, no gameplay timing changes, no challenge routeability changes, no publish.

## Finding

- Fresh runtime sprite capture at branch start still identified `boss-line` as the weakest measured sprite.
- Before repair:
  - `averageScore10`: `6.21`
  - `weakestSpriteKey`: `boss-line`
  - `boss-line score10`: `4.95`
- Visual read: the closed boss pose was sparse in the upper half and could read like a boss/bee hybrid rather than a broad Galaga command boss.

## Repair

- Replaced the closed `TARGET_SPRITE_ROWS.boss` proxy with a compact 16x16 sprite derived from `galaga-command-boss-model`.
- Added the boss model's cyan/magenta/white palette tokens to the boss target palette.
- Left boss open-pose timing and non-reference themed rendering unchanged.

## Result

- After repair:
  - `averageScore10`: `6.61`
  - `weakestSpriteKey`: `challenge-dragonfly`
  - `boss-line score10`: `8.19`
- Boss-line runtime width remains within the existing formation-size guard:
  - `runtimeWidthVsPlayer`: `1.364`
  - max allowed by guard: `1.47`
- Added a runtime conformance guard requiring boss-line to stay above `7.4/10` and above bee-line's model score.

## Validation

- `npm run build`
- `npm run harness:analyze:aurora-runtime-sprite-conformance`
- `npm run harness:check:aurora-runtime-sprite-conformance`
- `npm run harness:check:sprite-render-mode-guard`
- `npm run harness:check:aurora-sprite-motion-correspondence`
- `npm run harness:check:formation-readability`
- `npm run machine:audio:status`
- `npm run harness:check:local-theme-audio`
