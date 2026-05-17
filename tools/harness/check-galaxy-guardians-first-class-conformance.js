#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const PACKAGE_JSON = path.join(ROOT, 'package.json');
const REFERENCE = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'reference-conformance-0.1.json');
const PLAYTEST = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'playtest-conformance-review-0.1.json');
const CANDIDATE = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'candidate-0.1.json');
const SCORE = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'score-progression-0.1.json');

const REQUIRED_DOC_CHECKS = [
  {
    path: 'GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md',
    required: [
      'first-class conformance',
      '7.7/10',
      '6.9/10',
      'harness:check:galaxy-guardians-first-class-conformance',
      'GALAXY_GUARDIANS_LONG_SURFACE_AND_PERSONA_PLAN.md'
    ]
  },
  {
    path: 'APPLICATIONS_ON_PLATINUM.md',
    required: [
      'GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md',
      'first-class conformance target'
    ]
  },
  {
    path: 'TESTING_AND_RELEASE_GATES.md',
    required: [
      'Galaxy first-class parity',
      'harness:check:galaxy-guardians-first-class-conformance'
    ]
  },
  {
    path: 'CLASSIC_ARCADE_INGESTION_FRAMEWORK.md',
    required: [
      'first-class application review',
      'playtest-weighted review'
    ]
  },
  {
    path: 'GAME_CONFORMANCE_CATALOG.md',
    required: [
      'Galaxy Guardians First-Class Promotion Targets',
      'GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md'
    ]
  },
  {
    path: 'PLAN.md',
    required: ['GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md']
  },
  {
    path: 'PRODUCT_ROADMAP.md',
    required: ['GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md']
  },
  {
    path: 'PROJECT_STATE_AND_CONFORMANCE_PROGRAM.md',
    required: ['GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md']
  },
  {
    path: 'ARCHITECTURE.md',
    required: ['check-galaxy-guardians-first-class-conformance.js']
  },
  {
    path: 'reference-artifacts/analyses/galaxy-guardians-identity/README.md',
    required: [
      'first-class-conformance',
      'check-galaxy-guardians-first-class-conformance.js',
      'long-surface-conformance-0.1.json'
    ]
  },
  {
    path: 'GALAXY_GUARDIANS_LONG_SURFACE_AND_PERSONA_PLAN.md',
    required: [
      'long-surface',
      'persona',
      'harness:check:galaxy-guardians-long-surface-conformance'
    ]
  }
];

const REQUIRED_SCRIPT_GROUPS = {
  ingestion: [
    'harness:check:galaxian-reference-profile'
  ],
  aggregate: [
    'harness:check:galaxy-guardians-first-class-conformance',
    'harness:check:galaxy-guardians-reference-conformance',
    'harness:check:galaxy-guardians-playtest-conformance-review'
  ],
  runtime: [
    'harness:check:galaxy-guardians-runtime-slice',
    'harness:check:galaxy-guardians-playable-preview',
    'harness:check:galaxy-guardians-game-owned-identity',
    'harness:check:galaxy-guardians-one-level-completion',
    'harness:check:galaxy-guardians-score-progression',
    'harness:check:galaxy-guardians-threat-scoring'
  ],
  openingSlice: [
    'harness:check:galaxy-guardians-opening-slice-baseline',
    'harness:check:galaxy-guardians-opening-slice-source-baseline',
    'harness:check:galaxy-guardians-opening-slice-render-surface',
    'harness:check:galaxy-guardians-opening-rack-motion',
    'harness:check:galaxy-guardians-attract-score-surface'
  ],
  visual: [
    'harness:check:galaxy-guardians-visual-readability',
    'harness:check:galaxy-guardians-sprite-grid-targets',
    'harness:check:galaxy-guardians-sprite-component-targets'
  ],
  audio: [
    'harness:check:galaxy-guardians-audio-cue-targets',
    'harness:check:galaxy-guardians-audio-character',
    'harness:check:galaxy-guardians-audio-conformance-lab'
  ],
  motion: [
    'harness:check:galaxy-guardians-formation-entry',
    'harness:check:galaxy-guardians-movement-pacing',
    'harness:check:galaxy-guardians-stage-rank-pressure',
    'harness:check:galaxy-guardians-runtime-reference-movement'
  ],
  longSurface: [
    'harness:analyze:galaxy-guardians-long-surface-conformance',
    'harness:check:galaxy-guardians-long-surface-conformance'
  ],
  boundary: [
    'harness:check:gameplay-adapter-boundaries',
    'harness:check:platinum-pack-boot',
    'harness:check:compact-cabinet-rails'
  ]
};

