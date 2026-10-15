# Actual Public-Package Runtime Smoke

October 4, 2026. Source 032cd18d3e288795658ba701afce4e498c93dd8e.
Temporary production build 1206; dirty marker reflects an untracked validation
tool, not changed game source. This is not a beta promotion or publish.

report.json records successful final runtime checks, method and bundle SHA-256.
static.json records zero private audio entries and SEC001-006 observations false.
An empty reference-audio directory is allowed by the byte exclusion test.

Passed:
- Aurora and Guardians normal Stage 1 starts, owned runtime and advancing clocks.
- Aurora/Guardians pre-start switching.
- Strictly absent named harness exports.
- Hidden/disabled Stage 5 review controls; synthetic event reaches the bound
  listener but starts no runtime. The handler is closure-private, not removed.
- Disabled private audio and Aurora local-reference preset.
- Nonblank canvas buffers: 454,792/103,144 colored pixels for Guardians/Aurora.
- No page exceptions, missing same-origin responses/failed requests or private
  audio requests during the bounded test.

Disposable Chromium contexts, service workers blocked, all non-local requests
and WebSockets blocked; browser and ephemeral loopback server closed on exit.
No persistent browser profile, shared build replacement, push or publication.
The fresh temporary build preserved dist/dev's 656-entry snapshot hash:
71bf70e27e55817e3127495993e645430ee0f259702667ab7a8a5d53ba3a8bdb.

Command:
```sh
node tools/harness/check-public-package-runtime.js --root /path/to/public/package --expected-sha 032cd18d3e288795658ba701afce4e498c93dd8e
```

The tool never rebuilds or promotes. It requires an explicit actual public
package and source identity. For this test the package root is
/var/folders/z8/hqkwn1q543zgs63rhbqlpsbr0000gn/T/aurora-public-package-GTSYn7.
The complete tested public package is persisted as package.tar.gz, with archive
SHA-256 in static.json. Results/method/bundle hashes and source are retained.
Local Git persistence is not an off-machine backup; no push/upload occurred.

Not established: hosted auth/CSP, playlist availability, audible audio, all
assets visually identified, packaged beta acceptance, or long-run gameplay.
Nonblank pixels are a weak rendering smoke, not conformance. Runtime request
monitoring alone cannot detect unused private bytes; static exclusion is separate.
