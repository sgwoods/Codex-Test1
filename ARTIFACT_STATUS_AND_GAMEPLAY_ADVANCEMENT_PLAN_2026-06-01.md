# Artifact Status And Gameplay Advancement Plan

Date: `2026-06-01`

This file is the current repo-owned read on what artifact content we now have
for `Galaxy Guardians`, `Aurora Galactica`, and `Windigo Invaders`, how that
content should be used next, and which missing artifacts still matter enough to
change gameplay quality or implementation confidence in a meaningful way.

Canonical artifact, plan, and hunt identifiers now live in
[ARTIFACT_REFERENCE_ID_SCHEME.md](/Users/steven/Projects-All/Codex-Test1/ARTIFACT_REFERENCE_ID_SCHEME.md)
and in
[ingestion-dashboard.json](/Users/steven/Projects-All/Codex-Test1/ingestion-dashboard.json).
Future repo notes should prefer references like `GGD-GAP-003`,
`AUR-PLAN-002`, or `WIN-ART-011` when pointing to one exact dashboard item.
The more focused Guardians execution read now lives in
[GUARDIANS_INGESTION_NET_TAKEAWAY_AND_NEXT_10_STEPS_2026-06-01.md](/Users/steven/Projects-All/Codex-Test1/GUARDIANS_INGESTION_NET_TAKEAWAY_AND_NEXT_10_STEPS_2026-06-01.md).

Public/private storage policy now lives in
[PRIVATE_ARTIFACT_STORAGE_POLICY.md](/Users/steven/Projects-All/Codex-Test1/PRIVATE_ARTIFACT_STORAGE_POLICY.md).
The public repo should keep the metadata and decision layer, while copied or
derived source bytes for newer intake work should live in the companion private
artifact store. The current private companion GitHub repo is
`sgwoods/Codex-Test1-private-artifacts`, and the standing legacy cleanup plan
now lives in
[PRIVATE_ARTIFACT_LEGACY_MIGRATION_PLAN_2026-06-01.md](/Users/steven/Projects-All/Codex-Test1/PRIVATE_ARTIFACT_LEGACY_MIGRATION_PLAN_2026-06-01.md).
The first legacy Guardians-driven migration tranche is already complete in the
working tree for `galaxian-frame-reference` and `audio-conformance-lab`, which
means the private companion workflow is now proven on both new intake and older
tracked reference-media lanes.
The first large Aurora audio-fitting tranche is now also complete in the
working tree for `aurora-audio-cue-candidates` and
`aurora-audio-theme-comparison`, which means the migration workflow has now
been exercised successfully on both active game lines, not just Guardians.
The follow-on Aurora/Galaga reference-media waves are now also complete across
challenge/reference motion packs, older reference-audio/video residue,
sprite/contact-sheet residue, and visual crop/timing packs. The next storage
decision is no longer about obvious external reference bytes. It is now about
mixed conformance lanes that combine public-safe runtime evidence with
source-derived comparison sheets.
The old app-bundled `src/assets/reference-audio` lane is now private too, and
the public build/runtime has been tightened so the repo no longer republishes
private-derived media through shipped `catalog-media` assets or bundled
reference-audio cues.

## Cross-game summary

- `Galaxy Guardians` has crossed the line from generic intake into serious
  gameplay-fidelity work. We now have enough source truth to push audio,
  deeper-play fairness, and motion/presentation work much harder than before.
- `Aurora Galactica` already has broad source coverage. Its biggest missing
  pieces are no longer raw videos or generic strategy pages, but better derived
  evidence units cut from the sources we already own.
- `Windigo Invaders` is still intentionally pre-runtime. The current artifact
  package is strong enough to write and tighten the real instantiation plan, but
  not yet strong enough to justify coding from memory or assumption.

## Galaxy Guardians

Current posture:
- Reference conformance is already meaningful, but public readiness is still
  low enough that the remaining work has to improve lived play, not just add
  artifacts.
- The highest-leverage remaining areas are audio authenticity, deeper-play
  fairness, motion/pulse authority, and source-backed scoring/presentation
  behavior.

### What we have now

