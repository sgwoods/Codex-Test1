# Neo Galaga Tribute

A keyboard-only Galaga-style shooter tuned for closer arcade behavior and polished for localhost play in Chrome on macOS.

## Run on macOS (MacBook Pro M4)

1. Open Terminal in this folder:
   ```bash
   cd /Users/stevenwoods/Documents/Codex-Test1
   ```
2. Start a local web server:
   ```bash
   python3 -m http.server 8000
   ```
3. Open the game in Chrome:
   - `http://localhost:8000`

## Controls

- `Left/Right` or `A/D`: Move
- `Space`: Fire (arcade-style 2-shot limit)
- `P`: Pause
- `F`: Toggle fullscreen
- `U`: Toggle ultra-scale rendering (enabled by default)
- `Enter`: Start / Restart

## Fidelity features in this build

- Fixed arcade playfield (`280x360`) with integer scaling and centered letterboxing in fullscreen
- Deterministic Stage 1 opening timeline (first ~45s) for repeatable entry/attack comparison
- Explicit hit zones for player/enemy/bullets and a narrow tractor-beam capture core
- 40-enemy core formation spirit (boss + butterfly + bee composition)
- Stage progression with challenging stages on stage 3, 7, 11, ...
- Boss escort dives with Galaga-like dive scoring behavior
- Boss capture flow with tractor beam and true rescue constraints:
  - captured fighter is rescued only if carrying boss is destroyed while attacking
  - destroying carrying boss in formation forfeits immediate rescue
- Stage 1-3 timing profile tuned to lower missile pressure and narrower spread
- Richer synthesized arcade audio (layered oscillators, sweeps, filtered noise)
- Significantly upscaled playfield geometry (formation spacing, ship size, beam length, projectile scale)
- Formation now sits in the upper screen band with a larger defender-to-formation gap (closer to original Galaga framing)
- More realistic rendered graphics (layered hull shading, canopy highlights, glow, scanline/vignette/chromatic post effects)
- Persistent high score in browser local storage
