# Release Versions And Promotion

The release path is localhost -> /dev -> /beta -> production.
Promotion moves a tested source candidate forward. Lane labels are not all
members of the same numerical sequence.

For the October 24 candidate:

| Lane | Display label | Build | Source |
| --- | --- | --- | --- |
| Development | 1.4.1.6 | 1218 | ea779a76 |
| Beta | 1.4.2-beta.5 | 1218 | ea779a76 |
| Current production | 1.4.1 | 1164 | 54398ff5 |

Development 1.4.1.6 means the sixth development increment based on the current
production family 1.4.1. It is a custom four-part label, not a SemVer release.
Beta 1.4.2-beta.5 means the fifth named prerelease candidate for target 1.4.2.
It does not mean five publications occurred. Build1218 and source ea779a76
show that these dev and beta artifacts came from the same source build.
Lane configuration and packaging can differ even when source identity matches.

Compare source ancestry and build provenance, not the display labels alone.
Normally dev has the beta source or newer work. Rollbacks and release-branch
fixes can create exceptions, which must be documented. Localhost is a testing
location, not a version: it can serve either current source or a frozen package.

Production preparation must retain the accepted beta file inventory, identify
any packaging-only changes, validate documentation and pass release gates.
Changing a label alone does not approve or publish a release. Future naming
should use a common target release family to reduce this ambiguity. This note
does not rename the already published artifacts.