const REQUIRED_PROMOTIONS = [
  'Opening-slice baseline artifact package and scored gate for WAIT, score table, rack march cadence, explosions, palettes, starfield, reserve ships, missile-ready state, flags, and top re-entry.',
  'Measured opening-slice motion pass for rack march cadence, starfield motion, and bottom-pass-through top re-entry against Matt Hawkins and Nenriki sources.',
  'Platform-frame parity pass for sign-in, high scores, pilot card, replay/video capture, bug reports, and music/sound controls.',
  'Measured later-band fairness pass for stage-five-and-beyond collision stability and clear consistency.',
  'Selective audio cue cleanup only after the opening-slice and motion passes expose the next highest-value audible miss.'
];

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function read(file){
  return fs.readFileSync(file, 'utf8');
}

function readJson(file){
  return JSON.parse(read(file));
}

function exists(relPath){
  return fs.existsSync(path.join(ROOT, relPath));
}

function rounded(value, places = 1){
  const scale = 10 ** places;
  return Math.round((+value || 0) * scale) / scale;
}

function categoryById(artifact, id){
  return (artifact.categories || []).find(category => category.id === id) || null;
}

function main(){
  const packageJson = readJson(PACKAGE_JSON);
  const scripts = packageJson.scripts || {};
  const reference = readJson(REFERENCE);
  const playtest = readJson(PLAYTEST);
  const candidate = readJson(CANDIDATE);
  const score = readJson(SCORE);

  const missingScripts = [];
  for(const [group, scriptNames] of Object.entries(REQUIRED_SCRIPT_GROUPS)){
    for(const scriptName of scriptNames){
      if(!scripts[scriptName]){
        missingScripts.push({ group, scriptName });
      }
    }
  }
  if(missingScripts.length){
    fail('Galaxy first-class conformance is missing required harness scripts.', { missingScripts });
  }

  const docIssues = [];
  for(const check of REQUIRED_DOC_CHECKS){
    const full = path.join(ROOT, check.path);
    if(!fs.existsSync(full)){
      docIssues.push({ path: check.path, missing: 'file' });
      continue;
    }
    const source = read(full);
    const missingText = check.required.filter(snippet => !source.includes(snippet));
    if(missingText.length){
      docIssues.push({ path: check.path, missingText });
    }
  }
  if(docIssues.length){
    fail('Galaxy first-class conformance docs are missing required parity references.', { docIssues });
  }

  const referenceScore = reference.summary?.referenceConformanceScore10 ?? 0;
  const playtestScore = playtest.summary?.playtestWeightedConformanceScore10 ?? 0;
  const publicReadiness = reference.summary?.publicReleaseReadinessScore10 ?? 0;
  const gateCoverage = reference.summary?.implementationGateCoverageScore10 ?? 0;
  const maturity = reference.summary?.referenceMaturityScore10 ?? 0;
  const compellingPreview = playtest.summary?.compellingPreviewTargetScore10 ?? 0;

  if(reference.gameKey !== 'galaxy-guardians-preview' || playtest.gameKey !== reference.gameKey || candidate.gameKey !== reference.gameKey || score.gameKey !== reference.gameKey){
    fail('Galaxy first-class conformance artifacts are not linked to the same game key.', {
      reference: reference.gameKey,
      playtest: playtest.gameKey,
      candidate: candidate.gameKey,
      score: score.gameKey
    });
  }
  if(referenceScore < 7.5){
    fail('Galaxy reference conformance regressed below the maintained floor.', { referenceScore });
  }
  if(playtestScore < 6.8){
    fail('Galaxy playtest-weighted conformance regressed below the maintained floor.', { playtestScore });
  }
  if(referenceScore <= playtestScore){
    fail('Galaxy reference score should remain above the stricter playtest score until the preview feels convincing.', {
      referenceScore,
      playtestScore
    });
  }
  if(playtestScore >= compellingPreview){
    fail('Galaxy playtest score should stay below the compelling-preview target until the next evidence promotions land.', {
      playtestScore,
      compellingPreview
    });
  }
  if(publicReadiness >= 5){
    fail('Galaxy public-readiness score should still be explicitly below public-release confidence at this stage.', {
      publicReadiness
    });
  }
  if(gateCoverage < 9){
    fail('Galaxy first-class work requires high harness coverage before larger public claims.', { gateCoverage });
  }
  if(maturity >= gateCoverage){
    fail('Galaxy evidence maturity should remain lower than gate coverage until stronger human-approved/frame-level extraction lands.', {
      maturity,
      gateCoverage
    });
  }

  const requiredCategories = [
    ['reference-source-coverage', 9.0],
    ['promoted-semantic-event-coverage', 7.5],
    ['formation-rack-timing', 6.0],
    ['movement-pressure', 6.0],
    ['single-shot-threat-scoring', 7.0],
    ['visual-alien-identity', 6.5],
    ['audio-reference-character', 6.0],
    ['long-surface-stage-arc-and-persona-review', 6.8],
    ['platform-and-game-boundaries', 10.0],
    ['evidence-durability', 9.5]
  ];
  for(const [categoryId, floor] of requiredCategories){
    const category = categoryById(reference, categoryId);
    if(!category) fail(`Galaxy reference conformance is missing category ${categoryId}.`);
    if((category.score10 || 0) < floor){
      fail(`Galaxy category ${categoryId} regressed below its maintained floor.`, { categoryId, current: category.score10, floor });
    }
  }

  const requiredPlaytestCategories = [
    ['audio-character', 6.0],
    ['motion-pressure', 6.0],
    ['visual-identity', 6.5],
    ['long-surface-readiness', 6.4],
    ['platform-boundary-readiness', 10.0]
  ];
  for(const [categoryId, floor] of requiredPlaytestCategories){
    const category = categoryById(playtest, categoryId);
    if(!category) fail(`Galaxy playtest review is missing category ${categoryId}.`);
    if((category.playtestWeightedScore10 || 0) < floor){
      fail(`Galaxy playtest category ${categoryId} regressed below its maintained floor.`, {
        categoryId,
        current: category.playtestWeightedScore10,
        floor
      });
    }
  }

  const missingPromotions = REQUIRED_PROMOTIONS.filter(item => !(reference.nextMetricPromotions || []).includes(item));
  if(missingPromotions.length){
    fail('Galaxy first-class conformance artifact lost expected next-promotion guidance.', { missingPromotions });
  }

  for(const relPath of [
    'reference-artifacts/analyses/galaxy-guardians-identity/attract-score-surface-0.1.json',
    'reference-artifacts/analyses/galaxy-guardians-identity/audio-character-0.1.json',
    'reference-artifacts/analyses/galaxy-guardians-identity/score-progression-0.1.json',
    'reference-artifacts/analyses/galaxy-guardians-identity/visual-readability-0.1.json'
  ]){
    if(!exists(relPath)){
      fail(`Galaxy first-class conformance requires artifact ${relPath}.`);
    }
  }

  const candidateSurfaces = new Set(candidate.candidateGate?.requiredRuntimeSurfaces || []);
  if(!candidateSurfaces.has('attract_mission_text') || !candidateSurfaces.has('score_advance_table')){
    fail('Galaxy first-class conformance requires score-table and attract-surface runtime coverage.', {
      candidateSurfaces: Array.from(candidateSurfaces)
    });
  }
  if(score.attractMission?.title !== 'WE ARE THE GALAXY GUARDIANS'){
    fail('Galaxy score/progression artifact lost the pack-owned mission framing.', {
      attractMissionTitle: score.attractMission?.title || null
    });
  }

  const payload = {
    ok: true,
    referenceConformanceScore10: rounded(referenceScore),
    playtestWeightedConformanceScore10: rounded(playtestScore),
    publicReleaseReadinessScore10: rounded(publicReadiness),
    implementationGateCoverageScore10: rounded(gateCoverage),
    referenceMaturityScore10: rounded(maturity),
    compellingPreviewTargetScore10: rounded(compellingPreview),
    scriptGroups: Object.fromEntries(Object.entries(REQUIRED_SCRIPT_GROUPS).map(([group, items]) => [group, items.length])),
    docsChecked: REQUIRED_DOC_CHECKS.length,
    candidateSurfaces: Array.from(candidateSurfaces),
    nextMetricPromotions: reference.nextMetricPromotions || []
  };

  console.log(JSON.stringify(payload, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}
