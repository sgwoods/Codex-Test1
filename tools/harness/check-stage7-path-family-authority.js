#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-authority', 'stage7-challenge2', 'latest-path-family-authority.json');

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function fail(message, payload = {}){
  console.error(JSON.stringify({ ok: false, message, ...payload }, null, 2));
  process.exit(1);
}

function readJson(file){
  if(!fs.existsSync(file)) fail('Missing Stage 7 path-family authority report.', { file: rel(file) });
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function sameOrder(a = [], b = []){
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function main(){
  const report = readJson(REPORT);
  if(report.artifactType !== 'stage7-path-family-authority-decision'){
    fail('Unexpected authority artifact type.', { artifactType: report.artifactType });
  }
  if(+report.scope?.stage !== 7 || +report.scope?.challengeNumber !== 2){
    fail('Authority report must stay scoped to Stage 7 / Challenge 2.', { scope: report.scope });
  }
  if(report.decision?.selectedAuthority !== 'live-promotion-gate-runtime-source'){
    fail('Stage 7 source-ready authority must remain live gates/runtime source until an explicit migration proof exists.', { decision: report.decision });
  }
  if(report.decision?.liveGateShouldMigrateToMeasuredIntentNow !== false){
    fail('Authority decision must not silently migrate live gates to measured intent.', { decision: report.decision });
  }
  if(!Array.isArray(report.liveGateOrder) || report.liveGateOrder.length !== 5){
    fail('Authority report must include a five-group live gate order.', { liveGateOrder: report.liveGateOrder });
  }
  if(!Array.isArray(report.measuredIntentOrder) || report.measuredIntentOrder.length !== 5){
    fail('Authority report must include a five-group measured intent order.', { measuredIntentOrder: report.measuredIntentOrder });
  }
  if(sameOrder(report.liveGateOrder, report.measuredIntentOrder)){
    fail('This check expects the current Stage 7 truth split to remain visible, not silently resolved.', {
      liveGateOrder: report.liveGateOrder,
      measuredIntentOrder: report.measuredIntentOrder
    });
  }
  const roles = new Set((report.sources || []).map(source => source.role));
  for(const role of ['measured-reference-intent', 'live-promotion-gate', 'live-runtime-source']){
    if(!roles.has(role)) fail('Authority report is missing a required source role.', { role });
  }
  const debt = report.authorityDebt || {};
  if(debt.currentSourcePromotionAuthority?.authorityType !== 'promotion-authority'){
    fail('Authority report must explicitly name current source-promotion authority debt.', { authorityDebt: debt });
  }
  if(debt.targetConformanceAuthority?.authorityType !== 'target-conformance-authority'){
    fail('Authority report must explicitly name target-conformance authority debt.', { authorityDebt: debt });
  }
  if(!sameOrder(debt.currentSourcePromotionAuthority?.order || [], report.liveGateOrder)){
    fail('Authority debt promotion order must match the live gate order.', { authorityDebt: debt, liveGateOrder: report.liveGateOrder });
  }
  if(!sameOrder(debt.targetConformanceAuthority?.order || [], report.measuredIntentOrder)){
    fail('Authority debt target-conformance order must match measured intent.', { authorityDebt: debt, measuredIntentOrder: report.measuredIntentOrder });
  }
  if(!String(debt.separationPrinciple || '').includes('Do not collapse')){
    fail('Authority debt must keep promotion authority separate from target conformance truth.', { authorityDebt: debt });
  }
  const gapTypes = new Set((debt.gapClassification || []).map(row => row.gapType));
  for(const gapType of ['runtime-implementation-gap', 'live-gate-staleness-gap', 'target-evidence-gap']){
    if(!gapTypes.has(gapType)) fail('Authority debt must classify the open authority gap.', { gapType, authorityDebt: debt });
  }
  if(!Array.isArray(debt.evidenceRequiredToMigrate) || debt.evidenceRequiredToMigrate.length < 3){
    fail('Authority debt must list migration evidence requirements.', { authorityDebt: debt });
  }
  console.log(JSON.stringify({
    ok: true,
    report: rel(REPORT),
    selectedAuthority: report.decision.selectedAuthority,
    liveGateOrder: report.liveGateOrder,
    measuredIntentOrder: report.measuredIntentOrder,
    clustersAgree: report.clustersAgree
  }, null, 2));
}

try{
  main();
}catch(error){
  fail(error.message);
}
