#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');
const { withHarnessPage, ROOT } = require('./browser-check-util');
const { renderSpecToWav } = require('./audio-spec-renderer');

const GUIDE = require(path.join(ROOT, 'application-guide.json'));
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-audio-cue-candidates');
const THEME_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-audio-theme-comparison');
const RUNTIME_TRIAL_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-audio-runtime-trials');
const MASKING_CRITICAL_CUES = Object.freeze(['playerShot', 'enemyHit', 'enemyBoom', 'bossHit', 'bossBoom', 'playerHit', 'rescueJoin']);
let criticalMaskingProfiles = null;

const CUE_CONFIGS = {
  'enemy-hit': {
    cue: 'enemyHit',
    entryId: 'enemy-hit-aurora',
    comparisonId: 'enemy-hit-compare',
    latest: 'latest-enemy-hit.json',
    title: 'Enemy Hit',
    problem: 'Enemy Hit is the highest whole-cue audio risk: Aurora gives hit confirmation, but the measured cue is too long, too bright, and spectrally far from the Zako impact reference window.',
    target: 'Make a normal enemy impact read as immediate Galaga-like hit confirmation without collapsing into the heavier enemy destruction cue.',
    referenceStarts: [0.5, 0.58, 0.66, 0.72, 0.75, 0.79, 0.84],
    referenceDurations: [0.14, 0.18, 0.2, 0.24, 0.28, 0.32],
    referenceVolumes: [0.58, 0.7, 0.82, 0.94, 1],
    handSpecs: [
      {
        id: 'short-low-mid-snap',
        label: 'Short low-mid snap',
        spec: {
          tones: [
            { freq: 170, duration: .08, wave: 'sawtooth', volume: .019, slide: -110, lpHz: 1600 },
            { freq: 620, duration: .045, wave: 'triangle', volume: .009, slide: -180, lpHz: 2200, delay: .012 }
          ],
          noise: [{ duration: .032, volume: .0022, hp: 760, delay: .008 }]
        }
      },
      {
        id: 'zako-window-current',
        label: 'Zako current guide window',
        spec: {
          referenceClip: 'assets/reference-audio/galaga3-zako.m4a',
          cooldownMs: 220,
          referenceVolume: .82,
          clipStart: .75,
          clipDuration: .24
        }
      }
    ],
    keeper: { risk: .3, segment: .3, duration: .08, acceptableDuration: .08, centroidWorsenHz: 100, bandWorsen: .05 }
  },
  'player-shot': {
    cue: 'playerShot',
    entryId: 'player-shot-classic',
    comparisonId: 'player-shot-compare',
    latest: 'latest-player-shot.json',
    title: 'Player Shot',
    problem: 'Player Shot is the exposed highest acoustic event gap after the boss-hit fix, but it is a high-repetition control-feedback cue, so the loop must validate reference-window fit before recommending a runtime promotion.',
    target: 'Make player fire read as a quick, crisp Galaga-like shot that remains lighter than hit/destruction feedback and distinct from enemyShot and bossHit during rapid play.',
    cooldownMs: 160,
    referenceStarts: [0, 0.02, 0.04, 0.05, 0.06, 0.08, 0.1, 0.12],
    referenceDurations: [0.08, 0.1, 0.12, 0.16, 0.2, 0.24],
    referenceVolumes: [0.42, 0.52, 0.62, 0.72, 0.82, 0.92],
    handSpecs: [
      {
        id: 'player-fire-guide-window',
        label: 'Player fire guide window',
        spec: {
          referenceClip: 'assets/reference-audio/galaga3-boss-damage-flagship-fighter-shot.m4a',
          cooldownMs: 160,
          referenceVolume: .72,
          clipStart: .05,
          clipDuration: .24
        }
      },
      {
        id: 'player-fire-transient-only',
        label: 'Player fire transient only',
        spec: {
          referenceClip: 'assets/reference-audio/galaga3-boss-damage-flagship-fighter-shot.m4a',
          cooldownMs: 160,
          referenceVolume: .66,
          clipStart: .08,
          clipDuration: .12
        }
      },
      {
        id: 'synthetic-control-snap-brighter',
        label: 'Synthetic control snap brighter',
        spec: {
          tones: [
            { freq: 1280, duration: .032, wave: 'square', volume: .0088, slide: -760, detune: .004, lpHz: 7000 },
            { freq: 1820, duration: .02, wave: 'square', volume: .0042, slide: -520, detune: -.003, lpHz: 7600, delay: .006 }
          ],
          noise: [{ duration: .018, volume: .0014, hp: 4200, delay: .004 }]
        }
      },
      {
        id: 'synthetic-control-snap-warmer',
        label: 'Synthetic control snap warmer',
        spec: {
          tones: [
            { freq: 980, duration: .034, wave: 'square', volume: .009, slide: -560, detune: .003, lpHz: 5400 },
            { freq: 1450, duration: .024, wave: 'triangle', volume: .0046, slide: -360, lpHz: 6200, delay: .007 }
          ],
          noise: [{ duration: .014, volume: .001, hp: 3600, delay: .006 }]
        }
      }
    ],
    keeper: {
      risk: .35,
      segment: .35,
      duration: .035,
      acceptableDuration: .045,
      centroidWorsenHz: 140,
      bandWorsen: .045,
      minimumScheduledDurationSeconds: .06
    }
  },
  'enemy-shot': {
    cue: 'enemyShot',
    entryId: 'enemy-shot-classic',
    comparisonId: 'enemy-shot-compare',
    latest: 'latest-enemy-shot.json',
    title: 'Enemy Shot',
    problem: 'Enemy Shot is now the highest acoustic event gap in a fresh full-theme capture: enemy fire is semantically mapped, but its onset is too spectrally distant and too collapsed to read like the Galaga threat-fire transient.',
    target: 'Make enemy projectile fire read as a crisp incoming-threat cue that stays distinct from playerShot, attackCharge, and enemyHit.',
    cooldownMs: 220,
    referenceStarts: [0.9, 0.94, 0.97, 1.0, 1.04, 1.08],
    referenceDurations: [0.12, 0.15, 0.18, 0.2, 0.24, 0.28],
    referenceVolumes: [0.74, 0.86, 0.95, 1.05, 1.16],
    handSpecs: [
      {
        id: 'enemy-fire-guide-window',
        label: 'Enemy fire guide window',
        spec: {
          referenceClip: 'assets/reference-audio/galaga3-boss-damage-flagship-fighter-shot.m4a',
          cooldownMs: 220,
          referenceVolume: .88,
          clipStart: .9,
          clipDuration: .24
        }
      },
      {
        id: 'enemy-fire-narrow-transient',
        label: 'Enemy fire narrow transient',
        spec: {
          referenceClip: 'assets/reference-audio/galaga3-boss-damage-flagship-fighter-shot.m4a',
          cooldownMs: 220,
          referenceVolume: .95,
          clipStart: .97,
          clipDuration: .15
        }
      },
      {
        id: 'dry-threat-snap',
        label: 'Dry threat snap',
        spec: {
          tones: [
            { freq: 480, duration: .052, wave: 'square', volume: .0072, slide: -150, lpHz: 2500 },
            { freq: 260, duration: .06, wave: 'triangle', volume: .0048, slide: -90, lpHz: 2100, delay: .012 }
          ]
        }
      }
    ],
    keeper: { risk: .3, segment: .35, duration: .035, acceptableDuration: .06, centroidWorsenHz: 100, bandWorsen: .05 }
  },
  'enemy-boom': {
    cue: 'enemyBoom',
    entryId: 'enemy-boom-aurora',
    comparisonId: 'enemy-boom-compare',
    latest: 'latest-enemy-boom.json',
    title: 'Enemy Boom',
    problem: 'Enemy Boom is the highest current whole-cue audio event gap: Aurora is too long, too bright, and late-peaking versus the compact Zako destruction reference.',
    target: 'Make normal enemy destruction feel like a compact Galaga kill confirmation that is heavier than enemyHit but not as large as bossBoom.',
    cooldownMs: 260,
    referenceStarts: [0.34, 0.42, 0.48, 0.5, 0.54, 0.58, 0.62, 0.66],
    referenceDurations: [0.14, 0.18, 0.2, 0.24, 0.28, 0.32],
    referenceVolumes: [0.62, 0.74, 0.86, 0.95, 1.05],
    handSpecs: [
      {
        id: 'zako-destruction-guide-window',
        label: 'Zako destruction guide window',
        spec: {
          referenceClip: 'assets/reference-audio/galaga3-zako.m4a',
          cooldownMs: 260,
          referenceVolume: .95,
          clipStart: .5,
          clipDuration: .24
        }
      },
      {
        id: 'short-low-mid-finality',
        label: 'Short low-mid finality',
        spec: {
          tones: [
            { freq: 180, duration: .09, wave: 'sawtooth', volume: .018, slide: -120, lpHz: 1650 },
            { freq: 520, duration: .045, wave: 'triangle', volume: .008, slide: -180, lpHz: 2300, delay: .012 },
            { freq: 118, duration: .11, wave: 'triangle', volume: .011, slide: -42, lpHz: 1300, delay: .032 }
          ],
          noise: [{ duration: .04, volume: .002, hp: 700, delay: .01 }]
        }
      },
      {
        id: 'compact-zako-pop',
        label: 'Compact Zako pop',
        spec: {
          tones: [
            { freq: 220, duration: .07, wave: 'sawtooth', volume: .017, slide: -160, lpHz: 1750 },
            { freq: 360, duration: .055, wave: 'triangle', volume: .007, slide: -130, lpHz: 2100, delay: .01 },
            { freq: 146, duration: .08, wave: 'triangle', volume: .01, slide: -48, lpHz: 1400, delay: .026 }
          ],
          noise: [{ duration: .035, volume: .0025, hp: 820, delay: .008 }]
        }
      },
      {
        id: 'lowmid-front-pop',
        label: 'Low-mid front pop',
        spec: {
          tones: [
            { freq: 760, duration: .05, wave: 'triangle', volume: .010, slide: -280, lpHz: 1550 },
            { freq: 420, duration: .075, wave: 'sawtooth', volume: .013, slide: -150, lpHz: 1450, delay: .006 },
            { freq: 190, duration: .095, wave: 'triangle', volume: .010, slide: -55, lpHz: 1200, delay: .018 }
          ],
          noise: [{ duration: .026, volume: .0012, hp: 620, delay: .006 }]
        }
      },
      {
        id: 'zako-lowmid-click-body',
        label: 'Zako low-mid click body',
        spec: {
          tones: [
            { freq: 980, duration: .032, wave: 'triangle', volume: .008, slide: -440, lpHz: 1700 },
            { freq: 560, duration: .07, wave: 'triangle', volume: .012, slide: -170, lpHz: 1550, delay: .008 },
            { freq: 260, duration: .09, wave: 'sawtooth', volume: .009, slide: -80, lpHz: 1250, delay: .02 }
          ],
          noise: [{ duration: .024, volume: .0016, hp: 720, delay: .004 }]
        }
      },
      {
        id: 'dry-finality-thud',
        label: 'Dry finality thud',
        spec: {
          tones: [
            { freq: 640, duration: .042, wave: 'sawtooth', volume: .011, slide: -260, lpHz: 1500 },
            { freq: 330, duration: .085, wave: 'triangle', volume: .013, slide: -110, lpHz: 1350, delay: .008 },
            { freq: 146, duration: .08, wave: 'triangle', volume: .008, slide: -36, lpHz: 1050, delay: .024 }
          ],
          noise: [{ duration: .02, volume: .001, hp: 560, delay: .006 }]
        }
      },
      {
        id: 'single-burst-lowmid',
        label: 'Single burst low-mid',
        spec: {
          tones: [
            { freq: 520, duration: .11, wave: 'sawtooth', volume: .017, slide: -260, lpHz: 1450 },
            { freq: 250, duration: .095, wave: 'triangle', volume: .010, slide: -70, lpHz: 1150, delay: .012 }
          ],
          noise: [{ duration: .018, volume: .0011, hp: 620, delay: .004 }]
        }
      },
      {
        id: 'zako-seq-lowmid',
        label: 'Zako sequence low-mid',
        spec: {
          seq: [740, 520, 360],
          step: .026,
          wave: 'triangle',
          volume: .0105,
          slide: -120,
          lpHz: 1550,
          tones: [
            { freq: 220, duration: .085, wave: 'triangle', volume: .009, slide: -50, lpHz: 1100, delay: .04 }
          ]
        }
      }
    ],
    keeper: { risk: .35, segment: .35, duration: .12, acceptableDuration: .13, centroidWorsenHz: 90, bandWorsen: .045 }
  },
  'boss-hit': {
    cue: 'bossHit',
    entryId: 'boss-hit-aurora',
    comparisonId: 'boss-hit-compare',
    latest: 'latest-boss-hit.json',
    title: 'Boss Hit',
    problem: 'Boss Hit must read as multi-hit boss damage, not as a normal enemy pop or a player shot; current coverage has reference scoring but no focused keeper loop.',
    target: 'Make boss damage feel distinct, compact, and more substantial than enemyHit while staying smaller than bossBoom.',
    cooldownMs: 240,
    referenceStarts: [0.94, 1.02, 1.08, 1.149, 1.2, 1.28, 1.36],
    referenceDurations: [0.16, 0.2, 0.24, 0.29, 0.34, 0.42],
    referenceVolumes: [0.72, 0.86, 0.98, 1.08, 1.18],
    handSpecs: [
      {
        id: 'boss-damage-guide-window',
        label: 'Boss damage guide window',
        spec: {
          referenceClip: 'assets/reference-audio/galaga3-boss-damage-flagship-fighter-shot.m4a',
          cooldownMs: 240,
          referenceVolume: 1.04,
          clipStart: 1.149,
          clipDuration: .29
        }
      },
      {
        id: 'lowmid-boss-damage-snap',
        label: 'Low-mid boss damage snap',
        spec: {
          tones: [
            { freq: 360, duration: .075, wave: 'triangle', volume: .014, slide: -145, lpHz: 2200 },
            { freq: 185, duration: .12, wave: 'sawtooth', volume: .012, slide: -80, lpHz: 1500, delay: .014 },
            { freq: 720, duration: .04, wave: 'triangle', volume: .006, slide: -260, lpHz: 2600, delay: .006 }
          ],
          noise: [{ duration: .032, volume: .0024, hp: 920, delay: .008 }]
        }
      },
      {
        id: 'two-step-boss-chip',
        label: 'Two-step boss chip',
        spec: {
          seq: [620, 410],
          step: .034,
          wave: 'triangle',
          volume: .011,
          slide: -115,
          lpHz: 2100,
          tones: [
            { freq: 210, duration: .105, wave: 'triangle', volume: .009, slide: -55, lpHz: 1300, delay: .036 }
          ],
          noise: [{ duration: .026, volume: .0014, hp: 760, delay: .006 }]
        }
      }
    ],
    keeper: { risk: .3, segment: .35, duration: .08, acceptableDuration: .1, centroidWorsenHz: 100, bandWorsen: .05 }
  },
  'boss-boom': {
    cue: 'bossBoom',
    entryId: 'boss-boom-aurora',
    comparisonId: 'boss-boom-compare',
    latest: 'latest-boss-boom.json',
    title: 'Boss Boom',
    problem: 'Boss Boom should be the largest destruction cue in the hierarchy, but it needs a focused loop to compare reference phrase windows, body/tail duration, and boss-finality scale.',
    target: 'Make boss destruction feel larger and more final than enemyBoom without becoming a long muddy overlap risk during dense play.',
    cooldownMs: 360,
    referenceStarts: [0.62, 0.72, 0.798, 0.88, 0.98, 1.08, 1.18],
    referenceDurations: [0.42, 0.56, 0.64, 0.769, 0.9, 1.05],
    referenceVolumes: [0.78, 0.92, 1.04, 1.18, 1.3],
    handSpecs: [
      {
        id: 'boss-death-guide-window',
        label: 'Boss death guide window',
        spec: {
          referenceClip: 'assets/reference-audio/galaga3-boss-death-sasori.m4a',
          cooldownMs: 360,
          referenceVolume: 1.18,
          clipStart: .798,
          clipDuration: .769
        }
      },
      {
        id: 'wide-boss-finality',
        label: 'Wide boss finality',
        spec: {
          tones: [
            { freq: 520, duration: .065, wave: 'triangle', volume: .012, slide: -220, lpHz: 2600 },
            { freq: 300, duration: .12, wave: 'sawtooth', volume: .014, slide: -135, lpHz: 1900, delay: .018 },
            { freq: 150, duration: .22, wave: 'triangle', volume: .014, slide: -60, lpHz: 1200, delay: .05 }
          ],
          noise: [{ duration: .07, volume: .0036, hp: 760, delay: .012 }]
        }
      },
      {
        id: 'boss-two-burst-collapse',
        label: 'Boss two-burst collapse',
        spec: {
          seq: [680, 450, 280],
          step: .045,
          wave: 'triangle',
          volume: .0105,
          slide: -140,
          lpHz: 2300,
          tones: [
            { freq: 170, duration: .19, wave: 'sine', volume: .013, slide: -52, lpHz: 1180, delay: .08 }
          ],
          noise: [{ duration: .052, volume: .003, hp: 820, delay: .014 }]
        }
      }
    ],
    keeper: { risk: .3, segment: .35, duration: .12, acceptableDuration: .18, centroidWorsenHz: 110, bandWorsen: .055 }
  },
  'formation-pulse': {
    cue: 'stagePulse',
    entryId: 'formation-pulse-classic',
    comparisonId: 'formation-pulse-compare',
    latest: 'latest-formation-pulse.json',
    title: 'Formation Pulse',
    problem: 'Formation Pulse has the highest segment-level onset risk: the current classic pulse is a bright synthetic stab while the Galaga cadence reference has more low-frequency body and softer attack.',
    target: 'Make the basic formation cadence feel closer to an arcade marching/pressure bed while preserving short repeatable pulse behavior.',
    referenceStarts: [0.48, 0.54, 0.6, 0.66, 0.72, 4.58, 4.64],
    referenceDurations: [0.16, 0.2, 0.24, 0.3, 0.36, 0.44],
    referenceVolumes: [0.62, 0.74, 0.86, .95, 1.05],
    handSpecs: [
      {
        id: 'low-soft-march',
        label: 'Low soft march',
        spec: {
          tones: [
            { freq: 196, duration: .13, wave: 'triangle', volume: .010, slide: -12, lpHz: 1500 },
            { freq: 392, duration: .09, wave: 'triangle', volume: .006, slide: -22, lpHz: 2300, delay: .028 }
          ]
        }
      },
      {
        id: 'sub-bass-soft-march',
        label: 'Sub bass soft march',
        spec: {
          tones: [
            { freq: 98, duration: .18, wave: 'triangle', volume: .006, slide: -4, lpHz: 850 },
            { freq: 196, duration: .16, wave: 'sine', volume: .0075, slide: -10, lpHz: 1200, delay: .018 },
            { freq: 294, duration: .1, wave: 'triangle', volume: .0035, slide: -12, lpHz: 1450, delay: .052 }
          ]
        }
      },
      {
        id: 'low-convoy-thump',
        label: 'Low convoy thump',
        spec: {
          tones: [
            { freq: 110, duration: .17, wave: 'triangle', volume: .0062, slide: -6, lpHz: 900 },
            { freq: 220, duration: .145, wave: 'triangle', volume: .007, slide: -18, lpHz: 1220, delay: .012 },
            { freq: 330, duration: .075, wave: 'sine', volume: .0032, slide: -16, lpHz: 1500, delay: .058 }
          ]
        }
      },
      {
        id: 'soft-double-low-pulse',
        label: 'Soft double low pulse',
        spec: {
          seq: [196, 220],
          step: .066,
          wave: 'triangle',
          volume: .0068,
          slide: -8,
          lpHz: 1180,
          tones: [
            { freq: 98, duration: .19, wave: 'sine', volume: .0052, slide: -3, lpHz: 820, delay: .01 }
          ]
        }
      },
      {
        id: 'sub500-weighted-march',
        label: 'Sub-500 weighted march',
        spec: {
          tones: [
            { freq: 82, duration: .19, wave: 'triangle', volume: .0058, slide: -2, lpHz: 780 },
            { freq: 164, duration: .16, wave: 'triangle', volume: .0074, slide: -7, lpHz: 1000, delay: .016 },
            { freq: 246, duration: .11, wave: 'sine', volume: .0042, slide: -9, lpHz: 1280, delay: .048 }
          ]
        }
      },
      {
        id: 'soft-attack-low-march',
        label: 'Soft attack low march',
        spec: {
          tones: [
            { freq: 147, duration: .18, wave: 'square', volume: .0062, slide: -4, lpHz: 760, attack: .052 },
            { freq: 294, duration: .15, wave: 'triangle', volume: .0048, slide: -8, lpHz: 980, delay: .022, attack: .04 },
            { freq: 196, duration: .12, wave: 'triangle', volume: .0036, slide: -5, lpHz: 680, delay: .07, attack: .032 }
          ]
        }
      },
      {
        id: 'soft-attack-low-march-single',
        label: 'Soft attack low march, single oscillator',
        spec: {
          tones: [
            { freq: 147, duration: .18, wave: 'square', volume: .0058, slide: -4, lpHz: 720, attack: .058, singleOscillator: 1 },
            { freq: 294, duration: .145, wave: 'triangle', volume: .0038, slide: -8, lpHz: 860, delay: .026, attack: .044, singleOscillator: 1 },
            { freq: 196, duration: .11, wave: 'triangle', volume: .0028, slide: -5, lpHz: 620, delay: .078, attack: .036, singleOscillator: 1 }
          ]
        }
      },
      {
        id: 'soft-attack-low-march-headroom',
        label: 'Soft attack low march with combat headroom',
        spec: {
          tones: [
            { freq: 147, duration: .17, wave: 'square', volume: .0048, slide: -3, lpHz: 640, attack: .068, singleOscillator: 1 },
            { freq: 294, duration: .125, wave: 'triangle', volume: .0031, slide: -6, lpHz: 760, delay: .032, attack: .05, singleOscillator: 1 },
            { freq: 196, duration: .09, wave: 'triangle', volume: .0022, slide: -4, lpHz: 560, delay: .086, attack: .04, singleOscillator: 1 }
          ]
        }
      },
      {
        id: 'soft-attack-low-march-body-pocket',
        label: 'Soft attack low march body pocket',
        spec: {
          tones: [
            { freq: 123, duration: .19, wave: 'triangle', volume: .0061, slide: -3, lpHz: 520, attack: .075, singleOscillator: 1 },
            { freq: 246, duration: .135, wave: 'triangle', volume: .0035, slide: -7, lpHz: 720, delay: .038, attack: .046, singleOscillator: 1 },
            { freq: 184, duration: .09, wave: 'sine', volume: .002, slide: -3, lpHz: 520, delay: .09, attack: .04, singleOscillator: 1 }
          ]
        }
      },
      {
        id: 'late-crest-low-bed',
        label: 'Late crest low bed',
        spec: {
          tones: [
            { freq: 98, duration: .2, wave: 'triangle', volume: .0054, slide: -2, lpHz: 620, attack: .09 },
            { freq: 196, duration: .16, wave: 'square', volume: .0058, slide: -6, lpHz: 860, delay: .038, attack: .06 },
            { freq: 294, duration: .095, wave: 'triangle', volume: .003, slide: -10, lpHz: 1080, delay: .092, attack: .028 }
          ]
        }
      },
      {
        id: 'muted-square-march',
        label: 'Muted square march',
        spec: {
          tones: [
            { freq: 165, duration: .16, wave: 'square', volume: .0056, slide: -5, lpHz: 700, attack: .036 },
            { freq: 330, duration: .11, wave: 'square', volume: .0036, slide: -10, lpHz: 950, delay: .04, attack: .03 }
          ]
        }
      },
      {
        id: 'single-low-sine-march',
        label: 'Single oscillator low sine march',
        spec: {
          tones: [
            { freq: 98, duration: .2, wave: 'sine', volume: .0062, slide: -2, lpHz: 620, attack: .07, singleOscillator: 1 },
            { freq: 196, duration: .15, wave: 'sine', volume: .0042, slide: -4, lpHz: 900, delay: .038, attack: .044, singleOscillator: 1 },
            { freq: 147, duration: .12, wave: 'sine', volume: .0036, slide: -3, lpHz: 740, delay: .086, attack: .026, singleOscillator: 1 }
          ]
        }
      },
      {
        id: 'single-muted-triangle-bed',
        label: 'Single muted triangle bed',
        spec: {
          tones: [
            { freq: 123, duration: .19, wave: 'triangle', volume: .0068, slide: -4, lpHz: 700, attack: .058, singleOscillator: 1 },
            { freq: 246, duration: .13, wave: 'triangle', volume: .0046, slide: -8, lpHz: 980, delay: .046, attack: .036, singleOscillator: 1 }
          ]
        }
      },
      {
        id: 'single-low-square-pulse',
        label: 'Single low square pulse',
        spec: {
          tones: [
            { freq: 147, duration: .17, wave: 'square', volume: .0058, slide: -5, lpHz: 720, attack: .042, singleOscillator: 1 },
            { freq: 196, duration: .12, wave: 'square', volume: .004, slide: -6, lpHz: 880, delay: .055, attack: .032, singleOscillator: 1 }
          ]
        }
      },
      {
        id: 'convoy-current-window',
        label: 'Convoy current guide window',
        spec: {
          referenceClip: 'assets/reference-audio/galaga3-ambience-convoy.m4a',
          cooldownMs: 1250,
          referenceVolume: .86,
          clipStart: .6,
          clipDuration: .24
        }
      }
    ],
    keeper: { risk: .25, segment: .35, duration: .08, acceptableDuration: .16, centroidWorsenHz: 120, bandWorsen: .06, cadencePressure: 1, cadencePressureMin: 3.5, maskingSeparation: 1, maskingSeparationMin: 4 }
  },
  'ship-loss': {
    cue: 'playerHit',
    entryId: 'player-hit',
    comparisonId: 'ship-loss-compare',
    latest: 'latest-player-hit-focus.json',
    title: 'Ship Loss Tail/Body',
    problem: 'Ship Loss now uses Galaga source audio, but raw segment scoring still flags the tail/body because the browser-captured Galaga baseline also carries high reference-segmentation risk. The next gap is calibration: distinguish true runtime regressions from analyzer noise before promoting a more player-readable loss phrase.',
    target: 'Preserve the recognizable Galaga death phrase, keep the full onset/body/tail meaning intact after a ship loss, and use browser-self-calibrated segment gates so the loop improves the game without chasing scorer artifacts.',
    referenceStarts: [0, .02, .05, .08, .1, .12, .16],
    referenceDurations: [.72, .84, .92, .968, 1.04, 1.16, 1.28],
    referenceVolumes: [.74, .82, .9, 1],
    handSpecs: [
      {
        id: 'promoted-active-window',
        label: 'Promoted active window',
        spec: {
          referenceClip: 'assets/reference-audio/galaga3-death.m4a',
          cooldownMs: 1800,
          referenceVolume: 1,
          clipStart: .02,
          clipDuration: .968
        }
      },
      {
        id: 'lower-gain-body-candidate',
        label: 'Lower gain body candidate',
        spec: {
          referenceClip: 'assets/reference-audio/galaga3-death.m4a',
          cooldownMs: 1800,
          referenceVolume: .82,
          clipStart: .02,
          clipDuration: 1.04
        }
      },
      {
        id: 'segmented-loss-body-dip',
        label: 'Segmented loss body dip',
        spec: {
          cooldownMs: 1800,
          scheduledDuration: .97,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga3-death.m4a', referenceVolume: 1, clipStart: .02, clipDuration: .39, delay: 0 },
            { referenceClip: 'assets/reference-audio/galaga3-death.m4a', referenceVolume: .82, clipStart: .459, clipDuration: .33, delay: .45 },
            { referenceClip: 'assets/reference-audio/galaga3-death.m4a', referenceVolume: .96, clipStart: .858, clipDuration: .13, delay: .84 }
          ]
        }
      },
      {
        id: 'curated-segment-exact',
        label: 'Curated segment exact',
        spec: {
          cooldownMs: 1800,
          scheduledDuration: .968,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga3-death.m4a', referenceVolume: 1, clipStart: .02, clipDuration: .439, delay: 0 },
            { referenceClip: 'assets/reference-audio/galaga3-death.m4a', referenceVolume: 1, clipStart: .459, clipDuration: .399, delay: .439 },
            { referenceClip: 'assets/reference-audio/galaga3-death.m4a', referenceVolume: 1, clipStart: .858, clipDuration: .13, delay: .838 }
          ]
        }
      },
      {
        id: 'curated-segment-tail-lift',
        label: 'Curated segment tail lift',
        spec: {
          cooldownMs: 1800,
          scheduledDuration: .968,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga3-death.m4a', referenceVolume: .98, clipStart: .02, clipDuration: .439, delay: 0 },
            { referenceClip: 'assets/reference-audio/galaga3-death.m4a', referenceVolume: .9, clipStart: .459, clipDuration: .399, delay: .439 },
            { referenceClip: 'assets/reference-audio/galaga3-death.m4a', referenceVolume: 1.18, clipStart: .858, clipDuration: .13, delay: .832 }
          ]
        }
      },
      {
        id: 'curated-segment-body-tail-crossfade',
        label: 'Curated segment body/tail crossfade',
        spec: {
          cooldownMs: 1800,
          scheduledDuration: .968,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga3-death.m4a', referenceVolume: 1, clipStart: .02, clipDuration: .439, delay: 0 },
            { referenceClip: 'assets/reference-audio/galaga3-death.m4a', referenceVolume: .88, clipStart: .459, clipDuration: .399, delay: .42 },
            { referenceClip: 'assets/reference-audio/galaga3-death.m4a', referenceVolume: 1.08, clipStart: .858, clipDuration: .13, delay: .8 }
          ]
        }
      },
      {
        id: 'segmented-loss-body-guarded',
        label: 'Segmented loss body guarded',
        spec: {
          cooldownMs: 1800,
          scheduledDuration: 1.02,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga3-death.m4a', referenceVolume: 1, clipStart: .02, clipDuration: .43, delay: 0 },
            { referenceClip: 'assets/reference-audio/galaga3-death.m4a', referenceVolume: .88, clipStart: .459, clipDuration: .37, delay: .47 },
            { referenceClip: 'assets/reference-audio/galaga3-death.m4a', referenceVolume: 1.02, clipStart: .858, clipDuration: .13, delay: .89 }
          ]
        }
      },
      {
        id: 'segmented-loss-tail-forward',
        label: 'Segmented loss tail forward',
        spec: {
          cooldownMs: 1800,
          scheduledDuration: .95,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga3-death.m4a', referenceVolume: .96, clipStart: .02, clipDuration: .36, delay: 0 },
            { referenceClip: 'assets/reference-audio/galaga3-death.m4a', referenceVolume: .78, clipStart: .459, clipDuration: .31, delay: .42 },
            { referenceClip: 'assets/reference-audio/galaga3-death.m4a', referenceVolume: 1.12, clipStart: .858, clipDuration: .13, delay: .82 }
          ]
        }
      }
    ],
    keeper: { risk: .25, segment: .35, duration: .12, acceptableDuration: .1, centroidWorsenHz: 90, bandWorsen: .045 },
    lossComposite: {
      family: 'loss-cue-composite',
      roles: ['onset', 'body', 'tail'],
      roleWeights: { onset: .36, body: .44, tail: .2 },
      maxRoleRisk10: { onset: 3.2, body: 3.4, tail: 3.4 },
      calibration: {
        mode: 'synthetic-galaga-browser-capture',
        roleRiskMode: 'calibrated',
        maxRoleRisk10: { onset: 1.35, body: 1.1, tail: 1.05, default: 1.15 },
        rawSegmentWorsenMax10: .35,
        rationale: 'A Galaga-source browser capture can score high against hand segmentation; calibrated gates measure excess Aurora risk above the synthetic Galaga capture before blocking a candidate.'
      },
      durationTolerance: .14,
      scheduledCoverageMin: .78,
      scheduledCoverageMax: 1.18,
      minScore10: 7.2
    }
  },
  'capture-retreat': {
    cue: 'captureRetreat',
    entryId: 'capture-retreat',
    comparisonId: 'capture-retreat-compare',
    latest: 'latest-capture-retreat.json',
    title: 'Capture Retreat',
    problem: 'Capture Retreat is the highest whole-cue audio gap: Aurora has the right semantic state, but the measured cue is too spectrally distant from the Capturing reference and its onset reads like a generic synthetic climb.',
    target: 'Make the post-capture retreat state sound like a distinct Galaga capturing/withdrawal phrase, separate from tractor-beam danger and capture success.',
    cooldownMs: 1200,
    referenceStarts: [2.18, 2.34, 2.46, 2.549, 2.62, 2.74, 2.9, 3.04],
    referenceDurations: [0.18, 0.24, 0.3, 0.36, 0.42, 0.5, 0.62],
    referenceVolumes: [0.62, 0.74, 0.86, 0.95, 1.05, 1.16],
    handSpecs: [
      {
        id: 'capturing-guide-window',
        label: 'Capturing guide window',
        spec: {
          referenceClip: 'assets/reference-audio/galaga3-capturing.m4a',
          cooldownMs: 1200,
          referenceVolume: .95,
          clipStart: 2.549,
          clipDuration: .42
        }
      },
      {
        id: 'capturing-short-onset',
        label: 'Capturing short onset',
        spec: {
          referenceClip: 'assets/reference-audio/galaga3-capturing.m4a',
          cooldownMs: 1200,
          referenceVolume: .86,
          clipStart: 2.46,
          clipDuration: .3
        }
      }
    ],
    keeper: { risk: .3, segment: .35, duration: .08, acceptableDuration: .12, centroidWorsenHz: 120, bandWorsen: .06 }
  },
  'capture-success': {
    cue: 'captureSuccess',
    entryId: 'capture-success',
    comparisonId: 'capture-success-compare',
    latest: 'latest-capture-success.json',
    title: 'Capture Success',
    problem: 'Capture Success is now the highest segment-level audio gap: the player-facing state change is semantically correct, but the onset is not separated enough from the body/tail and can read as a generic synthetic phrase instead of a captured-fighter handoff.',
    target: 'Make the exact captured-fighter moment read immediately and distinctly before the boss retreat cue begins to carry the state away.',
    cooldownMs: 1400,
    referenceStarts: [4.04, 4.16, 4.248, 4.32, 4.42, 4.5, 4.58],
    referenceDurations: [0.14, 0.18, 0.21, 0.24, 0.3, 0.36, 0.42, 0.5],
    referenceVolumes: [0.62, 0.74, 0.86, 0.95, 1.05, 1.16],
    handSpecs: [
      {
        id: 'fighter-captured-guide-window',
        label: 'Fighter captured guide window',
        spec: {
          referenceClip: 'assets/reference-audio/galaga3-fighter-captured.m4a',
          cooldownMs: 1400,
          referenceVolume: .95,
          clipStart: 4.248,
          clipDuration: .42
        }
      },
      {
        id: 'fighter-captured-active-core',
        label: 'Fighter captured active core',
        spec: {
          referenceClip: 'assets/reference-audio/galaga3-fighter-captured.m4a',
          cooldownMs: 1400,
          referenceVolume: 1.05,
          clipStart: 4.248,
          clipDuration: .24
        }
      },
      {
        id: 'fighter-captured-separated-onset',
        label: 'Fighter captured separated onset',
        spec: {
          scheduledDuration: .29,
          layers: [
            {
              referenceClip: 'assets/reference-audio/galaga3-fighter-captured.m4a',
              referenceVolume: 1.06,
              clipStart: 4.248,
              clipDuration: .06,
              delay: 0
            },
            {
              referenceClip: 'assets/reference-audio/galaga3-fighter-captured.m4a',
              referenceVolume: .92,
              clipStart: 4.318,
              clipDuration: .11,
              delay: .072
            },
            {
              referenceClip: 'assets/reference-audio/galaga3-fighter-captured.m4a',
              referenceVolume: .82,
              clipStart: 4.418,
              clipDuration: .07,
              delay: .17
            }
          ]
        }
      },
      {
        id: 'fighter-captured-low-synthetic-bridge',
        label: 'Fighter captured low synthetic bridge',
        spec: {
          seq: [392, 330, 277],
          step: .056,
          wave: 'square',
          volume: .0108,
          slide: -22,
          lpHz: 2800,
          tones: [
            { freq: 196, duration: .08, wave: 'triangle', volume: .0044, slide: -32, lpHz: 2100, delay: .092 },
            { freq: 554, duration: .035, wave: 'square', volume: .0032, slide: -90, lpHz: 3600, delay: .012 }
          ]
        }
      }
    ],
    keeper: { risk: .3, segment: .45, duration: .06, acceptableDuration: .1, centroidWorsenHz: 120, bandWorsen: .06 }
  },
  'captured-fighter-destroyed': {
    cue: 'capturedFighterDestroyed',
    entryId: 'captured-fighter-destroyed',
    comparisonId: 'captured-fighter-destroyed-compare',
    latest: 'latest-captured-fighter-destroyed.json',
    title: 'Captured Fighter Destroyed',
    problem: 'Captured Fighter Destroyed is the highest segment-level audio gap: the current penalty sound has the right slot, but its onset lacks the measured impact/noise body of the reference.',
    target: 'Make destroying a carried fighter feel like a distinct penalty event, not a normal enemy pop or generic hit.',
    cooldownMs: 1600,
    referenceStarts: [1.62, 1.78, 1.88, 1.949, 2.02, 2.1, 2.18, 2.3],
    referenceDurations: [0.14, 0.18, 0.2, 0.24, 0.3, 0.36, 0.44],
    referenceVolumes: [0.62, 0.74, 0.86, 0.95, 1.05, 1.16],
    handSpecs: [
      {
        id: 'penalty-guide-window',
        label: 'Penalty guide window',
        spec: {
          referenceClip: 'assets/reference-audio/galaga3-captured-fighter-destroyed.m4a',
          cooldownMs: 1600,
          referenceVolume: .95,
          clipStart: 1.949,
          clipDuration: .24
        }
      },
      {
        id: 'penalty-wide-impact',
        label: 'Penalty wide impact',
        spec: {
          referenceClip: 'assets/reference-audio/galaga3-captured-fighter-destroyed.m4a',
          cooldownMs: 1600,
          referenceVolume: 1.05,
          clipStart: 1.88,
          clipDuration: .36
        }
      }
    ],
    keeper: { risk: .25, segment: .4, duration: .06, acceptableDuration: .08, centroidWorsenHz: 110, bandWorsen: .055 }
  },
  'rescue-join': {
    cue: 'rescueJoin',
    entryId: 'rescue-join',
    comparisonId: 'rescue-join-compare',
    latest: 'latest-rescue-join.json',
    title: 'Rescue Join',
    problem: 'Rescue Join is semantically correct but its tail remains a high segment risk, weakening the reward moment after saving a captured fighter.',
    target: 'Make rescue/join read as a celebratory double-ship restoration cue with enough tail shape to feel earned.',
    cooldownMs: 1800,
    referenceStarts: [2.08, 2.22, 2.32, 2.399, 2.48, 2.58, 2.72],
    referenceDurations: [0.18, 0.24, 0.3, 0.36, 0.44, 0.56, 0.68],
    referenceVolumes: [0.62, 0.74, 0.86, 0.95, 1.05, 1.16],
    handSpecs: [
      {
        id: 'rescue-guide-window',
        label: 'Rescue guide window',
        spec: {
          referenceClip: 'assets/reference-audio/galaga2-fighter-rescued-double-ship.m4a',
          cooldownMs: 1800,
          referenceVolume: .95,
          clipStart: 2.399,
          clipDuration: .36
        }
      },
      {
        id: 'rescue-wide-tail',
        label: 'Rescue wide tail',
        spec: {
          referenceClip: 'assets/reference-audio/galaga2-fighter-rescued-double-ship.m4a',
          cooldownMs: 1800,
          referenceVolume: 1.05,
          clipStart: 2.32,
          clipDuration: .56
        }
      }
    ],
    keeper: { risk: .25, segment: .35, duration: .06, acceptableDuration: .1, centroidWorsenHz: 120, bandWorsen: .055 }
  },
  'challenge-results': {
    cue: 'challengeResults',
    entryId: 'challenge-results',
    comparisonId: 'challenge-results-compare',
    latest: 'latest-challenge-results.json',
    title: 'Challenge Results',
    problem: 'Challenge Results is the current highest segment-level audio gap after the fresh quality baseline: the challenge wrap-up cue is semantically correct, but its onset reads too different from the Galaga result phrase and weakens the score/result handoff.',
    target: 'Make challenge completion feel like a real arcade result phrase: clear attack, readable body, and enough duration to tell the player that scoring has resolved before the next stage handoff.',
    cooldownMs: 2400,
    referenceStarts: [0.55, 0.62, 0.7, 0.75, 0.82, 0.9, 1.0, 1.1],
    referenceDurations: [0.28, 0.36, 0.42, 0.5, 0.62, 0.78, 0.96, 1.2, 1.6],
    referenceVolumes: [0.74, 0.86, 0.95, 1.05, 1.16],
    handSpecs: [
      {
        id: 'results-guide-window',
        label: 'Results guide window',
        spec: {
          referenceClip: 'assets/reference-audio/galaga2-challenging-stage-results.m4a',
          cooldownMs: 2400,
          referenceVolume: .95,
          clipStart: .75,
          clipDuration: .42
        }
      },
      {
        id: 'results-wide-phrase',
        label: 'Results wide phrase',
        spec: {
          referenceClip: 'assets/reference-audio/galaga2-challenging-stage-results.m4a',
          cooldownMs: 2400,
          referenceVolume: .95,
          clipStart: .62,
          clipDuration: .78
        }
      },
      {
        id: 'results-full-handoff-safe',
        label: 'Results full handoff-safe phrase',
        spec: {
          referenceClip: 'assets/reference-audio/galaga2-challenging-stage-results.m4a',
          cooldownMs: 2400,
          referenceVolume: .86,
          clipStart: .55,
          clipDuration: 1.2
        }
      },
      {
        id: 'square-result-phrase',
        label: 'Square result phrase',
        spec: {
          seq: [392, 523, 659, 784],
          step: .058,
          wave: 'square',
          volume: .0138,
          slide: 18,
          lpHz: 3500,
          tones: [
            { freq: 988, duration: .13, wave: 'triangle', volume: .0058, slide: 10, lpHz: 4300, delay: .176 }
          ]
        }
      },
      {
        id: 'aurora-result-with-square-attack',
        label: 'Aurora result with square attack',
        spec: {
          seq: [392, 523, 659, 784],
          step: .064,
          wave: 'square',
          volume: .0118,
          slide: 12,
          lpHz: 3200,
          tones: [
            { freq: 196, duration: .18, wave: 'square', volume: .0032, slide: 6, lpHz: 1700, delay: 0 },
            { freq: 988, duration: .14, wave: 'triangle', volume: .0048, slide: 10, lpHz: 4300, delay: .19 }
          ]
        }
      }
    ],
    keeper: { risk: .25, segment: .45, duration: .08, acceptableDuration: .12, centroidWorsenHz: 120, bandWorsen: .055 }
  },
  'challenge-perfect': {
    cue: 'challengePerfect',
    entryId: 'challenge-perfect',
    comparisonId: 'challenge-perfect-compare',
    latest: 'latest-challenge-perfect.json',
    title: 'Challenge Perfect',
    problem: 'Challenge Perfect is the highest current segment-level audio gap: the cue is semantically correct and celebratory, but the measured onset is too peaky, too high-crossing, and too collapsed versus the Galaga perfect-clear reference phrase.',
    target: 'Make a perfect challenging-stage clear read as an unmistakable arcade reward sting with a separated attack, a short readable body, and enough ceremony to distinguish it from the normal challenge-results handoff.',
    cooldownMs: 2400,
    referenceStarts: [0, .02, .04, .08, .12, .15, .2, .28],
    referenceDurations: [.09, .12, .17, .24, .32, .48, .72, .96, 1.2, 1.6, 2.15],
    referenceVolumes: [.74, .86, .95, 1.05, 1.16],
    handSpecs: [
      {
        id: 'perfect-guide-window',
        label: 'Perfect guide window',
        spec: {
          referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a',
          cooldownMs: 2400,
          referenceVolume: .95,
          clipStart: 0,
          clipDuration: .48
        }
      },
      {
        id: 'perfect-onset-body',
        label: 'Perfect onset and body',
        spec: {
          referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a',
          cooldownMs: 2400,
          referenceVolume: 1.05,
          clipStart: 0,
          clipDuration: .24
        }
      },
      {
        id: 'perfect-measured-onset-soft-ceremony-tail',
        label: 'Perfect measured onset with soft ceremony tail',
        spec: {
          cooldownMs: 2400,
          scheduledDuration: 1.2,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: 1.05, clipStart: 0, clipDuration: .32 },
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: .18, clipStart: .32, clipDuration: .88, delay: .32 }
          ]
        }
      },
      {
        id: 'perfect-measured-onset-quiet-ceremony-tail',
        label: 'Perfect measured onset with quiet ceremony tail',
        spec: {
          cooldownMs: 2400,
          scheduledDuration: 1.2,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: 1.05, clipStart: 0, clipDuration: .32 },
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: .12, clipStart: .32, clipDuration: .88, delay: .32 }
          ]
        }
      },
      {
        id: 'perfect-measured-onset-air-tail',
        label: 'Perfect measured onset with air tail',
        spec: {
          cooldownMs: 2400,
          scheduledDuration: 1.2,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: 1.05, clipStart: 0, clipDuration: .32 },
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: .08, clipStart: .32, clipDuration: .88, delay: .32 }
          ]
        }
      },
      {
        id: 'perfect-measured-onset-spaced-whisper-tail',
        label: 'Perfect measured onset with spaced whisper tail',
        spec: {
          cooldownMs: 2400,
          scheduledDuration: 1.24,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: 1.04, clipStart: 0, clipDuration: .32 },
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: .045, clipStart: .48, clipDuration: .72, delay: .52 }
          ]
        }
      },
      {
        id: 'perfect-measured-onset-spaced-air-tail',
        label: 'Perfect measured onset with spaced air tail',
        spec: {
          cooldownMs: 2400,
          scheduledDuration: 1.24,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: 1.04, clipStart: 0, clipDuration: .32 },
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: .07, clipStart: .48, clipDuration: .72, delay: .52 }
          ]
        }
      },
      {
        id: 'perfect-short-onset-spaced-whisper-tail',
        label: 'Perfect short onset with spaced whisper tail',
        spec: {
          cooldownMs: 2400,
          scheduledDuration: 1.18,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: 1.04, clipStart: 0, clipDuration: .24 },
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: .05, clipStart: .42, clipDuration: .72, delay: .46 }
          ]
        }
      },
      {
        id: 'perfect-onset-body-separated-air-tail',
        label: 'Perfect onset/body with separated air tail',
        spec: {
          cooldownMs: 2400,
          scheduledDuration: 1.24,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: 1.05, clipStart: 0, clipDuration: .24 },
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: .07, clipStart: .48, clipDuration: .72, delay: .52 }
          ]
        }
      },
      {
        id: 'perfect-onset-body-separated-soft-tail',
        label: 'Perfect onset/body with separated soft tail',
        spec: {
          cooldownMs: 2400,
          scheduledDuration: 1.24,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: 1.05, clipStart: 0, clipDuration: .24 },
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: .12, clipStart: .48, clipDuration: .72, delay: .52 }
          ]
        }
      },
      {
        id: 'perfect-onset-body-separated-medium-tail',
        label: 'Perfect onset/body with separated medium tail',
        spec: {
          cooldownMs: 2400,
          scheduledDuration: 1.24,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: 1.05, clipStart: 0, clipDuration: .24 },
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: .2, clipStart: .48, clipDuration: .72, delay: .52 }
          ]
        }
      },
      {
        id: 'perfect-onset-body-separated-brief-soft-tail',
        label: 'Perfect onset/body with separated brief soft tail',
        spec: {
          cooldownMs: 2400,
          scheduledDuration: 1.18,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: 1.05, clipStart: 0, clipDuration: .24 },
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: .14, clipStart: .52, clipDuration: .52, delay: .62 }
          ]
        }
      },
      {
        id: 'perfect-onset-body-separated-brief-medium-tail',
        label: 'Perfect onset/body with separated brief medium tail',
        spec: {
          cooldownMs: 2400,
          scheduledDuration: 1.18,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: 1.05, clipStart: 0, clipDuration: .24 },
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: .2, clipStart: .52, clipDuration: .52, delay: .62 }
          ]
        }
      },
      {
        id: 'perfect-onset-body-separated-late-soft-tail',
        label: 'Perfect onset/body with separated late soft tail',
        spec: {
          cooldownMs: 2400,
          scheduledDuration: 1.18,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: 1.05, clipStart: 0, clipDuration: .24 },
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: .16, clipStart: .58, clipDuration: .44, delay: .7 }
          ]
        }
      },
      {
        id: 'perfect-clean-onset-scheduled-pad',
        label: 'Perfect clean onset scheduled pad',
        spec: {
          cooldownMs: 2400,
          scheduledDuration: 1.2,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: 1.05, clipStart: .02, clipDuration: .17 }
          ]
        }
      },
      {
        id: 'perfect-clean-onset-whisper-tail',
        label: 'Perfect clean onset with whisper tail',
        spec: {
          cooldownMs: 2400,
          scheduledDuration: 1.2,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: 1.05, clipStart: .02, clipDuration: .17 },
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: .05, clipStart: .2, clipDuration: 1, delay: .2 }
          ]
        }
      },
      {
        id: 'perfect-clean-onset-soft-tail',
        label: 'Perfect clean onset with soft tail',
        spec: {
          cooldownMs: 2400,
          scheduledDuration: 1.2,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: 1.05, clipStart: .02, clipDuration: .17 },
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: .1, clipStart: .2, clipDuration: 1, delay: .2 }
          ]
        }
      },
      {
        id: 'perfect-onset-body-ceremony-tail',
        label: 'Perfect onset/body with ceremony tail',
        spec: {
          cooldownMs: 2400,
          scheduledDuration: 1.2,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: 1.05, clipStart: 0, clipDuration: .24 },
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: .62, clipStart: .24, clipDuration: .96, delay: .24 }
          ]
        }
      },
      {
        id: 'perfect-onset-body-soft-tail',
        label: 'Perfect onset/body with soft tail',
        spec: {
          cooldownMs: 2400,
          scheduledDuration: 1.2,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: 1.05, clipStart: 0, clipDuration: .24 },
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: .48, clipStart: .24, clipDuration: .96, delay: .24 }
          ]
        }
      },
      {
        id: 'perfect-onset-body-bridged-tail-light',
        label: 'Perfect onset/body with bridged light tail',
        spec: {
          cooldownMs: 2400,
          scheduledDuration: 1.2,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: 1.05, clipStart: 0, clipDuration: .24 },
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: .24, clipStart: .18, clipDuration: .92, delay: .18 }
          ]
        }
      },
      {
        id: 'perfect-onset-body-bridged-tail-medium',
        label: 'Perfect onset/body with bridged medium tail',
        spec: {
          cooldownMs: 2400,
          scheduledDuration: 1.2,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: 1.04, clipStart: 0, clipDuration: .24 },
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: .34, clipStart: .18, clipDuration: .92, delay: .18 }
          ]
        }
      },
      {
        id: 'perfect-onset-body-bridged-tail-strong',
        label: 'Perfect onset/body with bridged strong tail',
        spec: {
          cooldownMs: 2400,
          scheduledDuration: 1.2,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: 1.02, clipStart: 0, clipDuration: .24 },
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: .46, clipStart: .18, clipDuration: .92, delay: .18 }
          ]
        }
      },
      {
        id: 'perfect-bright-onset-quiet-ceremony-tail',
        label: 'Perfect bright onset with quiet ceremony tail',
        spec: {
          cooldownMs: 2400,
          scheduledDuration: 1.2,
          layers: [
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: 1.16, clipStart: 0, clipDuration: .24 },
            { referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a', referenceVolume: .38, clipStart: .24, clipDuration: .96, delay: .24 }
          ]
        }
      },
      {
        id: 'perfect-full-handoff-safe',
        label: 'Perfect full handoff-safe phrase',
        spec: {
          referenceClip: 'assets/reference-audio/galaga2-challenging-stage-perfect.m4a',
          cooldownMs: 2400,
          referenceVolume: .86,
          clipStart: 0,
          clipDuration: 1.2
        }
      },
      {
        id: 'low-zcr-perfect-sting',
        label: 'Low-crossing perfect sting',
        spec: {
          seq: [784, 1047, 1318, 1760, 2349],
          step: .048,
          wave: 'triangle',
          volume: .0142,
          slide: 22,
          lpHz: 4200,
          tones: [
            { freq: 392, duration: .12, wave: 'triangle', volume: .0044, slide: 8, lpHz: 2100, delay: 0 },
            { freq: 2637, duration: .11, wave: 'sine', volume: .0056, slide: 12, lpHz: 5600, delay: .17 }
          ]
        }
      },
      {
        id: 'separated-perfect-attack',
        label: 'Separated perfect attack',
        spec: {
          tones: [
            { freq: 523, duration: .085, wave: 'square', volume: .0058, slide: 4, lpHz: 2200, delay: 0 },
            { freq: 880, duration: .062, wave: 'triangle', volume: .0098, slide: 18, lpHz: 3400, delay: .03 },
            { freq: 1175, duration: .068, wave: 'triangle', volume: .0086, slide: 14, lpHz: 3800, delay: .083 },
            { freq: 1760, duration: .095, wave: 'sine', volume: .0052, slide: 10, lpHz: 5200, delay: .16 }
          ]
        }
      }
    ],
    keeper: {
      risk: .25,
      segment: .45,
      duration: .05,
      acceptableDuration: .12,
      centroidWorsenHz: 120,
      bandWorsen: .055,
      minimumScheduledDurationSeconds: 1.1,
      minimumActiveCoverageOfScheduled: .38,
      calibratedSegmentRoleRisk: true,
      calibratedSegmentMaxRisk10: .35,
      rawSegmentWorsenMax10: .35
    }
  },
  'capture-beam': {
    cue: 'captureBeam',
    entryId: 'capture-beam',
    comparisonId: 'capture-beam-compare',
    latest: 'latest-capture-beam.json',
    title: 'Capture Beam',
    problem: 'Capture Beam is the highest runtime whole-cue audio gap after capture-lifecycle promotion: the danger cue is semantically correct, but its captured active window is too short and too spectrally distant from the tractor-beam reference.',
    target: 'Make tractor-beam deploy read as the long, threatening capture beam state that a player must immediately respect.',
    cooldownMs: 1800,
    referenceStarts: [2.72, 2.9, 3.04, 3.199, 3.34, 3.5, 3.68, 3.86],
    referenceDurations: [0.24, 0.32, 0.4, 0.48, 0.6, 0.72, 0.9],
    referenceVolumes: [0.62, 0.74, 0.86, 0.95, 1.05, 1.16],
    handSpecs: [
      {
        id: 'tractor-guide-window',
        label: 'Tractor guide window',
        spec: {
          referenceClip: 'assets/reference-audio/galaga3-tractor-beam.m4a',
          cooldownMs: 1800,
          referenceVolume: .95,
          clipStart: 3.199,
          clipDuration: .48
        }
      },
      {
        id: 'tractor-long-danger',
        label: 'Tractor long danger',
        spec: {
          referenceClip: 'assets/reference-audio/galaga3-tractor-beam.m4a',
          cooldownMs: 1800,
          referenceVolume: 1.05,
          clipStart: 3.04,
          clipDuration: .72
        }
      }
    ],
    keeper: { risk: .3, segment: .3, duration: .08, acceptableDuration: .12, centroidWorsenHz: 120, bandWorsen: .06 }
  }
};

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function rel(file, base = ROOT){
  return path.relative(base, file).split(path.sep).join('/');
}

