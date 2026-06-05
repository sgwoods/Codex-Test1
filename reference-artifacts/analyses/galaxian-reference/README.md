# Galaxian Reference Profile

Status: `source-manifested-contact-sheets-and-waveforms`

This folder contains the first local, measurable Galaxian reference profile for
the future Galaxy Guardians scout-wave slice.

## Sources

### Measured gameplay sources

- `matt-hawkins-arcade-intro`: Galaxian (Namco 1979) - Arcade Intro - Matt Hawkins
- `arcades-lounge-level-5`: GALAXIAN (1979) - LEVEL 5 passed ! Video game - ARCADE'S LOUNGE
- `nenriki-15-wave-session`: Galaxian (Arcade) original video game 15-wave session - Nenriki Gaming Channel
- `galaxian-15wave-full-start-end`: Galaxian 15-wave full-session source
- `galaxians-ex12mins`: Galaxians example 12-minute session
- `galaxians-arcade-no-voiceover`: Galaxians arcade no-voiceover gameplay session

### Supporting written/context sources

- `galaxian-wikipedia`: saved Wikipedia article with gameplay/history overview
  and outbound leads for flyer and related Galaxian-family pages
- `galaxian-namco-wiki-fandom`: saved Namco Wiki / Fandom page with concrete
  flyer, cabinet, flagship, and alien-family image leads
- `galaxian-strategywiki-guide-walkthrough-sprite-bundle`: StrategyWiki guide,
  gameplay, and walkthrough PDFs plus a preserved flyer/sprite bundle covering
  the Midway flyer, flagship, the three main alien families, and Galaxip
- `galaxian-midway-operator-manual`: preserved primary arcade operator manual
  that should anchor score-table, rules, and setup claims
- `galaxian-galaga-web-history`: official Bandai Namco gameplay/history summary
  page with explicit control model and score bands
- `galaga-league-history`: official Bandai Namco lineage/lore page that ties
  Galaxian, Galaga, Gaplus, and Galaga '88 into the modern `Galaga League`
- `galaxian-absoluteknave-history-review`: supporting player-review prose with
  unusually explicit notes about fairness, predictive breakout firing, and
  late-wave pressure feel
- `galaxian-arcade-museum`: Museum of the Game page with release metadata,
  controls, cabinet styles, and broad cabinet/flyer/manual image leads

### Supporting audio index sources

- `galaxian-khinsider-flac-cues`: named FLAC pack for isolated Galaxian core
  cues including credit, start, shoot, loss, extra life, flying, hit enemy,
  and hit boss
- `galaxians-sounds-indexed`: static-card indexed sound reel that appears to
  contain isolated Galaxians-family audio cues
- `galaxian-ambience-background`: sustained Galaxian-family ambience / pressure
  bed source

## Generated Files

- `reference-artifacts/analyses/galaxian-reference/source-manifest.json`
- `reference-artifacts/analyses/galaxian-reference/initial-measured-profile.json`
- `reference-artifacts/analyses/galaxian-reference/promoted-event-log.json`

## Current Baseline

- player fire model: `single-shot`
- formation model: `rack-with-independent-dives`
- flagship model: `flagship-with-escort-pressure`
- evidence state: `promoted-event-log-awaiting-runtime-implementation`

The current profile includes source manifests, contact sheets, waveforms, and
the first promoted semantic event log. The next promotion step is frame-level
timing extraction for the event windows that directly drive the playable
Galaxy Guardians 0.1 scout-wave preview.

The `nenriki-15-wave-session` source is also an important long-session visual
baseline for moving starfield motion, sustained swarm cadence, and bottom-exit
top-reentry pressure during deeper Guardians conformance work.

The `galaxians-ex12mins` source now adds a repeated-start / early-session
baseline for attract/logo persistence, score-advance-table confirmation, early
rack presentation, and restart cadence review.

The `galaxians-arcade-no-voiceover` source now adds the best short repo-owned
anchor for precise early-session cabinet audio, including start, shot, hit,
loss, and game-over review without commentary masking the cues.

