#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const path = require('path');
const { execFileSync, spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const STATE_DIR = path.join(ROOT, '.local-services');
const NODE = process.execPath;

const SERVICES = [
  {
    name: 'game',
    url: 'http://127.0.0.1:8000/',
    expect: 'Aurora Galactica',
    port: 8000,
    log: path.join(STATE_DIR, 'game.log'),
    pid: path.join(STATE_DIR, 'game.pid'),
    command: ['python3', '-m', 'http.server', '8000', '--directory', 'dist/dev']
  },
  {
    name: 'viewer',
    url: 'http://127.0.0.1:4311/api/runs',
    port: 4311,
    log: path.join(STATE_DIR, 'viewer.log'),
    pid: path.join(STATE_DIR, 'viewer.pid'),
    command: [NODE, path.join(ROOT, 'tools', 'log-viewer', 'server.js')]
  },
  {
    name: 'conformance-dashboard',
    url: 'http://127.0.0.1:4312/local-dev/conformance-dashboard.html',
    expect: 'Aurora Conformance Dashboard',
    port: 4312,
    log: path.join(STATE_DIR, 'conformance-dashboard.log'),
    pid: path.join(STATE_DIR, 'conformance-dashboard.pid'),
    command: ['python3', '-m', 'http.server', '4312', '--directory', ROOT]
  }
];

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function probe(url, expectedText = ''){
  return new Promise(resolve => {
    let body = '';
    const req = http.get(url, res => {
      res.setEncoding('utf8');
      res.on('data', chunk => {
        if(body.length < 200000) body += chunk;
      });
      res.on('end', () => {
        const reachable = res.statusCode >= 200 && res.statusCode < 500;
        const matches = expectedText ? body.includes(expectedText) : true;
        resolve(reachable && matches);
      });
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function listenerPids(port){
  if(!port) return [];
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

function listenerDetails(service){
  return listenerPids(service.port).map(pid => {
    const cwd = listenerCwd(pid);
    return {
      pid,
      cwd,
      root_ok: path.resolve(cwd || '/') === ROOT
    };
  });
}

function serviceRootOk(service){
  const listeners = listenerDetails(service);
  return listeners.length > 0 && listeners.every(listener => listener.root_ok);
}

function reclaimWrongLocalService(service){
  if(!service.port) return [];
  const stopped = [];
  for(const listener of listenerDetails(service)){
    if(listener.root_ok) continue;
    try {
      process.kill(listener.pid, 'SIGTERM');
      stopped.push(listener);
    } catch {}
  }
  if(stopped.length) {
    try { fs.rmSync(service.pid, { force: true }); } catch {}
  }
  return stopped;
}

function startService(service){
  ensureDir(STATE_DIR);
  const logFd = fs.openSync(service.log, 'a');
  const child = spawn(service.command[0], service.command.slice(1), {
    cwd: ROOT,
    detached: true,
    stdio: ['ignore', logFd, logFd]
  });
  child.unref();
  fs.writeFileSync(service.pid, String(child.pid));
  return child.pid;
}

function syncPidFile(service, listeners){
  if(listeners.length === 1 && listeners[0].root_ok){
    fs.writeFileSync(service.pid, String(listeners[0].pid));
  }
}

async function startAndVerifyService(service){
  const pid = startService(service);
  await new Promise(resolve => setTimeout(resolve, 350));
  const running = await probe(service.url, service.expect) && serviceRootOk(service);
  return { pid, running };
}

async function main(){
  const results = [];
  for(const service of SERVICES){
    const reclaimed = reclaimWrongLocalService(service);
    if(reclaimed.length) await new Promise(resolve => setTimeout(resolve, 350));
    let running = await probe(service.url, service.expect) && serviceRootOk(service);
    if(running){
      const listeners = listenerDetails(service);
      syncPidFile(service, listeners);
      results.push({
        name: service.name,
        status: 'running',
        url: service.url,
        reclaimed,
        listeners
      });
      continue;
    }
    const started = await startAndVerifyService(service);
    if(!started.running){
      results.push({
        name: service.name,
        status: 'blocked',
        pid: started.pid,
        url: service.url,
        reclaimed,
        listeners: listenerDetails(service)
      });
      continue;
    }
    results.push({
      name: service.name,
      status: 'started',
      pid: started.pid,
      url: service.url,
      reclaimed,
      listeners: listenerDetails(service)
    });
  }

  console.log(JSON.stringify({
    ok: true,
    root: ROOT,
    results
  }, null, 2));
}

main().catch(err => {
  console.error(err && err.stack ? err.stack : String(err));
  process.exit(1);
});
