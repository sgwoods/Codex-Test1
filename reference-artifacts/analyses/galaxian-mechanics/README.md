# Galaxian Mechanics Archive

This note starts a durable archive of `Galaxian` gameplay references for future
Platinum sibling-pack work.

Naming rule for this archive:

- `Galaxian`
  - the original game and the mechanics/reference lineage
- `Galaxy Guardians`
  - the planned future Platinum game project that may draw from this lineage

This archive is therefore:

- a `Galaxian` reference archive
- in service of a future `Galaxy Guardians` project
- not a place to blur those two identities together

Status of this note:

- useful for planning and implementation guidance now
- still secondary-source driven
- should be promoted into stronger canonical rules only after we compare
  against manual-era documents, emulator captures, or original gameplay footage

## Why This Exists

`Galaxian` is the closest near-term sibling reference for Platinum after
Aurora.
That means we need one place to collect:

- gameplay rules
- scoring behavior
- formation composition
- dive/escort behavior
- cabinet / visual references

without leaving them scattered across chat logs or Downloads.

## Current Source Set

These sources were provided as early developer references to seed the archive.

| Resource Type | Site Name | What it covers | Key Value for Developers |
| --- | --- | --- | --- |
| Mechanics & Strategy | [Sashanan's Arcade Strategy Guide (GameFAQs)](https://gamefaqs.gamespot.com/arcade/583825-galaxian/faqs/32227) | Detailed breakdown of "Charger" vs. "Convoy" behaviors and difficulty scaling. | Strong text reference for how many enemies may dive at once, including later-wave pressure. |
| Technical Overview | [Galaxian - StrategyWiki](https://strategywiki.org/wiki/Galaxian) | Enemy formation counts and point tables for each enemy type. | Useful for early score-model and formation-layout planning, including flagship bonus values. |
| Visual Reference | [Arcade Artwork - Galaxian](https://www.arcadegraphic.net/product-page/galaxian-geekpub-cabinet) | Cabinet art, side panels, and marquee graphics. | Useful for palette, marquee, and cabinet-frame inspiration. |
| Deep Dive / History | [Bitvint: Galaxian 1979](https://bitvint.com/pages/galaxian) | Hardware context and pacing constraints. | Useful for understanding why the single-shot cadence and early-arcade pacing feel the way they do. |
| Historical Patterns | [IGN General FAQ](https://www.ign.com/articles/2003/08/29/galaga-galaxian-general-faq-434934) | Alien rank layout and family counts. | Useful as an early formation-array planning reference. |

## Working Mechanics Notes

These points should be treated as current archive guidance, not yet as final
canonical implementation rules.

### Flagship / Escort Scoring

- The flagship high-value dive should reward the full bonus only when the
  flagship dives with two red escorts and the escorts are removed before the
  flagship itself is destroyed.
- Current planning shorthand:
  - flagship with two escorts intact:
    - high-value attack opportunity
  - escorts removed first, flagship finished after:
    - max-value branch

This is an important comparison point for Platinum because it is close to the
Galaga-family escort idea while still simpler than Aurora's richer rescue model.

### Escort Scatter Behavior

- If the flagship is destroyed during the dive, any surviving red escorts
  should stop acting like an attack squad and peel away to return toward the
  convoy/formation state.

This is a good example of a mechanic that should be capability-owned by a pack,
not hardcoded as an Aurora rule.

### Single-Shot Constraint

- The player should not be able to fire a second shot until the first shot
  either hits a target or exits the screen.

This matters because it changes:

- pressure pacing
- score optimization
- player timing expectations
- the rhythm difference between `Galaxian` and later Galaga-family games

### Wrap-Around Threat

- Enemies leaving the bottom of the screen should not simply disappear from the
  threat model.
- They should wrap and remain part of the wave until the formation is actually
  cleared.

This should eventually shape:

- the sibling-pack rules
- harness expectations
- later persona/outcome baselines

## Current Planning Implications For Platinum

These notes reinforce a few design directions we already suspected:

1. `Galaxy Guardians` should be a distinct sibling game, not a cosmetic skin.
2. `Galaxian` should be treated as one of its strongest mechanical references.
3. The first gameplay slice should likely include:
   - formation rack
   - independent dives
   - flagship + escort scoring
   - single-shot player constraint
   - wrap-around enemy threat
4. It should likely *not* inherit by default:
   - Aurora capture/rescue
   - Aurora dual-fighter mode
   - Aurora challenge-stage assumptions

## What To Verify Next

Before we treat these notes as canonical, we should add stronger sources for:

1. exact formation row counts and rank naming
2. exact flagship/escort score table
3. whether later-wave dive counts match the quoted strategy-guide summary
4. how wrap-around timing behaves in real captured footage
5. whether any manual-era source confirms or contradicts the escort scatter
   description above

## Suggested Follow-On Archive Additions

- original or emulator-captured `Galaxian` footage notes
- cabinet/manual scans if we can obtain durable copies
- a first `Galaxian` scoring table
- a first `Galaxian` wave/formation table
- a first `Galaxy Guardians` harness baseline once that sibling pack becomes
  dev-playable
- a short game-information page for:
  - `Aurora Galactica`
  - `Galaxy Guardians`
