# Galaga Target Artifact Corpus

This directory records the online and local artifacts that best illustrate the
Galaga-like target Aurora is trying to measure against. The corpus is not a raw
media dump. It is a source manifest for repeatable ingestion, evidence review,
and gap planning.

Run:

```sh
npm run harness:analyze:galaga-target-artifact-coverage
npm run harness:check:galaga-target-artifact-coverage
```

The analyzer writes the durable status report under:

`reference-artifacts/analyses/galaga-target-artifact-coverage/latest.json`

## Policy

- Prefer official, manual, and measured gameplay references before subjective
  tuning.
- Keep copyright-sensitive raw gameplay and audio out of source control unless
  the project has an explicit reason and permission to preserve it.
- Commit derived, reviewable evidence instead: source manifests, timestamp
  windows, contact sheets, frame indexes, path labels, metrics, and reports.
- Challenge-stage work should not claim high conformance until later challenge
  stages have explicit media-backed labels, especially alien type, movement,
  group order, exit side, and perfect-bonus opportunity.
