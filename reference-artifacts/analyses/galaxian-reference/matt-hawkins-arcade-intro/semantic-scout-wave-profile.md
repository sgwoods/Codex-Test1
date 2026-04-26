# Matt Hawkins Intro Semantic Profile

Window id: `matt-hawkins-arcade-intro`

Status: `events-observed`

This profile translates the locally provided beginning-phase `Galaxian` intro
source into questions and candidate semantics for the future `Galaxy Guardians`
scout-wave model.

It should not be treated as movement or player-control implementation authority
until the late action is classified against an active gameplay source.

## Intro / Title Contract

Observed in `title-mission` (`0.000s` to `6.000s`):

- the clip begins on score labels, credits, and a starfield
- title/mission text appears after the opening starfield
- score-table presentation begins near the end of this subwindow
- the source does not provide useful audio cue evidence because the encoded
  audio track is effectively silent

## Formation Handoff

Observed across `score-advance-table` (`5.000s` to `29.000s`) and
`rack-handoff` (`34.000s` to `42.000s`):

- the score table and Namco presentation precede the rack view
- the source reaches a readable full rack
- the rack appears with `GAME OVER`, so this is not a clean formation-entry
  gameplay window
- row composition and enemy-family colors are readable enough for semantic
  tagging

## Player Contract

Observed in `late-attract-pressure` (`48.000s` to `59.133333s`):

- Galaxip appears in the lower field
- attacker, shot/projectile, and explosion states appear
- `GAME OVER` remains visible, so this likely represents attract/demo or
  post-game presentation
- use this for vocabulary and visual-state discovery before using it for motion
  or player-control tracing

## Enemy Family Readability

Observed:

- top-rank / flagship-like enemies are visible
- red escort-like enemies are visible
- mid-rank and lower-rank alien families are visible
- source quality supports contact-sheet based semantic labeling

## First Harness Implications

Draft targets from this source:

- title/mission presentation can be logged
- score-table and enemy-family naming semantics can be logged
- rack composition can be logged as attract/presentation evidence
- late pressure can seed entity vocabulary for Galaxip, attacker, projectile,
  and explosion states
- this source should complement, not replace, the generic
  `seed-window-formation-entry` candidate until an active gameplay source is
  analyzed

## Open Questions

- Which late-pressure frames are attract/demo versus active gameplay?
- Which active gameplay source should provide the first player-control trace?
- Should Galaxian preview implementation start with presentation/rack semantics
  before gameplay movement?