function slug(text){
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

function round(value, places = 3){
  const n = Number(value);
  if(!Number.isFinite(n)) return null;
  const scale = 10 ** places;
  return Math.round(n * scale) / scale;
}

function finiteMetric(value){
  if(value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function clamp(value, min, max){
  return Math.min(max, Math.max(min, value));
}

function mean(values){
  const numeric = values.map(Number).filter(Number.isFinite);
  return numeric.length ? numeric.reduce((sum, value) => sum + value, 0) / numeric.length : null;
}

function maxFinite(values){
  const numeric = values.map(finiteMetric).filter(Number.isFinite);
  return numeric.length ? Math.max(...numeric) : null;
}

function stddev(values){
  const numeric = values.map(Number).filter(Number.isFinite);
  if(numeric.length < 2) return 0;
  const avg = mean(numeric);
  return Math.sqrt(numeric.reduce((sum, value) => sum + Math.pow(value - avg, 2), 0) / numeric.length);
}

function walkFiles(root, fileName){
  const found = [];
  function walk(dir){
    if(!fs.existsSync(dir)) return;
    for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
      const full = path.join(dir, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && entry.name === fileName) found.push(full);
    }
  }
  walk(root);
  return found;
}

function readJsonIfExists(file){
  if(!file || !fs.existsSync(file)) return null;
  try{
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }catch{
    return null;
  }
}

function latestRuntimeTrial(cue){
  const trials = walkFiles(RUNTIME_TRIAL_ROOT, 'report.json')
    .map(file => {
      const report = readJsonIfExists(file);
      return report?.cue === cue ? { file, report } : null;
    })
    .filter(Boolean)
    .sort((a, b) => fs.statSync(b.file).mtimeMs - fs.statSync(a.file).mtimeMs || a.file.localeCompare(b.file));
  return trials[0] || null;
}

function runtimeTrialForDecision(config, decision){
  if(!decision?.best && !decision?.measuredBest) return null;
  const trial = latestRuntimeTrial(config.cue);
  if(!trial) return null;
  const status = trial.report?.decision?.status || '';
  const candidate = trial.report?.candidate || '';
  const appliesToBest = candidate === decision.best;
  const appliesToMeasuredBest = candidate === decision.measuredBest;
  return {
    artifact: rel(trial.file),
    status,
    candidate,
    appliesToBest,
    appliesToMeasuredBest,
    promoteRuntime: trial.report?.decision?.promoteRuntime === true,
    reason: trial.report?.decision?.reason || '',
    currentAudioScore10: trial.report?.postTrialEvidence?.currentAudioScore10 ?? null,
    currentHighestRiskCue: trial.report?.postTrialEvidence?.currentHighestRiskCue || null,
    currentHighestRisk10: trial.report?.postTrialEvidence?.currentHighestRisk10 ?? null,
    nextStep: trial.report?.nextStep || ''
  };
}

function latestThemeMetricsPath(){
  const metrics = walkFiles(THEME_ROOT, 'metrics.json')
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs || a.localeCompare(b));
  return metrics[0] || '';
}

function bandSum(metrics, keys){
  const band = metrics?.band_energy || {};
  return keys.reduce((sum, key) => sum + (+band[key] || 0), 0);
}

function criticalEventProfiles(){
  if(criticalMaskingProfiles) return criticalMaskingProfiles;
  const metricsPath = latestThemeMetricsPath();
  if(!metricsPath){
    criticalMaskingProfiles = { metricsPath: '', cues: [] };
    return criticalMaskingProfiles;
  }
  try{
    const theme = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
    criticalMaskingProfiles = {
      metricsPath,
      cues: MASKING_CRITICAL_CUES
        .map(cue => {
          const item = (theme.items || []).find(row => row.cue === cue);
          const metrics = item?.variants?.aurora?.activeMetrics;
          if(!metrics) return null;
          return {
            cue,
            rms: +metrics.rms || 0,
            zeroCrossingsPerSecond: +metrics.zero_crossings_per_s || 0,
            spectralCentroidHz: +metrics.spectral_centroid_hz || 0,
            sub500: +(metrics.band_energy?.sub_500) || 0,
            brightness: bandSum(metrics, ['mid_1500_3000', 'presence_3000_6000', 'air_6000_plus']),
            brightnessLoudness: bandSum(metrics, ['mid_1500_3000', 'presence_3000_6000', 'air_6000_plus']) * (+metrics.rms || 0),
            durationSeconds: +metrics.duration_s || 0
          };
        })
        .filter(Boolean)
    };
  }catch{
    criticalMaskingProfiles = { metricsPath, cues: [] };
  }
  return criticalMaskingProfiles;
}

function run(cmd, args, options = {}){
  const res = spawnSync(cmd, args, { encoding: 'utf8', ...options });
  if(res.status !== 0) fail(`${cmd} failed`, { args, status: res.status, stdout: res.stdout, stderr: res.stderr });
  return res;
}

function git(args, fallback = ''){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function argValue(name){
  const prefix = `--${name}=`;
  const inline = process.argv.find(arg => arg.startsWith(prefix));
  if(inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : '';
}

function requestedKeys(){
  const raw = argValue('cues') || argValue('cue') || 'enemy-hit,formation-pulse,ship-loss';
  return raw.split(',').map(item => item.trim()).filter(Boolean);
}

function gridLimit(){
  const raw = Number(argValue('reference-grid-limit') || process.env.AURORA_AUDIO_FOCUS_REFERENCE_GRID_LIMIT || 48);
  return Number.isFinite(raw) ? Math.max(0, Math.min(180, Math.floor(raw))) : 48;
}

function candidateFilter(){
  return new Set(String(argValue('candidate-ids') || '').split(',').map(item => item.trim()).filter(Boolean));
}

function repeatCount(){
  const raw = Number(argValue('repeats') || process.env.AURORA_AUDIO_FOCUS_REPEATS || 1);
  return Number.isFinite(raw) ? Math.max(1, Math.min(5, Math.floor(raw))) : 1;
}

function pythonForAudioReport(){
  const bundled = path.join(process.env.HOME || '', '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'python', 'bin', 'python3');
  return fs.existsSync(bundled) ? bundled : 'python3';
}

function decodedBytes(result){
  if(!result?.base64) return 0;
  try{
    return Buffer.from(result.base64, 'base64').length;
  }catch{
    return 0;
  }
}

function decodeToFile(base64, outPath){
  fs.writeFileSync(outPath, Buffer.from(base64, 'base64'));
}

function referenceWindowArgs(window){
  if(!window) return [];
  const start = Number(window.startSeconds);
  const end = Number(window.endSeconds);
  if(!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return [];
  return ['-ss', String(start), '-t', String(end - start)];
}

function toWav(inPath, outPath, window = null){
  run('ffmpeg', ['-y', '-i', inPath, ...referenceWindowArgs(window), '-ac', '1', '-ar', '22050', outPath]);
}

function comparisonContext(config){
  const set = (GUIDE.comparisonSets || []).find(item => item.id === config.comparisonId || item.entryId === config.entryId);
  if(!set) fail(`Comparison set missing for ${config.title}`, config);
  const entry = (GUIDE.audioContexts || []).find(item => item.id === set.entryId);
  if(!entry) fail(`Audio context missing for ${config.title}`, set);
  return { set, entry };
}

function referenceGridSpecs(config, set){
  const limit = gridLimit();
  if(!limit) return [];
  const refClip = set.referenceClip;
  const guideWindow = set.referenceWindow || {};
  const targetStart = Number(guideWindow.startSeconds || 0);
  const targetDuration = Number((guideWindow.endSeconds || 0) - (guideWindow.startSeconds || 0)) || .24;
  const specs = [];
  for(const clipStart of config.referenceStarts){
    for(const clipDuration of config.referenceDurations){
      for(const referenceVolume of config.referenceVolumes){
        const startGap = Math.abs(clipStart - targetStart);
        const durationGap = Math.abs(clipDuration - targetDuration);
        const volumeGap = Math.abs(referenceVolume - .86);
        const heuristic = (startGap * 3) + (durationGap * 4) + (volumeGap * .35);
        const id = [
          'refclip',
          `s${Math.round(clipStart * 1000)}`,
          `d${Math.round(clipDuration * 1000)}`,
          `v${Math.round(referenceVolume * 100)}`
        ].join('-');
        specs.push({
          id,
          label: `${config.title} reference ${clipStart}s/${clipDuration}s v${referenceVolume}`,
          generated: true,
          generator: {
            family: `${slug(config.title)}-reference-subclip-grid`,
            heuristic: round(heuristic, 5),
            target: config.target,
            params: { clipStart, clipDuration, referenceVolume }
          },
          spec: {
            referenceClip: refClip,
            cooldownMs: config.cooldownMs || (config.cue === 'stagePulse' ? 1250 : (config.cue === 'playerHit' ? 1800 : 220)),
            referenceVolume,
            clipStart,
            clipDuration
          }
        });
      }
    }
  }
  return specs.sort((a, b) => a.generator.heuristic - b.generator.heuristic || a.id.localeCompare(b.id)).slice(0, limit);
}

function formationPulseCadenceSpecs(config){
  if(config.cue !== 'stagePulse') return [];
  const profiles = [
    { id: 'sine82', wave: 'sine', freqs: [82, 123], volumes: [.0042, .0022], lpHz: [420, 560], attacks: [.07, .04], delays: [0, .058], durations: [.2, .13], scoreBias: .04 },
    { id: 'sine98', wave: 'sine', freqs: [98, 147], volumes: [.004, .002], lpHz: [460, 620], attacks: [.076, .042], delays: [0, .062], durations: [.2, .12], scoreBias: .02 },
    { id: 'tri98', wave: 'triangle', freqs: [98, 147], volumes: [.0038, .0018], lpHz: [480, 640], attacks: [.082, .046], delays: [0, .06], durations: [.21, .12], scoreBias: .03 },
    { id: 'tri123', wave: 'triangle', freqs: [123, 185], volumes: [.0034, .0016], lpHz: [520, 700], attacks: [.07, .04], delays: [0, .052], durations: [.19, .11], scoreBias: .01 },
    { id: 'square98', wave: 'square', freqs: [98, 147], volumes: [.0028, .0013], lpHz: [380, 520], attacks: [.06, .04], delays: [0, .064], durations: [.18, .1], scoreBias: .06 },
    { id: 'sine98-body', wave: 'sine', freqs: [98], volumes: [.0048], lpHz: [440], attacks: [.09], delays: [0], durations: [.22], scoreBias: 0 },
    { id: 'contract-sine74-pressure', wave: 'sine', freqs: [74, 111, 148], volumes: [.0028, .0016, .001], lpHz: [320, 440, 520], attacks: [.11, .08, .058], delays: [0, .072, .132], durations: [.26, .18, .12], scoreBias: -.05 },
    { id: 'contract-sine98-calm-body', wave: 'sine', freqs: [98, 147], volumes: [.0032, .0014], lpHz: [360, 500], attacks: [.12, .075], delays: [0, .084], durations: [.25, .13], scoreBias: -.045 },
    { id: 'contract-triangle82-lowpass-bed', wave: 'triangle', freqs: [82, 123], volumes: [.0026, .0012], lpHz: [300, 420], attacks: [.095, .068], delays: [0, .078], durations: [.24, .13], scoreBias: -.035 },
    { id: 'contract-sine123-pressure-pocket', wave: 'sine', freqs: [123, 92], volumes: [.0025, .0012], lpHz: [420, 340], attacks: [.105, .075], delays: [0, .064], durations: [.22, .14], scoreBias: -.025 },
    { id: 'stable-soft-near-miss-lowpass', wave: 'triangle', freqs: [147, 294, 196], volumes: [.0046, .0028, .0022], lpHz: [520, 680, 560], attacks: [.07, .052, .042], delays: [0, .035, .083], durations: [.2, .145, .105], scoreBias: -.07 },
    { id: 'stable-sine-near-miss-lowpass', wave: 'sine', freqs: [147, 294, 196], volumes: [.0048, .0026, .002], lpHz: [480, 620, 520], attacks: [.078, .058, .044], delays: [0, .038, .086], durations: [.21, .14, .1], scoreBias: -.068 },
    { id: 'stable-monotone-low-pressure-pocket', wave: 'sine', freqs: [123], volumes: [.0042], lpHz: [390], attacks: [.12], delays: [0], durations: [.24], scoreBias: -.06 },
    { id: 'stable-two-step-pressure-pocket', wave: 'sine', freqs: [123, 185], volumes: [.0038, .0018], lpHz: [410, 540], attacks: [.105, .07], delays: [0, .075], durations: [.23, .115], scoreBias: -.055 },
    { id: 'phase-soft-square-near-miss', family: 'stage-pulse-phase-envelope-grid', waves: ['square', 'triangle', 'triangle'], freqs: [147, 294, 196], volumes: [.0062, .0044, .0032], lpHz: [760, 940, 680], attacks: [.062, .046, .038], delays: [0, .024, .074], durations: [.19, .145, .112], slides: [-4, -8, -5], scoreBias: -.09 },
    { id: 'phase-soft-square-low-rms', family: 'stage-pulse-phase-envelope-grid', waves: ['square', 'triangle', 'sine'], freqs: [147, 294, 196], volumes: [.0048, .0032, .0024], lpHz: [700, 880, 620], attacks: [.075, .054, .044], delays: [0, .032, .082], durations: [.205, .14, .104], slides: [-3, -7, -4], scoreBias: -.092 },
    { id: 'phase-sub-dominant-bed', family: 'stage-pulse-phase-envelope-grid', waves: ['sine', 'sine', 'triangle'], freqs: [74, 111, 148], volumes: [.0088, .0032, .0017], lpHz: [280, 380, 460], attacks: [.15, .105, .078], delays: [0, .074, .132], durations: [.265, .18, .118], slides: [-1, -2, -3], scoreBias: -.11 },
    { id: 'phase-late-peak-sub500-bed', family: 'stage-pulse-phase-envelope-grid', waves: ['sine', 'triangle', 'sine'], freqs: [82, 123, 164], volumes: [.0095, .0025, .0021], lpHz: [300, 360, 440], attacks: [.17, .075, .062], delays: [0, .058, .108], durations: [.25, .16, .1], slides: [-1, -2, -3], scoreBias: -.108 },
    { id: 'phase-muted-square-body', family: 'stage-pulse-phase-envelope-grid', waves: ['square', 'sine'], freqs: [98, 147], volumes: [.0068, .0022], lpHz: [340, 430], attacks: [.11, .072], delays: [0, .088], durations: [.225, .112], slides: [-3, -4], scoreBias: -.095 },
    { id: 'phase-muted-square-body-single98', family: 'stage-pulse-phase-envelope-grid', waves: ['square'], freqs: [98], volumes: [.0068], lpHz: [340], attacks: [.118], delays: [0], durations: [.235], slides: [-3], scoreBias: -.118 },
    { id: 'phase-muted-square-body-single82', family: 'stage-pulse-phase-envelope-grid', waves: ['square'], freqs: [82], volumes: [.0072], lpHz: [310], attacks: [.13], delays: [0], durations: [.245], slides: [-2], scoreBias: -.12 },
    { id: 'phase-muted-triangle-body-single98', family: 'stage-pulse-phase-envelope-grid', waves: ['triangle'], freqs: [98], volumes: [.0076], lpHz: [360], attacks: [.125], delays: [0], durations: [.24], slides: [-2], scoreBias: -.112 },
    { id: 'phase-muted-square-body-delayed-harmonic', family: 'stage-pulse-phase-envelope-grid', waves: ['square', 'sine'], freqs: [98, 147], volumes: [.0066, .0014], lpHz: [330, 390], attacks: [.12, .06], delays: [0, .138], durations: [.235, .07], slides: [-3, -3], scoreBias: -.116 },
    { id: 'phase-muted-square-body-sub-support', family: 'stage-pulse-phase-envelope-grid', waves: ['square', 'sine'], freqs: [98, 74], volumes: [.0064, .002], lpHz: [330, 260], attacks: [.12, .15], delays: [0, .05], durations: [.23, .185], slides: [-3, -1], scoreBias: -.119 },
    { id: 'phase-reference-shaped-pocket', family: 'stage-pulse-phase-envelope-grid', waves: ['sine', 'square', 'triangle'], freqs: [98, 196, 147], volumes: [.006, .0026, .002], lpHz: [360, 520, 430], attacks: [.14, .07, .052], delays: [0, .092, .148], durations: [.24, .12, .08], slides: [-2, -5, -3], scoreBias: -.1 },
    { id: 'refined-soft-attack-single', family: 'stage-pulse-soft-march-refinement', waves: ['square', 'triangle', 'triangle'], freqs: [147, 294, 196], volumes: [.0062, .0048, .0036], lpHz: [760, 980, 680], attacks: [.052, .04, .032], delays: [0, .022, .07], durations: [.18, .15, .12], slides: [-4, -8, -5], scoreBias: -.13 },
    { id: 'refined-soft-attack-lowpass', family: 'stage-pulse-soft-march-refinement', waves: ['square', 'triangle', 'triangle'], freqs: [147, 294, 196], volumes: [.0054, .0034, .0024], lpHz: [560, 700, 540], attacks: [.074, .054, .044], delays: [0, .03, .086], durations: [.205, .135, .102], slides: [-3, -6, -4], scoreBias: -.132 },
    { id: 'refined-triangle-body-pocket', family: 'stage-pulse-soft-march-refinement', waves: ['triangle', 'sine', 'triangle'], freqs: [98, 147, 196], volumes: [.0064, .0028, .0018], lpHz: [360, 500, 620], attacks: [.12, .082, .052], delays: [0, .066, .122], durations: [.242, .14, .094], slides: [-2, -4, -4], scoreBias: -.134 },
    { id: 'refined-sine-body-pocket', family: 'stage-pulse-soft-march-refinement', waves: ['sine', 'triangle', 'sine'], freqs: [98, 147, 196], volumes: [.0068, .0022, .0015], lpHz: [330, 470, 560], attacks: [.14, .084, .058], delays: [0, .078, .138], durations: [.25, .13, .08], slides: [-1, -3, -3], scoreBias: -.136 },
    { id: 'refined-body-plus-soft-click', family: 'stage-pulse-soft-march-refinement', waves: ['sine', 'triangle', 'square'], freqs: [82, 123, 196], volumes: [.0066, .0024, .0012], lpHz: [300, 420, 520], attacks: [.16, .095, .05], delays: [0, .074, .152], durations: [.255, .145, .055], slides: [-1, -2, -4], scoreBias: -.138 },
    { id: 'refined-low-dual-body', family: 'stage-pulse-soft-march-refinement', waves: ['triangle', 'sine'], freqs: [98, 147], volumes: [.0072, .0024], lpHz: [340, 470], attacks: [.135, .082], delays: [0, .082], durations: [.245, .128], slides: [-2, -3], scoreBias: -.14 },
    { id: 'refined-muted-square-underbody', family: 'stage-pulse-soft-march-refinement', waves: ['square', 'sine'], freqs: [98, 147], volumes: [.0056, .002], lpHz: [310, 430], attacks: [.14, .084], delays: [0, .088], durations: [.24, .12], slides: [-2, -3], scoreBias: -.142 },
    { id: 'mask-soft-march-short', family: 'stage-pulse-masking-safe-refinement', waves: ['square', 'triangle', 'triangle'], freqs: [147, 294, 196], volumes: [.0048, .0029, .002], lpHz: [620, 760, 560], attacks: [.064, .044, .034], delays: [0, .02, .064], durations: [.165, .11, .078], slides: [-3, -6, -4], scoreBias: -.155 },
    { id: 'mask-soft-march-under', family: 'stage-pulse-masking-safe-refinement', waves: ['triangle', 'triangle', 'sine'], freqs: [147, 220, 98], volumes: [.0044, .0024, .0022], lpHz: [540, 660, 340], attacks: [.08, .052, .11], delays: [0, .032, .076], durations: [.17, .095, .126], slides: [-3, -4, -1], scoreBias: -.158 },
    { id: 'mask-triangle-pocket-short', family: 'stage-pulse-masking-safe-refinement', waves: ['triangle', 'sine', 'triangle'], freqs: [98, 147, 196], volumes: [.0052, .0019, .0011], lpHz: [340, 460, 560], attacks: [.12, .078, .046], delays: [0, .058, .104], durations: [.205, .105, .062], slides: [-2, -3, -3], scoreBias: -.16 },
    { id: 'mask-weighted-body-short', family: 'stage-pulse-masking-safe-refinement', waves: ['sine', 'triangle'], freqs: [98, 147], volumes: [.0058, .0017], lpHz: [320, 430], attacks: [.13, .078], delays: [0, .068], durations: [.215, .092], slides: [-1, -2], scoreBias: -.162 },
    { id: 'mask-low-click-pocket', family: 'stage-pulse-masking-safe-refinement', waves: ['sine', 'triangle', 'square'], freqs: [82, 123, 196], volumes: [.0056, .0018, .0008], lpHz: [280, 380, 460], attacks: [.15, .092, .042], delays: [0, .064, .126], durations: [.22, .095, .042], slides: [-1, -2, -3], scoreBias: -.164 },
    { id: 'anchor-soft-body-short', family: 'stage-pulse-anchor-body-refinement', waves: ['square', 'triangle'], freqs: [147, 196], volumes: [.0056, .0012], lpHz: [560, 520], attacks: [.052, .04], delays: [0, .086], durations: [.17, .06], slides: [-3, -3], scoreBias: -.171 },
    { id: 'anchor-triangle-body-short', family: 'stage-pulse-anchor-body-refinement', waves: ['triangle', 'sine'], freqs: [123, 196], volumes: [.0058, .001], lpHz: [420, 520], attacks: [.068, .04], delays: [0, .09], durations: [.18, .05], slides: [-2, -3], scoreBias: -.172 },
    { id: 'anchor-low-square-body', family: 'stage-pulse-anchor-body-refinement', waves: ['square'], freqs: [147], volumes: [.0054], lpHz: [520], attacks: [.06], delays: [0], durations: [.18], slides: [-3], scoreBias: -.174 },
    { id: 'anchor-low-triangle-body', family: 'stage-pulse-anchor-body-refinement', waves: ['triangle'], freqs: [123], volumes: [.0062], lpHz: [420], attacks: [.078], delays: [0], durations: [.19], slides: [-2], scoreBias: -.173 },
    { id: 'anchor-body-sub-support', family: 'stage-pulse-anchor-body-refinement', waves: ['square', 'sine'], freqs: [147, 74], volumes: [.0051, .0014], lpHz: [520, 260], attacks: [.058, .12], delays: [0, .048], durations: [.172, .132], slides: [-3, -1], scoreBias: -.175 },
    { id: 'anchor-body-no-tail', family: 'stage-pulse-anchor-body-refinement', waves: ['triangle'], freqs: [147], volumes: [.0057], lpHz: [500], attacks: [.062], delays: [0], durations: [.166], slides: [-3], scoreBias: -.176 },
    { id: 'stability-anchor-sub-lowgain', family: 'stage-pulse-stability-refinement', waves: ['square', 'sine'], freqs: [147, 74], volumes: [.0043, .0011], lpHz: [460, 240], attacks: [.074, .15], delays: [0, .054], durations: [.185, .145], slides: [-2, -1], scoreBias: -.183 },
    { id: 'stability-anchor-sub-steady', family: 'stage-pulse-stability-refinement', waves: ['square', 'sine'], freqs: [147, 98], volumes: [.0045, .0013], lpHz: [480, 300], attacks: [.086, .13], delays: [0, .062], durations: [.195, .132], slides: [-2, -1], scoreBias: -.181 },
    { id: 'stability-soft-square-triad', family: 'stage-pulse-stability-refinement', waves: ['square', 'triangle', 'sine'], freqs: [147, 294, 196], volumes: [.0044, .0026, .0016], lpHz: [520, 640, 460], attacks: [.082, .06, .052], delays: [0, .036, .092], durations: [.195, .12, .082], slides: [-2, -4, -3], scoreBias: -.18 },
    { id: 'stability-single-pressure-body', family: 'stage-pulse-stability-refinement', waves: ['square'], freqs: [147], volumes: [.0049], lpHz: [470], attacks: [.09], delays: [0], durations: [.19], slides: [-2], scoreBias: -.179 },
    { id: 'stability-sine-pressure-pocket', family: 'stage-pulse-stability-refinement', waves: ['sine', 'triangle'], freqs: [123, 185], volumes: [.0046, .0014], lpHz: [380, 480], attacks: [.11, .07], delays: [0, .082], durations: [.215, .095], slides: [-1, -2], scoreBias: -.178 }
  ];
  return profiles.map((profile, index) => ({
    id: `cadence-${profile.id}`,
    label: `Cadence generator ${profile.id}`,
    generated: true,
    generator: {
      family: profile.family || 'stage-pulse-cadence-pressure-grid',
      heuristic: round((profile.scoreBias || 0) + (profile.freqs[0] / 10000) + (profile.lpHz[0] / 100000), 5),
      target: 'Raise low-band body while reducing brightness, zero-crossing density, and RMS for formation pressure cadence.',
      params: profile
    },
    spec: {
      tones: profile.freqs.map((freq, toneIndex) => ({
        freq,
        duration: profile.durations[toneIndex] ?? profile.durations[0],
        wave: profile.waves?.[toneIndex] || profile.wave,
        volume: profile.volumes[toneIndex] ?? profile.volumes[0],
        slide: profile.slides?.[toneIndex] ?? (toneIndex ? -4 : -2),
        lpHz: profile.lpHz[toneIndex] ?? profile.lpHz[0],
        delay: profile.delays[toneIndex] ?? 0,
        attack: profile.attacks[toneIndex] ?? profile.attacks[0],
        singleOscillator: 1
      }))
    }
  })).sort((a, b) => a.generator.heuristic - b.generator.heuristic || a.id.localeCompare(b.id));
}

function candidateSpecs(config, set){
  const candidates = [
    { id: 'baseline-current', label: 'Current Aurora baseline', baseline: true },
    ...(config.handSpecs || []),
    ...formationPulseCadenceSpecs(config),
    ...referenceGridSpecs(config, set)
  ];
  const filter = candidateFilter();
  return filter.size ? candidates.filter(row => row.baseline || filter.has(row.id)) : candidates;
}

function riskBreakdown(comparison){
  const components = {
    duration: clamp((+comparison.duration_s || 0) / .85, 0, 1),
    centroid: clamp((+comparison.spectral_centroid_hz || 0) / 1300, 0, 1),
    zeroCrossing: clamp((+comparison.zero_crossings_per_s || 0) / 1800, 0, 1),
    rms: clamp((+comparison.rms || 0) / .16, 0, 1),
    bandShape: clamp((+comparison.band_shape_distance || 0) / .5, 0, 1),
    rolloff: clamp((+comparison.spectral_rolloff_85_hz || 0) / 2600, 0, 1),
    attack: clamp((+comparison.attack_peak_position || 0) / .9, 0, 1),
    decay: clamp((+comparison.decay_ratio || 0) / 3.2, 0, 1),
    burst: clamp((+comparison.burst_share || 0) / .35, 0, 1)
  };
  const weights = {
    duration: .18,
    centroid: .15,
    zeroCrossing: .08,
    rms: .08,
    bandShape: .17,
    rolloff: .14,
    attack: .11,
    decay: .06,
    burst: .03
  };
  const weighted = Object.entries(weights).reduce((sum, [key, weight]) => sum + components[key] * weight, 0);
  const dominant = Object.entries(components).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';
  return { risk10: round(weighted * 10, 2), components, dominant };
}

function segmentSummary(comparisons = []){
  if(!comparisons.length){
    return {
      segmentRoleComparisonCount: 0,
      averageSegmentRisk10: null,
      worstSegmentRisk10: null,
      worstSegmentRole: '',
      exactSegmentRoleMatchCount: 0,
      worstSegmentInterpretation: ''
    };
  }
  const risks = comparisons.map(item => +item.auroraSegmentRisk10 || 0);
  const worst = comparisons.reduce((best, item) => (+item.auroraSegmentRisk10 || 0) > (+best.auroraSegmentRisk10 || 0) ? item : best, comparisons[0]);
  return {
    segmentRoleComparisonCount: comparisons.length,
    averageSegmentRisk10: round(mean(risks), 2),
    worstSegmentRisk10: round(Math.max(...risks), 2),
    worstSegmentRole: worst.role || '',
    exactSegmentRoleMatchCount: comparisons.filter(item => item.auroraExactRoleMatch).length,
    worstSegmentInterpretation: worst.interpretation || ''
  };
}

function segmentRoleMap(comparisons = []){
  const roles = {};
  for(const item of comparisons){
    const role = String(item.role || '').trim();
    if(!role) continue;
    const auroraRisk10 = finiteMetric(item.auroraSegmentRisk10);
    const syntheticRisk10 = finiteMetric(item.syntheticGalagaSegmentRisk10);
    const calibrationDelta10 = Number.isFinite(auroraRisk10) && Number.isFinite(syntheticRisk10)
      ? auroraRisk10 - syntheticRisk10
      : null;
    const calibratedRisk10 = Number.isFinite(calibrationDelta10)
      ? Math.max(0, calibrationDelta10)
      : auroraRisk10;
    roles[role] = {
      role,
      risk10: Number.isFinite(auroraRisk10) ? round(auroraRisk10, 2) : null,
      rawRisk10: Number.isFinite(auroraRisk10) ? round(auroraRisk10, 2) : null,
      syntheticRisk10: Number.isFinite(syntheticRisk10) ? round(syntheticRisk10, 2) : null,
      calibratedRisk10: Number.isFinite(calibratedRisk10) ? round(calibratedRisk10, 2) : null,
      calibrationDelta10: Number.isFinite(calibrationDelta10) ? round(calibrationDelta10, 2) : null,
      exactRoleMatch: !!item.auroraExactRoleMatch,
      syntheticExactRoleMatch: !!item.syntheticGalagaExactRoleMatch,
      referenceWindow: item.referenceWindow || null,
      auroraWindow: item.auroraWindow || null,
      syntheticWindow: item.syntheticGalagaWindow || null,
      comparison: item.auroraVsReference || null,
      syntheticComparison: item.syntheticGalagaVsReference || null,
      interpretation: item.interpretation || ''
    };
  }
  return roles;
}

function aggregateSegmentRoles(group){
  const roleNames = Array.from(new Set(group.flatMap(row => Object.keys(row.segmentRoles || {})))).sort();
  const roles = {};
  for(const role of roleNames){
    const samples = group.map(row => row.segmentRoles?.[role]).filter(Boolean);
    const risks = samples.map(item => finiteMetric(item.rawRisk10 ?? item.risk10)).filter(Number.isFinite);
    const syntheticRisks = samples.map(item => finiteMetric(item.syntheticRisk10)).filter(Number.isFinite);
    const calibratedRisks = samples.map(item => finiteMetric(item.calibratedRisk10)).filter(Number.isFinite);
    const calibrationDeltas = samples.map(item => finiteMetric(item.calibrationDelta10)).filter(Number.isFinite);
    const exactMatches = samples.filter(item => item.exactRoleMatch).length;
    const syntheticExactMatches = samples.filter(item => item.syntheticExactRoleMatch).length;
    const referenceWindows = samples.map(item => item.referenceWindow).filter(Boolean);
    const auroraWindows = samples.map(item => item.auroraWindow).filter(Boolean);
    const syntheticWindows = samples.map(item => item.syntheticWindow).filter(Boolean);
    const averageRisk10 = mean(risks);
    const averageSyntheticRisk10 = mean(syntheticRisks);
    const averageCalibratedRisk10 = mean(calibratedRisks);
    const averageCalibrationDelta10 = mean(calibrationDeltas);
    const averageAuroraDurationSeconds = mean(auroraWindows.map(item => item?.duration_s).filter(value => finiteMetric(value) !== null));
    const averageSyntheticDurationSeconds = mean(syntheticWindows.map(item => item?.duration_s).filter(value => finiteMetric(value) !== null));
    roles[role] = {
      role,
      risk10: Number.isFinite(averageRisk10) ? round(averageRisk10, 2) : null,
      rawRisk10: Number.isFinite(averageRisk10) ? round(averageRisk10, 2) : null,
      worstRisk10: Number.isFinite(maxFinite(risks)) ? round(maxFinite(risks), 2) : null,
      syntheticRisk10: Number.isFinite(averageSyntheticRisk10) ? round(averageSyntheticRisk10, 2) : null,
      worstSyntheticRisk10: Number.isFinite(maxFinite(syntheticRisks)) ? round(maxFinite(syntheticRisks), 2) : null,
      calibratedRisk10: Number.isFinite(averageCalibratedRisk10) ? round(averageCalibratedRisk10, 2) : null,
      worstCalibratedRisk10: Number.isFinite(maxFinite(calibratedRisks)) ? round(maxFinite(calibratedRisks), 2) : null,
      calibrationDelta10: Number.isFinite(averageCalibrationDelta10) ? round(averageCalibrationDelta10, 2) : null,
      worstCalibrationDelta10: Number.isFinite(maxFinite(calibrationDeltas)) ? round(maxFinite(calibrationDeltas), 2) : null,
      exactRoleMatchRate: round(exactMatches / Math.max(1, samples.length), 2),
      syntheticExactRoleMatchRate: round(syntheticExactMatches / Math.max(1, samples.length), 2),
      referenceWindow: referenceWindows[0] || null,
      auroraWindow: auroraWindows[0] || null,
      syntheticWindow: syntheticWindows[0] || null,
      averageAuroraDurationSeconds: Number.isFinite(averageAuroraDurationSeconds) ? round(averageAuroraDurationSeconds, 3) : null,
      averageSyntheticDurationSeconds: Number.isFinite(averageSyntheticDurationSeconds) ? round(averageSyntheticDurationSeconds, 3) : null,
      interpretation: samples.slice().sort((a, b) => (+b.rawRisk10 || +b.risk10 || 0) - (+a.rawRisk10 || +a.risk10 || 0))[0]?.interpretation || ''
    };
  }
  return roles;
}

function scheduledCueDurationSeconds(row){
  const scheduledSpecDuration = specScheduledDurationSeconds(row.spec);
  if(Number.isFinite(scheduledSpecDuration) && scheduledSpecDuration > 0) return scheduledSpecDuration;
  const specDuration = Number(row.spec?.clipDuration);
  if(row.spec?.referenceClip && Number.isFinite(specDuration) && specDuration > 0) return round(specDuration, 3);
  return round(row.activeMetrics?.duration_s, 3);
}

function specScheduledDurationSeconds(spec = {}){
  spec = spec || {};
  if(Number.isFinite(+spec.scheduledDuration) && +spec.scheduledDuration > 0) return round(+spec.scheduledDuration, 3);
  if(Number.isFinite(+spec.clipDuration) && +spec.clipDuration > 0) return round(+spec.clipDuration, 3);
  if(Array.isArray(spec.layers) && spec.layers.length){
    const ends = spec.layers.map(layer => {
      const delay = Math.max(0, +layer.delay || 0);
      if(layer.referenceClip){
        const duration = Number.isFinite(+layer.clipDuration) && +layer.clipDuration > 0 ? +layer.clipDuration : 4;
        return delay + duration;
      }
      let endT = .12;
      if(Array.isArray(layer.seq) && layer.seq.length){
        const step = Math.max(.01, +layer.step || .05);
        endT = Math.max(endT, ((layer.seq.length - 1) * step * .92) + step + .06);
      }
      if(Array.isArray(layer.tones))for(const tone of layer.tones){
        endT = Math.max(endT, Math.max(0, +tone.delay || 0) + Math.max(.01, +tone.duration || .08) + .06);
      }
      if(Array.isArray(layer.noise))for(const burst of layer.noise){
        endT = Math.max(endT, Math.max(0, +burst.delay || 0) + Math.max(.01, +burst.duration || .08) + .04);
      }
      return delay + endT;
    });
    return round(Math.max(...ends), 3);
  }
  return null;
}

function analysisWindowForCapture(result = {}, spec = {}){
  spec = spec || {};
  const prerollMs = Number(result.capturePrerollMs);
  const effectiveSpec = Object.keys(spec).length ? spec : (result.audioSpec || {});
  const specDuration = specScheduledDurationSeconds(effectiveSpec);
  const cueDuration = Number(result.audioCue?.referenceClipDuration);
  const duration = Number.isFinite(specDuration) && specDuration > 0
    ? specDuration
    : Number.isFinite(cueDuration) && cueDuration > 0
      ? cueDuration
      : null;
  if(!Number.isFinite(prerollMs) || !Number.isFinite(duration) || duration <= 0) return null;
  return {
    start_s: round(prerollMs / 1000, 3),
    duration_s: round(duration, 3),
    source: 'captured-cue-preroll-and-scheduled-cue-duration'
  };
}

function referenceAnalysisWindow(set = {}){
  const segments = set?.referenceSegmentation?.segments || [];
  const starts = segments.map(segment => Number(segment.startSeconds ?? segment.start_s)).filter(Number.isFinite);
  const ends = segments.map(segment => Number(segment.endSeconds ?? segment.end_s)).filter(Number.isFinite);
  if(starts.length && ends.length){
    const start = Math.min(...starts);
    const end = Math.max(...ends);
    if(end > start){
      return {
        start_s: round(start, 3),
        duration_s: round(end - start, 3),
        source: 'curated-reference-segmentation-span'
      };
    }
  }
  return null;
}

function referenceCompositeDurationSeconds(row){
  const windows = Object.values(row.segmentRoleAverages || {}).map(item => item.referenceWindow).filter(Boolean);
  const starts = windows.map(item => Number(item.start_s ?? item.startSeconds)).filter(Number.isFinite);
  const ends = windows.map(item => Number(item.end_s ?? item.endSeconds)).filter(Number.isFinite);
  if(starts.length && ends.length){
    const duration = Math.max(...ends) - Math.min(...starts);
    if(duration > 0) return round(duration, 3);
  }
  return round(row.referenceMetrics?.duration_s, 3);
}

function lossCompositeAnalysis(row, config){
  const gate = config.lossComposite;
  if(!gate) return null;
  const calibration = gate.calibration || null;
  const usesCalibratedRoles = calibration?.mode === 'synthetic-galaga-browser-capture'
    && calibration?.roleRiskMode === 'calibrated';
  const roles = gate.roles || Object.keys(row.segmentRoleAverages || {});
  const scheduledDurationSeconds = scheduledCueDurationSeconds(row);
  const referenceDurationSeconds = referenceCompositeDurationSeconds(row);
  const activeDurationSeconds = round(row.activeMetrics?.duration_s, 3);
  const durationGapSeconds = Number.isFinite(scheduledDurationSeconds) && Number.isFinite(referenceDurationSeconds)
    ? round(Math.abs(scheduledDurationSeconds - referenceDurationSeconds), 3)
    : null;
  const activeDurationGapSeconds = Number.isFinite(activeDurationSeconds) && Number.isFinite(referenceDurationSeconds)
    ? round(Math.abs(activeDurationSeconds - referenceDurationSeconds), 3)
    : null;
  const scheduledCoverage = Number.isFinite(scheduledDurationSeconds) && Number.isFinite(referenceDurationSeconds) && referenceDurationSeconds > 0
    ? round(scheduledDurationSeconds / referenceDurationSeconds, 3)
    : null;
  const activeCoverage = Number.isFinite(activeDurationSeconds) && Number.isFinite(referenceDurationSeconds) && referenceDurationSeconds > 0
    ? round(activeDurationSeconds / referenceDurationSeconds, 3)
    : null;
  const roleRows = roles.map(role => {
    const item = row.segmentRoleAverages?.[role] || {};
    const rawRisk10 = finiteMetric(item.rawRisk10 ?? item.risk10);
    const syntheticRisk10 = finiteMetric(item.syntheticRisk10);
    const calibratedRisk10 = finiteMetric(item.calibratedRisk10);
    const risk10 = usesCalibratedRoles && Number.isFinite(calibratedRisk10) ? calibratedRisk10 : rawRisk10;
    const maxRisk10 = Number(usesCalibratedRoles
      ? calibration.maxRoleRisk10?.[role] ?? calibration.maxRoleRisk10?.default ?? gate.maxRoleRisk10?.[role] ?? gate.maxRoleRisk10?.default ?? 3.5
      : gate.maxRoleRisk10?.[role] ?? gate.maxRoleRisk10?.default ?? 3.5);
    return {
      role,
      risk10: Number.isFinite(risk10) ? round(risk10, 2) : null,
      rawRisk10: Number.isFinite(rawRisk10) ? round(rawRisk10, 2) : null,
      syntheticRisk10: Number.isFinite(syntheticRisk10) ? round(syntheticRisk10, 2) : null,
      calibratedRisk10: Number.isFinite(calibratedRisk10) ? round(calibratedRisk10, 2) : null,
      calibrationDelta10: Number.isFinite(item.calibrationDelta10) ? round(item.calibrationDelta10, 2) : null,
      riskMode: usesCalibratedRoles ? 'calibrated-excess-over-synthetic-galaga-browser-capture' : 'raw-segment-risk',
      score10: Number.isFinite(risk10) ? round(Math.max(0, 10 - risk10), 2) : 0,
      weight: Number(gate.roleWeights?.[role] ?? 1),
      maxRisk10,
      clears: Number.isFinite(risk10) && risk10 <= maxRisk10,
      exactRoleMatchRate: item.exactRoleMatchRate ?? null,
      interpretation: item.interpretation || ''
    };
  });
  const durationClears = Number.isFinite(durationGapSeconds)
    && durationGapSeconds <= Number(gate.durationTolerance ?? .14)
    && Number.isFinite(scheduledCoverage)
    && scheduledCoverage >= Number(gate.scheduledCoverageMin ?? .75)
    && scheduledCoverage <= Number(gate.scheduledCoverageMax ?? 1.25);
  const roleScore10 = weightedScore(roleRows);
  const durationScore10 = Number.isFinite(durationGapSeconds) ? scoreGap(durationGapSeconds, Number(gate.durationTolerance ?? .14)) : 0;
  const coverageScore10 = Number.isFinite(scheduledCoverage) ? Math.min(
    scoreDeficit(scheduledCoverage, Number(gate.scheduledCoverageMin ?? .75), .2),
    scoreExcess(scheduledCoverage, Number(gate.scheduledCoverageMax ?? 1.25), .2)
  ) : 0;
  const score10 = weightedScore([
    { score10: roleScore10, weight: .62 },
    { score10: durationScore10, weight: .24 },
    { score10: coverageScore10, weight: .14 }
  ]);
  const clearsRoleGates = roleRows.every(item => item.clears);
  const clearsScore = score10 >= Number(gate.minScore10 ?? 7);
  return {
    family: gate.family || 'loss-cue-composite',
    calibration: usesCalibratedRoles ? {
      mode: calibration.mode,
      roleRiskMode: calibration.roleRiskMode,
      rawSegmentWorsenMax10: Number(calibration.rawSegmentWorsenMax10 ?? .35),
      rationale: calibration.rationale || ''
    } : null,
    scheduledDurationSeconds,
    activeDurationSeconds,
    referenceDurationSeconds,
    durationGapSeconds,
    activeDurationGapSeconds,
    scheduledCoverage,
    activeCoverage,
    durationToleranceSeconds: Number(gate.durationTolerance ?? .14),
    roleScore10,
    durationScore10,
    coverageScore10,
    score10,
    roles: roleRows,
    clearsDuration: !!durationClears,
    clearsRoleGates,
    clearsScore,
    clears: !!durationClears && clearsRoleGates && clearsScore,
    interpretation: durationClears
      ? 'Scheduled phrase duration preserves the full loss cue even when active-window energy sees a quiet tail.'
      : 'Loss cue duration still needs a wider scheduled phrase or stronger tail/body energy.'
  };
}

function bandEnergyDelta(active, reference){
  const keys = ['sub_500', 'low_mid_500_1500', 'mid_1500_3000', 'presence_3000_6000', 'air_6000_plus'];
  const delta = {};
  for(const key of keys) delta[key] = round((active?.[key] || 0) - (reference?.[key] || 0), 4);
  return delta;
}

function scoreGap(value, tolerance){
  const gap = Math.abs(+value || 0);
  return round(Math.max(0, Math.min(10, 10 - ((gap / Math.max(tolerance, .001)) * 10))), 2);
}

function scoreDeficit(actual, target, tolerance){
  const deficit = Math.max(0, (+target || 0) - (+actual || 0));
  return round(Math.max(0, Math.min(10, 10 - ((deficit / Math.max(tolerance, .001)) * 10))), 2);
}

function scoreExcess(actual, target, tolerance){
  const excess = Math.max(0, (+actual || 0) - (+target || 0));
  return round(Math.max(0, Math.min(10, 10 - ((excess / Math.max(tolerance, .001)) * 10))), 2);
}

function weightedScore(rows){
  const total = rows.reduce((sum, row) => sum + (+row.weight || 0), 0);
  return total > 0 ? round(rows.reduce((sum, row) => sum + (+row.score10 || 0) * (+row.weight || 0), 0) / total, 2) : 0;
}

function ceremonyTailAnalysis(row, config){
  const gate = config.keeper || {};
  const minimumScheduledDurationSeconds = Number(gate.minimumScheduledDurationSeconds);
  if(!Number.isFinite(minimumScheduledDurationSeconds)) return null;
  const scheduledDurationSeconds = scheduledCueDurationSeconds(row);
  const activityProfile = row.activityProfile || {};
  const activeDurationSeconds = Number(activityProfile.active_span_duration_s ?? row.activeMetrics?.duration_s);
  if(!Number.isFinite(scheduledDurationSeconds) || !Number.isFinite(activeDurationSeconds) || scheduledDurationSeconds <= 0) return null;
  const minimumActiveCoverageOfScheduled = Number.isFinite(+gate.minimumActiveCoverageOfScheduled)
    ? +gate.minimumActiveCoverageOfScheduled
    : .35;
  const activeCoverageOfScheduled = Number.isFinite(+activityProfile.active_span_coverage)
    ? +activityProfile.active_span_coverage
    : activeDurationSeconds / scheduledDurationSeconds;
  const activeCoverageScore10 = scoreDeficit(activeCoverageOfScheduled, minimumActiveCoverageOfScheduled, .24);
  const minimumActiveSeconds = round(scheduledDurationSeconds * minimumActiveCoverageOfScheduled, 3);
  const clearsActiveCoverage = activeCoverageOfScheduled >= minimumActiveCoverageOfScheduled;
  return {
    family: 'ceremony-tail-audibility',
    scheduledDurationSeconds: round(scheduledDurationSeconds, 3),
    activeDurationSeconds: round(activeDurationSeconds, 3),
    minimumActiveSeconds,
    activeCoverageOfScheduled: round(activeCoverageOfScheduled, 3),
    minimumActiveCoverageOfScheduled: round(minimumActiveCoverageOfScheduled, 3),
    activeCoverageScore10,
    activeFrameShare: Number.isFinite(+activityProfile.active_frame_share) ? round(+activityProfile.active_frame_share, 3) : null,
    activeEnergyShare: Number.isFinite(+activityProfile.active_energy_share) ? round(+activityProfile.active_energy_share, 3) : null,
    islandCount: Number.isFinite(+activityProfile.island_count) ? Math.round(+activityProfile.island_count) : null,
    longestSilentGapSeconds: Number.isFinite(+activityProfile.longest_silent_gap_s) ? round(+activityProfile.longest_silent_gap_s, 3) : null,
    clearsActiveCoverage,
    interpretation: clearsActiveCoverage
      ? 'The cue keeps enough measurable active energy across the scheduled ceremony window to avoid collapsing into an onset-only reward blip.'
      : 'The cue may preserve scheduled duration on paper, but active energy still collapses into the onset/body window; a stronger or better-shaped tail is needed before runtime promotion.'
  };
}

function cadencePressureAnalysis(activeMetrics, referenceMetrics){
  const aurBand = activeMetrics?.band_energy || {};
  const refBand = referenceMetrics?.band_energy || {};
  const aurMidPresence = (+aurBand.mid_1500_3000 || 0) + (+aurBand.presence_3000_6000 || 0);
  const refMidPresence = (+refBand.mid_1500_3000 || 0) + (+refBand.presence_3000_6000 || 0);
  const axes = [
    { id: 'low-band-body', score10: scoreDeficit(aurBand.sub_500, refBand.sub_500, .34), weight: .22, aurora: round(+aurBand.sub_500 || 0, 4), reference: round(+refBand.sub_500 || 0, 4) },
    { id: 'brightness-control', score10: Math.min(scoreExcess(aurMidPresence, refMidPresence, .28), scoreGap((+activeMetrics.spectral_rolloff_85_hz || 0) - (+referenceMetrics.spectral_rolloff_85_hz || 0), 1800)), weight: .22, aurora: round(aurMidPresence, 4), reference: round(refMidPresence, 4) },
    { id: 'zero-crossing-calm', score10: scoreGap((+activeMetrics.zero_crossings_per_s || 0) - (+referenceMetrics.zero_crossings_per_s || 0), 1700), weight: .18, aurora: round(+activeMetrics.zero_crossings_per_s || 0, 1), reference: round(+referenceMetrics.zero_crossings_per_s || 0, 1) },
    { id: 'gain-match', score10: scoreGap((+activeMetrics.rms || 0) - (+referenceMetrics.rms || 0), .13), weight: .16, aurora: round(+activeMetrics.rms || 0, 4), reference: round(+referenceMetrics.rms || 0, 4) },
    { id: 'duration-pocket', score10: scoreGap((+activeMetrics.duration_s || 0) - (+referenceMetrics.duration_s || 0), .12), weight: .12, aurora: round(+activeMetrics.duration_s || 0, 3), reference: round(+referenceMetrics.duration_s || 0, 3) },
    { id: 'envelope-smoothness', score10: Math.min(scoreGap((+activeMetrics.attack_peak_position || 0) - (+referenceMetrics.attack_peak_position || 0), .5), scoreExcess(activeMetrics.burst_share, referenceMetrics.burst_share, .28)), weight: .1, aurora: { attack_peak_position: round(+activeMetrics.attack_peak_position || 0, 3), burst_share: round(+activeMetrics.burst_share || 0, 3) }, reference: { attack_peak_position: round(+referenceMetrics.attack_peak_position || 0, 3), burst_share: round(+referenceMetrics.burst_share || 0, 3) } }
  ].sort((a, b) => a.score10 - b.score10 || b.weight - a.weight || a.id.localeCompare(b.id));
  return {
    score10: weightedScore(axes),
    weakestAxis: axes[0]?.id || '',
    axes
  };
}

function maskingSeparationAnalysis(activeMetrics, referenceMetrics){
  const profiles = criticalEventProfiles();
  const cues = profiles.cues || [];
  if(!cues.length) return null;
  const aurBand = activeMetrics?.band_energy || {};
  const refBand = referenceMetrics?.band_energy || {};
  const aurBrightness = bandSum(activeMetrics, ['mid_1500_3000', 'presence_3000_6000', 'air_6000_plus']);
  const refBrightness = bandSum(referenceMetrics, ['mid_1500_3000', 'presence_3000_6000', 'air_6000_plus']);
  const eventBrightness = mean(cues.map(cue => cue.brightness)) || 0;
  const aurBrightnessLoudness = aurBrightness * (+activeMetrics.rms || 0);
  const refBrightnessLoudness = refBrightness * (+referenceMetrics.rms || 0);
  const eventBrightnessLoudness = mean(cues.map(cue => cue.brightnessLoudness)) || 0;
  const eventRms = mean(cues.map(cue => cue.rms)) || 0;
  const eventZcr = mean(cues.map(cue => cue.zeroCrossingsPerSecond)) || 0;
  const eventSub = mean(cues.map(cue => cue.sub500)) || 0;
  const gainTarget = Math.min(+referenceMetrics.rms || eventRms * .45, eventRms * .48);
  const brightnessTarget = Math.max(refBrightness + .14, eventBrightness * .78);
  const brightnessLoudnessTarget = Math.max(refBrightnessLoudness * 1.6, eventBrightnessLoudness * .74);
  const zcrTarget = Math.min(+referenceMetrics.zero_crossings_per_s || eventZcr * .55, eventZcr * .58);
  const axes = [
    {
      id: 'bed-gain-headroom',
      score10: scoreExcess(+activeMetrics.rms || 0, gainTarget, .12),
      weight: .24,
      aurora: round(+activeMetrics.rms || 0, 4),
      target: round(gainTarget, 4),
      criticalEventMean: round(eventRms, 4),
      interpretation: 'A formation bed should sit below shot/hit/explosion loudness so momentary events remain readable.'
    },
    {
      id: 'weighted-transient-headroom',
      score10: scoreExcess(aurBrightnessLoudness, brightnessLoudnessTarget, .08),
      weight: .24,
      aurora: round(aurBrightnessLoudness, 4),
      target: round(brightnessLoudnessTarget, 4),
      criticalEventMean: round(eventBrightnessLoudness, 4),
      interpretation: 'Formation cadence should keep actual bright-band loudness below combat events, not only reduce normalized spectral share.'
    },
    {
      id: 'spectral-brightness-share',
      score10: scoreExcess(aurBrightness, brightnessTarget, .24),
      weight: .1,
      aurora: round(aurBrightness, 4),
      target: round(brightnessTarget, 4),
      criticalEventMean: round(eventBrightness, 4),
      interpretation: 'Normalized brightness share is a secondary warning: the bed may be quiet, but it should still leave spectral space for action cues.'
    },
    {
      id: 'zero-crossing-calm',
      score10: scoreExcess(+activeMetrics.zero_crossings_per_s || 0, zcrTarget, 1650),
      weight: .14,
      aurora: round(+activeMetrics.zero_crossings_per_s || 0, 1),
      target: round(zcrTarget, 1),
      criticalEventMean: round(eventZcr, 1),
      interpretation: 'A calmer bed leaves sharper high-frequency texture for action cues.'
    },
    {
      id: 'low-band-pressure-body',
      score10: scoreDeficit(+aurBand.sub_500 || 0, +refBand.sub_500 || eventSub, .34),
      weight: .18,
      aurora: round(+aurBand.sub_500 || 0, 4),
      reference: round(+refBand.sub_500 || 0, 4),
      criticalEventMean: round(eventSub, 4),
      interpretation: 'The pressure cue should carry body without being mistaken for a hit or explosion.'
    },
    {
      id: 'duration-pocket',
      score10: scoreGap((+activeMetrics.duration_s || 0) - (+referenceMetrics.duration_s || 0), .12),
      weight: .1,
      aurora: round(+activeMetrics.duration_s || 0, 3),
      reference: round(+referenceMetrics.duration_s || 0, 3),
      interpretation: 'The pulse must fit the repeated stage cadence pocket.'
    }
  ].sort((a, b) => a.score10 - b.score10 || b.weight - a.weight || a.id.localeCompare(b.id));
  return {
    score10: weightedScore(axes),
    weakestAxis: axes[0]?.id || '',
    sourceThemeMetrics: profiles.metricsPath ? rel(profiles.metricsPath) : '',
    criticalCueCount: cues.length,
    criticalCues: cues.map(cue => cue.cue),
    axes
  };
}

function rejectionFor(row, baseline, config){
  if(!baseline) return 'no baseline';
  const gate = config.keeper || {};
  const reasons = [];
  if(row.risk10 > baseline.risk10 - (gate.risk ?? .3)) reasons.push(`whole-cue risk improved only ${round(baseline.risk10 - row.risk10, 2)}`);
  const usesCalibratedRoleGates = row.lossComposite?.calibration?.roleRiskMode === 'calibrated' || gate.calibratedSegmentRoleRisk === true;
  if(Number.isFinite(+baseline.worstSegmentRisk10) && Number.isFinite(+row.worstSegmentRisk10)){
    if(usesCalibratedRoleGates){
      const rawSegmentWorsen = round(row.worstSegmentRisk10 - baseline.worstSegmentRisk10, 2);
      const rawSegmentWorsenMax10 = Number(row.lossComposite?.calibration?.rawSegmentWorsenMax10 ?? gate.rawSegmentWorsenMax10 ?? .35);
      if(rawSegmentWorsen > rawSegmentWorsenMax10){
        reasons.push(`raw segment risk worsened by ${rawSegmentWorsen}/10 > ${rawSegmentWorsenMax10}/10 calibration guard`);
      }
      const calibratedRisks = Object.values(row.segmentRoleAverages || {}).map(role => finiteMetric(role.calibratedRisk10)).filter(Number.isFinite);
      const worstCalibratedRisk10 = maxFinite(calibratedRisks);
      const calibratedSegmentMaxRisk10 = Number(gate.calibratedSegmentMaxRisk10 ?? .35);
      if(Number.isFinite(worstCalibratedRisk10) && worstCalibratedRisk10 > calibratedSegmentMaxRisk10){
        reasons.push(`calibrated segment risk ${round(worstCalibratedRisk10, 2)} > ${calibratedSegmentMaxRisk10}`);
      }
    }else if(row.worstSegmentRisk10 > baseline.worstSegmentRisk10 - (gate.segment ?? .3)){
      reasons.push(`segment risk improved only ${round(baseline.worstSegmentRisk10 - row.worstSegmentRisk10, 2)}`);
    }
  }
  const rowDurationGap = row.lossComposite?.durationGapSeconds ?? row.durationGapSeconds;
  const baselineDurationGap = baseline.lossComposite?.durationGapSeconds ?? baseline.durationGapSeconds;
  const acceptableDuration = row.lossComposite?.durationToleranceSeconds ?? gate.acceptableDuration ?? 0;
  const durationImprovedEnough = rowDurationGap <= baselineDurationGap - (gate.duration ?? .08);
  const durationCloseEnough = rowDurationGap <= acceptableDuration;
  if(!durationImprovedEnough && !durationCloseEnough) reasons.push(`duration gap improved only ${round(baselineDurationGap - rowDurationGap, 3)}s`);
  const minimumScheduledDurationSeconds = Number(gate.minimumScheduledDurationSeconds);
  const scheduledDurationSeconds = cueSpecScheduledDurationSeconds(row.spec);
  if(Number.isFinite(minimumScheduledDurationSeconds) && Number.isFinite(scheduledDurationSeconds) && scheduledDurationSeconds < minimumScheduledDurationSeconds){
    reasons.push(`scheduled cue duration ${scheduledDurationSeconds}s < ${minimumScheduledDurationSeconds}s ceremony minimum`);
  }
  if(row.ceremonyTail && !row.ceremonyTail.clearsActiveCoverage){
    reasons.push(`ceremony tail active coverage ${row.ceremonyTail.activeCoverageOfScheduled} < ${row.ceremonyTail.minimumActiveCoverageOfScheduled}`);
  }
  if(row.lossComposite){
    if(!row.lossComposite.clearsDuration) reasons.push(`loss composite duration gate failed (${row.lossComposite.durationGapSeconds}s scheduled gap)`);
    if(!row.lossComposite.clearsRoleGates) reasons.push('loss composite role gate failed');
    if(!row.lossComposite.clearsScore) reasons.push(`loss composite score ${row.lossComposite.score10} < ${config.lossComposite?.minScore10 ?? 7}`);
  }
  if(row.bandShapeGap > baseline.bandShapeGap + (gate.bandWorsen ?? .05)) reasons.push(`band shape worsened by ${round(row.bandShapeGap - baseline.bandShapeGap, 4)}`);
  if(row.centroidGapHz > baseline.centroidGapHz + (gate.centroidWorsenHz ?? 100)) reasons.push(`centroid worsened by ${round(row.centroidGapHz - baseline.centroidGapHz, 1)} Hz`);
  if(row.cadencePressure && baseline.cadencePressure && row.cadencePressure.score10 < baseline.cadencePressure.score10 + (gate.cadencePressure ?? 1)){
    reasons.push(`cadence pressure improved only ${round(row.cadencePressure.score10 - baseline.cadencePressure.score10, 2)}`);
  }
  if(row.cadencePressure && Number.isFinite(+gate.cadencePressureMin) && row.cadencePressure.score10 < +gate.cadencePressureMin){
    reasons.push(`cadence pressure ${row.cadencePressure.score10} < ${gate.cadencePressureMin}`);
  }
  if(row.maskingSeparation && baseline.maskingSeparation && row.maskingSeparation.score10 < baseline.maskingSeparation.score10 + (gate.maskingSeparation ?? 1)){
    reasons.push(`masking separation improved only ${round(row.maskingSeparation.score10 - baseline.maskingSeparation.score10, 2)}`);
  }
  if(row.maskingSeparation && Number.isFinite(+gate.maskingSeparationMin) && row.maskingSeparation.score10 < +gate.maskingSeparationMin){
    reasons.push(`masking separation ${row.maskingSeparation.score10} < ${gate.maskingSeparationMin}`);
  }
  if(row.exactSegmentRoleMatchCount < baseline.exactSegmentRoleMatchCount) reasons.push('fewer exact segment-role matches than baseline');
  if((row.stability?.repetitions || 1) > 1){
    if((row.stability.riskStd || 0) > .35) reasons.push(`risk stability sd ${row.stability.riskStd} > 0.35`);
    if((row.stability.durationGapStdSeconds || 0) > .08) reasons.push(`duration stability sd ${row.stability.durationGapStdSeconds}s > 0.08s`);
    if((row.stability.centroidGapStdHz || 0) > 120) reasons.push(`centroid stability sd ${row.stability.centroidGapStdHz} Hz > 120 Hz`);
    if((row.stability.zeroCrossingGapStdPerSecond || 0) > 420) reasons.push(`zero-crossing stability sd ${row.stability.zeroCrossingGapStdPerSecond}/s > 420/s`);
    if((row.stability.bandShapeGapStd || 0) > .045) reasons.push(`band-shape stability sd ${row.stability.bandShapeGapStd} > 0.045`);
    if((row.stability.decayRatioGapStd || 0) > 1.2) reasons.push(`decay stability sd ${row.stability.decayRatioGapStd} > 1.2`);
    if((row.stability.rmsGapStd || 0) > .035) reasons.push(`RMS stability sd ${row.stability.rmsGapStd} > 0.035`);
  }
  return reasons.length ? reasons.join('; ') : 'clears keeper gates';
}

function cueSpecScheduledDurationSeconds(spec){
  return specScheduledDurationSeconds(spec);
}

function decisionFor(rows, config){
  const baseline = rows.find(row => row.id === 'baseline-current');
  const candidates = rows.filter(row => row.id !== 'baseline-current');
  const keepers = candidates.filter(row => rejectionFor(row, baseline, config) === 'clears keeper gates');
  const measuredBest = candidates.slice().sort((a, b) => a.risk10 - b.risk10 || (a.worstSegmentRisk10 || 99) - (b.worstSegmentRisk10 || 99))[0] || null;
  const best = keepers.slice().sort((a, b) => a.risk10 - b.risk10 || (a.worstSegmentRisk10 || 99) - (b.worstSegmentRisk10 || 99))[0] || null;
  const calibratedGateRead = config.lossComposite?.calibration || config.keeper?.calibratedSegmentRoleRisk ? 'calibrated role/segment' : 'segment';
  if(!best){
    return {
      status: 'no-keeper',
      keep: false,
      baseline: baseline?.id || null,
      best: null,
      measuredBest: measuredBest?.id || null,
      reason: `No ${config.title} candidate cleared whole-cue, ${calibratedGateRead}, duration, band, centroid, and role-match gates.`
    };
  }
  return {
    status: 'candidate-recommended',
    keep: true,
    baseline: baseline.id,
    best: best.id,
    measuredBest: measuredBest?.id || best.id,
    riskDelta: round(baseline.risk10 - best.risk10, 2),
    segmentRiskDelta: round((baseline.worstSegmentRisk10 || 0) - (best.worstSegmentRisk10 || 0), 2),
    durationDeltaSeconds: round((baseline.lossComposite?.durationGapSeconds ?? baseline.durationGapSeconds) - (best.lossComposite?.durationGapSeconds ?? best.durationGapSeconds), 3),
    bandDelta: round(baseline.bandShapeGap - best.bandShapeGap, 4),
    reason: `${config.title} candidate clears measured ${calibratedGateRead} keeper gates.`
  };
}

function successMeasureFor(config){
  const base = config.cue === 'stagePulse'
    ? 'A keeper must improve whole-cue risk, onset segment risk, cadence pressure, and masking separation while preserving duration pocket, band shape, and segment-role guards.'
    : config.lossComposite
      ? 'A keeper must improve whole-cue risk and onset/body/tail segment risk while preserving scheduled loss-phrase duration, semantic role coverage, and band/centroid guardrails.'
      : 'A keeper must improve whole-cue risk, segment risk, and duration gap while avoiding material centroid, band-shape, or segment-role regressions.';
  const minimumScheduledDurationSeconds = Number(config.keeper?.minimumScheduledDurationSeconds);
  return Number.isFinite(minimumScheduledDurationSeconds)
    ? `${base} Runtime promotion also requires a scheduled cue duration of at least ${minimumScheduledDurationSeconds}s so ceremony/reward cues do not collapse into an onset-only subwindow.`
    : base;
}

function nextStepForDecision(config, decision, rows){
  if(decision.keep && decision.runtimeTrial?.status === 'runtime-trial-rejected' && decision.runtimeTrial.appliesToBest){
    return decision.runtimeTrial.nextStep
      || `Do not directly promote ${decision.best} for ${config.title}: the measured keeper was rejected by a full runtime trial. Next pass should preserve the keeper's useful onset/body evidence while searching for a safer tail, lower overlap risk, or a runtime window that maintains full audio gates.`;
  }
  if(decision.keep && decision.runtimeTrial?.status === 'runtime-trial-accepted' && decision.runtimeTrial.appliesToBest){
    return `Promote ${decision.best} for ${config.title}: the measured keeper also passed runtime trial evidence. Rerun the full audio comparison, event-gap rollup, cue alignment, and quality gates after promotion.`;
  }
  if(decision.keep && decision.runtimeTrial?.status === 'runtime-trial-rejected'){
    return `Run promotion precheck for new ${config.title} keeper ${decision.best}; prior runtime rejection for ${decision.runtimeTrial.candidate} remains a guardrail, so do not promote directly until full-theme audio comparison, event-gap rollup, cue alignment, and quality gates hold or improve.`;
  }
  if(decision.keep){
    return `Run promotion precheck for ${decision.best} for ${config.title}, then promote only if full-theme audio comparison, event-gap rollup, cue alignment, and quality gates hold or improve.`;
  }
  const measuredBest = rows.find(row => row.id === decision.measuredBest);
  if(decision.runtimeTrial?.status === 'runtime-trial-rejected' && decision.runtimeTrial.appliesToMeasuredBest){
    return decision.runtimeTrial.nextStep
      || `Do not promote ${config.title}: measured best ${decision.measuredBest} has already failed a full runtime trial. Next pass should add explicit tail audibility and overlap guards before another runtime promotion attempt.`;
  }
  if(decision.runtimeTrial?.status === 'runtime-trial-rejected'){
    return `${decision.runtimeTrial.nextStep || `A prior ${config.title} runtime trial was rejected and should remain a promotion blocker until its failed gate is addressed.`} Latest measured best is ${decision.measuredBest || 'none'}, which still did not clear keeper gates; refine scoring/generation around the rejected trial evidence before another promotion attempt.`;
  }
  const keeperRead = String(measuredBest?.keeperRead || '');
  const ceremonyMinimumSeconds = Number(config.keeper?.minimumScheduledDurationSeconds);
  if(Number.isFinite(ceremonyMinimumSeconds) && /scheduled cue duration/i.test(keeperRead)){
    return `Do not promote ${config.title}: measured best ${decision.measuredBest} solves the short acoustic window but collapses below the ${ceremonyMinimumSeconds}s ceremony minimum. Next pass should keep this onset/body subclip and search or synthesize a low-risk tail/body layer that preserves reward duration without worsening onset, band shape, or stability.`;
  }
  if(/ceremony tail active coverage/i.test(keeperRead)){
    return `Do not promote ${config.title}: measured best ${decision.measuredBest} keeps the scheduled ceremony window but does not keep enough active tail energy to read as a reward phrase. Next pass should use active-tail coverage as a generator target, then rerun runtime-trial gates before any promotion.`;
  }
  if(/stability/i.test(keeperRead)){
    return `Do not promote ${config.title}: measured best ${decision.measuredBest} is not stable enough across repeated captures. Next pass should tighten the capture window and prefer candidates whose risk, duration, centroid, and band-shape variance stay inside keeper gates.`;
  }
  return `Do not promote ${config.title} yet; use the measured best candidate to refine the generator or scoring gates.`;
}

function aggregateRows(sampleRows, config){
  const grouped = new Map();
  for(const row of sampleRows){
    if(!grouped.has(row.candidateId)) grouped.set(row.candidateId, []);
    grouped.get(row.candidateId).push(row);
  }
  const rows = [];
  for(const [candidateId, group] of grouped){
    const first = group[0];
    const avgComparison = {};
    const comparisonKeys = new Set(group.flatMap(row => Object.keys(row.comparison || {})));
    for(const key of comparisonKeys){
      avgComparison[key] = round(mean(group.map(row => row.comparison?.[key])), key.includes('position') || key.includes('ratio') || key.includes('share') || key.includes('distance') ? 4 : 3);
    }
    const activeBandEnergy = {};
    const referenceBandEnergy = {};
    for(const key of ['sub_500', 'low_mid_500_1500', 'mid_1500_3000', 'presence_3000_6000', 'air_6000_plus']){
      activeBandEnergy[key] = round(mean(group.map(row => row.activeMetrics?.band_energy?.[key])), 4);
      referenceBandEnergy[key] = round(mean(group.map(row => row.referenceMetrics?.band_energy?.[key])), 4);
    }
    const activeMetrics = {
      duration_s: round(mean(group.map(row => row.activeMetrics?.duration_s)), 3),
      rms: round(mean(group.map(row => row.activeMetrics?.rms)), 4),
      spectral_centroid_hz: round(mean(group.map(row => row.activeMetrics?.spectral_centroid_hz)), 1),
      zero_crossings_per_s: round(mean(group.map(row => row.activeMetrics?.zero_crossings_per_s)), 1),
      spectral_rolloff_85_hz: round(mean(group.map(row => row.activeMetrics?.spectral_rolloff_85_hz)), 1),
      band_energy: activeBandEnergy,
      attack_peak_position: round(mean(group.map(row => row.activeMetrics?.attack_peak_position)), 3),
      decay_ratio: round(mean(group.map(row => row.activeMetrics?.decay_ratio)), 3),
      burst_share: round(mean(group.map(row => row.activeMetrics?.burst_share)), 3)
    };
    const referenceMetrics = {
      duration_s: round(mean(group.map(row => row.referenceMetrics?.duration_s)), 3),
      rms: round(mean(group.map(row => row.referenceMetrics?.rms)), 4),
      spectral_centroid_hz: round(mean(group.map(row => row.referenceMetrics?.spectral_centroid_hz)), 1),
      zero_crossings_per_s: round(mean(group.map(row => row.referenceMetrics?.zero_crossings_per_s)), 1),
      spectral_rolloff_85_hz: round(mean(group.map(row => row.referenceMetrics?.spectral_rolloff_85_hz)), 1),
      band_energy: referenceBandEnergy,
      attack_peak_position: round(mean(group.map(row => row.referenceMetrics?.attack_peak_position)), 3),
      decay_ratio: round(mean(group.map(row => row.referenceMetrics?.decay_ratio)), 3),
      burst_share: round(mean(group.map(row => row.referenceMetrics?.burst_share)), 3)
    };
    const activityProfile = {
      duration_s: round(mean(group.map(row => row.activityProfile?.duration_s)), 3),
      active_span_duration_s: round(mean(group.map(row => row.activityProfile?.active_span_duration_s)), 3),
      active_span_coverage: round(mean(group.map(row => row.activityProfile?.active_span_coverage)), 3),
      active_frame_share: round(mean(group.map(row => row.activityProfile?.active_frame_share)), 3),
      active_energy_share: round(mean(group.map(row => row.activityProfile?.active_energy_share)), 3),
      threshold_rms: round(mean(group.map(row => row.activityProfile?.threshold_rms)), 4),
      island_count: Math.round(mean(group.map(row => row.activityProfile?.island_count)) || 0),
      longest_silent_gap_s: round(mean(group.map(row => row.activityProfile?.longest_silent_gap_s)), 3)
    };
    const segmentRoleAverages = aggregateSegmentRoles(group);
    const row = {
      id: candidateId,
      label: first.label,
      generated: !!first.generated,
      generator: first.generator || null,
      spec: first.spec || null,
      durationGapSeconds: avgComparison.duration_s,
      centroidGapHz: avgComparison.spectral_centroid_hz,
      zeroCrossingGapPerSecond: avgComparison.zero_crossings_per_s,
      rmsGap: avgComparison.rms,
      bandShapeGap: avgComparison.band_shape_distance,
      rolloffGapHz: avgComparison.spectral_rolloff_85_hz,
      envelopeShapeGap: round(mean(group.map(row => row.envelopeShapeGap)), 3),
      activeMetrics,
      referenceMetrics,
      activityProfile,
      bandEnergyDelta: bandEnergyDelta(activeBandEnergy, referenceBandEnergy),
      cadencePressure: first.configCue === 'stagePulse' ? cadencePressureAnalysis(activeMetrics, referenceMetrics) : null,
      maskingSeparation: first.configCue === 'stagePulse' ? maskingSeparationAnalysis(activeMetrics, referenceMetrics) : null,
      comparison: avgComparison,
      segmentRoleAverages,
      segmentRoleComparisonCount: Math.round(mean(group.map(row => row.segmentRoleComparisonCount || 0)) || 0),
      averageSegmentRisk10: round(mean(group.map(row => row.averageSegmentRisk10)), 2),
      worstSegmentRisk10: round(mean(group.map(row => row.worstSegmentRisk10)), 2),
      worstSegmentRole: group.slice().sort((a, b) => (+b.worstSegmentRisk10 || 0) - (+a.worstSegmentRisk10 || 0))[0]?.worstSegmentRole || '',
      exactSegmentRoleMatchCount: Math.round(mean(group.map(row => row.exactSegmentRoleMatchCount || 0)) || 0),
      worstSegmentInterpretation: group.slice().sort((a, b) => (+b.worstSegmentRisk10 || 0) - (+a.worstSegmentRisk10 || 0))[0]?.worstSegmentInterpretation || '',
      stability: {
        repetitions: group.length,
        riskStd: round(stddev(group.map(row => row.risk10)), 3),
        durationGapStdSeconds: round(stddev(group.map(row => row.durationGapSeconds)), 3),
        centroidGapStdHz: round(stddev(group.map(row => row.centroidGapHz)), 1),
        zeroCrossingGapStdPerSecond: round(stddev(group.map(row => row.zeroCrossingGapPerSecond)), 1),
        bandShapeGapStd: round(stddev(group.map(row => row.bandShapeGap)), 4),
        decayRatioGapStd: round(stddev(group.map(row => row.comparison?.decay_ratio)), 3),
        rmsGapStd: round(stddev(group.map(row => row.rmsGap)), 4)
      },
      samples: group.map(row => ({
        id: row.id,
        repetition: row.repetition,
        risk10: row.risk10,
        durationGapSeconds: row.durationGapSeconds,
        centroidGapHz: row.centroidGapHz,
        rmsGap: row.rmsGap,
        bandShapeGap: row.bandShapeGap,
        worstSegmentRisk10: row.worstSegmentRisk10,
        worstSegmentRole: row.worstSegmentRole,
        segmentRoles: row.segmentRoles
      }))
    };
    const breakdown = riskBreakdown(avgComparison);
    row.risk10 = breakdown.risk10;
    row.riskBreakdown = breakdown.components;
    row.dominantPenalty = breakdown.dominant;
    row.ceremonyTail = ceremonyTailAnalysis(row, config);
    row.lossComposite = lossCompositeAnalysis(row, config);
    rows.push(row);
  }
  return rows.sort((a, b) => a.risk10 - b.risk10 || (a.worstSegmentRisk10 ?? 99) - (b.worstSegmentRisk10 ?? 99) || a.durationGapSeconds - b.durationGapSeconds);
}

async function captureCandidate(config, row, opts, index){
  const expectedCue = row.baseline ? config.cue : `__candidate_${row.id}`;
  const attempts = Math.max(1, Number(process.env.AURORA_AUDIO_CAPTURE_RETRIES || 3));
  let last = null;
  for(let attempt = 1; attempt <= attempts; attempt += 1){
    const result = await withHarnessPage({ stage: 8, ships: 3, challenge: false, seed: 41211 + (index * 10) + attempt, skipStart: true }, async ({ page }) => {
      await page.evaluate(() => installGamePack('aurora-galactica', { persist: false }));
      if(row.baseline){
        return await page.evaluate(async payload => {
          return await window.__galagaHarness__.captureAudioCue(payload.cue, payload.opts);
        }, { cue: config.cue, opts });
      }
      return await page.evaluate(async payload => {
        return await window.__galagaHarness__.captureAudioCueSpec(payload.spec, payload.opts);
      }, { spec: Object.assign({}, row.spec, { syntheticCandidateId: row.id }), opts: { ...opts, name: expectedCue } });
    });
    const byteLength = decodedBytes(result);
    const capturedCue = String(result?.audioCue?.cue || '').trim();
    last = Object.assign({}, result || {}, { attempt, byteLength });
    if(result?.ok && byteLength >= 512 && capturedCue === expectedCue) return last;
    if(attempt === attempts && result?.audioSpec && capturedCue === expectedCue){
      return Object.assign({}, last, {
        ok: true,
        offlineRender: true,
        offlineReason: result?.error || 'Browser MediaRecorder returned no decodable bytes; rendered resolved cue spec offline.'
      });
    }
    last.captureMismatch = { expectedCue, capturedCue: capturedCue || '(none)' };
  }
  return last || { ok: false, error: 'capture did not run' };
}

function markdown(report){
  const lines = [
    `# Aurora ${report.title} Audio Candidate Analysis`,
    '',
    `Generated: ${report.generatedAt}`,
    `Commit: ${report.commit}${report.dirty ? ' (dirty)' : ''}`,
    `Repetitions per candidate: ${report.repetitions}`,
    `Capture preroll: ${report.capturePlan?.defaultPrerollMs ?? 'n/a'}ms`,
    '',
    '## Problem',
    '',
    report.problem,
    '',
    '## Decision',
    '',
    `- Status: \`${report.decision.status}\``,
    `- Best: \`${report.decision.best || 'none'}\``,
    `- Measured best: \`${report.decision.measuredBest || 'none'}\``,
    `- Reason: ${report.decision.reason}`,
    '',
    '| Candidate | Risk | Worst Segment | Composite | Tail Cov. | Cadence | Masking | Duration Gap | Band Gap | Stability | Keeper Read |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |'
  ];
  for(const row of report.candidates.slice(0, 24)){
    const stability = row.stability ? `${row.stability.repetitions}x, risk sd ${row.stability.riskStd}` : '1x';
    const composite = row.lossComposite ? `${row.lossComposite.score10} (${row.lossComposite.durationGapSeconds}s)` : 'n/a';
    const tailCoverage = row.ceremonyTail ? `${row.ceremonyTail.activeCoverageOfScheduled}` : 'n/a';
    const durationGap = row.lossComposite?.durationGapSeconds ?? row.durationGapSeconds;
    lines.push(`| ${row.label} | ${row.risk10} | ${row.worstSegmentRole || 'n/a'} ${row.worstSegmentRisk10 ?? 'n/a'} | ${composite} | ${tailCoverage} | ${row.cadencePressure?.score10 ?? 'n/a'} | ${row.maskingSeparation?.score10 ?? 'n/a'} | ${durationGap}s | ${row.bandShapeGap} | ${stability} | ${row.keeperRead} |`);
  }
  lines.push('', '## Next Step', '', report.nextStep, '');
  return `${lines.join('\n')}\n`;
}

async function analyzeCue(key, generatedAt, rootDir){
  const config = CUE_CONFIGS[key];
  if(!config) fail(`Unknown focus cue: ${key}`, { valid: Object.keys(CUE_CONFIGS) });
  const commit = git(['rev-parse', '--short', 'HEAD'], 'unknown');
  const dirty = git(['status', '--short'], '').trim().length > 0;
  const { set, entry } = comparisonContext(config);
  const opts = { ...(entry.preview || {}), audioTheme: 'aurora-application', allowIdle: true, minCaptureBytes: 512 };
  delete opts.cue;
  const candidates = candidateSpecs(config, set);
  const repeats = repeatCount();
  const cueDir = path.join(rootDir, key);
  const samplesDir = path.join(cueDir, 'samples');
  ensureDir(samplesDir);

  const referenceSource = path.join(ROOT, 'src', set.referenceClip.replace(/^assets\//, 'assets/'));
  if(!fs.existsSync(referenceSource)) fail(`${config.title} reference clip missing`, { referenceSource, set });
  const referenceWav = path.join(samplesDir, `${slug(config.title)}-reference.wav`);
  toWav(referenceSource, referenceWav, set.referenceWindow || null);

  const captures = [];
  for(let index = 0; index < candidates.length; index += 1){
    const row = candidates[index];
    for(let repetition = 1; repetition <= repeats; repetition += 1){
      const result = await captureCandidate(config, row, opts, (index * repeats) + repetition);
      if(!result?.ok) fail(`${config.title} candidate capture failed`, { id: row.id, repetition, result });
      const suffix = repeats > 1 ? `-r${String(repetition).padStart(2, '0')}` : '';
      captures.push({ row, result, repetition, sampleId: `${slug(row.id)}${suffix}` });
    }
  }

  const baselineCapture = captures.find(item => item.row.baseline);
  if(!baselineCapture) fail(`${config.title} baseline capture missing`);
  const sampleFiles = new Map();
  for(const capture of captures){
    const webm = path.join(samplesDir, `${capture.sampleId}.webm`);
    const wav = path.join(samplesDir, `${capture.sampleId}.wav`);
    if(capture.result.offlineRender){
      renderSpecToWav(capture.result.audioSpec || capture.row.spec || {}, wav, capture.result.capturePrerollMs || 80);
      sampleFiles.set(capture.sampleId, { webm: null, wav, offlineRender: true });
    }else{
      decodeToFile(capture.result.base64, webm);
      toWav(webm, wav);
      sampleFiles.set(capture.sampleId, { webm, wav, offlineRender: false });
    }
  }
  const baselineFiles = sampleFiles.get(baselineCapture.sampleId);

  const manifestItems = captures.map(capture => {
    const files = sampleFiles.get(capture.sampleId);
    const baselineAnalysisWindow = analysisWindowForCapture(baselineCapture.result, baselineCapture.row.spec || {});
    return {
      id: capture.sampleId,
      label: capture.row.label,
      focus: `Candidate comparison for ${config.title}.`,
      cue: config.cue,
      analysisPolicy: config.lossComposite ? {
        activeMetricsSource: 'analysisWindow',
        eventSegmentationSource: 'analysisWindow',
        reason: 'Composite loss cues need onset/body/tail scoring over the scheduled cue window, not only the single loudest active island.'
      } : null,
      aurora: {
        label: capture.row.label,
        wav: rel(files.wav, cueDir),
        webm: files.webm ? rel(files.webm, cueDir) : null,
        renderMode: files.offlineRender ? 'offline-spec-render' : 'browser-media-recorder',
        offlineReason: capture.result.offlineReason || '',
        audioCue: capture.result.audioCue || null,
        capture: {
          attempt: capture.result.attempt || null,
          byteLength: capture.result.byteLength || null,
          captureMs: capture.result.captureMs || null,
          capturePrerollMs: capture.result.capturePrerollMs || null
        },
        analysisWindow: analysisWindowForCapture(capture.result, capture.row.spec || {})
      },
      galaga: {
        label: 'Current Aurora baseline',
        wav: rel(baselineFiles.wav, cueDir),
        webm: baselineFiles.webm ? rel(baselineFiles.webm, cueDir) : null,
        renderMode: baselineFiles.offlineRender ? 'offline-spec-render' : 'browser-media-recorder',
        offlineReason: baselineCapture.result.offlineReason || '',
        audioCue: baselineCapture.result.audioCue || null,
        capture: {
          attempt: baselineCapture.result.attempt || null,
          byteLength: baselineCapture.result.byteLength || null,
          captureMs: baselineCapture.result.captureMs || null,
          capturePrerollMs: baselineCapture.result.capturePrerollMs || null
        },
        analysisWindow: baselineAnalysisWindow
      },
      reference: {
        label: set.referenceLabel || `${config.title} Reference`,
        source: rel(referenceSource),
        wav: rel(referenceWav, cueDir),
        window: set.referenceWindow || null,
        analysisWindow: referenceAnalysisWindow(set),
        segmentation: set.referenceSegmentation || null
      }
    };
  });

  const manifestPath = path.join(cueDir, 'manifest.json');
  fs.writeFileSync(manifestPath, `${JSON.stringify({
    generatedAt,
    commit,
    version: require(path.join(ROOT, 'package.json')).version,
    cue: config.cue,
    analysisPolicy: config.lossComposite ? {
      activeMetricsSource: 'analysisWindow',
      eventSegmentationSource: 'analysisWindow',
      reason: 'Composite loss cues need onset/body/tail scoring over the scheduled cue window, not only the single loudest active island.'
    } : null,
    items: manifestItems
  }, null, 2)}\n`);

  run(pythonForAudioReport(), [path.join(ROOT, 'tools', 'harness', 'render-audio-comparison-report.py'), manifestPath], { cwd: ROOT, stdio: 'inherit' });

  const metricsPath = path.join(cueDir, 'metrics.json');
  const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
  const sampleRows = metrics.items.map(item => {
    const capture = captures.find(entry => entry.sampleId === item.id);
    const spec = capture?.row || candidates.find(candidate => slug(candidate.id) === item.id);
    const comparison = item.comparisons.auroraVsReferenceActive;
    const breakdown = riskBreakdown(comparison);
    const segments = segmentSummary(item.segmentRoleComparisons);
    const segmentRoles = segmentRoleMap(item.segmentRoleComparisons);
    return {
      id: spec?.id || item.id,
      candidateId: capture?.row?.id || spec?.id || item.id,
      configCue: config.cue,
      repetition: capture?.repetition || 1,
      label: spec?.label || item.label,
      generated: !!spec?.generated,
      generator: spec?.generator || null,
      spec: spec?.spec || null,
      risk10: breakdown.risk10,
      riskBreakdown: breakdown.components,
      dominantPenalty: breakdown.dominant,
      durationGapSeconds: round(comparison.duration_s, 3),
      centroidGapHz: round(comparison.spectral_centroid_hz, 1),
      zeroCrossingGapPerSecond: round(comparison.zero_crossings_per_s, 1),
      rmsGap: round(comparison.rms, 4),
      bandShapeGap: round(comparison.band_shape_distance, 4),
      rolloffGapHz: round(comparison.spectral_rolloff_85_hz, 1),
      envelopeShapeGap: round(mean([
        clamp((+comparison.attack_peak_position || 0) / .9, 0, 1),
        clamp((+comparison.decay_ratio || 0) / 3.2, 0, 1),
        clamp((+comparison.burst_share || 0) / .35, 0, 1)
      ]), 3),
      ...segments,
      segmentRoles,
      activeMetrics: item.variants.aurora.activeMetrics,
      referenceMetrics: item.variants.reference.activeMetrics,
      activityProfile: item.variants.aurora.activityProfile || null,
      referenceActivityProfile: item.variants.reference.activityProfile || null,
      bandEnergyDelta: bandEnergyDelta(item.variants.aurora.activeMetrics?.band_energy, item.variants.reference.activeMetrics?.band_energy),
      comparison
    };
  });
  const rows = aggregateRows(sampleRows, config);
  const baseline = rows.find(row => row.id === 'baseline-current');
  rows.forEach(row => { row.keeperRead = row.id === 'baseline-current' ? 'baseline' : rejectionFor(row, baseline, config); });
  rows.sort((a, b) => a.risk10 - b.risk10 || (a.worstSegmentRisk10 || 99) - (b.worstSegmentRisk10 || 99));
  const decision = decisionFor(rows, config);
  decision.runtimeTrial = runtimeTrialForDecision(config, decision);

  const report = {
    schemaVersion: 1,
    artifactType: 'aurora-audio-focus-candidate-loop',
    generatedAt,
    branch: git(['branch', '--show-current'], ''),
    commit,
    dirty,
    key,
    title: config.title,
    cue: config.cue,
    repetitions: repeats,
    problem: config.problem,
    strategy: 'Capture baseline, hand-designed candidates, and reference subclip windows through the live browser audio engine when available; if headless MediaRecorder returns no bytes, render the resolved cue spec offline so the CPU candidate loop can still compare against the canonical application-guide reference window. Promote only candidates that clear explicit keeper gates.',
    capturePlan: {
      repetitions: repeats,
      attemptsPerSample: Math.max(1, Number(process.env.AURORA_AUDIO_CAPTURE_RETRIES || 3)),
      defaultPrerollMs: 80,
      fallback: 'offline-spec-render',
      rationale: 'Short cue captures include a small recorder preroll so onset analysis reflects the cue rather than MediaRecorder startup timing. Offline spec rendering keeps candidate loops useful on machines where headless browser audio taps expose live tracks but return zero MediaRecorder bytes.'
    },
    successMeasure: successMeasureFor(config),
    source: {
      comparisonSet: set.id,
      referenceClip: set.referenceClip,
      referenceWindow: set.referenceWindow || null,
      manifest: rel(manifestPath),
      metrics: rel(metricsPath),
      referenceSegmentation: metrics.items[0]?.referenceSegmentation || null,
      runtimeTrialDecision: decision.runtimeTrial?.artifact || null
    },
    candidates: rows,
    decision,
    runtimeTrial: decision.runtimeTrial || null,
    nextStep: nextStepForDecision(config, decision, rows)
  };
  fs.writeFileSync(path.join(cueDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(path.join(cueDir, 'README.md'), markdown(report));
  fs.writeFileSync(path.join(OUT_ROOT, config.latest), `${JSON.stringify(report, null, 2)}\n`);

  return {
    key,
    report: rel(path.join(cueDir, 'report.json')),
    decision,
    runtimeTrialStatus: decision.runtimeTrial?.status || null,
    runtimeTrialAppliesToBest: decision.runtimeTrial?.appliesToBest ?? null,
    runtimeTrialAppliesToMeasuredBest: decision.runtimeTrial?.appliesToMeasuredBest ?? null,
    topCandidates: rows.filter(row => row.id !== 'baseline-current').slice(0, 5).map(row => ({
      id: row.id,
      risk10: row.risk10,
      worstSegmentRisk10: row.worstSegmentRisk10,
      worstSegmentRole: row.worstSegmentRole,
      durationGapSeconds: row.durationGapSeconds,
      centroidGapHz: row.centroidGapHz,
      bandShapeGap: row.bandShapeGap,
      lossCompositeScore10: row.lossComposite?.score10 ?? null,
      lossCompositeDurationGapSeconds: row.lossComposite?.durationGapSeconds ?? null,
      lossCompositeClears: row.lossComposite?.clears ?? null,
      ceremonyTailActiveCoverage: row.ceremonyTail?.activeCoverageOfScheduled ?? null,
      ceremonyTailClears: row.ceremonyTail?.clearsActiveCoverage ?? null,
      cadencePressureScore10: row.cadencePressure?.score10 ?? null,
      cadenceWeakestAxis: row.cadencePressure?.weakestAxis || '',
      maskingSeparationScore10: row.maskingSeparation?.score10 ?? null,
      maskingWeakestAxis: row.maskingSeparation?.weakestAxis || '',
      keeperRead: row.keeperRead
    }))
  };
}

async function main(){
  const generatedAt = new Date().toISOString();
  const stamp = generatedAt.slice(0, 10);
  const commit = git(['rev-parse', '--short', 'HEAD'], 'unknown');
  const dirty = git(['status', '--short'], '').trim().length > 0;
  const runTag = `${stamp}-${commit}${dirty ? '-dirty' : ''}-audio-focus-${generatedAt.slice(11, 19).replace(/:/g, '')}`;
  const rootDir = path.join(OUT_ROOT, runTag);
  ensureDir(rootDir);
  const results = [];
  for(const key of requestedKeys()){
    results.push(await analyzeCue(key, generatedAt, rootDir));
  }
  const summary = {
    schemaVersion: 1,
    artifactType: 'aurora-audio-focus-candidate-loop-summary',
    generatedAt,
    branch: git(['branch', '--show-current'], ''),
    commit,
    dirty,
    gridLimit: gridLimit(),
    repetitions: repeatCount(),
    results
  };
  fs.writeFileSync(path.join(rootDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  fs.writeFileSync(path.join(OUT_ROOT, 'latest-focus.json'), `${JSON.stringify(summary, null, 2)}\n`);
  console.log(JSON.stringify({ ok: true, summary: rel(path.join(rootDir, 'summary.json')), results }, null, 2));
}

main().catch(err => {
  console.error(err && err.stack || err);
  process.exit(1);
});
