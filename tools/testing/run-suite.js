#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { ROOT, digest, inventory, writeJson, sourceIdentity, newRun } = require('./run-evidence');

const releaseContracts = [
  'check-packaged-release-details.js', 'check-white-paper-completeness.js',
  'check-white-paper-release-consistency.js', 'check-beta-approval-contract.js',
  'check-release-documentation-contract.js', 'check-production-approval-posture.js',
  'check-production-runtime-identity-gate.js',
].map(file => [`tools/harness/${file}`]);
const SUITES = {
  fast: [
    ['--test', 'tools/testing/doc-claims.test.js', 'tools/testing/isolated-gameplay.test.js', 'tools/testing/run-suite.test.js', 'tools/testing/managed-child.test.js'],
    ['tools/testing/doc-claims.js'], ...releaseContracts,
  ],
  simulation: [['tools/harness/check-persona-mode-parity.js']],
  docs: [['--test', 'tools/testing/doc-claims.test.js'], ['tools/testing/doc-claims.js']],
};

function inputs(root) {
  const docs = new Set(['package.json', 'package-lock.json', 'TEST_MAP.md', 'release-manifest.json', 'white-paper.json']);
  const guide = path.join(root, 'white-paper.json');
  if (fs.existsSync(guide)) {
    for (const doc of JSON.parse(fs.readFileSync(guide, 'utf8')).sourceDocs || []) docs.add(doc.file);
  }
  return Object.fromEntries(['tools', 'src'].map(dir => [dir, inventory(path.join(root, dir))]).concat(
    [...docs].sort().map(file => [file, fs.existsSync(path.join(root, file)) ? digest(fs.readFileSync(path.join(root, file))) : null])));
}

function runSuite(name, { root = ROOT, outBase, commands = SUITES[name], timeout = 120000 } = {}) {
  if (!SUITES[name] || !Array.isArray(commands) || !commands.length) throw new Error(`Unknown or empty suite: ${name}`);
  const out = newRun(name, outBase);
  const before = inputs(root);
  const report = { schemaVersion: 1, suite: name, startedAt: new Date().toISOString(),
    source: sourceIdentity(root), node: process.version, inputHashes: before,
    limitation: 'Focused development checks, not full release acceptance or persona skill calibration.', checks: [], ok: false };
  writeJson(path.join(out, 'report.json'), report);
  try {
    for (const [index, args] of commands.entries()) {
      const start = Date.now();
      const log = `${index + 1}.log`;
      const fd = fs.openSync(path.join(out, log), 'wx');
      let result;
      try {
        result = spawnSync(process.execPath, args, { cwd: root, timeout, killSignal: 'SIGKILL', stdio: ['ignore', fd, fd] });
      } finally { fs.closeSync(fd); }
      const ok = result.status === 0 && !result.error && !result.signal;
      report.checks.push({ command: [process.execPath, ...args], log, elapsedMs: Date.now() - start,
        exitCode: result.status, signal: result.signal, error: result.error?.message || null, ok });
      writeJson(path.join(out, 'report.json'), report);
      console.log(`${ok ? 'PASS' : 'FAIL'} ${args.join(' ')} (${Date.now() - start}ms)`);
      if (!ok) break;
    }
    report.inputsUnchanged = JSON.stringify(inputs(root)) === JSON.stringify(before);
    report.ok = report.inputsUnchanged && report.checks.length === commands.length && report.checks.every(check => check.ok);
  } catch (error) {
    report.error = error.message;
  } finally {
    report.finishedAt = new Date().toISOString();
    writeJson(path.join(out, 'report.json'), report);
  }
  return { out, report };
}
if (require.main === module) {
  try {
    if (process.argv.length > 3) throw new Error('Usage: node tools/testing/run-suite.js fast|simulation|docs');
    const { out, report } = runSuite(process.argv[2] || 'fast');
    console.log(`Evidence: ${out}`);
    if (!report.ok) process.exitCode = 1;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { SUITES, runSuite };
