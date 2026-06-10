#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { ROOT, DIST_DEV, DIST_BETA, DIST_PRODUCTION } = require('./paths');

const ISSUE_LIST_PATH = path.join(ROOT, 'security-issues.json');
const HUMAN_PLAN_PATH = path.join(ROOT, 'SECURITY_ISSUES_RESOLUTION_PLAN.md');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'security-release-review');
const TEXT_EXTENSIONS = new Set(['.html', '.js', '.json', '.css', '.txt', '.md', '.yml', '.yaml']);
const PRIORITY_ORDER = ['P0', 'P1', 'P2', 'P3'];
const DEFAULT_PRIORITY_SCALE = {
  P0: 'Serious: plausible production compromise, public mutation surface, or integrity break; resolve before beta/production unless explicitly accepted.',
  P1: 'Concerning: material exposure or abuse path; reduce before beta when feasible and block production unless acknowledged.',
  P2: 'Risky: hardening, minimization, or defense-in-depth gap; track with a concrete owner and release decision.',
  P3: 'Warning: hygiene or monitoring issue; keep visible so future code review does not reintroduce it.'
};

function git(args, fallback = ''){
  try{
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

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

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function writeJson(file, data){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
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
        return { file, rel: path.relative(dir, file).split(path.sep).join('/'), text: fs.readFileSync(file, 'utf8') };
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

function publicReferenceAudioText(texts){
  const needle = 'assets/reference-audio/';
  for(const entry of texts){
    let index = entry.text.indexOf(needle);
    while(index >= 0){
      const prefix = entry.text.slice(Math.max(0, index - 4), index);
      if(prefix !== 'src/'){
        return { observed: true, file: entry.rel, needle };
      }
      index = entry.text.indexOf(needle, index + needle.length);
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

function publicReferenceAudioFiles(dir){
  const audioDir = path.join(dir, 'assets', 'reference-audio');
  return walkFiles(audioDir).map(file => path.relative(dir, file).split(path.sep).join('/'));
}

function publicTextEmails(texts){
  const emailRe = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/ig;
  for(const entry of texts){
    const matches = entry.text.match(emailRe) || [];
    const email = matches.find(value => /gmail\.com$/i.test(value));
    if(email) return { observed: true, file: entry.rel, email };
  }
  return { observed: false, file: '', email: '' };
}

function publicAccountLaneHardDisabled(texts){
  return texts.some(entry => entry.text.includes('const NON_PRODUCTION_LANE=false;'));
}

function publicSecurityMeta(texts){
  const csp = includesAny(texts, ['http-equiv="Content-Security-Policy"']);
  const referrer = includesAny(texts, ['name="referrer" content="strict-origin-when-cross-origin"']);
  return {
    observed: csp.observed && referrer.observed,
    cspFile: csp.file || '',
    referrerFile: referrer.file || ''
  };
}

function observeIssues(dir){
  const texts = readTextFiles(dir);
  const buildInfo = loadBuildInfo(dir);
  const observations = new Map();

  const referenceAudioText = publicReferenceAudioText(texts);
  const referenceAudioFiles = publicReferenceAudioFiles(dir);
  observations.set('SEC-001', {
    observed: referenceAudioFiles.length > 0 || referenceAudioText.observed,
    evidence: referenceAudioFiles.length > 0
      ? `${referenceAudioFiles.length} public reference-audio file(s) under assets/reference-audio`
      : referenceAudioText.observed
        ? `${referenceAudioText.file} references assets/reference-audio/ without bundled clip bytes`
        : '',
    details: {
      publicReferenceAudioFileCount: referenceAudioFiles.length,
      firstReferenceAudioFile: referenceAudioFiles[0] || '',
      referencePathTextFile: referenceAudioText.file || ''
    }
  });

  const harness = includesAny(texts, [
    'window.__galagaHarness__',
    'window.__platinumHarness__',
    '__platinumHarnessForceRemoteWrite',
    '__auroraHarnessForceRemoteWrite'
  ]);
  observations.set('SEC-002', {
    observed: harness.observed,
    evidence: harness.observed ? `${harness.file} contains ${harness.needle}` : '',
    details: { file: harness.file || '', needle: harness.needle || '' }
  });

  const supabaseKey = includesAny(texts, ['SUPABASE_ANON_KEY', 'sb_publishable_']);
  const scoreInsert = includesAny(texts, [".from('scores').insert", '.from("scores").insert']);
  observations.set('SEC-003', {
    observed: supabaseKey.observed && scoreInsert.observed,
    evidence: supabaseKey.observed && scoreInsert.observed
      ? `${supabaseKey.file} contains public Supabase config and ${scoreInsert.file} contains client score insert`
      : '',
    details: {
      supabaseConfigFile: supabaseKey.file || '',
      scoreInsertFile: scoreInsert.file || ''
    }
  });

  const securityMeta = publicSecurityMeta(texts);
  observations.set('SEC-004', {
    observed: !securityMeta.observed,
    evidence: securityMeta.observed
      ? ''
      : 'Public artifact is missing the generated meta CSP/referrer policy; manual host-header review also remains required for GitHub Pages.',
    details: { manualReviewRequired: true, metaPolicyPresent: securityMeta.observed, cspFile: securityMeta.cspFile, referrerFile: securityMeta.referrerFile }
  });

  const testPilotText = publicTextEmails(texts);
  const buildEmails = buildInfo?.platform?.auth?.nonProductionTestPilotEmails;
  observations.set('SEC-005', {
    observed: (Array.isArray(buildEmails) && buildEmails.filter(Boolean).length > 0) || testPilotText.observed,
    evidence: Array.isArray(buildEmails) && buildEmails.filter(Boolean).length > 0
      ? 'build-info.json includes platform.auth.nonProductionTestPilotEmails'
      : testPilotText.observed
        ? `${testPilotText.file} contains ${testPilotText.email}`
        : '',
    details: {
      buildInfoEmailCount: Array.isArray(buildEmails) ? buildEmails.filter(Boolean).length : 0,
      textFile: testPilotText.file || '',
      email: testPilotText.email || ''
    }
  });

  const laneLogic = includesAny(texts, [
    'NON_PRODUCTION_LANE',
    'testAccountEnabled()',
    'TEST_ACCOUNT_EMAILS',
    '__platinumHarnessForceRemoteWrite',
    '__auroraHarnessForceRemoteWrite'
  ]);
  const accountLaneHardDisabled = publicAccountLaneHardDisabled(texts);
  observations.set('SEC-006', {
    observed: laneLogic.observed && !accountLaneHardDisabled,
    evidence: laneLogic.observed && !accountLaneHardDisabled ? `${laneLogic.file} contains ${laneLogic.needle}` : '',
    details: { file: laneLogic.file || '', needle: laneLogic.needle || '', accountLaneHardDisabled }
  });

  return observations;
}

function priorityScale(data){
  return { ...DEFAULT_PRIORITY_SCALE, ...(data.priorityScale || {}) };
}

function validateIssueList(data){
  if(data.schemaVersion !== 'security-issues-0.2'){
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
    if(!PRIORITY_ORDER.includes(issue.priority)){
      throw new Error(`Security release gate failed: ${id} must include priority P0, P1, P2, or P3.`);
    }
    for(const field of ['title', 'severity', 'category', 'status', 'summary']){
      if(!String(issue[field] || '').trim()) throw new Error(`Security release gate failed: ${id} is missing ${field}.`);
    }
    if(!Array.isArray(issue.evidence) || !issue.evidence.length){
      throw new Error(`Security release gate failed: ${id} must include evidence.`);
    }
    if(!Array.isArray(issue.proposedPlan) || !issue.proposedPlan.length){
      throw new Error(`Security release gate failed: ${id} must include proposedPlan steps.`);
    }
    if(!String(issue.nextAction || '').trim()){
      throw new Error(`Security release gate failed: ${id} must include nextAction.`);
    }
    if(!String(issue.doneDefinition || '').trim()){
      throw new Error(`Security release gate failed: ${id} must include doneDefinition.`);
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
  return issueList.issues
    .map((issue) => {
      const observed = observations.get(issue.id) || { observed: false, evidence: '', details: {} };
      const open = statusOpen(issue);
      const acknowledged = issueAcknowledged(issue);
      const resolvedButObserved = !open && observed.observed && String(issue.status || '').toLowerCase() === 'resolved';
      return {
        id: issue.id,
        priority: issue.priority,
        severity: issue.severity,
        category: issue.category,
        status: issue.status,
        title: issue.title,
        summary: issue.summary,
        nextAction: issue.nextAction,
        doneDefinition: issue.doneDefinition,
        open,
        acknowledged,
        observed: !!observed.observed,
        evidence: observed.evidence || '',
        observationDetails: observed.details || {},
        productionBlocker: (open && !acknowledged) || resolvedButObserved,
        reason: open && !acknowledged
          ? 'open-unacknowledged'
          : resolvedButObserved
            ? 'resolved-but-still-observed'
            : open
              ? 'open-acknowledged'
              : 'not-blocking',
        proposedPlan: issue.proposedPlan || []
      };
    })
    .sort((a, b) => {
      const p = PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority);
      return p || a.id.localeCompare(b.id);
    });
}

function summarizeFindings(findings){
  const byPriority = Object.fromEntries(PRIORITY_ORDER.map(priority => [priority, findings.filter(item => item.priority === priority).length]));
  const openByPriority = Object.fromEntries(PRIORITY_ORDER.map(priority => [priority, findings.filter(item => item.priority === priority && item.open).length]));
  return {
    issueCount: findings.length,
    openCount: findings.filter(item => item.open).length,
    observedCount: findings.filter(item => item.observed).length,
    productionBlockerCount: findings.filter(item => item.productionBlocker).length,
    byPriority,
    openByPriority
  };
}

function renderHumanPlan(issueList, report){
  const scale = priorityScale(issueList);
  const latest = report || {};
  const findingById = new Map((latest.findings || []).map(finding => [finding.id, finding]));
  const lines = [
    '# Security Issues Resolution Plan',
    '',
    `Updated: ${new Date().toISOString().slice(0, 10)}`,
    '',
    'This is the tracked security issue list for Aurora / Platinum release gates. The structured source of truth is `security-issues.json`; this document is regenerated by `npm run security:review:*`.',
    '',
    '## Priority Scale',
    '',
    '| Priority | Meaning |',
    '| --- | --- |',
    ...PRIORITY_ORDER.map(priority => `| ${priority} | ${scale[priority]} |`),
    '',
    '## Release Gate Rule',
    '',
    '- `/production` publish must stop when a tracked security issue is open and not explicitly acknowledged in `security-issues.json`, or when an issue marked resolved is still detected in the production artifact.',
    '- `/beta` publish shows the same issues as reminders unless release authority explicitly promotes one to a hard beta blocker.',
    '- Acknowledgement is temporary release-manager acceptance, not resolution. Resolved issues should be fixed in code/assets/config and marked `resolved`.',
    '',
    '## Latest Captured Review',
    '',
    `- lane: \`${latest.lane || 'not captured'}\``,
    `- generated: \`${latest.generatedAt || 'not captured'}\``,
    `- artifact: \`${latest.artifactDir || 'not captured'}\``,
    `- observed issues: \`${latest.summary?.observedCount ?? 'not captured'}\``,
    `- production blockers: \`${latest.summary?.productionBlockerCount ?? 'not captured'}\``,
    '',
    '## Current Issues',
    '',
    '| Priority | ID | Severity | Status | Observed in latest review | Issue | Next action |',
    '| --- | --- | --- | --- | --- | --- | --- |'
  ];

  for(const issue of [...issueList.issues].sort((a, b) => {
    const p = PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority);
    return p || a.id.localeCompare(b.id);
  })){
    const finding = findingById.get(issue.id);
    const observed = finding ? (finding.observed ? `yes: ${finding.evidence}` : 'no') : 'not captured';
    lines.push(`| ${issue.priority} | ${issue.id} | ${issue.severity} | ${issue.status} | ${observed} | ${issue.title} | ${issue.nextAction} |`);
  }

  lines.push('', '## Resolution Walkthrough', '');
  for(const priority of PRIORITY_ORDER){
    const issues = issueList.issues
      .filter(issue => issue.priority === priority)
      .sort((a, b) => a.id.localeCompare(b.id));
    if(!issues.length) continue;
    lines.push(`### ${priority}`, '');
    for(const issue of issues){
      const finding = findingById.get(issue.id);
      lines.push(
        `#### ${issue.id}: ${issue.title}`,
        '',
        `- Status: \`${issue.status}\``,
        `- Category: \`${issue.category}\``,
        `- Summary: ${issue.summary}`,
        `- Latest artifact read: ${finding ? (finding.observed ? `observed (${finding.evidence})` : 'not observed') : 'not captured yet'}`,
        `- Next action: ${issue.nextAction}`,
        `- Done definition: ${issue.doneDefinition}`,
        '- Evidence:',
        ...issue.evidence.map(item => `  - ${item}`),
        '- Resolution plan:',
        ...issue.proposedPlan.map(item => `  - ${item}`),
        ''
      );
    }
  }

  lines.push(
    '## Acknowledgement Template',
    '',
    'Use this only when a production push must proceed before a fix lands:',
    '',
    '```json',
    '"productionAcknowledgement": {',
    '  "acknowledged": true,',
    '  "acknowledgedBy": "release-manager-name",',
    '  "acknowledgedAt": "YYYY-MM-DD",',
    '  "expiresAt": "YYYY-MM-DD",',
    '  "rationale": "Why production can proceed despite the open issue."',
    '}',
    '```',
    '',
    'Acknowledgements should be short-lived and revisited before the next production push.',
    ''
  );
  return `${lines.join('\n')}`;
}

function checkHumanPlanCoverage(issueList){
  if(!fs.existsSync(HUMAN_PLAN_PATH)){
    throw new Error(`Security release gate failed: missing ${rel(HUMAN_PLAN_PATH)}. Run npm run security:review:dev.`);
  }
  const text = fs.readFileSync(HUMAN_PLAN_PATH, 'utf8');
  const missing = [];
  for(const issue of issueList.issues){
    for(const needle of [issue.id, issue.priority, issue.title]){
      if(!text.includes(needle)) missing.push(`${issue.id}: ${needle}`);
    }
  }
  for(const priority of PRIORITY_ORDER){
    if(!text.includes(priority)) missing.push(`priority-scale:${priority}`);
  }
  if(missing.length){
    throw new Error(`Security release gate failed: ${rel(HUMAN_PLAN_PATH)} is stale or incomplete: ${missing.join(', ')}`);
  }
}

function writeReviewArtifacts({ lane, issueList, findings, artifactMissing }){
  const generatedAt = new Date().toISOString();
  const date = generatedAt.slice(0, 10);
  const head = git(['rev-parse', '--short', 'HEAD'], 'unknown');
  const outDir = path.join(OUT_ROOT, `${date}-${head}-${lane}`);
  const report = {
    schemaVersion: 'security-release-review-0.2',
    artifactType: 'security-release-review',
    generatedAt,
    lane,
    artifactDir: rel(laneDir(lane)),
    artifactMissing,
    headCommit: git(['rev-parse', 'HEAD'], 'unknown'),
    branch: git(['branch', '--show-current'], 'unknown'),
    issueSource: rel(ISSUE_LIST_PATH),
    humanPlan: rel(HUMAN_PLAN_PATH),
    reviewSource: issueList.reviewSource || '',
    priorityScale: priorityScale(issueList),
    productionGatePolicy: issueList.productionGatePolicy || {},
    summary: summarizeFindings(findings),
    findings
  };
  ensureDir(outDir);
  const reportPath = path.join(outDir, 'report.json');
  const readmePath = path.join(outDir, 'README.md');
  writeJson(reportPath, report);
  fs.writeFileSync(readmePath, renderHumanPlan(issueList, { ...report, artifactDir: rel(outDir) }));
  writeJson(path.join(OUT_ROOT, `latest-${lane}.json`), report);
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  fs.writeFileSync(HUMAN_PLAN_PATH, renderHumanPlan(issueList, { ...report, artifactDir: rel(outDir) }));
  return { ...report, reportPath: rel(reportPath), readmePath: rel(readmePath) };
}

function printReview({ lane, findings, summary, gateOk, json = false, artifact = null }){
  if(json){
    process.stdout.write(JSON.stringify({
      ok: gateOk,
      lane,
      summary,
      artifact: artifact ? {
        report: artifact.reportPath,
        latest: `reference-artifacts/analyses/security-release-review/latest-${lane}.json`,
        humanPlan: 'SECURITY_ISSUES_RESOLUTION_PLAN.md'
      } : null,
      findings
    }, null, 2) + '\n');
    return;
  }
  const active = findings.filter((finding) => finding.open || finding.observed);
  const heading = lane === 'production' ? 'Security release review' : 'Security release reminder';
  const lines = [`${heading}: ${active.length} tracked issue(s) for ${lane}.`];
  for(const finding of active){
    const ack = finding.acknowledged ? 'acknowledged' : 'unacknowledged';
    const observed = finding.observed ? ` observed: ${finding.evidence}` : ' not observed in current artifact';
    lines.push(`- ${finding.id} [${finding.priority}/${finding.severity}/${finding.status}/${ack}] ${finding.title};${observed}`);
  }
  if(artifact){
    lines.push(`Captured security review: ${artifact.reportPath}`);
    lines.push('Updated human plan: SECURITY_ISSUES_RESOLUTION_PLAN.md');
  }
  process.stderr.write(lines.join('\n') + '\n');
}

function checkSecurityReleaseGate({ lane = 'dev', json = false, write = false } = {}){
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
  const summary = summarizeFindings(findings);
  const blockers = findings.filter((finding) => finding.productionBlocker);
  const gateOk = lane === 'production' ? blockers.length === 0 : true;
  const artifact = write ? writeReviewArtifacts({ lane, issueList, findings, artifactMissing }) : null;
  checkHumanPlanCoverage(issueList);
  printReview({ lane, findings, summary, gateOk, json, artifact });
  if(artifactMissing){
    process.stderr.write(`Security release reminder: ${dir} is not present yet, so artifact observation was skipped.\n`);
  }
  if(lane === 'production' && blockers.length){
    throw new Error(
      'Security release gate failed: production has open unacknowledged security issues or stale resolved issues.\n' +
      blockers.map((finding) => `- ${finding.id}: ${finding.title} (${finding.reason})`).join('\n') +
      '\nFix the issue or add a release-manager productionAcknowledgement in security-issues.json before publishing production.'
    );
  }
  return { ok: gateOk, lane, summary, findings, artifact };
}

function main(){
  const args = parseArgs(process.argv.slice(2));
  checkSecurityReleaseGate({
    lane: String(args.lane || 'dev').toLowerCase(),
    json: !!args.json,
    write: !!args.write
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
  renderHumanPlan,
  validateIssueList
};
