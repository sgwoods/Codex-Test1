# Artifact Reference ID Scheme

Date: `2026-06-01`

This repo now uses stable reference IDs for dashboard artifacts, repo-owned
reports, plan tracks, and hunt recommendations.

The goal is simple:

- let us refer to one exact artifact or gap without quoting a long title
- keep dashboard, reports, and review notes aligned
- avoid renaming filesystem paths just to create shorthand labels

## Core Format

The canonical format is:

- `<scope>-<kind>-<nnn>`

Examples:

- `GGD-ART-014`
- `AUR-PLAN-002`
- `WIN-GAP-004`
- `PLAT-DOC-003`

## Scope Codes

- `PLAT`
  - shared Platinum/dashboard/process items
- `AUR`
  - Aurora Galactica items
- `GGD`
  - Galaxy Guardians items
- `WIN`
  - Windigo Invaders items

## Kind Codes

- `DOC`
  - shared repo docs and dashboard process docs
- `ART`
  - artifact-backed reference items, source packages, analyses, plan anchors,
    and preview artifacts surfaced as artifacts
- `PLAN`
  - dashboard plan-track items
- `GAP`
  - game-specific missing-artifact or hunt recommendation items
- `HUNT`
  - shared cross-game hunt recommendations

## Stability Rules

- IDs are append-only.
- Never renumber an existing ID just because items are reordered or rewritten.
- New items should get the next unused number within their own
  `scope + kind` lane.
- If an item is materially replaced, prefer keeping the existing ID unless the
  replacement is really a different artifact or a different recommendation.
- Filesystem paths remain canonical for storage.
  - The ID is the shorthand handle.
  - The path is the storage location.

## Where These IDs Live

The current canonical assignment source is:

- [ingestion-dashboard.json](/Users/steven/Projects-All/Codex-Test1/ingestion-dashboard.json)

The dashboard build renders the same IDs directly into the review UI.

## How To Cite Them

Prefer this pattern in notes and reports:

- ``GGD-GAP-003 -- Promote named early-session audio scene windows``
- ``AUR-PLAN-002 -- Challenge motion-window extraction``
- ``WIN-ART-011 -- StrategyWiki guide/walkthrough and sprite bundle``

If you also need the storage location, follow with the repo path:

- ``GGD-ART-021`` at
  `reference-artifacts/preserved-sources/galaxian-midway-operator-manual-2026-06-01/`

## Maintenance

The reusable helper that assigns missing IDs without renumbering existing ones
is:

- [tools/dev/assign-ingestion-dashboard-ids.js](/Users/steven/Projects-All/Codex-Test1/tools/dev/assign-ingestion-dashboard-ids.js)

Use it when new dashboard artifacts, plan tracks, or hunt items are added and
need stable IDs assigned.
