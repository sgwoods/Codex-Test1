# Hosted Dev Candidate Review Checklist

Use this checklist when comparing a local candidate against the current hosted
`/dev` lane before deciding whether to replace the live integration surface.

Primary comparison surfaces:

- current local candidate on `localhost`
- current published hosted `/dev`

Optional reference surfaces:

- hosted `/beta`
- hosted `/production`

## Review Outcome Rule

A candidate should replace hosted `/dev` only if:

1. it is meaningfully better than the current hosted `/dev`
2. it does not introduce significant regressions in gameplay, platform
   surfaces, or presentation
3. any known remaining issues are explicitly understood and acceptable for
   `/dev`

## 1. Gameplay And Runtime

### Combat responsiveness

Check:

- close-range shots feel immediate and trustworthy
- no obvious missed-hit regressions

How:

- manual play
- `npm run harness:check:close-shot-hit`

### Stage-opening and dive fairness

Check:

- stage-1 dive collisions still feel fair
- hitbox feel has not regressed

How:

- manual play on early stages
- stage-opening correspondence artifacts where relevant

### Progression and persona safety

Check:

- no regression to the repaired `advanced -> expert` relationship
- no new early-stage safety failure

How:

- `npm run harness:check:persona-stage2-safety`
- `npm run harness:check:persona-progression-correspondence`

## 2. Front-Door And Shell Surfaces

### Startup and wait-mode presentation

Check:

- startup copy still looks intentional and current
- wait-mode surfaces remain coherent
- platform/application copy ownership still feels correct

How:

- manual review of front door and wait/demo surfaces
- front-door shell checks where relevant

### Panels and dock actions

Check:

- help / settings / leaderboard / account / feedback panels still open and
  close cleanly
- panel content is not stale, clipped, or visually broken
- dock and shell actions still work

How:

- manual click-through of all visible panels
- any relevant popup or shell harnesses
- preferred bundle:
  - `npm run harness:check:dev-candidate-surfaces`

## 3. Audio Fidelity And Consistency

### Cue correctness

Check:

- player shot, hit, boss-hit, and explosion cues still trigger correctly
- challenge / transition / stage cues still appear in the expected places

How:

- manual review with audio on
- compare against existing audio timing and overlap analyses where relevant

### Audio continuity

Check:

- no missing cues
- no obviously duplicated or clipped cues
- no mismatched atmosphere or theme selection

How:

- manual audio comparison between localhost and hosted `/dev`
- use existing waveform / timing reference artifacts for targeted review
- automated shell/audio smoke in:
  - `npm run harness:check:dev-candidate-surfaces`

## 4. Graphics And Visual Integrity

### Missing or changed assets

Check:

- no missing sprites, icons, logos, or panels
- no broken images or absent runtime-loaded assets
- no stale or inconsistent branded surfaces

How:

- manual visual sweep
- local build output review
- release/publish asset verification for lane work
- graphics and shell surface smoke in:
  - `npm run harness:check:dev-candidate-surfaces`

### UI polish

Check:

- layout still feels polished
- no obvious spacing, clipping, overlap, or readability regressions
- leaderboard and score surfaces remain trustworthy and readable

How:

- manual side-by-side review against hosted `/dev`
- compare multiple viewport sizes when practical

## 5. Release Surfaces

### Lane metadata

Check:

- build info, release notes, and dashboard are present and coherent
- lane metadata matches the candidate state honestly

How:

- inspect local `dist/dev`
- inspect generated `build-info.json`, `release-notes.json`,
  `release-dashboard.html`

### Documentation alignment

Check:

- if the candidate changes release meaning, process, or operator workflow,
  supporting docs are updated

How:

- review relevant source docs before publish

## 6. Regression Confidence

To reduce the chance of regressions despite many prior fixes and deployments,
use all three layers:

### A. Manual comparison

Use for:

- UI polish
- panel behavior
- audio feel
- general visual integrity
- subjective gameplay fairness

### B. Targeted automated checks

Use for:

- any previously fixed bug family
- candidate-specific gameplay/runtime deltas
- nearby regression coverage

Rule:

- if a bug was important enough to fix, it should ideally have a corresponding
  harness or an explicitly documented manual gate

### C. Reference and correspondence artifacts

Use for:

- timing
- spacing
- capture/rescue behavior
- challenge-stage timing
- persona progression
- audio timing/fidelity

Rule:

- prefer measurable correspondence over memory-only judgments

## 7. Review Close-Out

Before deciding to replace hosted `/dev`, write down:

1. what is better than the current hosted `/dev`
2. what was checked manually
3. what was checked automatically
4. what remains known but acceptable
5. whether this candidate is strong enough to continue shaping toward `/beta`

If those answers are weak or vague, do not replace hosted `/dev` yet.