The `galaxian-15wave-full-start-end` source now complements the higher-
resolution long-session baseline with a full start-screen / score-advance-table
/ long-run / game-over arc in one uninterrupted session. That means the stage-
five-and-beyond source gap is no longer “find any longplay at all,” but
“promote named deeper-play windows from the long-session sources we now have.”

The `galaxian-namco-wiki-fandom` package does not add measured timing, but it
does sharpen the still-image hunt by exposing specific flyer, cabinet, boss,
and alien-family assets worth preserving next.

The `galaxian-strategywiki-guide-walkthrough-sprite-bundle` package is now the
strongest repo-owned Galaxian flyer and core family sprite lane. It gives us a
preserved Midway flyer plus flagship, blue/purple/red alien-family, and
Galaxip stills along with gameplay and walkthrough prose. That means the still-
image queue is no longer about generic flyer and family hunting. The more
important remaining still-image gap is cabinet-facing, control-panel, bezel,
and marquee presentation.

The `galaxian-midway-operator-manual` package is stronger documentary truth
than either prose PDF. It means the next manual ask is no longer “find an
arcade manual,” but “extract the exact score/rules/setup pages from the manual
we now have.”

The `galaxian-galaga-web-history` page does not replace the operator manual,
but it does provide official modern corroboration for the single-shot control
model, alien-family naming, and convoy/charger score bands.

The `galaga-league-history` page is useful for official lineage and thematic
framing, but it should not be treated as direct gameplay-conformance evidence.

The `galaxian-absoluteknave-history-review` page is not timing truth either,
but it is a better-than-average prose source for describing why Galaxian feels
fair, responsive, and strategically readable. It gives us explicit player
language around predictive firing into breakout paths, escort-wave handling
near the bottom of the screen, and the way the last few enemies create
continuous motion pressure. That is useful for interpretation and review notes,
but it should not replace measured windows.

The `galaxian-arcade-museum` package is useful for a different lane: cabinet
and hardware grounding plus image-lead discovery. It gives us release metadata,
2-way joystick / 1-fire-button controls, mono sound, cabinet-style variants,
and a broad set of marquee/cabinet/bezel/control-panel/PCB/flyer/manual leads.
That strengthens Guardians presentation and documentary review, but it should
not be treated as gameplay-timing truth.

The `galaxians-sounds-indexed` source is useful for isolated cue-family
comparison, but it is not yet first-class conformance truth because the
first-pass visual review does not expose readable per-cue labels. Its next
promotion step is no longer a generic full-reel cue hunt. After the new
KHInsider FLAC pack, its remaining value is a narrower timestamped cue map for
any families or longer regions not already covered by the named FLAC cues.

The `galaxian-khinsider-flac-cues` source now becomes the strongest repo-owned
explicit isolated core-cue pack for Guardians audio fitting. It should be the
preferred source for the named cue families it contains, while the no-voiceover
gameplay session, ambience source, and long-session gameplay sources continue
to own timing, live-mix, and stage-five-and-beyond context.

The `galaxian-ambience-background` source is different: its waveform stays
continuous across the run, which makes it the first strong repo-owned
Galaxian-family source-side ambience bed for Guardians audio fitting. It does
not replace gameplay-context windows, but it largely closes the generic
ambience-bed hunt.

The next important shift is that Guardians no longer depends only on whole
source packages for early-session and deeper-play interpretation. The first
promoted evidence packet now lives at
`reference-artifacts/analyses/guardians-reference-window-promotion-2026-06-05/`
and turns the no-voiceover source, the long-session sources, selected
operator-manual pages, and selected still-image anchors into a reusable review
surface. That means the remaining Guardians evidence asks are now narrower:
expand the score-table/manual-page bundle, expand cabinet/control-surface
stills, add more stage-five-plus runtime correspondence, and close the
residual ambience/static-card cue-map gaps.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/galaxian-reference/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/galaxian-reference`
