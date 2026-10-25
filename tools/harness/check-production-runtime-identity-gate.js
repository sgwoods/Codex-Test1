const assert = require('assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { checkBuildInfo } = require('../build/check-publish-ready');
const { approvalInventory } = require('../build/beta-approval-contract');

const root = path.resolve(__dirname, '../..');
const git = (...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trim();
const head = git('rev-parse', 'HEAD');
// An approved runtime older than the four-commit release-prep window.
const oldRuntime = git('rev-parse', 'HEAD~5');
const otherRuntime = git('rev-parse', 'HEAD~6');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'production-runtime-gate-'));
const betaDir = path.join(temp, 'beta');
const opts = {
  betaBuildInfo: path.join(betaDir, 'build-info.json'),
  approvedBuildInfo: path.join(betaDir, 'approved-build-info.json')
};
const write = (file, data) => fs.writeFileSync(file, JSON.stringify(data));
const runtime = { commit: oldRuntime, shortCommit: oldRuntime.slice(0, 8), buildNumber: 1218 };
const meta = { platform: { version: '1' }, applications: [{ id: 'aurora' }], dirty: false };

function lane(name, info){
  const file = path.join(temp, `${name}-build-info.json`);
  write(file, { ...meta, ...info });
  return { lane: name, buildInfo: file, nextStep: 'fixture' };
}

try {
  fs.mkdirSync(betaDir);
  fs.writeFileSync(path.join(betaDir, 'index.html'), 'frozen beta runtime');
  const beta = { ...runtime, label: 'beta5' };
  write(opts.betaBuildInfo, beta);
  const inventory = approvalInventory(betaDir);
  write(opts.approvedBuildInfo, { ...beta, inventory });
  const production = { ...runtime, promotedFromApprovedBeta: 'beta5', promotedFromApprovedInventory: inventory, documentationCommit: head };

  checkBuildInfo(lane('production', production), opts);

  assert.throws(() => checkBuildInfo(lane('production', { ...production, commit: otherRuntime }), opts), /does not match approved beta/);
  assert.throws(() => checkBuildInfo(lane('production', { ...production, buildNumber: 1219 }), opts), /does not match approved beta/);
  assert.throws(() => checkBuildInfo(lane('production', { ...production, documentationCommit: oldRuntime }), opts), /production documentation was generated from/);
  assert.throws(() => checkBuildInfo(lane('production', { ...production, documentationCommit: undefined }), opts), /production documentation was generated from/);

  // Unapproved production and other lanes keep the commit-age window.
  const { promotedFromApprovedBeta, ...unapproved } = production;
  assert.throws(() => checkBuildInfo(lane('production', unapproved), opts), /acceptable release-prep heads/);
  assert.throws(() => checkBuildInfo(lane('beta', production), opts), /acceptable release-prep heads/);
  checkBuildInfo(lane('beta', { ...production, commit: head }), opts);

  const foreign = 'f'.repeat(40);
  const foreignRuntime = { commit: foreign, shortCommit: foreign.slice(0, 8) };
  write(opts.betaBuildInfo, { ...beta, ...foreignRuntime });
  const foreignInventory = approvalInventory(betaDir);
  write(opts.approvedBuildInfo, { ...beta, ...foreignRuntime, inventory: foreignInventory });
  assert.throws(() => checkBuildInfo(lane('production', { ...production, ...foreignRuntime, promotedFromApprovedInventory: foreignInventory }), opts), /not in the current release history/);

  write(opts.betaBuildInfo, beta);
  write(opts.approvedBuildInfo, { ...beta, inventory: approvalInventory(betaDir) });
  fs.appendFileSync(path.join(betaDir, 'index.html'), 'changed');
  assert.throws(() => checkBuildInfo(lane('production', production), opts), /Approved beta files changed/);

  console.log('PASS: approved older runtime accepted; wrong runtime, foreign history, tamper and stale docs rejected; other lanes keep the commit window');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
