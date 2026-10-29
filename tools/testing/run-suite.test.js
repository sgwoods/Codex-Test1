const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { runSuite } = require('./run-suite');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aurora-suite-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'tools'));
  fs.mkdirSync(path.join(root, 'src'));
  for (const file of ['package.json', 'package-lock.json', 'release-manifest.json']) fs.writeFileSync(path.join(root, file), '{}');
  fs.writeFileSync(path.join(root, 'TEST_MAP.md'), 'Test fixture');
  execFileSync('git', ['init', '-q', root]);
  execFileSync('git', ['-C', root, 'add', '.']);
  execFileSync('git', ['-C', root, '-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', 'commit', '-qm', 'fixture']);
  return { root, outBase: path.join(root, 'outputs') };
}
test('suite records success, input identity and separate log outputs per invocation', t => {
  const options = fixture(t);
  const one = runSuite('fast', { ...options, commands: [['-e', 'console.log("observed")']] });
  const two = runSuite('fast', { ...options, commands: [['-e', 'process.exit(0)']] });
  assert(one.report.ok && two.report.ok);
  assert.notEqual(one.out, two.out);
  assert.match(fs.readFileSync(path.join(one.out, '1.log'), 'utf8'), /observed/);
  assert(one.report.inputHashes.src.sha256);
});
test('failure, timeout, and changed inputs cannot become a green suite', t => {
  const options = fixture(t);
  const failed = runSuite('fast', { ...options, commands: [['-e', 'process.exit(7)'], ['-e', 'process.exit(0)']] });
  assert.equal(failed.report.ok, false);
  assert.equal(failed.report.checks.length, 1);
  assert.equal(failed.report.checks[0].exitCode, 7);
  const timed = runSuite('fast', { ...options, timeout: 100, commands: [['-e', 'setInterval(()=>{},1000)']] });
  assert.equal(timed.report.ok, false);
  assert(timed.report.checks[0].signal);
  const changed = runSuite('fast', { ...options, commands: [['-e', 'require("fs").writeFileSync("src/new.js","changed")']] });
  assert.equal(changed.report.ok, false);
  assert.equal(changed.report.inputsUnchanged, false);
  assert.throws(() => runSuite('typo', options), /Unknown/);
});
test('white-paper source documents are included in mutation detection', t => {
  const options = fixture(t);
  fs.writeFileSync(path.join(options.root, 'white-paper.json'), JSON.stringify({ sourceDocs: [{ file: 'paper.md' }] }));
  fs.writeFileSync(path.join(options.root, 'paper.md'), 'Checked paper');
  const result = runSuite('fast', { ...options, commands: [['-e', 'require("fs").writeFileSync("paper.md","changed after check")']] });
  assert.equal(result.report.ok, false);
  assert.equal(result.report.inputsUnchanged, false);
});
