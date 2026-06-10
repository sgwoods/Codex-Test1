#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ROOT, DIST_DEV, DIST_BETA, DIST_PRODUCTION } = require('./paths');

const ISSUE_LIST_PATH = path.join(ROOT, 'security-issues.json');
const TEXT_EXTENSIONS = new Set(['.html', '.js', '.json', '.css', '.txt', '.md', '.yml', '.yaml']);

function parseArgs(argv){
  const args = {};
  for(let i = 0; i < argv.length; i++){
    const token = argv[i];
    if(!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if(!next || next.startsWith('--')){
      args[key] = true;
    }else{
      args[key] = next;
      i++;
    }
  }
  return args;
}

function laneDir(lane){
  if(lane === 'dev') return DIST_DEV;
  if(lane === 'beta') return DIST_BETA;
  if(lane === 'production') return DIST_PRODUCTION;
  throw new Error('Use --lane dev, --lane beta, or --lane production.');
}

function loadJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function walkFiles(dir, files = []){
  if(!fs.existsSync(dir)) return files;
  for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
    const full = path.join(dir, entry.name);
    if(entry.isDirectory()) walkFiles(full, files);
    else if(entry.isFile()) files.push(full);
  }
  return files;
}

function readTextFiles(dir){
  return walkFiles(dir)
    .filter((file) => TEXT_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .map((file) => {
      try{
        return { file, rel: path.relative(dir, file), text: fs.readFileSync(file, 'utf8') };
      }catch{
        return null;
      }
    })
    .filter(Boolean);
}

function includesAny(texts, needles){
  for(const entry of texts){
    for(const needle of needles){
      if(entry.text.includes(needle)) return { observed: true, file: entry.rel, needle };
    }
  }
  return { observed: false, file: '', needle: '' };
}

function loadBuildInfo(dir){
  const file = path.join(dir, 'build-info.json');
  if(!fs.existsSync(file)) return null;
  try{
    return loadJson(file);
  }catch{
    return null;
  }
}

function observeIssues(dir){
  const texts = readTextFiles(dir);
  const buildInfo = loadBuildInfo(dir);
  const observations = new Map();

  const referenceAudioText = includesAny(texts, ['assets/reference-audio/']);
  const referenceAudioDir = fs.existsSync(path.join(dir, 'assets', 'reference-audio'));
  observations.set('SEC-001', {
    observed: referenceAudioDir || referenceAudioText.observed,
    evidence: referenceAudioDir
      ? 'dist artifact contains assets/reference-audio'
      : referenceAudioText.observed
        ? `${referenceAudioText.file} references assets/reference-audio/`
        : ''
  });

  const harness = includesAny(texts, [
    'window.__galagaHarness__',
    'window.__platinumHarness__',
    '__platinumHarnessForceRemoteWrite',
    '__auroraHarnessForceRemoteWrite'
  ]);
  observations.set('SEC-002', {
    observed: harness.observed,
    evidence: harness.observed ? `${harness.file} contains ${harness.needle}` : ''
  });

  const supabaseKey = includesAny(texts, ['SUPABASE_ANON_KEY', 'sb_publishable_']);
  const scoreInsert = includesAny(texts, [".from('scores').insert", '.from("scores").insert']);
  observations.set('SEC-003', {
    observed: supabaseKey.observed && scoreInsert.observed,
    evidence: supabaseKey.observed && scoreInsert.observed
      ? `${supabaseKey.file} contains public Supabase config and ${scoreInsert.file} contains client score insert`
      : ''
  });

  observations.set('SEC-004', {
    observed: false,
    evidence: 'Manual host-header review remains required for GitHub Pages or the active production host.'
  });

  const testPilotText = includesAny(texts, ['nonProductionTestPilotEmails', 'TEST_ACCOUNT_EMAILS']);
  const buildEmails = buildInfo?.platform?.auth?.nonProductionTestPilotEmails;
  observations.set('SEC-005', {
    observed: (Array.isArray(buildEmails) && buildEmails.filter(Boolean).length > 0) || testPilotText.observed,
    evidence: Array.isArray(buildEmails) && buildEmails.filter(Boolean).length > 0
      ? 'build-info.json includes platform.auth.nonProductionTestPilotEmails'
      : testPilotText.observed
        ? `${testPilotText.file} contains ${testPilotText.needle}`
        : ''
  });

  const laneLogic = includesAny(texts, [
    'NON_PRODUCTION_LANE',
    'testAccountEnabled()',
    'TEST_ACCOUNT_EMAILS',
    '__platinumHarnessForceRemoteWrite',
    '__auroraHarnessForceRemoteWrite'
  ]);
  observations.set('SEC-006', {
    observed: laneLogic.observed,
    evidence: laneLogic.observed ? `${laneLogic.file} contains ${laneLogic.needle}` : ''
  });

  return observations;
}

function validateIssueList(data){
  if(data.schemaVersion !== 'security-issues-0.1'){
    throw new Error('Security release gate failed: security-issues.json has an unsupported schemaVersion.');
  }
  if(!Array.isArray(data.issues) || !data.issues.length){
    throw new Error('Security release gate failed: security-issues.json must contain at least one issue.');
  }
  const seen = new Set();
  for(const issue of data.issues){
    const id = String(issue.id || '').trim();
    if(!/^SEC-\d{3}$/.test(id)) throw new Error(`Security release gate failed: issue id "${id || '(missing)'}" must use SEC-001 format.`);
    if(seen.has(id)) throw new Error(`Security release gate failed: duplicate issue id ${id}.`);
    seen.add(id);
    for(const field of ['title', 'severity', 'status', 'summary']){
      if(!String(issue[field] || '').trim()) throw new Error(`Security release gate failed: ${id} is missing ${field}.`);
    }
    if(!Array.isArray(issue.proposedPlan) || !issue.proposedPlan.length){
      throw new Error(`Security release gate failed: ${id} must include proposedPlan steps.`);
    }
    if(!issue.productionAcknowledgement || typeof issue.productionAcknowledgement !== 'object'){
      throw new Error(`Security release gate failed: ${id} must include productionAcknowledgement.`);
    }
  }
}

function statusOpen(issue){
  return !['resolved', 'closed', 'accepted-risk'].includes(String(issue.status || '').toLowerCase());
}

function issueAcknowledged(issue){
  return issue.productionAcknowledgement?.acknowledged === true;
}

function buildFindings(issueList, observations){
  return issueList.issues.map((issue) => {
    const observed = observations.get(issue.id) || { observed: false, evidence: '' };
    const open = statusOpen(issue);
    const acknowledged = issueAcknowledged(issue);
    const resolvedButObserved = !open && observed.observed && String(issue.status || '').toLowerCase() === 'resolved';
    return {
      id: issue.id,
      severity: issue.severity,
      status: issue.status,
      title: issue.title,
      open,
      acknowledged,
      observed: !!observed.observed,
      evidence: observed.evidence || '',
      blocksProduction: (open && !acknowledged) || resolvedButObserved,
      reason: open && !acknowledged
        ? 'open-unacknowledged'
        : resolvedButObserved
          ? 'resolved-but-still-observed'
          : open
            ? 'open-acknowledged'
            : 'not-blocking'
    };
  });
}

function printReview({ lane, findings, json = false }){
  if(json){
    process.stdout.write(JSON.stringify({ ok: !findings.some((finding) => finding.blocksProduction), lane, findings }, null, 2) + '\n');
    return;
  }
  const active = findings.filter((finding) => finding.open || finding.observed);
  const heading = lane === 'production' ? 'Security release review' : 'Security release reminder';
  const lines = [`${heading}: ${active.length} tracked issue(s) for ${lane}.`];
  for(const finding of active){
    const ack = finding.acknowledged ? 'acknowledged' : 'unacknowledged';
    const observed = finding.observed ? ` observed: ${finding.evidence}` : ' not observed in current artifact';
    lines.push(`- ${finding.id} [${finding.severity}/${finding.status}/${ack}] ${finding.title};${observed}`);
  }
  process.stderr.write(lines.join('\n') + '\n');
}

function checkSecurityReleaseGate({ lane = 'dev', json = false } = {}){
  const dir = laneDir(lane);
  const artifactMissing = !fs.existsSync(dir);
  if(artifactMissing && lane === 'production'){
    throw new Error(`Security release gate failed: missing build directory ${dir}. Run npm run build first.`);
  }
  if(!fs.existsSync(ISSUE_LIST_PATH)){
    throw new Error(`Security release gate failed: missing ${ISSUE_LIST_PATH}.`);
  }
  const issueList = loadJson(ISSUE_LIST_PATH);
  validateIssueList(issueList);
  const observations = artifactMissing ? new Map() : observeIssues(dir);
  const findings = buildFindings(issueList, observations);
  printReview({ lane, findings, json });
  if(artifactMissing){
    process.stderr.write(`Security release reminder: ${dir} is not present yet, so artifact observation was skipped.\n`);
  }
  const blockers = findings.filter((finding) => finding.blocksProduction);
  if(lane === 'production' && blockers.length){
    throw new Error(
      'Security release gate failed: production has open unacknowledged security issues or stale resolved issues.\n' +
      blockers.map((finding) => `- ${finding.id}: ${finding.title} (${finding.reason})`).join('\n') +
      '\nFix the issue or add a release-manager productionAcknowledgement in security-issues.json before publishing production.'
    );
  }
  return { ok: true, lane, findings };
}

function main(){
  const args = parseArgs(process.argv.slice(2));
  checkSecurityReleaseGate({
    lane: String(args.lane || 'dev').toLowerCase(),
    json: !!args.json
  });
}

if(require.main === module){
  try{
    main();
  }catch(err){
    console.error(err.message || err);
    process.exit(1);
  }
}

module.exports = {
  checkSecurityReleaseGate,
  observeIssues,
  validateIssueList
};
