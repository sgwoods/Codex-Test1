#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(
  ROOT,
  'reference-artifacts',
  'analyses',
  'galaxy-guardians-identity',
  'opening-slice-source-baseline-0.1.json'
);
const DOC = path.join(ROOT, 'GALAXY_GUARDIANS_OPENING_SLICE_BASELINE.md');
const PROJECT_GUIDE = path.join(ROOT, 'project-guide.json');
const EVENT_LOG = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxian-reference', 'promoted-event-log.json');

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

function includesAll(source, required){
  return required.filter(item => !source.includes(item));
}

function main(){
  const artifact = readJson(ARTIFACT);
  const doc = read(DOC);
  const projectGuide = readJson(PROJECT_GUIDE);
  const eventLog = readJson(EVENT_LOG);

  if(artifact.gameKey !== 'galaxy-guardians-preview'){
    fail('Opening-slice source baseline is attached to the wrong game.', { gameKey: artifact.gameKey });
  }
  if(artifact.status !== 'contact-sheet-promoted-opening-baseline-awaiting-frame-extracted-crops'){
    fail('Opening-slice source baseline has an unexpected status.', { status: artifact.status });
  }

  const intro = artifact.sourceEvidence?.introSource || {};
  const longSession = artifact.sourceEvidence?.longSessionSource || {};
  const missingSources = [];
  if(intro.sourceId !== 'matt-hawkins-arcade-intro') missingSources.push('intro.sourceId');
  if(longSession.sourceId !== 'nenriki-15-wave-session') missingSources.push('longSession.sourceId');
  if(!String(artifact.sourceEvidence?.promotedEventLog || '').endsWith('promoted-event-log.json')) missingSources.push('promotedEventLog');
  if(missingSources.length){
    fail('Opening-slice source baseline is missing required source anchors.', { missingSources, sourceEvidence: artifact.sourceEvidence });
  }

  const eventIds = new Set((eventLog.events || []).map(event => event.promotion_target));
  for(const required of ['attract_mission_text', 'score_advance_table', 'formation_entry_start', 'formation_entry_settle', 'formation_rack_complete', 'enemy_wrap_or_return']){
    if(!eventIds.has(required)){
      fail(`Promoted event log is missing required opening target ${required}.`, { eventIds: Array.from(eventIds) });
    }
  }

  const canonical = artifact.canonicalOpeningSurface || {};
  const missingCanonical = [];
  if(canonical.titleLine !== 'WE ARE THE GALAXIANS') missingCanonical.push('titleLine');
  if(JSON.stringify(canonical.missionLines || []) !== JSON.stringify(['MISSION: DESTROY ALIENS'])) missingCanonical.push('missionLines');
  if(canonical.scoreAdvanceTitle !== 'SCORE ADVANCE TABLE') missingCanonical.push('scoreAdvanceTitle');
  if(JSON.stringify(canonical.scoreAdvanceHeaders || []) !== JSON.stringify(['CONVOY', 'CHARGER'])) missingCanonical.push('scoreAdvanceHeaders');
  const rows = canonical.scoreAdvanceRows || [];
  const expectedRows = [
    [60, 150],
    [50, 100],
    [40, 80],
    [30, 60]
  ];
  if(rows.length !== expectedRows.length || expectedRows.some(([convoy, charger], index) => +rows[index]?.convoyPoints !== convoy || +rows[index]?.chargerPoints !== charger)){
    missingCanonical.push('scoreAdvanceRows');
  }
  const requirements = canonical.openingRequirements || {};
  for(const key of ['reserveShipsVisible', 'stageFlagsVisible', 'playerReadyCueVisible', 'movingStarfieldVisible', 'marchCadenceVisible', 'topReentryVisible']){
    if(requirements[key] !== true) missingCanonical.push(`openingRequirements.${key}`);
  }
  if(missingCanonical.length){
    fail('Opening-slice source baseline is missing canonical opening expectations.', { missingCanonical, canonical });
  }

  const missingDocText = includesAll(doc, [
    'Matt Hawkins arcade intro',
    'Nenriki 15-wave session',
    'WE ARE THE GALAXIANS',
    'MISSION: DESTROY ALIENS',
    'CONVOY',
    'CHARGER',
    'moving starfield',
    'top re-entry'
  ]);
  if(missingDocText.length){
    fail('Opening-slice baseline doc is missing required human-readable cues.', { missingDocText });
  }

  const sourceDocs = Array.isArray(projectGuide.sourceDocs) ? projectGuide.sourceDocs : [];
  const openingDoc = sourceDocs.find(docEntry => docEntry.id === 'guardians-opening-slice-doc');
  if(!openingDoc || openingDoc.file !== 'GALAXY_GUARDIANS_OPENING_SLICE_BASELINE.md'){
    fail('Project guide is missing the hosted opening-slice baseline doc entry.', { openingDoc });
  }
  const guideSource = JSON.stringify(projectGuide);
  const missingGuideRefs = includesAll(guideSource, [
    'project-guide.html#guardians-opening-slice-doc',
    'Read Guardians Opening-Slice Baseline',
    'Guardians opening baseline'
  ]);
  if(missingGuideRefs.length){
    fail('Project guide is missing required opening-slice hosted links.', { missingGuideRefs });
  }

  console.log(JSON.stringify({
    ok: true,
    artifact: path.relative(ROOT, ARTIFACT),
    doc: path.relative(ROOT, DOC),
    introWindow: intro.promotedWindows,
    longSessionWindow: longSession.promotedWindows,
    scoreAdvanceRows: rows.map(row => ({ rank: row.rank, convoyPoints: row.convoyPoints, chargerPoints: row.chargerPoints }))
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}
