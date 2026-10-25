# Release Conformance Input Transfer (October 25, 2026)

User-approved transfer of existing, immutable reference reports from the primary
checkout (`/Users/sgwoods/Development/Codex/Codex-test1`) into the production
pipeline checkout at `84a6c134`. These inputs are gitignored by default and
were force-added so `npm run harness:refresh:release-conformance-docs`
reproduces the accepted e557af14 conformance measurements.

- Inputs: every report cited by the e557af14 conformance economics, release
  dashboard, application-artifact and challenge artifacts that was absent from
  the pipeline checkout, plus sibling `README.md` files from the primary
  quality-conformance and level-arc-conformance report directories.
- Integrity: `primary-inputs.sha256` lists SHA-256 hashes taken from the
  primary checkout; every copied file matches (`shasum -a 256 -c`).
- Report selection: the generators pick the latest report by file mtime, so
  mtimes of byte-identical report.json files were aligned to the primary copies
  before the refresh.
- Result: regenerated economics, dashboard and application-artifact JSON is
  identical to the e557af14 output except generatedAt, commit, branch and
  artifact paths. Overall 8.7/10, audio 7/10, level arc 8.6/10, application
  average 7.46 are unchanged. No scoring policy or age window changed.
