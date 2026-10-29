const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { inventory } = require('./run-evidence');
const { parseArgs, runIsolated } = require('./isolated-gameplay');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aurora-isolated-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const bundle = path.join(root, 'bundle'), scenario = path.join(root, 'scenario.json');
  fs.mkdirSync(bundle);
  fs.writeFileSync(path.join(bundle, 'index.html'), '<html>Frozen fixture</html>');
  fs.writeFileSync(path.join(bundle, 'build-info.json'), JSON.stringify({ commit: 'fixture', label: 'fixture-build' }));
  fs.writeFileSync(scenario, JSON.stringify({ name: 'fixture', duration: 5, config: {} }));
  return { bundle, scenario, outBase: path.join(root, 'runs'), forward: ['--seed', '91001'] };
}
test('copies byte-identical inputs, records build identity and isolates every output', async t => {
  const options = fixture(t), before = inventory(options.bundle);
  const execute = (args, out) => {
    assert.equal(args[args.indexOf('--root') + 1], path.join(out, 'input'));
    assert.equal(args[args.indexOf('--out') + 1], path.join(out, 'results'));
    assert.equal(inventory(path.join(out, 'input')).sha256, before.sha256);
    assert(args.includes('--offline'));
    return { status: 0 };
  };
  const one = await runIsolated(options, execute), two = await runIsolated(options, execute);
  assert(one.report.ok && two.report.ok);
  assert.notEqual(one.out, two.out);
  assert.equal(one.report.buildInfo.label, 'fixture-build');
  assert.equal(inventory(options.bundle).sha256, before.sha256);
  assert.equal(fs.existsSync(path.join(options.outBase, 'latest.json')), false);
});
test('concurrent workers cannot share input or latest-output paths', { timeout: 5000 }, async t => {
  const options = fixture(t), workers = [];
  let release;
  const ready = new Promise(resolve => { release = resolve; });
  const execute = async (args, out) => {
    const results = args[args.indexOf('--out') + 1];
    workers.push({ out, results, input: args[args.indexOf('--root') + 1] });
    if (workers.length === 2) release();
    await ready;
    fs.mkdirSync(results);
    fs.writeFileSync(path.join(results, 'latest.json'), JSON.stringify({ owner: out }));
    return { status: 0 };
  };
  const runs = await Promise.all([runIsolated(options, execute), runIsolated(options, execute)]);
  assert(runs.every(run => run.report.ok));
  assert.notEqual(workers[0].input, workers[1].input);
  assert.notEqual(workers[0].results, workers[1].results);
  for (const worker of workers) {
    assert.equal(JSON.parse(fs.readFileSync(path.join(worker.results, 'latest.json'))).owner, worker.out);
  }
  assert.equal(fs.existsSync(path.join(options.outBase, 'latest.json')), false);
});
test('tampering with frozen bytes or scenario fails the receipt', async t => {
  const options = fixture(t);
  for (const mutate of [
    out => fs.writeFileSync(path.join(out, 'input/index.html'), 'changed'),
    out => fs.writeFileSync(path.join(out, 'scenario.json'), '{}'),
  ]) {
    const result = await runIsolated(options, (args, out) => { mutate(out); return { status: 0 }; });
    assert.equal(result.report.ok, false);
    assert.equal(result.report.inputsUnchanged, false);
  }
});
test('child failure, launch exception and signal remain failed with durable evidence', async t => {
  const options = fixture(t);
  for (const execute of [() => ({ status: 7 }), () => ({ status: null, signal: 'SIGKILL' }), () => { throw new Error('launch failed'); }]) {
    const { out, report } = await runIsolated(options, execute);
    assert.equal(report.ok, false);
    assert.equal(JSON.parse(fs.readFileSync(path.join(out, 'run.json'))).ok, false);
  }
});
test('source mutations are reported, not repaired or accepted', async t => {
  const options = fixture(t);
  const { report } = await runIsolated(options, () => {
    fs.writeFileSync(path.join(options.bundle, 'index.html'), 'external edit');
    return { status: 0 };
  });
  assert.equal(report.ok, false);
  assert.equal(report.sourceBundleUnchanged, false);
  assert.equal(fs.readFileSync(path.join(options.bundle, 'index.html'), 'utf8'), 'external edit');
});
test('symlinks, overlapping outputs and path-like scenario names are rejected', async t => {
  const options = fixture(t);
  const before = inventory(options.bundle);
  await assert.rejects(runIsolated({ ...options, outBase: path.join(options.bundle, 'outputs') }), /disjoint/);
  assert.equal(inventory(options.bundle).sha256, before.sha256);
  fs.symlinkSync(options.scenario, path.join(options.bundle, 'escape'));
  await assert.rejects(runIsolated(options), /Symlink/);
  fs.unlinkSync(path.join(options.bundle, 'escape'));
  fs.writeFileSync(options.scenario, JSON.stringify({ name: '../../outside', duration: 5 }));
  await assert.rejects(runIsolated(options), /safe name/);
  fs.writeFileSync(options.scenario, JSON.stringify({ name: 'safe', duration: 5, config: { persona: '../../../outside' } }));
  await assert.rejects(runIsolated(options), /unsafe persona/);
});
test('CLI options fail closed and cannot override snapshot root or offline mode', () => {
  for (const args of [[], ['--bundle'], ['--bundle', '.', '--root', '.'], ['--bundle', '.', '--seed', '0'],
    ['--bundle', '.', '--timeout-ms', '-1'], ['--bundle', '.', '--persona', 'wizard'], ['--bundle', '.', '--bundle', '.']]) {
    assert.throws(() => parseArgs(args));
  }
  assert.deepEqual(parseArgs(['--bundle', '.', '--persona', 'expert', '--seed', '91001']).forward, ['--persona', 'expert', '--seed', '91001']);
});
