#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const OUT_ROOT = path.join(ANALYSES, 'conformance-candidate-loops');
const PROFILE_ROOT = path.join(__dirname, 'conformance-loop-profiles');
const MEASURE = path.join(__dirname, 'measure-conformance-command.js');

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data){
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function round(value, digits = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
}

function git(args){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8' }).trim();
  }catch{
    return '';
  }
}

function parseArgs(argv){
  const opts = {
    profile: 'stage12-late-reward',
    candidateId: null,
    candidateCommand: [],
    notes: ''
  };
  const sep = argv.indexOf('--');
  const head = sep >= 0 ? argv.slice(0, sep) : argv;
  opts.candidateCommand = sep >= 0 ? argv.slice(sep + 1) : [];
  for(let i = 0; i < head.length; i += 1){
    const arg = head[i];
    if(!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = head[i + 1];
    const value = next && !next.startsWith('--') ? next : '1';
    if(next && !next.startsWith('--')) i += 1;
    if(key === 'profile') opts.profile = value;
    else if(key === 'candidate-id') opts.candidateId = value;
    else if(key === 'notes') opts.notes = value;
  }
  return opts;
}

function profilePath(name){
  if(name.endsWith('.json')){
    return path.isAbsolute(name) ? name : path.join(ROOT, name);
  }
  return path.join(PROFILE_ROOT, `${name}.json`);
}

function walkReports(root){
  const found = [];
  function walk(dir){
    if(!fs.existsSync(dir)) return;
    for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
      const full = path.join(dir, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && entry.name === 'report.json') found.push(full);
    }
  }
  walk(root);
  return found.sort((a, b) => {
    const delta = fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs;
    return delta || a.localeCompare(b);
  });
}

function latestReport(artifact){
  const reports = walkReports(path.join(ANALYSES, artifact)).filter(isUsableMetricReport);
  return reports.length ? reports[reports.length - 1] : null;
}

function isUsableMetricReport(file){
  try{
    const data = readJson(file);
    if(data.artifact_type === 'conformance-candidate-loop'){
      return data.decision?.status !== 'evaluator-failed' && data.decision?.status !== 'candidate-command-failed';
    }
    if(data.summary && Number.isFinite(+data.summary.total) && Number.isFinite(+data.summary.passed)){
      return +data.summary.passed >= +data.summary.total;
    }
    if(data.ok === false) return false;
    return true;
  }catch{
    return false;
  }
}

function getPath(data, dottedPath){
  return String(dottedPath || '').split('.').reduce((current, key) => {
    if(current == null) return undefined;
    return current[key];
  }, data);
}

function readMetric(metric, reportsByArtifact){
  const reportPath = reportsByArtifact[metric.artifact] || latestReport(metric.artifact);
  if(!reportPath) return { value: null, report: null };
  const data = readJson(reportPath);
  return {
    value: getPath(data, metric.path),
    report: reportPath
  };
}

function snapshotMetrics(profile){
  const artifacts = new Set();
  for(const metric of [...(profile.targetMetrics || []), ...(profile.guardrailMetrics || [])]){
    artifacts.add(metric.artifact);
  }
  const reportsByArtifact = {};
  for(const artifact of artifacts){
    reportsByArtifact[artifact] = latestReport(artifact);
  }
  const metrics = {};
  for(const metric of [...(profile.targetMetrics || []), ...(profile.guardrailMetrics || [])]){
    const read = readMetric(metric, reportsByArtifact);
    metrics[metric.id] = {
      artifact: metric.artifact,
      path: metric.path,
      value: read.value,
      report: read.report ? rel(read.report) : null
    };
  }
  return metrics;
}

function spawnMeasured(evaluator, profile, candidateId){
  const args = [
    MEASURE,
    ...[].concat(...(evaluator.axes || ['conformance-loop']).map(axis => ['--axis', axis])),
    ...[].concat(...(evaluator.resources || ['cpu']).map(resource => ['--resource', resource])),
    '--notes',
    `${evaluator.notes || evaluator.id} (${profile.id}/${candidateId})`,
    '--',
    ...evaluator.command
  ];
  const result = spawnSync(process.execPath, args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 80,
    stdio: ['inherit', 'pipe', 'pipe']
  });
  return {
    id: evaluator.id,
    command: evaluator.command,
    exitCode: result.status,
    signal: result.signal || null,
    stdoutTail: String(result.stdout || '').split('\n').filter(Boolean).slice(-20),
    stderrTail: String(result.stderr || '').split('\n').filter(Boolean).slice(-30)
  };
}

