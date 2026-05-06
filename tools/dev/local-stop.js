#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const STATE_DIR = path.join(ROOT, '.local-services');

const SERVICES = [
  { name: 'game', port: 8000, pid: path.join(STATE_DIR, 'game.pid') },
  { name: 'viewer', port: 4311, pid: path.join(STATE_DIR, 'viewer.pid') }
];

function listenerPids(port){
  try {
    return execFileSync('lsof', [`-tiTCP:${port}`, '-sTCP:LISTEN'], { encoding: 'utf8' })
      .split(/\s+/)
      .map(value => +value)
      .filter(Boolean);
  } catch {
    return [];
  }
}

function listenerCwd(pid){
  try {
    const out = execFileSync('lsof', ['-a', '-p', String(pid), '-d', 'cwd', '-Fn'], { encoding: 'utf8' });
    const line = out.split('\n').find(entry => entry.startsWith('n'));
    return line ? line.slice(1).trim() : '';
  } catch {
    return '';
  }
}

function stopPid(pid){
  try {
    process.kill(pid, 'SIGTERM');
    return true;
  } catch {
    return false;
  }
}

function stopService(service){
  const stopped = [];
  const stale = [];
  if(!fs.existsSync(service.pid)){
    stale.push('not-tracked');
  } else {
    const pid = +(fs.readFileSync(service.pid, 'utf8').trim());
    if(stopPid(pid)) stopped.push(pid);
    else stale.push(`stale-pid:${pid}`);
  }

  for(const pid of listenerPids(service.port)){
    if(stopped.includes(pid)) continue;
    const cwd = listenerCwd(pid);
    if(path.resolve(cwd || '/') !== ROOT) continue;
    if(stopPid(pid)) stopped.push(pid);
    else stale.push(`stale-listener:${pid}`);
  }

  fs.rmSync(service.pid, { force: true });
  return {
    name: service.name,
    status: stopped.length ? 'stopped' : 'not-running',
    stopped,
    stale
  };
}

const results = SERVICES.map(stopService);
console.log(JSON.stringify({ ok: true, root: ROOT, results }, null, 2));
