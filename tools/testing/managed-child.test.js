const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const { EventEmitter } = require('node:events');
const { managedNode, managedBatch, processTable } = require('./managed-child');

test('pre-aborted jobs never spawn', async () => {
  const controller = new AbortController(); controller.abort();
  const result = await managedNode([], { timeout: 100, signal: controller.signal }, undefined,
    { spawn: () => { throw new Error('must not spawn'); } });
  assert.match(result.error.message, /before spawn/);
  assert.equal(result.cleanup.status, 'not-needed');
});

test('batch preserves caller cancellation and reports rejected runners', async () => {
  const controller = new AbortController(); controller.abort();
  const cancelled = await managedBatch([{ args: [], options: { signal: controller.signal } }], async (_, options) => {
    assert(options.signal.aborted);
    return { status: null, error: new Error('caller cancelled') };
  });
  assert.equal(cancelled.passed, false);
  const rejected = await managedBatch([{ args: [] }], async () => { throw new Error('runner failed'); });
  assert.equal(rejected.passed, false);
  assert.equal(rejected.results[0].cleanup.status, 'unknown');
});

test('targeted abort removes listener and waits for cleanup', async () => {
  const controller = new AbortController(), child = new EventEmitter(); child.pid = 20000001;
  let alive = true, removed = 0;
  const remove = controller.signal.removeEventListener.bind(controller.signal);
  controller.signal.removeEventListener = (...args) => { removed++; return remove(...args); };
  const run = managedNode([], { timeout: 1000, signal: controller.signal }, async () => [
    { pid: process.pid, parent: 1, group: 20000003, state: 'S' },
    ...(alive ? [{ pid: child.pid, parent: process.pid, group: child.pid, state: 'S' }] : []),
  ], { spawn: () => child, signal: () => { if (alive) { alive = false; child.emit('close', null, 'SIGTERM'); } } });
  controller.abort();
  const result = await run;
  assert.equal(result.cleanup.status, 'verified'); assert.equal(removed, 1);
  assert.match(result.error.message, /Cancelled/);
});

test('batch failure cancels and awaits sibling cleanup', async () => {
  let cleaned = false;
  const result = await managedBatch([{ args: ['fail'] }, { args: ['wait'] }], async (args, options) => {
    if (args[0] === 'fail') { await new Promise(r => setTimeout(r, 10)); return { status: 1 }; }
    await new Promise(r => options.signal.addEventListener('abort', r, { once: true }));
    await new Promise(r => setTimeout(r, 20)); cleaned = true;
    return { status: null, error: new Error('cancelled'), cleanup: { status: 'verified' } };
  });
  assert.equal(result.passed, false);
  assert(cleaned);
  assert.equal(result.results.length, 2);
});

test('real failed batch terminates a hanging sibling', { skip: process.platform === 'win32', timeout: 5000 }, async () => {
  const result = await managedBatch([
    { args: ['-e', 'setTimeout(()=>process.exit(2),100)'], options: { timeout: 2000, stdio: 'ignore' } },
    { args: ['-e', 'setInterval(()=>{},1000)'], options: { timeout: 2000, stdio: 'ignore' } },
  ]);
  assert.equal(result.passed, false);
  assert.match(result.results[1].error.message, /Cancelled/);
  assert.equal(result.results[1].cleanup.status, 'verified');
});

async function interruptAfterReadiness(run, ready) {
  let settled = false, value, result;
  run.then(() => { settled = true; });
  try { value = await ready(); }
  finally {
    if (!settled) process.emit('SIGINT');
    result = await run;
  }
  return { value, result };
}

