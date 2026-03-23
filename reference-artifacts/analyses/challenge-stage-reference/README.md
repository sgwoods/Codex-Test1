# Challenge Stage Reference Pack

Primary source:

- downloaded video:
  - `/Users/stevenwoods/Downloads/challenging stage perfect scores.mp4`

Derived artifact:

- contact sheet:
  - `/Users/stevenwoods/Documents/Codex-Test1/reference-artifacts/analyses/challenge-stage-reference/contact-sheet.png`

Why this exists:

- support issue `#64`
- provide reusable challenge-stage observations for issue `#9`
- preserve a simple visual reference for later harness validation

## Stable observations across the reference video

These are the practical rules and presentation details that are consistently
visible across the challenge-stage examples in the downloaded reference video.

1. Challenge stages are non-attacking bonus rounds.
   - No enemy bullets appear.
   - The player is shooting upward for score only.
   - The value text pops (`1000`, `1500`, etc.) appear over kills, but there is
     no missile pressure mixed into the pattern.

2. The reserve-ships drawer stays visible at the bottom.
   - Remaining ships are still shown during the challenge stage.
   - This is useful presentation reference for our own layout and later HUD
     cleanup.

3. The starfield keeps moving during challenge stages.
   - The board is not a static black backdrop during the bonus round.
   - This is relevant when validating our challenge-stage feel and later visual
     polish.

4. The `CHALLENGING STAGE` intro is clean and readable.
   - The title appears over the moving starfield before the scoring action.
   - The board then transitions into the pattern run without extra combat noise.

5. Perfect-result presentation is simple and centered.
   - `PERFECT!`
   - `NUMBER OF HITS 40`
   - `SPECIAL BONUS 10000 PTS`
   - The reserve-ships drawer and starfield remain part of the scene.

## Stage-by-stage notes for later tuning

These are intentionally high-level and meant for future harness comparisons, not
as emulator-perfect timing claims.

### Early challenge stage

- mirrored groups are easy to read
- targets stay scoreable in the upper half of the board for a meaningful window
- no fire, no dive pressure, just choreographed motion and score text

### Mid challenge stage

- motion speeds up, but the groups still read as patterns rather than attacks
- reserve ships and moving starfield remain visible
- later perfect clears still use the same simple results presentation

### Later challenge stage

- enemy family/color variety increases
- patterns look denser and faster, but they still read as bonus choreography
- the key rule remains unchanged: non-attacking pattern flight, not a combat
  wave

## Practical implications for our game

1. `#64`
   - challenge stages must remain non-firing, non-combat scoring rounds
   - cadence validation matters, but the no-fire rule is the clearest immediate
     gameplay rule

2. `#9`
   - later challenge tuning should focus on mirrored readability, upper-field
     scoreability, and simple results presentation

3. Future harness work
   - compare challenge scenarios against:
     - zero enemy bullets during challenge stages
     - zero enemy attack starts during challenge stages
     - correct challenge-stage cadence from the first challenge onward
     - continued presence of the reserve-ships drawer and moving background in
       visual review
