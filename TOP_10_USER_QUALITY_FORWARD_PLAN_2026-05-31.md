# Top 10 User-Quality Forward Plan

Date: 2026-05-31

## Current Read

This plan is intentionally Aurora-first because Aurora is the shipped first game,
the active `/dev` lane subject, and the current release-authority decision point.

Current measured release picture:

- Overall quality: `8.7/10`
- Audio identity: `7.1/10`
- Challenge-stage set-piece conformance: `4.2/10`
- Direct target sprite / impact feedback conformance: about `6.0/10`
- Level arc: `8.6/10`
- Challenge-stage alien novelty: `3.9/10`
- Challenge-stage progression: `2.9/10`
- Sprite-motion correspondence: `6.18/10`
- Weakest application-artifact row: `impact-explosion-visual-feedback` at `5.85/10`

This plan deliberately changes some older habits:

1. Do not let broad coverage scores hide strict user-facing gaps.
2. Do not keep tuning all challenge stages at once.
3. Do not promote audio or sprite changes from isolated partial evidence.
4. Put headed browser-with-audio review back into the main loop before docs/dashboard refresh.
5. Treat content contracts as first-class assets, not scattered code behavior.

## Top 10 Issues

### 1. Challenge stages still do not feel like real Galaga-style spectacles

Current evidence:
- Strict challenge-stage conformance is `4.2/10`.
- Alien novelty is `3.9/10`.
- Stage progression is `2.9/10`.
- Object-track fit is `3.6/10`.

Recommended plan:
- Stop trying to improve all challenge stages together.
- Select three canonical challenge targets first: an early challenge, a mid challenge, and a late challenge.
- Rebuild those three as authored set pieces with explicit contracts for group order, entry side, exit side, path family, turn count, shot opportunity, perfect-bonus readability, and visible alien role.
- Only after those three pass headed review should the remaining challenge stages inherit the new grammar.

Process/platform change:
- Make challenge stages a contract-authored subsystem with its own review lane, not a side effect of general stage logic.

Expected user-facing outcome:
- Bonus stages stop feeling merely safe and start feeling memorable, learnable, and worth mastering.

### 2. Audio identity is still one of the biggest user-experience gaps

Current evidence:
- Audio identity category is `7.1/10`.
- Release dashboard still calls this the primary user-experience gap.

Recommended plan:
- Freeze promotion from isolated onset/body sweeps.
- Move to full-phrase reference alignment with explicit start/body/tail boundaries and live runtime hold windows that fit the whole phrase.
- Build a small “reference phrase bank” for start, stage entry, boss damage, hit, explosion, capture/rescue, challenge results, and reward moments.
- Run every candidate through headed listening review before accepting it.

Process/platform change:
- Audio acceptance must require a human listening pass plus measured fit, not just scorer approval.

Expected user-facing outcome:
- The game sounds more legible, more arcade-authentic, and less “technically present but emotionally thin.”

### 3. Impact, hit, and explosion feedback are still too weak

Current evidence:
- Weakest artifact row is `impact-explosion-visual-feedback` at `5.85/10`.
- Direct runtime-vs-target sprite/crop quality is still around `6.0/10`.

Recommended plan:
- Treat hit/explosion feedback as one integrated row: sprite, timing, popup, sound, and lifecycle.
- Build short temporal target sequences for enemy hit, enemy boom, boss first hit, and boss boom.
- Compare live runtime sequences against those target sequences, not just single static crops.
- If the current explosion assets cannot carry the row, replace them instead of endlessly micro-tuning.

Process/platform change:
- Promote temporal feedback sequences to first-class conformance truth, ahead of static proxy scores.

Expected user-facing outcome:
- Successful hits feel sharper, more satisfying, and more obviously “arcade correct.”

### 4. Alien pulse and flap cadence are still not authoritative enough

Current evidence:
- Sprite-motion correspondence is `6.18/10`.
- Weakest motion row is `bee-zako-pulse-pair` at `5.42/10`.

Recommended plan:
- Run a dedicated temporal motion pass on bee, butterfly, and boss line states.
- Use full reference clips and motion sheets, not only labeled single frames.
- Tune animation phase duration, flap order, pulse timing, and dive-state transitions together.
- If the current animation scheduler cannot do this cleanly, change the scheduler rather than trimming the target.

Process/platform change:
- Motion conformance should be judged as time-based animation behavior, not only as frame family presence.

Expected user-facing outcome:
- Aliens look alive and rhythmic instead of correct-looking but visually flat.

### 5. The long-play level arc still needs stronger authored escalation

Current evidence:
- Level arc is `8.6/10`, which is good but still below the meaningful next gate.
- Challenge progression remains weak, which undermines the larger arc.

Recommended plan:
- Convert stage bands into explicit authored identities: opening discipline, mid pressure, rescue/reward variation, late-loop threat density, and challenge punctuation.
- Use persona replay windows for stages `1-4`, `5-8`, and deeper loops before changing tuning.
- Add a human “this run became repetitive here” review checkpoint to the level-arc pass.