test('readiness failure awaits interruption and removes supervisor listeners', { skip: process.platform === 'win32', timeout: 3000 }, async () => {
  const before = ['SIGINT', 'SIGTERM'].map(name => process.listenerCount(name));
  const child = new EventEmitter();
  child.pid = 20000001;
  let alive = true, closed = false;
  const run = managedNode([], { timeout: 60000, stdio: 'ignore' }, async () => [
    { pid: process.pid, parent: 1, group: 20000003, state: 'S' },
    ...(alive ? [{ pid: child.pid, parent: process.pid, group: child.pid, state: 'S' }] : []),
  ], { spawn: () => child, signal: () => {
    if (alive) { alive = false; closed = true; child.emit('close', null, 'SIGTERM'); }
  } });
  await assert.rejects(interruptAfterReadiness(run, async () => { throw new Error('readiness failed'); }), /readiness failed/);
  assert(closed, 'Failure must await managed child shutdown');
  assert.deepEqual(['SIGINT', 'SIGTERM'].map(name => process.listenerCount(name)), before);
  assert.match((await run).error.message, /^Interrupted browser run;/);
});

test('snapshot race reports unverifiable detached cleanup without targeting unrelated processes', { skip: process.platform === 'win32', timeout: 3000 }, async () => {
  const child = new EventEmitter();
  child.pid = 20000001;
  const orphan = { pid: 20000002, parent: child.pid, group: 20000002, state: 'S' };
  const supervisor = { pid: process.pid, parent: 1, group: 20000003, state: 'S' };
  const unrelated = { pid: 20000004, parent: 1, group: 20000004, state: 'S' };
  let reads = 0, parentAlive = true, orphanAlive = false;
  const sent = [];
  const started = performance.now();
  const result = await managedNode([], { timeout: 1, stdio: 'ignore' }, async () => {
    reads++;
    const snapshot = [supervisor, unrelated];
    if (parentAlive) snapshot.push({ pid: child.pid, parent: process.pid, group: child.pid, state: 'S' });
    if (orphanAlive) snapshot.push({ ...orphan });
    // The child appears after the snapshot, before termination of its parent.
    if (reads === 1) orphanAlive = true;
    return snapshot;
  }, {
    spawn: () => child,
    signal: (pid, name) => {
      sent.push([pid, name]);
      if (Math.abs(pid) === child.pid && parentAlive) {
        parentAlive = false;
        orphan.parent = 1;
        child.emit('close', null, name);
      }
      if (Math.abs(pid) === orphan.pid) orphanAlive = false;
    },
  });
  assert(reads >= 2);
  assert(orphanAlive, 'Fixture must reproduce the escaped, unobserved child');
  assert(sent.every(([pid]) => Math.abs(pid) === child.pid), 'Must not signal unowned processes');
  assert.match(result.error.message, /timed out/);
  assert.match(result.error.message, /cannot verify unobserved detached descendants/);
  assert.equal(result.cleanup.scope, 'observed-descendants');
  assert.equal(result.cleanup.status, 'verified');
  assert.equal(result.cleanup.detachedDescendants, 'not-verifiable');
  assert(performance.now() - started < 2500);
});

test('late worker error preserves timeout and cleanup uncertainty', { skip: process.platform === 'win32', timeout: 3000 }, async () => {
  const child = new EventEmitter();
  child.pid = 20000001;
  let alive = true;
  const result = await managedNode([], { timeout: 1, stdio: 'ignore' }, async () => [
    { pid: process.pid, parent: 1, group: 20000003, state: 'S' },
    ...(alive ? [{ pid: child.pid, parent: process.pid, group: child.pid, state: 'S' }] : []),
  ], { spawn: () => child, signal: () => {
    if (!alive) return;
    alive = false;
    child.emit('error', new Error('late worker failure'));
    child.emit('close', null, 'SIGTERM');
  } });
  assert.match(result.error.message, /^Browser run timed out after 1ms;/);
  assert.match(result.error.message, /cannot verify unobserved detached descendants/);
  assert.match(result.error.message, /late worker failure/);
  assert.equal(result.cleanup.status, 'incomplete');
});

test('supervisor preserves normal status and launch errors', { skip: process.platform === 'win32' }, async () => {
  const result = await managedNode(['-e', 'process.exit(7)'], { timeout: 5000, stdio: 'ignore' });
  assert.equal(result.status, 7);
  assert.match(result.error.message, /exited with 7/);
  assert.equal(result.cleanup.status, 'verified');
  const invalid = await managedNode(['-e', 'process.exit(0)'], { cwd: '/does-not-exist/aurora', timeout: 5000, stdio: 'ignore' });
  assert(invalid.error);
  assert.equal(invalid.cleanup.status, 'not-attempted');
});

