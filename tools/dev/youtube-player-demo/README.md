# YouTube Playlist Demo

Minimal standalone page based on the official YouTube IFrame API demo/reference, but pointed at a playlist instead of a single video.

## Start

```bash
npm run youtube:player-demo
```

Then open:

```text
http://localhost:8311/
```

## What It Is

- One visible YouTube player
- Official API bootstrap via `https://www.youtube.com/iframe_api`
- One playlist demo, defaulting to: `PLeDzKA-Cr6s-8b_YaTTleSX-h3X2QdQCo`
- Small status label reflecting player state

This page is intentionally separate from the Platinum cabinet and from the Arcade Music Lab so the base API behavior can be checked in isolation.

## Important Hostname Finding

For the PlatinumArcade1981 playlist shared from YouTube/Iframely, the hostname matters in a real browser:

- `http://localhost:8311/...` can render a working embedded player
- `http://127.0.0.1:8311/...` can show `Video unavailable` for the exact same iframe code

So when checking the plain embed case, prefer `localhost` over `127.0.0.1`.
Adding `origin=http://127.0.0.1:8311` to the YouTube embed URL did not change the `127.0.0.1` failure in Chrome.

## Optional Query Param

Use a different playlist:

```text
http://localhost:8311/?list=YOUR_PLAYLIST_ID
```

## Plain Share Embed

There is also a plain non-API iframe page for testing the exact `Share -> Embed` path:

```text
http://localhost:8311/share-embed.html?video=VIDEO_ID
```

Example:

```text
http://localhost:8311/share-embed.html?video=OZGRW-T2Vgk&si=AVLoqe9px6LQK_xe
```

There is also a responsive playlist embed page using the plain `<iframe>` wrapper pattern:

```text
http://localhost:8311/share-embed-responsive.html?list=PLWDxjyS0X-zlKJsel_7Kg3ALGlSD89zSH&si=2EVKnsRK37Kbwx3H
```

There is also an Iframely-style playlist page using the exact wrapper pattern the user tested manually:

```text
http://localhost:8311/iframely-playlist-embed.html?list=PLWDxjyS0X-zlKJsel_7Kg3ALGlSD89zSH&si=X6srHue0rQA7rfFE
```
