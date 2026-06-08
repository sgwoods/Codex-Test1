#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const DESCRIPTION = path.join(ROOT, 'reference-artifacts', 'ingestion', 'reference-execution-descriptions', 'aurora-stage7-challenge2-0.1.json');
const SETPIECE_CONTRACTS = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-setpiece-contracts', 'latest.json');
const TARGET_CONTRACTS = path.join(ROOT, 'reference-artifacts', 'ingestion', 'challenge-stage-target-contracts', 'aurora-challenge-contracts-0.1.json');
const AURORA_PACK = path.join(ROOT, 'src', 'js', '13-aurora-game-pack.js');
const MOTION_PROFILE_CHECK = path.join(ROOT, 'tools', 'harness', 'check-challenge-motion-profile.js');
const CALIBRATION = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-runtime-calibrations', 'stage7-challenge2', 'latest-semantic-runtime-calibration.json');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-authority', 'stage7-challenge2');
const OUT_JSON = path.join(OUT_ROOT, 'latest-path-family-authority.json');
const OUT_MD = path.join(OUT_ROOT, 'latest-path-family-authority.md');

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file){
  if(!fs.existsSync(file)) throw new Error(`Missing required artifact: ${rel(file)}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function optionalJson(file){
  if(!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${String(value).replace(/\r\n/g, '\n').trimEnd()}\n`);
}

function git(args, fallback = 'unknown'){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || fallback;
  }catch{
    return fallback;
  }
}

function sameOrder(a = [], b = []){
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function quoteListOrder(text){
  return Array.from(String(text || '').matchAll(/'([^']+)'/g)).map(match => match[1]);
}

function sourceSlice(text, startPattern, endPattern){
  const start = text.indexOf(startPattern);
  if(start < 0) return '';
  const end = endPattern ? text.indexOf(endPattern, start + startPattern.length) : -1;
  return text.slice(start, end > start ? end : undefined);
}

function extractFreezeList(text, pattern){
  const match = String(text || '').match(pattern);
  return match ? quoteListOrder(match[1]) : [];
}

function stage7RuntimeOrders(){
  const text = fs.existsSync(AURORA_PACK) ? fs.readFileSync(AURORA_PACK, 'utf8') : '';
  const layoutSlice = sourceSlice(text, 'fromStage:7,', 'fromStage:11,');
  const motionSlice = sourceSlice(text, 'const AURORA_CHALLENGE_STAGE7_MOTION_SPEC_GROUPS', 'const AURORA_CHALLENGE_STAGE7_CONTRACT_GROUPS');
  const contractSlice = sourceSlice(text, 'const AURORA_CHALLENGE_STAGE7_CONTRACT_GROUPS', 'const AURORA_CHALLENGE_STAGE11_CONTRACT_GROUPS');
  return {
    runtimeLayout: extractFreezeList(layoutSlice, /groupPathFamilies:Object\.freeze\(\[([^\]]+)\]\)/),
    runtimeMotionSpec: Array.from(motionSlice.matchAll(/pathFamilyHint:'([^']+)'/g)).map(match => match[1]),
    runtimeContract: Array.from(contractSlice.matchAll(/pathFamily:'([^']+)'/g)).map(match => match[1])
  };
}

