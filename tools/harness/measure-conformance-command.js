#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'conformance-economics');
const LEDGER = path.join(OUT_ROOT, 'run-ledger.jsonl');

function parseArgs(argv){
  const opts = {
    axes: [],
    resources: [],
    notes: '',
    modelProvider: null,
    modelName: null,
    modelCalls: 0,
    inputTokens: 0,
    outputTokens: 0,
    modelMinutes: 0,
    gpuMode: null,
    gpuSeconds: null,
    manual: false,
    codexUsage5hLeftPercent: null,
    codexUsageWeekLeftPercent: null,
    codexModel5hLeftPercent: null,
    codexModelWeekLeftPercent: null,
    usageReset: null,
    weeklyReset: null,
    command: []
  };
  const sep = argv.indexOf('--');
  const head = sep >= 0 ? argv.slice(0, sep) : argv;
  opts.command = sep >= 0 ? argv.slice(sep + 1) : [];
  for(let i = 0; i < head.length; i++){
    const arg = head[i];
    if(!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = head[i + 1];
    const value = next && !next.startsWith('--') ? next : '1';
    if(next && !next.startsWith('--')) i++;
    if(key === 'axis') opts.axes.push(value);
    else if(key === 'resource') opts.resources.push(value);
    else if(key === 'notes') opts.notes = value;
    else if(key === 'model-provider') opts.modelProvider = value;
    else if(key === 'model') opts.modelName = value;
    else if(key === 'model-calls') opts.modelCalls = +value || 0;
    else if(key === 'input-tokens') opts.inputTokens = +value || 0;
    else if(key === 'output-tokens') opts.outputTokens = +value || 0;
    else if(key === 'model-minutes') opts.modelMinutes = +value || 0;
    else if(key === 'gpu-mode') opts.gpuMode = value;
    else if(key === 'gpu-seconds') opts.gpuSeconds = +value || null;
    else if(key === 'manual') opts.manual = value !== '0' && value !== 'false';
    else if(key === 'codex-usage-5h-left-percent') opts.codexUsage5hLeftPercent = +value;
    else if(key === 'codex-usage-week-left-percent') opts.codexUsageWeekLeftPercent = +value;
    else if(key === 'codex-model-5h-left-percent') opts.codexModel5hLeftPercent = +value;
    else if(key === 'codex-model-week-left-percent') opts.codexModelWeekLeftPercent = +value;
    else if(key === 'usage-reset') opts.usageReset = value;
    else if(key === 'weekly-reset') opts.weeklyReset = value;
  }
  return opts;
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function git(args){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8' }).trim();
  }catch{
    return '';
  }
}

function dirBytes(dir){
  let total = 0;
  if(!fs.existsSync(dir)) return 0;
  function walk(current){
    for(const entry of fs.readdirSync(current, { withFileTypes: true })){
      const full = path.join(current, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile()) total += fs.statSync(full).size;
    }
  }
  walk(dir);
  return total;
}

function parseTimeOutput(stderr){
  const text = stderr || '';
  const out = {};
  const real = /(?:^|\n)\s*real\s+([0-9.]+)/.exec(text);
  const user = /(?:^|\n)\s*user\s+([0-9.]+)/.exec(text);
  const sys = /(?:^|\n)\s*sys\s+([0-9.]+)/.exec(text);
  const rss = /([0-9]+)\s+maximum resident set size/.exec(text);
  if(real) out.timeRealSeconds = +real[1];
  if(user) out.timeUserSeconds = +user[1];
  if(sys) out.timeSystemSeconds = +sys[1];
  if(rss) out.maxResidentSetBytes = +rss[1];
  return out;
}

function stripTimeOutput(stderr){
  return String(stderr || '')
    .split('\n')
    .filter(line => !/^\s*(real|user|sys)\s+[0-9.]+/.test(line))
    .filter(line => !/^\s*\d+\s+maximum resident set size/.test(line))
    .join('\n');
}

function main(){
  const opts = parseArgs(process.argv.slice(2));
  if(!opts.command.length && !opts.manual){
    console.error('Usage: node tools/harness/measure-conformance-command.js --axis level-arc --resource cpu -- <command> [args...]');
    console.error('Manual model/Codex usage: node tools/harness/measure-conformance-command.js --manual --axis audio --resource codex --model-provider openai --model gpt-5.3-codex --model-minutes 30 --notes "planning/review"');
    process.exit(1);
  }
  ensureDir(OUT_ROOT);
  const beforeBytes = dirBytes(path.join(ROOT, 'reference-artifacts'));
  const start = Date.now();
  const startedAt = new Date(start).toISOString();
  const command = opts.command;
  const result = opts.manual
    ? { stdout: '', stderr: '', status: 0, signal: null }
    : (() => {
      const timeBin = fs.existsSync('/usr/bin/time') ? '/usr/bin/time' : null;
      const runArgs = timeBin ? ['-p', ...command] : command.slice(1);
      const runCommand = timeBin || command[0];
      return spawnSync(runCommand, runArgs, {
        cwd: ROOT,
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 * 80,
        stdio: ['inherit', 'pipe', 'pipe']
      });
    })();
  const end = Date.now();
  if(result.stdout) process.stdout.write(result.stdout);
  const cleanStderr = stripTimeOutput(result.stderr || '');
  if(cleanStderr) process.stderr.write(cleanStderr.endsWith('\n') ? cleanStderr : `${cleanStderr}\n`);
  const parsed = parseTimeOutput(result.stderr || '');
  const wallSeconds = opts.manual && opts.modelMinutes ? opts.modelMinutes * 60 : (end - start) / 1000;
  const afterBytes = dirBytes(path.join(ROOT, 'reference-artifacts'));
  const entry = {
    schema_version: 1,
    artifact_type: 'conformance-economics-run',
    id: `${startedAt.replace(/[:.]/g, '-')}-${process.pid}`,
    startedAt,
    endedAt: new Date(end).toISOString(),
    branch: git(['branch', '--show-current']) || null,
    commit: git(['rev-parse', '--short', 'HEAD']) || null,
    command: command.length ? command : ['manual:model-usage'],
    axes: opts.axes.length ? opts.axes : ['unspecified'],
    resources: opts.resources.length ? opts.resources : (opts.manual ? ['codex', 'model-api'] : ['cpu']),
    notes: opts.notes,
    measurement: {
      wallSeconds: +wallSeconds.toFixed(3),
      timeRealSeconds: parsed.timeRealSeconds ?? null,
      timeUserSeconds: parsed.timeUserSeconds ?? null,
      timeSystemSeconds: parsed.timeSystemSeconds ?? null,
      cpuSeconds: +((parsed.timeUserSeconds || 0) + (parsed.timeSystemSeconds || 0)).toFixed(3),
      maxResidentSetBytes: parsed.maxResidentSetBytes ?? null,
      exitCode: result.status,
      signal: result.signal || null
    },
    resourcesDeclared: {
      gpuMode: opts.gpuMode,
      gpuSeconds: opts.gpuSeconds,
      modelProvider: opts.modelProvider,
      modelName: opts.modelName,
      modelCalls: opts.modelCalls,
      inputTokens: opts.inputTokens,
      outputTokens: opts.outputTokens,
      modelMinutes: opts.modelMinutes,
      codexUsage5hLeftPercent: Number.isFinite(opts.codexUsage5hLeftPercent) ? opts.codexUsage5hLeftPercent : null,
      codexUsageWeekLeftPercent: Number.isFinite(opts.codexUsageWeekLeftPercent) ? opts.codexUsageWeekLeftPercent : null,
      codexModel5hLeftPercent: Number.isFinite(opts.codexModel5hLeftPercent) ? opts.codexModel5hLeftPercent : null,
      codexModelWeekLeftPercent: Number.isFinite(opts.codexModelWeekLeftPercent) ? opts.codexModelWeekLeftPercent : null,
      usageReset: opts.usageReset,
      weeklyReset: opts.weeklyReset
    },
    outputs: {
      artifactBytesBefore: beforeBytes,
      artifactBytesAfter: afterBytes,
      artifactBytesDelta: afterBytes - beforeBytes
    }
  };
  fs.appendFileSync(LEDGER, `${JSON.stringify(entry)}\n`);
  fs.writeFileSync(path.join(OUT_ROOT, 'latest-run.json'), `${JSON.stringify(entry, null, 2)}\n`);
  console.error(JSON.stringify({
    ok: result.status === 0,
    ledger: rel(LEDGER),
    latestRun: rel(path.join(OUT_ROOT, 'latest-run.json')),
    wallSeconds: entry.measurement.wallSeconds,
    cpuSeconds: entry.measurement.cpuSeconds,
    artifactBytesDelta: entry.outputs.artifactBytesDelta
  }, null, 2));
  process.exit(result.status || 0);
}

main();