- Multiple measured gameplay sources covering intro, early play, deeper play,
  and full-session continuity:
  - `matt-hawkins-arcade-intro`
  - `arcades-lounge-level-5`
  - `nenriki-15-wave-session`
  - `galaxians-ex12mins`
  - `galaxians-arcade-no-voiceover`
  - `galaxian-15wave-full-start-end`
- Strong audio-source families:
  - named isolated FLAC cues for credit, start, shoot, loss, extra life,
    flying, hit enemy, and hit boss
  - a sustained Galaxian ambience / recurring-pressure bed
  - an older indexed sound reel that still helps with residual-gap mapping
- Strong documentary and interpretation grounding:
  - Midway operator manual
  - official gameplay/history prose
  - official lineage page
  - Wikipedia / Namco Wiki intake
  - StrategyWiki guide/gameplay/walkthrough plus preserved flyer/sprite bundle
  - Museum of the Game spec/cabinet package
  - Absolute Knave player-review prose
- Strong runtime-side acceptance artifacts:
  - reference conformance
  - playtest conformance
  - long-surface conformance
  - audio scene review
  - audio live mix

### How we will use this content now

- Refit Guardians audio families against real source truth instead of generic
  “arcade-like” assumptions.
  - Use the FLAC cue pack for exact named cue identity.
  - Use the no-voiceover and long-session gameplay sources for event timing and
    live gameplay soundscape fit.
  - Use the ambience source for the recurring pressure bed between shots and
    hits.
- Push deeper-play gameplay quality with real source-side and runtime-side
  comparison.
  - Use the long-session Galaxian sources plus new stage-five-and-beyond
    Platinum captures to tune lower-field crowding, recovery space, and
    survivability.
- Tighten visual/cabinet-family authority.
  - Use the operator manual, the new StrategyWiki flyer/sprite bundle, and the
    remaining museum/manual still-image leads to keep score/rules claims,
    cabinet-facing wording, and visual-family decisions grounded.
- Keep changes honest with runtime-side acceptance artifacts.
  - Audio scene review, live mix, long-surface review, and playtest-weighted
    conformance stay as the acceptance layer so tuning does not drift into
    wishful thinking.

### Highest-impact missing artifacts

- Missing: extracted score-table, rules, and setup manual pages
  - Why we need them: the operator manual is now in repo, but we still need
    page-level artifacts that can directly anchor score, rules, and setup
    claims.
  - How this pays off: it removes ambiguity from scoring, control model, and
    operator-facing behavior, which stabilizes HUD, popup, and presentation
    decisions.
- Missing: a small preserved cabinet-facing still-image package for cabinet,
  control-panel, bezel, marquee, and related presentation surfaces
  - Why we need it: the new StrategyWiki bundle now covers the flyer, flagship,
    main alien families, and Galaxip, but cabinet-facing surfaces are still
    mostly leads rather than preserved repo-owned anchors.
  - How this pays off: it gives us fast visual truth for controls, bezel and
    control-panel wording, cabinet framing, and later release-surface
    presentation while leaving sprite-family identity less ambiguous.
- Missing: promoted early-session audio scene windows from the no-voiceover
  source
  - Why we need them: the whole clip is useful, but real tuning needs short,
    named windows for start, shot, hit, loss, and game over.
  - How this pays off: it lets us fit Guardians audio families precisely and
    repeatedly without reopening the full video every time.
- Missing: promoted stage-five-and-beyond audio and pacing windows from the
  long-session sources
  - Why we need them: deeper-play quality is still the weakest felt part of
    Guardians, and early-stage audio windows are not enough to fix it.
  - How this pays off: it gives us source-backed pressure, failure, and pacing
    windows for the actual stage bands that still feel weak.
- Missing: comparable stage-five-and-beyond runtime captures
  - Why we need them: without matched Platinum-side captures, fairness changes
    remain anecdotal.
  - How this pays off: it lets us tell whether a gameplay change reduced cheap
    failure or only changed difficulty in the abstract.
- Missing: direct pulse/flap motion windows
  - Why we need them: pulse and cadence are still visible felt gaps and need
    frame-readable source truth.
  - How this pays off: it gives us a concrete basis for improving movement
    rhythm without guessing.
