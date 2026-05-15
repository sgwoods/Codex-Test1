#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const PACKAGE_JSON = path.join(ROOT, 'package.json');
const PLAN = path.join(ROOT, 'GALAXY_GUARDIANS_FIRST_CLASS_CONFORMANCE_PLAN.md');
const TOP_PLAN = path.join(ROOT, 'PLAN.md');
const REFERENCE = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'reference-conformance-0.1.json');
const CANDIDATE = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'candidate-0.1.json');
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
  const quickPeek = readJson(QUICK_PEEK);
  const sources = readJson(SOURCES);

  const requiredScripts = [
    'harness:check:galaxy-guardians-opening-slice-baseline',
    'harness:check:galaxy-guardians-attract-score-surface',
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

  const referencePromotions = reference.nextMetricPromotions || [];
  const requiredPromotions = [
    'Opening-slice baseline artifact package and scored gate for WAIT, score table, rack march cadence, explosions, palettes, starfield, reserve ships, missile-ready state, flags, and top re-entry.',
    'Measured opening-slice motion pass for rack march cadence, starfield motion, and bottom-pass-through top re-entry against Matt Hawkins and Nenriki sources.',
    'Platform-frame parity pass for sign-in, high scores, pilot card, replay/video capture, bug reports, and music/sound controls.'
  ];
  const missingPromotions = requiredPromotions.filter(item => !referencePromotions.includes(item));
  if(missingPromotions.length){
    fail('Galaxy reference conformance artifact is missing required opening-slice or parity promotions.', {
      missingPromotions,
      referencePromotions
    });
  }

  const gaps = quickPeek.remainingGaps || [];
  const expectsGap = 'Attract mission text and score advance table are still not implemented as runtime systems.';
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
    nextMetricPromotions: referencePromotions.slice(0, 5),
    quickPeekGapConfirmed: true
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}