function motionProfileOrder(){
  const text = fs.existsSync(MOTION_PROFILE_CHECK) ? fs.readFileSync(MOTION_PROFILE_CHECK, 'utf8') : '';
  const match = text.match(/7:\s*Object\.freeze\(\{[\s\S]*?pathFamilies:\s*Object\.freeze\(\[([^\]]+)\]\)/);
  return match ? quoteListOrder(match[1]) : [];
}

function targetContractOrder(){
  const contracts = readJson(TARGET_CONTRACTS);
  const row = (contracts.contracts || []).find(item => +item.stage === 7 || +item.challengeNumber === 2) || {};
  return (row.groups || []).map(group => group.pathFamily || '');
}

function setpieceOrder(){
  const report = readJson(SETPIECE_CONTRACTS);
  const row = (report.contracts || []).find(item => +item.stage === 7 || +item.challengeNumber === 2) || {};
  return (row.targetContract?.groupSchedule || []).map(group => group.pathFamily || '');
}

function descriptionOrder(description){
  return (description.groups || []).map(group => group.canonicalComparisonPathFamily || '');
}

function buildSources(description){
  const runtime = stage7RuntimeOrders();
  return [
    {
      sourceId: 'reference-execution-description',
      role: 'measured-reference-intent',
      path: rel(DESCRIPTION),
      order: descriptionOrder(description),
      provenanceStrength: 'strongest measured-reference description for this pilot',
      currentUse: 'semantic/object-track comparison target'
    },
    {
      sourceId: 'challenge-setpiece-contracts',
      role: 'measured-reference-intent',
      path: rel(SETPIECE_CONTRACTS),
      order: setpieceOrder(),
      provenanceStrength: 'generated setpiece contract from promoted challenge evidence',
      currentUse: 'measured setpiece interpretation'
    },
    {
      sourceId: 'challenge-stage-target-contracts',
      role: 'live-promotion-gate',
      path: rel(TARGET_CONTRACTS),
      order: targetContractOrder(),
      provenanceStrength: 'current strict-conformance contract input',
      currentUse: 'live source-promotion gate'
    },
    {
      sourceId: 'challenge-motion-profile-check',
      role: 'live-promotion-gate',
      path: rel(MOTION_PROFILE_CHECK),
      order: motionProfileOrder(),
      provenanceStrength: 'browser-backed motion/profile guard',
      currentUse: 'live source-promotion gate'
    },
    {
      sourceId: 'runtime-layout',
      role: 'live-runtime-source',
      path: rel(AURORA_PACK),
      order: runtime.runtimeLayout,
      provenanceStrength: 'restored runtime layout after rejected candidate',
      currentUse: 'current implementation'
    },
    {
      sourceId: 'runtime-motion-spec',
      role: 'live-runtime-source',
      path: rel(AURORA_PACK),
      order: runtime.runtimeMotionSpec,
      provenanceStrength: 'runtime path generator input',
      currentUse: 'current implementation'
    },
    {
      sourceId: 'runtime-contract-groups',
      role: 'live-runtime-source',
      path: rel(AURORA_PACK),
      order: runtime.runtimeContract,
      provenanceStrength: 'runtime/harness contract exposure',
      currentUse: 'current implementation'
    }
  ];
}

function markdown(report){
  const sourceRows = report.sources.map(source => `| ${source.sourceId} | ${source.role} | ${source.order.join(', ')} | ${source.currentUse} |`).join('\n');
  const riskRows = report.migrationRisks.map(row => `| ${row.direction} | ${row.risk} | ${row.mitigation} |`).join('\n');
  const missingRows = report.missingEvidence.map(row => `| ${row.need} | ${row.reason} |`).join('\n');
  return `# Stage 7 Path-Family Authority Decision

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

Decision: ${report.decision.selectedAuthority}

Runtime candidate authority resolved: ${report.decision.authorityResolvedForSourceReady}

Live gate order: ${report.liveGateOrder.join(', ')}

Measured intent order: ${report.measuredIntentOrder.join(', ')}

## Read

${report.decision.read}

## Sources

| Source | Role | Path-family order | Current use |
| --- | --- | --- | --- |
${sourceRows}

## Migration Risks

| Direction | Risk | Mitigation |
| --- | --- | --- |
${riskRows}

## Missing Evidence

| Need | Reason |
| --- | --- |
${missingRows}

## Next Step

${report.nextStep}
`;
}

function main(){
  const description = readJson(DESCRIPTION);
  const calibration = optionalJson(CALIBRATION);
  const sources = buildSources(description);
  const liveGateOrder = sources.find(source => source.sourceId === 'challenge-motion-profile-check')?.order || [];
  const measuredIntentOrder = sources.find(source => source.sourceId === 'reference-execution-description')?.order || [];
  const measuredCluster = sources.filter(source => source.role === 'measured-reference-intent');
  const liveCluster = sources.filter(source => ['live-promotion-gate', 'live-runtime-source'].includes(source.role));
  const measuredClusterAgrees = measuredCluster.every(source => sameOrder(source.order, measuredIntentOrder));
  const liveClusterAgrees = liveCluster.every(source => sameOrder(source.order, liveGateOrder));
  const clustersAgree = sameOrder(measuredIntentOrder, liveGateOrder);
  const report = {
    schemaVersion: 1,
    artifactType: 'stage7-path-family-authority-decision',
    generatedAt: new Date().toISOString(),
    generatedBy: 'tools/harness/analyze-stage7-path-family-authority.js',
    commit: git(['rev-parse', '--short', 'HEAD']),
    branch: git(['branch', '--show-current']),
    releaseFamily: '1.4.1',
    gameKey: 'aurora-galactica',
    scope: {
      stage: 7,
      challengeNumber: 2,
      displayLabel: 'Stage 7 / Challenge 2'
    },
    sourceArtifacts: {
      referenceExecutionDescription: rel(DESCRIPTION),
      challengeSetpieceContracts: rel(SETPIECE_CONTRACTS),
      challengeTargetContracts: rel(TARGET_CONTRACTS),
      challengeMotionProfileCheck: rel(MOTION_PROFILE_CHECK),
      runtimeSource: rel(AURORA_PACK),
      semanticRuntimeCalibration: fs.existsSync(CALIBRATION) ? rel(CALIBRATION) : null
    },
    measuredIntentOrder,
    liveGateOrder,
    measuredClusterAgrees,
    liveClusterAgrees,
    clustersAgree,
    sources,
    decision: {
      selectedAuthority: 'live-promotion-gate-runtime-source',
      authorityResolvedForSourceReady: true,
      liveGateShouldMigrateToMeasuredIntentNow: false,
      redInterpretation: 'Reference Execution Description canonicalComparisonPathFamily remains measured comparison intent for semantic/object-track analysis, not source-ready authority while it conflicts with live gates.',
      strongestMeasuredProvenance: 'reference-execution-description plus challenge-setpiece-contracts',
      strongestSourcePromotionProvenance: 'challenge-motion-profile-check plus challenge-stage-target-contracts plus restored runtime source',
      read: 'Keep live promotion gates and restored runtime source as the Stage 7 source-ready authority for now. RED/setpiece have the strongest measured-reference provenance, but the rejected semantic runtime projection matched that measured-intent order and still produced no browser-runtime object-track lift while tripping the live motion/profile gate. Migrating live gates now would remove a real guard before the project proves group 4, group 5, spacing/readability, and scoreable-window preservation under the measured-intent order.',
      calibrationRead: calibration?.decision?.remainingCompilerGap || 'No calibration report available.'
    },
    migrationRisks: [
      {
        direction: 'migrate-live-gates-to-red-setpiece-now',
        risk: 'Could make the rejected path-order projection appear legal even though actual runtime evidence stayed at baseline and failed the motion/profile gate.',
        mitigation: 'Require a separate migration branch with direct target-track re-review, before/after browser evidence, and group 4/group 5 preservation.'
      },
      {
        direction: 'keep-live-gates-as-source-authority',
        risk: 'Measured RED/setpiece object-track labels may remain underused and semantic candidates may be blocked until translation is improved.',
        mitigation: 'Treat RED/setpiece as measured diagnostic intent and build compiler mappings that can improve runtime within live gates or explicitly justify a future gate migration.'
      }
    ],
    missingEvidence: [
      {
        need: 'group-level target-track re-review for Stage 7 groups 2, 4, and 5',
        reason: 'These groups carry the path-order disagreement and decide whether hook/cross/boss-led labels are semantic roles, object-track families, or runtime contract families.'
      },
      {
        need: 'migration proof that measured-intent order preserves group 4, group 5, spacing/readability, scoreable routes, and no-shot/no-loss safety',
        reason: 'Current rejected evidence did not prove a measured-intent migration improves player-visible runtime behavior.'
      },
      {
        need: 'single canonical artifact for live source-ready path-family order',
        reason: 'Motion/profile, target contracts, and runtime currently agree, but the batch gate still has to audit multiple sources until the authority is centralized.'
      }
    ],
    nextStep: 'Do not change live gate order in this cycle. Update RED/semantic documentation so measured intent is not treated as source-ready truth, then make phase-duration candidates compile to runtime-consumed controls under the live-gate authority.'
  };
  writeJson(OUT_JSON, report);
  writeText(OUT_MD, markdown(report));
  console.log(JSON.stringify({
    ok: true,
    report: rel(OUT_JSON),
    markdown: rel(OUT_MD),
    selectedAuthority: report.decision.selectedAuthority,
    clustersAgree,
    measuredClusterAgrees,
    liveClusterAgrees,
    liveGateShouldMigrateToMeasuredIntentNow: report.decision.liveGateShouldMigrateToMeasuredIntentNow
  }, null, 2));
}

try{
  main();
}catch(error){
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
}