test('missing close settles incomplete instead of waiting indefinitely', { timeout: 4000 }, async () => {
  const child = new EventEmitter(); child.pid = 20000001;
  let unref = false, destroyed = false;
  child.unref = () => { unref = true; };
  child.stdout = { destroy: () => { destroyed = true; } };
  const start = performance.now();
  const result = await managedNode([], { timeout: 1 }, async () => [
    { pid: process.pid, parent: 1, group: 20000003, state: 'S' },
    { pid: child.pid, parent: process.pid, group: child.pid, state: 'S' },
  ], { spawn: () => child, signal: () => {} });
  assert.match(result.error.message, /close not observed/);
  assert.equal(result.cleanup.status, 'incomplete');
  assert(unref && destroyed); assert(performance.now() - start < 3000);
});
test('empty process snapshots wait for delayed close and preserve output', async () => {
  const child = new EventEmitter(); child.pid = 20000001;
  let destroyed = false;
  child.stdout = { destroy: () => { destroyed = true; } };
  const run = managedNode([], { timeout: 5000 }, async () => [
    { pid: process.pid, parent: 1, group: 20000003, state: 'S' },
  ], { spawn: () => child, signal: () => {} });
  child.emit('exit', 7, null);
  setTimeout(() => child.emit('close', 7, null), 50);
  const result = await run;
  assert.equal(result.status, 7);
  assert.equal(result.cleanup.status, 'verified');
  assert.equal(destroyed, false);
  const diagnostic = result.error.message;
  child.emit('error', new Error('late'));
  child.emit('close', 0, null);
  assert.equal(result.error.message, diagnostic);
  assert.equal(result.status, 7);
});

test('empty snapshots without close still settle incomplete at the deadline', { timeout: 4000 }, async () => {
  const child = new EventEmitter(); child.pid = 20000001;
  const before = ['SIGINT', 'SIGTERM'].map(name => process.listenerCount(name));
  const start = performance.now();
  const run = managedNode([], { timeout: 5000 }, async () => [
    { pid: process.pid, parent: 1, group: 20000003, state: 'S' },
  ], { spawn: () => child, signal: () => {} });
  child.emit('exit', 7, null);
  const result = await run;
  assert.equal(result.status, 7);
  assert.equal(result.cleanup.status, 'incomplete');
  assert.match(result.error.message, /close not observed/);
  assert(performance.now() - start >= 1400);
  assert(performance.now() - start < 3000);
  assert.deepEqual(['SIGINT', 'SIGTERM'].map(name => process.listenerCount(name)), before);
});

test('failed worker cleanup terminates same-group pipe holder', { skip: process.platform === 'win32', timeout: 6000 }, async () => {
  const result = await managedNode(['-e', `
    const child=require('node:child_process').spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{stdio:'inherit'});
    child.on('spawn',()=>process.exit(7));
  `], { timeout: 4000, stdio: ['ignore', 'pipe', 'pipe'] });
  assert.equal(result.status, 7);
  assert.equal(result.cleanup.status, 'verified', result.error?.message);
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
  assert.equal(result.cleanup.status, 'incomplete');
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
  const { value: pid, result } = await interruptAfterReadiness(run, async () => {
    while (!spawned() && performance.now() < ready) await new Promise(done => setTimeout(done, 10));
    const pid = spawned();
    assert(pid, 'Descendant was not spawned');
    return pid;
  });
  assert.match(result.error.message, /^Interrupted browser run;/);
  assert.match(result.error.message, /cannot verify unobserved detached descendants/);
  assert.equal(result.cleanup.status, 'verified');
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
  assert.match(result.error.message, /^Browser run timed out after 1000ms;/);
  assert.equal(result.cleanup.status, 'verified');
  const rows = processTable();
  for (const file of [pidFile, lateFile]) {
    const pid = Number(fs.readFileSync(file, 'utf8'));
    const row = rows.find(row => row.pid === pid);
    assert(!row || row.state.startsWith('Z'), `Descendant ${pid} survived: ${row?.state}`);
  }
});
