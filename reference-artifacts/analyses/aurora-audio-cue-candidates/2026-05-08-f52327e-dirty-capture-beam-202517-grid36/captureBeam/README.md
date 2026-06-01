# Aurora Capture Beam Audio Candidate Loop

Generated: `2026-05-08T20:25:17.448Z`
Commit: `f52327e`

## Problem

Capture Beam is the highest whole-cue Aurora audio event-gap risk. The current runtime cue is too long, too low-heavy, and peaks too late, so the tractor-beam danger/rescue moment reads less urgently than Galaga.

## Strategy

Generate bounded synthetic beam candidates, capture each through the live browser audio engine, compare them against the measured Galaga tractor-beam window, and recommend promotion only when measured urgency improves without trading away stability. This favors shorter active duration, brighter centroid, lower sub-bass, stronger mid-band energy, earlier attack, and lower segment risk.

## Success Measure

A keeper must reduce overall capture-beam risk by at least 0.3, keep duration gap within 0.09s, improve segment risk when available, improve centroid by at least 80 Hz, materially reduce sub-bass, materially increase mid-band energy, move the attack earlier, avoid band-shape regression, and avoid RMS regression.

## Decision

- Status: `no-keeper`
- Keep candidate: no
- Best candidate: `n/a`
- Measured best: `low-mid-balanced`
- Reason: The lowest-risk candidate did not clear all capture-beam keeper gates, and no other candidate did either.
- Repetitions per candidate: 1

## Candidates

