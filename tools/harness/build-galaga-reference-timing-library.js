#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const OUT_DIR = path.join(ANALYSES, 'galaga-reference-timing-library');

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, data){
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function latestSubdir(dir){
  if(!fs.existsSync(dir)) return null;
  const entries = fs.readdirSync(dir)
    .map(name => path.join(dir, name))
    .filter(full => fs.statSync(full).isDirectory())
    .sort((a, b) => path.basename(a).localeCompare(path.basename(b)));
  return entries.length ? entries[entries.length - 1] : null;
}

function rel(p){
  return p ? path.relative(ROOT, p) : '';
}

function maybeJson(file){
  return file && fs.existsSync(file) ? readJson(file) : null;
}

const latestTimingDir = latestSubdir(path.join(ANALYSES, 'galaga-timing-alignment'));
const latestOverlapDir = latestSubdir(path.join(ANALYSES, 'galaga-audio-overlap'));
const latestOpeningDir = latestSubdir(path.join(ANALYSES, 'galaga-stage-opening-timing'));
const latestBossDir = latestSubdir(path.join(ANALYSES, 'galaga-boss-timing'));

const timingMetrics = maybeJson(latestTimingDir ? path.join(latestTimingDir, 'metrics.json') : '');
const overlapMetrics = maybeJson(latestOverlapDir ? path.join(latestOverlapDir, 'metrics.json') : '');
const bossMetrics = maybeJson(latestBossDir ? path.join(latestBossDir, 'metrics.json') : '');

const library = {
  generatedAt: new Date().toISOString(),
  purpose: 'Durable reference timing and audio-fidelity library for Galaga-aligned polish work in Aurora and future fixed-screen arcade packs.',
  rule: 'Use measured reference artifacts first for timing, motion, audio, pacing, and transition decisions. Manual listening/viewing is secondary validation.',
  sourcePacks: [
    rel(path.join(ANALYSES, 'galaga-stage-reference-video', 'README.md')),
    rel(path.join(ANALYSES, 'galaga-audio-reference-video', 'README.md')),
    rel(path.join(ANALYSES, 'galaga-audio-reference-video-2', 'README.md')),
    rel(path.join(ANALYSES, 'galaga-audio-reference-video-3', 'README.md')),
    rel(path.join(ANALYSES, 'galaga-audio-cue-matrix', 'README.md')),
    latestTimingDir ? rel(path.join(latestTimingDir, 'README.md')) : '',
    latestOverlapDir ? rel(path.join(latestOverlapDir, 'README.md')) : '',
    latestOpeningDir ? rel(path.join(latestOpeningDir, 'README.md')) : '',
    latestBossDir ? rel(path.join(latestBossDir, 'README.md')) : ''
  ].filter(Boolean),
  latestArtifacts: {
    timingAlignment: latestTimingDir ? rel(latestTimingDir) : null,
    audioOverlap: latestOverlapDir ? rel(latestOverlapDir) : null,
    stageOpening: latestOpeningDir ? rel(latestOpeningDir) : null,
    bossTiming: latestBossDir ? rel(latestBossDir) : null
  },
  eventFamilies: [
    {
      id: 'opening-sequence',
      label: 'Opening Sequence',
      auroraCueSlots: ['gameStart', 'formationArrival', 'stagePulse'],
      focus: 'Full start phrase, arrival signal, first visible alien arrivals, first convoy pulse.',
      referenceAssets: [
        'src/assets/reference-audio/galaga2-game-start.m4a',
        'src/assets/reference-audio/galaga3-level-underscore.m4a',
        latestOpeningDir ? rel(path.join(latestOpeningDir, 'opening-contact-tight.png')) : null,
        latestOpeningDir ? rel(path.join(latestOpeningDir, 'game-start-waveform.png')) : null
      ].filter(Boolean),
      measuredTargets: {
        startPhraseDuration: 4.0,
        formationArrivalAfterStart: 4.18,
        firstVisibleAlienArrivalsAfterStart: 5.35,
        firstConvoyPulseAfterStart: 6.15
      },
      auroraCurrent: overlapMetrics ? {
        firstPulseAfterSpawn: overlapMetrics.stage1?.firstPulseAfterSpawn ?? null,
        firstDiveAfterSpawn: overlapMetrics.stage1?.firstDiveAfterSpawn ?? null,
        gameStartTailPastFirstPulse: overlapMetrics.stage1?.gameStartTailPastFirstPulse ?? null
      } : {},
      notes: [
        'Preserve the full canonical game-start phrase where feasible.',
        'Widen the game window before shortening the phrase.',
        'This family should be the default reference for shell-to-play handoff decisions.'
      ]
    },
    {
      id: 'formation-arrival-and-convoy',
      label: 'Formation Arrival And Convoy Cadence',
      auroraCueSlots: ['formationArrival', 'stagePulse', 'attackCharge'],
      focus: 'Arrival pacing, convoy cadence, first dive timing, and the relationship between movement and recurring board audio.',
      referenceAssets: [
        'src/assets/reference-audio/galaga3-level-underscore.m4a',
        'src/assets/reference-audio/galaga3-ambience-convoy.m4a',
        latestTimingDir ? rel(path.join(latestTimingDir, 'stage1-first-16s-contact.png')) : null
      ].filter(Boolean),
      auroraCurrent: timingMetrics ? {
        firstStagePulseAfterSpawn: timingMetrics.aurora?.stage1?.firstStagePulseAfterSpawn ?? null,
        firstAttackAfterSpawn: timingMetrics.aurora?.stage1?.firstAttackAfterSpawn ?? null,
        firstLowerFieldAfterSpawn: timingMetrics.aurora?.stage1?.firstLowerFieldAfterSpawn ?? null
      } : {},
      notes: [
        'This is one of the main timing-sensitive areas for subjective “feel”.',
        'Use measured board motion from the archived gameplay video before nudging cadence by ear.'
      ]
    },
    {
      id: 'enemy-dive-and-charge',
      label: 'Enemy Dive And Charge',
      auroraCueSlots: ['attackCharge'],
      focus: 'Dive-start timing versus visible enemy commitment and fall path.',
      referenceAssets: [
        'src/assets/reference-audio/galaga3-attack-charger.m4a',
        latestOverlapDir ? rel(path.join(latestOverlapDir, 'README.md')) : null
      ].filter(Boolean),
      auroraCurrent: overlapMetrics ? {
        firstChargeAfterDive: overlapMetrics.stage1?.firstChargeAfterDive ?? null
      } : {},
      notes: [
        'The charge cue should line up with the moment an alien visibly commits to the dive, not with bullets or later descent frames.'
      ]
    },
    {
      id: 'capture-beam-and-capture-flow',
      label: 'Capture Beam And Capture Flow',
      auroraCueSlots: ['captureBeam', 'captureSuccess', 'captureRetreat', 'capturedFighterDestroyed', 'rescueJoin'],
      focus: 'Beam deploy, successful capture, retreat with carried ship, destruction of captured ship, and rescue/join.',
      referenceAssets: [
        'src/assets/reference-audio/galaga3-tractor-beam.m4a',
        'src/assets/reference-audio/galaga3-fighter-captured.m4a',
        'src/assets/reference-audio/galaga3-capturing.m4a',
        'src/assets/reference-audio/galaga3-captured-fighter-destroyed.m4a',
        'src/assets/reference-audio/galaga2-fighter-rescued-double-ship.m4a'
      ],
      notes: [
        'This family is already structurally split in Aurora and is a strong candidate for deeper timing probes later.',
        'The same comparison pattern will transfer well to Galaxian-style special-state flows in future games.'
      ]
    },
    {
      id: 'ship-loss-and-respawn',
      label: 'Ship Loss And Respawn',
      auroraCueSlots: ['playerHit', 'gameOver'],
      focus: 'Immediate death cue, visual loss sync, last-ship tension, and return-to-control pacing.',
      referenceAssets: [
        'src/assets/reference-audio/galaga3-death.m4a',
        'src/assets/reference-audio/galaga-last-ship-destroyed-ambience.m4a'
      ],
      auroraCurrent: timingMetrics ? {
        playerHitCueRelativeToLoss: timingMetrics.aurora?.shipLoss?.playerHitCueRelativeToLoss ?? null
      } : {},
      notes: [
        'Ordinary ship loss and terminal game-over ambience should remain separate concepts.',
        'Future work should add more visual-timing measurements here, not just cue timestamps.'
      ]
    },
    {
      id: 'stage-clear-and-next-stage',
      label: 'Stage Clear And Next Stage',
      auroraCueSlots: ['stageTransition', 'stagePulse'],
      focus: 'Stage clear spacing, next-stage announcement, spawn handoff, and transition quiet windows.',
      referenceAssets: [
        'src/assets/reference-audio/galaga-level-flag-v1.m4a',
        'src/assets/reference-audio/galaga-level-flag-v2.m4a',
        latestOverlapDir ? rel(path.join(latestOverlapDir, 'README.md')) : null
      ].filter(Boolean),
      auroraCurrent: overlapMetrics ? {
        transitionWindow: overlapMetrics.stage12?.transitionWindow ?? null,
        transitionCueAfterProbe: overlapMetrics.stage12?.transitionCueAfterProbe ?? null,
        spawnAfterTransitionCue: overlapMetrics.stage12?.spawnAfterTransitionCue ?? null
      } : {},
      notes: [
        'This family should capture how much quiet space the player gets between stage completion and the next arrival.'
      ]
    },
    {
      id: 'challenge-entry-results-perfect',
      label: 'Challenge Entry, Results, And Perfect',
      auroraCueSlots: ['challengeTransition', 'challengeResults', 'challengePerfect', 'stageTransition'],
      focus: 'Challenge announcement timing, setup handoff, results timing, perfect timing, and next-stage recovery.',
      referenceAssets: [
        'src/assets/reference-audio/galaga2-challenging-stage.m4a',
        'src/assets/reference-audio/galaga2-challenging-stage-results.m4a',
        'src/assets/reference-audio/galaga2-challenging-stage-perfect.m4a',
        'src/assets/reference-audio/galaga3-challenging-stage.m4a'
      ],
      auroraCurrent: {
        challengeEntry: timingMetrics ? {
          cueAfterProbe: timingMetrics.aurora?.challengeEntry?.challengeCueAfterProbe ?? null,
          spawnAfterCue: timingMetrics.aurora?.challengeEntry?.challengeSpawnAfterCue ?? null
        } : {},
        challengePerfect: overlapMetrics ? {
          resultCueAfterClear: overlapMetrics.challengePerfect?.resultCueAfterClear ?? null,
          nextCueAfterClear: overlapMetrics.challengePerfect?.nextCueAfterClear ?? null,
          spawnAfterClear: overlapMetrics.challengePerfect?.spawnAfterClear ?? null
        } : {}
      },
      notes: [
        'This is still one of the messiest live-feel families and should remain a primary tuning target.',
        'Use the overlap budgets here before manual trimming or cue shortening.'
      ]
    },
    {
      id: 'boss-hit-and-boss-death',
      label: 'Boss Hit And Boss Death',
      auroraCueSlots: ['bossHit', 'bossBoom'],
      focus: 'Boss damage identity, boss death audibility, and visual emphasis at destruction.',
      referenceAssets: [
        'src/assets/reference-audio/galaga3-boss-damage-flagship-fighter-shot.m4a',
        'src/assets/reference-audio/galaga3-boss-death-sasori.m4a',
        latestBossDir ? rel(path.join(latestBossDir, 'README.md')) : null
      ].filter(Boolean),
      auroraCurrent: bossMetrics ? {
        firstHit: {
          damageToCue: bossMetrics.firstHit?.damageToCue ?? null,
          triggerToCue: bossMetrics.firstHit?.triggerToCue ?? null
        },
        death: {
          killToCue: bossMetrics.death?.killToCue ?? null,
          pulseBeforeBossBoom: bossMetrics.death?.pulseBeforeBossBoom ?? null
        }
      } : {},
      notes: [
        'Boss destruction should read as a meaningful event both visually and audibly, not just a slightly larger ordinary kill.',
        'The boss timing probe should remain part of the standard library refresh as we tune audibility and pause/overlap policy.'
      ]
    },
    {
      id: 'high-score-and-results-flow',
      label: 'High Score And Results Flow',
      auroraCueSlots: ['highScoreFirst', 'highScoreOther'],
      focus: 'Results-to-name-entry handoff and first-place versus non-first placement distinction.',
      referenceAssets: [
        'src/assets/reference-audio/galaga3-name-entry-1st.m4a',
        'src/assets/reference-audio/galaga3-name-entry-2nd-5th.m4a',
        'src/assets/reference-audio/galaga-high-score-1st-place.m4a',
        'src/assets/reference-audio/galaga-high-score-2nd-5th-place.m4a'
      ],
      notes: [
        'This family is already structurally represented in Aurora and should be easy to extend with richer timing checks later.'
      ]
    }
  ],
  futureReuse: {
    forAurora: [
      'Use the library before changing cue timing, clip length, movement pacing, or transition windows.',
      'When a new polish issue appears, map it into one event family and add measured evidence there first.',
      'Prefer updating timing windows and arrival delays before cutting canonical phrases.',
      'Keep logs, event traces, and timing artifacts structured enough that they could later support a reinforcement-learned player model using the same human controls.'
    ],
    forFutureGames: [
      'Copy the same structure for Galaxian or later games: canonical event families, measured reference artifacts, current runtime metrics, and comparison deltas.',
      'Keep game-specific timing truth inside the game pack and use Platinum only for generic hooks and harness support.'
    ]
  }
};

function familyTableRow(family){
  const cueSlots = family.auroraCueSlots.map(slot => `\`${slot}\``).join(', ');
  const metricSource = Object.assign({}, family.measuredTargets || {}, family.auroraCurrent || {});
  const metrics = Object.entries(metricSource)
    .flatMap(([key, value]) => {
      if(value && typeof value === 'object' && !Array.isArray(value)){
        return Object.entries(value).map(([subKey, subValue]) => `${key}.${subKey}: ${String(subValue)}`);
      }
      return `${key}: ${String(value)}`;
    })
    .slice(0, 4)
    .join('; ');
  return `| ${family.label} | ${cueSlots} | ${metrics || 'Reference assets and notes only'} |`;
}

function buildReadme(data){
  const lines = [
    '# Galaga Reference Timing Library',
    '',
    'This library is the durable reference spine for Galaga-aligned timing, audio, pacing, and transition work in Aurora.',
    '',
    'It is meant to shorten iteration cycles by giving us one place to look for:',
    '',
    '- canonical event families',
    '- strongest current reference assets',
    '- measured timing targets',
    '- current Aurora comparison numbers',
    '- reusable rules for future fixed-screen arcade packs',
    '',
    '## Default rule',
    '',
    '- use measured reference artifacts first for timing, motion, audio, pacing, and transition decisions',
    '- use manual listening/viewing as validation after the measured baseline is in place',
    '- preserve full canonical phrases when feasible and widen the game window before shortening them',
    '',
    '## Current source spine',
    ''
  ];
  for(const source of data.sourcePacks){
    lines.push(`- \`${source}\``);
  }
  lines.push(
    '',
    '## Current latest measured artifacts',
    '',
    `- Timing alignment: \`${data.latestArtifacts.timingAlignment || 'missing'}\``,
    `- Audio overlap: \`${data.latestArtifacts.audioOverlap || 'missing'}\``,
    `- Stage opening timing: \`${data.latestArtifacts.stageOpening || 'missing'}\``,
    `- Boss timing: \`${data.latestArtifacts.bossTiming || 'missing'}\``,
    '',
    '## Canonical event families',
    '',
    '| Event family | Aurora cue slots | Key measured targets / current comparison |',
    '| --- | --- | --- |'
  );
  for(const family of data.eventFamilies){
    lines.push(familyTableRow(family));
  }
  lines.push(
    '',
    '## How to use this library',
    '',
    '1. Put the polish issue into one event family first.',
    '2. Start from the linked reference assets and measured timing values.',
    '3. Compare Aurora runtime behavior against those values before changing clips or delays.',
    '4. If a full canonical phrase exists, try to widen the gameplay window before creating a shortened runtime-safe excerpt.',
    '5. Add new measured evidence back into this library so the next pass starts faster.',
    '',
    '## Recommended next extensions',
    '',
    '- add visual sync measurements for ship loss and respawn',
    '- add capture-flow timing probes for beam deploy, successful capture, retreat, and rescue join',
    '- add a parallel `galaxian-reference-timing-library` when second-game work begins',
    '',
    '## Generated outputs',
    '',
    `- Library JSON: \`${rel(path.join(OUT_DIR, 'event-families.json'))}\``,
    `- This README: \`${rel(path.join(OUT_DIR, 'README.md'))}\``
  );
  return `${lines.join('\n')}\n`;
}

function main(){
  ensureDir(OUT_DIR);
  const jsonFile = path.join(OUT_DIR, 'event-families.json');
  const readmeFile = path.join(OUT_DIR, 'README.md');
  writeJson(jsonFile, library);
  fs.writeFileSync(readmeFile, buildReadme(library));
  process.stdout.write(JSON.stringify({
    ok: true,
    outDir: OUT_DIR,
    json: jsonFile,
    readme: readmeFile
  }, null, 2));
  process.stdout.write('\n');
}

main();
