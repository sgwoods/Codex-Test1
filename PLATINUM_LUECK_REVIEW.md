# Platinum Lueck Review

This is a forward-looking architecture review of `Platinum` after the first
real Aurora-on-Platinum migration work.

The point of this review is not just to praise progress. It is to be clear
about:

- what is now structurally solid
- what is still transitional
- what should be designed deliberately before future games and future host
  surfaces expand the scope

## Current Read

`Platinum` is no longer just an internal cleanup story.

It is now a real host platform with:

- a visible shell identity
- an explicit pack-selection path
- shared service seams
- shared harness categories
- one real playable game pack:
  - `Aurora Galactica`

That is meaningful progress.

The architecture is now beyond:

- “Aurora with some extracted files”

and into:

- “an early shared platform carrying one real game”

## What Looks Covered Well

### 1. Platform identity is now explicit

This was important.

`Platinum` is now visible in:

- docs
- shell surfaces
- picker flow
- splash flow
- platform-only harnesses

That gives the project a cleaner mental model:

- platform
- game pack
- future pack

instead of one monolithic product blob.

### 2. Platform and game responsibilities are separating cleanly

This is one of the strongest areas now.

`Platinum` owns:

- shell and framing
- runtime and pack boot/install
- service adapters
- publish/readiness checks
- platform-only harnesses

`Aurora` owns:

- gameplay rules
- stage and challenge design
- scoring
- capture/rescue mechanics
- game-specific content

That is the right direction, and it is now reflected in code, docs, and tests.

### 3. Harness separation is becoming real

This is a very strong improvement.

We now have clearer categories for:

- platform-only harnesses
- game-pack harnesses
- seam/contract harnesses
- motion/outcome checks

That matters because future games should be able to stress Platinum without
dragging all Aurora assumptions along for the ride.

### 4. Platinum can already host a future title preview safely

The current `Galaxy Guardians` shell preview is useful.

It proves:

- pack selection
- shell identity swapping
- coming-soon treatment
- future-title framing

without pretending gameplay exists before it does.

That is exactly the kind of staged proof a platform needs.

## What Is Still Transitional

### 1. The pack contract is real, but still not formal enough

We now have a meaningful pack shape in practice, but not yet a strongly
versioned, explicit contract that can evolve safely.

What is still missing:

- clearer versioned `gamePack` schema thinking
- stronger required-vs-optional capability definitions
- more intentional forward-compatibility planning for pack data

This will matter much more once a second playable pack exists.

### 2. Some compatibility shims are still Aurora-shaped

This is acceptable for now, but it should stay visible.

Examples:

- storage aliases
- some debug globals
- some replay/account naming

These are not blockers, but they are signs that the migration is not fully
finished yet.

### 3. Designer-owned data is still only partially extracted

We have good planning here, but not enough implementation yet.

Especially important future areas:

- stage catalogs
- boss archetype catalogs
- themed challenge definitions
- game text/content surfaces
- audio event mapping
- per-game admin/designer panels

Right now the direction is clear, but the operational designer model is still
emerging.

## What Needs To Be Considered Soon

### 1. Versioned pack evolution

As soon as `Galaxy Guardians` becomes playable, pack evolution becomes a real
problem.

We should plan for:

- contract additions without breaking old packs
- deprecating pack fields safely
- validating pack metadata at load time
- keeping harnesses aligned with pack capability changes

This is where Lueck’s migration concern becomes very relevant.

### 2. Storage and migration safety

The current compatibility approach is pragmatic and appropriate.

But if Platinum becomes the long-term identity, we should eventually decide:

- what remains aliased forever
- what migrates once
- what is intentionally never migrated

That should be treated as product/data migration work, not just rename work.

### 3. Multi-host future thinking

Even if the immediate plan stays browser-first, Platinum should avoid making
that assumption too deeply permanent.

Future host surfaces might include:

- hosted browser production
- local/offline cabinet mode
- desktop wrapper
- curated exhibition or kiosk mode

That does not mean building them now.

It means keeping these seams healthy:

- input abstraction
- file/storage abstraction
- service/network abstraction
- shell/layout abstraction

## What We Should Address Later, Not Now

### 1. True multi-platform runtime support

Do not overreach here yet.

Right now Platinum should stay:

- browser-first
- Pages-friendly
- lightweight

The right move is to preserve the possibility of broader host platforms later,
not to build them prematurely.

### 2. Heavy operator tooling inside Platinum core

Admin, artifact, and designer panels are important.

But they should remain:

- game-owned where appropriate
- or platform-adjacent tools

They should not bloat the core runtime path casually.

## Forward-Looking Recommendations

### Immediate

1. complete the Aurora-on-Platinum rerelease baseline cleanly
2. keep the shell and platform harnesses green
3. close the most visible Aurora trust/clarity issues after the rerelease pass

### Next

1. make the first truly playable `Galaxy Guardians` slice
2. validate that the pack contract can support a simpler Galaxian-style ruleset
3. keep all new game-specific authoring in game-owned definitions, not
   Platinum internals

### Soon after

1. add stronger pack-schema validation
2. add more explicit migration/versioning strategy for pack and storage
3. deepen the designer/admin surfaces without mixing them into the core
   Platinum runtime

### After Aurora is stable again

1. run a brief retrospective on how a materially different Aurora gameplay
   shape was able to survive this long while Platinum shell checks still looked
   healthy
2. document which testing layers were missing or too weak:
   - production-vs-dev artifact comparison
   - deterministic persona repeatability
   - stage carryover parity
   - outcome-distribution gating
3. promote the strongest new gates into normal release-readiness, so future
   platform or game-pack work cannot drift this far before we notice

## Bottom Line

`Platinum` is in a healthy early-platform state.

It is not “finished,” but it is real.

The right next move is not another abstract refactor. It is:

- stabilize the first shipped pack on the platform
- then prove the platform with a second playable pack
- while protecting the seam between platform and game with stronger contracts,
  harnesses, and migration thinking
