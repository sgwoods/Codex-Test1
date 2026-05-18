# Aurora Challenge Perfect Audio Candidate Analysis

Generated: 2026-05-15T21:20:06.816Z
Commit: eb6d951f
Repetitions per candidate: 2
Capture preroll: 80ms

## Problem

Challenge Perfect is the highest current segment-level audio gap: the cue is semantically correct and celebratory, but the measured onset is too peaky, too high-crossing, and too collapsed versus the Galaga perfect-clear reference phrase.

## Decision

- Status: `no-keeper`
- Best: `none`
- Measured best: `refclip-s0-d320-v105`
- Reason: No Challenge Perfect candidate cleared whole-cue, segment, duration, band, centroid, and role-match gates.

| Candidate | Risk | Worst Segment | Composite | Cadence | Masking | Duration Gap | Band Gap | Stability | Keeper Read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Challenge Perfect reference 0s/0.32s v1.05 | 0.64 | onset 2.94 | n/a | n/a | n/a | 0s | 0.0233 | 2x, risk sd 0 | scheduled cue duration 0.32s < 1.1s ceremony minimum |
| Challenge Perfect reference 0s/0.32s v0.95 | 0.65 | onset 2.53 | n/a | n/a | n/a | 0s | 0.0239 | 2x, risk sd 0.005 | scheduled cue duration 0.32s < 1.1s ceremony minimum |
| Challenge Perfect reference 0.02s/0.17s v1.05 | 0.68 | onset 1.99 | n/a | n/a | n/a | 0.01s | 0.0238 | 2x, risk sd 0 | scheduled cue duration 0.17s < 1.1s ceremony minimum |
| Challenge Perfect reference 0.02s/0.24s v1.16 | 0.7 | onset 2.01 | n/a | n/a | n/a | 0.01s | 0.0236 | 2x, risk sd 0.015 | scheduled cue duration 0.24s < 1.1s ceremony minimum |
| Challenge Perfect reference 0.02s/0.17s v1.16 | 0.7 | onset 2.01 | n/a | n/a | n/a | 0.01s | 0.0236 | 2x, risk sd 0.015 | scheduled cue duration 0.17s < 1.1s ceremony minimum |
| Challenge Perfect reference 0s/0.17s v1.05 | 0.71 | onset 1.48 | n/a | n/a | n/a | 0s | 0.0259 | 2x, risk sd 0.005 | scheduled cue duration 0.17s < 1.1s ceremony minimum |
| Challenge Perfect reference 0s/0.32s v1.16 | 0.77 | onset 1.23 | n/a | n/a | n/a | 0.015s | 0.0144 | 2x, risk sd 0.025 | scheduled cue duration 0.32s < 1.1s ceremony minimum |
| Challenge Perfect reference 0s/0.24s v1.05 | 0.77 | onset 2.22 | n/a | n/a | n/a | 0.005s | 0.0275 | 2x, risk sd 0.045 | scheduled cue duration 0.24s < 1.1s ceremony minimum |
| Challenge Perfect reference 0s/0.17s v0.86 | 0.78 | onset 0.84 | n/a | n/a | n/a | 0s | 0.0226 | 2x, risk sd 0.085 | scheduled cue duration 0.17s < 1.1s ceremony minimum |
| Perfect onset and body | 0.78 | onset 2.3 | n/a | n/a | n/a | 0.01s | 0.0187 | 2x, risk sd 0.04 | scheduled cue duration 0.24s < 1.1s ceremony minimum |
| Challenge Perfect reference 0s/0.17s v0.95 | 0.79 | onset 1.87 | n/a | n/a | n/a | 0s | 0.0225 | 2x, risk sd 0.13 | scheduled cue duration 0.17s < 1.1s ceremony minimum |
| Challenge Perfect reference 0s/0.24s v0.86 | 0.81 | onset 1.23 | n/a | n/a | n/a | 0.005s | 0.0198 | 2x, risk sd 0.045 | scheduled cue duration 0.24s < 1.1s ceremony minimum |
| Challenge Perfect reference 0s/0.24s v0.95 | 0.84 | onset 1.58 | n/a | n/a | n/a | 0.005s | 0.0291 | 2x, risk sd 0 | scheduled cue duration 0.24s < 1.1s ceremony minimum |
| Challenge Perfect reference 0.04s/0.24s v1.05 | 0.88 | onset 2.26 | n/a | n/a | n/a | 0.01s | 0.0148 | 2x, risk sd 0.025 | scheduled cue duration 0.24s < 1.1s ceremony minimum |
| Challenge Perfect reference 0s/0.32s v0.74 | 0.93 | onset 1.88 | n/a | n/a | n/a | 0.01s | 0.0144 | 2x, risk sd 0.02 | scheduled cue duration 0.32s < 1.1s ceremony minimum |
| Challenge Perfect reference 0.02s/0.24s v0.86 | 0.93 | onset 2.23 | n/a | n/a | n/a | 0.005s | 0.0173 | 2x, risk sd 0.095 | scheduled cue duration 0.24s < 1.1s ceremony minimum |
| Challenge Perfect reference 0s/0.24s v0.74 | 0.95 | onset 1.89 | n/a | n/a | n/a | 0.01s | 0.0143 | 2x, risk sd 0 | scheduled cue duration 0.24s < 1.1s ceremony minimum |
| Challenge Perfect reference 0.04s/0.24s v0.95 | 0.97 | onset 2.25 | n/a | n/a | n/a | 0.025s | 0.0151 | 2x, risk sd 0.03 | scheduled cue duration 0.24s < 1.1s ceremony minimum |
| Challenge Perfect reference 0s/0.17s v0.74 | 1.02 | onset 1 | n/a | n/a | n/a | 0s | 0.0284 | 2x, risk sd 0.005 | scheduled cue duration 0.17s < 1.1s ceremony minimum |
| Challenge Perfect reference 0.04s/0.24s v1.16 | 1.05 | onset 2.38 | n/a | n/a | n/a | 0.025s | 0.0169 | 2x, risk sd 0.15 | scheduled cue duration 0.24s < 1.1s ceremony minimum |
| Challenge Perfect reference 0.04s/0.32s v0.86 | 1.07 | onset 2.79 | n/a | n/a | n/a | 0.045s | 0.0306 | 2x, risk sd 0.115 | scheduled cue duration 0.32s < 1.1s ceremony minimum |
| Challenge Perfect reference 0.04s/0.24s v0.86 | 1.09 | onset 2.4 | n/a | n/a | n/a | 0.025s | 0.0178 | 2x, risk sd 0.16 | scheduled cue duration 0.24s < 1.1s ceremony minimum |
| Challenge Perfect reference 0.08s/0.24s v0.95 | 1.11 | onset 2.54 | n/a | n/a | n/a | 0.03s | 0.0545 | 2x, risk sd 0.005 | scheduled cue duration 0.24s < 1.1s ceremony minimum |
| Challenge Perfect reference 0.04s/0.17s v0.86 | 1.14 | onset 2.5 | n/a | n/a | n/a | 0.03s | 0.0192 | 2x, risk sd 0.205 | scheduled cue duration 0.17s < 1.1s ceremony minimum |

## Next Step

Do not promote Challenge Perfect yet; use the measured best candidate to refine the generator or scoring gates.
