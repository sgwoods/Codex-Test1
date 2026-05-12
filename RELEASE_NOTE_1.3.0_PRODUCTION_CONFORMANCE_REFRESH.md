# Release Note: 1.3.0 Production Conformance Refresh

Date: May 12, 2026

Release track: production refresh inside the public `1.3.0` family

Source promotion path: accepted `1.3.0.1` hosted-dev review bundle -> hosted
`/beta` -> hosted `/production`

## Summary

This release keeps the public SemVer family at `1.3.0` while promoting the
accepted `1.3.0.1` hosted-dev review bundle into the live hosted `/beta` and
hosted `/production` lanes.

That matters because the fourth-segment `1.3.0.1` line is a hosted-dev review
signal, not the public package version. Public production still presents itself
as `1.3.0+build...`, but it now carries the stronger conformance/documentation
bundle that was previously isolated to hosted `/dev`.

The public effect is a more trustworthy Aurora / Platinum release: stronger
player-facing documentation, clearer provenance, a better measured conformance
story, improved runtime ship-loss audio feedback, and a release package that
explains not just what changed, but why the team believes it.

Retrospective versioning note:

- this production push remained in the public `1.3.0` family
- going forward, a production bundle with this much game-quality improvement,
  conformance lift, and ingestion/release-surface optimization should normally
  ship as at least a new `PATCH` release
- same-version production reuse should be reserved for production-failure
  repair rather than treated as the normal way to carry substantial value

## What Players And Reviewers Get

- A production line that is better documented in public, not only better
  described in engineering chat.
- A measured calibrated ship-loss cue lift that preserves a fuller arcade-like
  death phrase while keeping cue alignment guardrails intact.
- Better protection around inter-level, final-loss, and game-over audio starts
  so browser runtime capture no longer silently drops critical cue moments.
- A public project page, project guide, release dashboard, and conformance
  dashboard that now explain persistent artifact provenance, score movement,
  and resource economics as first-class parts of the product story.
- Clearer layered release identity across the integrated release, the Platinum
  host, Aurora, and Galaxy Guardians.

## Main Production Improvements

### 1. Conformance Story Is Public-Facing Now

The public project surfaces now describe the real conformance effort rather than
only presenting a thin product shell.

That includes:

- provenance-backed generated documentation
- release-facing conformance dashboards
- resource-economics reporting
- application artifact scoring
- runtime static sprite-capture scoring
- a clearer explanation of score meaning, confidence, and next investments

This means a future reader can inspect what the project believes, what evidence
it is using, and what still remains weak without needing repository archaeology
or prior chat context.

### 2. Audio/Event Feedback Improved With Measurement

The accepted runtime audio lift in this refresh is the calibrated layered
`playerHit` ship-loss phrase.

Why it shipped:

- cue alignment remained green
- semantic event scoring stayed strong
- focused candidate gates held
- browser-reference comparison improved
- the player-facing moment became more arcade-complete than the prior shipped
  line

This does not claim the audio problem is solved. It does mean the public line
now carries a real measured improvement rather than only pipeline/process work.

### 3. Documentation Provenance Is Enforced

Generated public pages now explicitly explain that they are assembled from
persistent repository artifacts and maintained source docs.

The provenance source is captured in `documentation-provenance.json` and
rendered into the public project page and project guide. Release freshness
checks now fail if that source map or those rendered sections disappear.

That is important for a project whose long-term promise depends on repeatable
ingestion, evidence-backed conformance work, and durable release reasoning.

### 4. Layered Release Identity Is Stronger

This refresh continues the move away from one flattened version story.

The release now more clearly distinguishes:

- integrated bundle identity
- Platinum platform identity
- game-owned release identity
- build identity
- hosted-dev review-line identity

Aurora remains the primary shipped game. Galaxy Guardians remains a preview
application, but its pack-owned identity and release metadata are now kept more
honestly aligned with the production-capable preview runtime.

## Current Quality Read

Current maintained Aurora read for this refreshed public family:

| Area | Current Read | Notes |
| --- | ---: | --- |
| Overall quality | `9.2/10` | Stronger than the older shipped `1.3.0` baseline. |
| Audio identity and cue alignment | `7.3/10` | Still the weakest high-value category. |
| Audio semantic event score | `9.78/10` | Meanings remain strong. |
| Audio acoustic event score | `6.31/10` | Main residual runtime audio gap. |
| Audio cue alignment | `9/9` | Alignment guardrail preserved. |
| Level arc and encounter shape | `8.8/10` | Now a first-class release-facing category. |
| Alien entry and challenge novelty | `7.8/10` | Strong next-cycle gameplay-authenticity target. |
| Boss entry and formation grammar | `9.2/10` | Broadly strong, with room for tighter path/slot precision. |
| UI, shell, and graphics integrity | `9.2/10` | Public-facing surfaces remain green after the doc/dashboard refresh. |

Important interpretation:

- `10/10` means maxed at current scorer resolution, not perfect arcade
  imitation
- a better scorer may lower a number while improving truthfulness
- the project should keep treating confidence, resolution, and cost as part of
  the release story, not as invisible background metadata

## Release Evidence

This refreshed production line is supported by:

- current conformance dashboard source and generated hosted dashboard
- documentation freshness checks
- provenance-backed public project pages and guides
- application artifact scoring and runtime sprite-capture scoring
- accepted beta promotion on the release-authority machine
- production publish verification plus public project-page sync verification

The release is therefore not just "the code seems okay." It is a documented,
verified promotion with a public explanation of evidence and remaining gaps.

## Accepted Gaps

This production refresh intentionally does not claim completion on:

- audio identity beyond the improved ship-loss phrase
- challenge-stage arrival authenticity and novelty depth
- full temporal sprite-motion scoring
- richer later-level pressure and reward texture
- fully mature second-game conformance for Galaxy Guardians

Those are next-cycle targets, not hidden regressions.

## Next Direction

Now that the refreshed `1.3.0` public family is live, the next coherent pickup
is `1.4.0`.

That next family should emphasize:

- audio/event feedback beyond cue correctness
- alien entry variation and challenge-stage novelty
- level arc and encounter shape
- boss/formation grammar precision
- visual reference grounding
- cleaner Platinum/application seams
- ingestion-backed progress for Galaxy Guardians and future games

## Release Message

Short external framing:

Aurora / Platinum `1.3.0` has been refreshed with stronger public
documentation, a better measured conformance story, clearer artifact
provenance, and a real audio/event-feedback lift while keeping the product
honest about what still needs work for the `1.4.0` arcade-depth cycle.