function runCandidateCommand(command){
  if(!command.length){
    return {
      skipped: true,
      reason: 'No candidate command supplied; this run records evaluator baseline and loop decision logic only.'
    };
  }
  const result = spawnSync(command[0], command.slice(1), {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 40,
    stdio: ['inherit', 'pipe', 'pipe']
  });
  return {
    skipped: false,
    command,
    exitCode: result.status,
    signal: result.signal || null,
    stdoutTail: String(result.stdout || '').split('\n').filter(Boolean).slice(-20),
    stderrTail: String(result.stderr || '').split('\n').filter(Boolean).slice(-30)
  };
}

function compareMetric(metric, before, after){
  const beforeValue = +before[metric.id]?.value;
  const afterValue = +after[metric.id]?.value;
  const delta = Number.isFinite(beforeValue) && Number.isFinite(afterValue)
    ? round(afterValue - beforeValue, 3)
    : null;
  const minDelta = +metric.minDelta || 0;
  const passed = delta != null && delta >= minDelta;
  return {
    id: metric.id,
    artifact: metric.artifact,
    path: metric.path,
    direction: metric.direction,
    before: Number.isFinite(beforeValue) ? beforeValue : before[metric.id]?.value ?? null,
    after: Number.isFinite(afterValue) ? afterValue : after[metric.id]?.value ?? null,
    delta,
    minDelta,
    passed,
    beforeReport: before[metric.id]?.report || null,
    afterReport: after[metric.id]?.report || null
  };
}

function decisionFor(targetResults, guardrailResults, candidateCommand){
  if(!candidateCommand.length){
    return {
      status: 'baseline-recorded',
      keep: false,
      reason: 'No candidate mutation was supplied, so the loop recorded current metric position and evaluator cost without promoting a gameplay change.'
    };
  }
  const targetsPassed = targetResults.every(result => result.passed);
  const guardrailsPassed = guardrailResults.every(result => result.passed);
  if(targetsPassed && guardrailsPassed){
    return {
      status: 'candidate-accepted',
      keep: true,
      reason: 'Target metrics improved by their required deltas and all guardrails held.'
    };
  }
  return {
    status: 'candidate-rejected',
    keep: false,
    reason: targetsPassed
      ? 'Target metrics improved, but one or more guardrails regressed.'
      : 'One or more target metrics did not improve enough to justify keeping the candidate.'
  };
}