Process/platform change:
- Treat level arc as authored content design with named stage-band goals, not only as emergent score movement.

Expected user-facing outcome:
- Longer runs feel more progressive, more teachable, and less repetitive.

### 6. Regular-stage alien entry variety is still not distinct enough

Current evidence:
- Broad alien entry / challenge novelty is `8.2/10`, but the dashboard explicitly warns this must not mask stricter challenge gaps.
- Regular-stage signature distance is still a live design concern.

Recommended plan:
- Enforce minimum separation between opening entry signatures across stage families.
- Add stage-owned entry scripts rather than relying on minor variants of the same geometry.
- Use contact sheets and path traces from multiple references to define “meaningfully different” rather than trusting heuristic distance alone.

Process/platform change:
- Entry-pattern uniqueness should become a hard content rule, not a nice-to-have after combat tuning.

Expected user-facing outcome:
- Stages feel authored from the first few seconds, before the player even starts reading combat intensity.

### 7. Pressure and fairness are not reproducible enough in the most important stress windows

Current evidence:
- Stage 4 pressure exact replay / pressure-curve precision is still around `6.0/10`.

Recommended plan:
- Create a focused pressure lab for the most important stress windows instead of tuning pressure in general play.
- Use deterministic replays for pressure, shot density, escape windows, and death causes.
- Tune only one pressure variable family at a time: attack commits, firing cadence, lower-field occupation, or recovery spacing.

Process/platform change:
- Pressure tuning should move from “play until it feels bad” to replay-backed fairness labs.

Expected user-facing outcome:
- Hard moments feel learnable and consistent instead of arbitrary or randomly punishing.

### 8. Visual cohesion is still vulnerable even when the score looks decent

Current evidence:
- Visual look and feel reads well in aggregate, but user-facing drift still shows up in typography, density, readability, and surface layering.
- Recent work already caught real in-app drift such as duplicate HUD text and score-lane confusion in Guardians.

Recommended plan:
- Run a visible-surface audit of the first 30 seconds, the score strip, challenge results, and end-state screens.
- Remove decorative or layered behavior that reduces readability even if it scores “close enough.”
- Prefer fewer stronger visual decisions over many approximate ones.

Process/platform change:
- Add a “surface simplicity and readability” gate that can override decent aggregate visual scores.

Expected user-facing outcome:
- The game looks more intentional and less like several nearly-correct presentation systems overlapping.

### 9. The quality loop still overvalues artifact freshness relative to player-truth review

Current evidence:
- Recent release-authority work repeatedly hit stale docs, stale review packets, stale lane artifacts, and stale browser assumptions before the real product question.

Recommended plan:
- Make each major quality pass follow this fixed order:
  1. headed localhost review with audio
  2. discrepancy capture
  3. runtime/content fix
  4. harness/doc refresh
  5. release-lane refresh
- Keep a short discrepancy ledger for “in source but not truly in app” findings.

Process/platform change:
- Player-truth review becomes the start of the loop, not the validation epilogue.

Expected user-facing outcome:
- We spend more time moving real felt quality and less time polishing evidence around stale assumptions.

### 10. Too much game feel still lives in code instead of explicit content contracts

Current evidence:
- Challenge timing, audio phrase fitting, sprite motion, score lanes, shell surfaces, and entry grammar have all recently required code-path debugging before they could be improved confidently.

Recommended plan:
- Move more of the quality-critical behavior into explicit content assets:
  - challenge contracts
  - audio phrase contracts
  - sprite-motion cadence contracts
  - stage-entry signature contracts
  - score/result surface contracts
- Build lightweight preview tools for those contracts so the first review can happen without a full gameplay run.

Process/platform change:
- Shift from logic-hidden quality behavior to asset-driven quality behavior wherever possible.

Expected user-facing outcome:
- Higher-quality iteration, fewer regressions, and faster visible improvements per cycle.

## Recommended Attack Order

If the goal is the largest near-term user-quality movement, the best order is:

1. Challenge-stage authored reboot
2. Audio identity reset
3. Impact/hit/explosion sequence rebuild
4. Alien pulse/flap cadence pass
5. Pressure/fairness replay lab
6. Long-play level-arc pass
7. Entry-signature separation pass
8. Visual cohesion cleanup
9. Player-truth-first process change
10. Contract-first content/platform refactor

## What Changes From The Older Plan

The biggest changes from earlier habits are:

- We stop treating all challenge stages as one broad tuning problem.
- We stop treating partial audio keepers as progress unless full-phrase runtime behavior improves.
- We stop letting static proxy scores stand in for temporal sprite and feedback quality.
- We stop placing artifact refresh before player-truth review.
- We start using content contracts and preview tools as core quality infrastructure, not just documentation.