| Candidate | Risk /10 | Worst segment | Dominant penalty | Duration Gap | Centroid Gap | Band Shape | Sub delta | Mid delta | Attack pos | RMS Gap | Stability | Keeper read |
| --- | ---: | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Low-mid balanced beam | 4.84 | onset 3.87 | attack | 0.079s | 295.1 Hz | 0.2554 | 0.2503 | -0.1449 | 0.344 | 0.0301 | 1x, risk sd 0 | mid-band gain 0.0259 < 0.04 |
| Reference band pulse | 5.03 | onset 4.53 | subBass | 0.01s | 406.9 Hz | 0.3098 | 0.3072 | -0.0909 | 0.707 | 0.0289 | 1x, risk sd 0 | sub-bass reduction 0.0077 < 0.05; attack timing improvement -0.157 < 0.04 |
| Early peak siren beam | 5.11 | onset 3.46 | attack | 0.03s | 506.4 Hz | 0.3003 | 0.3003 | -0.1533 | 0.684 | 0.0237 | 1x, risk sd 0 | sub-bass reduction 0.0146 < 0.05; mid-band gain 0.0175 < 0.04; attack timing improvement -0.134 < 0.04 |
| Thin tractor rise | 5.25 | onset 4.72 | subBass | 0.029s | 553.3 Hz | 0.2903 | 0.2903 | -0.129 | 0.211 | 0.0424 | 1x, risk sd 0 | centroid improvement 78.2 Hz < 80 Hz; sub-bass reduction 0.0246 < 0.05 |
| Grid 720/1116/1730 triangle | 6.44 | onset 6.32 | subBass | 0.02s | 472.8 Hz | 0.4231 | 0.4158 | -0.1199 | 0.025 | 0.1671 | 2x, risk sd 0 | segment risk improvement -0.55 < 0.3; sub-bass reduction -0.1009 < 0.05; band shape worsened by 0.1081; RMS worsened by 0.1126 |
| Urgent mid square beam | 6.46 | onset 5.47 | subBass | 0.081s | 543.6 Hz | 0.3495 | 0.3495 | -0.147 | 0.5 | 0.0458 | 1x, risk sd 0 | risk improvement 0.28 < 0.3; sub-bass reduction -0.0346 < 0.05; mid-band gain 0.0238 < 0.04; band shape worsened by 0.0345 |
| Grid 720/1116/1730 square | 6.72 | onset 6.85 | subBass | 0.021s | 483.4 Hz | 0.4085 | 0.4025 | -0.1209 | 0.156 | 0.1725 | 2x, risk sd 0 | risk improvement 0.02 < 0.3; segment risk improvement -1.08 < 0.3; sub-bass reduction -0.0876 < 0.05; band shape worsened by 0.0935; RMS worsened by 0.118 |
| Current Aurora baseline | 6.74 | onset 5.77 | subBass | 0.141s | 631.5 Hz | 0.315 | 0.3149 | -0.1708 | 0.55 | 0.0545 | 1x, risk sd 0 | baseline |
| Grid 720/1116/1730 triangle | 6.89 | onset 5.68 | subBass | 0.001s | 411.9 Hz | 0.4244 | 0.4088 | -0.1325 | 0.286 | 0.1739 | 2x, risk sd 0 | risk improvement -0.15 < 0.3; segment risk improvement 0.09 < 0.3; sub-bass reduction -0.0939 < 0.05; mid-band gain 0.0383 < 0.04; band shape worsened by 0.1094; RMS worsened by 0.1194 |
| Grid 720/1116/1730 triangle | 6.93 | onset 6.32 | subBass | 0.021s | 490.5 Hz | 0.4113 | 0.4063 | -0.1285 | 0.222 | 0.1762 | 3x, risk sd 0 | risk improvement -0.19 < 0.3; segment risk improvement -0.55 < 0.3; sub-bass reduction -0.0914 < 0.05; band shape worsened by 0.0963; RMS worsened by 0.1217 |
| Grid 720/1116/1730 square | 6.99 | onset 6.18 | subBass | 0.021s | 549.5 Hz | 0.48 | 0.4719 | -0.1571 | 0.111 | 0.1657 | 2x, risk sd 0 | risk improvement -0.25 < 0.3; segment risk improvement -0.41 < 0.3; sub-bass reduction -0.157 < 0.05; mid-band gain 0.0137 < 0.04; band shape worsened by 0.165; RMS worsened by 0.1112 |
| Grid 720/1116/1730 square | 7.23 | onset 6.58 | subBass | 0.05s | 561 Hz | 0.4924 | 0.4813 | -0.1604 | 0.104 | 0.175 | 1x, risk sd 0 | risk improvement -0.49 < 0.3; segment risk improvement -0.81 < 0.3; centroid improvement 70.5 Hz < 80 Hz; sub-bass reduction -0.1664 < 0.05; mid-band gain 0.0104 < 0.04; band shape worsened by 0.1774; RMS worsened by 0.1205 |
| Grid 620/1085/1682 triangle | 7.35 | onset 6.82 | subBass | 0.02s | 623.5 Hz | 0.4819 | 0.4809 | -0.1577 | 0.156 | 0.16 | 2x, risk sd 0 | risk improvement -0.61 < 0.3; segment risk improvement -1.05 < 0.3; centroid improvement 8 Hz < 80 Hz; sub-bass reduction -0.166 < 0.05; mid-band gain 0.0131 < 0.04; band shape worsened by 0.1669; RMS worsened by 0.1055 |
| Grid 620/1085/1682 triangle | 7.61 | onset 6.56 | subBass | 0.021s | 541 Hz | 0.4476 | 0.4421 | -0.1391 | 0.467 | 0.1636 | 2x, risk sd 0 | risk improvement -0.87 < 0.3; segment risk improvement -0.79 < 0.3; sub-bass reduction -0.1272 < 0.05; mid-band gain 0.0317 < 0.04; band shape worsened by 0.1326; RMS worsened by 0.1091 |
| Grid 720/1116/1730 triangle | 7.85 | onset 6.61 | subBass | 0.021s | 666 Hz | 0.5064 | 0.5043 | -0.1648 | 0.267 | 0.1695 | 2x, risk sd 0 | risk improvement -1.11 < 0.3; segment risk improvement -0.84 < 0.3; centroid improvement -34.5 Hz < 80 Hz; sub-bass reduction -0.1894 < 0.05; mid-band gain 0.006 < 0.04; band shape worsened by 0.1914; RMS worsened by 0.115 |
| Grid 720/1116/1730 square | 7.94 | onset 6.79 | subBass | 0.02s | 605.8 Hz | 0.4943 | 0.4927 | -0.1715 | 0.775 | 0.1487 | 2x, risk sd 0 | risk improvement -1.2 < 0.3; segment risk improvement -1.02 < 0.3; centroid improvement 25.7 Hz < 80 Hz; sub-bass reduction -0.1778 < 0.05; mid-band gain -0.0007 < 0.04; attack timing improvement -0.225 < 0.04; band shape worsened by 0.1793; RMS worsened by 0.0942 |
| Grid 720/1116/1730 triangle | 8.14 | onset 6.77 | subBass | 0.081s | 564.8 Hz | 0.4964 | 0.4863 | -0.1618 | 0.962 | 0.1694 | 2x, risk sd 0 | risk improvement -1.4 < 0.3; segment risk improvement -1 < 0.3; centroid improvement 66.7 Hz < 80 Hz; sub-bass reduction -0.1714 < 0.05; mid-band gain 0.009 < 0.04; attack timing improvement -0.412 < 0.04; band shape worsened by 0.1814; RMS worsened by 0.1149 |
| Grid 720/1116/1730 square | 8.14 | onset 6.8 | subBass | 0.07s | 573.6 Hz | 0.4955 | 0.4893 | -0.1797 | 0.784 | 0.153 | 1x, risk sd 0 | risk improvement -1.4 < 0.3; segment risk improvement -1.03 < 0.3; centroid improvement 57.9 Hz < 80 Hz; sub-bass reduction -0.1744 < 0.05; mid-band gain -0.0089 < 0.04; attack timing improvement -0.234 < 0.04; band shape worsened by 0.1805; RMS worsened by 0.0985 |
| Grid 720/1116/1730 square | 8.17 | onset 7.46 | subBass | 0.081s | 628 Hz | 0.4701 | 0.469 | -0.1493 | 0.327 | 0.1758 | 1x, risk sd 0 | risk improvement -1.43 < 0.3; segment risk improvement -1.69 < 0.3; centroid improvement 3.5 Hz < 80 Hz; sub-bass reduction -0.1541 < 0.05; mid-band gain 0.0215 < 0.04; band shape worsened by 0.1551; RMS worsened by 0.1213 |
| Grid 720/1116/1730 triangle | 8.23 | onset 7.09 | subBass | 0.019s | 690.7 Hz | 0.5193 | 0.5183 | -0.1764 | 0.525 | 0.1619 | 3x, risk sd 0 | risk improvement -1.49 < 0.3; segment risk improvement -1.32 < 0.3; centroid improvement -59.2 Hz < 80 Hz; sub-bass reduction -0.2034 < 0.05; mid-band gain -0.0056 < 0.04; attack timing improvement 0.025 < 0.04; band shape worsened by 0.2043; RMS worsened by 0.1074 |
| Grid 620/1085/1682 triangle | 8.24 | onset 7.14 | subBass | 0.029s | 690.1 Hz | 0.5184 | 0.5184 | -0.1732 | 0.737 | 0.163 | 2x, risk sd 0 | risk improvement -1.5 < 0.3; segment risk improvement -1.37 < 0.3; centroid improvement -58.6 Hz < 80 Hz; sub-bass reduction -0.2035 < 0.05; mid-band gain -0.0024 < 0.04; attack timing improvement -0.187 < 0.04; band shape worsened by 0.2034; RMS worsened by 0.1085 |
| Grid 720/1116/1730 triangle | 8.29 | onset 7.43 | subBass | 0.069s | 655.2 Hz | 0.499 | 0.499 | -0.165 | 0.939 | 0.1518 | 3x, risk sd 0 | risk improvement -1.55 < 0.3; segment risk improvement -1.66 < 0.3; centroid improvement -23.7 Hz < 80 Hz; sub-bass reduction -0.1841 < 0.05; mid-band gain 0.0058 < 0.04; attack timing improvement -0.389 < 0.04; band shape worsened by 0.184; RMS worsened by 0.0973 |
| Grid 720/1116/1730 triangle | 8.36 | onset 7.3 | subBass | 0.081s | 645.2 Hz | 0.5051 | 0.5008 | -0.1656 | 0.942 | 0.1728 | 2x, risk sd 0 | risk improvement -1.62 < 0.3; segment risk improvement -1.53 < 0.3; centroid improvement -13.7 Hz < 80 Hz; sub-bass reduction -0.1859 < 0.05; mid-band gain 0.0052 < 0.04; attack timing improvement -0.392 < 0.04; band shape worsened by 0.1901; RMS worsened by 0.1183 |
| Grid 720/1116/1730 triangle | 8.37 | onset 6.93 | subBass | 0.089s | 637.7 Hz | 0.4971 | 0.4971 | -0.1924 | 0.387 | 0.1349 | 2x, risk sd 0 | risk improvement -1.63 < 0.3; segment risk improvement -1.16 < 0.3; centroid improvement -6.2 Hz < 80 Hz; sub-bass reduction -0.1822 < 0.05; mid-band gain -0.0216 < 0.04; band shape worsened by 0.1821; RMS worsened by 0.0804 |

## Next Step

Use the lowest-risk candidate and rejection reasons to seed a narrower second sweep before changing runtime audio.

## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: `reference-artifacts/analyses/aurora-audio-cue-candidates/private-storage.json`
- private companion root: `private-artifacts/repo-mirror/reference-artifacts/analyses/aurora-audio-cue-candidates`
