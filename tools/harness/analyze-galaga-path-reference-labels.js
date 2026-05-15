#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const SOURCE_ROOT = path.join(ROOT, 'reference-artifacts', 'ingestion', 'galaga-path-reference-labels');
const OUT_ROOT = path.join(ANALYSES, 'galaga-path-reference-labels');
const PLAN_PATH = path.join(ANALYSES, 'galaga-path-reference-label-plan', 'latest.json');

const REGULAR_REQUIRED = [
  'sourceAnchor',
  'sourceTimestampS',
  'stageNumber',
  'entityType',
  'entityFamily',
  'firstVisibleFrame',
  'entrySide',
  'entryCurveFamily',
  'rackTargetRow',
  'rackTargetColumn',
  'settleFrame',
  'firstAttackOrExitFrame',
  'notes',
  'confidence'
];

const CHALLENGE_REQUIRED = [
  'sourceAnchor',
  'sourceTimestampS',
  'challengeNumber',
  'groupIndex',
  'entityType',
  'entityFamily',
  'firstVisibleFrame',
  'entrySide',
  'pathCommitFrame',
  'scoreableUpperBandStartFrame',
  'scoreableUpperBandEndFrame',
  'exitSide',
  'bonusOpportunity',
  'notes',
  'confidence'
];

const VECTOR_FIELDS = [
  'xRange',
  'yRange',
  'pathLength',
  'turnCount',
  'reversalCount',
  'lowerFieldShare',
  'rackSlotError',
  'timingOffsetS'
];

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback = null){
  try{
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }catch{
    return fallback;
  }
}

