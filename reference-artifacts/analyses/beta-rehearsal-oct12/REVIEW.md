# Local Beta Package Rehearsal

October 12, 2026. Local preparation only. No hosted lane changed.

## Identity

- Source HEAD: cf0e7a666067ede385865ba02e73d1454eb132d1, with dirty accepted local changes.
- Enemy source SHA256: 1b442dfae869fe3f8a7cc39edaaa2d05860b3a7cdf33c5e796ebae13167ce532.
- Development bundle SHA256: 9c320d50301a46f93f8f27bcc2f28af412b88043ba00e411f4a329c8585ef4fa.
- Beta bundle SHA256: e932228979b5f0faa8bb5a2135f4a2f565370e81427732b97dac3220d1ccf0d3.
- Generated label: 1.4.1-beta.1+build.1226.sha.cf0e7a66.beta. This is a rehearsal label, not the assigned next release.
- Working package: /private/tmp/aurora-beta-rehearsal-oct12.yXDGXV.
- Persisted copy: private-artifacts/beta-rehearsal-oct12, including both packages, tools, source snapshots and raw evidence.

The promotion tool sets dirty:false and branch:beta even when its input was dirty.
promotedFromState retains that input state. Neither the label nor HEAD alone
identifies these local gameplay changes; use the hashes above. The lead served
development bytes and copied development bytes matched exactly after building.

## Executed Checks

1. Local node tools/build/promote-beta.js in the isolated directory: passed.
2. check-public-package-runtime.js --root dist/beta --expected-sha <full HEAD> --flows: passed.
3. check-security-release-gate.js --lane beta --json --write: passed; six tracked findings not observed.

Runtime evidence is runtime.json. Both games boot, reach game over, restart and
retain audio volume settings. Game switching works. Aurora Professional Watch
shows its challenge result and advances. Public harness exports are absent;
development review/reference controls are disabled. The unprivileged Stage31
schedule override is rejected without replacing runtime. No script errors,
missing local assets or private-audio requests occurred. All external network
and WebSocket traffic was blocked during this smoke.

## Limits And Next Gates

Independent follow-up: analyses/beta-package-security-oct12 verifies599 beta
files against50 distinct private-audio hashes, with zero whole-file matches.
Test-account configuration is cleared. However, releases.html and
project-overview-slides.html lack meta CSP. This P2 packaging/coverage gap needs
repair or explicit disposition before candidate freeze. The gate's six absent
observations do not establish package-wide policy coverage. Inert src/ reference
documentation remains; no clip href/byte exposure was found. Transformed/embedded
media is outside the exact-file hash comparison.

This is controlled-browser-clock testing, not audible audio, live authentication,
playlist availability, long-run fairness or hosted acceptance. The security
gate warns rather than blocks beta; inspect its six dispositions and independent
byte audit instead of treating exit zero as comprehensive security acceptance.
Remote score writes remain disabled. Existing game-over copy still invites sign-in
to claim a verified score; reconcile that wording with actual public capabilities
before freezing player-facing release notes. No account/backend policy changed.

Required next: final gameplay dispositions, clean reviewed source/version,
authorized matching hosted dev, repeated exact-candidate package checks,
bounded soak/live auth/audio checks, and explicit beta publication approval.
