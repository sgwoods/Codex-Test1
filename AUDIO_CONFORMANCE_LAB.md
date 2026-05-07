# Platinum Audio Conformance Lab

The Platinum audio conformance lab is the shared workflow for improving game
audio from measured reference evidence instead of subjective tuning alone.
`Galaxy Guardians` is the first registered consumer, but the harness is designed
so Aurora and future game packs can use the same pattern.

## Principle

Game packs own their cue recipes and semantic cue catalogs. Platinum owns the
repeatable analysis path:

- register the game pack and audio theme in `tools/harness/audio-conformance-games.js`
- load promoted reference cue windows and runtime cue recipes
- synthesize the runtime cues in a deterministic CPU-only renderer
- compare runtime cues against promoted reference windows
- export JSON metrics plus waveform/spectrogram PNG previews
- keep raw copyrighted reference audio out of source control

Common audio analysis belongs in Platinum harness utilities, not inside a
single game. Game-specific inputs are configuration and artifacts.

## Current Guardians Baseline

The first Guardians lab artifact is:

`reference-artifacts/analyses/audio-conformance-lab/galaxy-guardians-preview/audio-conformance-lab-0.1.json`

Readable report:

`reference-artifacts/analyses/audio-conformance-lab/galaxy-guardians-preview/audio-conformance-lab-0.1.md`

Current result:

| Metric | Score |
|---|---:|
| Runtime cue lab score | `8.3/10` |
| Guardians reference conformance | `7.7/10` |
| Guardians playtest-weighted conformance | `6.9/10` |
| Compelling preview target | `7.0/10` |

The lab score is intentionally not the public audio score. It says the current
runtime cue recipes are much closer to the promoted reference-window shapes. The
playtest score remains below the compelling-preview target until human listening
confirms the cue windows and live mix.

## Commands

```sh
npm run harness:analyze:galaxy-guardians-audio-conformance-lab
npm run harness:check:galaxy-guardians-audio-conformance-lab
```

Generic form:

```sh
npm run harness:analyze:platinum-audio-conformance-lab -- --game galaxy-guardians-preview
npm run harness:check:platinum-audio-conformance-lab -- --game galaxy-guardians-preview
```

## Add Another Game

1. Add a game registration in `tools/harness/audio-conformance-games.js`.
2. Point it at the pack source, pack global, audio theme, candidate cue names,
   and reference artifacts.
3. Promote source cue windows into a labeled cue artifact.
4. Run the generic analyzer and checker.
5. Update that game's candidate/conformance docs with the lab artifact.

## Next Audio Work

The next Guardians pass should be a human listening review of the generated
runtime/reference cue preview pairs. Mark each reference window as clean or
dirty, replace dirty windows, then retune the runtime mix and event density in
live browser play.

## Current Aurora Audio Read

Aurora's audio comparison harness now captures browser-generated Aurora and
synthetic Galaga-theme cue samples, converts them to WAV, computes active-window
waveform/spectral metrics, and classifies whether each labeled reference clip is
usable as a direct cue comparison or still needs tighter segmentation.

Current artifact:

`reference-artifacts/analyses/aurora-audio-theme-comparison/2026-05-07-main-beb232a/metrics.json`

Current result:

| Metric | Value |
|---|---:|
| Quality score audio category | `6.3/10` |
| Active Aurora-vs-synthetic-Galaga duration delta | `0.178s` |
| Active Aurora-vs-reference duration delta | `3.236s` |
| Active Aurora-vs-reference centroid delta | `387.7Hz` |
| Broad reference windows needing segmentation | `7/14` |
| Candidate reference subwindows found | `22` |

This means Aurora's internal synthetic theme comparison is close, but the
reference-facing audio score remains intentionally conservative until the broad
Galaga clips are segmented into cleaner cue windows and the runtime cue shapes
are tuned against those windows.
