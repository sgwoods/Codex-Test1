# Galaga Alien Target Quality Audit

Generated: 2026-06-25T18:06:16.752Z

Purpose: make target quality visible before sprite tuning. A runtime sprite can score well against a weak target, so this audit separates source/target authority from runtime conformance.

## Summary

- Status: target-quality-gaps-explicit
- Audited roles: 4
- Usable with caveats: 3
- Blocked targets: 1
- Lowest quality role: challenge-specialty-aliens (2.07/10)
- Contact sheet: `reference-artifacts/analyses/galaga-alien-target-quality-audit/latest-contact-sheet.svg`

## Role Readout

| Role | Status | Quality | Authority | Key Issues | Next Measurement Step |
| --- | --- | ---: | ---: | --- | --- |
| Boss Galaga | target-quality-usable-with-caveats | 5.4/10 | 7.5/10 | compact/inferred model support is thin<br>one or more target crop PNGs are private or unavailable locally | Keep target-crop scoring primary; improve inferred model row support before using model rows as visual truth. |
| Bee / Zako | target-quality-usable-with-caveats | 5.49/10 | 7.5/10 | one or more target crop PNGs are private or unavailable locally | Use as a tuning target, while preserving authority metadata in score reports. |
| Butterfly / Escort | target-quality-usable-with-caveats | 6.15/10 | 7.5/10 | one or more target crop PNGs are private or unavailable locally | Use as a tuning target, while preserving authority metadata in score reports. |
| Challenge Specialty Aliens | target-quality-blocked | 2.07/10 | 3.2/10 | no release-grade target authority<br>no trusted video-derived target crop<br>compact/inferred model support is thin<br>one or more target crop PNGs are private or unavailable locally<br>missing temporal target sequence | Promote clean video-derived target windows before tuning runtime sprites against this role. |

## Measurement Rule

Future sprite tuning should cite both runtime score and target quality. Challenge specialty aliens are intentionally blocked as release-facing conformance targets until clean challenge-stage windows replace planning-only sheet cells.
