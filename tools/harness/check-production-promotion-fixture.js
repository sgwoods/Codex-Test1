const assert = require('assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { createRequire } = require('module');
const { approvalInventory } = require('../build/beta-approval-contract');
const root = path.resolve(__dirname, '../..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'production-promotion-'));
const betaDir = path.join(temp, 'beta');
const prodDir = path.join(temp, 'production');
const script = path.join(root, 'tools/build/promote-production.js');
const realRequire = createRequire(script);
const paths = { ...realRequire('./paths'), DIST_BETA: betaDir, DIST_PRODUCTION: prodDir,
  BETA_BUILD_INFO: path.join(betaDir, 'build-info.json'),
  BETA_APPROVED_BUILD_INFO: path.join(betaDir, 'approved-build-info.json'),
  PRODUCTION_BUILD_INFO: path.join(prodDir, 'build-info.json') };
function run(){
  vm.runInNewContext(fs.readFileSync(script, 'utf8'), {
    console, JSON, require(name){
      if(name === './paths') return paths;
      // Only the isolated fixture substitutes machine/Git guards. No release action runs.
      if(name === './release-authority') return { assertReleaseAuthority(){}, assertReleaseMainCurrent(){} };
      if(name === './check-publish-ready') return { checkGitClean(){} };
      return realRequire(name);
    }
  }, { filename: script });
}
try {
  fs.cpSync(path.join(root, 'dist/beta'), betaDir, { recursive: true });
  fs.rmSync(paths.BETA_APPROVED_BUILD_INFO, { force: true });
  const info = JSON.parse(fs.readFileSync(paths.BETA_BUILD_INFO));
  const { serializeReleaseDetails } = require('../build/packaged-release-details');
  const fixtureIndex = path.join(betaDir, 'index.html');
  fs.writeFileSync(fixtureIndex, `<script type="application/json" id="buildReleaseDetails">${serializeReleaseDetails(info)}</script>\n` + fs.readFileSync(fixtureIndex, 'utf8'));
  const inventory = approvalInventory(betaDir);
  fs.writeFileSync(paths.BETA_APPROVED_BUILD_INFO, JSON.stringify({ ...info, inventory, approvedAt: 'fixture' }));
  const before = fs.readFileSync(path.join(betaDir, 'index.html'), 'utf8');
  run();
  const after = fs.readFileSync(path.join(prodDir, 'index.html'), 'utf8');
  const packaged = JSON.parse(after.match(/id="buildReleaseDetails">([\s\S]*?)<\/script>/)[1]);
  const promoted = JSON.parse(fs.readFileSync(paths.PRODUCTION_BUILD_INFO));
  assert.equal(packaged.lane, 'production');
  assert.equal(packaged.label, promoted.label);
  assert.equal(packaged.version, promoted.versionLine);
  assert.equal(packaged.note.summary, promoted.latestReleaseNote.summary);
  assert.equal(packaged.note.date, promoted.latestReleaseNote.date);
  // The gameplay source section excludes the generated shell and release metadata.
  const marker = '// Source: src/js/';
  const normalize = text => text.slice(text.indexOf(marker))
    .replace(/releaseChannel:'[^']*'/g, "releaseChannel:'LANE'")
    .replace(/branch:'[^']*'/g, "branch:'BRANCH'")
    .replace(/state:'[^']*'/g, "state:'STATE'")
    .replace(/version(Line)?:'[^']*'/g, "version:'VERSION'")
    .replaceAll(info.label, 'BUILD').replaceAll(`1.4.2+build.${info.buildNumber}.sha.${info.shortCommit}`, 'BUILD')
    .replaceAll(info.latestReleaseNote.title, 'NOTE_TITLE')
    .replaceAll(info.latestReleaseNote.summary, 'NOTE_SUMMARY');
  assert(before.includes(marker));
  const note = JSON.parse(fs.readFileSync(path.join(root, 'release-notes.json'))).notes.find(n => n.version === '1.4.2');
  assert.equal(normalize(after).replaceAll(note.title, 'NOTE_TITLE').replaceAll(note.summary, 'NOTE_SUMMARY'), normalize(before));
  assert.deepEqual(approvalInventory(betaDir), inventory);
  fs.writeFileSync(path.join(prodDir, 'sentinel'), 'keep');
  fs.appendFileSync(path.join(betaDir, 'index.html'), 'changed');
  assert.throws(run, /Approved beta files changed/);
  assert.equal(fs.readFileSync(path.join(prodDir, 'sentinel'), 'utf8'), 'keep');
  console.log('PASS: isolated actual promotion, gameplay source preserved, beta unchanged, tamper rejected before output removal');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
