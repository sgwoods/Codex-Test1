# Local Candidate Freeze - October 14, 2026

Owner: Aurora Project Lead. Branch: codex/oct03-local-integration.
Review baseline: cf0e7a666067ede385865ba02e73d1454eb132d1.
Authorization: review/checkpoint accepted source and freeze the local candidate.
No push, main integration, hosted dev, beta or production publication.

## Scope And Player Outcome

Preserve the accepted October 7-13 work as a reproducible candidate. Players keep
the smoother challenge exits, tested ship separation and demonstrated shooting
opportunities. Later combat pressure stops increasing after Stage 30 while stage
progression continues. The checkpoint itself adds no gameplay behavior.

The source range includes boot/combat pressure, enemy paths/lifecycle, a renderer
culling-bound helper, browser measurements, legal-input pilot/audit tools, and
public-package CSP/referrer coverage. Historical rejected-trial artifacts are
evidence, not additional accepted source changes. Guardians source and Stage 7
authoring are unchanged. Existing evidence is retained with original identities.

## Version Policy

Keep package/platform/application version 1.4.1 and development line 1.4.1.1.
Identify this local candidate by its clean source commit and normal generated
commit-count build label. Do not reuse the old dirty build as the frozen build.
Do not assign a beta version or change release manifests during checkpointing.
The following validation record names the exact rebuilt artifact separately so
the source commit does not contain a self-referential commit SHA.

## Acceptance And Limits

Prior accepted enemy SHA256:
1f5df7a14c1b8819c6f73e885182d719e5e35b37fac82b545233db88e05dac31.
Renderer SHA256:
0dc985230420bb1281a22992ca9cd78b8516196f81b19a6c1d71e7a761c036cc.
Primary packet: reference-artifacts/analyses/blue-path-oct13/README.md.

Require the clean rebuilt candidate to pass the 34-case blue gate, ten-case
green/yellow clearance gate, saved 37/33/37-hit normal-input replays, and existing
early challenge-motion checks. Preserve source hashes. Record localhost HTTP
identity against this checkout, not only the build-info label.

Known tradeoffs remain: later no-fire stages contain 2.4-3.2 seconds more visible
play, some individual full-view windows shorten up to 0.350 seconds, and Stage 35
hit timing changes while all demonstrated target hits remain. No claim of exact
Galaga geometry/speed, all-seed safety or perfect feasibility is made.

## Review And Checks Before Commit

Two independent read-only specialist reviews cover gameplay and release/test
tooling. Record their final results in the validation follow-up.
Lead checks: security meta positive/negative fixtures, bounded-combat callsite
fixtures (180 early comparisons), feasibility audit/options, syntax of all changed
non-template JavaScript, and git diff whitespace checks pass. The boot source
contains build placeholders, so direct node --check is not applicable there;
the generated build and browser execution validate its substituted form.

The no-mistakes home command reports this repository is not initialized. No
pipeline run, configuration change, automatic push, PR or CI pass is claimed.
Existing release gates must still run for the authorized release lane.

Cached whitespace validation passes for source, tools, docs and reports. Archived
.patch files retain original mixed-indentation context and produce whitespace
warnings when treated as newly added prose; they are preserved byte-for-byte,
not applied to the candidate. Three historical raw contact reports are about
68-69 MB each. This local checkpoint preserves them, but future remote delivery
must review repository size/large-file handling before any push.

## Next Boundary

After this checkpoint: matching authorized dev review through existing gates;
then exact beta package/security/runtime, bounded sustained play, live sign-in,
audible audio and final beta approval. Beta remains NOT READY. Local validation
does not replace these release checks. Do not start more gameplay tuning without
a demonstrated new defect and a bounded repair decision.