function buildReadme(report){
  const lines = [
    `# ${report.profile.title}`,
    '',
    'This artifact records a bounded conformance-candidate loop: fixed problem, fixed evaluator set, measured cost, target metrics, guardrails, and a keep/discard decision.',
    '',
    `- Candidate: ${report.candidate.id}`,
    `- Decision: ${report.decision.status}`,
    `- Keep candidate: ${report.decision.keep ? 'yes' : 'no'}`,
    `- Reason: ${report.decision.reason}`,
    `- Branch: ${report.git.branch}`,
    `- Commit: ${report.git.commit}`,
    '',
    '## Problem',
    '',
    report.profile.problem,
    '',
    '## Strategy',
    '',
    report.profile.strategy,
    '',
    '## Success Measure',
    '',
    report.profile.successMeasure,
    '',
    '## Target Metrics',
    '',
    '| Metric | Before | After | Delta | Required | Pass |',
    '| --- | ---: | ---: | ---: | ---: | --- |'
  ];
  for(const metric of report.results.targets){
    lines.push(`| ${metric.id} | ${metric.before ?? 'n/a'} | ${metric.after ?? 'n/a'} | ${metric.delta ?? 'n/a'} | ${metric.minDelta} | ${metric.passed ? 'yes' : 'no'} |`);
  }
  lines.push('');
  lines.push('## Guardrails');
  lines.push('');
  lines.push('| Metric | Before | After | Delta | Required | Pass |');
  lines.push('| --- | ---: | ---: | ---: | ---: | --- |');
  for(const metric of report.results.guardrails){
    lines.push(`| ${metric.id} | ${metric.before ?? 'n/a'} | ${metric.after ?? 'n/a'} | ${metric.delta ?? 'n/a'} | ${metric.minDelta} | ${metric.passed ? 'yes' : 'no'} |`);
  }
  lines.push('');
  lines.push('## Evaluators');
  lines.push('');
  for(const evaluator of report.evaluators){
    lines.push(`- ${evaluator.id}: exit ${evaluator.exitCode}`);
  }
  lines.push('');
  lines.push('## Next Step');
  lines.push('');
  lines.push(report.nextStep);
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function main(){
  const opts = parseArgs(process.argv.slice(2));
  const profileFile = profilePath(opts.profile);
  if(!fs.existsSync(profileFile)){
    throw new Error(`Missing conformance loop profile: ${profileFile}`);
  }
  const profile = readJson(profileFile);
  ensureDir(OUT_ROOT);
  const candidateId = opts.candidateId || `${profile.id}-candidate-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  const stamp = new Date().toISOString().slice(0, 10);
  const commit = git(['rev-parse', '--short', 'HEAD']) || 'unknown';
  const outDir = path.join(OUT_ROOT, `${stamp}-${commit}`, candidateId);
  ensureDir(outDir);

  const before = snapshotMetrics(profile);
  const candidate = runCandidateCommand(opts.candidateCommand);
  if(candidate.exitCode){
    const report = {
      generatedAt: new Date().toISOString(),
      profile,
      candidate: { id: candidateId, command: opts.candidateCommand, result: candidate },
      git: {
        branch: git(['branch', '--show-current']) || null,
        commit,
        dirty: !!git(['status', '--short'])
      },
      decision: {
        status: 'candidate-command-failed',
        keep: false,
        reason: 'Candidate command failed before evaluators ran.'
      },
      before,
      after: null,
      results: { targets: [], guardrails: [] },
      evaluators: [],
      nextStep: 'Fix or replace the candidate command, then rerun the same frozen loop profile.'
    };
    writeJson(path.join(outDir, 'report.json'), report);
    fs.writeFileSync(path.join(outDir, 'README.md'), buildReadme(report));
    console.log(JSON.stringify({ ok: false, outDir, decision: report.decision.status }, null, 2));
    process.exit(candidate.exitCode || 1);
  }

  const evaluators = [];
  for(const evaluator of profile.evaluators || []){
    const result = spawnMeasured(evaluator, profile, candidateId);
    evaluators.push(result);
    if(result.exitCode){
      const report = {
        generatedAt: new Date().toISOString(),
        profile,
        candidate: { id: candidateId, command: opts.candidateCommand, result: candidate },
        git: {
          branch: git(['branch', '--show-current']) || null,
          commit,
          dirty: !!git(['status', '--short'])
        },
        decision: {
          status: 'evaluator-failed',
          keep: false,
          reason: `${evaluator.id} failed, so the candidate cannot be judged.`
        },
        before,
        after: snapshotMetrics(profile),
        results: { targets: [], guardrails: [] },
        evaluators,
        nextStep: 'Inspect the failed evaluator output, fix harness or gameplay breakage, then rerun the same profile.'
      };
      writeJson(path.join(outDir, 'report.json'), report);
      fs.writeFileSync(path.join(outDir, 'README.md'), buildReadme(report));
      console.log(JSON.stringify({ ok: false, outDir, decision: report.decision.status }, null, 2));
      process.exit(result.exitCode || 1);
    }
  }

  const after = snapshotMetrics(profile);
  const targetResults = (profile.targetMetrics || []).map(metric => compareMetric(metric, before, after));
  const guardrailResults = (profile.guardrailMetrics || []).map(metric => compareMetric(metric, before, after));
  const decision = decisionFor(targetResults, guardrailResults, opts.candidateCommand);
  const report = {
    generatedAt: new Date().toISOString(),
    schema_version: 1,
    artifact_type: 'conformance-candidate-loop',
    profile: Object.assign({ profileFile: rel(profileFile) }, profile),
    candidate: {
      id: candidateId,
      command: opts.candidateCommand,
      notes: opts.notes,
      result: candidate
    },
    git: {
      branch: git(['branch', '--show-current']) || null,
      commit,
      dirty: !!git(['status', '--short'])
    },
    before,
    after,
    results: {
      targets: targetResults,
      guardrails: guardrailResults
    },
    evaluators,
    decision,
    nextStep: decision.keep
      ? 'Promote the candidate into a normal commit and run the broader quality score before merging.'
      : 'Use this metric read to make a narrow Stage 12 natural reward candidate, then rerun this same frozen loop.'
  };
  writeJson(path.join(outDir, 'report.json'), report);
  fs.writeFileSync(path.join(outDir, 'README.md'), buildReadme(report));
  console.log(JSON.stringify({
    ok: true,
    outDir,
    decision: decision.status,
    keep: decision.keep,
    targets: targetResults.map(result => ({ id: result.id, delta: result.delta, passed: result.passed })),
    guardrails: guardrailResults.map(result => ({ id: result.id, delta: result.delta, passed: result.passed }))
  }, null, 2));
}

main();