- Missing: score-popup policy windows
  - Why we need them: popup behavior should be tied to visible source cases,
    not inferred from memory.
  - How this pays off: it lets us write a source-backed popup rule and clean up
    visual feedback during hits.

### Immediate execution order

1. Promote named early-session audio windows.
2. Promote named stage-five-and-beyond audio/pacing windows.
3. Capture comparable stage-five-and-beyond Guardians runs.
4. Use those windows and captures to tune audio authenticity and deeper-play
   fairness together.
5. Use motion/popup/manual-page artifacts to lock the remaining visible
   presentation behavior.

## Aurora Galactica

Current posture:
- Aurora is already the most mature game line in the repo.
- The biggest remaining weaknesses are still challenge-stage authority and
  impact/explosion feedback.
- The main missing value is not more generic raw source, but better extracted
  evidence from what we already own.

### What we have now

- Broad reference video coverage, including videos of all Aurora-relevant
  challenge stages already in repo.
- A preserved stage-isolated challenge compilation at
  `reference-artifacts/preserved-sources/galaga-challenging-stages-isolated-2026-06-01/`
  that is especially good for motion-window extraction because it shows the
  challenging stages one at a time without normal-stage play clutter.
- A preserved perfect-play challenge compilation at
  `reference-artifacts/preserved-sources/galaga-perfect-challenging-stages-2026-06-01/`
  that is especially good for repeated result-surface and flawless
  challenge-to-result cadence review.
- A preserved higher-quality perfect-play challenge compilation at
  `reference-artifacts/preserved-sources/galaga-higher-quality-perfect-challenging-stages-2026-06-01/`
  that is now the preferred repo-owned raw source for perfect-result
  presentation and ideal challenge-flow review.
- Strong named audio source families:
  - indexed micro-cue packs
  - KHInsider MP3 cue pack for ceremony, capture/rescue, challenge-stage,
    result-perfect, coin, death/start-up, and name-entry families
- Strong strategy and interpretation sources:
  - Steam guide
  - PrimeTime Amusements guide
  - wikiHow guide with annotated screenshots
  - StrategyWiki gameplay and walkthrough PDFs
  - Free80sArcade history/strategy guide
- Strong cabinet/spec and still-image leads:
  - arcade-museum package
  - logo/title/tractor-beam/stage still bundles from the supporting guides
  - StrategyWiki sprite-family and transform-family still bundle
- Mature runtime-side conformance artifacts:
  - application artifact conformance
  - challenge-stage conformance
  - sprite-motion correspondence
  - quality conformance rollups

### How we will use this content now

- Use the named audio packs to keep Aurora ceremony, capture/rescue, challenge
  result, and name-entry families source-faithful.
- Use the annotated still and strategy packages to verify capture policy,
  challenge result behavior, entrance-pattern policy, and screen-surface
  presentation.
- Use the full challenge videos as the raw source pool for a better extracted
  evidence set instead of chasing more generic gameplay footage, with the
  isolated stage compilation handling motion extraction and the higher-quality
  perfect-play compilation handling ideal-flow and perfect-result review.
- Keep the current conformance artifacts as the acceptance layer so that
  challenge-stage work remains measured and explicit.

### Highest-impact missing artifacts

- Missing: extracted full labeled challenge-family subclips
  - Why we need them: we already have the challenge-stage videos, but many
    comparisons still depend on scrubbing long source videos instead of opening
    one named set-piece contract clip.
  - How this pays off: it makes challenge-stage tuning faster, more explicit,
    and less subjective.
- Missing: frame-accurate flap and novelty motion windows
  - Why we need them: the remaining challenge-stage weakness is partly a motion
    and novelty-definition problem, not a source-availability problem.
  - How this pays off: it gives us direct frame-readable truth for bee and
    butterfly cadence plus the distinct identity of each challenge pattern.
- Missing: boss-hit and explosion lifecycle still bundles
  - Why we need them: impact/explosion visual feedback is still the weakest
    broad artifact row.
  - How this pays off: it gives us explicit onset/peak/decay references for
    boss damage, boss destruction, and normal enemy explosions.

### Immediate execution order

