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
    log: path.join(STATE_DIR, 'viewer.log'),
    pid: path.join(STATE_DIR, 'viewer.pid'),
    command: [NODE, path.join(ROOT, 'tools', 'log-viewer', 'server.js')]
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

function reclaimWrongLocalService(service){
  if(!service.port) return [];
  const stopped = [];
  for(const pid of listenerPids(service.port)){
    const cwd = listenerCwd(pid);
    if(path.resolve(cwd || '/') !== ROOT) continue;
    try {
      process.kill(pid, 'SIGTERM');
      stopped.push(pid);
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

async function startAndVerifyService(service){
  const pid = startService(service);
  await new Promise(resolve => setTimeout(resolve, 350));
  const running = await probe(service.url, service.expect);
  return { pid, running };
}

async function main(){
  const results = [];
  for(const service of SERVICES){
    let running = await probe(service.url, service.expect);
    let reclaimed = [];
    if(!running){
      reclaimed = reclaimWrongLocalService(service);
      if(reclaimed.length) await new Promise(resolve => setTimeout(resolve, 350));
      running = await probe(service.url, service.expect);
    }
    if(running){
      results.push({
        name: service.name,
        status: 'running',
        url: service.url,
        reclaimed
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
        reclaimed
      });
      continue;
    }
    results.push({
      name: service.name,
      status: 'started',
      pid: started.pid,
      url: service.url,
      reclaimed
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
