# Sprite Conformance And Variation Strategy

Last updated: May 18, 2026

## Top-Level Goal

Aurora and future Platinum games should be able to reach a highly measured
reference-conforming visual experience first, then branch into production-safe
original themes that are still true to the era, genre, gameplay meaning, and
motion language of the source.

This means sprite work has two related but separate outcomes:

1. **Reference conformance lane:** an internal/developer-facing lane that lets
   us see, measure, and compare the closest legally appropriate target-like game
   experience.
2. **Production theme lanes:** Aurora-owned and future-game-owned visual
   variations that are original, themed, and release-safe while preserving
   measured silhouette, timing, role readability, and arcade-era design
   characteristics.

## Why This Matters

Current Aurora sprite scoring is useful but incomplete. The runtime static
sprite score is about `6.2/10`, and the current measurement explicitly says it
is static-pose-only. The biggest visible gaps are not only color or size. They
are:

- exact role silhouettes for player, bee, butterfly, boss, captured fighter,
  projectiles, tractor beam, explosions, and challenge aliens
- flap cadence, pulsing, damage-state phases, and dive/rotation poses
- capture, carried-fighter, rescue, and dual-fighter transitions
- challenge-stage alien novelty and formation context
- the ability to compare target mode and Aurora/theme mode side by side

The browser canvas is not the fundamental blocker. The bigger current limiter is
that Aurora renders compact hand-authored pixel patterns instead of a
source-grounded sprite atlas or pose manifest. The platform already disables
canvas smoothing and handles DPR, but responsive scaling and tiny coordinate-list
sprites make exact visual conformance harder to measure and harder to improve.

## Target Architecture

The sprite pipeline should become:

```text
source manifest
  -> crop-box manifest
  -> target role/pose crops
  -> target pose and motion manifest
  -> runtime sprite atlas or pixel-row renderer
  -> static and temporal sprite conformance scorer
  -> reference conformance lane
  -> Aurora/future-game production theme variants
```

Platinum should provide the shared renderer capability, developer toggles,
artifact wiring, replay capture, and harness APIs. Aurora and each future game
should own the specific sprite packs, target mappings, conformance lane, and
production theme variants.

## Rendering Strategy

Short term, keep the current browser canvas and add a development-only
sprite-target path. Longer term, favor a fixed low-resolution gameplay buffer
with integer or controlled scaling into the cabinet shell. Keep
`imageSmoothingEnabled=false`, avoid arbitrary canvas rotation for sprites that
need authored pose frames, and treat responsive display scaling as presentation,
not the primary measurement surface.

The strict conformance lane should be able to use target-derived crops or
target-derived pixel-row manifests. Production lanes should use original
Aurora-owned or game-owned artwork that follows the same role/pose schema.

## Tooling Strategy

Tools such as `agent-sprite-forge` may be useful for generating candidate sprite
sheets, transparent PNG frames, GIF previews, and themed variants. They should
not replace source-grounded ingestion. Generated or model-assisted sprites are
candidates until they pass the same crop review, role mapping, runtime rendering,
and conformance scoring process.

The right use of model/GPU work is to accelerate candidate creation, critique,
classification, and theme exploration. The durable conformance lift should come
from local artifacts, crop manifests, repeatable scorers, and runtime captures.

## Developer Settings Direction

Once target packs exist, Developer Tools should expose a Sprite Mode control:

- **Reference Conformance:** internal/lab view for closest target-like
  measurement and comparison
- **Aurora Production:** release-safe Aurora theme
- **Theme Variant:** alternate style packs for Aurora or future games

This should be game-pack aware, so Galaxy Guardians and future games can use the
same platform control without Aurora owning their assets.

## Measurement Gates

Sprite conformance should not collapse to one static number. The dashboard and
Application Guide should keep these rows separate:

- static target crop similarity
- live runtime canvas crop similarity
- pose-set coverage
- active motion cadence and silhouette sequence match
- projectile, tractor beam, explosion, and feedback vocabulary
- challenge-stage visual novelty and formation context
- theme distinctiveness and production originality

Planning rows should remain unscored until temporal target windows exist. A
score should only rise when it reflects visible, measurable runtime evidence.

## Current Status

- Galaga alien close-up references are ingested and visible in the Application
  Guide.
- The strongest current target source is the committed general Galaga sprite
  sheet.
- A first-pass crop-box manifest now identifies the general sprite sheet regions
  and role plans that need exact crop promotion.
- Generated crop-preview evidence now exists for the general sprite sheet:
  `GALAGA_ALIEN_CROP_PREVIEW.md` and
  `reference-artifacts/analyses/galaga-alien-visual-crop-previews/latest.json`.
  These previews expose region crops, grid overlays, and role-candidate cell
  counts for review.
- Runtime static sprite conformance exists and is around `6.2/10`.
- Active sprite motion is still the major precision gap.
- Production Aurora sprites remain original/theme-oriented, but they do not yet
  flow from a formal target-pose manifest.

## Next Best Steps

1. Review the generated crop previews and grid overlays from
   `reference-artifacts/analyses/galaga-alien-visual-crop-previews/latest.json`.
2. Promote first-pass target crops for player fighter, dual fighter, bee,
   butterfly, boss, captured fighter, projectile, tractor beam, explosion, and
   challenge alien families.
3. Update runtime sprite scoring to compare multiple target poses instead of one
   static proxy.
4. Add a development-only sprite-rendering mode that can draw from a target
   sprite atlas or target-derived pixel-row manifest.
5. Add Application Guide and dashboard rows that separately show strict
   conformance, production-theme readability, and theme variation distance.

The immediate conformance value is not that production art changes instantly.
The value is that sprite work becomes measurable, repeatable, and reusable for
Aurora, Galaxy Guardians, and later Platinum games.
