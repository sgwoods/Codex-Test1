#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { managedNode } = require('./managed-child');
const { ROOT, digest, inventory, writeJson, sourceIdentity, newRun } = require('./run-evidence');

function parseArgs(argv) {
  const options = { scenario: path.join(__dirname, 'scenarios/browser-smoke.json'), timeout: 180000, forward: [] };
  const flags = new Set(['--bundle', '--scenario', '--out-base', '--timeout-ms', '--persona', '--seed']);
  const seen = new Set();
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i], value = argv[++i];
    assert(flags.has(flag) && !seen.has(flag) && value && !value.startsWith('--'), `Unknown, duplicate or incomplete option: ${flag}`);
    seen.add(flag);
    if (flag === '--bundle') options.bundle = path.resolve(value);
    else if (flag === '--scenario') options.scenario = path.resolve(value);
    else if (flag === '--out-base') options.outBase = path.resolve(value);
    else if (flag === '--timeout-ms') {
      options.timeout = Number(value);
      assert(Number.isInteger(options.timeout) && options.timeout >= 100 && options.timeout <= 3600000, 'Timeout must be 100..3600000ms');
    } else {
      if (flag === '--persona') assert(['novice', 'advanced', 'expert', 'professional'].includes(value), 'Unknown persona');
      if (flag === '--seed') assert(/^\d+$/.test(value) && Number(value) > 0 && Number(value) <= 0xffffffff, 'Seed must be 1..4294967295');
      options.forward.push(flag, value);
    }
  }
  assert(options.bundle, 'Supply --bundle PATH to an existing private harness build; this command never builds one');
  return options;
}

function nested(parent, child) {
  const relative = path.relative(parent, child);
  return !relative || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

function resolvedDestination(file) {
  if (fs.existsSync(file)) return fs.realpathSync(file);
  return path.join(resolvedDestination(path.dirname(file)), path.basename(file));
}

async function execute(args, out, timeout) {
  const stdout = fs.openSync(path.join(out, 'stdout.log'), 'wx');
  const stderr = fs.openSync(path.join(out, 'stderr.log'), 'wx');
  try {
    return await managedNode(args, { cwd: ROOT, timeout, stdio: ['ignore', stdout, stderr] });
  } finally { fs.closeSync(stdout); fs.closeSync(stderr); }
}

async function runIsolated(options, run = execute) {
  const bundle = path.resolve(options.bundle);
  const before = inventory(bundle);
  assert(before.files.some(row => row.file === 'index.html'), 'Bundle has no index.html');
  const scenarioBytes = fs.readFileSync(options.scenario);
  const scenario = JSON.parse(scenarioBytes);
  assert(typeof scenario.name === 'string' && /^[a-zA-Z0-9_-]+$/.test(scenario.name), 'Scenario requires a safe name');
  assert([undefined, null, '', 'novice', 'advanced', 'expert', 'professional'].includes(scenario.config?.persona), 'Scenario contains an unsupported or unsafe persona');
  assert(Number.isFinite(scenario.duration) && scenario.duration > 0, 'Scenario requires a positive duration');
  const outBase = path.resolve(options.outBase || path.join(ROOT, 'harness-artifacts', 'isolated-runs'));
  const destination = resolvedDestination(outBase), source = fs.realpathSync(bundle);
  assert(!nested(source, destination) && !nested(destination, source), 'Bundle and output roots must be disjoint');
  fs.mkdirSync(outBase, { recursive: true });
  const out = newRun('gameplay', outBase);
  const frozen = path.join(out, 'input');
  const methodsBefore = inventory(path.join(ROOT, 'tools'));
  const report = { schemaVersion: 1, kind: 'isolated-gameplay', startedAt: new Date().toISOString(),
    runnerSource: sourceIdentity(), runnerMethods: methodsBefore, sourceBundle: bundle,
    bundle: before, scenarioSha256: digest(scenarioBytes), scenarioSource: path.resolve(options.scenario),
    ok: false, limitation: 'Runner completion and immutable-input checks only; not a gameplay quality or release gate.' };
  const reportPath = path.join(out, 'run.json');
  writeJson(reportPath, report);
  try {
    fs.cpSync(bundle, frozen, { recursive: true, errorOnExist: true, force: false });
    assert.equal(inventory(frozen).sha256, before.sha256, 'Bundle changed during snapshot copy');
    assert.equal(inventory(bundle).sha256, before.sha256, 'Source bundle changed during snapshot copy');
    const infoFile = path.join(frozen, 'build-info.json');
    report.buildInfo = fs.existsSync(infoFile) ? JSON.parse(fs.readFileSync(infoFile, 'utf8')) : null;
    const inputScenario = path.join(out, 'scenario.json');
    fs.writeFileSync(inputScenario, scenarioBytes, { flag: 'wx' });
    report.command = ['tools/harness/run-gameplay.js', '--root', frozen, '--scenario', inputScenario,
      '--out', path.join(out, 'results'), '--auto-video', '0', '--deterministic-replay', '1', '--offline',
      ...(options.forward || [])];
    writeJson(reportPath, report);
    const result = await run(report.command, out, options.timeout || 180000);
    report.exitCode = result.status;
    report.signal = result.signal || null;
    report.error = result.error?.message || null;
    report.cleanup = result.cleanup || null;
    report.inputsUnchanged = inventory(frozen).sha256 === before.sha256 &&
      digest(fs.readFileSync(inputScenario)) === report.scenarioSha256;
    report.sourceBundleUnchanged = inventory(bundle).sha256 === before.sha256;
    report.runnerMethodsUnchanged = inventory(path.join(ROOT, 'tools')).sha256 === methodsBefore.sha256;
    report.ok = result.status === 0 && !result.error && !result.signal && report.inputsUnchanged &&
      report.sourceBundleUnchanged && report.runnerMethodsUnchanged;
  } catch (error) { report.error = error.message; }
  finally {
    report.finishedAt = new Date().toISOString();
    writeJson(reportPath, report);
  }
  return { out, report };
}

if (require.main === module) {
  (async () => {
    const { out, report } = await runIsolated(parseArgs(process.argv.slice(2)));
    console.log(JSON.stringify({ ok: report.ok, evidence: out, error: report.error || null, exitCode: report.exitCode }, null, 2));
    if (!report.ok) process.exitCode = 1;
  })().catch(error => { console.error(error.message); process.exitCode = 1; });
}
module.exports = { parseArgs, runIsolated };
