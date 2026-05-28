#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const PACKAGE_JSON = path.join(ROOT, 'package.json');
const PLAN = path.join(ROOT, 'GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md');
const TOP_PLAN = path.join(ROOT, 'PLAN.md');
const REFERENCE = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'reference-conformance-0.1.json');
const CANDIDATE = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'candidate-0.1.json');
const OPENING_SLICE_RENDER = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'opening-slice-render-surface-0.1.json');
const QUICK_PEEK = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'quick-peek-source-fidelity-0.2.json');
const SOURCES = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxian-reference', 'source-manifest.json');

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
  const pkg = readJson(PACKAGE_JSON);
  const scripts = pkg.scripts || {};
  const plan = read(PLAN);
  const topPlan = read(TOP_PLAN);
  const reference = readJson(REFERENCE);
  const candidate = readJson(CANDIDATE);
  const openingSliceRender = readJson(OPENING_SLICE_RENDER);
  const quickPeek = readJson(QUICK_PEEK);
  const sources = readJson(SOURCES);

  const requiredScripts = [
    'harness:check:galaxy-guardians-opening-slice-baseline',
    'harness:check:galaxy-guardians-opening-slice-source-baseline',
    'harness:check:galaxy-guardians-opening-slice-frame-reference',
    'harness:check:galaxy-guardians-opening-slice-motion-targets',
    'harness:check:galaxy-guardians-opening-slice-render-surface',
    'harness:check:galaxy-guardians-opening-rack-motion',
    'harness:check:galaxy-guardians-attract-score-surface',
    'harness:check:galaxy-guardians-combat-feedback-frame-reference',
    'harness:check:galaxy-guardians-formation-entry',
    'harness:check:galaxy-guardians-movement-pacing',
    'harness:check:galaxy-guardians-runtime-reference-movement',
    'harness:check:galaxy-guardians-visual-readability'
  ];
  const missingScripts = requiredScripts.filter(name => !scripts[name]);
  if(missingScripts.length){
    fail('Galaxy Guardians opening-slice baseline is missing required harness scripts.', { missingScripts });
  }

  const missingPlanText = includesAll(plan, [
    'Opening-Slice Baseline Program',
    'WAIT',
    'score-advance table',
    'moving starfield',
    'missile-ready',
    'reserve-ship',
    'stage flag',
    'bottom-pass-through'
  ]);
  if(missingPlanText.length){
    fail('Galaxy Guardians first-class plan is missing required opening-slice baseline text.', { missingPlanText });
  }

  const missingTopPlanText = includesAll(topPlan, [
    'moving starfield motion',
    'bottom-pass-through',
    'score-advance table'
  ]);
  if(missingTopPlanText.length){
    fail('Top-level plan is missing required Guardians opening-slice baseline references.', { missingTopPlanText });
  }

  const candidateSurfaces = new Set(candidate.candidateGate?.requiredRuntimeSurfaces || []);
  for(const surface of ['attract_mission_text', 'score_advance_table']){
    if(!candidateSurfaces.has(surface)){
      fail(`Opening-slice baseline requires runtime surface ${surface}.`, {
        candidateSurfaces: Array.from(candidateSurfaces)
      });
    }
  }

  const sourceIds = new Set((sources.sources || []).map(source => source.source_id));
  for(const sourceId of ['matt-hawkins-arcade-intro', 'nenriki-15-wave-session']){
    if(!sourceIds.has(sourceId)){
      fail(`Opening-slice baseline requires Galaxian source ${sourceId}.`, {
        sourceIds: Array.from(sourceIds)
      });
    }
  }

  const renderTargets = openingSliceRender.runtimeSurfaceTargets || {};
  for(const key of ['movingStarfieldVisible', 'reserveShipsVisible', 'stageFlagsVisible', 'readyMissileVisible', 'topReentryVisible', 'marchCadenceVisible']){
    if(renderTargets[key] !== true){
      fail(`Opening-slice render artifact is missing required surface target ${key}.`, {
        renderTargets
      });
    }
  }

  const openingRackMotion = readJson(path.join(
    ROOT,
    'reference-artifacts',
    'analyses',
    'galaxy-guardians-identity',
    'opening-rack-motion-0.1.json'
  ));
  if(openingRackMotion.status !== 'opening-rack-motion-contract-object-track-derived'){
    fail('Opening-rack motion artifact has the wrong status.', {
      status: openingRackMotion.status
    });
  }
  if(!openingRackMotion.sourceEvidence?.windowKey?.includes('opening-rack-entry')){
    fail('Opening-rack motion artifact is not anchored to the measured intro rack window.', openingRackMotion);
  }

  const referencePromotions = reference.nextMetricPromotions || [];
  const requiredPromotions = [
    'Tighten the live WAIT/title/mission/score-table layout against the promoted Matt Hawkins frame windows.',
    "Promote frame-backed explosion and hit-state authority from the committed Arcade's Lounge windows so combat flashes stop reading as proxy-only.",
    'Strengthen palette progression and swarm color-family authority beyond the opening slice so later stage bands read as deliberate Guardians presentation.'
  ];
  const missingPromotions = requiredPromotions.filter(item => !referencePromotions.includes(item));
  if(missingPromotions.length){
    fail('Galaxy reference conformance artifact is missing required opening-slice or parity promotions.', {
      missingPromotions,
      referencePromotions
    });
  }

  const gaps = quickPeek.remainingGaps || [];
  const expectsGap = 'Attract mission text and score advance table now have promoted frame-window authority, but the live runtime still needs tighter layout and copy matching against the committed intro reference.';
  if(!gaps.includes(expectsGap)){
    fail('Quick-peek source fidelity artifact no longer preserves the attract/score-table remaining gap.', {
      remainingGaps: gaps
    });
  }

  console.log(JSON.stringify({
    ok: true,
    scriptsChecked: requiredScripts.length,
    candidateSurfaces: Array.from(candidateSurfaces),
    sourceIds: Array.from(sourceIds),
    renderTargets,
    nextMetricPromotions: referencePromotions.slice(0, 5),
    quickPeekGapConfirmed: true
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}