1. Cut named challenge-family subclips from the sources already in repo,
   starting with the preserved stage-isolated challenge compilation because it
   keeps the route motion easiest to read.
2. Use the preserved perfect-play challenge compilation to cross-check perfect
   result cadence and ideal-flow expectations while those subclips are being
   promoted.
3. Promote flap and novelty motion windows.
4. Promote boss-hit and explosion lifecycle still bundles.
5. Use those evidence units to drive the next challenge-stage and explosion
   refinement pass.

## Windigo Invaders

Current posture:
- Windigo is still in the correct phase: artifact collection and analysis.
- The current package is strong enough to harden the first real
  Platinum-focused instantiation plan.
- It is not yet strong enough to justify runtime implementation from
  assumption.

### What we have now

- A preserved gameplay seed source:
  - `spaceinvaders-23mins`
- Preserved rules and service/document packages:
  - score values
  - bonus-base options
  - bases-per-game options
  - service/manual grounding
- A named Space Invaders sound pack:
  - UFO
  - four march-step cues
  - shot
  - invader kill
  - explosion
- Strong supporting prose and interpretation:
  - Absolute Knave history/review
- Strong museum/spec and still-target discovery:
  - control model
  - mono sound
  - black-and-white with color overlay
  - cabinet / marquee / bezel / control panel / screenshot leads
- Strong StrategyWiki sprite and flyer grounding:
  - flyer still
  - saucer still
  - large / medium / small invader-family stills
  - cannon still

### How we will use this content now

- Lock the first Platinum instantiation assumptions before code begins.
  - scoring
  - lives/bases
  - control model
  - display identity
  - basic sound vocabulary
- Use the named sound pack to define the first owned audio families without
  guessing at march, UFO, shot, hit, and explosion identity.
- Use the gameplay seed and future promoted windows to define bunker wear,
  descent pressure, and stage flow.
- Use the StrategyWiki bundle to keep cannon, saucer, invader-family, and flyer
  identity explicit instead of inferred from memory.
- Keep the first runtime plan honest by separating what Platinum owns from what
  Windigo itself must own as game truth.

### Highest-impact missing artifacts

- Missing: original score-table still or manual-page capture
  - Why we need it: we now have good written rules, but still need stronger
    visual score-table truth before locking public scoring claims.
  - How this pays off: it closes one of the last important rules/scoring
    ambiguities before implementation.
- Missing: higher-resolution gameplay with clearer bunker wear, descent
  pressure, and in-context audio
  - Why we need it: the current seed is good enough to start planning, but not
    good enough for confident gameplay/timing tuning.
  - How this pays off: it lets us study how march, shot, hit, explosion,
    descent, bunker erosion, and failure work together in real play.
- Missing: preserved still-image package for marquee, cabinet, bezel, control
  panel, title, and gameplay
  - Why we need it: the new StrategyWiki bundle now covers the flyer and core
    gameplay silhouettes, but cabinet-facing presentation surfaces are still
    mostly lead-level rather than preserved repo-owned evidence.
  - How this pays off: it gives Windigo a clear cabinet/display/presentation
    anchor before future theming begins.
- Missing: bunker still references
  - Why we need them: the new StrategyWiki bundle closes cannon and invader-row
    identity, but bunker wear and bunker silhouette are still not preserved as a
    direct visual bundle.
  - How this pays off: it prevents soft guessing in bunker shape, bunker wear,
    and how the defensive layer should read under pressure.
- Missing: event-labeled timing clips
  - Why we need them: gameplay implementation needs named start, march, shot,
    hit, descent, loss, and game-over windows, not just a whole longplay.
  - How this pays off: it gives Windigo a runtime-ready timing contract before
    code begins.
- Missing: source-side `start / credit / player-loss` sound truth
  - Why we need it: the named sound pack closes many low-level sound gaps, but
    not the full set of visible player-state cues.
  - How this pays off: it prevents false assumptions in ceremony, failure, and
    reset-state audio.

### Immediate execution order

1. Preserve score-table truth.
2. Promote higher-resolution gameplay and event-labeled timing windows.
3. Preserve cabinet/title/gameplay still bundles and bunker references.
4. Use that completed intake package to tighten the Windigo instantiation plan
   before any runtime slice begins.
