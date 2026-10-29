const { spawn, execFile, execFileSync } = require('node:child_process');
const { performance } = require('node:perf_hooks');

function parseProcesses(output) {
  return output
    .trim().split('\n').map(row => {
      const [pid, parent, group, state] = row.trim().split(/\s+/);
      return { pid: Number(pid), parent: Number(parent), group: Number(group), state };
    });
}
function processTable() {
  return parseProcesses(execFileSync('ps', ['-axo', 'pid=,ppid=,pgid=,stat='], { encoding: 'utf8', timeout: 2000 }));
}
function processTableAsync(timeout) {
  return new Promise((resolve, reject) => {
    execFile('ps', ['-axo', 'pid=,ppid=,pgid=,stat='], { encoding: 'utf8', timeout, killSignal: 'SIGKILL' }, (error, output) => {
      if (error) reject(error);
      else resolve(parseProcesses(output));
    });
  });
}
function signal(pid, name) {
  try { process.kill(pid, name); }
  catch (error) { if (error.code !== 'ESRCH') throw error; }
}

// Remember descendant groups as well as PIDs: Chromium can detach, and a
// shutdown handler can create children after the worker has exited.
function managedNode(args, options, readProcesses = processTableAsync) {
  if (process.platform === 'win32') throw new Error('Isolated browser supervision currently requires macOS or Linux');
  return new Promise(resolve => {
    const { timeout, ...spawnOptions } = options;
    const child = spawn(process.execPath, args, { ...spawnOptions, detached: true });
    let status = null, exitSignal = null, error = null, closed = false, stopping = false, cleaned = false;
    let timer;
    function finish() {
      if (!closed || (stopping && !cleaned)) return;
      clearTimeout(timer);
      process.removeListener('SIGTERM', interrupt);
      process.removeListener('SIGINT', interrupt);
      resolve({ status, signal: exitSignal, error });
    }
    function stop(reason) {
      if (stopping) return;
      stopping = true;
      error = new Error(reason);
      const ids = new Set(child.pid ? [child.pid] : []);
      const groups = new Set(child.pid ? [child.pid] : []);
      const termIds = new Set(), termGroups = new Set();
      const failures = new Set();
      const started = performance.now(), killAt = started + 500, deadline = started + 1500;
      function fail(message) {
        failures.add(message);
        error = new Error([reason, ...failures].join('; '));
      }
      function discover(rows) {
        const ownGroup = rows.find(row => row.pid === process.pid)?.group;
        if (!ownGroup) throw new Error('Supervisor process group not found');
        let changed;
        do {
          changed = false;
          for (const row of rows) {
            if (ids.has(row.pid) || ids.has(row.parent) || groups.has(row.group)) {
              if (!ids.has(row.pid)) { ids.add(row.pid); changed = true; }
              if (row.group > 0 && row.group !== ownGroup && !groups.has(row.group)) {
                groups.add(row.group); changed = true;
              }
            }
          }
        } while (changed);
        return rows.filter(row => ids.has(row.pid) && !row.state.startsWith('Z'));
      }
      function send(name) {
        for (const group of groups) {
          if (name === 'SIGTERM' && termGroups.has(group)) continue;
          try { signal(-group, name); } catch (failure) { fail(`cleanup failed: ${failure.message}`); }
          termGroups.add(group);
        }
        for (const pid of [...ids].reverse()) {
          if (name === 'SIGTERM' && termIds.has(pid)) continue;
          try { signal(pid, name); } catch (failure) { fail(`cleanup failed: ${failure.message}`); }
          termIds.add(pid);
        }
      }
      async function inspect() {
        const budget = Math.max(1, Math.min(200, Math.floor(deadline - performance.now())));
        let inspectionTimer;
        try {
          const rows = await Promise.race([
            readProcesses(budget),
            new Promise((resolve, reject) => {
              inspectionTimer = setTimeout(() => reject(new Error('inspection deadline exceeded')), budget);
            }),
          ]);
          return discover(rows);
        }
        catch (failure) { fail(`process-tree inspection failed: ${failure.message}`); return null; }
        finally { clearTimeout(inspectionTimer); }
      }
      const killTimer = setTimeout(() => send('SIGKILL'), 500);
      (async () => {
        await inspect();
        send('SIGTERM');
        while (performance.now() < deadline) {
          if (performance.now() >= killAt) send('SIGKILL');
          const alive = await inspect();
          if (alive && !alive.length) {
            return;
          }
          if (performance.now() >= killAt) send('SIGKILL');
          await new Promise(done => setTimeout(done, Math.max(1, Math.min(100, deadline - performance.now()))));
        }
        fail('cleanup could not verify all observed descendants terminated');
        send('SIGKILL');
      })().catch(failure => {
        fail(`cleanup failed: ${failure.message}`);
        send('SIGKILL');
      }).finally(() => {
        clearTimeout(killTimer);
        cleaned = true;
        finish();
      });
    }
    function interrupt() { stop('Interrupted browser run'); }
    process.once('SIGTERM', interrupt);
    process.once('SIGINT', interrupt);
    timer = setTimeout(() => stop(`Browser run timed out after ${timeout}ms`), timeout);
    child.on('error', failure => { error = failure; });
    child.on('close', (code, name) => { status = code; exitSignal = name; closed = true; finish(); });
  });
}
module.exports = { managedNode, processTable };
