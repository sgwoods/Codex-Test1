const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const { managedNode, processTable } = require('./managed-child');

test('supervisor preserves normal status and launch errors', { skip: process.platform === 'win32' }, async () => {
  const result = await managedNode(['-e', 'process.exit(7)'], { timeout: 5000, stdio: 'ignore' });
  assert.equal(result.status, 7);
  assert.equal(result.error, null);
  const invalid = await managedNode(['-e', 'process.exit(0)'], { cwd: '/does-not-exist/aurora', timeout: 5000, stdio: 'ignore' });
  assert(invalid.error);
});
test('process-inspection failure is explicit, never accepted as successful cleanup', { skip: process.platform === 'win32', timeout: 10000 }, async () => {
  const previousPath = process.env.PATH;
  let result;
  try {
    process.env.PATH = '/does-not-exist/aurora';
    result = await managedNode(['-e', 'setInterval(()=>{},1000)'], { timeout: 100, stdio: 'ignore' });
  } finally {
    if (previousPath === undefined) delete process.env.PATH;
    else process.env.PATH = previousPath;
  }
  assert.match(result.error.message, /process-tree inspection failed/);
  assert.match(result.error.message, /cleanup could not verify/);
  assert.notEqual(result.status, 0);
});
test('slow asynchronous inspections cannot multiply the shutdown budget', { skip: process.platform === 'win32', timeout: 10000 }, async () => {
  const started = performance.now();
  const result = await managedNode(['-e', 'setInterval(()=>{},1000)'], { timeout: 100, stdio: 'ignore' }, async () => {
    await new Promise(done => setTimeout(done, 200));
    throw new Error('slow inspection failure');
  });
  assert.match(result.error.message, /process-tree inspection failed/);
  assert.match(result.error.message, /cleanup could not verify/);
  assert.notEqual(result.status, 0);
  assert(performance.now() - started < 3000, 'Shutdown exceeded the 1500ms cleanup budget plus generous scheduling tolerance');
});
test('interrupt terminates a detached SIGTERM-resistant descendant too', { skip: process.platform === 'win32', timeout: 15000 }, async t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aurora-process-tree-'));
  const pidFile = path.join(dir, 'child-pid');
  t.after(() => {
    try {
      if (fs.existsSync(pidFile)) process.kill(Number(fs.readFileSync(pidFile, 'utf8')), 'SIGKILL');
    } catch (error) { if (error.code !== 'ESRCH') throw error; }
    finally { fs.rmSync(dir, { recursive: true, force: true }); }
  });
  const descendant = `process.on("SIGTERM",()=>{});require('node:fs').writeFileSync(${JSON.stringify(pidFile)},String(process.pid));setInterval(()=>{},1000)`;
  const parent = `require('node:child_process').spawn(process.execPath,['-e',${JSON.stringify(descendant)}],{detached:true,stdio:'ignore'});setInterval(()=>{},1000);`;
  // Stop only once the descendant is SIGTERM-resistant; a fixed timeout races slow startup on loaded CI.
  const run = managedNode(['-e', parent], { timeout: 60000, stdio: 'ignore' });
  const ready = performance.now() + 10000;
  const spawned = () => Number(fs.existsSync(pidFile) && fs.readFileSync(pidFile, 'utf8'));
  while (!spawned() && performance.now() < ready) await new Promise(done => setTimeout(done, 10));
  const pid = spawned();
  assert(pid, 'Descendant was not spawned');
  process.emit('SIGINT');
  const result = await run;
  assert.equal(result.error.message, 'Interrupted browser run');
  const row = processTable().find(row => row.pid === pid);
  assert(!row || row.state.startsWith('Z'), `Descendant ${pid} survived: ${row?.state}`);
});
test('timeout also kills a child created by a detached shutdown handler', { skip: process.platform === 'win32', timeout: 10000 }, async t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aurora-late-child-'));
  const pidFile = path.join(dir, 'detached-pid'), lateFile = path.join(dir, 'late-pid');
  t.after(() => {
    for (const file of [lateFile, pidFile]) {
      if (!fs.existsSync(file)) continue;
      try { process.kill(Number(fs.readFileSync(file, 'utf8')), 'SIGKILL'); }
      catch (error) { if (error.code !== 'ESRCH') throw error; }
    }
    fs.rmSync(dir, { recursive: true, force: true });
  });
  const late = 'process.on("SIGTERM",()=>{});setInterval(()=>{},1000)';
  const detached = `let spawned=false;process.on('SIGTERM',()=>{if(spawned)return;spawned=true;const cp=require('node:child_process').spawn(process.execPath,['-e',${JSON.stringify(late)}],{stdio:'ignore'});require('node:fs').writeFileSync(${JSON.stringify(lateFile)},String(cp.pid));});setInterval(()=>{},1000);`;
  const parent = `const cp=require('node:child_process').spawn(process.execPath,['-e',${JSON.stringify(detached)}],{detached:true,stdio:'ignore'});require('node:fs').writeFileSync(${JSON.stringify(pidFile)},String(cp.pid));setInterval(()=>{},1000);`;
  const result = await managedNode(['-e', parent], { timeout: 1000, stdio: 'ignore' });
  assert.equal(result.error.message, 'Browser run timed out after 1000ms');
  const rows = processTable();
  for (const file of [pidFile, lateFile]) {
    const pid = Number(fs.readFileSync(file, 'utf8'));
    const row = rows.find(row => row.pid === pid);
    assert(!row || row.state.startsWith('Z'), `Descendant ${pid} survived: ${row?.state}`);
  }
});
