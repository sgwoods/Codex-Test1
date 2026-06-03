# `1.4.1` Production Assessment And Recommended Release Spine

As of June 3, 2026, the live hosted lanes are:

- hosted `/dev`
  - `1.4.0.1+build.1011.sha.ea43155b`
- hosted `/beta`
  - `1.4.0-beta.1+build.1011.sha.ea43155b.beta`
- hosted `/production`
  - `1.4.0+build.894.sha.1dc23d8a`

## Current Assessment

Short answer: do **not** promote the current candidate to hosted `/production`
as `1.4.1` yet.

Why:

1. The release blocker moved, but the candidate still is not strong enough.
   - The Arcade Music dock-button regression is now fixed.
   - The public-safe Aurora audio fallback now prevents hosted/public-safe
     gameplay from requesting private reference clips for core loss/effect cues.
   - The changed-area dock harness is green again:
     - `node tools/harness/check-dock-button-actions.js`
   - The candidate still does not justify production because the broader
     quality scorer is now only `8.7/10`.

2. The strongest standing gameplay-quality gap remains unresolved.
   - The current release conformance dashboard still reports:
     - overall quality: `8.7/10`
     - challenge-stage set-piece conformance: `4.2/10`
   - That is good enough for the current hosted `/beta` preview lane, but still
     below the confidence bar for a new production claim.

3. Current release evidence still says public readiness should be deferred.
   - The generated conformance bundle continues to frame the game as a
     non-production preview candidate rather than a production-ready new public
     promise.

4. The release-facing conformance artifacts themselves need a freshness pass
   before a serious production decision.
   - We now have a refreshed scorer run and a repaired dock gate, but the
     production-facing documentation set still contains consistency drift that
     should be cleaned before a new public promotion.

## Practical Recommendation

Treat the current candidate as:

- strong enough to keep hosted `/dev` and hosted `/beta` current
- not yet strong enough to become hosted `/production` as `1.4.1`

The right near-term goal is:

1. fix the dock-button harness regression introduced by the warmup feature
2. finish the documentation consistency cleanup for the active `1.4.0` public
   line and `1.4.1` candidate story
3. rerun the authority-machine release spine
4. then decide whether the candidate story is strong enough for a production
   patch release

## Recommended Release Spine

The release process should be treated as a staged quality funnel, not only a
publish script chain.

### 1. Local `localhost`

Purpose:

- active engineering
- narrow bug fixing
- gameplay tuning
- platform/application review before any hosted claim

Should be required here before a serious lane move:

1. local build succeeds
   - `npm run build`
2. targeted changed-area harnesses pass
3. at least one nearby regression or boundary check passes
4. manual browser review is completed when feel, audio, timing, motion, or UI
   changed
5. code review packet is current enough to justify the change
   - `npm run review:code`
   - `npm run review:code:check`

When the change affects release-facing conformance claims:

6. refresh release-owned conformance artifacts
   - `npm run harness:refresh:release-conformance-docs`

### 2. Hosted `/dev`

Purpose:

- shared hosted integration preview
- candidate review surface

Should be required before publishing:

1. clean authority checkout or explicitly intentional integration checkout
2. lane metadata and release docs coherent
3. publish preflight passes
   - `npm run publish:check:dev`

Should be required after publishing:

4. live lane verify succeeds
5. manual hosted review is completed across:
   - application behavior
   - platform shell / dock / overlays
   - music / audio startup behavior
   - score / auth / replay / boundary messaging
   - release/documentation surfaces

What `/dev` should answer:

- "Is this candidate coherent enough to review seriously?"

### 3. Hosted `/beta`

Purpose:

- serious reviewed release candidate

Should be required before promoting/publishing:

1. hosted `/dev` matches the exact authority-machine candidate intended for beta
2. changed-area harnesses plus broader candidate checks pass
3. release conformance docs are fresh
4. code review dispositions are complete
5. manual hosted review of `/dev` is accepted, not just "probably fine"

Should be required after publishing:

6. live `/beta` verification succeeds
7. explicit beta review is completed for:
   - gameplay quality
   - platform quality
   - release-surface quality
   - no-regression confidence

What `/beta` should answer:

- "Would we be comfortable promoting this candidate if no new issue appears?"

### 4. Hosted `/production`

Purpose:

- public stable promise

Should be required before promoting/publishing:

1. approved hosted `/beta`
2. clean release-facing docs and notes
3. production preflight passes
4. production-only boundary checks pass
5. public value is real enough to justify a SemVer step

Should be required after publishing:

6. live production verification succeeds
7. public mirror / public project sync verification succeeds
8. final release note and lane state are committed

What `/production` should answer:

- "Is this a better public promise than the currently shipped version?"

## Testing Load By Stage

Recommended testing intensity:

- `localhost`
  - light to medium, targeted
- `/dev`
  - medium, candidate-coherence focused
- `/beta`
  - medium-high to high, candidate-approval focused
- `/production`
  - highest confidence, but mostly verification and release-discipline focused

In other words:

- do not spend production-level effort on every local tweak
- do not let `/beta` become "just `/dev` but public"
- do not let `/production` move unless the candidate story is stronger than
  "nothing obviously broke"

## Next Best Actions

1. Keep the dock-button harness/runtime fix.
2. Finish the documentation consistency cleanup on the current head.
3. Re-run the authority-machine candidate spine:
   - build
   - review/code gate
   - changed-area harnesses
   - release conformance scorer
4. Reassess whether the resulting candidate deserves `1.4.1`.