function writeJson(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function round(value, digits = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : 0;
}

function clamp(value, min = 0, max = 1){
  return Math.max(min, Math.min(max, value));
}

function gitShortCommit(){
  try{
    return execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function collectJsonFiles(root){
  const out = [];
  if(!fs.existsSync(root)) return out;
  function walk(dir){
    for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
      const full = path.join(dir, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && entry.name.endsWith('.json')) out.push(full);
    }
  }
  walk(root);
  return out.sort((a, b) => a.localeCompare(b));
}

function normalizeConfidence(value){
  if(typeof value === 'number') return clamp(value);
  const key = String(value || '').trim().toLowerCase();
  if(key === 'high') return 1;
  if(key === 'medium') return 0.72;
  if(key === 'low') return 0.42;
  if(key === 'planned' || key === 'todo') return 0;
  return Number.isFinite(+key) ? clamp(+key) : 0;
}

function extractLabels(payload){
  if(Array.isArray(payload)) return payload;
  if(Array.isArray(payload?.labels)) return payload.labels;
  if(Array.isArray(payload?.regularEntry) || Array.isArray(payload?.challengeEntry)){
    return [
      ...(payload.regularEntry || []).map(label => Object.assign({ kind: 'regularEntry' }, label)),
      ...(payload.challengeEntry || []).map(label => Object.assign({ kind: 'challengeEntry' }, label))
    ];
  }
  return [];
}

function validateLabel(label, file, index){
  const kind = label.kind || label.labelFamily || label.type;
  const required = kind === 'regularEntry' ? REGULAR_REQUIRED : kind === 'challengeEntry' ? CHALLENGE_REQUIRED : null;
  const errors = [];
  if(!required) errors.push('kind must be regularEntry or challengeEntry');
  for(const field of required || []){
    if(label[field] === undefined || label[field] === null || label[field] === '') errors.push(`missing ${field}`);
  }
  if(label.sourceAnchor && !fs.existsSync(path.join(ROOT, label.sourceAnchor))){
    errors.push(`sourceAnchor does not exist: ${label.sourceAnchor}`);
  }
  for(const field of ['sourceTimestampS', 'firstVisibleFrame']){
    if(label[field] !== undefined && !Number.isFinite(+label[field])) errors.push(`${field} must be numeric`);
  }
  if(kind === 'regularEntry'){
    for(const field of ['stageNumber', 'rackTargetRow', 'rackTargetColumn', 'settleFrame', 'firstAttackOrExitFrame']){
      if(label[field] !== undefined && !Number.isFinite(+label[field])) errors.push(`${field} must be numeric`);
    }
  }
  if(kind === 'challengeEntry'){
    for(const field of ['challengeNumber', 'groupIndex', 'pathCommitFrame', 'scoreableUpperBandStartFrame', 'scoreableUpperBandEndFrame']){
      if(label[field] !== undefined && !Number.isFinite(+label[field])) errors.push(`${field} must be numeric`);
    }
  }
  if(label.comparisonVector){
    for(const field of VECTOR_FIELDS){
      if(label.comparisonVector[field] !== undefined && !Number.isFinite(+label.comparisonVector[field])){
        errors.push(`comparisonVector.${field} must be numeric`);
      }
    }
  }
  return {
    file: rel(file),
    index,
    kind,
    labelId: label.id || `${path.basename(file, '.json')}-${index + 1}`,
    accepted: errors.length === 0,
    confidenceScore: normalizeConfidence(label.confidence),
    sourceAnchor: label.sourceAnchor || null,
    sourceTimestampS: Number.isFinite(+label.sourceTimestampS) ? +label.sourceTimestampS : null,
    entityType: label.entityType || null,
    entityFamily: label.entityFamily || null,
    errors,
    label
  };
}

function buildReport(){
  const generatedAt = new Date().toISOString();
  const commit = gitShortCommit();
  const outDir = path.join(OUT_ROOT, `${generatedAt.slice(0, 10)}-${commit}`);
  const plan = readJson(PLAN_PATH, {});
  const sourceFiles = collectJsonFiles(SOURCE_ROOT);
  const labelResults = [];
  for(const file of sourceFiles){
    const payload = readJson(file, null);
    if(!payload){
      labelResults.push({
        file: rel(file),
        index: 0,
        kind: null,
        labelId: path.basename(file, '.json'),
        accepted: false,
        confidenceScore: 0,
        errors: ['file is not valid JSON'],
        label: null
      });
      continue;
    }
    extractLabels(payload).forEach((label, index) => labelResults.push(validateLabel(label, file, index)));
  }
  const accepted = labelResults.filter(result => result.accepted);
  const acceptedRegular = accepted.filter(result => result.kind === 'regularEntry');
  const acceptedChallenge = accepted.filter(result => result.kind === 'challengeEntry');
  const invalid = labelResults.filter(result => !result.accepted);
  const regularCoverage = clamp(acceptedRegular.length / 6);
  const challengeCoverage = clamp(acceptedChallenge.length / 4);
  const coverageScore10 = round(10 * ((0.55 * regularCoverage) + (0.45 * challengeCoverage)), 1);
  const confidenceScore = accepted.length
    ? round(accepted.reduce((sum, result) => sum + result.confidenceScore, 0) / accepted.length, 3)
    : 0;
  const directReferenceReady = acceptedRegular.length >= 6 && acceptedChallenge.length >= 4 && confidenceScore >= 0.72;
  const report = {
    generatedAt,
    commit,
    artifactType: 'galaga-path-reference-labels',
    score10: coverageScore10,
    summary: {
      status: directReferenceReady
        ? 'direct-reference-label-gate-passed'
        : accepted.length
          ? 'partial-reference-labels-ingested'
          : 'awaiting-reference-labels',
      sourceFileCount: sourceFiles.length,
      acceptedLabelCount: accepted.length,
      acceptedRegularEntryCount: acceptedRegular.length,
      acceptedChallengeEntryCount: acceptedChallenge.length,
      invalidLabelCount: invalid.length,
      regularCoverage,
      challengeCoverage,
      coverageScore10,
      confidenceScore,
      directReferenceReady,
      playerMeaning: 'These labels let the harness compare Aurora alien arrivals, rack settling, challenge paths, and bonus windows against actual Galaga reference windows instead of broad heuristic path families.',
      nextAction: directReferenceReady
        ? 'Wire direct labels into path-family comparison and lift the heuristic cap in alien-entry/challenge scoring.'
        : 'Add accepted regularEntry and challengeEntry label JSON files under reference-artifacts/ingestion/galaga-path-reference-labels, then rerun this analyzer.'
    },
    requiredGates: {
      regularEntryLabels: 6,
      challengeEntryLabels: 4,
      minimumMeanConfidence: 0.72
    },
    sourceDirectory: rel(SOURCE_ROOT),
    sourceFiles: sourceFiles.map(rel),
    acceptedLabels: accepted.map(result => ({
      file: result.file,
      labelId: result.labelId,
      kind: result.kind,
      sourceAnchor: result.sourceAnchor,
      sourceTimestampS: result.sourceTimestampS,
      entityType: result.entityType,
      entityFamily: result.entityFamily,
      confidenceScore: result.confidenceScore
    })),
    rejectedLabels: invalid.map(result => ({
      file: result.file,
      labelId: result.labelId,
      kind: result.kind,
      errors: result.errors
    })),
    workQueue: plan.workQueue || [],
    sourceAnchors: plan.sourceAnchors || [],
    schemas: {
      regularEntry: REGULAR_REQUIRED,
      challengeEntry: CHALLENGE_REQUIRED,
      comparisonVector: VECTOR_FIELDS
    },
    integrationPolicy: {
      replaceHeuristicCapOnlyWhen: [
        'acceptedRegularEntryCount >= 6',
        'acceptedChallengeEntryCount >= 4',
        'confidenceScore >= 0.72',
        'directReferenceReady is true'
      ],
      planningRowsDoNotScoreAsZero: true,
      noKeeperEvidenceIsPreserved: true
    }
  };
  writeJson(path.join(outDir, 'report.json'), report);
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);

  const lines = [
    '# Galaga Path Reference Labels',
    '',
    'This artifact validates accepted Galaga path labels before they are allowed to lift Aurora alien-entry/challenge metrics from heuristic runtime comparison into direct reference comparison.',
    '',
    `- Status: ${report.summary.status}`,
    `- Score: ${coverageScore10}/10`,
    `- Accepted labels: ${accepted.length}`,
    `- Regular labels: ${acceptedRegular.length}/6`,
    `- Challenge labels: ${acceptedChallenge.length}/4`,
    '',
    '## Meaning',
    '',
    report.summary.playerMeaning,
    '',
    '## Next Action',
    '',
    report.summary.nextAction,
    '',
    '## Work Queue',
    '',
    '| Priority | Work | Acceptance Gate |',
    '| ---: | --- | --- |'
  ];
  for(const item of report.workQueue){
    lines.push(`| ${item.priority ?? ''} | ${item.id || item.metric || ''} | ${item.acceptanceGate || ''} |`);
  }
  fs.writeFileSync(path.join(outDir, 'README.md'), `${lines.join('\n')}\n`);
  return {
    ok: true,
    status: report.summary.status,
    score10: coverageScore10,
    acceptedLabelCount: accepted.length,
    report: rel(path.join(outDir, 'report.json')),
    latest: rel(path.join(OUT_ROOT, 'latest.json'))
  };
}

if(require.main === module){
  console.log(JSON.stringify(buildReport(), null, 2));
}

module.exports = { buildReport };
